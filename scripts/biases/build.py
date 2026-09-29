"""Builds the Cognitive Bias Explorer in English (/biases/) and Greek (/biases/el/).

Sources: page.src.html (UI, with ⟪english¦greek⟫ markers), data/q1..q4.json (English
content) and data/el/q1..q4.json (Greek content). Also renders each language's social
card to assets/og/ with rsvg-convert (brew install librsvg).

Usage:  python3 scripts/biases/build.py
        python3 scripts/biases/build.py --fragment out.html   # also write a body-only English copy
"""
import hashlib, json, math, os, re, shutil, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, "..", ".."))
SITE = "https://papangelis.com"
MARK = re.compile(r"⟪(.*?)¦(.*?)⟫", re.S)

LANGS = {
    "en": dict(
        out="biases", url=f"{SITE}/biases/", card="biases",
        name="Cognitive Bias Explorer",
        desc=("An interactive map of 188 cognitive biases: what each one is, why your brain uses it, "
              "how to spot it, and how to counter it. With ten try-it-yourself experiments, "
              "a personal bias map and a quiz."),
        short="188 cognitive biases on one interactive map, with experiments that let you feel each one work on you.",
        title_lines=["Cognitive Bias", "Explorer"], title_size=78,
        sub=["188 biases, why your brain uses them,", "how to spot them, and ten experiments", "that let you feel them work on you."],
        sub_size=28,
        credit="Adapted from the Cognitive Bias Codex · CC BY-SA 4.0",
        byline=" A Downstream project by Thanos Papangelis.",
        switch=dict(href="el/", label="ΕΛ", lang="el", title="Ελληνικά"),
    ),
    "el": dict(
        out="biases/el", url=f"{SITE}/biases/el/", card="biases-el",
        name="Εξερευνητής γνωστικών μεροληψιών",
        desc=("Ένας διαδραστικός χάρτης 188 γνωστικών μεροληψιών: τι είναι η καθεμία, γιατί τη χρησιμοποιεί "
              "ο εγκέφαλός σου, πώς να την εντοπίζεις και πώς να την αντιμετωπίζεις. Με δέκα πειράματα, "
              "προσωπικό χάρτη και κουίζ."),
        short="188 γνωστικές μεροληψίες σε έναν διαδραστικό χάρτη, με πειράματα που σε αφήνουν να τις νιώσεις να δουλεύουν πάνω σου.",
        title_lines=["Εξερευνητής", "γνωστικών", "μεροληψιών"], title_size=70,
        sub=["188 μεροληψίες: γιατί τις χρησιμοποιεί", "ο εγκέφαλός σου, πώς να τις εντοπίζεις,", "και δέκα πειράματα για να τις νιώσεις."],
        sub_size=26,
        credit="Προσαρμογή του Cognitive Bias Codex · CC BY-SA 4.0",
        byline=" Μέρος του Downstream, από τον Thanos Papangelis.",
        switch=dict(href="../", label="EN", lang="en", title="English"),
    ),
}


def load(folder):
    data = []
    for i in range(1, 5):
        p = os.path.join(HERE, "data", *folder, f"q{i}.json")
        if not os.path.exists(p):
            return None
        groups = json.load(open(p))
        for g in groups:
            for k in ("id", "title", "why", "cost", "spot", "fix", "biases"):
                assert g.get(k), (p, g.get("id"), k)
            for b in g["biases"]:
                for k in ("n", "d", "ex", "q", "spot", "fix"):
                    assert b.get(k), (p, b.get("n"), k)
        data.append(groups)
    return data


def resolve(text, lang):
    out = MARK.sub(lambda m: m.group(1) if lang == "en" else m.group(2), text)
    left = [c for c in "⟪¦⟫" if c in out]
    assert not left, f"unbalanced translation markers ({lang}): {left}"
    return out


def card_svg(data, L):
    W, H, PAD = 1200, 630, 90
    C = dict(bgTop="#17171b", bgBottom="#0d0d0f", accent="#6ea8fe", accentSoft="#93bbff",
             title="#f4f4f6", muted="#9a9aa3", hairline="#2a2a2e")
    QC = ["#4cc3bb", "#86a9f0", "#a2d05a", "#b9af9f"]
    FONT = "'Helvetica Neue', Helvetica, Arial, sans-serif"
    cx, cy = 900, 296
    R_HUB, R_FAN, R_LEAF, R_RAY, R_RING = 40, 96, 150, 157, 236
    GAP_G, GAP_Q = 1.7, 4.5
    groups = [(qi, g) for qi, q in enumerate(data) for g in q]
    n = sum(len(g["biases"]) for _, g in groups)
    step = (360 - len(groups) * GAP_G - len(data) * GAP_Q) / n
    pol = lambda r, a: (cx + r * math.sin(math.radians(a)), cy - r * math.cos(math.radians(a)))
    f = lambda v: f"{v:.1f}"
    fans, rays, dots, nodes = [], [], [], []
    a, last_q = GAP_Q / 2, 0
    for qi, g in groups:
        if qi != last_q:
            a += GAP_Q; last_q = qi
        a += GAP_G / 2
        angs = []
        for b in g["biases"]:
            angs.append(a + step / 2); a += step
        mid = sum(angs) / len(angs)
        a += GAP_G / 2
        col = QC[qi]
        x0, y0 = pol(R_HUB, mid); c1x, c1y = pol(R_HUB + 26, mid); fx, fy = pol(R_FAN, mid); c2x, c2y = pol(R_FAN + 22, mid)
        for b, ang in zip(g["biases"], angs):
            c3x, c3y = pol(R_LEAF - 22, ang); lx, ly = pol(R_LEAF, ang)
            fans.append(f'<path d="M{f(x0)} {f(y0)}Q{f(c1x)} {f(c1y)} {f(fx)} {f(fy)}C{f(c2x)} {f(c2y)} {f(c3x)} {f(c3y)} {f(lx)} {f(ly)}" stroke="{col}"/>')
            dots.append(f'<circle cx="{f(lx)}" cy="{f(ly)}" r="1.9" fill="{col}"/>')
            r2 = min(R_RING - 8, R_RAY + 12 + len(b.get("en") or b["n"]) * 1.9)
            ax, ay = pol(R_RAY, ang); bx, by = pol(r2, ang)
            rays.append(f'<line x1="{f(ax)}" y1="{f(ay)}" x2="{f(bx)}" y2="{f(by)}" stroke="{col}"/>')
        nx, ny = pol(R_RING, mid)
        nodes.append(f'<circle cx="{f(nx)}" cy="{f(ny)}" r="4.5" fill="{C["bgBottom"]}" stroke="{col}" stroke-width="2"/>')
    s = 40 / 96
    stem, top, bot = PAD + 36 * s, 66 + 28 * s, 66 + 73 * s
    pmark = (f'<rect x="{PAD}" y="66" width="40" height="40" rx="{21 * s:.2f}" fill="url(#bar)"/>'
             f'<path d="M {stem:.2f} {bot:.2f} V {top:.2f} h {16.5 * s:.2f} a {15 * s:.2f} {15 * s:.2f} 0 0 1 0 {30 * s:.2f} H {stem:.2f}" '
             f'fill="none" stroke="#ffffff" stroke-width="{13.5 * s:.2f}" stroke-linecap="round" stroke-linejoin="round"/>')
    ts, lh = L["title_size"], round(L["title_size"] * 1.1)
    title_top = 252 if len(L["title_lines"]) == 2 else 222
    titles = "".join(f'<text x="{PAD}" y="{title_top + i * lh}" font-size="{ts}" font-weight="700" letter-spacing="-2" fill="{C["title"]}">{t}</text>'
                     for i, t in enumerate(L["title_lines"]))
    sub_top = title_top + (len(L["title_lines"]) - 1) * lh + 54
    subs = "".join(f'<text x="{PAD}" y="{sub_top + i * round(L["sub_size"] * 1.43)}" font-size="{L["sub_size"]}" fill="{C["muted"]}">{t}</text>'
                   for i, t in enumerate(L["sub"]))
    path = L["url"].replace("https://", "").rstrip("/")
    return f"""<svg width="{W}" height="{H}" viewBox="0 0 {W} {H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{C['bgTop']}"/><stop offset="1" stop-color="{C['bgBottom']}"/></linearGradient>
    <radialGradient id="glow" cx="{cx / W:.3f}" cy="{cy / H:.3f}" r="0.42"><stop offset="0" stop-color="{C['accent']}" stop-opacity="0.16"/><stop offset="1" stop-color="{C['accent']}" stop-opacity="0"/></radialGradient>
    <linearGradient id="bar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{C['accentSoft']}"/><stop offset="1" stop-color="{C['accent']}"/></linearGradient>
  </defs>
  <g font-family="{FONT}">
    <rect width="{W}" height="{H}" fill="url(#bg)"/>
    <rect width="{W}" height="{H}" fill="url(#glow)"/>
    <rect x="0" y="0" width="10" height="{H}" fill="url(#bar)"/>
    <circle cx="{cx}" cy="{cy}" r="{R_RING}" fill="none" stroke="{C['hairline']}" stroke-width="1.5"/>
    <g fill="none" stroke-width="1" stroke-opacity="0.38">{''.join(fans)}</g>
    <g stroke-width="2" stroke-linecap="round" stroke-opacity="0.85">{''.join(rays)}</g>
    {''.join(dots)}
    {''.join(nodes)}
    <circle cx="{cx}" cy="{cy}" r="{R_HUB - 4}" fill="{C['bgTop']}" stroke="{C['hairline']}" stroke-width="1.5"/>
    <text x="{cx}" y="{cy + 11}" text-anchor="middle" font-size="30" font-weight="700" letter-spacing="-1" fill="{C['title']}">188</text>
    {pmark}
    <text x="{PAD + 56}" y="96" font-size="30" font-weight="700" letter-spacing="-0.5" fill="{C['title']}">Downstream</text>
    {titles}
    {subs}
    <line x1="{PAD}" y1="560" x2="{W - 80}" y2="560" stroke="{C['hairline']}" stroke-width="1"/>
    <text x="{PAD}" y="598" font-size="26" font-weight="600" fill="{C['accent']}">{path}</text>
    <text x="{W - 80}" y="598" font-size="20" text-anchor="end" fill="{C['muted']}">{L['credit']}</text>
  </g>
</svg>
"""


def og_tags(data, L):
    og_dir = os.path.join(ROOT, "assets", "og")
    svg_path, png_path = os.path.join(og_dir, L["card"] + ".svg"), os.path.join(og_dir, L["card"] + ".png")
    open(svg_path, "w").write(card_svg(data, L))
    if shutil.which("rsvg-convert"):
        subprocess.run(["rsvg-convert", "-w", "1200", "-h", "630", svg_path, "-o", png_path], check=True)
    else:
        print("rsvg-convert not found (brew install librsvg); keeping the existing card PNG if there is one")
    if not os.path.exists(png_path):
        return ""
    v = hashlib.md5(open(png_path, "rb").read()).hexdigest()[:8]
    img = f"{SITE}/assets/og/{L['card']}.png?v={v}"
    return (f'<meta property="og:image" content="{img}">\n<meta property="og:image:width" content="1200">\n'
            f'<meta property="og:image:height" content="630">\n<meta property="og:image:alt" content="{L["name"]}">\n'
            f'<meta name="twitter:image" content="{img}">\n')


def page_for(lang, data, en_data):
    if lang != "en":  # links and slugs always use the English names
        for q, qe in zip(data, en_data):
            for g, ge in zip(q, qe):
                assert g["id"] == ge["id"] and len(g["biases"]) == len(ge["biases"]), (lang, g["id"])
                for b, be in zip(g["biases"], ge["biases"]):
                    b["en"] = be["n"]
    src = resolve(open(os.path.join(HERE, "page.src.html")).read(), lang)
    js = "const DATA = " + json.dumps(data, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/") + ";"
    return src.replace("/*__DATA__*/", js)


def site_html(lang, page, data):
    L = LANGS[lang]
    sw = L["switch"]
    tags = og_tags(data, L)
    site = re.sub(r"<title>.*?</title>", f"<title>{L['name']} &middot; Downstream</title>", page, count=1)
    site = (site
            .replace("<!--__HOME__-->", '<a class="home-link" href="/">&larr; Downstream</a>')
            .replace("<!--__LANG__-->", f'<a class="home-link lang-link" href="{sw["href"]}" hreflang="{sw["lang"]}" lang="{sw["lang"]}" title="{sw["title"]}" '
                     f'onclick="this.href=this.getAttribute(\'href\').split(\'#\')[0]+location.hash">{sw["label"]}</a>')
            .replace("<!--__BYLINE__-->", L["byline"]))
    head = f"""<!DOCTYPE html>
<html lang="{lang}" data-theme="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="description" content="{L['desc']}">
<meta name="author" content="Thanos Papangelis">
<link rel="canonical" href="{L['url']}">
<link rel="alternate" hreflang="en" href="{LANGS['en']['url']}">
<link rel="alternate" hreflang="el" href="{LANGS['el']['url']}">
<link rel="alternate" hreflang="x-default" href="{LANGS['en']['url']}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Downstream">
<meta property="og:locale" content="{'el_GR' if lang == 'el' else 'en_US'}">
<meta property="og:title" content="{L['name']}">
<meta property="og:description" content="{L['short']}">
<meta property="og:url" content="{L['url']}">
<meta name="twitter:card" content="{'summary_large_image' if tags else 'summary'}">
{tags}<meta name="twitter:title" content="{L['name']}">
<meta name="twitter:description" content="{L['short']}">
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
    return head + site[:split] + "\n</head>\n<body>\n" + site[split:] + "\n</body>\n</html>\n"


en_data = load([])
built = {"en": en_data, "el": load(["el"])}
for lang, data in built.items():
    if data is None:
        print(f"skipping {lang}: data/{lang}/ is incomplete")
        continue
    page = page_for(lang, data, en_data)
    if lang == "en" and "--fragment" in sys.argv:
        open(sys.argv[sys.argv.index("--fragment") + 1], "w").write(page.replace("<!--__LANG__-->", ""))
    out_dir = os.path.join(ROOT, LANGS[lang]["out"])
    os.makedirs(out_dir, exist_ok=True)
    open(os.path.join(out_dir, "index.html"), "w").write(site_html(lang, page, data))
    print(f"wrote {LANGS[lang]['out']}/index.html: {sum(len(g['biases']) for q in data for g in q)} entries")
