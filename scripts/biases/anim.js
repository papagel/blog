/* Cognitive Bias Explorer: animated explainers.
   A player shows a scene as a seekable timeline. seek(t) renders any moment exactly,
   so looping, stepping between beats, and frame-by-frame video capture all agree.
   Brain and share icons: Lucide (lucide.dev), ISC licence. */
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
    share: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7"/><path d="M16 6l-4-4-4 4"/><path d="M12 2v13"/></svg>'
  };
  const BRAIN = '<path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/>';
  const brainMark = (cls, id) => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true"><defs><linearGradient id="${id}" x1="2" y1="3" x2="22" y2="21" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#b9af9f"/><stop offset=".35" stop-color="#4cc3bb"/><stop offset=".68" stop-color="#86a9f0"/><stop offset="1" stop-color="#a2d05a"/></linearGradient></defs><g fill="none" stroke="url(#${id})" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${BRAIN}</g></svg>`;

  const UI = {
    en: {
      play: "Play", pause: "Pause", replay: "Replay", share: "Share", step: n => `Step ${n}`,
      ecshare: "Share this", ecagain: "Watch again", smHead: "Share this explainer",
      copy: "Copy link", copied: "Copied", embed: "Copy embed code", video: "Download video",
      open: "Open on its own page", site: "papangelis.com/biases"
    },
    el: {
      play: "Αναπαραγωγή", pause: "Παύση", replay: "Από την αρχή", share: "Κοινοποίηση", step: n => `Βήμα ${n}`,
      ecshare: "Μοιράσου το", ecagain: "Ξανά από την αρχή", smHead: "Μοιράσου το",
      copy: "Αντιγραφή συνδέσμου", copied: "Αντιγράφηκε", embed: "Κώδικας ενσωμάτωσης", video: "Λήψη βίντεο",
      open: "Άνοιγμα σε δική του σελίδα", site: "papangelis.com/biases"
    }
  };

  /* ------------------------------------------------------------------ scenes */
  const SCENES = {};

  // Anchoring: a house, a seller's number, and a guess tied to it by a rope.
  (function () {
    const X = v => 30 + (v - 300) / 700 * 340;           // € thousands -> x
    const AX = X(900), TRUTH = 600, SHORT = 780, OWN = 620;
    SCENES.anchoring = {
      q: "tmi", viewBox: "0 0 400 272",
      text: {
        en: {
          name: "Anchoring", shareTitle: "Anchoring, explained in 30 seconds",
          ecline: "The first number you hear sets your starting point. Know your own first.",
          bubble: "“I'm asking €900k”", truth: "Fair value", hidden: "hidden from you", start: "starting point",
          adj: "adjusting", pull: "pull", padh: "Your estimate", padv: "€550–650k", guess: "Your guess",
          withAnchor: "With the anchor", withRange: "Your range first", gap: v => `€${v}k too high`, axis: "Price, € thousands",
          caps: [
            "You want to buy this house. What's it worth?",
            "Its fair value is about <b>€600k</b>. You don't know that yet.",
            "The seller speaks first: “I'm asking <b>€900k</b>.”",
            "Your mind grabs €900k as its <b>starting point</b>.",
            "It feels too high, so you adjust down…",
            "…but you stop too early, <b>€180k too high</b>.",
            "<b>The fix:</b> write down your own estimate first.",
            "Start from your own range. You land near <b>fair value</b>."
          ]
        },
        el: {
          name: "Αγκύρωση", shareTitle: "Η αγκύρωση σε 30 δευτερόλεπτα",
          ecline: "Ο πρώτος αριθμός που ακούς γίνεται η αφετηρία σου. Να ξέρεις τον δικό σου πρώτα.",
          bubble: "«Ζητάω 900 χιλ. €»", truth: "Πραγματική αξία", hidden: "δεν τη γνωρίζεις", start: "αφετηρία",
          adj: "προσαρμογή", pull: "τράβηγμα", padh: "Η εκτίμησή σου", padv: "550–650 χιλ.", guess: "Η εκτίμησή σου",
          withAnchor: "Με την άγκυρα", withRange: "Με το δικό σου εύρος", gap: v => `${v} χιλ. € παραπάνω`, axis: "Τιμή, χιλ. €",
          caps: [
            "Θέλεις να αγοράσεις αυτό το σπίτι. Πόσο αξίζει;",
            "Η πραγματική του αξία είναι περίπου <b>600 χιλ. €</b>. Εσύ δεν το ξέρεις ακόμα.",
            "Ο πωλητής μιλάει πρώτος: “Ζητάω <b>900 χιλ. €</b>”.",
            "Το μυαλό σου κρατά τα 900 χιλ. ως <b>αφετηρία</b>.",
            "Σου φαίνεται ακριβό, οπότε κατεβαίνεις…",
            "…αλλά σταματάς νωρίς, <b>180 χιλ. € πιο ψηλά</b>.",
            "<b>Η λύση:</b> γράψε πρώτα τη δική σου εκτίμηση.",
            "Ξεκίνα από το δικό σου εύρος. Καταλήγεις κοντά στην <b>πραγματική αξία</b>."
          ]
        }
      },
      svg(T) {
        let axis = `<line class="ax" x1="30" y1="200" x2="370" y2="200"/>`;
        for (let v = 300; v <= 1000; v += 100) axis += `<line class="tick" x1="${X(v)}" y1="196" x2="${X(v)}" y2="204"/><text class="tl" x="${X(v)}" y="217">${v}</text>`;
        axis += `<text class="axt" x="30" y="270">${T.axis}</text>`;
        return `${axis}
          <g data-k="house"><path class="house" d="M34 70 L66 42 L98 70 M42 64 V100 H90 V64 M60 100 V82 H72 V100"/>
            <g class="tag" data-k="tag"><line x1="98" y1="66" x2="114" y2="58"/><rect x="112" y="44" width="30" height="26" rx="6"/><text x="127" y="63">?</text></g></g>
          <g class="pad" data-k="pad"><rect x="30" y="112" width="92" height="40" rx="7"/><text class="h" x="76" y="126">${T.padh}</text><text class="v" x="76" y="144">${T.padv}</text></g>
          <g class="bubble" data-k="bubble"><rect x="226" y="12" width="160" height="34" rx="10"/><path d="M314 45 L321 56 L328 45"/><text x="306" y="34">${T.bubble}</text></g>
          <g data-k="anchor"><g class="anchor"><circle cx="0" cy="-26" r="5"/><path d="M0 -21 V0 M-10 -15 H10 M-14 -8 C-12 2 -5 4 0 4 C5 4 12 2 14 -8"/></g></g>
          <text class="note" data-k="start" x="${AX}" y="236">${T.start}</text>
          <g class="band" data-k="band"><rect x="${X(550)}" y="193" width="${X(650) - X(550)}" height="14" rx="3"/></g>
          <path class="rope" data-k="rope" d=""/>
          <g data-k="adj"><path class="arrow" data-k="adjp" d=""/><text class="note" x="${(AX + X(700)) / 2}" y="110">${T.adj}</text></g>
          <g data-k="pull"><path class="arrow" data-k="pullp" d=""/><text class="note" data-k="pullt" y="164">${T.pull}</text></g>
          <g class="ghost" data-k="ghost" transform="translate(${X(TRUTH)} 0)"><line y1="168" y2="200"/><circle r="8" cy="160"/><text x="-13" y="158">${T.truth}</text><text class="sub" data-k="hidden" x="-13" y="170">${T.hidden}</text></g>
          <g class="pin p1" data-k="pin"><line y1="168" y2="200"/><circle r="8" cy="160"/><text data-k="guess"></text></g>
          <g class="pin p2" data-k="pin2"><line y1="168" y2="200"/><circle r="8" cy="160"/><text text-anchor="end" x="-13" y="164">${T.withRange}</text></g>
          <g class="gap" data-k="gap"><line x1="${X(TRUTH)}" x2="${X(SHORT)}" y1="244" y2="244"/><line x1="${X(TRUTH)}" x2="${X(TRUTH)}" y1="238" y2="250"/><line x1="${X(SHORT)}" x2="${X(SHORT)}" y1="238" y2="250"/><text x="${(X(TRUTH) + X(SHORT)) / 2}" y="262">${T.gap(SHORT - TRUTH)}</text></g>`;
      },
      S0: { house: 0, tagSwing: 0, ghost: 0, hidden: 1, bubble: 0, anchorY: 60, anchorOp: 0, start: 0,
        pin: 0, pinX: 900, pinFade: 1, rope: 0, adj: 0, pull: 0, gap: 0, pad: 0, band: 0, pin2: 0, pin2X: 600, final: 0 },
      render(S, k, T) {
        const op = (key, v) => { k(key).style.opacity = v; };
        op("house", S.house);
        k("tag").setAttribute("transform", `rotate(${S.tagSwing} 98 66)`);
        op("bubble", S.bubble);
        k("anchor").setAttribute("transform", `translate(${AX} ${S.anchorY})`);
        op("anchor", S.anchorOp);
        op("start", S.start);
        op("ghost", S.ghost); op("hidden", S.hidden);
        const px = X(S.pinX);
        k("pin").setAttribute("transform", `translate(${px} 0)`);
        op("pin", S.pin * S.pinFade);
        const g = k("guess"), fin = S.final > .5;
        g.textContent = fin ? T.withAnchor : T.guess;
        g.setAttribute("text-anchor", fin ? "start" : "middle");
        g.setAttribute("x", fin ? 13 : 0); g.setAttribute("y", fin ? 164 : 142);
        const sag = Math.max(2, 22 - Math.abs(AX - px) / 6);
        k("rope").setAttribute("d", `M${AX} ${S.anchorY - 8} Q${(AX + px) / 2} ${184 + sag} ${px} 178`);
        op("rope", S.rope);
        const ax2 = AX - (AX - X(700)) * S.adj;
        k("adjp").setAttribute("d", `M${AX} 118 H${ax2} M${ax2 + 6} 113 L${ax2} 118 L${ax2 + 6} 123`);
        op("adj", S.adj > .02 ? Math.min(1, S.adj * 2) : 0);
        const mx = (AX + px) / 2;
        k("pullp").setAttribute("d", `M${mx - 10} 172 H${mx + 10} M${mx + 4} 167 L${mx + 10} 172 L${mx + 4} 177`);
        k("pullt").setAttribute("x", mx);
        op("pull", S.pull);
        op("gap", S.gap); op("pad", S.pad); op("band", S.band);
        k("pin2").setAttribute("transform", `translate(${X(S.pin2X)} 0)`);
        op("pin2", S.pin2);
      },
      beats: [
        { steps: [{ to: { house: 1 }, ms: 600 }, { to: { tagSwing: 12 }, ms: 260 }, { to: { tagSwing: -8 }, ms: 300, ease: "inOut" }, { to: { tagSwing: 0 }, ms: 300, ease: "inOut" }] },
        { steps: [{ to: { ghost: 1 }, ms: 600 }, { wait: 1400 }, { to: { ghost: .35 }, ms: 600 }] },
        { steps: [{ to: { bubble: 1 }, ms: 450 }, { wait: 500 }, { to: { anchorOp: 1 } }, { to: { anchorY: 200 }, ms: 1000, ease: "bounce" }] },
        { steps: [{ to: { start: 1 }, ms: 400 }, { to: { pin: 1 }, ms: 400 }, { to: { rope: 1 }, ms: 400 }] },
        { steps: [{ to: { adj: 1, pinX: 700 }, ms: 1500, ease: "inOut" }] },
        { steps: [{ to: { pull: 1 }, ms: 300 }, { to: { pinX: SHORT, adj: 0 }, ms: 800, ease: "back" }, { to: { ghost: 1, hidden: 0 }, ms: 400 }, { to: { gap: 1 }, ms: 400 }] },
        { steps: [{ to: { pull: 0, gap: 0, pinFade: .4, start: 0, ghost: 0 }, ms: 500 }, { to: { pad: 1 }, ms: 500 }, { wait: 300 }, { to: { band: 1 }, ms: 500 }] },
        { steps: [{ to: { final: 1, pin2X: 600 } }, { to: { pin2: 1 }, ms: 400 }, { to: { pin2X: OWN }, ms: 700 }, { to: { rope: 0, anchorOp: .3, bubble: .35 }, ms: 600 }], hold: 4200 }
      ]
    };
  })();

  /* ------------------------------------------------------------------ timeline */
  const HOLD = 2600, CARD_IN = 450, CARD_HOLD = 6000, FADE = 500;
  function compile(scene) {
    const S = { ...scene.S0, card: 0, all: 1 }, segs = [], starts = [], ends = [];
    let t = 0;
    const push = (to, ms, ease) => {
      const from = {}; for (const key in to) from[key] = S[key];
      segs.push({ t0: t, t1: t + (ms || 0), from, to, ease: EASE[ease || "out"] });
      Object.assign(S, to); t += ms || 0;
    };
    scene.beats.forEach(b => {
      starts.push(t);
      b.steps.forEach(st => { if (st.wait) t += st.wait; else push(st.to, st.ms, st.ease); });
      ends.push(t);
      t += b.hold || HOLD;
    });
    const cardAt = t;
    push({ card: 1 }, CARD_IN); t += CARD_HOLD; push({ card: 0, all: 0 }, FADE);
    return { segs, starts, ends, cardAt, total: t, S0: { ...scene.S0, card: 0, all: 1 } };
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
    const tl = compile(scene), n = scene.beats.length, id = "bp" + (++uid);
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const capture = !!opts.capture;
    host.innerHTML = `
      <div class="bp${capture ? " capture" : ""}" style="--q:var(--${scene.q})">
        <div class="bp-stage">
          <div class="bp-cap"><span class="bp-no"></span><p class="bp-text" aria-live="polite"></p></div>
          <svg class="bp-svg" viewBox="${scene.viewBox}" role="img" aria-label="${T.shareTitle}"><g class="bp-all">${scene.svg(T)}</g></svg>
          <div class="bp-card" aria-hidden="true">
            ${brainMark("bp-mark", id + "g")}
            <p class="bp-name">${T.name}</p>
            <p class="bp-line">${T.ecline}</p>
            <div class="bp-row"><button class="bp-pill primary" type="button" data-a="share">${ICON.share}<span>${U.ecshare}</span></button><button class="bp-pill" type="button" data-a="again">${U.ecagain}</button></div>
            <span class="bp-url">${U.site}</span>
          </div>
          <div class="bp-menu" role="menu" hidden></div>
          <div class="bp-ctl">
            <button class="bp-btn" type="button" data-a="play"></button>
            <div class="bp-dots">${scene.beats.map((_, i) => `<button class="bp-dot" type="button" data-i="${i}" aria-label="${U.step(i + 1)}"><i></i></button>`).join("")}</div>
            <button class="bp-btn" type="button" data-a="share" aria-label="${U.share}">${ICON.share}</button>
            <button class="bp-btn" type="button" data-a="replay" aria-label="${U.replay}">${ICON.replay}</button>
          </div>
          <div class="bp-brand">${brainMark("bp-bm", id + "b")}<span>${T.name}</span><span class="bp-site">${U.site}</span></div>
        </div>
      </div>`;
    const root = host.firstElementChild;
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
    function frame(now) {
      const dt = Math.min(100, now - last); last = now;
      t += dt; if (t >= tl.total) t = 0;
      draw();
      raf = playing ? requestAnimationFrame(frame) : 0;
    }
    function setIcon() {
      const b = $('[data-a="play"]');
      b.innerHTML = playing ? ICON.pause : ICON.play;
      b.setAttribute("aria-label", playing ? U.pause : U.play);
    }
    function play() { if (playing || capture) return; if (!started) { started = true; t = 0; } playing = true; last = performance.now(); raf = requestAnimationFrame(frame); setIcon(); }
    function pause() { playing = false; cancelAnimationFrame(raf); raf = 0; setIcon(); }
    function seek(time) { t = Math.max(0, Math.min(tl.total, time)); draw(); }

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
      if (act === "play") { closeMenu(); if (playing) { userPaused = true; pause(); } else { userPaused = false; if (t >= tl.cardAt) t = 0; play(); } }
      else if (act === "replay" || act === "again") { closeMenu(); userPaused = false; seek(0); play(); }
      else if (act === "share") share();
    });
    const outside = e => { if (!menu.hidden && !root.contains(e.target)) closeMenu(); };
    const esc = e => { if (e.key === "Escape") closeMenu(); };
    document.addEventListener("click", outside);
    document.addEventListener("keydown", esc);

    let io = null;
    if (!capture && !reduced && opts.autoplay !== false) {
      io = new IntersectionObserver(es => {
        visible = es[0].isIntersecting;
        if (visible && !userPaused) play(); else if (!visible) pause();
      }, { threshold: .35 });
      io.observe(root);
    }
    // at rest (before playing, or with reduced motion) show the finished story
    seek(capture ? 0 : tl.ends[n - 1]);
    setIcon();

    const api = {
      total: tl.total, cardAt: tl.cardAt, finalAt: tl.ends[n - 1],
      seek, play, pause,
      destroy() { pause(); io && io.disconnect(); document.removeEventListener("click", outside); document.removeEventListener("keydown", esc); host.innerHTML = ""; }
    };
    if (capture) window.__bp = api;
    return api;
  }

  window.BiasAnim = { SCENES, mount, has: key => !!SCENES[key] };
})();
