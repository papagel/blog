/* Habit: write predictions down. A match you gave 40%, a win, a memory that now says
   "I knew it!", and a dated note that says otherwise. A few notes make a track record.
   The notebook and pen follow the habit's tile drawing (data/habit-art.json). Scene for anim.js. */
(function () {
  const KEY = "habit-predictions", P = `.bp[data-scene="${KEY}"]`;
  const f1 = n => +n.toFixed(1);
  const clamp = v => Math.max(0, Math.min(1, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const io = t => (t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

  // the scoreboard (steps 1 to 3)
  const SX = 14, SY = 58, SW = 168, SC = SX + SW / 2, SH = 56, SA = 140;
  // the notebook, drawn like the tile: rings on top, a dated entry, a pen resting beside it
  const NX = 14, NY = 28, NW = 156, NH = 128, NI = NX + NW - 3;
  const ROW = [{ y: 52, top: 34, bot: 65 }, { y: 92, top: 77, bot: 97 }, { y: 124, top: 99, bot: 132 }];
  const LX = 26;                                      // left edge of the writing
  const V = [96, 124];                                // the written 40%: centre, baseline
  const TIP = [-9.4, 17.7], REST = [186, 112];       // pen: tip offset from its origin, resting place
  // the thought bubble
  const BX = 212, BY = 14, BW = 176, BH = 176, BC = BX + BW / 2;
  const KY0 = 117, KY1 = 64, KS = .72;                // "I knew it!": baseline before and after the check
  const LY0 = 74, LY1 = 40;                           // the bubble's label, before and after the check
  const NV = [BC, 170];                               // where the note's 40% lands
  // the track record: five dated notes, called it (1) or missed (0)
  const MX = i => 14 + i * 50, MY = 212, MW = 40, MH = 46;
  const PCT = [70, 80, 60, 30, 40], HIT = [1, 0, 1, 1, 0];
  const CHIP = [[SX, SY + 78], [NX, 166]];                 // "3 weeks later": under the scoreboard, then under the note

  window.BiasAnim.SCENES[KEY] = {
    q: "nem", viewBox: "0 0 400 272",
    css: `
      ${P} .hp-sb rect{fill:var(--surface);stroke:var(--ink);stroke-width:2}
      ${P} .hp-sb line{stroke:var(--rule);stroke-width:1.5}
      ${P} .hp-hd{font:500 9px var(--mono);fill:var(--muted);text-anchor:middle;letter-spacing:.12em}
      ${P} .hp-sc{font:700 26px var(--display);fill:var(--ink);text-anchor:middle}
      ${P} .hp-sc.w{fill:var(--q)}
      ${P} .hp-sq{font:700 22px var(--display);fill:var(--faint);text-anchor:middle}
      ${P} .hp-dash{font:600 20px var(--display);fill:var(--faint);text-anchor:middle}
      ${P} .hp-team{font:500 9.5px var(--display);fill:var(--muted);text-anchor:middle}
      ${P} .hp-chip rect{fill:var(--surface);stroke:var(--muted);stroke-width:1.4}
      ${P} .hp-chip .ci{fill:none;stroke:var(--q);stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}
      ${P} .hp-chip text{font:500 10px var(--mono);fill:var(--ink)}
      ${P} .hp-nb .pa{fill:var(--surface);stroke:var(--ink);stroke-width:2.2}
      ${P} .hp-nb .rg{stroke:var(--muted);stroke-width:2.4;stroke-linecap:round}
      ${P} .hp-nb .cal{fill:none;stroke:var(--q);stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
      ${P} .hp-nb .dot{fill:var(--q)}
      ${P} .hp-nb .dt{font:500 10.5px var(--mono);fill:var(--q);letter-spacing:.06em}
      ${P} .hp-nb .bk{font:500 9px var(--mono);fill:var(--muted)}
      ${P} .hp-nb .l{font:600 12.5px var(--display);fill:var(--ink)}
      ${P} .hp-nb .l.e{text-anchor:end}
      ${P} .hp-nb .v{font:700 26px var(--display);fill:var(--q);text-anchor:middle}
      ${P} .hp-nb .ul{fill:none;stroke:var(--q);stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
      ${P} .hp-nb .cv{fill:var(--surface)}
      ${P} .hp-nb .rs{font:600 12px var(--display);fill:var(--ink)}
      ${P} .hp-nb .x{fill:none;stroke:var(--bad);stroke-width:2.6;stroke-linecap:round}
      ${P} .hp-pen .b{fill:var(--surface);stroke:var(--ink);stroke-width:2.2;stroke-linejoin:round}
      ${P} .hp-pen .s{fill:none;stroke:var(--ink);stroke-width:2;stroke-linecap:round}
      ${P} .hp-bub{fill:var(--surface);stroke:var(--q);stroke-width:1.8}
      ${P} .hp-lab{font:500 9.5px var(--mono);fill:var(--muted);text-anchor:middle}
      ${P} .hp-lab.ok{fill:var(--good)}
      ${P} .hp-big{font:700 38px var(--display);fill:var(--ink);text-anchor:middle}
      ${P} .hp-bq{font:700 30px var(--display);fill:var(--faint);text-anchor:middle}
      ${P} .hp-sub{font:600 12px var(--display);fill:var(--muted);text-anchor:middle}
      ${P} .hp-knew{font:700 26px var(--display);fill:var(--ink);text-anchor:middle}
      ${P} .hp-knew.m{fill:var(--muted)}
      ${P} .hp-strike{fill:none;stroke:var(--bad);stroke-width:2.4;stroke-linecap:round}
      ${P} .hp-tag rect{fill:var(--surface);stroke:var(--q);stroke-width:1.6}
      ${P} .hp-tag path{fill:var(--q)}
      ${P} .hp-tag text{font:600 11px var(--display);fill:var(--q);text-anchor:middle}
      ${P} .hp-fv{font:700 26px var(--display);text-anchor:middle}
      ${P} .hp-fv.q{fill:var(--q)}
      ${P} .hp-fv.ok{fill:var(--good)}
      ${P} .hp-man circle,${P} .hp-man path{fill:none;stroke:var(--ink);stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
      ${P} .hp-mini .pa{fill:var(--surface);stroke:var(--ink);stroke-width:1.8}
      ${P} .hp-mini .rg{stroke:var(--muted);stroke-width:2;stroke-linecap:round}
      ${P} .hp-mini .d{font:500 9px var(--mono);fill:var(--muted);text-anchor:middle}
      ${P} .hp-mini .v{font:700 14px var(--display);fill:var(--ink);text-anchor:middle}
      ${P} .hp-mini .bd circle{fill:var(--surface);stroke-width:1.8}
      ${P} .hp-mini .bd path{fill:none;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
      ${P} .hp-mini .bd.ok circle,${P} .hp-mini .bd.ok path{stroke:var(--good)}
      ${P} .hp-mini .bd.no circle,${P} .hp-mini .bd.no path{stroke:var(--bad)}
      ${P} .hp-sl{font:500 9.5px var(--mono);fill:var(--muted);text-anchor:middle}
      ${P} .hp-ss{font:700 18px var(--display);fill:var(--good);text-anchor:middle}
    `,
    text: {
      en: {
        name: "Write predictions down", shareTitle: "Write predictions down: a habit in 30 seconds",
        ecline: "A dated note remembers what you really thought, even after your memory rewrites it.",
        hd0: "SAT 14 MAR · 21:00", hd1: "FULL TIME", us: "Your team", them: "Rivals",
        later: "3 weeks later", laterW: 112,
        chance: "chance we win", draw: "probably a draw", memory: "your memory", knew: "I knew it!", knewW: 112,
        date: "SAT 14 MAR", before: "before kick-off", line: "Probably a draw.", win: "Win:", result: "Won 2–1",
        rowW: [112, 104, 100],
        noteLab: "your note", tag: "Hindsight bias", tagW: 104,
        days: ["12 JAN", "3 FEB", "20 FEB", "1 MAR", "14 MAR"], right: "you were right", score: "3 of 5",
        caps: [
          "Big match Saturday. You think: probably a draw, <b>40%</b> we win.",
          "Your team <b>wins 2–\u20601</b>. Weeks go by.",
          "Your memory quietly rewrites itself: “<b>I knew it!</b>”",
          "<b>The habit:</b> before the match, write your guess down, <b>with the date</b>.",
          "Weeks later, open the note. It says <b>40%</b>, not “I knew it”.",
          "Then mark it. You'd called a draw, so it's a <b>miss</b>.",
          "A dated note catches <b>hindsight bias</b> in the act.",
          "After a few notes, you see how good your guesses <b>really</b> are."
        ],
        say: [
          "Big match on Saturday. You think: probably a draw. Maybe forty percent we win.",
          "Your team wins, two one. Weeks go by.",
          "Your memory quietly rewrites itself. I knew it!",
          "The habit: before the match, write your guess down, with the date.",
          "Weeks later, open the note. It says forty percent, not I knew it.",
          "Then mark it. You'd called a draw, so it's a miss.",
          "A dated note catches hindsight bias in the act.",
          "After a few notes, you see how good your guesses really are.",
          "Write predictions down. A dated note remembers what you really thought, even after your memory rewrites it."
        ]
      },
      el: {
        name: "Γράψε τις προβλέψεις σου", shareTitle: "Γράψε τις προβλέψεις σου: μια συνήθεια σε 30 δευτερόλεπτα",
        ecline: "Ένα σημείωμα με ημερομηνία θυμάται τι πίστευες πραγματικά, ακόμα κι όταν η μνήμη σου το έχει ξαναγράψει.",
        hd0: "ΣΑΒ 14 ΜΑΡ · 21:00", hd1: "ΛΗΞΗ", us: "Η ομάδα σου", them: "Αντίπαλοι",
        later: "3 εβδομάδες μετά", laterW: 130,
        chance: "πιθανότητα νίκης", draw: "μάλλον ισοπαλία", memory: "η μνήμη σου", knew: "Το ήξερα!", knewW: 118,
        date: "ΣΑΒ 14 ΜΑΡ", before: "πριν τη σέντρα", line: "Μάλλον ισοπαλία.", win: "Νίκη:", result: "Κερδίσαμε 2–1",
        rowW: [112, 108, 100],
        noteLab: "το σημείωμά σου", tag: "Μεροληψία εκ των υστέρων", tagW: 160,
        days: ["12 ΙΑΝ", "3 ΦΕΒ", "20 ΦΕΒ", "1 ΜΑΡ", "14 ΜΑΡ"], right: "έπεσες μέσα", score: "3 στις 5",
        caps: [
          "Μεγάλο ματς το Σάββατο. Σκέφτεσαι: μάλλον ισοπαλία, <b>40%</b> να κερδίσουμε.",
          "Η ομάδα σου <b>κερδίζει 2–\u20601</b>. Περνούν μερικές εβδομάδες.",
          "Η μνήμη σου ξαναγράφεται στα κρυφά: «<b>Το ήξερα!</b>»",
          "<b>Η συνήθεια:</b> πριν το ματς, γράψε την πρόβλεψή σου <b>με ημερομηνία</b>.",
          "Εβδομάδες μετά, ανοίγεις το σημείωμα. Γράφει <b>40%</b>, όχι «το ήξερα».",
          "Σημείωσε και το αποτέλεσμα. Είχες\u00a0πει ισοπαλία, άρα <b>έπεσες έξω</b>.",
          "Ένα σημείωμα με ημερομηνία πιάνει στα\u00a0πράσα τη <b>μεροληψία εκ των υστέρων</b>.",
          "Με λίγα σημειώματα, βλέπεις πόσο\u00a0καλά προβλέπεις <b>στ’\u00a0αλήθεια</b>."
        ],
        say: [
          "Μεγάλο ματς το Σάββατο. Σκέφτεσαι: μάλλον ισοπαλία. Σαράντα τοις εκατό να κερδίσουμε.",
          "Η ομάδα σου κερδίζει, δύο ένα. Περνούν μερικές εβδομάδες.",
          "Η μνήμη σου ξαναγράφεται στα κρυφά. Το ήξερα!",
          "Η συνήθεια: πριν το ματς, γράψε την πρόβλεψή σου, με ημερομηνία.",
          "Εβδομάδες μετά, ανοίγεις το σημείωμα. Γράφει σαράντα τοις εκατό, όχι το ήξερα.",
          "Σημείωσε και το αποτέλεσμα. Είχες πει ισοπαλία, άρα έπεσες έξω.",
          "Ένα σημείωμα με ημερομηνία πιάνει στα πράσα τη μεροληψία εκ των υστέρων.",
          "Με λίγα σημειώματα, βλέπεις πόσο καλά προβλέπεις στ’ αλήθεια.",
          "Γράψε τις προβλέψεις σου. Ένα σημείωμα με ημερομηνία θυμάται τι πίστευες πραγματικά, ακόμα κι όταν η μνήμη σου το έχει ξαναγράψει."
        ]
      }
    },
    svg(T) {
      // notebook rings, as on the tile
      let rings = "";
      for (let i = 0; i < 8; i++) { const x = f1(NX + 13 + i * 18.6); rings += `<path class="rg" d="M${x} ${NY - 6} V${NY + 5}"/>`; }
      const covers = ROW.map((r, i) => `<rect class="cv" data-k="cv${i}" y="${r.top}" height="${r.bot - r.top}"/>`).join("");
      const tag = `<path d="M${BC - 5} 80 L${BC} 74.5 L${BC + 5} 80 Z"/><rect x="${BC - T.tagW / 2}" y="79.5" width="${T.tagW}" height="20" rx="10"/><text x="${BC}" y="93.5">${T.tag}</text>`;
      const minis = PCT.map((p, i) => {
        const x = MX(i), c = x + MW / 2, bx = x + MW, by = MY;
        const mark = HIT[i] ? `M${bx - 3.4} ${by + .2} l2.4 2.6 l4.6 -5.2` : `M${bx - 2.7} ${by - 2.7} l5.4 5.4 M${bx + 2.7} ${by - 2.7} l-5.4 5.4`;
        return `<g class="hp-mini" data-k="m${i}"><rect class="pa" x="${x}" y="${MY}" width="${MW}" height="${MH}" rx="5"/>
          <path class="rg" d="M${x + 10} ${MY - 4} V${MY + 4} M${x + 20} ${MY - 4} V${MY + 4} M${x + 30} ${MY - 4} V${MY + 4}"/>
          <text class="d" x="${c}" y="${MY + 17}">${T.days[i]}</text><text class="v" x="${c}" y="${MY + 38}">${p}%</text>
          <g class="bd ${HIT[i] ? "ok" : "no"}"><circle cx="${bx}" cy="${by}" r="7"/><path d="${mark}"/></g></g>`;
      }).join("");
      return `
        <g class="hp-sb" data-k="sb"><rect x="${SX}" y="${SY}" width="${SW}" height="68" rx="8"/><line x1="${SX}" y1="${SY + 22}" x2="${SX + SW}" y2="${SY + 22}"/>
          <text class="hp-hd" data-k="hd0" x="${SC}" y="${SY + 15}">${T.hd0}</text><text class="hp-hd" data-k="hd1" x="${SC}" y="${SY + 15}">${T.hd1}</text>
          <text class="hp-sq" data-k="q0" x="${SH}" y="${SY + 50}">?</text><text class="hp-sq" data-k="q1" x="${SA}" y="${SY + 50}">?</text>
          <text class="hp-sc w" data-k="s0" x="${SH}" y="${SY + 51}">2</text><text class="hp-sc" data-k="s1" x="${SA}" y="${SY + 51}">1</text>
          <text class="hp-dash" x="${SC}" y="${SY + 48}">–</text>
          <text class="hp-team" x="${SH}" y="${SY + 62}">${T.us}</text><text class="hp-team" x="${SA}" y="${SY + 62}">${T.them}</text></g>
        <g class="hp-chip" data-k="chip"><rect x="0" y="0" width="${T.laterW}" height="20" rx="10"/>
          <g data-k="cal"><rect class="ci" x="9" y="5.5" width="13" height="11" rx="2"/><path class="ci" d="M9 9.5 H22 M12.5 3.5 V7 M18.5 3.5 V7"/></g>
          <text x="28" y="13.5">${T.later}</text></g>
        <g class="hp-nb" data-k="nb">
          <rect class="pa" x="${NX}" y="${NY}" width="${NW}" height="${NH}" rx="7"/>${rings}
          <g class="cal"><rect x="${LX}" y="39" width="20" height="17" rx="3"/><path d="M${LX} 45 H${LX + 20} M${LX + 5} 36 V41 M${LX + 15} 36 V41"/></g>
          <circle class="dot" cx="${LX + 10}" cy="50.5" r="2"/>
          <text class="dt" x="${LX + 28}" y="48">${T.date}</text><text class="bk" x="${LX + 28}" y="60">${T.before}</text>
          <text class="l" x="${LX}" y="${ROW[1].y}">${T.line}</text>
          <text class="l e" x="${V[0] - 32}" y="${V[1]}">${T.win}</text><text class="v" x="${V[0]}" y="${V[1]}">40%</text>
          <path class="ul" data-k="ul" d="M${V[0] - 26} ${V[1] + 6} q10 -3 20 0 t20 0 t12 -1"/>
          ${covers}
          <g data-k="res"><text class="rs" x="${LX + 16}" y="147">${T.result}</text></g>
          <path class="x" data-k="x" d="M${LX + 1} 138 l9 9 M${LX + 10} 138 l-9 9"/>
        </g>
        <g class="hp-pen" data-k="pen"><g transform="rotate(28)"><path class="b" d="M-4 -24 H4 V12 L0 20 L-4 12 Z"/><path class="s" d="M-4 12 H4 M-4 -16 H4"/></g></g>
        <g data-k="bub">
          <rect class="hp-bub" x="${BX}" y="${BY}" width="${BW}" height="${BH}" rx="22"/>
          <circle class="hp-bub" cx="356" cy="202" r="4"/><circle class="hp-bub" cx="362" cy="213" r="2.6"/>
          <g data-k="lab"><text class="hp-lab" data-k="lc" x="${BC}" y="0">${T.chance}</text><text class="hp-lab" data-k="lm" x="${BC}" y="0">${T.memory}</text></g>
          <text class="hp-bq" data-k="bq" x="${BC}" y="${KY0}">?</text>
          <text class="hp-big" data-k="g" x="${BC}" y="${KY0 + 2}"></text>
          <text class="hp-sub" data-k="draw" x="${BC}" y="${KY0 + 25}">${T.draw}</text>
          <g data-k="kn"><text class="hp-knew" data-k="kn0">${T.knew}</text><text class="hp-knew m" data-k="kn1">${T.knew}</text></g>
          <path class="hp-strike" data-k="strike"/>
          <g class="hp-tag" data-k="tag">${tag}</g>
          <text class="hp-lab ok" data-k="ln" x="${BC}" y="136">${T.noteLab}</text>
        </g>
        <g data-k="fly"><text class="hp-fv q" data-k="fq">40%</text><text class="hp-fv ok" data-k="fg">40%</text></g>
        <g class="hp-man" data-k="man"><circle cx="370" cy="233" r="8"/><path d="M354 262 V257 a16 13 0 0 1 32 0 V262"/></g>
        ${minis}
        <g data-k="sum"><text class="hp-sl" x="302" y="${MY + 17}">${T.right}</text><text class="hp-ss" x="302" y="${MY + 39}">${T.score}</text></g>`;
    },
    S0: { sb: 0, man: 0, bub: 0, gv: 0, g: 50, draw: 0, ft: 0, sc: 0, chip: 0, chipAt: 0, flip: 0,
      wob: 0, rw: 0, dim: 0, nb: 0, pen: 0, w: 0, ul: 0, rest: 0, up: 0, fly: 0, ln: 0, strike: 0,
      res: 0, x: 0, tag: 0, m0: 0, m1: 0, m2: 0, m3: 0, m4: 0, sum: 0 },
    render(S, k, T) {
      const op = (key, v) => { k(key).style.opacity = v; };
      const tr = (key, x, y, s) => k(key).setAttribute("transform", `translate(${f1(x)} ${f1(y)})${s !== undefined ? ` scale(${f1(s * 100) / 100})` : ""}`);
      // scoreboard: before kick-off, then full time
      const s = .9 + .1 * S.sb;
      k("sb").setAttribute("transform", `translate(${SC} ${SY + 34}) scale(${f1(s * 100) / 100}) translate(${-SC} ${-SY - 34})`);
      op("sb", clamp(S.sb * 1.5));
      op("hd0", 1 - S.ft); op("hd1", S.ft);
      op("q0", 1 - clamp(S.sc * 2)); op("q1", 1 - clamp(S.sc * 2));
      for (const [key, x] of [["s0", SH], ["s1", SA]]) {
        const p = Math.max(0, S.sc);
        k(key).setAttribute("transform", `translate(${x} ${SY + 42}) scale(${f1(p * 100) / 100}) translate(${-x} ${-SY - 42})`);
        op(key, clamp(S.sc * 2));
      }
      // "3 weeks later"
      const [cx0, cy0] = CHIP[0], [cx1, cy1] = CHIP[1];
      tr("chip", lerp(cx0, cx1, S.chipAt) - 8 * (1 - S.chip), lerp(cy0, cy1, S.chipAt));
      op("chip", S.chip);
      const fl = Math.abs(Math.cos(Math.PI * S.flip));
      k("cal").setAttribute("transform", `translate(0 ${f1(11 * (1 - fl))}) scale(1 ${f1((.2 + .8 * fl) * 100) / 100})`);
      // you, and the thought bubble
      op("man", S.man);
      k("bub").setAttribute("transform", `translate(${f1(8 * (1 - S.bub))} ${f1(8 * (1 - S.bub))})`);
      op("bub", S.bub * (1 - .6 * S.dim));
      tr("lab", 0, lerp(LY0, LY1, S.up));
      op("lc", 1 - clamp(S.rw * 2)); op("lm", clamp(S.rw * 2 - 1));
      op("bq", 1 - S.gv);
      const g = k("g"); g.textContent = Math.round(S.g) + "%";
      const jig = Math.sin(S.wob * Math.PI * 6) * 3 * (1 - S.rw);
      g.setAttribute("transform", `translate(${f1(jig)} 0)`);
      op("g", S.gv * (1 - clamp(S.rw * 1.6)));
      op("draw", S.draw * (1 - clamp(S.rw * 1.6)));
      // the rewritten memory: grows in, later moves up to make room for the note, then is struck out
      const pop = .8 + .2 * S.rw, ks = lerp(1, KS, S.up) * pop, ky = lerp(KY0, KY1, S.up);
      tr("kn", BC, ky, ks);
      op("kn", clamp(S.rw * 1.4 - .4));
      op("kn0", 1 - S.strike); op("kn1", S.strike);
      const half = T.knewW * KS / 2 + 4, sy = f1(KY1 - 6);
      k("strike").setAttribute("d", `M${f1(BC - half)} ${sy} L${f1(BC - half + 2 * half * S.strike)} ${sy}`);
      op("strike", S.strike > 0 ? 1 : 0);
      tr("tag", 0, 5 * (1 - S.tag)); op("tag", S.tag);
      op("ln", S.ln);
      // the notebook: each row is uncovered as the pen passes
      tr("nb", 0, 10 * (1 - S.nb)); op("nb", clamp(S.nb * 1.6));
      ROW.forEach((r, i) => {
        const p = clamp(S.w - i), c = k("cv" + i), x = LX - 3 + p * (T.rowW[i] + 3);
        c.setAttribute("x", f1(x)); c.setAttribute("width", p >= 1 ? 0 : f1(Math.max(0, NI - x)));
      });
      const ul = k("ul"); ul.style.strokeDasharray = "64"; ul.style.strokeDashoffset = f1(64 * (1 - S.ul));
      op("ul", S.ul > 0 ? 1 : 0);
      tr("res", -6 * (1 - S.res), 0); op("res", S.res);
      const xm = k("x"); xm.style.strokeDasharray = "26 26"; xm.style.strokeDashoffset = f1(26 * (1 - S.x));
      op("x", S.x > 0 ? 1 : 0);
      // the pen: writes along the rows, then rests beside the notebook like on the tile
      const r = Math.min(2, Math.floor(S.w)), p = clamp(S.w - r);
      const wx = LX - 2 + p * T.rowW[r] - TIP[0], wy = ROW[r].y + 1 - Math.abs(Math.sin(p * 26)) * 2 - TIP[1];
      const e = io(S.rest);
      tr("pen", lerp(wx, REST[0], e), lerp(wy, REST[1], e));
      op("pen", S.pen);
      // the note's 40% travels to the bubble and turns green
      const fe = io(S.fly);
      tr("fly", lerp(V[0], NV[0], fe), lerp(V[1], NV[1], fe) - 34 * Math.sin(Math.PI * fe), lerp(1, 32 / 26, fe));
      op("fly", S.fly > 0 ? 1 : 0);
      op("fq", 1 - clamp(fe * 2 - .6)); op("fg", clamp(fe * 2 - .6));
      // the track record
      for (let i = 0; i < 5; i++) { const q = S["m" + i]; tr("m" + i, 0, 6 * (1 - q)); op("m" + i, clamp(q * 1.5)); }
      tr("sum", 6 * (1 - S.sum), 0); op("sum", clamp(S.sum));
    },
    beats: [
      { steps: [{ to: { sb: 1 }, ms: 500, ease: "back", sfx: "pluck" }, { to: { man: 1 }, ms: 300 }, { to: { bub: 1 }, ms: 450 },
        { to: { gv: 1, g: 55 }, ms: 300 }, { to: { g: 30 }, ms: 500, ease: "inOut" }, { to: { g: 45 }, ms: 450, ease: "inOut" },
        { to: { g: 40 }, ms: 450, ease: "back" }, { to: { draw: 1 }, ms: 350 }] },
      { steps: [{ to: { ft: 1 }, ms: 300 }, { wait: 150 }, { to: { sc: 1 }, ms: 450, ease: "back", sfx: "pop" }, { wait: 600 },
        { to: { chip: 1 }, ms: 400 }, { to: { flip: 3 }, ms: 1000, ease: "lin" }] },
      { steps: [{ to: { wob: 1 }, ms: 700, ease: "lin" }, { to: { rw: 1 }, ms: 800, ease: "back", sfx: "spring" }], hold: 2800 },
      { steps: [{ to: { sb: 0, chip: 0, dim: 1 }, ms: 500 }, { to: { chipAt: 1, nb: 1 }, ms: 500, ease: "back" }, { to: { pen: 1 }, ms: 200 },
        { to: { w: 1 }, ms: 700, ease: "lin", sfx: "scribble" }, { to: { w: 2 }, ms: 700, ease: "lin" }, { to: { w: 3 }, ms: 600, ease: "lin" },
        { to: { ul: 1 }, ms: 300, ease: "lin" }, { to: { rest: 1 }, ms: 500 }] },
      { steps: [{ to: { chip: 1, dim: 0 }, ms: 400 }, { wait: 200 }, { to: { up: 1 }, ms: 500, ease: "inOut" },
        { to: { fly: 1 }, ms: 900, ease: "lin", sfx: "whoosh" }, { to: { ln: 1 }, ms: 250 }, { to: { strike: 1 }, ms: 350, ease: "lin" }], hold: 2800 },
      { steps: [{ to: { res: 1 }, ms: 450 }, { to: { x: 1 }, ms: 400, ease: "lin", sfx: "tick" }] },
      { steps: [{ to: { tag: 1 }, ms: 500, ease: "back", sfx: "pop" }], hold: 3000 },
      { steps: [{ to: { chip: 0 }, ms: 300 }, { to: { m0: 1 }, ms: 280, sfx: "tick" }, { to: { m1: 1 }, ms: 280 }, { to: { m2: 1 }, ms: 280 },
        { to: { m3: 1 }, ms: 280 }, { to: { m4: 1 }, ms: 280 }, { wait: 200 }, { to: { sum: 1 }, ms: 500, ease: "back", sfx: "chime" }], hold: 4200 }
    ]
  };
})();
