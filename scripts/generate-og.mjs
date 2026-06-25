// Generates a branded social-share card (1200x630 PNG) for the homepage and
// every article, then points each page's og:image / twitter:image at its own
// card so shared links carry the site's visual identity and the article title
// as the headline message.
//
// Requires `rsvg-convert` (brew install librsvg) to rasterize SVG -> PNG.
//
// Usage: node scripts/generate-og.mjs
//        node scripts/generate-og.mjs --check   (verify rsvg-convert is present)

import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  existsSync,
  globSync,
} from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(ROOT, "assets", "og");
const SITE = "https://papangelis.com";

// --- Brand palette (mirrors the site's dark theme in css/style.css) ---
const C = {
  bgTop: "#17171b",
  bgBottom: "#0d0d0f",
  accent: "#6ea8fe",
  accentSoft: "#93bbff",
  title: "#f4f4f6",
  muted: "#9a9aa3",
  hairline: "#2a2a2e",
};

const FONT =
  "'Helvetica Neue', Helvetica, Arial, sans-serif";

function ensureRsvg() {
  try {
    execFileSync("rsvg-convert", ["--version"], { stdio: "ignore" });
  } catch {
    console.error(
      "Error: `rsvg-convert` not found. Install it with `brew install librsvg`."
    );
    process.exit(1);
  }
}

function metaContent(html, property) {
  // Handles both inline and multi-line meta tags, property before content.
  const re = new RegExp(
    `<meta\\s+(?:property|name)="${property}"[\\s\\S]*?content="([^"]*)"`,
    "i"
  );
  const m = html.match(re);
  return m ? m[1] : null;
}

const ENTITIES = {
  "&mdash;": "\u2014",
  "&ndash;": "\u2013",
  "&#8212;": "\u2014",
  "&#8211;": "\u2013",
  "&rsquo;": "\u2019",
  "&lsquo;": "\u2018",
  "&ldquo;": "\u201c",
  "&rdquo;": "\u201d",
  "&middot;": "\u00b7",
  "&hellip;": "\u2026",
  "&nbsp;": " ",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
  "&amp;": "&",
};

function decodeEntities(s) {
  if (!s) return "";
  return s
    .replace(/&[a-z]+;|&#\d+;/gi, (m) => ENTITIES[m] ?? m)
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)));
}

function xmlEscape(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Rough glyph-advance estimate for line wrapping (bold sans ~0.56em average).
function textWidth(text, size, weight) {
  const factor = weight >= 700 ? 0.57 : 0.52;
  return text.length * size * factor;
}

function wrapToWidth(text, size, weight, maxWidth) {
  const words = text.split(/\s+/);
  const lines = [];
  let line = "";
  for (const word of words) {
    const trial = line ? `${line} ${word}` : word;
    if (textWidth(trial, size, weight) > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = trial;
    }
  }
  if (line) lines.push(line);
  return lines;
}

// Pick the largest headline size that fits in <= maxLines.
function fitHeadline(text, maxWidth, maxLines, sizes) {
  for (const size of sizes) {
    const lines = wrapToWidth(text, size, 700, maxWidth);
    if (lines.length <= maxLines) return { size, lines };
  }
  const size = sizes[sizes.length - 1];
  return { size, lines: wrapToWidth(text, size, 700, maxWidth) };
}

function svgFor({ headline, subhead, footerRight, isHome }) {
  const W = 1200;
  const H = 630;
  const PAD = 90;
  const usable = W - PAD - 80;

  const headSizes = isHome ? [104, 92, 80] : [86, 76, 66, 58];
  const maxLines = isHome ? 2 : 3;
  const { size: hSize, lines: hLines } = fitHeadline(
    headline,
    usable,
    maxLines,
    headSizes
  );
  const lineHeight = Math.round(hSize * 1.12);

  // Vertically center the headline block in the available canvas.
  const blockHeight = hLines.length * lineHeight;
  let startY = Math.round((H - blockHeight) / 2) + hSize - 14;

  const headlineTspans = hLines
    .map((ln, i) => {
      const y = startY + i * lineHeight;
      return `<text x="${PAD}" y="${y}" font-size="${hSize}" font-weight="700" letter-spacing="-1.5" fill="${C.title}">${xmlEscape(
        ln
      )}</text>`;
    })
    .join("\n    ");

  let subheadSvg = "";
  if (subhead && hLines.length <= 2) {
    const subLines = wrapToWidth(subhead, 30, 400, usable).slice(0, 2);
    const subStartY = startY + (hLines.length - 1) * lineHeight + 64;
    subheadSvg = subLines
      .map(
        (ln, i) =>
          `<text x="${PAD}" y="${subStartY + i * 42}" font-size="30" font-weight="400" fill="${C.muted}">${xmlEscape(
            ln
          )}</text>`
      )
      .join("\n    ");
  }

  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${C.bgTop}"/>
      <stop offset="1" stop-color="${C.bgBottom}"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.85" cy="0.12" r="0.7">
      <stop offset="0" stop-color="${C.accent}" stop-opacity="0.20"/>
      <stop offset="1" stop-color="${C.accent}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="bar" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${C.accentSoft}"/>
      <stop offset="1" stop-color="${C.accent}"/>
    </linearGradient>
  </defs>
  <g font-family="${FONT}">
    <rect width="${W}" height="${H}" fill="url(#bg)"/>
    <rect width="${W}" height="${H}" fill="url(#glow)"/>
    <rect x="0" y="0" width="10" height="${H}" fill="url(#bar)"/>

    <g>
      <rect x="${PAD}" y="78" width="22" height="22" rx="5" fill="url(#bar)"/>
      <text x="${PAD + 36}" y="96" font-size="30" font-weight="700" letter-spacing="-0.5" fill="${C.title}">Downstream</text>
    </g>

    ${headlineTspans}
    ${subheadSvg}

    <line x1="${PAD}" y1="540" x2="${W - 80}" y2="540" stroke="${C.hairline}" stroke-width="1"/>
    <text x="${PAD}" y="578" font-size="26" font-weight="600" fill="${C.accent}">papangelis.com</text>
    ${footerRight
      ? `<text x="${W - 80}" y="578" font-size="24" font-weight="400" text-anchor="end" fill="${C.muted}">${xmlEscape(
          footerRight
        )}</text>`
      : ""}
  </g>
</svg>`;
}

function stripSiteSuffix(title) {
  return title
    .replace(/\s*[\u00b7\u2014\u2013|-]\s*Downstream\s*$/i, "")
    .trim();
}

function slugFor(file) {
  const base = basename(file).replace(/\.html$/, "");
  if (base === "index") return "home";
  return base;
}

function run() {
  ensureRsvg();
  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

  const files = [
    "index.html",
    "about.html",
    ...globSync("posts/*.html", { cwd: ROOT }),
  ];

  const results = [];

  for (const rel of files) {
    const file = join(ROOT, rel);
    let html = readFileSync(file, "utf8");

    const ogType = metaContent(html, "og:type") || "website";
    const isHome = slugFor(rel) === "home";
    const rawTitle = metaContent(html, "og:title") || "";
    const rawDesc = metaContent(html, "og:description") || "";

    const headline = isHome
      ? "Downstream"
      : stripSiteSuffix(decodeEntities(rawTitle));
    const subhead = decodeEntities(rawDesc);

    const slug = slugFor(rel);
    const svg = svgFor({
      headline,
      subhead: isHome ? subhead : ogType === "article" ? subhead : "",
      footerRight: "",
      isHome,
    });

    const svgPath = join(OUT_DIR, `${slug}.svg`);
    const pngPath = join(OUT_DIR, `${slug}.png`);
    writeFileSync(svgPath, svg);
    execFileSync("rsvg-convert", [
      "-w",
      "1200",
      "-h",
      "630",
      svgPath,
      "-o",
      pngPath,
    ]);

    // Rewire the page's social image + alt to its own card.
    const imageUrl = `${SITE}/assets/og/${slug}.png`;
    const altText = isHome ? "Downstream" : headline;
    const before = html;
    html = html.replace(
      /(<meta\s+property="og:image"\s+content=")[^"]*(")/i,
      `$1${imageUrl}$2`
    );
    html = html.replace(
      /(<meta\s+name="twitter:image"\s+content=")[^"]*(")/i,
      `$1${imageUrl}$2`
    );
    html = html.replace(
      /(<meta\s+property="og:image:alt"\s+content=")[^"]*(")/i,
      `$1${xmlEscape(altText)}$2`
    );
    if (html !== before) writeFileSync(file, html);

    results.push({ slug, headline });
    console.log(`og card -> assets/og/${slug}.png   (${headline})`);
  }

  console.log(`\nGenerated ${results.length} social cards.`);
}

run();
