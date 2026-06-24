// Prototype: build a single post with word-level audio highlighting.
//
//   node scripts/build-timed-post.mjs <slug> [--dry-run]
//
// For the given post it:
//   1. extracts the article content (skipping title + date),
//   2. sends it to xAI TTS with `with_timestamps` to get per-character timing,
//   3. writes assets/audio/<slug>.mp3 and assets/audio/<slug>.timing.json
//      (an array of [start, end] seconds per word, in document order),
//   4. rewrites the post body so each word is wrapped in a <span class="w">
//      and tags the <article> with data-timing.
//
// The player (js/audio.js) reads the timing file and highlights the word
// currently being spoken. This mirrors generate-audio.mjs so the audio and
// pacing match the other posts.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const POSTS_DIR = join(ROOT, "posts");
const OUT_DIR = join(ROOT, "assets", "audio");

try {
  process.loadEnvFile(join(ROOT, ".env"));
} catch {}

const SLUG = process.argv[2];
const DRY_RUN = process.argv.includes("--dry-run");
if (!SLUG || SLUG.startsWith("--")) {
  console.error("Usage: node scripts/build-timed-post.mjs <slug> [--dry-run]");
  process.exit(1);
}

const API_KEY = process.env.XAI_API_KEY;
const VOICE = process.env.VOICE || "leo";
const URL = "https://api.x.ai/v1/tts";
// Larger cap so a normal-length post is a single TTS request (no seams at all).
// Only long posts get split; xAI's hard cap is ~15,000 chars per request.
const MAX_CHARS = 4800;
const PARA_SEP = " [long-pause] ";
const SENT_PAUSE = " [pause] ";
// Prepended to every chunk after the first so the join between independently
// encoded MP3 chunks lands inside silence, where the concat seam is inaudible.
const LEAD_PAUSE = "[long-pause] ";

const ENTITIES = {
  "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&apos;": "'",
  "&mdash;": "\u2014", "&ndash;": "\u2013", "&rsquo;": "\u2019",
  "&lsquo;": "\u2018", "&ldquo;": "\u201C", "&rdquo;": "\u201D",
  "&hellip;": "\u2026", "&middot;": "\u00B7", "&larr;": "\u2190", "&nbsp;": " ",
};

function decodeEntities(s) {
  s = s.replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)));
  s = s.replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)));
  return s.replace(/&[a-z]+;/gi, (m) => (m in ENTITIES ? ENTITIES[m] : m));
}

function stripTags(html) {
  return html.replace(/<[^>]+>/g, "");
}

function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Clean content blocks, in order, skipping the title and the date line.
function extractBlocks(body) {
  const blocks = [];
  const re = /<(h1|h2|h3|p|blockquote|li)\b([^>]*)>([\s\S]*?)<\/\1>/gi;
  let m;
  while ((m = re.exec(body)) !== null) {
    const tag = m[1].toLowerCase();
    const attrs = m[2] || "";
    if (tag === "h1") continue;
    if (/class\s*=\s*["'][^"']*\barticle-meta\b/.test(attrs)) continue;
    const text = decodeEntities(stripTags(m[3])).replace(/\s+/g, " ").trim();
    if (text) blocks.push({ tag, text });
  }
  return blocks;
}

// Insert a sentence pause, matching generate-audio.mjs.
function withSentencePauses(text) {
  return text.replace(/([.!?])\s+(?=["'A-Z])/g, "$1 [pause] ");
}

// Group blocks (with pause tags) into chunks under the char cap.
function chunkTexts(blocks) {
  const texts = blocks.map((b) => withSentencePauses(b.text));
  const chunks = [];
  let cur = "";
  const push = () => {
    if (cur.trim()) chunks.push(cur.trim());
    cur = "";
  };
  for (const t of texts) {
    if (t.length > MAX_CHARS) {
      push();
      const sentences = t.match(/[^.!?]+[.!?]*\s*/g) || [t];
      for (const s of sentences) {
        if ((cur + s).length > MAX_CHARS) push();
        cur += s;
      }
      push();
      continue;
    }
    if ((cur + PARA_SEP + t).length > MAX_CHARS) push();
    cur += (cur ? PARA_SEP : "") + t;
  }
  push();
  // Start every continuation chunk on a long pause so the raw-MP3 concat seam
  // sits in silence (masks the click/gap and avoids clipping the first word).
  return chunks.map((c, i) => (i === 0 ? c : LEAD_PAUSE + c));
}

async function synthesizeTimed(text) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 180000);
    try {
      const res = await fetch(URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          voice_id: VOICE,
          language: "en",
          with_timestamps: true,
        }),
        signal: ctrl.signal,
      });
      if (!res.ok) {
        const detail = await res.text();
        throw new Error(`HTTP ${res.status}: ${detail.slice(0, 300)}`);
      }
      return await res.json();
    } catch (err) {
      if (attempt === 3) throw err;
      await new Promise((r) => setTimeout(r, 1500 * attempt));
    } finally {
      clearTimeout(timer);
    }
  }
}

const TAG_TOKEN = /^\[(pause|long-pause)\]$/;

function main() {
  const file = join(POSTS_DIR, `${SLUG}.html`);
  if (!existsSync(file)) {
    console.error(`No such post: ${file}`);
    process.exit(1);
  }
  const html = readFileSync(file, "utf8");
  const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
  if (!articleMatch) {
    console.error("Could not find <article> in post.");
    process.exit(1);
  }
  const blocks = extractBlocks(articleMatch[1]);
  const chunks = chunkTexts(blocks);
  const totalWords = blocks.reduce((n, b) => n + b.text.split(/\s+/).length, 0);

  console.log(
    `${SLUG}: ${blocks.length} blocks, ${totalWords} words, ${chunks.length} request(s)${
      DRY_RUN ? " (dry run)" : ""
    }`
  );

  if (DRY_RUN) {
    console.log(`  first chunk: "${chunks[0].slice(0, 140)}..."`);
    return;
  }

  if (!API_KEY) {
    console.error("Missing XAI_API_KEY in .env");
    process.exit(1);
  }

  return run(file, html, blocks, chunks);
}

async function run(file, html, blocks, chunks) {
  const buffers = [];
  const timings = []; // [start, end] per word, document order
  let offset = 0; // cumulative seconds across chunks

  for (let ci = 0; ci < chunks.length; ci++) {
    const chunk = chunks[ci];
    process.stdout.write(`  request ${ci + 1}/${chunks.length} ... `);
    const payload = await synthesizeTimed(chunk);
    buffers.push(Buffer.from(payload.audio, "base64"));

    const ts = payload.audio_timestamps;
    const times = ts ? ts.graph_times : null;
    const len = ts ? ts.graph_chars.length : 0;
    const dur = typeof payload.duration === "number" ? payload.duration : 0;

    if (!times || len !== chunk.length) {
      console.log(
        `\n  ! timestamp/text length mismatch (${len} vs ${chunk.length}); using estimate`
      );
    }

    const tokenRe = /\S+/g;
    let m;
    while ((m = tokenRe.exec(chunk)) !== null) {
      if (TAG_TOKEN.test(m[0])) continue; // skip pause tags
      const s = m.index;
      const e = m.index + m[0].length - 1;
      let start, end;
      if (times && len === chunk.length) {
        start = times[s][0] + offset;
        end = times[e][1] + offset;
      } else {
        // proportional fallback
        start = (s / chunk.length) * dur + offset;
        end = ((e + 1) / chunk.length) * dur + offset;
      }
      timings.push([Math.round(start * 1000) / 1000, Math.round(end * 1000) / 1000]);
    }
    offset += dur;
    console.log("done");
  }

  // Write audio + timing.
  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });
  const mp3Path = join(OUT_DIR, `${SLUG}.mp3`);
  const timingPath = join(OUT_DIR, `${SLUG}.timing.json`);
  writeFileSync(mp3Path, Buffer.concat(buffers));
  writeFileSync(timingPath, JSON.stringify(timings));

  // Wrap each word in place, preserving inline tags (<em>, <a>, …) and
  // structural elements (<hr>). Only the content region (after the player,
  // before </article>) is touched, so the title, date, and player are intact.
  const audioCloseIdx = html.indexOf("</div>", html.indexOf("</audio>"));
  const contentStart = audioCloseIdx + "</div>".length;
  const articleClose = html.lastIndexOf("</article>");
  let before = html.slice(0, contentStart);
  const content = html.slice(contentStart, articleClose);
  const after = html.slice(articleClose);

  let wrapped;
  if (/class="w"/.test(content)) {
    // Already wrapped from a previous run: keep the spans (and any manual
    // fixes) intact and only refresh the audio + timing for them.
    const existing = (content.match(/class="w"/g) || []).length;
    if (existing !== timings.length) {
      console.log(
        `  ! span/timing mismatch: ${existing} existing spans vs ${timings.length} timed (highlight may drift)`
      );
    } else {
      console.log(`  reusing ${existing} existing word spans`);
    }
    wrapped = content;
  } else {
    let gi = 0;
    wrapped = content.replace(/<[^>]+>|[^<]+/g, (seg) => {
      if (seg[0] === "<") return seg; // tag: pass through untouched
      return seg.replace(/\S+/g, (w) => `<span class="w" data-i="${gi++}">${w}</span>`);
    });
    if (gi !== timings.length) {
      console.log(
        `  ! word count mismatch: ${gi} wrapped vs ${timings.length} timed (highlight may drift)`
      );
    }
  }

  // Tag the <article> with the timing file.
  before = before.replace(
    /<article\b[^>]*>/i,
    `<article data-timing="/assets/audio/${SLUG}.timing.json">`
  );

  let out = before + wrapped + after;
  // Make sure the updated player JS (with highlighting) loads.
  out = out.replace(/\/js\/audio\.js(\?v=\d+)?/, "/js/audio.js?v=6");

  writeFileSync(file, out);

  const totalDur = offset;
  console.log(
    `\nWrote ${mp3Path}\n      ${timingPath} (${timings.length} words)\n      ${file} (rewrapped)`
  );
  console.log(`Audio duration ~${Math.round(totalDur)}s.`);
}

main();
