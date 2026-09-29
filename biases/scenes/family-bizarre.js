/* Stands out (the "bizarre" family): a long meeting, eight points that all look alike. What stands out
   gets pinned in memory: a warning (useful), a line in bright color, a joke, a picture. By the next day
   the plain deadline has slipped away. Writing the key points down first brings it back, and making the
   key point stand out keeps it there. Scene for anim.js. */
(function () {
  const KEY = "family-bizarre", P = `.bp[data-scene="${KEY}"]`;
  const RY = i => 60 + 25 * i;                                   // the eight points: row centres
  const LEN = [[84, 56], [74, 50], [88, 62], [80, 54], [86, 60], [72, 52], [82, 58], [78, 48]];   // text strokes
  const ALERT = 1, HL = 2, DUE = 4, JOKE = 5, PIC = 7;
  const PLAIN = [0, 3, 4, 6];                                    // the rows nothing makes stand out
  const IX = 150;                                                // icons at a row's right end
  const LX = 184;                                                // the label column
  const LEAD = { 1: 162, 2: 142, 4: 164, 5: 162, 7: 118 };        // where each label's leader starts
  const NX = 192, NY = 26, NW = 194, NH = 110;                   // the note with the key points
  const cl = v => Math.max(0, Math.min(1, v));
  const f1 = n => +n.toFixed(1);
  const lerp = (a, b, t) => a + (b - a) * t;
  const io = t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  // a round-headed pin, upright with its tip at 0,0 (tilted when placed)
  const PIN = `<path class="nd" d="M0 0 V-6.5"/><circle class="bd" cx="0" cy="-10.2" r="4.6"/><circle class="sh" cx="-1.5" cy="-11.6" r="1.3"/>`;
  const CHECK = `<path class="fb-ok" d="M8.5 .3 L11.5 3.3 L16.5 -2.7"/>`;
  const QM = `<text class="fb-qm" x="12.5" y="4.2">?</text>`;
  // a label: a pill, optionally with an icon, and a dashed leader back to its row
  const pill = (key, cls, label, icon, lead) => `<g data-k="${key}"><g class="fb-pill ${cls}">` +
    (lead != null ? `<line class="ld" x1="${lead - LX}" x2="-3" y1="0" y2="0"/>` : "") +
    `<rect data-k="${key}r" x="0" y="-9.5" height="19" rx="9.5" width="80"/>${icon || ""}` +
    `<text data-k="${key}t" x="${icon ? 22 : 10}" y="3.9">${label}</text></g></g>`;
  const PILLS = [["tag1", 32], ["lab2", 20], ["lab5", 20], ["lab7", 20], ["dueB", 32], ["dueG", 32], ["stick", 32]];

  window.BiasAnim.SCENES[KEY] = {
    q: "tmi", viewBox: "0 0 400 272",
    css: `
      ${P} .fb-page{fill:var(--surface);stroke:var(--ink);stroke-width:2;stroke-linejoin:round}
      ${P} .fb-h{font:600 12px var(--display);fill:var(--ink)}
      ${P} .fb-hr{stroke:var(--rule);stroke-width:1.6;stroke-linecap:round}
      ${P} .fb-dot{fill:var(--muted)}
      ${P} .fb-tx{fill:none;stroke:var(--faint);stroke-width:2.2;stroke-linecap:round}
      ${P} .fb-hl{fill:var(--q);fill-opacity:.3}
      ${P} .fb-ic *{fill:none;stroke:var(--q);stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
      ${P} .fb-ic .f{fill:var(--q);stroke:none}
      ${P} .fb-ic .s{fill:var(--q);fill-opacity:.22}
      ${P} .fb-ic .bg{fill:var(--surface)}
      ${P} .fb-pin .nd{fill:none;stroke:var(--muted);stroke-width:1.6;stroke-linecap:round}
      ${P} .fb-pin .bd{fill:var(--q)}
      ${P} .fb-pin .sh{fill:var(--surface);opacity:.55}
      ${P} .fb-pin.g .bd{fill:var(--good)}
      ${P} .fb-pill rect{fill:var(--surface);stroke:var(--q);stroke-width:1.6}
      ${P} .fb-pill text{font:600 11px var(--display);fill:var(--ink)}
      ${P} .fb-pill .ld{stroke:var(--q);stroke-width:1.4;stroke-dasharray:2 3;stroke-linecap:round}
      ${P} .fb-pill.g rect,${P} .fb-pill.g .ld{stroke:var(--good)} ${P} .fb-pill.g text{fill:var(--good)}
      ${P} .fb-pill.b rect{stroke:var(--bad);stroke-dasharray:3 2.5} ${P} .fb-pill.b .ld{stroke:var(--bad)} ${P} .fb-pill.b text{fill:var(--bad)}
      ${P} .fb-ok{fill:none;stroke:var(--good);stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
      ${P} .fb-pill text.fb-qm{font:700 12px var(--display);fill:var(--bad);text-anchor:middle}
      ${P} .fb-miss{fill:none;stroke:var(--bad);stroke-width:1.6;stroke-dasharray:3 3}
      ${P} .fb-note{fill:var(--surface);stroke:var(--good);stroke-width:1.8;stroke-linejoin:round}
      ${P} .fb-fold{fill:none;stroke:var(--good);stroke-width:1.6;stroke-linejoin:round}
      ${P} .fb-nh{font:600 12px var(--display);fill:var(--ink)}
      ${P} .fb-nn{font:500 10px var(--mono);fill:var(--muted)}
    `,
    text: {
      en: {
        name: "Stands out", shareTitle: "Why the odd thing is what we remember, in 30 seconds",
        ecline: "What stands out sticks, whether it matters or not. Note what matters first.",
        meeting: "The meeting", recall: "What you recall", useful: "useful",
        vr: "Von Restorff effect", hu: "Humor effect", ps: "Picture superiority effect",
        due: "Deadline: Friday", noteH: "Key points first", stick: "it sticks",
        caps: [
          "A long meeting: eight points, <b>all\u00a0alike</b>. You can't keep them all.",
          "Your brain keeps what <b>stands\u00a0out</b>. The unusual often matters.",
          "A point in <b>bright color</b>? That one sticks too.",
          "So does a <b>joke</b>, even an off-topic one.",
          "And a <b>picture</b> sticks better than words.",
          "Next day, the <b>deadline</b>, plain but important, has slipped your mind.",
          "<b>The fix:</b> right after, write down the <b>key points</b> first.",
          "Sharing it? Make the key\u00a0point <b>stand out</b>, so it sticks."
        ],
        say: [
          "A long meeting. Eight points, all alike. You can't keep them all.",
          "So your brain keeps what stands out. That's usually smart: the unusual often matters.",
          "A point in bright color? That one sticks too. That's the Von Restorff effect.",
          "So does a joke, even an off-topic one. The humor effect.",
          "And a picture sticks better than words. The picture superiority effect.",
          "Next day, the deadline, plain but important, has slipped your mind.",
          "The fix: right after the meeting, write down the key points first.",
          "Sharing it with others? Make the key point stand out, so it sticks.",
          "What stands out sticks, whether it matters or not. Note what matters first."
        ]
      },
      el: {
        name: "Ό,τι ξεχωρίζει", shareTitle: "Γιατί θυμόμαστε ό,τι ξεχωρίζει, σε 30 δευτερόλεπτα",
        ecline: "Ό,τι ξεχωρίζει σου μένει, είτε μετράει είτε όχι. Σημείωσε πρώτα ό,τι μετράει.",
        meeting: "Η σύσκεψη", recall: "Τι θυμάσαι", useful: "χρήσιμο",
        vr: "Φαινόμενο Von Restorff", hu: "Φαινόμενο του χιούμορ", ps: "Φαινόμενο υπεροχής της εικόνας",
        due: "Προθεσμία: Παρασκευή", noteH: "Πρώτα τα βασικά", stick: "μένει στο μυαλό",
        caps: [
          "Μια πολύωρη σύσκεψη: οκτώ θέματα, <b>ίδια\u00a0κι\u00a0απαράλλαχτα</b>. Δεν θα τα θυμάσαι όλα.",
          "Το μυαλό σου κρατά ό,τι <b>ξεχωρίζει</b>. Το\u00a0ασυνήθιστο συχνά είναι και σημαντικό.",
          "Ένα θέμα σε <b>έντονο χρώμα</b>; Σου μένει κι αυτό.",
          "Το ίδιο κι ένα <b>αστείο</b>, ακόμη κι αν ήταν εκτός θέματος.",
          "Και μια <b>εικόνα</b> σου μένει πιο εύκολα από τις λέξεις.",
          "Την επόμενη μέρα, η <b>προθεσμία</b>, άχρωμη αλλά σημαντική, σου έχει ξεφύγει.",
          "<b>Η λύση:</b> μόλις τελειώσει, σημείωσε πρώτα <b>τα πιο σημαντικά</b>.",
          "Θα τα μεταφέρεις και σε άλλους; Κάνε το\u00a0σημαντικό <b>να ξεχωρίζει</b>, για να τους μείνει."
        ],
        say: [
          "Μια πολύωρη σύσκεψη. Οκτώ θέματα, ίδια κι απαράλλαχτα. Δεν θα τα θυμάσαι όλα.",
          "Το μυαλό σου κρατά ό,τι ξεχωρίζει. Και συνήθως καλά κάνει, γιατί το ασυνήθιστο συχνά είναι και σημαντικό.",
          "Ένα θέμα σε έντονο χρώμα; Σου μένει κι αυτό. Είναι το φαινόμενο Von Restorff.",
          "Το ίδιο κι ένα αστείο, ακόμη κι αν ήταν εκτός θέματος. Το φαινόμενο του χιούμορ.",
          "Και μια εικόνα σου μένει πιο εύκολα από τις λέξεις. Το φαινόμενο υπεροχής της εικόνας.",
          "Την επόμενη μέρα, η προθεσμία, άχρωμη αλλά σημαντική, σου έχει ξεφύγει.",
          "Η λύση: μόλις τελειώσει η σύσκεψη, σημείωσε πρώτα τα πιο σημαντικά.",
          "Θα τα μεταφέρεις και σε άλλους; Κάνε το σημαντικό να ξεχωρίζει, για να τους μείνει.",
          "Ό,τι ξεχωρίζει σου μένει, είτε μετράει είτε όχι. Σημείωσε πρώτα ό,τι μετράει."
        ]
      }
    },
    svg(T) {
      const rows = LEN.map(([a, b], i) => {
        let extra = "";
        if (i === HL) extra = `<rect class="fb-hl" data-k="hl" x="36" y="-9" height="18" rx="3" width="0"/>`;
        if (i === DUE) extra = `<rect class="fb-hl" data-k="hl4" x="36" y="-9" height="18" rx="3" width="0"/>`;
        let icon = "";
        if (i === ALERT) icon = `<g data-k="alert"><g class="fb-ic"><path class="bg" d="M${IX} -8.5 L${IX + 9} 7 H${IX - 9} Z"/>
          <path d="M${IX} -3.2 V1.4"/><circle class="f" cx="${IX}" cy="4.3" r="1.2"/></g></g>`;
        if (i === JOKE) icon = `<g data-k="joke"><g class="fb-ic"><circle class="bg" cx="${IX}" cy="0" r="8.5"/>
          <path d="M${IX - 5.2} -1.6 Q${IX - 3.2} -5 ${IX - 1.2} -1.6 M${IX + 1.2} -1.6 Q${IX + 3.2} -5 ${IX + 5.2} -1.6"/>
          <path class="s" d="M${IX - 5.4} 1.8 Q${IX} 10.4 ${IX + 5.4} 1.8 Z"/></g></g>`;
        if (i === PIC) icon = `<g data-k="pic"><g class="fb-ic"><rect class="bg" x="40" y="-10.5" width="72" height="21" rx="3"/>
          <path d="M44 7.5 L57 -3.5 L65 3 M60.5 0 L71 -7 L86 7.5"/><circle cx="99" cy="-3" r="3.4"/><path d="M85 7.5 L95 1.5 L108 7.5"/></g></g>`;
        if (i === DUE) icon = `<g data-k="cal"><g class="fb-ic"><rect class="bg" x="${IX - 8.5}" y="-7.5" width="17" height="16" rx="2.5"/>
          <path d="M${IX - 8.5} -3 H${IX + 8.5} M${IX - 4.5} -10 V-5.5 M${IX + 4.5} -10 V-5.5"/><circle cx="${IX}" cy="3" r="3.2"/></g></g>`;
        return `<g data-k="r${i}">${extra}<circle class="fb-dot" data-k="dot${i}" cx="30" cy="0" r="2.6"/>
          <path class="fb-tx" data-k="tx${i}" d="M42 -3.5 H${42 + a} M42 3.5 H${42 + b}"/>${icon}</g>`;
      }).join("");
      const pins = [1, 2, 5, 7].map(i => `<g class="fb-pin" data-k="pin${i}">${PIN}</g>`).join("") + `<g class="fb-pin g" data-k="pin4">${PIN}</g>`;
      return `
        <g data-k="doc"><g data-k="page"><rect class="fb-page" x="14" y="12" width="156" height="242" rx="8"/>
          <text class="fb-h" data-k="h0" x="28" y="34">${T.meeting}</text><text class="fb-h" data-k="h1" x="28" y="34">${T.recall}</text>
          <line class="fb-hr" x1="26" y1="43" x2="158" y2="43"/></g>
        ${rows}
        <rect class="fb-miss" data-k="miss" x="22" y="${RY(DUE) - 12}" width="140" height="24" rx="6"/>
        ${pins}</g>
        <g data-k="note"><path class="fb-note" d="M0 6 Q0 0 6 0 H${NW - 6} Q${NW} 0 ${NW} 6 V${NH - 14} L${NW - 14} ${NH} H6 Q0 ${NH} 0 ${NH - 6} Z"/>
          <path class="fb-fold" d="M${NW} ${NH - 14} H${NW - 14} V${NH}"/>
          <text class="fb-nh" x="14" y="24">${T.noteH}</text><text class="fb-nn" x="14" y="50">1</text>
          <g data-k="n2"><text class="fb-nn" x="14" y="74">2</text><text class="fb-nn" x="14" y="98">3</text>
            <path class="fb-tx" d="M28 70.5 H124 M28 94.5 H104"/></g></g>
        ${pill("tag1", "g", T.useful, CHECK, LEAD[1])}
        ${pill("lab2", "", T.vr, "", LEAD[2])}
        ${pill("lab5", "", T.hu, "", LEAD[5])}
        ${pill("lab7", "", T.ps, "", LEAD[7])}
        <g data-k="due"><line class="fb-miss" data-k="duel" x1="${LEAD[4] - LX}" x2="-3" y1="0" y2="0"/>
          ${pill("dueB", "b", T.due, QM)}${pill("dueG", "g", T.due, CHECK)}</g>
        ${pill("stick", "g", T.stick, CHECK, LEAD[4])}`;
    },
    S0: { page: 0, rows: 0, side: 0, alert: 0, pin1: 0, tag1: 0, hl: 0, pin2: 0, lab2: 0, joke: 0, pin5: 0, lab5: 0,
      pic: 0, pin7: 0, lab7: 0, head: 0, fade: 0, miss: 0, note: 0, mv: 0, n2: 0, save: 0, pin4: 0, viv: 0, cal: 0, stick: 0 },
    render(S, k, T) {
      // measure the labels first (one layout pass), so every pill fits whichever font has loaded
      const W = {};
      for (const [key, pad] of PILLS) {
        const t = k(key + "t"), n = t.getComputedTextLength ? t.getComputedTextLength() : 0;
        W[key] = (n || t.textContent.length * 6.2) + pad;
      }
      const op = (key, v) => { k(key).style.opacity = cl(v); };
      const tr = (key, x, y, s = 1) => k(key).setAttribute("transform",
        `translate(${f1(x)} ${f1(y)})${s !== 1 ? ` scale(${Math.max(.001, s).toFixed(3)})` : ""}`);
      const pop = (key, v, cx, cy) => {        // grow in place around (cx, cy)
        const s = Math.max(.001, .4 + .6 * v).toFixed(3);
        k(key).setAttribute("transform", `translate(${cx} ${cy}) scale(${s}) translate(${-cx} ${-cy})`);
        op(key, v * 3);
      };
      const tag = (key, i, v) => { tr(key, LX - 8 * (1 - cl(v)), RY(i)); op(key, v); k(key + "r").setAttribute("width", f1(W[key])); };

      // the page starts in the middle, then moves left to make room for the labels
      tr("doc", 108 * (1 - io(cl(S.side))), 0);
      // the page, and what its heading says: the meeting, then what you recall of it
      tr("page", 0, 6 * (1 - S.page)); op("page", S.page);
      op("h0", 1 - S.head); op("h1", S.head);
      // the eight points: they arrive one by one; by the next day the plain ones fade
      for (let i = 0; i < 8; i++) {
        const a = cl(S.rows - i);
        let f = 1;
        if (PLAIN.includes(i)) f = 1 - .84 * S.fade * (i === DUE ? 1 - S.save : 1);
        tr("r" + i, 0, RY(i) + 6 * (1 - a));
        op("r" + i, a * f);
      }
      // what makes a point stand out
      pop("alert", S.alert, IX, 0);
      k("hl").setAttribute("width", f1((LEN[HL][0] + 12) * cl(S.hl)));
      pop("joke", S.joke, IX, 0);
      op("tx" + PIC, 1 - S.pic); pop("pic", S.pic, 76, 0);
      // pins: what sticks in memory
      for (const i of [1, 2, 5, 7, 4]) {
        const p = S["pin" + i];
        k("pin" + i).setAttribute("transform", `translate(30 ${f1(RY(i) + 1 - 10 * (1 - p))}) rotate(22) scale(${Math.max(.001, .75 + .5 * p).toFixed(3)})`);
        op("pin" + i, p * 3); op("dot" + i, 1 - p * 2);
      }
      // the labels
      tag("tag1", ALERT, S.tag1); tag("lab2", HL, S.lab2); tag("lab5", JOKE, S.lab5); tag("lab7", PIC, S.lab7);
      // the deadline: missing, then written down as key point 1
      op("miss", S.miss * (1 - S.save));
      const m = io(cl(S.mv));
      tr("due", lerp(LX - 8 * (1 - cl(S.miss)), NX + 28, m), lerp(RY(DUE), NY + 46, m));
      op("due", S.miss); op("duel", 1 - S.mv * 3);
      k("dueBr").setAttribute("width", f1(W.dueB)); k("dueGr").setAttribute("width", f1(W.dueG));
      op("dueB", 1 - S.mv); op("dueG", S.mv);
      tr("note", NX, NY + 8 * (1 - S.note)); op("note", S.note); op("n2", S.n2);
      // the key point, made to stand out
      k("hl4").setAttribute("width", f1((LEN[DUE][0] + 12) * cl(S.viv)));
      pop("cal", S.cal, IX, 0);
      tag("stick", DUE, S.stick);
    },
    beats: [
      { steps: [{ to: { page: 1 }, ms: 500, sfx: "pluck" }, { wait: 150 }, { to: { rows: 8 }, ms: 1800, ease: "lin" }], hold: 2400 },
      { steps: [{ to: { side: 1 }, ms: 600, ease: "lin" }, { to: { alert: 1 }, ms: 450, ease: "back", sfx: "pop" }, { wait: 250 }, { to: { pin1: 1 }, ms: 400, ease: "back" },
        { to: { tag1: 1 }, ms: 400 }] },
      { steps: [{ to: { hl: 1 }, ms: 700, ease: "inOut", sfx: "scribble" }, { to: { pin2: 1 }, ms: 400, ease: "back" }, { to: { lab2: 1 }, ms: 400 }] },
      { steps: [{ to: { joke: 1 }, ms: 600, ease: "back", sfx: "spring" }, { to: { pin5: 1 }, ms: 400, ease: "back" }, { to: { lab5: 1 }, ms: 400 }] },
      { steps: [{ to: { pic: 1 }, ms: 700, sfx: "tick" }, { to: { pin7: 1 }, ms: 400, ease: "back" }, { to: { lab7: 1 }, ms: 400 }] },
      { steps: [{ to: { head: 1 }, ms: 400 }, { to: { fade: 1 }, ms: 1400, ease: "inOut", sfx: "whoosh" }, { to: { miss: 1 }, ms: 450, ease: "back" }], hold: 3000 },
      { steps: [{ to: { tag1: 0, lab2: 0, lab5: 0, lab7: 0 }, ms: 400 }, { to: { note: 1 }, ms: 450, ease: "back" },
        { to: { mv: 1 }, ms: 900, ease: "inOut", sfx: "scribble" }, { to: { n2: 1 }, ms: 350 }, { to: { save: 1 }, ms: 500 },
        { to: { pin4: 1 }, ms: 400, ease: "back", sfx: "pop" }], hold: 2800 },
      { steps: [{ to: { viv: 1 }, ms: 700, ease: "inOut" }, { to: { cal: 1 }, ms: 450, ease: "back" }, { to: { stick: 1 }, ms: 450, sfx: "chime" }], hold: 4200 }
    ]
  };
})();
