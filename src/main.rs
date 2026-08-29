use anyhow::{Context, Result};
use chrono::{DateTime, FixedOffset};
use clap::Parser;
use regex::Regex;
use serde::Serialize;
use sha2::{Digest, Sha256};
use std::{
    collections::{BTreeMap, BTreeSet},
    fs::{self, OpenOptions},
    io::{self, Read, Write},
    path::{Path, PathBuf},
    time::{SystemTime, UNIX_EPOCH},
};

/// Build a bounded, redacted, searchable HTML incident bundle locally.
#[derive(Parser, Debug)]
#[command(
    name = "log-incident-bundle",
    version,
    after_help = "Review redactions before sharing: pattern matching is not a guarantee."
)]
struct Cli {
    /// Log files to read. Omit to read standard input.
    #[arg(value_name = "FILE")]
    files: Vec<PathBuf>,
    /// Earliest RFC 3339 timestamp to include (inclusive).
    #[arg(long, value_name = "TIMESTAMP")]
    from: Option<String>,
    /// Latest RFC 3339 timestamp to include (inclusive).
    #[arg(long, value_name = "TIMESTAMP")]
    to: Option<String>,
    /// Field name used to pull matching records into the time window. Repeat it for more fields.
    #[arg(long, value_name = "FIELD")]
    correlate: Vec<String>,
    /// Extra local redaction rules, one `label=regular expression` per line.
    #[arg(long, value_name = "FILE")]
    redact_file: Option<PathBuf>,
    /// Incident question shown at the top of the artifact.
    #[arg(long, default_value = "What happened in this incident?")]
    question: String,
    /// Title shown at the top of the artifact.
    #[arg(long, default_value = "Incident log review")]
    title: String,
    /// Where to write the self-contained HTML artifact.
    #[arg(
        short,
        long,
        default_value = "incident-bundle.html",
        value_name = "FILE"
    )]
    output: PathBuf,
    /// Print a machine-readable completion record.
    #[arg(long)]
    json: bool,
    /// Build an example artifact in a temporary directory.
    #[arg(long)]
    demo: bool,
}

#[derive(Clone, Debug, Serialize)]
struct Record {
    timestamp: Option<String>,
    source: String,
    line: usize,
    text: String,
}

#[derive(Serialize)]
struct Source {
    name: String,
    sha256: String,
    lines: usize,
}

#[derive(Serialize)]
struct Bundle<'a> {
    title: &'a str,
    question: &'a str,
    generated_at: String,
    redaction_warning: &'a str,
    redaction_rules: Vec<String>,
    sources: Vec<Source>,
    records: Vec<Record>,
}

fn main() -> Result<()> {
    let cli = Cli::parse();
    if cli.demo {
        return run_demo(cli.json);
    }
    validate_output_path(&cli.output, &cli.files, cli.redact_file.as_deref())?;
    let (contents, sources) = read_sources(&cli.files)?;
    let records = parse_records(&contents);
    let rules = redaction_rules(cli.redact_file.as_deref())?;
    let bounded = bound_and_correlate(
        records,
        cli.from.as_deref(),
        cli.to.as_deref(),
        &cli.correlate,
    )?;
    let redacted = redact_selected_records(bounded, &contents, &rules);
    let labels = rules.iter().map(|rule| rule.label.clone()).collect();
    let bundle = Bundle {
        title: &cli.title,
        question: &cli.question,
        generated_at: now_text(),
        redaction_warning: "Redaction is pattern-based and not a guarantee. Review this artifact before sharing.",
        redaction_rules: labels,
        sources,
        records: redacted,
    };
    let html = render_html(&bundle)?;
    write_new_output(&cli.output, html.as_bytes())?;
    if cli.json {
        println!(
            "{}",
            serde_json::json!({"output": cli.output, "records": bundle.records.len(), "sources": bundle.sources.len()})
        );
    } else {
        println!(
            "Wrote {} with {} records from {} source(s).",
            cli.output.display(),
            bundle.records.len(),
            bundle.sources.len()
        );
    }
    Ok(())
}

fn run_demo(json: bool) -> Result<()> {
    let sample = include_str!("../examples/payment-api.log");
    let output = create_demo_directory()?.join("review.html");
    let rules = redaction_rules(None)?;
    let contents = vec![("payment-api.log".into(), sample.into())];
    let records = bound_and_correlate(
        parse_records(&contents),
        Some("2026-08-22T14:01:00Z"),
        Some("2026-08-22T14:02:00Z"),
        &["trace_id".into()],
    )?;
    let redacted = redact_selected_records(records, &contents, &rules);
    let source = Source {
        name: "payment-api.log".into(),
        sha256: hash(sample.as_bytes()),
        lines: sample.lines().count(),
    };
    let bundle = Bundle {
        title: "Checkout timeout — sample review",
        question: "Did the retry cause duplicate charges?",
        generated_at: now_text(),
        redaction_warning: "Redaction is pattern-based and not a guarantee. Review this artifact before sharing.",
        redaction_rules: rules.iter().map(|rule| rule.label.clone()).collect(),
        sources: vec![source],
        records: redacted,
    };
    write_new_output(&output, render_html(&bundle)?.as_bytes())?;
    if json {
        println!(
            "{}",
            serde_json::json!({"output": output, "records": bundle.records.len()})
        );
    } else {
        println!("Demo bundle written to {}", output.display());
    }
    Ok(())
}

fn validate_output_path(
    output: &Path,
    files: &[PathBuf],
    redact_file: Option<&Path>,
) -> Result<()> {
    let output_resolved = resolve_destination(output)?;
    let output_metadata = fs::metadata(output).ok();
    for input in files.iter().map(PathBuf::as_path).chain(redact_file) {
        let input_resolved = fs::canonicalize(input)
            .with_context(|| format!("could not resolve input {}", input.display()))?;
        let same_identity = output_metadata
            .as_ref()
            .zip(fs::metadata(input).ok().as_ref())
            .is_some_and(|(output_meta, input_meta)| same_file(output_meta, input_meta));
        anyhow::ensure!(
            output_resolved != input_resolved && !same_identity,
            "refusing to write {} because it resolves to input {}; choose a new --output path",
            output.display(),
            input.display()
        );
    }
    anyhow::ensure!(
        fs::symlink_metadata(output).is_err(),
        "refusing to overwrite existing output {}; choose a new --output path",
        output.display()
    );
    Ok(())
}

fn resolve_destination(path: &Path) -> Result<PathBuf> {
    if let Ok(resolved) = fs::canonicalize(path) {
        return Ok(resolved);
    }
    let absolute = if path.is_absolute() {
        path.to_path_buf()
    } else {
        std::env::current_dir()
            .context("could not resolve the current directory")?
            .join(path)
    };
    let parent = absolute
        .parent()
        .ok_or_else(|| anyhow::anyhow!("output path must name a file"))?;
    let name = absolute
        .file_name()
        .ok_or_else(|| anyhow::anyhow!("output path must name a file"))?;
    Ok(fs::canonicalize(parent)
        .with_context(|| format!("could not resolve output directory {}", parent.display()))?
        .join(name))
}

#[cfg(unix)]
fn same_file(left: &fs::Metadata, right: &fs::Metadata) -> bool {
    use std::os::unix::fs::MetadataExt;
    left.dev() == right.dev() && left.ino() == right.ino()
}

#[cfg(not(unix))]
fn same_file(_left: &fs::Metadata, _right: &fs::Metadata) -> bool {
    false
}

fn write_new_output(path: &Path, contents: &[u8]) -> Result<()> {
    let mut file = OpenOptions::new()
        .write(true)
        .create_new(true)
        .open(path)
        .with_context(|| {
            format!(
                "could not create {}; output files are never overwritten",
                path.display()
            )
        })?;
    file.write_all(contents)
        .with_context(|| format!("could not write {}", path.display()))?;
    file.sync_all()
        .with_context(|| format!("could not finish writing {}", path.display()))?;
    Ok(())
}

fn create_demo_directory() -> Result<PathBuf> {
    let base = std::env::temp_dir();
    for attempt in 0..128_u32 {
        let nanos = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap_or_default()
            .as_nanos();
        let directory = base.join(format!(
            "log-incident-bundle-demo-{}-{nanos:x}-{attempt:x}",
            std::process::id()
        ));
        let mut builder = fs::DirBuilder::new();
        #[cfg(unix)]
        {
            use std::os::unix::fs::DirBuilderExt;
            builder.mode(0o700);
        }
        match builder.create(&directory) {
            Ok(()) => return Ok(directory),
            Err(error) if error.kind() == io::ErrorKind::AlreadyExists => continue,
            Err(error) => {
                return Err(error).context("could not create a temporary demo directory");
            }
        }
    }
    anyhow::bail!("could not create a unique temporary demo directory")
}

type SourceContents = Vec<(String, String)>;

struct RedactionRule {
    label: String,
    expression: Regex,
    preserve_prefix: bool,
}

fn read_sources(files: &[PathBuf]) -> Result<(SourceContents, Vec<Source>)> {
    if files.is_empty() {
        let mut input = String::new();
        io::stdin()
            .read_to_string(&mut input)
            .context("could not read standard input")?;
        let source = Source {
            name: "stdin".into(),
            sha256: hash(input.as_bytes()),
            lines: input.lines().count(),
        };
        return Ok((vec![("stdin".into(), input)], vec![source]));
    }
    let mut contents = Vec::new();
    let mut sources = Vec::new();
    for file in files {
        let text = fs::read_to_string(file)
            .with_context(|| format!("could not read {}", file.display()))?;
        let name = file.display().to_string();
        sources.push(Source {
            name: name.clone(),
            sha256: hash(text.as_bytes()),
            lines: text.lines().count(),
        });
        contents.push((name, text));
    }
    Ok((contents, sources))
}

fn parse_records(contents: &[(String, String)]) -> Vec<Record> {
    let iso = Regex::new(
        r"(?i)(?:^|\s)(\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?)",
    )
    .unwrap();
    contents
        .iter()
        .flat_map(|(source, text)| {
            text.lines().enumerate().map(|(index, line)| Record {
                timestamp: iso
                    .captures(line)
                    .and_then(|captures| captures.get(1))
                    .map(|matched| matched.as_str().replace(' ', "T")),
                source: source.clone(),
                line: index + 1,
                text: line.to_string(),
            })
        })
        .collect()
}

/// Apply rules to complete sources before record text is copied into an artifact.
///
/// This keeps the original records available for time bounds and correlation while
/// allowing a PEM block to be removed even when its body spans multiple log lines.
/// Every replacement preserves its matched line endings, so a selected raw record
/// can safely use the redacted text from its original source and line number.
fn redact_selected_records(
    selected: Vec<Record>,
    contents: &SourceContents,
    rules: &[RedactionRule],
) -> Vec<Record> {
    let redacted_contents: SourceContents = contents
        .iter()
        .map(|(name, text)| (name.clone(), redact(text, rules)))
        .collect();
    let by_location: BTreeMap<(String, usize), String> = parse_records(&redacted_contents)
        .into_iter()
        .map(|record| ((record.source, record.line), record.text))
        .collect();

    selected
        .into_iter()
        .map(|mut record| {
            record.text = by_location
                .get(&(record.source.clone(), record.line))
                .cloned()
                .unwrap_or_else(|| redact(&record.text, rules));
            record
        })
        .collect()
}

fn parse_bound(value: Option<&str>, flag: &str) -> Result<Option<DateTime<FixedOffset>>> {
    value
        .map(|timestamp| {
            DateTime::parse_from_rfc3339(timestamp).with_context(|| {
                format!("{flag} must be an RFC 3339 timestamp, for example 2026-08-22T14:01:00Z")
            })
        })
        .transpose()
}

fn bound_and_correlate(
    records: Vec<Record>,
    from: Option<&str>,
    to: Option<&str>,
    fields: &[String],
) -> Result<Vec<Record>> {
    let start = parse_bound(from, "--from")?;
    let end = parse_bound(to, "--to")?;
    if let (Some(start), Some(end)) = (start, end) {
        anyhow::ensure!(start <= end, "--from must be before or equal to --to");
    }
    if start.is_none() && end.is_none() {
        return Ok(records);
    }
    let in_window = |record: &Record| {
        record
            .timestamp
            .as_deref()
            .and_then(|timestamp| DateTime::parse_from_rfc3339(timestamp).ok())
            .is_some_and(|timestamp| {
                start.is_none_or(|value| timestamp >= value)
                    && end.is_none_or(|value| timestamp <= value)
            })
    };
    let initial: Vec<usize> = records
        .iter()
        .enumerate()
        .filter_map(|(i, r)| in_window(r).then_some(i))
        .collect();
    if fields.is_empty() {
        return Ok(initial
            .into_iter()
            .map(|index| records[index].clone())
            .collect());
    }
    // Correlation values belong to the field that produced them. Pooling all
    // values permits a trace ID to match a request ID (or the reverse), which
    // can add an unrelated record to a bounded review.
    let mut values_by_field: BTreeMap<String, BTreeSet<String>> = BTreeMap::new();
    for &index in &initial {
        for field in fields {
            if let Some(value) = field_value(&records[index].text, field) {
                values_by_field
                    .entry(field.clone())
                    .or_default()
                    .insert(value);
            }
        }
    }
    if values_by_field.is_empty() {
        return Ok(initial
            .into_iter()
            .map(|index| records[index].clone())
            .collect());
    }
    let mut selected: BTreeSet<usize> = initial.into_iter().collect();
    for (index, record) in records.iter().enumerate() {
        if fields.iter().any(|field| {
            field_value(&record.text, field).is_some_and(|value| {
                values_by_field
                    .get(field)
                    .is_some_and(|values| values.contains(&value))
            })
        }) {
            selected.insert(index);
        }
    }
    Ok(selected
        .into_iter()
        .map(|index| records[index].clone())
        .collect())
}

fn field_value(line: &str, field: &str) -> Option<String> {
    let escaped = regex::escape(field);
    let pattern = format!(
        r#"(?i)(?:\"{}\"|\b{}\b)\s*(?:=|:)\s*\"?([^\s,\"}}]+)"#,
        escaped, escaped
    );
    Regex::new(&pattern)
        .ok()?
        .captures(line)?
        .get(1)
        .map(|m| m.as_str().to_string())
}

fn redaction_rules(path: Option<&std::path::Path>) -> Result<Vec<RedactionRule>> {
    let secret_field = r"[A-Z0-9_-]*(?:password|passwd|pwd|secret|api[_-]?key|access[_-]?token|refresh[_-]?token|id[_-]?token|private[_-]?key|authorization|credentials?|session|cookie|token)[A-Z0-9_-]*";
    let mut rules = vec![
        RedactionRule {
            label: "private key".into(),
            expression: Regex::new(
                r"(?is)-----BEGIN(?: [A-Z0-9]+)* PRIVATE KEY-----.*?-----END(?: [A-Z0-9]+)* PRIVATE KEY-----",
            )
            .unwrap(),
            preserve_prefix: false,
        },
        RedactionRule {
            label: "email".into(),
            expression: Regex::new(r"(?i)[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}").unwrap(),
            preserve_prefix: false,
        },
        RedactionRule {
            label: "bearer token".into(),
            expression: Regex::new(r"(?i)(bearer\s+)[^\s,;]+").unwrap(),
            preserve_prefix: true,
        },
        RedactionRule {
            label: "secret field".into(),
            expression: Regex::new(&format!(
                r#"(?i)((?:"{secret_field}"|\b{secret_field}\b)\s*[=:]\s*)(?:"[^"]*"|'[^']*'|[^\r\n]*)"#
            ))
            .unwrap(),
            preserve_prefix: true,
        },
        RedactionRule {
            label: "AWS access key ID".into(),
            expression: Regex::new(r"(?i)(?:AKIA|ASIA)[0-9A-Z]{16}").unwrap(),
            preserve_prefix: false,
        },
    ];
    if let Some(path) = path {
        for (line_no, line) in fs::read_to_string(path)?.lines().enumerate() {
            if line.trim().is_empty() || line.trim_start().starts_with('#') {
                continue;
            }
            let (label, expression) = line.split_once('=').ok_or_else(|| {
                anyhow::anyhow!(
                    "{}:{} must use label=regular expression",
                    path.display(),
                    line_no + 1
                )
            })?;
            rules.push(RedactionRule {
                label: label.trim().to_string(),
                expression: Regex::new(expression.trim()).with_context(|| {
                    format!(
                        "invalid redaction rule at {}:{}",
                        path.display(),
                        line_no + 1
                    )
                })?,
                preserve_prefix: false,
            });
        }
    }
    Ok(rules)
}

fn redact(text: &str, rules: &[RedactionRule]) -> String {
    rules.iter().fold(text.to_string(), |value, rule| {
        rule.expression
            .replace_all(&value, |captures: &regex::Captures| {
                let prefix = if rule.preserve_prefix {
                    captures
                        .get(1)
                        .map(|matched| matched.as_str())
                        .unwrap_or("")
                } else {
                    ""
                };
                let mut replacement = format!("{prefix}[REDACTED:{}]", rule.label.to_uppercase());
                // A custom rule or quoted secret value may span physical source
                // lines. Keep each original line ending so later rules cannot
                // shift redacted text onto a different provenance line.
                replacement.extend(
                    captures
                        .get(0)
                        .map(|matched| {
                            matched
                                .as_str()
                                .chars()
                                .filter(|character| matches!(character, '\r' | '\n'))
                        })
                        .into_iter()
                        .flatten(),
                );
                replacement
            })
            .into_owned()
    })
}
fn hash(bytes: &[u8]) -> String {
    format!("{:x}", Sha256::digest(bytes))
}
fn now_text() -> String {
    "Generated locally".to_string()
}

fn render_html(bundle: &Bundle<'_>) -> Result<String> {
    let data = serde_json::to_string(bundle)?.replace('<', "\\u003c");
    let nonce = &hash(data.as_bytes())[..24];
    let html = format!(
        r#"<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'nonce-{nonce}'; base-uri 'none'; form-action 'none'"><title>{}</title><style>*{{box-sizing:border-box}}body{{margin:0;background:#f6f0df;color:#17211f;font:16px Georgia,serif}}main{{max-width:1100px;margin:auto;padding:32px 20px;min-width:0}}header{{border-bottom:4px solid #17211f;padding-bottom:20px}}h1{{font-size:clamp(2rem,5vw,4rem);margin:.2em 0}}section{{min-width:0}}.stamp{{font:700 13px ui-monospace,monospace;letter-spacing:.08em;color:#b7432e}}.warning{{background:#fff1bd;border-left:6px solid #835400;padding:12px 16px}}.controls{{display:flex;gap:12px;flex-wrap:wrap;margin:24px 0}}input,button{{min-height:44px;border:2px solid #17211f;padding:8px 12px;font:inherit}}button{{background:#b7432e;color:#fff;font-weight:bold;cursor:pointer}}button:focus,input:focus{{outline:3px solid #29654c;outline-offset:3px}}table{{width:100%;border-collapse:collapse;font:13px ui-monospace,monospace;background:#132329;color:#f7f2e5}}th,td{{padding:10px;text-align:left;vertical-align:top;border-bottom:1px solid #42605e;overflow-wrap:anywhere}}th{{color:#f6d083}}.meta{{font:14px ui-monospace,monospace;overflow-wrap:anywhere}}#empty{{margin:16px 0;padding:12px 16px;background:#fff1bd;border-left:6px solid #835400}}#sources{{padding-left:24px}}#sources li{{max-width:100%;overflow-wrap:anywhere}}#sources code{{word-break:break-all}}@media(max-width:640px){{main{{padding:20px 12px}}th:nth-child(2),td:nth-child(2){{display:none}}}}</style></head><body><main><header><p class="stamp">LOCAL INCIDENT ARTIFACT · REVIEW COPY</p><h1>{}</h1><p>{}</p></header><p class="warning">{}</p><section aria-labelledby="evidence"><div class="controls"><label>Search evidence <input id="search" type="search" autofocus></label><button id="csv">Download CSV</button></div><h2 id="evidence">Evidence (<span id="count"></span> records)</h2><p id="empty" role="status" hidden></p><table><thead><tr><th>Time</th><th>Source</th><th>Line</th><th>Record</th></tr></thead><tbody id="rows"></tbody></table></section><section><h2>Provenance</h2><p class="meta">Redaction rules: {}</p><ul id="sources"></ul></section></main><script id="bundle-data" type="application/json">{data}</script><script nonce="{nonce}">const B=JSON.parse(document.querySelector('#bundle-data').textContent);const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}}[c]));const search=document.querySelector('#search'),csv=document.querySelector('#csv'),rows=document.querySelector('#rows'),count=document.querySelector('#count'),empty=document.querySelector('#empty');function show(){{const q=search.value.toLowerCase(),a=B.records.filter(r=>Object.values(r).join(' ').toLowerCase().includes(q));count.textContent=a.length;rows.innerHTML=a.map(r=>`<tr><td>${{esc(r.timestamp||'No timestamp')}}</td><td>${{esc(r.source)}}</td><td>${{r.line}}</td><td>${{esc(r.text)}}</td></tr>`).join('');empty.hidden=a.length>0;if(!a.length)empty.textContent=B.records.length?'No evidence matches this search. Clear the search to see every record.':'No records matched the selected time bounds. Widen or remove --from or --to, then generate a new review.'}}search.addEventListener('input',show);csv.addEventListener('click',()=>{{const safe=x=>{{const s=String(x??'');return /^[=+\-@\t\r]/.test(s)?"'"+s:s}},line=r=>[r.timestamp||'',r.source,r.line,r.text].map(x=>'"'+safe(x).replaceAll('"','""')+'"').join(',');const blob=new Blob([['timestamp,source,line,text',...B.records.map(line)].join('\n')],{{type:'text/csv'}});const link=document.createElement('a');link.href=URL.createObjectURL(blob);link.download='incident-records.csv';link.click();setTimeout(()=>URL.revokeObjectURL(link.href),0)}});document.querySelector('#sources').innerHTML=B.sources.map(s=>`<li><code>${{esc(s.name)}}</code> — ${{s.lines}} lines — SHA-256 <code>${{s.sha256}}</code></li>`).join('');show();</script></body></html>"#,
        html_escape(bundle.title),
        html_escape(bundle.title),
        html_escape(bundle.question),
        html_escape(bundle.redaction_warning),
        html_escape(&bundle.redaction_rules.join(", "))
    );
    Ok(add_review_skip_link(html))
}

fn add_review_skip_link(html: String) -> String {
    let without_autofocus = html.replacen(" autofocus>", ">", 1);
    let with_skip_style = without_autofocus.replacen(
        "<style>",
        "<style>.skip{position:absolute;left:10px;top:-56px;display:inline-flex;min-height:44px;align-items:center;padding:8px;background:#17211f;color:#fff;font-weight:bold;z-index:1}.skip:focus{top:10px;outline:3px solid #29654c;outline-offset:3px}",
        1,
    );
    with_skip_style.replacen(
        "<body><main>",
        "<body><a class=\"skip\" href=\"#main\">Skip to review</a><main id=\"main\" tabindex=\"-1\">",
        1,
    )
}

fn html_escape(text: &str) -> String {
    text.replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
        .replace('"', "&quot;")
        .replace('\'', "&#39;")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn redacts_default_secrets() {
        let rules = redaction_rules(None).unwrap();
        let input = "email=dev@example.com authorization=Bearer short123 token=\"two word secret\" password=\"correct horse battery staple\" api_key=abc access_token=xy client_secret=clientSecretValue refresh_token=refreshTokenValue id_token=idTokenValue private_key=privateKeyValue authorization=\"Basic basicCredentialValue\" session=sessionValue cookie=cookieValue oauth_client_secret=oauthSecretValue password_hash=passwordHashValue \"apiKey\":\"json-key-value\" \"password\":\"json-password-value\" \"access_token\":\"json-token-value\" \"refreshToken\":\"jsonRefreshValue\" permanent=AKIA1234567890ABCDEF temporary=ASIA1234567890ABCDEF";
        let output = redact(input, &rules);
        for secret in [
            "dev@example.com",
            "short123",
            "two word secret",
            "correct horse battery staple",
            "abc",
            "xy",
            "clientSecretValue",
            "refreshTokenValue",
            "idTokenValue",
            "privateKeyValue",
            "basicCredentialValue",
            "sessionValue",
            "cookieValue",
            "oauthSecretValue",
            "passwordHashValue",
            "json-key-value",
            "json-password-value",
            "json-token-value",
            "jsonRefreshValue",
            "AKIA1234567890ABCDEF",
            "ASIA1234567890ABCDEF",
        ] {
            assert!(!output.contains(secret), "{secret} was not redacted");
        }
    }

    #[test]
    fn custom_capture_groups_do_not_preserve_a_secret() {
        let rules = vec![RedactionRule {
            label: "customer id".into(),
            expression: Regex::new(r"customer_id=([A-Za-z0-9_-]+)").unwrap(),
            preserve_prefix: false,
        }];
        let output = redact("customer_id=cust_private_73", &rules);
        assert!(!output.contains("cust_private_73"));
        assert_eq!(output, "[REDACTED:CUSTOMER ID]");
    }

    #[test]
    fn redacts_complete_header_values_and_multiline_private_keys() {
        let rules = redaction_rules(None).unwrap();
        let source = "2026-08-22T14:01:01Z Authorization: Basic ZmFjdG9yeXVzZXI6U3VwZXJTZWNyZXQ=\n2026-08-22T14:01:02Z Cookie: session=cookie_secret_one; csrf=cookie_secret_two\n2026-08-22T14:01:03Z private_key=-----BEGIN PRIVATE KEY-----\nMIIE_private_key_body_should_not_survive\n-----END PRIVATE KEY-----\n2026-08-22T14:01:04Z credentials=credential_password_should_not_survive\n";
        let output = redact(source, &rules);

        for secret in [
            "ZmFjdG9yeXVzZXI6U3VwZXJTZWNyZXQ=",
            "cookie_secret_one",
            "cookie_secret_two",
            "MIIE_private_key_body_should_not_survive",
            "credential_password_should_not_survive",
        ] {
            assert!(!output.contains(secret), "{secret} was not redacted");
        }
        assert_eq!(source.lines().count(), output.lines().count());
        assert!(output.contains("Authorization: [REDACTED:SECRET FIELD]"));
        assert!(output.contains("Cookie: [REDACTED:SECRET FIELD]"));
        assert!(output.contains("private_key=[REDACTED:SECRET FIELD]"));
        assert!(output.contains("credentials=[REDACTED:SECRET FIELD]"));
    }

    #[test]
    fn quoted_multiline_private_key_keeps_every_record_on_its_source_line() {
        let rules = redaction_rules(None).unwrap();
        let source = concat!(
            "2026-08-22T14:01:00Z trace_id=repro event=before\n",
            "2026-08-22T14:01:01Z trace_id=repro private_key=\"-----BEGIN PRIVATE KEY-----\n",
            "SENSITIVE_PRIVATE_KEY_BODY\n",
            "-----END PRIVATE KEY-----\" event=key_loaded\n",
            "2026-08-22T14:01:02Z trace_id=repro event=after\n",
        );
        let contents = vec![("quoted-pem.log".into(), source.into())];
        let records = redact_selected_records(parse_records(&contents), &contents, &rules);

        assert_eq!(
            records
                .iter()
                .map(|record| (
                    record.line,
                    record.timestamp.as_deref(),
                    record.text.as_str()
                ))
                .collect::<Vec<_>>(),
            vec![
                (
                    1,
                    Some("2026-08-22T14:01:00Z"),
                    "2026-08-22T14:01:00Z trace_id=repro event=before"
                ),
                (
                    2,
                    Some("2026-08-22T14:01:01Z"),
                    "2026-08-22T14:01:01Z trace_id=repro private_key=[REDACTED:SECRET FIELD]"
                ),
                (3, None, ""),
                (4, None, " event=key_loaded"),
                (
                    5,
                    Some("2026-08-22T14:01:02Z"),
                    "2026-08-22T14:01:02Z trace_id=repro event=after"
                ),
            ]
        );
        let redacted = redact(source, &rules);
        assert_eq!(source.lines().count(), redacted.lines().count());
        for removed in ["SENSITIVE_PRIVATE_KEY_BODY", "-----END PRIVATE KEY-----"] {
            assert!(!redacted.contains(removed), "{removed} was not redacted");
        }
    }

    #[test]
    fn bounds_and_correlates_trace() {
        let records = parse_records(&[("x".into(), "2026-01-01T10:00:00Z trace_id=a start\n2026-01-01T11:00:00Z trace_id=b stop\n2026-01-01T12:00:00Z trace_id=a retry".into())]);
        let result = bound_and_correlate(
            records,
            Some("2026-01-01T09:59:00Z"),
            Some("2026-01-01T10:01:00Z"),
            &["trace_id".into()],
        )
        .unwrap();
        assert_eq!(result.len(), 2);
    }

    #[test]
    fn correlation_values_do_not_cross_match_between_fields() {
        let records = parse_records(&[(
            "x".into(),
            concat!(
                "2026-08-22T14:01:00Z trace_id=trace-A request_id=req-B event=in-window\n",
                "2026-08-22T14:05:00Z trace_id=req-B request_id=req-X event=wrong-cross-field-match\n",
                "2026-08-22T14:06:00Z trace_id=trace-A request_id=req-Y event=correct-trace-match\n",
                "2026-08-22T14:07:00Z trace_id=trace-Z request_id=req-B event=correct-request-match",
            )
            .into(),
        )]);
        let result = bound_and_correlate(
            records,
            Some("2026-08-22T14:01:00Z"),
            Some("2026-08-22T14:01:00Z"),
            &["trace_id".into(), "request_id".into()],
        )
        .unwrap();

        assert_eq!(result.len(), 3);
        assert!(
            result
                .iter()
                .all(|record| !record.text.contains("wrong-cross-field-match"))
        );
        assert!(
            result
                .iter()
                .any(|record| record.text.contains("correct-trace-match"))
        );
        assert!(
            result
                .iter()
                .any(|record| record.text.contains("correct-request-match"))
        );
    }

    #[test]
    fn rejects_invalid_and_inverted_time_bounds() {
        let records = Vec::new();
        assert!(bound_and_correlate(records.clone(), Some("not-a-timestamp"), None, &[]).is_err());
        assert!(
            bound_and_correlate(
                records,
                Some("2026-01-01T11:00:00Z"),
                Some("2026-01-01T10:00:00Z"),
                &[]
            )
            .is_err()
        );
    }

    #[test]
    fn output_uses_safe_json_script_data() {
        let bundle = Bundle {
            title: "</script><script>window.pwned=1</script>",
            question: "x",
            generated_at: now_text(),
            redaction_warning: "z",
            redaction_rules: vec![],
            sources: vec![],
            records: vec![],
        };
        let html = render_html(&bundle).unwrap();
        assert!(!html.contains("</script><script>window.pwned"));
        assert!(html.contains("\\u003c/script>"));
        assert!(html.contains("Content-Security-Policy"));
    }
}
