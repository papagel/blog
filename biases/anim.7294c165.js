window.BiasAnimCSS = "/* Animated explainer player (see anim.js). Uses the explorer's colour and font tokens. */\n.bp{--bp-ctl:54px}\n.bp-stage{position:relative;background:var(--ground);border:1px solid var(--rule);border-radius:12px;overflow:hidden;display:flex;flex-direction:column}\n.bp-cap{display:flex;gap:10px;align-items:baseline;padding:14px 16px 0}\n.bp-no{font:500 11px/1 var(--mono);color:var(--faint);font-variant-numeric:tabular-nums;flex:none;min-width:2.4em}\n.bp-text{min-height:2.7em;font:600 16.5px/1.35 var(--display);margin:0;text-wrap:balance;color:var(--ink)}\n.bp-text b{color:var(--q);font-weight:600}\n.bp-svg{display:block;width:100%;height:auto}\n.bp-ctl{display:flex;align-items:center;gap:8px;padding:4px 12px 12px}\n.bp-btn{width:38px;height:38px;border-radius:50%;border:1px solid var(--rule);background:var(--surface);color:var(--ink);display:grid;place-items:center;cursor:pointer;flex:none;padding:0}\n.bp-btn:hover{border-color:var(--ink)}\n.bp-btn[aria-pressed=\"true\"]{color:var(--q);border-color:var(--q)}\n.bp-btn:focus-visible,.bp-dot:focus-visible,.bp-pill:focus-visible{outline:2px solid var(--q);outline-offset:2px}\n.bp-dots{display:flex;gap:5px;flex:1;min-width:0}\n.bp-dot{flex:1;height:6px;border-radius:3px;border:0;padding:0;background:var(--surface-2);cursor:pointer;position:relative;overflow:hidden}\n.bp-dot i{position:absolute;inset:0 auto 0 0;width:0;background:var(--q);border-radius:3px}\n.bp-brand{display:none}\n\n/* end screen */\n.bp-card{position:absolute;inset:0 0 var(--bp-ctl) 0;background:var(--ground);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:20px;text-align:center;opacity:0;pointer-events:none}\n.bp-card.on{pointer-events:auto}\n.bp-mark{width:40px;height:40px}\n.bp-name{font:700 28px/1.1 var(--display);letter-spacing:-.02em;margin:0;color:var(--ink);text-wrap:balance;max-width:22ch}\n.bp-line{font:400 16px/1.45 var(--serif);color:var(--muted);margin:0;max-width:30ch;text-wrap:balance}\n.bp-row{display:flex;gap:10px;flex-wrap:wrap;justify-content:center}\n.bp-pill{display:inline-flex;align-items:center;gap:8px;border:1px solid var(--rule);background:var(--surface);color:var(--ink);border-radius:999px;padding:10px 16px;font:500 13.5px/1 var(--mono);cursor:pointer}\n.bp-pill:hover{border-color:var(--ink)}\n.bp-pill.primary{background:var(--ink);color:var(--ground);border-color:var(--ink)}\n\n/* share menu */\n.bp-menu{position:absolute;right:10px;bottom:calc(var(--bp-ctl) + 6px);width:min(270px,calc(100% - 20px));background:var(--surface);border:1px solid var(--rule);border-radius:14px;box-shadow:0 18px 50px -18px rgba(20,28,36,.45);padding:8px;display:flex;flex-direction:column;z-index:3}\n.bp-menu[hidden]{display:none}\n.bp-mh{font:500 11px/1.3 var(--mono);letter-spacing:.08em;text-transform:uppercase;color:var(--muted);padding:6px 10px 8px}\n.bp-menu a,.bp-menu button{all:unset;box-sizing:border-box;display:flex;justify-content:space-between;align-items:center;gap:10px;padding:10px;border-radius:9px;font:500 14px/1.2 var(--display);color:var(--ink);cursor:pointer}\n.bp-menu a:hover,.bp-menu button:hover{background:var(--surface-2)}\n.bp-menu a:focus-visible,.bp-menu button:focus-visible{outline:2px solid var(--q)}\n.bp-menu small{font:500 10.5px/1 var(--mono);color:var(--faint)}\n.bp-menu small.ok{color:var(--good)}\n\n/* scene */\n.bp .ax{stroke:var(--rule);stroke-width:2}\n.bp .tick{stroke:var(--rule);stroke-width:1.5}\n.bp .tl{font:500 10px var(--mono);fill:var(--faint);text-anchor:middle}\n.bp .axt{font:500 10px var(--mono);fill:var(--faint)}\n.bp .house{fill:none;stroke:var(--ink);stroke-width:2.2;stroke-linejoin:round;stroke-linecap:round}\n.bp .tag line{stroke:var(--ink);stroke-width:1.4}\n.bp .tag rect{fill:var(--surface);stroke:var(--ink);stroke-width:1.6}\n.bp .tag text{font:700 15px var(--display);fill:var(--ink);text-anchor:middle}\n.bp .bubble rect{fill:var(--surface);stroke:var(--q);stroke-width:1.8}\n.bp .bubble path{fill:var(--surface);stroke:var(--q);stroke-width:1.8;stroke-linejoin:round}\n.bp .bubble text{font:600 13px var(--display);fill:var(--ink);text-anchor:middle}\n.bp .anchor{fill:none;stroke:var(--q);stroke-width:2.6;stroke-linecap:round;stroke-linejoin:round}\n.bp .note{font:500 9.5px var(--mono);fill:var(--q);text-anchor:middle}\n.bp .rope{fill:none;stroke:var(--q);stroke-width:2;stroke-dasharray:1 5;stroke-linecap:round}\n.bp .arrow{fill:none;stroke:var(--q);stroke-width:2;stroke-linecap:round;stroke-linejoin:round}\n.bp .pin{--pin:var(--ink)} .bp .pin.p2{--pin:var(--good)}\n.bp .pin circle{fill:var(--pin)}\n.bp .pin line{stroke:var(--pin);stroke-width:2.2}\n.bp .pin text{font:600 11px var(--display);fill:var(--pin)}\n.bp .ghost circle{fill:none;stroke:var(--good);stroke-width:1.8;stroke-dasharray:3 3}\n.bp .ghost line{stroke:var(--good);stroke-width:1.6;stroke-dasharray:3 3}\n.bp .ghost text{font:600 11px var(--display);fill:var(--good);text-anchor:end}\n.bp .ghost .sub{font:500 9.5px var(--mono);fill:var(--muted)}\n.bp .gap line{stroke:var(--bad);stroke-width:1.8}\n.bp .gap text{font:600 11px var(--mono);fill:var(--bad);text-anchor:middle}\n.bp .band rect{fill:var(--good);opacity:.22}\n.bp .pad rect{fill:var(--surface);stroke:var(--good);stroke-width:1.6}\n.bp .pad .h{font:500 9px var(--mono);fill:var(--muted);text-anchor:middle}\n.bp .pad .v{font:700 13px var(--display);fill:var(--good);text-anchor:middle}\n\n/* capture layout: a square frame for video export, with a brand bar instead of controls */\n.bp.capture{--bp-ctl:46px;height:100%}\n.bp.capture .bp-stage{height:100%;border:0;border-radius:0;justify-content:space-between}\n.bp.capture .bp-cap{padding:22px 24px 0}\n.bp.capture .bp-text{font-size:21px}\n.bp.capture .bp-no{font-size:12px}\n.bp.capture .bp-svg{flex:1;min-height:0;padding-inline:8px}\n.bp.capture .bp-ctl{display:none}\n.bp.capture .bp-brand{display:flex;align-items:center;gap:10px;height:var(--bp-ctl);padding:0 20px;border-top:1px solid var(--rule);font:600 14px/1 var(--display);color:var(--ink)}\n.bp.capture .bp-bm{flex:none;width:22px;height:22px}\n.bp.capture .bp-site{margin-left:auto;font:500 12px/1 var(--mono);color:var(--q)}\n.bp.capture .bp-row{display:none}\n\n/* share-card frame: just the drawing, boxed (after the capture rules, which it overrides) */\n.bp.og,.bp.og .bp-stage{height:auto}\n.bp.og .bp-stage{border:1px solid var(--rule);border-radius:10px}\n.bp.og .bp-cap,.bp.og .bp-brand{display:none}\n.bp.og .bp-svg{flex:none;padding:4px}\n\n/* thumbnail: the finished drawing, framed by whatever holds it */\n.bp.still .bp-stage{border:0;border-radius:0;background:transparent}\n.bp.still .bp-svg{padding:0}\n";
/* Cognitive Bias Explorer: animated explainers.
   A player shows a scene as a seekable timeline. seek(t) renders any moment exactly,
   so looping, stepping between beats, and frame-by-frame video capture all agree.
   Share icons: Lucide (lucide.dev), ISC licence. The brain icon is our own (icon.py). */
(function () {
  "use strict";

  const EASE = {
    lin: t => t,
    out: t => 1 - Math.pow(1 - t, 3),
    inOut: t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    back: t => { const c = 1.9; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); },
    bounce: t => {
      const n = 7.5625, d = 2.75;
      if (t < 1 / d) return n * t * t;
      if (t < 2 / d) return n * (t -= 1.5 / d) * t + .75;
      if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + .9375;
      return n * (t -= 2.625 / d) * t + .984375;
    }
  };

  const ICON = {
    play: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4.5v15a1 1 0 0 0 1.5.9l12-7.5a1 1 0 0 0 0-1.7l-12-7.5A1 1 0 0 0 7 4.5Z"/></svg>',
    pause: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="5" y="4" width="5" height="16" rx="1.5"/><rect x="14" y="4" width="5" height="16" rx="1.5"/></svg>',
    replay: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>',
    share: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7"/><path d="M16 6l-4-4-4 4"/><path d="M12 2v13"/></svg>',
    soundOn: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4z" fill="currentColor"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/></svg>',
    soundOff: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="m16 9.5 5 5M21 9.5l-5 5"/></svg>'
  };

  /* ------------------------------------------------------------------ sound
     The site's players can play the scene's sound effects in step with the animation.
     Off by default; a tap turns it on and it's remembered. (Videos have them mixed in.) */
  const SOUND_KEY = "bp.sound", SOUNDS = ["pluck", "tick", "pop", "thud", "whoosh", "spring", "scribble", "chime", "swell"];
  const SND = { on: false, ctx: null, out: null, buffers: {}, base: null, loading: null };
  try { SND.on = localStorage.getItem(SOUND_KEY) === "on"; } catch (e) {}
  function audio() {
    if (!SND.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
      SND.ctx = new AC(); SND.out = SND.ctx.createGain(); SND.out.gain.value = 0.7; SND.out.connect(SND.ctx.destination);
    }
    if (SND.ctx.state === "suspended") SND.ctx.resume().catch(() => {});
    return SND.ctx;
  }
  function loadSounds(base) {
    if (!base) return;
    if (SND.loading && SND.base === base) return;
    const ctx = audio(); if (!ctx) return;
    SND.base = base;
    SND.loading = Promise.all(SOUNDS.map(n => fetch(base + n + ".mp3")
      .then(r => (r.ok ? r.arrayBuffer() : Promise.reject(r.status)))
      .then(b => new Promise((ok, no) => ctx.decodeAudioData(b, ok, no)))
      .then(buf => { SND.buffers[n] = buf; }).catch(() => {})));
  }
  function playSound(name) {
    const buf = SND.buffers[name];
    if (!SND.on || !SND.ctx || !buf) return;
    const src = SND.ctx.createBufferSource(); src.buffer = buf; src.connect(SND.out); src.start();
  }
  // browsers only let audio start after a tap: resume on the first one
  if (typeof document !== "undefined")   // (also loaded outside a browser by the build)
    document.addEventListener("pointerdown", () => { if (SND.on && SND.ctx && SND.ctx.state !== "running") SND.ctx.resume().catch(() => {}); }, true);
  // the friendly four-colour brain; same drawing as icon.py, keep the two in step
  const BRAIN_LOBES = [[8.2, 7.6, 3.9], [5.4, 11.2, 3.7], [9.6, 11.8, 4.2], [6.4, 15.6, 3.6], [10.2, 17.4, 3.3]];
  const BRAIN = (() => {
    const all = [...BRAIN_LOBES.map(([x, y, r]) => [x, y, r, "l"]), ...BRAIN_LOBES.map(([x, y, r]) => [24 - x, y, r, "r"])];
    const lobe = (y, s) => s === "l" ? (y > 14 ? "fast" : "tmi") : (y > 14 ? "mem" : "nem");
    const F = "#2a2320";
    return all.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${+(r + 1.1).toFixed(2)}" style="fill:var(--ink)"/>`).join("") +
      all.map(([x, y, r, s]) => `<circle cx="${x}" cy="${y}" r="${r}" style="fill:var(--${lobe(y, s)})"/>`).join("") +
      `<g fill="none" stroke="${F}" stroke-width="1.2" stroke-linecap="round"><path d="M12 3.4V8M12 18.6V21M5.2 9.6Q7 9.4 7.6 11M6.4 17.4Q7.6 16.2 9 16.8M18.8 9.6Q17 9.4 16.4 11M17.6 17.4Q16.4 16.2 15 16.8"/>` +
      `<path d="M10.3 14.6Q12 16.3 13.7 14.6" stroke-width="1.4"/></g><circle cx="9.7" cy="12.4" r="1.1" fill="${F}"/><circle cx="14.3" cy="12.4" r="1.1" fill="${F}"/>`;
  })();
  const brainMark = cls => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${BRAIN}</svg>`;

  const UI = {
    en: {
      play: "Play", pause: "Pause", replay: "Replay", share: "Share", sound: "Sound", step: n => `Step ${n}`,
      ecshare: "Share this", ecagain: "Watch again", smHead: "Share this explainer",
      copy: "Copy link", copied: "Copied", embed: "Copy embed code", video: "Download video",
      open: "Open on its own page", site: "papangelis.com/biases"
    },
    el: {
      play: "Αναπαραγωγή", pause: "Παύση", replay: "Από την αρχή", share: "Κοινοποίηση", sound: "Ήχος", step: n => `Βήμα ${n}`,
      ecshare: "Μοιράσου το", ecagain: "Ξανά από την αρχή", smHead: "Μοιράσου το",
      copy: "Αντιγραφή συνδέσμου", copied: "Αντιγράφηκε", embed: "Κώδικας ενσωμάτωσης", video: "Λήψη βίντεο",
      open: "Άνοιγμα σε δική του σελίδα", site: "papangelis.com/biases"
    }
  };

  /* ------------------------------------------------------------------ scenes */
  const SCENES = {};

  // Scenes live in scenes/<key>.js and register themselves on BiasAnim.SCENES.

  /* ------------------------------------------------------------------ timeline */
  const HOLD = 2600, CARD_IN = 450, CARD_HOLD = 6000, FADE = 500;
  function compile(scene, holds, cardHold) {
    const S = { ...scene.S0, card: 0, all: 1 }, segs = [], starts = [], ends = [], cues = [];
    let t = 0;
    const push = (to, ms, ease) => {
      const from = {}; for (const key in to) from[key] = S[key];
      segs.push({ t0: t, t1: t + (ms || 0), from, to, ease: EASE[ease || "out"] });
      Object.assign(S, to); t += ms || 0;
    };
    scene.beats.forEach(b => {
      starts.push(t);
      b.steps.forEach(st => {
        if (st.sfx) cues.push({ t: t + (st.sfxAt || 0), name: st.sfx });
        if (st.wait) t += st.wait; else push(st.to, st.ms, st.ease);
      });
      ends.push(t);
      t += (holds && holds[starts.length - 1]) || b.hold || HOLD;
    });
    const cardAt = t;
    cues.push({ t: cardAt, name: "swell" });
    push({ card: 1 }, CARD_IN); t += cardHold || CARD_HOLD; push({ card: 0, all: 0 }, FADE);
    return { segs, starts, ends, cues, cardAt, total: t, S0: { ...scene.S0, card: 0, all: 1 },
      motion: starts.map((s0, i) => ends[i] - s0), holdsDefault: scene.beats.map(b => b.hold || HOLD) };
  }
  function stateAt(tl, t) {
    const S = { ...tl.S0 };
    for (const g of tl.segs) {
      if (t < g.t0) break;
      const p = g.t1 > g.t0 ? Math.min(1, (t - g.t0) / (g.t1 - g.t0)) : 1, e = g.ease(p);
      for (const key in g.to) S[key] = g.from[key] + (g.to[key] - g.from[key]) * e;
    }
    return S;
  }

  /* ------------------------------------------------------------------ player */
  let uid = 0;
  function mount(host, key, opts = {}) {
    const scene = SCENES[key]; if (!scene || !host) return null;
    const lang = opts.lang === "el" ? "el" : "en", T = scene.text[lang], U = UI[lang];
    const tl = compile(scene, opts.holds, opts.cardHold), n = scene.beats.length, id = "bp" + (++uid);
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const still = !!opts.still;   // a thumbnail: the finished drawing only, no controls, never plays
    const capture = !!opts.capture || still;
    // each player lives in its own shadow root: page styles can't reach the scene, and scene styles can't leak out.
    // Colours and fonts still come through as inherited CSS variables (--ink, --q, --display, ...).
    const dom = host.shadowRoot || host.attachShadow({ mode: "open" });
    dom.innerHTML = `<style>:host{display:block}${window.BiasAnimCSS || ""}\n${scene.css || ""}</style>
      <div class="bp${capture ? " capture" : ""}${opts.og || still ? " og" : ""}${still ? " still" : ""}" data-scene="${key}" style="--q:var(--${scene.q})">
        <div class="bp-stage">
          <div class="bp-cap"><span class="bp-no"></span><p class="bp-text" aria-live="polite"></p></div>
          <svg class="bp-svg" viewBox="${scene.viewBox}" role="img" aria-label="${T.shareTitle}"><g class="bp-all">${scene.svg(T)}</g></svg>
          <div class="bp-card" aria-hidden="true">
            ${brainMark("bp-mark")}
            <p class="bp-name">${T.name}</p>
            <p class="bp-line">${T.ecline}</p>
            <div class="bp-row"><button class="bp-pill primary" type="button" data-a="share">${ICON.share}<span>${U.ecshare}</span></button><button class="bp-pill" type="button" data-a="again">${U.ecagain}</button></div>
          </div>
          <div class="bp-menu" role="menu" hidden></div>
          <div class="bp-ctl">
            <button class="bp-btn" type="button" data-a="play"></button>
            <div class="bp-dots">${scene.beats.map((_, i) => `<button class="bp-dot" type="button" data-i="${i}" aria-label="${U.step(i + 1)}"><i></i></button>`).join("")}</div>
            ${opts.sfxBase && !capture ? `<button class="bp-btn" type="button" data-a="sound" aria-label="${U.sound}" aria-pressed="${SND.on}">${SND.on ? ICON.soundOn : ICON.soundOff}</button>` : ""}
            <button class="bp-btn" type="button" data-a="share" aria-label="${U.share}">${ICON.share}</button>
            <button class="bp-btn" type="button" data-a="replay" aria-label="${U.replay}">${ICON.replay}</button>
          </div>
          <div class="bp-brand">${brainMark("bp-bm")}<span>${T.name}</span><span class="bp-site">${U.site}</span></div>
        </div>
      </div>`;
    const root = dom.querySelector(".bp");
    const $ = sel => root.querySelector(sel);
    const cache = {};
    const k = name => cache[name] || (cache[name] = root.querySelector(`[data-k="${name}"]`));
    const all = $(".bp-all"), card = $(".bp-card"), text = $(".bp-text"), no = $(".bp-no"), menu = $(".bp-menu");
    const dots = [...root.querySelectorAll(".bp-dot i")];

    let t = 0, playing = false, userPaused = false, visible = false, raf = 0, last = 0, capShown = -1, started = false;
    function beatAt(time) { let i = 0; while (i + 1 < n && time >= tl.starts[i + 1]) i++; return i; }
    function draw() {
      const S = stateAt(tl, t);
      scene.render(S, k, T);
      all.style.opacity = S.all;
      card.style.opacity = S.card;
      card.classList.toggle("on", S.card > .5);
      card.setAttribute("aria-hidden", S.card > .5 ? "false" : "true");
      const i = beatAt(t);
      if (i !== capShown) { text.innerHTML = T.caps[i]; no.textContent = `${i + 1}/${n}`; capShown = i; }
      // captions fade in at the start of each beat and out just before the next
      const next = i + 1 < n ? tl.starts[i + 1] : tl.total;
      text.style.opacity = Math.max(0, Math.min(1, (t - tl.starts[i]) / 220, (next - t) / 160, i === n - 1 ? 1 - S.card : 1));
      dots.forEach((d, j) => {
        const end = j + 1 < n ? tl.starts[j + 1] : tl.cardAt;
        d.style.width = (j < i ? 100 : j > i ? 0 : Math.min(100, (t - tl.starts[j]) / (end - tl.starts[j]) * 100)) + "%";
      });
    }
    function cuesBetween(a, b) {   // sound cues passed while playing forward from a to b
      for (const c of tl.cues) if (c.t > a && c.t <= b) playSound(c.name);
    }
    let cueFrom = -1;   // sounds fire for cues after this time (so a cue at 0 plays when starting over)
    function frame(now) {
      // a frame's timestamp can be a little earlier than the moment play() started: never step backwards
      const dt = Math.max(0, Math.min(100, now - last)); last = Math.max(last, now);
      t += dt;
      if (t >= tl.total) { if (SND.on) cuesBetween(cueFrom, tl.total); t = 0; cueFrom = -1; }   // loop
      if (SND.on) cuesBetween(cueFrom, t);
      cueFrom = t;
      draw();
      raf = playing ? requestAnimationFrame(frame) : 0;
    }
    function setIcon() {
      const b = $('[data-a="play"]');
      b.innerHTML = playing ? ICON.pause : ICON.play;
      b.setAttribute("aria-label", playing ? U.pause : U.play);
    }
    function play() { if (playing || capture) return; if (!started) { started = true; t = 0; cueFrom = -1; } playing = true; last = performance.now(); raf = requestAnimationFrame(frame); setIcon(); }
    function pause() { playing = false; cancelAnimationFrame(raf); raf = 0; setIcon(); }
    function seek(time) { t = Math.max(0, Math.min(tl.total, time)); cueFrom = t - 1e-3; draw(); }

    function closeMenu() { menu.hidden = true; }
    function openMenu() {
      const u = encodeURIComponent(opts.shareUrl || location.href), tt = encodeURIComponent(T.shareTitle);
      menu.innerHTML = `<div class="bp-mh">${U.smHead}</div>
        <button type="button" role="menuitem" data-m="copy">${U.copy}<small></small></button>
        <a role="menuitem" target="_blank" rel="noopener" href="https://wa.me/?text=${tt}%20${u}">WhatsApp</a>
        <a role="menuitem" target="_blank" rel="noopener" href="https://twitter.com/intent/tweet?text=${tt}&url=${u}">X</a>
        <a role="menuitem" target="_blank" rel="noopener" href="https://www.linkedin.com/sharing/share-offsite/?url=${u}">LinkedIn</a>
        <a role="menuitem" target="_blank" rel="noopener" href="https://www.facebook.com/sharer/sharer.php?u=${u}">Facebook</a>
        ${opts.videoUrl ? `<a role="menuitem" href="${opts.videoUrl}" download>${U.video}<small>MP4</small></a>` : ""}
        ${opts.embedUrl ? `<button type="button" role="menuitem" data-m="embed">${U.embed}<small></small></button>` : ""}
        ${opts.openUrl ? `<a role="menuitem" href="${opts.openUrl}">${U.open}</a>` : ""}`;
      menu.hidden = false;
      const copy = async (btn, value) => {
        try { await navigator.clipboard.writeText(value); btn.querySelector("small").textContent = U.copied; btn.querySelector("small").className = "ok"; }
        catch (e) { btn.querySelector("small").textContent = value.length > 60 ? "✕" : value; }
      };
      menu.querySelector('[data-m="copy"]').onclick = e => copy(e.currentTarget, opts.shareUrl || location.href);
      const em = menu.querySelector('[data-m="embed"]');
      if (em) em.onclick = e => copy(e.currentTarget, `<iframe src="${opts.embedUrl}" title="${T.shareTitle}" width="480" height="450" style="border:0;border-radius:12px;max-width:100%" loading="lazy" allowfullscreen></iframe>`);
      menu.querySelector('[role="menuitem"]').focus();
    }
    async function share() {
      if (playing) { userPaused = true; pause(); }
      const url = opts.shareUrl || location.href;
      if (navigator.share && matchMedia("(pointer: coarse)").matches) {
        try { await navigator.share({ title: T.shareTitle, url }); return; }
        catch (e) { if (e && e.name === "AbortError") return; }
      }
      menu.hidden ? openMenu() : closeMenu();
    }

    root.addEventListener("click", e => {
      const a = e.target.closest("[data-a]"), d = e.target.closest(".bp-dot");
      if (d) { const i = +d.dataset.i; closeMenu(); started = true; if (playing) seek(tl.starts[i]); else seek(tl.ends[i]); return; }
      if (!a) return;
      const act = a.dataset.a;
      if (act === "play") { closeMenu(); if (playing) { userPaused = true; pause(); } else { userPaused = false; if (t >= tl.cardAt) seek(0); play(); } }
      else if (act === "replay" || act === "again") { closeMenu(); userPaused = false; seek(0); play(); }
      else if (act === "share") share();
      else if (act === "sound") {
        SND.on = !SND.on;
        try { localStorage.setItem(SOUND_KEY, SND.on ? "on" : "off"); } catch (e) {}
        if (SND.on) { audio(); loadSounds(opts.sfxBase); }
        document.dispatchEvent(new CustomEvent("bp-sound"));
      }
    });
    const outside = e => { if (!menu.hidden && !e.composedPath().includes(root)) closeMenu(); };
    const soundBtn = () => {
      const b = $('[data-a="sound"]'); if (!b) return;
      b.innerHTML = SND.on ? ICON.soundOn : ICON.soundOff; b.setAttribute("aria-pressed", SND.on);
    };
    const esc = e => { if (e.key === "Escape") closeMenu(); };
    if (!still) {
      document.addEventListener("bp-sound", soundBtn);
      if (SND.on && opts.sfxBase && !capture) loadSounds(opts.sfxBase);
      document.addEventListener("click", outside);
      document.addEventListener("keydown", esc);
    }

    let io = null;
    if (!capture && !reduced && opts.autoplay !== false) {
      io = new IntersectionObserver(es => {
        visible = es[0].isIntersecting;
        if (visible && !userPaused) play(); else if (!visible) pause();
      }, { threshold: .35 });
      io.observe(root);
    }
    // at rest (before playing, or with reduced motion) show the finished story
    seek(capture && !still ? 0 : tl.ends[n - 1]);
    setIcon();

    const api = {
      total: tl.total, cardAt: tl.cardAt, finalAt: tl.ends[n - 1],
      starts: tl.starts, ends: tl.ends, cues: tl.cues, motion: tl.motion, holdsDefault: tl.holdsDefault,
      seek, play, pause,
      destroy() { pause(); io && io.disconnect(); document.removeEventListener("click", outside); document.removeEventListener("keydown", esc); document.removeEventListener("bp-sound", soundBtn); dom.innerHTML = ""; }
    };
    if (capture && !still) window.__bp = api;
    return api;
  }

  // Scenes can also be fetched on demand: SRC maps a key to its script, and load(key) resolves once it has registered.
  const SRC = {}, LOADING = {};
  function load(key) {
    if (SCENES[key]) return Promise.resolve(true);
    if (!SRC[key] || typeof document === "undefined") return Promise.resolve(false);
    return LOADING[key] || (LOADING[key] = new Promise(res => {
      const el = document.createElement("script");
      el.src = SRC[key]; el.async = true;
      el.onload = () => res(!!SCENES[key]);
      el.onerror = () => { delete LOADING[key]; res(false); };
      document.head.appendChild(el);
    }));
  }
  window.BiasAnim = { SCENES, SRC, mount, load, has: key => !!(SCENES[key] || SRC[key]) };
})();

Object.assign(window.BiasAnim.SRC, {"anchoring": "/biases/scenes/anchoring.js?v=802bee33", "authority-bias": "/biases/scenes/authority-bias.js?v=a6f8ccee", "availability-heuristic": "/biases/scenes/availability-heuristic.js?v=f3632abe", "bandwagon-effect": "/biases/scenes/bandwagon-effect.js?v=7e691dbe", "base-rate-fallacy": "/biases/scenes/base-rate-fallacy.js?v=cd0cd91b", "confirmation-bias": "/biases/scenes/confirmation-bias.js?v=0d0a6f95", "curse-of-knowledge": "/biases/scenes/curse-of-knowledge.js?v=8db26d8d", "decoy-effect": "/biases/scenes/decoy-effect.js?v=c457fa90", "dunning-kruger": "/biases/scenes/dunning-kruger.js?v=d919687c", "endowment-effect": "/biases/scenes/endowment-effect.js?v=7ad424dc", "family-autonomy": "/biases/scenes/family-autonomy.js?v=5ab8aceb", "family-bizarre": "/biases/scenes/family-bizarre.js?v=342c4560", "family-change": "/biases/scenes/family-change.js?v=77a4c6d9", "family-confident": "/biases/scenes/family-confident.js?v=b827f5b3", "family-confirm": "/biases/scenes/family-confirm.js?v=49b85856", "family-edit": "/biases/scenes/family-edit.js?v=c29be19b", "family-familiar": "/biases/scenes/family-familiar.js?v=33a044ce", "family-flaws": "/biases/scenes/family-flaws.js?v=0e34d55a", "family-generalize": "/biases/scenes/family-generalize.js?v=f629c5a6", "family-immediate": "/biases/scenes/family-immediate.js?v=394657e2", "family-invested": "/biases/scenes/family-invested.js?v=f938d50c", "family-minds": "/biases/scenes/family-minds.js?v=f08c1903", "family-numbers": "/biases/scenes/family-numbers.js?v=66f4e134", "family-patterns": "/biases/scenes/family-patterns.js?v=e66a807c", "family-primed": "/biases/scenes/family-primed.js?v=7444c2c8", "family-project": "/biases/scenes/family-project.js?v=13bbcd4f", "family-reduce": "/biases/scenes/family-reduce.js?v=9f93d6a6", "family-simple": "/biases/scenes/family-simple.js?v=7e2ad36f", "family-stereotypes": "/biases/scenes/family-stereotypes.js?v=c8de91b4", "family-store": "/biases/scenes/family-store.js?v=9d6f857e", "framing-effect": "/biases/scenes/framing-effect.js?v=0438d10a", "fundamental-attribution-error": "/biases/scenes/fundamental-attribution-error.js?v=28060cf7", "gamblers-fallacy": "/biases/scenes/gamblers-fallacy.js?v=f2f3a3a3", "habit-argue": "/biases/scenes/habit-argue.js?v=73c06ff0", "habit-base-rate": "/biases/scenes/habit-base-rate.js?v=9a6b1abe", "habit-change-mind": "/biases/scenes/habit-change-mind.js?v=89172e8b", "habit-distance": "/biases/scenes/habit-distance.js?v=8c2c2ace", "habit-grade": "/biases/scenes/habit-grade.js?v=f9f42fcd", "habit-other-eyes": "/biases/scenes/habit-other-eyes.js?v=8ec45cb7", "habit-pre-mortem": "/biases/scenes/habit-pre-mortem.js?v=ae5fa31f", "habit-predictions": "/biases/scenes/habit-predictions.js?v=20f65b94", "halo-effect": "/biases/scenes/halo-effect.js?v=85b2eee0", "hindsight-bias": "/biases/scenes/hindsight-bias.js?v=4110ef7f", "hyperbolic-discounting": "/biases/scenes/hyperbolic-discounting.js?v=80e069db", "ikea-effect": "/biases/scenes/ikea-effect.js?v=9c2c8ab7", "loss-aversion": "/biases/scenes/loss-aversion.js?v=7128f71f", "negativity-bias": "/biases/scenes/negativity-bias.js?v=df30ee0e", "optimism-bias": "/biases/scenes/optimism-bias.js?v=96967461", "peak-end-rule": "/biases/scenes/peak-end-rule.js?v=362f72c4", "planning-fallacy": "/biases/scenes/planning-fallacy.js?v=1f087f92", "spotlight-effect": "/biases/scenes/spotlight-effect.js?v=3740fa9d", "status-quo-bias": "/biases/scenes/status-quo-bias.js?v=375f8d3e", "sunk-cost": "/biases/scenes/sunk-cost.js?v=d0a3aa76", "survivorship-bias": "/biases/scenes/survivorship-bias.js?v=23ded285"});
