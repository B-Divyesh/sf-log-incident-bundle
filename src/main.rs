use anyhow::{Context, Result};
use clap::Parser;
use regex::Regex;
use serde::Serialize;
use sha2::{Digest, Sha256};
use std::{collections::BTreeSet, fs, io::{self, Read}, path::PathBuf};

/// Build a bounded, redacted, searchable HTML incident bundle locally.
#[derive(Parser, Debug)]
#[command(name = "log-incident-bundle", version, after_help = "No data is uploaded. Review redactions before sharing: they are not a guarantee.")]
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
    #[arg(short, long, default_value = "incident-bundle.html", value_name = "FILE")]
    output: PathBuf,
    /// Print a machine-readable completion record.
    #[arg(long)]
    json: bool,
    /// Build an example artifact in a temporary directory.
    #[arg(long)]
    demo: bool,
}

#[derive(Clone, Debug, Serialize)]
struct Record { timestamp: Option<String>, source: String, line: usize, text: String }

#[derive(Serialize)]
struct Source { name: String, sha256: String, lines: usize }

#[derive(Serialize)]
struct Bundle<'a> {
    title: &'a str, question: &'a str, generated_at: String,
    redaction_warning: &'a str, redaction_rules: Vec<String>,
    sources: Vec<Source>, records: Vec<Record>,
}

fn main() -> Result<()> {
    let cli = Cli::parse();
    if cli.demo { return run_demo(cli.json); }
    let (contents, sources) = read_sources(&cli.files)?;
    let records = parse_records(&contents);
    let rules = redaction_rules(cli.redact_file.as_deref())?;
    let bounded = bound_and_correlate(records, cli.from.as_deref(), cli.to.as_deref(), &cli.correlate)?;
    let redacted: Vec<Record> = bounded.into_iter().map(|mut record| { record.text = redact(&record.text, &rules); record }).collect();
    let labels = rules.iter().map(|(label, _)| label.clone()).collect();
    let bundle = Bundle { title: &cli.title, question: &cli.question, generated_at: now_text(), redaction_warning: "Redaction is pattern-based and not a guarantee. Review this artifact before sharing.", redaction_rules: labels, sources, records: redacted };
    let html = render_html(&bundle)?;
    fs::write(&cli.output, html).with_context(|| format!("could not write {}", cli.output.display()))?;
    if cli.json { println!("{}", serde_json::json!({"output": cli.output, "records": bundle.records.len(), "sources": bundle.sources.len()})); }
    else { println!("Wrote {} with {} records from {} source(s).", cli.output.display(), bundle.records.len(), bundle.sources.len()); }
    Ok(())
}

fn run_demo(json: bool) -> Result<()> {
    let sample = include_str!("../examples/payment-api.log");
    let output = std::env::temp_dir().join("log-incident-bundle-demo.html");
    let rules = redaction_rules(None)?;
    let records = parse_records(&[("payment-api.log".into(), sample.into())]);
    let redacted = records.into_iter().map(|mut r| { r.text = redact(&r.text, &rules); r }).collect();
    let source = Source { name: "payment-api.log".into(), sha256: hash(sample.as_bytes()), lines: sample.lines().count() };
    let bundle = Bundle { title: "Checkout timeout — sample review", question: "Did the retry cause duplicate charges?", generated_at: now_text(), redaction_warning: "Redaction is pattern-based and not a guarantee. Review this artifact before sharing.", redaction_rules: rules.iter().map(|r| r.0.clone()).collect(), sources: vec![source], records: redacted };
    fs::write(&output, render_html(&bundle)?)?;
    if json { println!("{}", serde_json::json!({"output": output, "records": bundle.records.len()})); }
    else { println!("Demo bundle written to {}", output.display()); }
    Ok(())
}

fn read_sources(files: &[PathBuf]) -> Result<(Vec<(String, String)>, Vec<Source>)> {
    if files.is_empty() {
        let mut input = String::new(); io::stdin().read_to_string(&mut input).context("could not read standard input")?;
        let source = Source { name: "stdin".into(), sha256: hash(input.as_bytes()), lines: input.lines().count() };
        return Ok((vec![("stdin".into(), input)], vec![source]));
    }
    let mut contents = Vec::new(); let mut sources = Vec::new();
    for file in files {
        let text = fs::read_to_string(file).with_context(|| format!("could not read {}", file.display()))?;
        let name = file.display().to_string();
        sources.push(Source { name: name.clone(), sha256: hash(text.as_bytes()), lines: text.lines().count() });
        contents.push((name, text));
    }
    Ok((contents, sources))
}

fn parse_records(contents: &[(String, String)]) -> Vec<Record> {
    let iso = Regex::new(r"(?i)(?:^|\s)(\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?)").unwrap();
    contents.iter().flat_map(|(source, text)| text.lines().enumerate().map(|(index, line)| Record { timestamp: iso.captures(line).and_then(|c| c.get(1)).map(|m| m.as_str().replace(' ', "T")), source: source.clone(), line: index + 1, text: line.to_string() })).collect()
}

fn bound_and_correlate(records: Vec<Record>, from: Option<&str>, to: Option<&str>, fields: &[String]) -> Result<Vec<Record>> {
    if from.is_none() && to.is_none() { return Ok(records); }
    let in_window = |r: &Record| match &r.timestamp { Some(ts) => from.is_none_or(|start| ts.as_str() >= start) && to.is_none_or(|end| ts.as_str() <= end), None => false };
    let initial: Vec<usize> = records.iter().enumerate().filter_map(|(i, r)| in_window(r).then_some(i)).collect();
    if fields.is_empty() { return Ok(initial.into_iter().map(|i| records[i].clone()).collect()); }
    let mut values = BTreeSet::new();
    for &index in &initial { for field in fields { if let Some(value) = field_value(&records[index].text, field) { values.insert(value); } } }
    if values.is_empty() { return Ok(initial.into_iter().map(|i| records[i].clone()).collect()); }
    let mut selected: BTreeSet<usize> = initial.into_iter().collect();
    for (index, record) in records.iter().enumerate() { if fields.iter().any(|field| field_value(&record.text, field).is_some_and(|value| values.contains(&value))) { selected.insert(index); } }
    Ok(selected.into_iter().map(|i| records[i].clone()).collect())
}

fn field_value(line: &str, field: &str) -> Option<String> {
    let escaped = regex::escape(field);
    let pattern = format!(r#"(?i)(?:\"{}\"|\b{}\b)\s*(?:=|:)\s*\"?([^\s,\"}}]+)"#, escaped, escaped);
    Regex::new(&pattern).ok()?.captures(line)?.get(1).map(|m| m.as_str().to_string())
}

fn redaction_rules(path: Option<&std::path::Path>) -> Result<Vec<(String, Regex)>> {
    let mut rules = vec![
        ("email".into(), Regex::new(r"(?i)[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}").unwrap()),
        ("bearer token".into(), Regex::new(r"(?i)(bearer\s+)[A-Za-z0-9._~+/=-]{12,}").unwrap()),
        ("secret field".into(), Regex::new(r#"(?i)((?:password|passwd|secret|api[_-]?key|access[_-]?token)\s*[=:]\s*[\"']?)[^\s,\"']+"#).unwrap()),
        ("private key".into(), Regex::new(r"(?i)AKIA[0-9A-Z]{16}").unwrap()),
    ];
    if let Some(path) = path { for (line_no, line) in fs::read_to_string(path)?.lines().enumerate() { if line.trim().is_empty() || line.trim_start().starts_with('#') { continue; } let (label, expression) = line.split_once('=').ok_or_else(|| anyhow::anyhow!("{}:{} must use label=regular expression", path.display(), line_no + 1))?; rules.push((label.trim().to_string(), Regex::new(expression.trim()).with_context(|| format!("invalid redaction rule at {}:{}", path.display(), line_no + 1))?)); } }
    Ok(rules)
}

fn redact(text: &str, rules: &[(String, Regex)]) -> String { rules.iter().fold(text.to_string(), |value, (label, rule)| rule.replace_all(&value, |caps: &regex::Captures| { let prefix = caps.get(1).map(|m| m.as_str()).unwrap_or(""); format!("{}[REDACTED:{}]", prefix, label.to_uppercase()) }).into_owned()) }
fn hash(bytes: &[u8]) -> String { format!("{:x}", Sha256::digest(bytes)) }
fn now_text() -> String { "Generated locally".to_string() }

fn render_html(bundle: &Bundle<'_>) -> Result<String> {
    let data = serde_json::to_string(bundle)?;
    Ok(format!(r#"<!doctype html><html lang=\"en\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><title>{}</title><style>body{{margin:0;background:#f6f0df;color:#17211f;font:16px Georgia,serif}}main{{max-width:1100px;margin:auto;padding:32px 20px}}header{{border-bottom:4px solid #17211f;padding-bottom:20px}}h1{{font-size:clamp(2rem,5vw,4rem);margin:.2em 0}}.stamp{{font:700 13px ui-monospace,monospace;letter-spacing:.08em;color:#b7432e}}.warning{{background:#fff1bd;border-left:6px solid #835400;padding:12px 16px}}.controls{{display:flex;gap:12px;flex-wrap:wrap;margin:24px 0}}input,button{{min-height:44px;border:2px solid #17211f;padding:8px 12px;font:inherit}}button{{background:#b7432e;color:#fff;font-weight:bold;cursor:pointer}}button:focus,input:focus{{outline:3px solid #29654c;outline-offset:3px}}table{{width:100%;border-collapse:collapse;font:13px ui-monospace,monospace;background:#132329;color:#f7f2e5}}th,td{{padding:10px;text-align:left;vertical-align:top;border-bottom:1px solid #42605e}}th{{color:#f6d083}}.meta{{font:14px ui-monospace,monospace;word-break:break-all}}@media(max-width:640px){{main{{padding:20px 12px}}th:nth-child(2),td:nth-child(2){{display:none}}}}</style></head><body><main><header><p class=\"stamp\">LOCAL INCIDENT ARTIFACT · REVIEW COPY</p><h1>{}</h1><p>{}</p></header><p class=\"warning\">{}</p><section aria-labelledby=\"evidence\"><div class=\"controls\"><label>Search evidence <input id=\"search\" type=\"search\" autofocus></label><button id=\"csv\">Download CSV</button></div><h2 id=\"evidence\">Evidence (<span id=\"count\"></span> records)</h2><table><thead><tr><th>Time</th><th>Source</th><th>Line</th><th>Record</th></tr></thead><tbody id=\"rows\"></tbody></table></section><section><h2>Provenance</h2><p class=\"meta\">Redaction rules: {}</p><ul id=\"sources\"></ul></section></main><script>const B={};const esc=s=>String(s??'').replace(/[&<>\"']/g,c=>({{'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}}[c]));const rows=document.querySelector('#rows'),count=document.querySelector('#count');function show(){{let q=search.value.toLowerCase(),a=B.records.filter(r=>Object.values(r).join(' ').toLowerCase().includes(q));count.textContent=a.length;rows.innerHTML=a.map(r=>`<tr><td>${{esc(r.timestamp||'No timestamp')}}</td><td>${{esc(r.source)}}</td><td>${{r.line}}</td><td>${{esc(r.text)}}</td></tr>`).join('')}}search.oninput=show;csv.onclick=()=>{{let line=r=>[r.timestamp||'',r.source,r.line,r.text].map(x=>'\"'+String(x).replaceAll('\"','\"\"')+'\"').join(',');let blob=new Blob([['timestamp,source,line,text',...B.records.map(line)].join('\n')],{{type:'text/csv'}});let a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='incident-records.csv';a.click();URL.revokeObjectURL(a.href)}};document.querySelector('#sources').innerHTML=B.sources.map(s=>`<li><code>${{esc(s.name)}}</code> — ${{s.lines}} lines — SHA-256 <code>${{s.sha256}}</code></li>`).join('');show();</script></body></html>"#, html_escape(bundle.title), html_escape(bundle.title), html_escape(bundle.question), html_escape(bundle.redaction_warning), html_escape(&bundle.redaction_rules.join(", ")), data))
}
fn html_escape(text: &str) -> String { text.replace('&', "&amp;").replace('<', "&lt;").replace('>', "&gt;").replace('"', "&quot;") }

#[cfg(test)] mod tests { use super::*;
    #[test] fn redacts_default_secrets() { let rules = redaction_rules(None).unwrap(); let output = redact("email=dev@example.com authorization=Bearer abcdefghijklmnop secret=shh", &rules); assert!(!output.contains("dev@example.com")); assert!(!output.contains("abcdefghijklmnop")); assert!(!output.contains("secret=shh")); }
    #[test] fn bounds_and_correlates_trace() { let records = parse_records(&[("x".into(), "2026-01-01T10:00:00Z trace_id=a start\n2026-01-01T11:00:00Z trace_id=b stop\n2026-01-01T12:00:00Z trace_id=a retry".into())]); let result = bound_and_correlate(records, Some("2026-01-01T09:59:00Z"), Some("2026-01-01T10:01:00Z"), &["trace_id".into()]).unwrap(); assert_eq!(result.len(), 2); }
    #[test] fn output_contains_self_contained_search() { let bundle = Bundle { title:"x",question:"y",generated_at:now_text(),redaction_warning:"z",redaction_rules:vec![],sources:vec![],records:vec![] }; assert!(render_html(&bundle).unwrap().contains("Download CSV")); }
}
