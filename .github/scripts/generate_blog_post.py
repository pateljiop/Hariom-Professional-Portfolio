import json, os, re, html
from datetime import datetime, timezone
from pathlib import Path
from urllib.request import Request, urlopen
from xml.etree import ElementTree as ET

ROOT = Path(__file__).resolve().parents[2]
BLOG = ROOT / "blog"
SITEMAP = ROOT / "sitemap.xml"
API_KEY = os.environ["GEMINI_API_KEY"]
MODEL = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash-lite")

now = datetime.now(timezone.utc)
date = now.strftime("%Y-%m-%d")
slot = "morning" if now.hour < 12 else "evening"

def fetch(url, headers=None):
    req = Request(url, headers=headers or {"User-Agent": "Hariom-Developer-Blog/1.0"})
    with urlopen(req, timeout=30) as r:
        return r.read()

def trends():
    # Google Trends' public India RSS is used only as a topic-discovery signal.
    try:
        raw = fetch("https://trends.google.com/trending/rss?geo=IN")
        root = ET.fromstring(raw)
        topics = []
        for item in root.findall(".//item"):
            title = item.findtext("title")
            traffic = item.findtext("{https://trends.google.com/trending/rss}approx_traffic")
            if title:
                topics.append({"query": title.strip(), "traffic": traffic or ""})
        return topics[:30]
    except Exception as exc:
        print(f"Trend feed unavailable: {exc}")
        return []

topics = trends()
if not topics:
    print("No trend data available; skipping rather than inventing demand.")
    raise SystemExit(0)

trend_context = json.dumps(topics, ensure_ascii=False, indent=2)
prompt = f"""
You are the editorial assistant for Hariom Patel's personal developer blog.
Today is {date}. Publishing slot: {slot}.

Choose ONE topic from the supplied Google Trends India discovery list that has strong potential
for a useful programming, AI, Python, web-development, automation, API, developer-tool, or
software-engineering article. Ignore celebrity, politics, sports, finance, entertainment,
shopping, medical, and unrelated viral topics.

Do NOT claim an exact search volume unless the source provides it. Treat trend traffic as a signal,
not proof of ranking.

The primary article must sound like Hariom Patel personally wrote it in NATURAL HINGLISH:
casual Indian developer language, conversational, practical, clear, and slightly informal.
Use normal English technical terms where developers naturally use them. Do NOT write forced
Hindi translations of technical terms. Avoid corporate/AI tone, fake enthusiasm, repetitive
"today we will explore" intros, and generic SEO filler.

Then create two faithful localized versions:
1. "en": natural Indian-English developer writing.
2. "hi": natural Hindi with common English technical terms left in English.
The three versions must communicate the same verified facts, not three unrelated articles.

Author is ALWAYS Hariom Patel. Never invent his personal experience, credentials, benchmarks,
projects, quotes, test results, or claims. If a statement is current or factual, keep it general
unless it is directly supported by the supplied trend/topic or by stable technical knowledge.

Return JSON only:
{{
  "publish": true,
  "topic": "...",
  "title": "...",
  "description": "...",
  "slug": "...",
  "sources": ["https://..."],
  "versions": {{
    "hinglish": {{
      "title":"...",
      "description":"...",
      "sections":[{{"heading":"...","paragraphs":["...","..."],"code":"optional short code"}}]
    }},
    "en": {{
      "title":"...",
      "description":"...",
      "sections":[{{"heading":"...","paragraphs":["...","..."],"code":"optional short code"}}]
    }},
    "hi": {{
      "title":"...",
      "description":"...",
      "sections":[{{"heading":"...","paragraphs":["...","..."],"code":"optional short code"}}]
    }}
  }}
}}

Google Trends India topics:
{trend_context}
"""

payload = {
    "contents": [{"parts": [{"text": prompt}]}],
    "generationConfig": {
        "temperature": 0.45,
        "responseMimeType": "application/json",
        "maxOutputTokens": 5000
    }
}
req = Request(
    f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent",
    data=json.dumps(payload).encode(),
    headers={"Content-Type": "application/json", "x-goog-api-key": API_KEY},
)
with urlopen(req, timeout=90) as r:
    result = json.load(r)

data = json.loads(result["candidates"][0]["content"]["parts"][0]["text"])
if not data.get("publish"):
    print("No suitable developer topic selected.")
    raise SystemExit(0)

slug = re.sub(r"[^a-z0-9-]+", "-", data["slug"].lower()).strip("-")[:70]
if not slug:
    raise ValueError("Invalid generated slug")

def esc(value):
    return html.escape(str(value), quote=True)

def render_sections(sections):
    out = []
    for section in sections:
        heading = esc(section.get("heading", ""))
        body = "".join(f"<p>{esc(p)}</p>" for p in section.get("paragraphs", []))
        code = section.get("code")
        if code:
            body += f"<pre><code>{esc(code)}</code></pre>"
        out.append(f"<section><h2>{heading}</h2>{body}</section>")
    return "".join(out)

base = "https://pateljiop.github.io/Hariom-Professional-Portfolio/blog"
# Retention rule: published posts are append-only. This job never deletes, overwrites,
# or rotates older articles; every successful publication gets permanent language-specific URLs.
versions = {
    "hinglish": ("hi-Latn", "hinglish"),
    "en": ("en", "english"),
    "hi": ("hi", "hindi"),
}

# Create one localized page per language so search engines can choose the appropriate language.
for key, (lang, label) in versions.items():
    version = data["versions"][key]
    filename = f"{date}-{slot}-{slug}-{key}.html"
    path = BLOG / filename
    if path.exists():
        print(f"Already exists (preserving existing article): {filename}")
        continue

    canonical = f"{base}/{filename}"
    alternates = []
    for other, (other_lang, _) in versions.items():
        other_file = f"{date}-{slot}-{slug}-{other}.html"
        alternates.append(f'<link rel="alternate" hreflang="{other_lang}" href="{base}/{other_file}">')
    alternates.append(f'<link rel="alternate" hreflang="x-default" href="{base}/{date}-{slot}-{slug}-hinglish.html">')

    schema = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": version["title"],
        "description": version["description"],
        "datePublished": date,
        "dateModified": date,
        "inLanguage": lang,
        "author": {
            "@type": "Person",
            "name": "Hariom Patel",
            "url": "https://pateljiop.github.io/Hariom-Professional-Portfolio/"
        },
        "mainEntityOfPage": {"@type": "WebPage", "@id": canonical}
    }

    article = f"""<!DOCTYPE html>
<html lang="{lang}">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{esc(version["title"])} | Hariom Patel</title>
<meta name="description" content="{esc(version["description"])}">
<meta name="author" content="Hariom Patel">
<link rel="canonical" href="{canonical}">
{''.join(alternates)}
<meta property="og:type" content="article">
<meta property="og:title" content="{esc(version["title"])}">
<meta property="og:description" content="{esc(version["description"])}">
<meta property="og:url" content="{canonical}">
<script type="application/ld+json">{json.dumps(schema, ensure_ascii=False)}</script>
<link rel="stylesheet" href="../style.css">
<style>
.article{{max-width:820px;margin:0 auto;padding:110px 22px 80px;color:#b5c6d6;line-height:1.9}}
.article h1{{font-size:clamp(38px,6vw,68px);line-height:1;color:#e5f5ff}}
.article .meta{{font:10px 'Fira Code';color:#4e89b4;letter-spacing:1px}}
.article .lead{{font-size:17px;color:#9db3c8}} .article section{{margin-top:42px}}
.article h2{{color:#e5f5ff}} .article pre{{background:#050b14;border:1px solid #ffffff10;padding:18px;border-radius:14px;overflow:auto}}
.article a{{color:#5ed5ff}}
</style>
</head>
<body><main class="article">
<a href="./">← Developer Notes</a>
<div class="meta">{date} · {slot.upper()} · {label.upper()} · AUTHOR: HARIOM PATEL</div>
<h1>{esc(version["title"])}</h1>
<p class="lead">{esc(version["description"])}</p>
{render_sections(version.get("sections", []))}
<p><a href="{canonical}">Permalink</a></p>
</main></body></html>
"""
    path.write_text(article, encoding="utf-8")

# Update the blog index with all three language versions.
index_path = BLOG / "index.html"
index_html = index_path.read_text(encoding="utf-8")
card = f'<article class="post-card"><span class="post-tag">TRENDING TOPIC · HARIOM PATEL</span><time datetime="{date}">{date.upper()}</time><h2>{esc(data["title"])}</h2><p>{esc(data["description"])}</p><a href="./{date}-{slot}-{slug}-hinglish.html">Hinglish ↗</a> · <a href="./{date}-{slot}-{slug}-en.html">English</a> · <a href="./{date}-{slot}-{slug}-hi.html">हिंदी</a></article>'
if data["title"] not in index_html:
    marker = '<main class="blog-grid">'
    if marker in index_html:
        index_html = index_html.replace(marker, marker + card, 1)
        index_path.write_text(index_html, encoding="utf-8")

# Update RSS with the primary Hinglish version.
feed_path = BLOG / "feed.xml"
if feed_path.exists():
    feed = feed_path.read_text(encoding="utf-8")
    canonical = f"{base}/{date}-{slot}-{slug}-hinglish.html"
    item = f'<item><title>{esc(data["versions"]["hinglish"]["title"])}</title><link>{canonical}</link><guid isPermaLink="true">{canonical}</guid><pubDate>{now.strftime("%a, %d %b %Y %H:%M:%S GMT")}</pubDate><description>{esc(data["versions"]["hinglish"]["description"])}</description></item>'
    if canonical not in feed:
        feed = feed.replace("</channel>", item + "</channel>")
        feed_path.write_text(feed, encoding="utf-8")

# Add all localized URLs to sitemap.
sitemap = SITEMAP.read_text(encoding="utf-8")
for key in versions:
    canonical = f"{base}/{date}-{slot}-{slug}-{key}.html"
    entry = f'<url><loc>{canonical}</loc><lastmod>{date}</lastmod></url>'
    if canonical not in sitemap:
        sitemap = sitemap.replace("</urlset>", f"{entry}\n</urlset>")
SITEMAP.write_text(sitemap, encoding="utf-8")

print(f"Published trend topic: {data['topic']}")
