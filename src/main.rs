use anyhow::{Context, Result};
use chrono::{DateTime, FixedOffset};
use clap::Parser;
use regex::Regex;
use serde::Serialize;
use sha2::{Digest, Sha256};
use std::{
    collections::BTreeSet,
    fs,
    io::{self, Read},
    path::PathBuf,
};

/// Build a bounded, redacted, searchable HTML incident bundle locally.
#[derive(Parser, Debug)]
#[command(
    name = "log-incident-bundle",
    version,
    after_help = "No data is uploaded. Review redactions before sharing: they are not a guarantee."
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
    let (contents, sources) = read_sources(&cli.files)?;
    let records = parse_records(&contents);
    let rules = redaction_rules(cli.redact_file.as_deref())?;
    let bounded = bound_and_correlate(
        records,
        cli.from.as_deref(),
        cli.to.as_deref(),
        &cli.correlate,
    )?;
    let redacted: Vec<Record> = bounded
        .into_iter()
        .map(|mut record| {
            record.text = redact(&record.text, &rules);
            record
        })
        .collect();
    let labels = rules.iter().map(|(label, _)| label.clone()).collect();
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
    fs::write(&cli.output, html)
        .with_context(|| format!("could not write {}", cli.output.display()))?;
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
    let output = std::env::temp_dir().join("log-incident-bundle-demo.html");
    let rules = redaction_rules(None)?;
    let records = bound_and_correlate(
        parse_records(&[("payment-api.log".into(), sample.into())]),
        Some("2026-08-22T14:01:00Z"),
        Some("2026-08-22T14:02:00Z"),
        &["trace_id".into()],
    )?;
    let redacted = records
        .into_iter()
        .map(|mut record| {
            record.text = redact(&record.text, &rules);
            record
        })
        .collect();
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
        redaction_rules: rules.iter().map(|rule| rule.0.clone()).collect(),
        sources: vec![source],
        records: redacted,
    };
    fs::write(&output, render_html(&bundle)?)?;
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

type SourceContents = Vec<(String, String)>;

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
    let mut values = BTreeSet::new();
    for &index in &initial {
        for field in fields {
            if let Some(value) = field_value(&records[index].text, field) {
                values.insert(value);
            }
        }
    }
    if values.is_empty() {
        return Ok(initial
            .into_iter()
            .map(|index| records[index].clone())
            .collect());
    }
    let mut selected: BTreeSet<usize> = initial.into_iter().collect();
    for (index, record) in records.iter().enumerate() {
        if fields.iter().any(|field| {
            field_value(&record.text, field).is_some_and(|value| values.contains(&value))
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

fn redaction_rules(path: Option<&std::path::Path>) -> Result<Vec<(String, Regex)>> {
    let secret_field = r"(?:password|passwd|secret|api[_-]?key|access[_-]?token)";
    let mut rules = vec![
        (
            "email".into(),
            Regex::new(r"(?i)[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}").unwrap(),
        ),
        (
            "bearer token".into(),
            Regex::new(r"(?i)(bearer\s+)[A-Za-z0-9._~+/=-]{12,}").unwrap(),
        ),
        (
            "secret field".into(),
            Regex::new(&format!(
                r#"(?i)((?:"{secret_field}"|\b{secret_field}\b)\s*[=:]\s*["']?)[^\s,"'}}]+"#
            ))
            .unwrap(),
        ),
        (
            "private key".into(),
            Regex::new(r"(?i)AKIA[0-9A-Z]{16}").unwrap(),
        ),
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
            rules.push((
                label.trim().to_string(),
                Regex::new(expression.trim()).with_context(|| {
                    format!(
                        "invalid redaction rule at {}:{}",
                        path.display(),
                        line_no + 1
                    )
                })?,
            ));
        }
    }
    Ok(rules)
}

fn redact(text: &str, rules: &[(String, Regex)]) -> String {
    rules.iter().fold(text.to_string(), |value, (label, rule)| {
        rule.replace_all(&value, |captures: &regex::Captures| {
            let prefix = captures
                .get(1)
                .map(|matched| matched.as_str())
                .unwrap_or("");
            format!("{prefix}[REDACTED:{}]", label.to_uppercase())
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
    Ok(format!(
        r#"<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'nonce-{nonce}'; base-uri 'none'; form-action 'none'"><title>{}</title><style>body{{margin:0;background:#f6f0df;color:#17211f;font:16px Georgia,serif}}main{{max-width:1100px;margin:auto;padding:32px 20px}}header{{border-bottom:4px solid #17211f;padding-bottom:20px}}h1{{font-size:clamp(2rem,5vw,4rem);margin:.2em 0}}.stamp{{font:700 13px ui-monospace,monospace;letter-spacing:.08em;color:#b7432e}}.warning{{background:#fff1bd;border-left:6px solid #835400;padding:12px 16px}}.controls{{display:flex;gap:12px;flex-wrap:wrap;margin:24px 0}}input,button{{min-height:44px;border:2px solid #17211f;padding:8px 12px;font:inherit}}button{{background:#b7432e;color:#fff;font-weight:bold;cursor:pointer}}button:focus,input:focus{{outline:3px solid #29654c;outline-offset:3px}}table{{width:100%;border-collapse:collapse;font:13px ui-monospace,monospace;background:#132329;color:#f7f2e5}}th,td{{padding:10px;text-align:left;vertical-align:top;border-bottom:1px solid #42605e}}th{{color:#f6d083}}.meta{{font:14px ui-monospace,monospace;word-break:break-all}}@media(max-width:640px){{main{{padding:20px 12px}}th:nth-child(2),td:nth-child(2){{display:none}}}}</style></head><body><main><header><p class="stamp">LOCAL INCIDENT ARTIFACT · REVIEW COPY</p><h1>{}</h1><p>{}</p></header><p class="warning">{}</p><section aria-labelledby="evidence"><div class="controls"><label>Search evidence <input id="search" type="search" autofocus></label><button id="csv">Download CSV</button></div><h2 id="evidence">Evidence (<span id="count"></span> records)</h2><table><thead><tr><th>Time</th><th>Source</th><th>Line</th><th>Record</th></tr></thead><tbody id="rows"></tbody></table></section><section><h2>Provenance</h2><p class="meta">Redaction rules: {}</p><ul id="sources"></ul></section></main><script id="bundle-data" type="application/json">{data}</script><script nonce="{nonce}">const B=JSON.parse(document.querySelector('#bundle-data').textContent);const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}}[c]));const search=document.querySelector('#search'),csv=document.querySelector('#csv'),rows=document.querySelector('#rows'),count=document.querySelector('#count');function show(){{const q=search.value.toLowerCase(),a=B.records.filter(r=>Object.values(r).join(' ').toLowerCase().includes(q));count.textContent=a.length;rows.innerHTML=a.map(r=>`<tr><td>${{esc(r.timestamp||'No timestamp')}}</td><td>${{esc(r.source)}}</td><td>${{r.line}}</td><td>${{esc(r.text)}}</td></tr>`).join('')}}search.addEventListener('input',show);csv.addEventListener('click',()=>{{const line=r=>[r.timestamp||'',r.source,r.line,r.text].map(x=>'"'+String(x).replaceAll('"','""')+'"').join(',');const blob=new Blob([['timestamp,source,line,text',...B.records.map(line)].join('\n')],{{type:'text/csv'}});const link=document.createElement('a');link.href=URL.createObjectURL(blob);link.download='incident-records.csv';link.click();setTimeout(()=>URL.revokeObjectURL(link.href),0)}});document.querySelector('#sources').innerHTML=B.sources.map(s=>`<li><code>${{esc(s.name)}}</code> — ${{s.lines}} lines — SHA-256 <code>${{s.sha256}}</code></li>`).join('');show();</script></body></html>"#,
        html_escape(bundle.title),
        html_escape(bundle.title),
        html_escape(bundle.question),
        html_escape(bundle.redaction_warning),
        html_escape(&bundle.redaction_rules.join(", "))
    ))
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
        let input = "email=dev@example.com authorization=Bearer abcdefghijklmnop secret=shh \"apiKey\":\"json-key-value\" \"password\":\"json-password-value\" \"access_token\":\"json-token-value\" key=AKIA1234567890ABCDEF";
        let output = redact(input, &rules);
        for secret in [
            "dev@example.com",
            "abcdefghijklmnop",
            "secret=shh",
            "json-key-value",
            "json-password-value",
            "json-token-value",
            "AKIA1234567890ABCDEF",
        ] {
            assert!(!output.contains(secret), "{secret} was not redacted");
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
