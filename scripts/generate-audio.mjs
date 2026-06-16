#!/usr/bin/env node
// Generate narration MP3s for each article using OpenAI TTS.
//
// Usage:
//   export OPENAI_API_KEY=sk-...
//   node scripts/generate-audio.mjs            # only missing files
//   node scripts/generate-audio.mjs --force    # regenerate everything
//   VOICE=onyx node scripts/generate-audio.mjs # pick a different voice
//
// Output: assets/audio/<slug>.mp3 (committed and served statically).

import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, basename } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const POSTS_DIR = join(ROOT, "posts");
const OUT_DIR = join(ROOT, "assets", "audio");

// Load secrets/config from a project-local .env (gitignored) if present,
// so you only set the key once and it works for every future run/post.
try {
  process.loadEnvFile(join(ROOT, ".env"));
} catch {
  // No .env file — fall back to the shell environment.
}

const FORCE = process.argv.includes("--force");
const DRY_RUN = process.argv.includes("--dry-run");
const INSTRUCTIONS =
  "Read this as a calm, thoughtful, clearly articulated essay. Use natural pacing with brief pauses between paragraphs. Warm and measured, not rushed.";

// Supported TTS providers. Switch with TTS_PROVIDER in .env (openai | xai).
const PROVIDERS = {
  openai: {
    url: "https://api.openai.com/v1/audio/speech",
    keyVar: "OPENAI_API_KEY",
    maxChars: 3800, // OpenAI speech input cap is ~4096 chars per request.
    defaultVoice: "alloy",
    paraSep: "\n\n", // plain paragraph break
    headPause: "", // OpenAI reads bracket tags literally, so keep none
    body: (text, voice) => ({
      model: process.env.TTS_MODEL || "gpt-4o-mini-tts",
      voice,
      input: text,
      instructions: INSTRUCTIONS,
      response_format: "mp3",
    }),
  },
  xai: {
    url: "https://api.x.ai/v1/tts",
    keyVar: "XAI_API_KEY",
    // Cap is 15,000, but smaller requests synthesize far faster and more
    // reliably; the per-post MP3 is concatenated from these chunks.
    maxChars: 2500,
    defaultVoice: "eve", // built-in: ara, eve, leo, rex, sal (or a cloned voice id)
    // Inline speech tags make delivery more expressive: a small beat between
    // sentences (added in extractText) and a longer beat between paragraphs
    // and before each new section.
    paraSep: " [long-pause] ",
    headPause: " [long-pause] ",
    body: (text, voice) => {
      const payload = { text, voice_id: voice, language: "en" };
      const speed = Number(process.env.SPEED);
      if (Number.isFinite(speed)) payload.speed = speed; // 0.7–1.5
      return payload;
    },
  },
};

const PROVIDER = (process.env.TTS_PROVIDER || "openai").toLowerCase();
const cfg = PROVIDERS[PROVIDER];
if (!cfg) {
  console.error(`Unknown TTS_PROVIDER "${PROVIDER}". Use "openai" or "xai".`);
  process.exit(1);
}

const API_KEY = process.env[cfg.keyVar];
const VOICE = process.env.VOICE || cfg.defaultVoice;
const MAX_CHARS = cfg.maxChars;

const ENTITIES = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&apos;": "'",
  "&mdash;": "\u2014",
  "&ndash;": "\u2013",
  "&rsquo;": "\u2019",
  "&lsquo;": "\u2018",
  "&ldquo;": "\u201C",
  "&rdquo;": "\u201D",
  "&hellip;": "\u2026",
  "&middot;": "\u00B7",
  "&larr;": "\u2190",
  "&nbsp;": " ",
};

function decodeEntities(s) {
  s = s.replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)));
  s = s.replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)));
  return s.replace(/&[a-z]+;/gi, (m) => (m in ENTITIES ? ENTITIES[m] : m));
}

function stripTags(html) {
  return html.replace(/<[^>]+>/g, "");
}

// Pull readable text from an article's block-level elements, in order.
function extractText(html) {
  const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
  const body = articleMatch ? articleMatch[1] : html;
  const blocks = [];
  const re = /<(h1|h2|h3|p|blockquote|li)\b([^>]*)>([\s\S]*?)<\/\1>/gi;
  let m;
  while ((m = re.exec(body)) !== null) {
    const tag = m[1].toLowerCase();
    const attrs = m[2] || "";
    // Start narration from the content: skip the title and the date line.
    if (tag === "h1") continue;
    if (/class\s*=\s*["'][^"']*\barticle-meta\b/.test(attrs)) continue;
    let text = decodeEntities(stripTags(m[3])).replace(/\s+/g, " ").trim();
    if (cfg.headPause) {
      // xAI only: a small beat between sentences (not after the final one).
      text = text.replace(/([.!?])\s+(?=["'A-Z])/g, "$1 [pause] ");
    }
    if (text) blocks.push({ tag, text });
  }
  // Add a longer beat before each new section heading (provider-aware).
  return blocks.map((b, i) => {
    if (cfg.headPause && i > 0 && (b.tag === "h2" || b.tag === "h3")) {
      return cfg.headPause + b.text;
    }
    return b.text;
  });
}

// Group paragraphs into chunks under the character cap, splitting long ones by sentence.
function chunk(blocks) {
  const chunks = [];
  let cur = "";
  const push = () => {
    if (cur.trim()) chunks.push(cur.trim());
    cur = "";
  };
  for (const block of blocks) {
    if (block.length > MAX_CHARS) {
      push();
      const sentences = block.match(/[^.!?]+[.!?]*\s*/g) || [block];
      for (const s of sentences) {
        if ((cur + s).length > MAX_CHARS) push();
        cur += s;
      }
      push();
      continue;
    }
    if ((cur + cfg.paraSep + block).length > MAX_CHARS) push();
    cur += (cur ? cfg.paraSep : "") + block;
  }
  push();
  return chunks;
}

async function synthesize(text) {
  let lastErr;
  for (let attempt = 1; attempt <= 3; attempt++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 60000); // don't hang forever
    try {
      const res = await fetch(cfg.url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cfg.body(text, VOICE)),
        signal: ctrl.signal,
      });
      if (!res.ok) {
        const detail = await res.text();
        throw new Error(`HTTP ${res.status}: ${detail.slice(0, 300)}`);
      }
      return Buffer.from(await res.arrayBuffer());
    } catch (err) {
      lastErr = err;
      if (attempt < 3) await new Promise((r) => setTimeout(r, 1500 * attempt));
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastErr;
}

async function main() {
  if (!API_KEY && !DRY_RUN) {
    console.error(`Missing ${cfg.keyVar}. Add it to .env or your environment.`);
    process.exit(1);
  }

  const files = readdirSync(POSTS_DIR).filter((f) => f.endsWith(".html"));
  console.log(
    `Found ${files.length} posts. Provider=${PROVIDER} Voice=${VOICE}${DRY_RUN ? " (dry run)" : ""}\n`
  );

  let grandChars = 0;
  for (const file of files) {
    const slug = basename(file, ".html");
    const outPath = join(OUT_DIR, `${slug}.mp3`);
    if (existsSync(outPath) && !FORCE && !DRY_RUN) {
      console.log(`= skip ${slug} (exists; use --force to regenerate)`);
      continue;
    }

    const html = readFileSync(join(POSTS_DIR, file), "utf8");
    const blocks = extractText(html);
    const chunks = chunk(blocks);
    const totalChars = chunks.reduce((n, c) => n + c.length, 0);
    grandChars += totalChars;

    if (DRY_RUN) {
      console.log(
        `\u2192 ${slug}: ${blocks.length} blocks, ${chunks.length} request(s), ${totalChars} chars`
      );
      console.log(`   preview: "${(blocks[0] || "").slice(0, 120)}..."`);
      continue;
    }

    process.stdout.write(
      `\u2192 ${slug}: ${blocks.length} blocks, ${chunks.length} request(s), ${totalChars} chars ... `
    );
    const buffers = [];
    for (const c of chunks) buffers.push(await synthesize(c));
    writeFileSync(outPath, Buffer.concat(buffers));
    console.log("done");
  }

  if (DRY_RUN) {
    const est = (grandChars / 1000) * 0.015;
    console.log(`\nTotal: ${grandChars} chars across all posts.`);
    console.log(`Rough cost estimate at $0.015/1k chars: ~$${est.toFixed(2)}.`);
  } else {
    console.log("\nAll audio generated in assets/audio/.");
  }
}

main().catch((err) => {
  console.error("\nFailed:", err.message);
  process.exit(1);
});
