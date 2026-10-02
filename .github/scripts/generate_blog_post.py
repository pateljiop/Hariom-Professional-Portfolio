import json, os, re, html
from datetime import datetime, timezone
from pathlib import Path
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[2]
BLOG = ROOT / "blog"
SITEMAP = ROOT / "sitemap.xml"
API_KEY = os.environ["GEMINI_API_KEY"]
MODEL = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash-lite")
REPOS = [x.strip() for x in os.environ.get("SOURCE_REPOS", "").split(",") if x.strip()]

now = datetime.now(timezone.utc)
date = now.strftime("%Y-%m-%d")
slot = "morning" if now.hour < 12 else "evening"

def get_json(url):
    req = Request(url, headers={"Accept": "application/vnd.github+json", "User-Agent": "Hariom-Developer-Blog"})
    with urlopen(req, timeout=20) as r:
        return json.load(r)

commits = []
for repo in REPOS:
    try:
        data = get_json(f"https://api.github.com/repos/{repo}/commits?per_page=8")
        for c in data:
            commits.append({
                "repo": repo,
                "sha": c["sha"][:7],
                "date": c["commit"]["author"]["date"],
                "message": c["commit"]["message"].split("\n", 1)[0],
                "url": c["html_url"],
            })
    except Exception as exc:
        print(f"Could not read {repo}: {exc}")

commits.sort(key=lambda x: x["date"], reverse=True)
commits = commits[:16]

# Do not publish filler when there is no meaningful development signal.
if not commits:
    print("No GitHub activity available; skipping.")
    raise SystemExit(0)

context = json.dumps(commits, ensure_ascii=False, indent=2)
prompt = f"""
You are the editorial assistant for Hariom Patel's personal developer portfolio.
Today is {date}. This is the {slot} publishing slot.

Write ONE genuinely useful developer-log article based ONLY on the supplied recent GitHub activity.
Author is always Hariom Patel. Do not claim Hariom personally did something unless the supplied commit
evidence supports it. Do not invent benchmarks, credentials, users, results, bugs, features, or facts.
Do not mention that an AI wrote the article. Do not write generic SEO filler. If the activity is too
trivial to support a useful article, return publish=false.

Prefer a practical "what changed / why it matters / what I learned" article. It can discuss a real
implementation pattern visible in the commits, but must clearly avoid inventing unseen details.

Return JSON only:
{{
  "publish": true,
  "title": "specific useful title",
  "description": "one-sentence description",
  "slug": "lowercase-hyphenated-slug",
  "sections": [
    {{"heading":"...", "paragraphs":["...","..."], "code":"optional short code example"}}
  ]
}}

GitHub activity:
{context}
"""

payload = {
    "contents": [{"parts": [{"text": prompt}]}],
    "generationConfig": {"temperature": 0.25, "responseMimeType": "application/json", "maxOutputTokens": 1800}
}
req = Request(
    f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent",
    data=json.dumps(payload).encode(),
    headers={"Content-Type": "application/json", "x-goog-api-key": API_KEY},
)
with urlopen(req, timeout=60) as r:
    result = json.load(r)

text = result["candidates"][0]["content"]["parts"][0]["text"]
data = json.loads(text)
if not data.get("publish"):
    print("Gemini decided there is not enough meaningful activity for a post.")
    raise SystemExit(0)

slug = re.sub(r"[^a-z0-9-]+", "-", data["slug"].lower()).strip("-")[:70]
if not slug:
    raise ValueError("Invalid generated slug")

# Keep every scheduled run independent and avoid duplicate publication.
filename = f"{date}-{slot}-{slug}.html"
path = BLOG / filename
if path.exists():
    print("Post already exists; skipping duplicate.")
    raise SystemExit(0)

def esc(value):
    return html.escape(str(value), quote=True)

sections_html = []
for section in data.get("sections", []):
    heading = esc(section.get("heading", ""))
    body = "".join(f"<p>{esc(p)}</p>" for p in section.get("paragraphs", []))
    code = section.get("code")
    if code:
        body += f"<pre><code>{esc(code)}</code></pre>"
    sections_html.append(f"<section><h2>{heading}</h2>{body}</section>")

canonical = f"https://pateljiop.github.io/Hariom-Professional-Portfolio/blog/{filename}"
article = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{esc(data["title"])} | Hariom Patel</title>
<meta name="description" content="{esc(data["description"])}">
<meta name="author" content="Hariom Patel">
<link rel="canonical" href="{canonical}">
<meta property="og:type" content="article">
<meta property="og:title" content="{esc(data["title"])}">
<meta property="og:description" content="{esc(data["description"])}">
<meta property="og:url" content="{canonical}">
<script type="application/ld+json">{json.dumps({
    "@context":"https://schema.org","@type":"BlogPosting",
    "headline":data["title"],"description":data["description"],
    "datePublished":date,"dateModified":date,
    "author":{"@type":"Person","name":"Hariom Patel",
              "url":"https://pateljiop.github.io/Hariom-Professional-Portfolio/"},
    "mainEntityOfPage":{"@type":"WebPage","@id":canonical}
}, ensure_ascii=False)}</script>
<link rel="stylesheet" href="../style.css">
<style>
.article{{max-width:820px;margin:0 auto;padding:110px 22px 80px;color:#b5c6d6;line-height:1.9}}
.article h1{{font-size:clamp(38px,6vw,68px);line-height:1;margin:14px 0;color:#e5f5ff}}
.article .meta{{font:10px 'Fira Code';color:#4e89b4;letter-spacing:1px}}
.article .lead{{font-size:17px;color:#9db3c8}}
.article section{{margin-top:42px}} .article h2{{color:#e5f5ff}}
.article pre{{background:#050b14;border:1px solid #ffffff10;padding:18px;border-radius:14px;overflow:auto}}
.article a{{color:#5ed5ff}}
</style>
</head>
<body>
<main class="article">
<a href="./">← Developer Notes</a>
<div class="meta">{date} · {slot.upper()} · AUTHOR: HARIOM PATEL</div>
<h1>{esc(data["title"])}</h1>
<p class="lead">{esc(data["description"])}</p>
{"".join(sections_html)}
<p><a href="{canonical}">Permalink</a></p>
</main>
</body>
</html>
"""
path.write_text(article, encoding="utf-8")

# Add the article to the blog index so each generated post is discoverable.
index_path = BLOG / "index.html"
index_html = index_path.read_text(encoding="utf-8")
card = f'<article class="post-card"><time>{date.upper()}</time><span class="post-tag">{slot.upper()} · DEVELOPER LOG</span><h2>{esc(data["title"])}</h2><p>{esc(data["description"])}</p><a href="./{filename}">Read note ↗</a></article>'
grid_match = re.search(r'(<div class="blog-grid">)(.*?)(</div>)', index_html, re.S)
if grid_match and filename not in index_html:
    index_html = index_html[:grid_match.end(1)] + card + index_html[grid_match.end(1):]
    index_path.write_text(index_html, encoding="utf-8")

# Add the article to the RSS feed.
feed_path = BLOG / "feed.xml"
if feed_path.exists():
    feed = feed_path.read_text(encoding="utf-8")
    item = f'<item><title>{esc(data["title"])}</title><link>{canonical}</link><guid isPermaLink="true">{canonical}</guid><pubDate>{now.strftime("%a, %d %b %Y %H:%M:%S GMT")}</pubDate><description>{esc(data["description"])}</description></item>'
    if canonical not in feed:
        feed = feed.replace("</channel>", item + "</channel>")
        feed_path.write_text(feed, encoding="utf-8")

# Add the article to the sitemap.
sitemap = SITEMAP.read_text(encoding="utf-8")
entry = f'<url><loc>{canonical}</loc><lastmod>{date}</lastmod></url>'
if canonical not in sitemap:
    sitemap = sitemap.replace("</urlset>", f"{entry}\n</urlset>")
    SITEMAP.write_text(sitemap, encoding="utf-8")

print(f"Published {path}")
