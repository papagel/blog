/* Confirmation bias: a hunch about a coworker, a week of evidence, two piles and a certainty meter. Scene for anim.js. */
(function () {
  const KEY = "confirmation-bias", P = `.bp[data-scene="${KEY}"]`;
  const CW = 106, CH = 28;                                  // evidence card
  const FEED_X = 136, FIT_X = 14, NO_X = 136;               // incoming column, "Fits" pile, "Doesn't fit" pile
  const feedY = r => 76 + r * 31;                           // six rows as the week comes in: 76..259
  const pileY = j => 130 + j * 31;                          // three slots per pile: 130..220
  const PLUS = [0, 2, 4], MINUS = [1, 3, 5];                // rows of the cards that fit / don't
  const TAGX = 76;                                          // left edge of the "lazy" tag
  const BX = 324, BW = 26, TOP = 70, BOT = 230;             // certainty meter
  const my = p => BOT - (BOT - TOP) * p;
  const GX = BX - 8;                                        // "too sure" bracket
  const clamp = v => Math.max(0, Math.min(1, v));

  window.BiasAnim.SCENES[KEY] = {
    q: "tmi", viewBox: "0 0 400 272",
    css: `
      ${P} .cb-line{fill:none;stroke:var(--ink);stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
      ${P} .cb-tag rect{fill:var(--surface);stroke:var(--ink);stroke-width:1.8}
      ${P} .cb-tag line{stroke:var(--ink);stroke-width:1.6;stroke-linecap:round}
      ${P} .cb-tag circle{fill:none;stroke:var(--ink);stroke-width:1.4}
      ${P} .cb-tag text{font:700 14px var(--display);fill:var(--ink);text-anchor:middle}
      ${P} .cb-beam{fill:var(--q);fill-opacity:.26;stroke:none}
      ${P} .cb-card .bg{fill:var(--surface);stroke:var(--muted);stroke-width:1.4}
      ${P} .cb-card .lit{fill:var(--q);fill-opacity:.12;stroke:var(--q);stroke-width:1.8}
      ${P} .cb-card .bd{fill:none;stroke:var(--ink);stroke-width:1.5}
      ${P} .cb-card .sg{fill:none;stroke:var(--ink);stroke-width:1.6;stroke-linecap:round}
      ${P} .cb-card text{font:600 11px var(--display);fill:var(--ink)}
      ${P} .cb-card .ck{fill:none;stroke:var(--q);stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
      ${P} .cb-lbl{font:600 11px var(--display)}
      ${P} .cb-fit{fill:var(--q)}
      ${P} .cb-no{fill:var(--ink)}
      ${P} .cb-tally line{stroke:var(--rule);stroke-width:1.5;stroke-linecap:round}
      ${P} .cb-tally text{font:600 11.5px var(--display);fill:var(--ink);text-anchor:middle}
      ${P} .cb-bar{fill:none;stroke:var(--muted);stroke-width:1.6}
      ${P} .cb-fill{fill:var(--q)}
      ${P} .cb-fillok{fill:var(--good)}
      ${P} .cb-val{font:700 9.5px var(--mono);fill:var(--ground);text-anchor:middle}
      ${P} .cb-mt{font:600 11px var(--display);fill:var(--ink);text-anchor:middle}
      ${P} .cb-tk{font:500 9px var(--mono);fill:var(--faint)}
      ${P} .cb-split{stroke:var(--good);stroke-width:1.8;stroke-dasharray:3 3;stroke-linecap:round}
      ${P} .cb-halo{stroke:var(--ground);stroke-width:5;stroke-linecap:round}
      ${P} .cb-gap path{fill:none;stroke:var(--bad);stroke-width:1.8;stroke-linecap:round}
      ${P} .cb-gap text{font:600 10px var(--mono);fill:var(--bad);text-anchor:end}
      ${P} .cb-mag{fill:none;stroke:var(--good);stroke-width:2.4;stroke-linecap:round}
    `,
    text: {
      en: {
        name: "Confirmation bias", shareTitle: "Confirmation bias, explained in 30 seconds",
        ecline: "You find what you look for. Look for what would prove you wrong.",
        tag: "lazy", tag2: "lazy?", tagW: 58,
        cards: [["Came in late", "on Monday"], ["Stayed late", "on Tuesday"], ["Missed", "a reply"],
          ["Report done", "early"], ["Took a", "long lunch"], ["Helped", "a client"]],
        fits: "Fits", nofit: "Doesn't fit", pro: "3 for", con: "3 against",
        meter: ["How sure you feel"], gap: ["too sure"],
        caps: [
          "You've decided your new coworker is <b>lazy</b>.",
          "All week, evidence comes in, <b>both ways</b>.",
          "You notice the pieces that <b>fit</b> your view…",
          "…and barely register the ones that <b>don't</b>.",
          "Every fit feels like proof. You grow <b>more and more sure</b>.",
          "But the evidence was split: <b>3 for, 3 against</b>.",
          "<b>The fix:</b> look for what would prove you wrong.",
          "Weigh both piles. Your certainty <b>matches the evidence</b>."
        ],
        say: [
          "You've decided your new coworker is lazy.",
          "All week, evidence comes in, both ways.",
          "You notice the pieces that fit your view...",
          "...and barely register the ones that don't.",
          "Every fit feels like proof. You grow more and more sure.",
          "But the evidence was split. Three for, three against.",
          "The fix: look for what would prove you wrong.",
          "Weigh both piles, and your certainty matches the evidence.",
          "Confirmation bias. You find what you look for. Look for what would prove you wrong."
        ]
      },
      el: {
        name: "Μεροληψία επιβεβαίωσης", shareTitle: "Η μεροληψία επιβεβαίωσης σε 30 δευτερόλεπτα",
        ecline: "Βρίσκεις αυτό που ψάχνεις. Ψάξε και ό,τι θα μπορούσε να σε διαψεύσει.",
        tag: "τεμπέλης", tag2: "τεμπέλης;", tagW: 90,
        cards: [["Άργησε", "τη Δευτέρα"], ["Έφυγε αργά", "την Τρίτη"], ["Άφησε μέιλ", "αναπάντητο"],
          ["Τελείωσε νωρίς", "την αναφορά"], ["Έκανε μακρύ", "διάλειμμα"], ["Βοήθησε", "έναν πελάτη"]],
        fits: "Ταιριάζει", nofit: "Δεν ταιριάζει", pro: "3 υπέρ", con: "3 κατά",
        meter: ["Η σιγουριά σου"], gap: ["υπερβολική", "σιγουριά"],
        caps: [
          "Έχεις καταλήξει ότι ο νέος συνάδελφος είναι <b>τεμπέλης</b>.",
          "Όλη την εβδομάδα βλέπεις στοιχεία <b>υπέρ και κατά</b>.",
          "Προσέχεις ό,τι <b>ταιριάζει</b> με αυτό που πιστεύεις…",
          "…και ό,τι <b>δεν ταιριάζει</b> περνάει σχεδόν απαρατήρητο.",
          "Ό,τι ταιριάζει μοιάζει με απόδειξη. Η σιγουριά σου <b>όλο και μεγαλώνει</b>.",
          "Όμως τα στοιχεία ήταν μοιρασμένα: <b>3 υπέρ, 3 κατά</b>.",
          "<b>Η λύση:</b> ψάξε ό,τι θα μπορούσε να σε διαψεύσει.",
          "Ζύγισε και τις δύο πλευρές. Τώρα η σιγουριά σου <b>συμβαδίζει με τα στοιχεία</b>."
        ],
        say: [
          "Έχεις καταλήξει ότι ο νέος συνάδελφος είναι τεμπέλης.",
          "Όλη την εβδομάδα βλέπεις στοιχεία υπέρ και κατά.",
          "Προσέχεις ό,τι ταιριάζει με αυτό που πιστεύεις...",
          "...και ό,τι δεν ταιριάζει περνάει σχεδόν απαρατήρητο.",
          "Ό,τι ταιριάζει μοιάζει με απόδειξη. Η σιγουριά σου όλο και μεγαλώνει.",
          "Όμως τα στοιχεία ήταν μοιρασμένα. Τρία υπέρ, τρία κατά.",
          "Η λύση: ψάξε ό,τι θα μπορούσε να σε διαψεύσει.",
          "Ζύγισε και τις δύο πλευρές, και η σιγουριά σου θα συμβαδίζει με τα στοιχεία.",
          "Μεροληψία επιβεβαίωσης. Βρίσκεις αυτό που ψάχνεις. Ψάξε και ό,τι θα μπορούσε να σε διαψεύσει."
        ]
      }
    },
    svg(T) {
      const card = (row) => {
        const plus = PLUS.includes(row), [l1, l2] = T.cards[row];
        const c = CH / 2, sign = plus ? `M7 ${c} H13 M10 ${c - 3} V${c + 3}` : `M7 ${c} H13`;
        const lines = l2 ? `<text x="21" y="12.3">${l1}</text><text x="21" y="24.3">${l2}</text>` : `<text x="21" y="${c + 4}">${l1}</text>`;
        return `<g class="cb-card" data-k="c${row}">
          <rect class="bg" width="${CW}" height="${CH}" rx="5"/>
          ${plus ? `<rect class="lit" data-k="l${row}" width="${CW}" height="${CH}" rx="5"/>` : ""}
          <circle class="bd" cx="10" cy="${c}" r="5.5"/><path class="sg" d="${sign}"/>${lines}
          ${plus ? `<path class="ck" data-k="k${row}" d="M${CW - 14} ${c} L${CW - 11} ${c + 3} L${CW - 6} ${c - 3}"/>` : ""}</g>`;
      };
      const mt = T.meter.map((s, i) => `<text class="cb-mt" x="${BX + BW / 2}" y="${(T.meter.length > 1 ? 44 : 56) + i * 12}">${s}</text>`).join("");
      const ticks = [[1, "100%"], [.5, "50%"], [0, "0%"]].map(([p, s]) => `<line class="cb-bar" x1="${BX + BW}" x2="${BX + BW + 4}" y1="${my(p)}" y2="${my(p)}"/><text class="cb-tk" x="${BX + BW + 7}" y="${my(p) + 3}">${s}</text>`).join("");
      return `
        <polygon class="cb-beam" data-k="beam" points=""/>
        <g data-k="person"><circle class="cb-line" cx="40" cy="28" r="11"/><path class="cb-line" d="M18 72 V66 C18 54 28 46 40 46 C52 46 62 54 62 66 V72"/>
          <g class="cb-tag" data-k="tag"><line x1="56" y1="52" x2="${TAGX + 6}" y2="40"/><rect x="${TAGX}" y="24" width="${T.tagW}" height="26" rx="6"/>
            <circle cx="${TAGX + 7}" cy="37" r="2"/><text data-k="tagt" x="${TAGX + 6 + T.tagW / 2}" y="42"></text></g></g>
        <text class="cb-lbl cb-fit" data-k="fitsL" x="${FIT_X}" y="${pileY(0) - 8}">${T.fits}</text>
        <text class="cb-lbl cb-no" data-k="noL" x="${NO_X}" y="${pileY(0) - 8}">${T.nofit}</text>
        ${[0, 1, 2, 3, 4, 5].map(card).join("")}
        <g class="cb-tally" data-k="tally">
          <line x1="${FIT_X}" x2="${FIT_X + CW}" y1="${pileY(2) + CH + 8}" y2="${pileY(2) + CH + 8}"/><text x="${FIT_X + CW / 2}" y="${pileY(2) + CH + 24}">${T.pro}</text>
          <line x1="${NO_X}" x2="${NO_X + CW}" y1="${pileY(2) + CH + 8}" y2="${pileY(2) + CH + 8}"/><text x="${NO_X + CW / 2}" y="${pileY(2) + CH + 24}">${T.con}</text></g>
        <g class="cb-mag" data-k="mag"><circle r="8.5"/><path d="M6.3 6.3 L13 13"/></g>
        <g data-k="meter">${mt}
          <rect class="cb-fill" data-k="fill" x="${BX}" width="${BW}" rx="2"/>
          <rect class="cb-fillok" data-k="fillok" x="${BX}" width="${BW}" rx="2"/>
          <rect class="cb-bar" x="${BX}" y="${TOP}" width="${BW}" height="${BOT - TOP}" rx="4"/>${ticks}
          <text class="cb-val" data-k="val" x="${BX + BW / 2}"></text>
          <g data-k="split"><line class="cb-halo" x1="${BX + 2}" x2="${BX + BW - 2}" y1="${my(.5)}" y2="${my(.5)}"/><line class="cb-split" x1="${BX + 2}" x2="${BX + BW - 2}" y1="${my(.5)}" y2="${my(.5)}"/></g></g>
        <g class="cb-gap" data-k="gap"><path data-k="gapp" d=""/>${T.gap.map((s, i) => `<text data-k="gapt${i}" x="${GX - 7}">${s}</text>`).join("")}</g>`;
    },
    S0: { person: 0, swing: 0, meter: 0, m: 0, a0: 0, a1: 0, a2: 0, a3: 0, a4: 0, a5: 0, beam: -.4, beamOp: 0, lift: 0,
      fitsL: 0, sink: 0, noL: 0, ck: 0, tally: 0, split: 0, gap: 0, mag: 0, magP: 0, seen: -.35, calm: 0, q: 0, ok: 0 },
    render(S, k, T) {
      const op = (key, v) => { k(key).style.opacity = v; };
      op("person", S.person);
      k("tag").setAttribute("transform", `rotate(${S.swing} 56 52)`);
      k("tagt").textContent = S.q > .5 ? T.tag2 : T.tag;
      // the spotlight comes from the label you've already stuck on him
      const by = feedY(Math.max(0, Math.min(5, S.beam))), ax = TAGX + T.tagW / 2, L = FEED_X - 5, R = FEED_X + CW + 5;
      k("beam").setAttribute("points", `${ax},50 ${R},${by - 5} ${R},${by + CH + 5} ${L},${by + CH + 5}`);
      op("beam", S.beamOp);
      for (let row = 0; row < 6; row++) {
        const a = S["a" + row], j = PLUS.indexOf(row), m = MINUS.indexOf(row);
        let x = FEED_X, y = feedY(row) - 14 * (1 - a), s = 1, o = a;
        if (j >= 0) {
          const p = clamp(S.lift * 1.5 - j * .25);
          x += (FIT_X - FEED_X) * p; y += (pileY(j) - feedY(row)) * p - 12 * Math.sin(Math.PI * p);
          op("l" + row, clamp((S.beam - row + .2) * 3) * (1 - S.calm));
          op("k" + row, clamp(S.ck - j) * (1 - S.calm));
        } else {
          const b = clamp((S.seen - m) * 1.6 + .5), f = S.sink * (1 - b);
          y += (pileY(m) - feedY(row)) * S.sink; s = 1 - .22 * f; o = a * (1 - .76 * f);
        }
        const g = k("c" + row);
        g.setAttribute("transform", `translate(${x + CW / 2 * (1 - s)} ${y + CH / 2 * (1 - s)}) scale(${s})`);
        g.style.opacity = o;
      }
      op("fitsL", S.fitsL); op("noL", S.noL * (.45 + .55 * clamp(S.seen)));
      op("tally", S.tally);
      k("mag").setAttribute("transform", `translate(${NO_X + CW + 14} ${pileY(0) + CH / 2 + 31 * S.magP})`);
      op("mag", S.mag);
      // meter
      op("meter", S.meter);
      const ly = my(S.m);
      for (const f of ["fill", "fillok"]) { k(f).setAttribute("y", ly); k(f).setAttribute("height", Math.max(0, BOT - ly)); }
      op("fillok", S.ok);
      const v = k("val"); v.setAttribute("y", ly + 12); v.textContent = Math.round(S.m * 100) + "%"; v.style.opacity = clamp((S.m - .12) * 8);
      op("split", S.split);
      const top = my(Math.max(S.m, .5)), bot = my(.5), mid = (top + bot) / 2 - (T.gap.length - 1) * 6 + 3;
      k("gapp").setAttribute("d", `M${GX - 4} ${top} H${GX + 4} M${GX} ${top} V${bot} M${GX - 4} ${bot} H${GX + 4}`);
      T.gap.forEach((_, i) => k("gapt" + i).setAttribute("y", mid + i * 12));
      op("gap", S.gap);
    },
    beats: [
      { steps: [{ to: { person: 1 }, ms: 600, sfx: "pluck" }, { to: { swing: 12 }, ms: 260 }, { to: { swing: -8 }, ms: 300, ease: "inOut" }, { to: { swing: 0 }, ms: 300, ease: "inOut" },
        { to: { meter: 1 }, ms: 300 }, { to: { m: .6 }, ms: 700, ease: "inOut" }] },
      { steps: [0, 1, 2, 3, 4, 5].flatMap(i => [{ to: { ["a" + i]: 1 }, ms: 240, ease: "back", sfx: i % 3 ? undefined : "pop" }, { wait: 100 }]) },
      { steps: [{ to: { beamOp: 1 }, ms: 300 }, { to: { beam: 5.3 }, ms: 1500, ease: "inOut" }, { to: { beamOp: 0 }, ms: 300 },
        { to: { lift: 1, fitsL: 1 }, ms: 900, ease: "inOut", sfx: "whoosh" }] },
      { steps: [{ to: { sink: 1, noL: 1 }, ms: 1000, ease: "inOut", sfx: "tick" }] },
      { steps: [{ to: { ck: 1, m: .7 }, ms: 450, ease: "back", sfx: "spring" }, { wait: 150 }, { to: { ck: 2, m: .8 }, ms: 450, ease: "back" }, { wait: 150 },
        { to: { ck: 3, m: .9 }, ms: 450, ease: "back" }] },
      { steps: [{ to: { tally: 1 }, ms: 500, sfx: "tick" }, { wait: 400 }, { to: { split: 1 }, ms: 400 }, { to: { gap: 1 }, ms: 500 }] },
      { steps: [{ to: { mag: 1 }, ms: 400, sfx: "pop" }, { to: { magP: 2.35, seen: 2.35 }, ms: 1400, ease: "inOut" }, { to: { magP: 1 }, ms: 500, ease: "inOut" }] },
      { steps: [{ to: { calm: 1, q: 1, swing: 10 }, ms: 400 }, { to: { swing: 0 }, ms: 400, ease: "inOut" },
        { to: { m: .5, ok: 1, gap: 0, split: 0 }, ms: 1100, ease: "inOut", sfx: "chime" }], hold: 4200 }
    ]
  };
})();
