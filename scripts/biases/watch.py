"""Standalone pages for the animated explainers: /biases/watch/<key>/ and /biases/el/watch/<key>/.

Each page has the player, the bias definition, links back into the explorer, an embed mode
(?embed), and two capture modes used by the build to record a social card and an MP4
(?capture=og and ?capture=video, driven by capture.mjs).
"""
import hashlib, json, os, re, shutil, subprocess

SITE = "https://papangelis.com"

# English bias name, quadrant, and the related experiment in the explorer's lab
SCENES = {
    "anchoring": {"en": "Anchoring", "q": "tmi", "lab": "spin",
                  "title": {"en": "Anchoring, explained in 30 seconds", "el": "Η αγκύρωση σε 30 δευτερόλεπτα"}},
}
QUAD = {
    "tmi": {"en": "Too Much Information", "el": "Πάρα πολλή πληροφορία"},
    "nem": {"en": "Not Enough Meaning", "el": "Ανεπαρκές νόημα"},
    "fast": {"en": "Need To Act Fast", "el": "Ανάγκη για γρήγορη δράση"},
    "mem": {"en": "What Should We Remember?", "el": "Τι να θυμόμαστε;"},
}
TXT = {
    "en": {
        "explorer": "Cognitive Bias Explorer", "seconds": "Explained in 30 seconds",
        "card": "Read the full card", "lab": "Try the experiment", "all": "Explore all 188 biases",
        "credit": 'Adapted from <a href="https://commons.wikimedia.org/wiki/File:Cognitive_bias_codex_en.svg" target="_blank" rel="noopener"><cite>The Cognitive Bias Codex</cite></a> by John Manoogian III, Buster Benson and TilmannR. A Downstream project by Thanos Papangelis.',
        "switch": "ΕΛ", "switch_title": "Ελληνικά",
    },
    "el": {
        "explorer": "Εξερευνητής γνωστικών μεροληψιών", "seconds": "Σε 30 δευτερόλεπτα",
        "card": "Διάβασε όλη την κάρτα", "lab": "Κάνε το πείραμα", "all": "Όλες οι 188 μεροληψίες",
        "credit": 'Προσαρμογή του <a href="https://commons.wikimedia.org/wiki/File:Cognitive_bias_codex_en.svg" target="_blank" rel="noopener"><cite>The Cognitive Bias Codex</cite></a> των John Manoogian III, Buster Benson και TilmannR. Μέρος του Downstream, από τον Thanos Papangelis.',
        "switch": "EN", "switch_title": "English",
    },
}
BRAIN = ('<path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/>'
         '<path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/>'
         '<path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/>')


def mark(gid):
    return (f'<svg viewBox="0 0 24 24" aria-hidden="true"><defs><linearGradient id="{gid}" x1="2" y1="3" x2="22" y2="21" gradientUnits="userSpaceOnUse">'
            '<stop offset="0" stop-color="#b9af9f"/><stop offset=".35" stop-color="#4cc3bb"/><stop offset=".68" stop-color="#86a9f0"/><stop offset="1" stop-color="#a2d05a"/>'
            f'</linearGradient></defs><g fill="none" stroke="url(#{gid})" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">{BRAIN}</g></svg>')


PAGE_CSS = """
*{box-sizing:border-box}
body{background:var(--ground);color:var(--ink);font:17px/1.6 var(--serif);margin:0;padding-inline:16px;-webkit-font-smoothing:antialiased}
a{color:inherit}
.w{max-width:560px;margin-inline:auto;padding-block:clamp(24px,6vw,56px) 40px;display:flex;flex-direction:column;gap:28px}
.w-main{display:flex;flex-direction:column;gap:12px}
.w-main h1{font:750 clamp(38px,9vw,56px)/1.02 var(--display);letter-spacing:-.025em;margin:0;text-wrap:balance}
.w-def{font-size:18px;line-height:1.5;margin:0 0 8px;color:var(--muted)}
.w-links{display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-top:10px}
.w-btn{display:inline-flex;align-items:center;border:1px solid var(--rule);background:var(--surface);border-radius:999px;padding:11px 16px;font:500 14px/1 var(--mono);text-decoration:none}
.w-btn:hover{border-color:var(--ink)}
.w-btn.primary{background:var(--ink);color:var(--ground);border-color:var(--ink)}
:focus-visible{outline:2px solid var(--q);outline-offset:3px;border-radius:4px}
.og{display:none}
/* embed: just the player */
html.embed body{padding:0;background:transparent}
html.embed .w{padding:0;max-width:none;gap:0}
html.embed .w-main>:not(#player){display:none}
/* capture: square video frame */
html.cap-video,html.cap-video body{height:100%;margin:0;padding:0;overflow:hidden}
html.cap-video .w{display:block;max-width:none;padding:0;height:100%}
html.cap-video .w-main,html.cap-video #player{height:100%}
html.cap-video .w-main>:not(#player){display:none}
/* capture: 1200x630 social card, drawn at 600x315 and 2x */
html.cap-og,html.cap-og body{margin:0;padding:0;height:100%;overflow:hidden;background:#101317}
html.cap-og .w{display:none}
html.cap-og .og{display:grid;grid-template-columns:minmax(0,1fr) 292px;align-items:center;gap:20px;height:100%;padding:0 22px 0 34px;border-left:5px solid #6ea8fe}
.og-l{display:flex;flex-direction:column;gap:10px}
.og-b{display:flex;align-items:center;gap:8px;font:700 13px/1.25 var(--display);color:var(--ink)}
.og-b svg{width:18px;height:18px}
.og-t{font:750 40px/1 var(--display);letter-spacing:-.02em;margin:6px 0 0;color:var(--ink)}
.og-s{font:400 15px/1.35 var(--serif);color:var(--muted);margin:0}
.og-u{font:600 11px/1.4 var(--mono);color:#6ea8fe;margin-top:14px}
.og .bp.capture .bp-cap,.og .bp.capture .bp-brand{display:none}
.og .bp.capture,.og .bp.capture .bp-stage{height:auto}
.og .bp.capture .bp-stage{border-radius:10px;border:1px solid var(--rule)}
.og .bp.capture .bp-svg{flex:none;padding:4px}
"""


def page(lang, key, data, tokens, fonts, anim_js, anim_css, tags=""):
    sc = SCENES[key]
    bias = next(b for q in data for g in q for b in g["biases"] if (b.get("en") or b["n"]) == sc["en"])
    t = TXT[lang]
    base = "/biases/el/" if lang == "el" else "/biases/"
    other = "/biases/" if lang == "el" else "/biases/el/"
    url = f"{SITE}{base}watch/{key}/"
    name, d = bias["n"], bias["d"]
    esc = lambda s: s.replace("&", "&amp;").replace('"', "&quot;").replace("<", "&lt;")
    slug = "b-" + re.sub(r"[^a-z0-9]+", "-", sc["en"].lower()).strip("-")
    share_title = sc["title"][lang]
    opts = json.dumps({"lang": lang, "shareUrl": url, "embedUrl": url + "?embed",
                       "videoUrl": f"{SITE}/biases/video/{key}-{lang}.mp4"}, ensure_ascii=False)
    return f"""<!DOCTYPE html>
<html lang="{lang}" data-theme="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{esc(share_title)} · Downstream</title>
<meta name="description" content="{esc(d)}">
<meta name="author" content="Thanos Papangelis">
<link rel="canonical" href="{url}">
<link rel="alternate" hreflang="en" href="{SITE}/biases/watch/{key}/">
<link rel="alternate" hreflang="el" href="{SITE}/biases/el/watch/{key}/">
<link rel="alternate" hreflang="x-default" href="{SITE}/biases/watch/{key}/">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Downstream">
<meta property="og:locale" content="{'el_GR' if lang == 'el' else 'en_US'}">
<meta property="og:title" content="{esc(share_title)}">
<meta property="og:description" content="{esc(d)}">
<meta property="og:url" content="{url}">
<meta name="twitter:card" content="{'summary_large_image' if tags else 'summary'}">
<meta name="twitter:title" content="{esc(share_title)}">
<meta name="twitter:description" content="{esc(d)}">
{tags}<link rel="license" href="https://creativecommons.org/licenses/by-sa/4.0/">
<link rel="icon" href="/biases/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/biases/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="/biases/apple-touch-icon.png">
{fonts}
<script>
  (function () {{
    var q = new URLSearchParams(location.search), h = document.documentElement;
    try {{ h.setAttribute("data-theme", localStorage.getItem("theme") || "dark"); }} catch (e) {{}}
    if (q.has("embed")) h.classList.add("embed");
    if (q.get("capture") === "video") h.classList.add("cap-video");
    if (q.get("capture") === "og") {{ h.classList.add("cap-og"); h.setAttribute("data-theme", "dark"); }}
  }})();
</script>
<style>
:root{{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}}[hidden]{{display:none!important}}
{tokens}
:root{{--q:var(--{sc['q']})}}
{PAGE_CSS}
{anim_css}
</style>
</head>
<body>
<div class="w">
  <main class="w-main">
    <h1>{name}</h1>
    <p class="w-def">{d}</p>
    <div id="player"></div>
    <nav class="w-links"><a class="w-btn primary" href="{base}#{slug}">{t['card']}</a></nav>
  </main>
</div>
<div class="og">
  <div class="og-l">
    <div class="og-b">{mark("ob")}{t['explorer']}</div>
    <p class="og-t">{name}</p>
    <p class="og-s">{t['seconds']}</p>
    <span class="og-u">{("papangelis.com" + base + "watch/" + key).replace("/", "/<wbr>")}</span>
  </div>
  <div id="og-player"></div>
</div>
<script>{anim_js}</script>
<script>
  (function () {{
    var q = new URLSearchParams(location.search), mode = q.get("capture"), opts = {opts};
    if (mode === "og") {{ opts.capture = true; var p = BiasAnim.mount(document.getElementById("og-player"), "{key}", opts); window.__bp = p; }}
    else {{ opts.capture = mode === "video"; BiasAnim.mount(document.getElementById("player"), "{key}", opts); }}
  }})();
</script>
</body>
</html>
"""


def og_tags(lang, key, root):
    png = os.path.join(root, "assets", "og", f"watch-{key}-{lang}.png")
    mp4 = os.path.join(root, "biases", "video", f"{key}-{lang}.mp4")
    tags = ""
    if os.path.exists(png):
        v = hashlib.md5(open(png, "rb").read()).hexdigest()[:8]
        img = f"{SITE}/assets/og/watch-{key}-{lang}.png?v={v}"
        tags += (f'<meta property="og:image" content="{img}">\n<meta property="og:image:width" content="1200">\n'
                 f'<meta property="og:image:height" content="630">\n<meta name="twitter:image" content="{img}">\n')
    if os.path.exists(mp4):
        vid = f"{SITE}/biases/video/{key}-{lang}.mp4"
        tags += (f'<meta property="og:video" content="{vid}">\n<meta property="og:video:secure_url" content="{vid}">\n'
                 f'<meta property="og:video:type" content="video/mp4">\n<meta property="og:video:width" content="1080">\n'
                 f'<meta property="og:video:height" content="1080">\n')
    return tags


def build_all(root, here, datasets, tokens, fonts, anim_js, anim_css, recapture=False):
    """Write every watch page, record cards and videos when their content changed, then rewrite pages with og tags."""
    paths, fingerprints = {}, {}
    for key in SCENES:
        for lang, data in datasets.items():
            if data is None:
                continue
            out = os.path.join(root, (f"biases/el/watch/{key}" if lang == "el" else f"biases/watch/{key}"))
            os.makedirs(out, exist_ok=True)
            html = page(lang, key, data, tokens[lang], fonts[lang], anim_js, anim_css)
            open(os.path.join(out, "index.html"), "w").write(html)
            paths[(key, lang)] = os.path.join(out, "index.html")
            shown = html[html.index("<style>"):html.index("</style>")] + html[html.index('<div class="og">'):]
            fingerprints[f"{key}-{lang}"] = hashlib.md5(shown.encode()).hexdigest()

    manifest_path = os.path.join(here, ".captures.json")
    manifest = json.load(open(manifest_path)) if os.path.exists(manifest_path) else {}
    chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    can = os.path.exists(chrome) and shutil.which("ffmpeg") and shutil.which("node")
    jobs = []
    for (key, lang), path in paths.items():
        name = f"{key}-{lang}"
        png = os.path.join(root, "assets", "og", f"watch-{name}.png")
        mp4 = os.path.join(root, "biases", "video", f"{name}.mp4")
        stale = recapture or manifest.get(name) != fingerprints[name] or not (os.path.exists(png) and os.path.exists(mp4))
        if stale and can:
            os.makedirs(os.path.dirname(mp4), exist_ok=True)
            jobs.append({"type": "png", "url": f"file://{path}?capture=og", "out": png, "width": 600, "height": 315})
            jobs.append({"type": "mp4", "url": f"file://{path}?capture=video", "out": mp4, "width": 540, "height": 540, "fps": 30})
            manifest[name] = fingerprints[name]
        elif stale:
            print(f"cannot record {name}: needs Google Chrome, ffmpeg and node")
    if jobs:
        jobs_path = os.path.join(here, ".capture-jobs.json")
        json.dump(jobs, open(jobs_path, "w"))
        subprocess.run(["node", os.path.join(here, "capture.mjs"), jobs_path], check=True)
        os.remove(jobs_path)
        json.dump(manifest, open(manifest_path, "w"), indent=1)

    for (key, lang), path in paths.items():
        html = page(lang, key, datasets[lang], tokens[lang], fonts[lang], anim_js, anim_css, og_tags(lang, key, root))
        open(path, "w").write(html)
        print(f"wrote {os.path.relpath(path, root)}")
