:root {
    --bg-color: #0f172a;
    --card-bg: #1e293b;
    --text-main: #f8fafc;
    --text-muted: #94a3b8;
    --accent: #38bdf8;
    --accent-hover: #0284c7;
    --border: #334155;
    --insta-color: #e1306c;
    --tg-color: #0088cc;
}

* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    font-family: 'Inter', sans-serif;
}

body {
    background-color: var(--bg-color);
    color: var(--text-main);
    line-height: 1.6;
}

.toast {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background-color: var(--accent);
    color: #0f172a;
    padding: 12px 24px;
    border-radius: 8px;
    font-weight: 700;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    transform: translateY(100px);
    opacity: 0;
    transition: all 0.3s ease;
    z-index: 1000;
}

.toast.show {
    transform: translateY(0);
    opacity: 1;
}

header {
    background-color: rgba(30, 41, 59, 0.85);
    backdrop-filter: blur(10px);
    position: sticky;
    top: 0;
    z-index: 100;
    border-bottom: 1px solid var(--border);
}

nav {
    max-width: 1100px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.2rem 2rem;
}

.logo {
    font-size: 1.4rem;
    font-weight: 700;
    color: var(--text-main);
    text-decoration: none;
}

.logo span { color: var(--accent); }

.nav-links {
    display: flex;
    gap: 1.5rem;
    list-style: none;
}

.nav-links a {
    color: var(--text-muted);
    text-decoration: none;
    font-weight: 500;
    transition: color 0.3s ease;
}

.nav-links a:hover { color: var(--accent); }

.container {
    max-width: 1100px;
    margin: 0 auto;
    padding: 0 2rem;
}

.fade-in {
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}

.fade-in.visible {
    opacity: 1;
    transform: translateY(0);
}

.hero { padding: 3rem 0; }

.hero-banner-card {
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
    border: 1px solid #334155;
    border-radius: 16px;
    padding: 2.5rem 3rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 2rem;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
    position: relative;
    overflow: hidden;
}

.hero-banner-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: #38bdf8;
}

.hero-text-content { flex: 1; }

.badge {
    background-color: rgba(56, 189, 248, 0.1);
    color: var(--accent);
    padding: 0.4rem 1rem;
    border-radius: 20px;
    font-size: 0.85rem;
    border: 1px solid rgba(56, 189, 248, 0.2);
    display: inline-block;
    margin-bottom: 0.8rem;
}

.hero-title {
    font-size: 2.5rem;
    font-weight: 800;
    color: #38bdf8;
    letter-spacing: 1px;
    margin-bottom: 0.3rem;
}

.hero-subtitle {
    font-size: 1.2rem;
    font-weight: 600;
    color: #f8fafc;
    margin-bottom: 0.5rem;
}

.typewriter-text { color: var(--accent); }

.cursor { animation: blink 0.7s infinite; }

@keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
}

.hero-meta {
    font-size: 0.95rem;
    color: #94a3b8;
    margin-bottom: 0.3rem;
}

.hero-stack {
    font-size: 0.9rem;
    color: #38bdf8;
    font-weight: 500;
    margin-bottom: 1.2rem;
}

/* Social Buttons Row */
.social-btn-group {
    display: flex;
    gap: 0.6rem;
    flex-wrap: wrap;
    margin-bottom: 1.5rem;
}

.social-btn {
    padding: 0.4rem 0.8rem;
    background-color: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--border);
    border-radius: 6px;
    color: var(--text-main);
    text-decoration: none;
    font-size: 0.85rem;
    font-weight: 500;
    transition: all 0.2s ease;
}

.social-btn:hover {
    border-color: var(--accent);
    transform: translateY(-2px);
}

.banner-avatar {
    width: 180px;
    height: 180px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid #38bdf8;
    box-shadow: 0 0 25px rgba(56, 189, 248, 0.3);
}

/* Code Editor Window */
.code-editor-card {
    background-color: #0d1117;
    border: 1px solid var(--border);
    border-radius: 10px;
    overflow: hidden;
    font-family: 'Fira Code', monospace;
    box-shadow: 0 8px 24px rgba(0,0,0,0.5);
}

.editor-header {
    background-color: #161b22;
    padding: 10px 15px;
    display: flex;
    align-items: center;
    border-bottom: 1px solid var(--border);
}

.dots { display: flex; gap: 6px; }
.dot { width: 10px; height: 10px; border-radius: 50%; }
.dot.red { background-color: #ff5f56; }
.dot.yellow { background-color: #ffbd2e; }
.dot.green { background-color: #27c93f; }

.editor-title {
    color: var(--text-muted);
    font-size: 0.85rem;
    margin-left: 15px;
}

.editor-body {
    padding: 20px;
    color: #c9d1d9;
    font-size: 0.9rem;
    line-height: 1.5;
    overflow-x: auto;
}

.py-keyword { color: #ff7b72; }
.py-class { color: #ffa657; }
.py-func { color: #d2a8ff; }
.py-str { color: #a5d6ff; }

/* Image Slider Container */
.slider-container {
    max-width: 700px;
    margin: 0 auto;
    position: relative;
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid var(--border);
    background-color: var(--card-bg);
}

.slide img {
    width: 100%;
    height: 380px;
    object-fit: cover;
    display: block;
}

.slide-caption {
    padding: 1rem;
    text-align: center;
    color: var(--text-muted);
    font-size: 0.9rem;
    background-color: var(--card-bg);
}

.hero-btns { display: flex; gap: 1rem; }

.btn {
    padding: 0.8rem 1.5rem;
    border-radius: 6px;
    text-decoration: none;
    font-weight: 600;
    transition: all 0.3s ease;
    display: inline-block;
    cursor: pointer;
}

.btn-primary { background-color: var(--accent); color: #0f172a; border: none; }
.btn-primary:hover { background-color: var(--accent-hover); transform: translateY(-2px); }

.btn-secondary { border: 1px solid var(--border); color: var(--text-main); background-color: var(--card-bg); }
.btn-secondary:hover { border-color: var(--accent); transform: translateY(-2px); }

section { padding: 3.5rem 0; }
.section-title { font-size: 1.8rem; margin-bottom: 0.5rem; }
.section-subtitle { color: var(--text-muted); margin-bottom: 2rem; font-size: 0.95rem; }

.grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 1.5rem;
}

.card-icon { font-size: 2rem; margin-bottom: 0.8rem; }

@keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-8px); }
    100% { transform: translateY(0px); }
}

.card {
    background-color: var(--card-bg);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 1.5rem;
    animation: float 4s ease-in-out infinite;
    transition: border-color 0.3s ease;
}

.grid .card:nth-child(1) { animation-delay: 0s; }
.grid .card:nth-child(2) { animation-delay: 1s; }
.grid .card:nth-child(3) { animation-delay: 2s; }
.grid .card:nth-child(4) { animation-delay: 3s; }

.card:hover { border-color: rgba(56, 189, 248, 0.4); }

.live-card { border-left: 4px solid var(--accent); animation: none; }

.live-status {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.85rem;
    color: var(--accent);
    margin-bottom: 1rem;
    font-weight: 600;
}

.pulse {
    width: 8px;
    height: 8px;
    background-color: var(--accent);
    border-radius: 50%;
    box-shadow: 0 0 0 rgba(56, 189, 248, 0.4);
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0% { box-shadow: 0 0 0 0 rgba(56, 189, 248, 0.7); }
    70% { box-shadow: 0 0 0 10px rgba(56, 189, 248, 0); }
    100% { box-shadow: 0 0 0 0 rgba(56, 189, 248, 0); }
}

.tags { display: flex; gap: 0.5rem; margin: 1rem 0; }
.tag {
    background-color: rgba(255, 255, 255, 0.05);
    color: var(--accent);
    font-size: 0.8rem;
    padding: 0.2rem 0.6rem;
    border-radius: 4px;
}

.skills-container { display: flex; flex-wrap: wrap; gap: 0.8rem; margin-top: 1.5rem; }
.skill-pill {
    background-color: var(--card-bg);
    border: 1px solid var(--border);
    padding: 0.6rem 1.2rem;
    border-radius: 6px;
    display: flex;
    align-items: center;
    gap: 0.6rem;
}

.skill-pill img { width: 20px; height: 20px; }

.contact-card {
    background-color: var(--card-bg);
    border: 1px solid var(--border);
    padding: 2rem;
    border-radius: 8px;
    max-width: 600px;
}

.contact-card a { color: var(--accent); text-decoration: none; }

footer {
    text-align: center;
    padding: 2rem 0;
    color: var(--text-muted);
    border-top: 1px solid var(--border);
    margin-top: 2rem;
    font-size: 0.9rem;
}

.share-tag a { color: var(--accent); text-decoration: none; }

@media (max-width: 768px) {
    .hero-banner-card { flex-direction: column-reverse; text-align: center; }
    .banner-avatar { width: 130px; height: 130px; }
    .hero-title { font-size: 1.8rem; }
    .nav-links { display: none; }
    .hero-btns { justify-content: center; }
}
