// Records the animated explainers with headless Chrome: social-card PNGs and MP4 videos.
// Each page exposes window.__bp = { total, cardAt, finalAt, seek(ms) } in capture mode, so every
// frame is rendered at an exact time instead of being filmed in real time.
//
// Usage: node capture.mjs jobs.json
//   jobs: [{ type: "png"|"mp4", url, out, width, height, scale?, fps? }]
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const jobs = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const sleep = ms => new Promise(r => setTimeout(r, ms));

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
    const loaded = new Promise(res => { const f = m => { if (m.method === "Page.loadEventFired") { listeners.delete(f); res(); } }; listeners.add(f); });
    await send("Page.navigate", { url: job.url });
    await loaded;
    await run("document.fonts.ready.then(() => new Promise(r => setTimeout(r, 400)))");
    await run("new Promise((r, j) => { let n = 0; const c = () => window.__bp ? r() : ++n > 100 ? j(new Error('no player')) : setTimeout(c, 50); c(); })");

    if (job.type === "png") {
      await run("__bp.seek(__bp.finalAt)");
      const png = await send("Page.captureScreenshot", { format: "png" });
      fs.writeFileSync(job.out, Buffer.from(png.data, "base64"));
    } else {
      const fps = job.fps || 30;
      const end = await run("__bp.cardAt + 5200");            // stop on the end screen, before the loop fade
      const frames = Math.ceil(end / 1000 * fps);
      const ff = spawn("ffmpeg", ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(fps), "-i", "-",
        "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "20", "-preset", "medium", "-movflags", "+faststart", job.out],
        { stdio: ["pipe", "inherit", "inherit"] });
      const done = new Promise((res, rej) => ff.on("close", c => (c === 0 ? res() : rej(new Error("ffmpeg exited " + c)))));
      for (let i = 0; i < frames; i++) {
        await run(`__bp.seek(${(i * 1000 / fps).toFixed(3)})`);
        if (!ff.stdin.write(await shot())) await new Promise(r => ff.stdin.once("drain", r));
      }
      ff.stdin.end();
      await done;
    }
    console.log(`recorded ${path.basename(job.out)} in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  }
  ws.close();
} finally {
  chrome.kill();
  fs.rmSync(profile, { recursive: true, force: true });
}
