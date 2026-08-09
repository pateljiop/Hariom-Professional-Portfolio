import datetime
import requests

def fetch_tech_feed():
    url = "https://dev.to/api/articles?tag=python&per_page=2"
    try:
        response = requests.get(url, timeout=10)
        articles = response.json()
        
        today = datetime.datetime.now().strftime("%B %d, %Y")
        
        feed_html = f"<h3>🚀 Daily Tech Feed ({today})</h3><ul style='list-style:none; padding:0; margin-top:10px;'>"
        for art in articles:
            feed_html += f"<li style='margin-bottom:12px;'><a href='{art['url']}' target='_blank' style='color:#38bdf8; font-weight:600; text-decoration:none;'>{art['title']}</a><br><small style='color:#94a3b8;'>{art['description']}</small></li>"
        feed_html += "</ul>"
        return feed_html
    except Exception as e:
        return "<p>Live feed updating...</p>"

def update_index_file():
    new_feed = fetch_tech_feed()
    
    with open("index.html", "r", encoding="utf-8") as f:
        content = f.read()

    start_tag = '<div id="daily-feed-content">'
    end_tag = '</div>'
    
    start_idx = content.find(start_tag) + len(start_tag)
    end_idx = content.find(end_tag, start_idx)
    
    if start_idx != -1 and end_idx != -1:
        updated_content = content[:start_idx] + f"\n{new_feed}\n" + content[end_idx:]
        with open("index.html", "w", encoding="utf-8") as f:
            f.write(updated_content)

if __name__ == "__main__":
    update_index_file()
