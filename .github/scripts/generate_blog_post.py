import json, os, re, html
from datetime import datetime, timezone
from pathlib import Path
from urllib.request import Request, urlopen
from xml.etree import ElementTree as ET

ROOT=Path(__file__).resolve().parents[2]; BLOG=ROOT/"blog"; SITEMAP=ROOT/"sitemap.xml"
API_KEY=os.environ["GEMINI_API_KEY"]; MODEL=os.environ.get("GEMINI_MODEL","gemini-2.5-flash-lite")
now=datetime.now(timezone.utc); date=now.strftime("%Y-%m-%d"); slot="morning" if now.hour<12 else "evening"
def fetch(url,headers=None):
    req=Request(url,headers=headers or {"User-Agent":"Hariom-Developer-Blog/1.0"})
    with urlopen(req,timeout=30) as r:return r.read()
def trends():
    try:
        root=ET.fromstring(fetch("https://trends.google.com/trending/rss?geo=IN"))
        return [{"query":(x.findtext("title") or "").strip(),"traffic":x.findtext("{https://trends.google.com/trending/rss}approx_traffic") or ""} for x in root.findall(".//item") if x.findtext("title")][:30]
    except Exception as exc: print(f"Trend feed unavailable: {exc}"); return []
topics=trends()
if not topics: print("No trend data available; skipping rather than inventing demand."); raise SystemExit(0)
prompt=f"""You are the editorial assistant for Hariom Patel's personal developer blog. Today is {date}.
Choose ONE useful programming/AI/Python/web/automation/API/developer-tool/software-engineering topic from these Google Trends India discovery signals. Ignore unrelated viral topics and never claim exact search volume unless supplied.
Write the primary version in natural Hinglish: casual Indian developer language, practical and clear, not corporate or generic SEO filler. Also create faithful English and Hindi versions.
Never invent Hariom's personal experience, credentials, benchmarks, projects, quotes or test results.
Return JSON only with publish, topic, title, description, slug, sources, versions (hinglish/en/hi), where each version has title, description and sections of heading/paragraphs/code.
Google Trends India topics:
{json.dumps(topics,ensure_ascii=False)}
"""
payload={"contents":[{"parts":[{"text":prompt}]}],"generationConfig":{"temperature":.45,"responseMimeType":"application/json","maxOutputTokens":5000}}
req=Request(f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent",data=json.dumps(payload).encode(),headers={"Content-Type":"application/json","x-goog-api-key":API_KEY})
with urlopen(req,timeout=90) as r: result=json.load(r)
data=json.loads(result["candidates"][0]["content"]["parts"][0]["text"])
if not data.get("publish"): raise SystemExit(0)
slug=re.sub(r"[^a-z0-9-]+","-",data["slug"].lower()).strip("-")[:70]
if not slug: raise ValueError("Invalid generated slug")
def esc(v): return html.escape(str(v),quote=True)
def render_sections(sections):
    out=[]
    for s in sections:
        body="".join(f"<p>{esc(p)}</p>" for p in s.get("paragraphs",[]))
        if s.get("code"): body+=f"<pre><code>{esc(s['code'])}</code></pre>"
        out.append(f"<section><h2>{esc(s.get('heading',''))}</h2>{body}</section>")
    return "".join(out)
base="https://pateljiop.github.io/Hariom-Professional-Portfolio/blog"
versions={"hinglish":("hi-Latn","HINGLISH"),"en":("en","ENGLISH"),"hi":("hi","हिंदी")}
for key,(lang,label) in versions.items():
    v=data["versions"][key]; filename=f"{date}-{slot}-{slug}-{key}.html"; path=BLOG/filename
    if path.exists(): print(f"Already exists (preserving existing article): {filename}"); continue
    canonical=f"{base}/{filename}"
    alternates=[f'<link rel="alternate" hreflang="{ol}" href="{base}/{date}-{slot}-{slug}-{ok}.html">' for ok,(ol,_) in versions.items()]
    alternates.append(f'<link rel="alternate" hreflang="x-default" href="{base}/{date}-{slot}-{slug}-hinglish.html">')
    schema={"@context":"https://schema.org","@type":"BlogPosting","headline":v["title"],"description":v["description"],"datePublished":date,"dateModified":date,"inLanguage":lang,"author":{"@type":"Person","name":"Hariom Patel","url":"https://pateljiop.github.io/Hariom-Professional-Portfolio/"},"mainEntityOfPage":{"@type":"WebPage","@id":canonical}}
    links={"hinglish":f"{date}-{slot}-{slug}-hinglish.html","en":f"{date}-{slot}-{slug}-en.html","hi":f"{date}-{slot}-{slug}-hi.html"}
    source_items="".join(f'<li><a href="{esc(s)}" rel="noopener noreferrer">{esc(s)}</a></li>' for s in data.get("sources",[]) if str(s).startswith(("http://","https://")))
    article=f"""<!DOCTYPE html><html lang="{lang}"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{esc(v["title"])} | Hariom Patel</title><meta name="description" content="{esc(v["description"])}"><meta name="author" content="Hariom Patel"><link rel="canonical" href="{canonical}">{''.join(alternates)}
<meta property="og:type" content="article"><meta property="og:title" content="{esc(v["title"])}"><meta property="og:description" content="{esc(v["description"])}"><meta property="og:url" content="{canonical}">
<script type="application/ld+json">{json.dumps(schema,ensure_ascii=False)}</script><link rel="stylesheet" href="./immersive.css"></head>
<body><canvas id="hp-scene" class="hp-scene" aria-hidden="true"></canvas><div class="hp-vignette"></div><div class="hp-grid"></div><div class="hp-shell">
<nav class="hp-nav"><a class="hp-brand" href="./">HariomPatel<span>.dev</span></a><div class="hp-nav-links"><a href="../wiki/">KNOWLEDGE</a><a href="../">PORTFOLIO</a></div></nav>
<article class="hp-content"><div class="hp-meta">{date} · {slot.upper()} · {label} · AUTHOR: HARIOM PATEL</div><h1>{esc(v["title"])}</h1><p class="lead">{esc(v["description"])}</p>
<div class="hp-language"><a class="{'active' if key=='en' else ''}" href="./{links['en']}">ENGLISH</a><a class="{'active' if key=='hinglish' else ''}" href="./{links['hinglish']}">HINGLISH</a><a class="{'active' if key=='hi' else ''}" href="./{links['hi']}">हिंदी</a></div>
{render_sections(v.get("sections",[]))}
<div class="hp-sources"><h3>References</h3><ul>{source_items or "<li>Technical references will be added when supplied by the article.</li>"}</ul></div>
</article><footer class="hp-footer">PERMANENT NOTE · HARIOM BUILDS · HARIOMPATEL.DEV · {{pateljiop}}</footer></div><script src="./immersive.js"></script></body></html>"""
    path.write_text(article,encoding="utf-8")
index_path=BLOG/"index.html"; index_html=index_path.read_text(encoding="utf-8")
card=f'<article class="hp-panel hp-card"><span class="tag">TRENDING TOPIC · {date.upper()}</span><h2>{esc(data["title"])}</h2><p>{esc(data["description"])}</p><a href="./{date}-{slot}-{slug}-hinglish.html">Hinglish ↗</a> · <a href="./{date}-{slot}-{slug}-en.html">English</a> · <a href="./{date}-{slot}-{slug}-hi.html">हिंदी</a></article>'
if data["title"] not in index_html:index_html=index_html.replace('<main class="hp-grid-cards">','<main class="hp-grid-cards">'+card,1);index_path.write_text(index_html,encoding="utf-8")
feed_path=BLOG/"feed.xml"
if feed_path.exists():
    feed=feed_path.read_text(encoding="utf-8"); canonical=f"{base}/{date}-{slot}-{slug}-hinglish.html"
    item=f'<item><title>{esc(data["versions"]["hinglish"]["title"])}</title><link>{canonical}</link><guid isPermaLink="true">{canonical}</guid><pubDate>{now.strftime("%a, %d %b %Y %H:%M:%S GMT")}</pubDate><description>{esc(data["versions"]["hinglish"]["description"])}</description></item>'
    if canonical not in feed:feed=feed.replace("</channel>",item+"</channel>");feed_path.write_text(feed,encoding="utf-8")
sitemap=SITEMAP.read_text(encoding="utf-8")
for key in versions:
    loc=f"{base}/{date}-{slot}-{slug}-{key}.html"; entry=f'<url><loc>{loc}</loc><lastmod>{date}</lastmod></url>'
    if loc not in sitemap:sitemap=sitemap.replace("</urlset>",entry+"\n</urlset>")
SITEMAP.write_text(sitemap,encoding="utf-8");print(f"Published trend topic: {data['topic']}")
