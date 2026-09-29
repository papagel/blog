// Narration for the animated explainers, one clip per step plus one for the end screen.
// Uses the blog's text-to-speech providers (xAI or OpenAI, keys in .env, as in
// scripts/generate-audio.mjs and build-timed-post.mjs). Each language can use its own
// provider and voice: TTS_PROVIDER_EN / TTS_PROVIDER_EL and VOICE_EN / VOICE_EL override
// TTS_PROVIDER and VOICE. Without a key there is no narration and the videos get sound
// effects only. --draft uses the macOS voices, for timing tests only (never publish them).
//
// Usage: node scripts/biases/narrate.mjs <scene> [<scene>...] [--force] [--draft]
// Output: scripts/biases/narration/<scene>/<lang>/NN.mp3 and manifest.json
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import os from "node:os";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, "..", "..");
try { process.loadEnvFile(path.join(ROOT, ".env")); } catch {}

const FORCE = process.argv.includes("--force");
const keys = process.argv.slice(2).filter(a => !a.startsWith("--"));
const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(HERE, "anim.js"), "utf8"), ctx);
const SCENES = ctx.window.BiasAnim.SCENES;

const DRAFT = process.argv.includes("--draft");
const env = (name, lang) => process.env[`${name}_${lang.toUpperCase()}`] || process.env[name] || "";
function providerFor(lang) {
  const want = env("TTS_PROVIDER", lang).toLowerCase();
  if (want === "xai" && process.env.XAI_API_KEY) return "xai";
  if (want === "openai" && process.env.OPENAI_API_KEY) return "openai";
  if (process.env.XAI_API_KEY) return "xai";
  if (process.env.OPENAI_API_KEY) return "openai";
  return DRAFT ? "say" : null;
}
const VOICE = {
  openai: lang => env("VOICE", lang) || "alloy",
  xai: lang => env("VOICE", lang) || "eve",
  say: lang => (lang === "el" ? "Melina" : "Samantha"),
};
const INSTRUCTIONS = "Friendly, clear explainer voice for a short educational video. Natural pace, warm and a little upbeat. Brief pauses at commas and ellipses.";

async function speak(provider, text, lang, out) {
  const voice = VOICE[provider](lang);
  if (provider === "say") {
    const aiff = path.join(os.tmpdir(), `narr-${process.pid}.aiff`);
    execFileSync("say", ["-v", voice, "-r", lang === "el" ? "165" : "178", "-o", aiff, text]);
    execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", aiff, "-ar", "44100", "-ac", "1", "-b:a", "128k", out]);
    fs.rmSync(aiff, { force: true });
    return;
  }
  const req = provider === "openai"
    ? { url: "https://api.openai.com/v1/audio/speech", key: process.env.OPENAI_API_KEY,
        body: { model: process.env.TTS_MODEL || "gpt-4o-mini-tts", voice, input: text, instructions: INSTRUCTIONS, response_format: "mp3" } }
    : { url: "https://api.x.ai/v1/tts", key: process.env.XAI_API_KEY,
        body: { text, voice_id: voice, language: lang } };
  const res = await fetch(req.url, { method: "POST", headers: { Authorization: `Bearer ${req.key}`, "Content-Type": "application/json" }, body: JSON.stringify(req.body) });
  if (!res.ok) throw new Error(`${provider} TTS failed: ${res.status} ${await res.text()}`);
  fs.writeFileSync(out, Buffer.from(await res.arrayBuffer()));
}

for (const key of keys) {
  const scene = SCENES[key];
  if (!scene) { console.error(`unknown scene ${key}`); process.exitCode = 1; continue; }
  for (const lang of Object.keys(scene.text)) {
    const lines = scene.text[lang].say;
    if (!lines) continue;
    const dir = path.join(HERE, "narration", key, lang);
    const provider = providerFor(lang);
    if (!provider) {
      fs.rmSync(dir, { recursive: true, force: true });
      console.log(`narration ${key}/${lang}: skipped, no XAI_API_KEY or OPENAI_API_KEY in .env (videos get sound effects only)`);
      continue;
    }
    fs.mkdirSync(dir, { recursive: true });
    const mfPath = path.join(dir, "manifest.json");
    const old = fs.existsSync(mfPath) ? JSON.parse(fs.readFileSync(mfPath, "utf8")) : {};
    const voice = VOICE[provider](lang);
    const files = [];
    let made = 0;
    for (let i = 0; i < lines.length; i++) {
      const file = `${String(i + 1).padStart(2, "0")}.mp3`, out = path.join(dir, file);
      const same = !FORCE && old.provider === provider && old.voice === voice && old.lines?.[i] === lines[i] && fs.existsSync(out);
      if (!same) { await speak(provider, lines[i], lang, out); made++; }
      files.push(file);
    }
    for (const f of fs.readdirSync(dir)) if (f.endsWith(".mp3") && !files.includes(f)) fs.rmSync(path.join(dir, f));
    fs.writeFileSync(mfPath, JSON.stringify({ provider, voice, lines, files }, null, 1) + "\n");
    console.log(`narration ${key}/${lang}: ${made ? `made ${made} clip(s)` : "up to date"} with ${provider} (${voice})`);
  }
}
