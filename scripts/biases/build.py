"""Builds /biases/index.html (Cognitive Bias Explorer) from page.src.html + data/*.json.

Usage:  python3 scripts/biases/build.py
        python3 scripts/biases/build.py --fragment out.html   # also write a body-only copy
"""
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, "..", ".."))
URL = "https://papangelis.com/biases/"
DESC = ("An interactive map of 188 cognitive biases: what each one is, why your brain uses it, "
        "how to spot it, and how to counter it. With ten try-it-yourself experiments, "
        "a personal bias map and a quiz.")
SHORT = "188 cognitive biases on one interactive map, with experiments that let you feel each one work on you."

data = []
for i in range(1, 5):
    groups = json.load(open(os.path.join(HERE, "data", f"q{i}.json")))
    for g in groups:
        for k in ("id", "title", "why", "cost", "spot", "fix", "biases"):
            assert g.get(k), (i, g.get("id"), k)
        for b in g["biases"]:
            for k in ("n", "d", "ex", "q", "spot", "fix"):
                assert b.get(k), (i, b.get("n"), k)
    data.append(groups)

src = open(os.path.join(HERE, "page.src.html")).read()
js = "const DATA = " + json.dumps(data, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/") + ";"
page = src.replace("/*__DATA__*/", js)

if "--fragment" in sys.argv:
    open(sys.argv[sys.argv.index("--fragment") + 1], "w").write(page)

site = (page
        .replace("<title>Cognitive Bias Explorer</title>", "<title>Cognitive Bias Explorer &middot; Downstream</title>")
        .replace("<!--__HOME__-->", '<a class="home-link" href="/">&larr; Downstream</a>')
        .replace("<!--__BYLINE__-->", " A Downstream project by Thanos Papangelis."))
head = f"""<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="description" content="{DESC}">
<meta name="author" content="Thanos Papangelis">
<link rel="canonical" href="{URL}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Downstream">
<meta property="og:title" content="Cognitive Bias Explorer">
<meta property="og:description" content="{SHORT}">
<meta property="og:url" content="{URL}">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="Cognitive Bias Explorer">
<meta name="twitter:description" content="{SHORT}">
<link rel="license" href="https://creativecommons.org/licenses/by-sa/4.0/">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<script>
  (function () {{
    try {{
      var t = localStorage.getItem("theme") || "dark";
      document.documentElement.setAttribute("data-theme", t);
    }} catch (e) {{}}
  }})();
</script>
<style>:root{{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}}[hidden]{{display:none!important}}img{{max-width:100%}}</style>
"""
split = site.index("</style>") + len("</style>")
html = head + site[:split] + "\n</head>\n<body>\n" + site[split:] + "\n</body>\n</html>\n"
os.makedirs(os.path.join(ROOT, "biases"), exist_ok=True)
open(os.path.join(ROOT, "biases", "index.html"), "w").write(html)
print("wrote biases/index.html:", sum(len(g["biases"]) for q in data for g in q), "entries")
