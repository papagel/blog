// Build a single post with word-level audio highlighting.
//
//   node scripts/build-timed-post.mjs <slug> [--dry-run]
//
// For the given post it:
//   1. extracts the article content (skipping title + date),
//   2. synthesizes each paragraph separately via xAI TTS (with timestamps),
//   3. inserts real silence between paragraphs (more reliable than stacked
//      speech tags, which the model sometimes vocalizes or bridges over),
//   4. writes assets/audio/<slug>.mp3 and assets/audio/<slug>.timing.json,
//   5. rewrites the post body so each word is wrapped in a <span class="w">
//      and tags the <article> with data-timing.
//
// Requires: ffmpeg (brew install ffmpeg), XAI_API_KEY in .env

import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  existsSync,
  mkdtempSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { execFileSync } from "node:child_process";

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
const SAMPLE_RATE = 24000;
// Real silence between paragraphs / before section headings (seconds).
const PARA_SILENCE = Number(process.env.PARA_SILENCE) || 0.85;
const HEAD_SILENCE = Number(process.env.HEAD_SILENCE) || 1.2;
const SPEED = Number(process.env.SPEED);
const TAG_TOKEN = /^\[(pause|long-pause)\]$/;

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

function ensureFfmpeg() {
  try {
    execFileSync("ffmpeg", ["-version"], { stdio: "ignore" });
  } catch {
    console.error("Error: ffmpeg not found. Install with `brew install ffmpeg`.");
    process.exit(1);
  }
}

// Soften punctuation that tends to make xAI TTS invent bridge words or
// re-read a clause. Prefer commas over em dashes.
function normalizeForSpeech(text) {
  return text
    .replace(/\u2014\s*/g, ", ")
    .replace(/\u2013\s*/g, ", ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractBlocks(body) {
  const blocks = [];
  const re = /<(h1|h2|h3|p|blockquote|li)\b([^>]*)>([\s\S]*?)<\/\1>/gi;
  let m;
  while ((m = re.exec(body)) !== null) {
    const tag = m[1].toLowerCase();
    const attrs = m[2] || "";
    if (tag === "h1") continue;
    if (/class\s*=\s*["'][^"']*\barticle-meta\b/.test(attrs)) continue;
    const text = normalizeForSpeech(
      decodeEntities(stripTags(m[3])).replace(/\s+/g, " ").trim()
    );
    if (text) blocks.push({ tag, text });
  }
  return blocks;
}

// Light sentence pauses only after short beats. Pausing after every sentence
// makes the model lose the thread and invent connectors across the gap.
function withSentencePauses(text) {
  return text.replace(/([.!?])\s+(?=["'A-Z])/g, (match, punct, offset, full) => {
    const before = full.slice(0, offset);
    const sentence = (before.split(/[.!?]\s+/).pop() || before).trim();
    const words = sentence.split(/\s+/).filter(Boolean).length;
    return words <= 8 ? `${punct} [pause] ` : `${punct} `;
  });
}

function spokenText(block) {
  if (block.tag === "h2" || block.tag === "h3") return block.text;
  return withSentencePauses(block.text);
}

async function synthesizeTimed(text) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 180000);
    try {
      const payload = {
        text,
        voice_id: VOICE,
        language: "en",
        with_timestamps: true,
      };
      if (Number.isFinite(SPEED)) payload.speed = SPEED;
      const res = await fetch(URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
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

function mp3ToPcm(mp3Buf, workDir, label) {
  const mp3Path = join(workDir, `${label}.mp3`);
  const pcmPath = join(workDir, `${label}.pcm`);
  writeFileSync(mp3Path, mp3Buf);
  execFileSync(
    "ffmpeg",
    [
      "-y", "-hide_banner", "-loglevel", "error",
      "-i", mp3Path,
      "-f", "s16le", "-acodec", "pcm_s16le",
      "-ac", "1", "-ar", String(SAMPLE_RATE),
      pcmPath,
    ],
    { stdio: "ignore" }
  );
  return readFileSync(pcmPath);
}

function pcmToMp3(pcmBuf, outPath, workDir) {
  const pcmPath = join(workDir, "final.pcm");
  writeFileSync(pcmPath, pcmBuf);
  execFileSync(
    "ffmpeg",
    [
      "-y", "-hide_banner", "-loglevel", "error",
      "-f", "s16le", "-ar", String(SAMPLE_RATE), "-ac", "1",
      "-i", pcmPath,
      "-codec:a", "libmp3lame", "-q:a", "2",
      outPath,
    ],
    { stdio: "ignore" }
  );
}

function silencePcm(seconds) {
  return Buffer.alloc(Math.round(seconds * SAMPLE_RATE) * 2);
}

function pcmDuration(pcmBuf) {
  return pcmBuf.length / 2 / SAMPLE_RATE;
}

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
  const totalWords = blocks.reduce((n, b) => n + b.text.split(/\s+/).length, 0);

  console.log(
    `${SLUG}: ${blocks.length} paragraphs, ${totalWords} words` +
      ` (para silence ${PARA_SILENCE}s, heading ${HEAD_SILENCE}s)` +
      `${DRY_RUN ? " (dry run)" : ""}`
  );

  if (DRY_RUN) {
    console.log(`  first: "${spokenText(blocks[0]).slice(0, 140)}..."`);
    return;
  }

  if (!API_KEY) {
    console.error("Missing XAI_API_KEY in .env");
    process.exit(1);
  }
  ensureFfmpeg();

  return run(file, html, blocks);
}

async function run(file, html, blocks) {
  const workDir = mkdtempSync(join(tmpdir(), "blog-tts-"));
  const pcmParts = [];
  const timings = [];
  let offset = 0;

  try {
    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];
      const chunk = spokenText(block);
      const isHeading = block.tag === "h2" || block.tag === "h3";

      if (i > 0) {
        const gap = isHeading ? HEAD_SILENCE : PARA_SILENCE;
        pcmParts.push(silencePcm(gap));
        offset += gap;
      }

      process.stdout.write(
        `  ${String(i + 1).padStart(2)}/${blocks.length} ${isHeading ? "h2" : "p "} ... `
      );
      const payload = await synthesizeTimed(chunk);
      const mp3Buf = Buffer.from(payload.audio, "base64");
      const pcm = mp3ToPcm(mp3Buf, workDir, `part-${i}`);
      const measured = pcmDuration(pcm);
      const apiDur =
        typeof payload.duration === "number" && payload.duration > 0
          ? payload.duration
          : measured;
      const scale = measured / apiDur;

      const ts = payload.audio_timestamps;
      const times = ts ? ts.graph_times : null;
      const len = ts ? ts.graph_chars.length : 0;
      if (!times || len === 0 || len !== chunk.length) {
        process.stdout.write("(est) ");
      }

      const tokenRe = /\S+/g;
      let m;
      while ((m = tokenRe.exec(chunk)) !== null) {
        if (TAG_TOKEN.test(m[0])) continue;
        const s = m.index;
        const e = m.index + m[0].length - 1;
        let start;
        let end;
        if (times && len === chunk.length) {
          start = times[s][0] * scale + offset;
          end = times[e][1] * scale + offset;
        } else {
          start = (s / chunk.length) * measured + offset;
          end = ((e + 1) / chunk.length) * measured + offset;
        }
        timings.push([
          Math.round(start * 1000) / 1000,
          Math.round(end * 1000) / 1000,
        ]);
      }

      pcmParts.push(pcm);
      offset += measured;
      console.log(`done (${measured.toFixed(1)}s)`);
    }

    if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });
    const mp3Path = join(OUT_DIR, `${SLUG}.mp3`);
    const timingPath = join(OUT_DIR, `${SLUG}.timing.json`);
    pcmToMp3(Buffer.concat(pcmParts), mp3Path, workDir);
    writeFileSync(timingPath, JSON.stringify(timings));

    const audioCloseIdx = html.indexOf("</div>", html.indexOf("</audio>"));
    const contentStart = audioCloseIdx + "</div>".length;
    const articleClose = html.lastIndexOf("</article>");
    let before = html.slice(0, contentStart);
    const content = html.slice(contentStart, articleClose);
    const after = html.slice(articleClose);

    let wrapped;
    if (/class="w"/.test(content)) {
      const existing = (content.match(/class="w"/g) || []).length;
      if (existing !== timings.length) {
        console.log(
          `  ! span/timing mismatch: ${existing} existing spans vs ${timings.length} timed`
        );
      } else {
        console.log(`  reusing ${existing} existing word spans`);
      }
      wrapped = content;
    } else {
      let gi = 0;
      wrapped = content.replace(/<[^>]+>|[^<]+/g, (seg) => {
        if (seg[0] === "<") return seg;
        return seg.replace(/\S+/g, (w) => `<span class="w" data-i="${gi++}">${w}</span>`);
      });
      if (gi !== timings.length) {
        console.log(
          `  ! word count mismatch: ${gi} wrapped vs ${timings.length} timed`
        );
      }
    }

    before = before.replace(
      /<article\b[^>]*>/i,
      `<article data-timing="/assets/audio/${SLUG}.timing.json">`
    );

    let out = before + wrapped + after;
    out = out.replace(/\/js\/audio\.js(\?v=\d+)?/, "/js/audio.js?v=6");
    writeFileSync(file, out);

    console.log(
      `\nWrote ${mp3Path}\n      ${timingPath} (${timings.length} words)\n      ${file}`
    );
    console.log(`Audio duration ~${Math.round(offset)}s.`);
  } finally {
    rmSync(workDir, { recursive: true, force: true });
  }
}

main();
