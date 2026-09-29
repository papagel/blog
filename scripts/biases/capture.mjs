// Records the animated explainers with headless Chrome: social-card PNGs and MP4 videos.
// Each page exposes window.__bp = { total, cardAt, finalAt, seek(ms) } in capture mode, so every
// frame is rendered at an exact time instead of being filmed in real time.
//
// Usage: node capture.mjs jobs.json
//   jobs: [{ type: "png"|"mp4", url, out, width, height, scale?, fps?, sfx?, narration? }]
//   sfx: folder of sound effects (made here if missing); narration: clips, one per step + end screen.
//   With narration, each step is stretched so its line fits before the next step starts.
import { spawn, execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const jobs = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const sleep = ms => new Promise(r => setTimeout(r, ms));
const LEAD = 250, TAIL = 500, OUT_LEAD = 350;          // narration timing around each step, in ms

// Sound effects, synthesized so there's nothing to license. ffmpeg lavfi sources.
const SFX = {
  pluck: "aevalsrc=exprs='0.32*sin(2*PI*392*t)*exp(-7*t)+0.1*sin(2*PI*784*t)*exp(-11*t)':d=0.8:s=44100",
  tick: "aevalsrc=exprs='0.28*sin(2*PI*1760*t)*exp(-70*t)':d=0.09:s=44100",
  pop: "aevalsrc=exprs='0.4*sin(2*PI*(420*t+20*(1-exp(-45*t))))*exp(-22*t)':d=0.25:s=44100",
  thud: "aevalsrc=exprs='0.95*sin(2*PI*(52*t+5*(1-exp(-18*t))))*exp(-8*t)':d=0.7:s=44100",
  whoosh: "anoisesrc=d=1.5:c=pink:r=44100:a=0.6,highpass=f=180,lowpass=f=1100,afade=t=in:d=0.55:curve=qsin,afade=t=out:st=0.75:d=0.75,volume=0.32",
  spring: "aevalsrc=exprs='0.28*sin(2*PI*230*t+3*sin(2*PI*9*t))*exp(-3.6*t)':d=0.9:s=44100",
  scribble: "anoisesrc=d=0.55:c=white:r=44100:a=0.5,bandpass=f=3600:width_type=h:w=2600,tremolo=f=15:d=0.9,afade=t=in:d=0.05,afade=t=out:st=0.3:d=0.25,volume=0.2",
  chime: "aevalsrc=exprs='0.2*(sin(2*PI*880*t)+0.6*sin(2*PI*1318.5*t)+0.3*sin(2*PI*1760*t))*exp(-2.8*t)':d=1.7:s=44100",
  swell: "aevalsrc=exprs='0.13*(sin(2*PI*523.25*t)+sin(2*PI*659.25*t)+sin(2*PI*783.99*t))*(1-exp(-6*t))*exp(-1.2*t)':d=2.8:s=44100"
};
function ensureSfx(dir) {
  fs.mkdirSync(dir, { recursive: true });
  for (const [name, src] of Object.entries(SFX)) {
    const out = path.join(dir, name + ".wav");
    if (!fs.existsSync(out)) execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-f", "lavfi", "-i", src, "-ac", "1", out]);
  }
}
const durationMs = file => 1000 * Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file]).toString().trim());

const port = 9400 + Math.floor(Math.random() * 400);
const profile = fs.mkdtempSync(path.join(os.tmpdir(), "bias-capture-"));
const chrome = spawn(CHROME, [
  "--headless=new", `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`,
  "--hide-scrollbars", "--force-color-profile=srgb", "--no-first-run", "--no-default-browser-check",
  "--allow-file-access-from-files", "about:blank"
], { stdio: "ignore" });

async function pageTarget() {
  for (let i = 0; i < 100; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
      const p = list.find(t => t.type === "page");
      if (p) return p;
      // some Chrome setups open a profile picker instead of a tab: open one ourselves
      if (list.length) return await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: "PUT" })).json();
    } catch {}
    await sleep(150);
  }
  throw new Error("Chrome did not start");
}

try {
  const ws = new WebSocket((await pageTarget()).webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  let seq = 0;
  const pending = new Map(), listeners = new Set();
  ws.onmessage = ev => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) {
      const { res, rej } = pending.get(m.id); pending.delete(m.id);
      m.error ? rej(new Error(m.error.message)) : res(m.result);
    } else if (m.method) listeners.forEach(f => f(m));
  };
  const send = (method, params = {}) => new Promise((res, rej) => {
    const id = ++seq; pending.set(id, { res, rej }); ws.send(JSON.stringify({ id, method, params }));
  });
  const run = async expression => {
    const r = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
    return r.result.value;
  };
  const shot = async () => Buffer.from((await send("Page.captureScreenshot", { format: "jpeg", quality: 94 })).data, "base64");

  await send("Page.enable");
  for (const job of jobs) {
    const t0 = Date.now();
    await send("Emulation.setDeviceMetricsOverride", { width: job.width, height: job.height, deviceScaleFactor: job.scale || 2, mobile: false });
    const load = async url => {
      const loaded = new Promise(res => { const f = m => { if (m.method === "Page.loadEventFired") { listeners.delete(f); res(); } }; listeners.add(f); });
      await send("Page.navigate", { url });
      await loaded;
      await run("document.fonts.ready.then(() => new Promise(r => setTimeout(r, 400)))");
      await run("new Promise((r, j) => { let n = 0; const c = () => window.__bp ? r() : ++n > 100 ? j(new Error('no player')) : setTimeout(c, 50); c(); })");
    };
    await load(job.url);

    if (job.type === "png") {
      await run("__bp.seek(__bp.finalAt)");
      const png = await send("Page.captureScreenshot", { format: "png" });
      fs.writeFileSync(job.out, Buffer.from(png.data, "base64"));
    } else {
      const fps = job.fps || 30;
      const narration = (job.narration || []).filter(f => fs.existsSync(f));
      let durs = [];
      if (narration.length) {
        durs = narration.map(durationMs);
        const motion = await run("__bp.motion"), defaults = await run("__bp.holdsDefault"), n = motion.length;
        const holds = motion.map((m, i) => Math.max(defaults[i], Math.ceil(LEAD + (durs[i] || 0) + TAIL - m)));
        const cardHold = Math.max(6000, Math.ceil(OUT_LEAD + (durs[n] || 0) + 900));
        await load(`${job.url}&holds=${holds.join(",")}&cardhold=${cardHold}`);
      }
      const tl = await run("({ total: __bp.total, cardAt: __bp.cardAt, starts: __bp.starts, cues: __bp.cues })");
      const end = tl.total - 500;                              // stop on the end screen, before the loop fade
      const frames = Math.ceil(end / 1000 * fps);
      const silent = job.out.replace(/\.mp4$/, ".silent.mp4");
      const ff = spawn("ffmpeg", ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(fps), "-i", "-",
        "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "20", "-preset", "medium", silent],
        { stdio: ["pipe", "inherit", "inherit"] });
      const done = new Promise((res, rej) => ff.on("close", c => (c === 0 ? res() : rej(new Error("ffmpeg exited " + c)))));
      for (let i = 0; i < frames; i++) {
        await run(`__bp.seek(${(i * 1000 / fps).toFixed(3)})`);
        if (!ff.stdin.write(await shot())) await new Promise(r => ff.stdin.once("drain", r));
      }
      ff.stdin.end();
      await done;

      // audio: sound effects at their cues, narration at the start of each step and on the end screen
      const clips = [];
      if (job.sfx) {
        ensureSfx(job.sfx);
        for (const c of tl.cues) clips.push({ file: path.join(job.sfx, c.name + ".wav"), at: c.t, vol: narration.length ? 0.7 : 0.9 });
      }
      narration.forEach((f, i) => clips.push({ file: f, at: i < tl.starts.length ? tl.starts[i] + LEAD : tl.cardAt + OUT_LEAD, vol: 1 }));
      if (clips.length) {
        const args = ["-y", "-loglevel", "error", "-i", silent];
        clips.forEach(c => args.push("-i", c.file));
        const chains = clips.map((c, i) => `[${i + 1}:a]aformat=sample_rates=44100:channel_layouts=mono,adelay=${Math.round(c.at)}:all=1,volume=${c.vol}[a${i}]`);
        const mix = `${clips.map((_, i) => `[a${i}]`).join("")}amix=inputs=${clips.length}:normalize=0:duration=longest,alimiter=limit=0.92,aformat=channel_layouts=stereo[aout]`;
        args.push("-filter_complex", [...chains, mix].join(";"), "-map", "0:v", "-map", "[aout]", "-c:v", "copy",
          "-c:a", "aac", "-b:a", "160k", "-t", (end / 1000).toFixed(3), "-movflags", "+faststart", job.out);
        execFileSync("ffmpeg", args, { stdio: "inherit" });
        fs.rmSync(silent);
      } else {
        fs.renameSync(silent, job.out);
      }
    }
    console.log(`recorded ${path.basename(job.out)} in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  }
  ws.close();
} finally {
  chrome.kill();
  fs.rmSync(profile, { recursive: true, force: true });
}
