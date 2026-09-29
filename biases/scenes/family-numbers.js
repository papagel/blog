/* Family: simpler numbers. Odds, fractions and money get squeezed into two simple boxes in your head
   ("won't happen / will happen", "fun money / bills", "small change / don't break it"), and the exact
   number disappears inside. Three members as quick examples: mental accounting, the denomination effect,
   normalcy bias. The fix: turn odds into counts, and for big choices open the box. Numbers are
   illustrative, not study figures. Scene for anim.js. */
(function () {
  const KEY = "family-numbers", P = `.bp[data-scene="${KEY}"]`;
  const cl = v => Math.max(0, Math.min(1, v));
  const f1 = n => +n.toFixed(1);
  const lerp = (a, b, p) => a + (b - a) * p;
  const io = p => (p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);
  const back = p => 1 + 2.7 * Math.pow(p - 1, 3) + 1.7 * Math.pow(p - 1, 2);

  // the two boxes in your head: left and right edges, centres; back rim, front top (closed / open), bottom, label
  const BX = [[62, 194], [206, 338]], CX = [128, 272];
  const BT = 160, FT = 172, FO = 226, FB = 250, LY = 242;
  const PEEK = 178, COIN_IN = 176, CARD_IN = 170;   // notes, coins and the flood card rest in a box peeking over the rim, their numbers hidden
  // the messy numbers: start x, y, tilt; box, slot x, slot y (the slots show again when the box opens)
  const TOK = [
    [70, 54, -8, 0, 105, 214],     // 3.7%
    [176, 44, 5, 0, 128, 190],     // 1 in 250
    [118, 106, 6, 0, 151, 214],    // 0.4%
    [284, 50, -4, 1, 250, 190],    // 68%
    [346, 98, 8, 1, 294, 190],     // 92%
    [238, 110, -7, 1, 272, 214]    // 7/12
  ];
  const tw = s => f1(s.length * 7.2 + 14);         // token width (mono 12px)
  const TOP = 78;                                  // notes and coins wait here before they drop
  const COIN = [84, 106, 128, 150, 172];
  const BAG = [36, 179];                           // spent things pile up in the bag, sticking out of its top
  const PILE = [[28, 180], [40, 180], [22, 186], [34, 186], [46, 186]];
  const CARD = [128, 80], CARD7 = [84, 76];        // the flood card: above the left box, then top left
  const GX = 184, GY = 37, GP = 8, GC = 6.4;       // 100 years, 10 x 10
  const MARK = [17, 54, 88];                        // the three flood years

  const note = (key, text, gift) => `<g class="fn-note" data-k="${key}">
      <rect class="o" x="-28" y="-14" width="56" height="28" rx="3"/><rect class="i" x="-24.5" y="-10.5" width="49" height="21" rx="2"/>
      ${gift ? `<rect class="fn-rib" x="-16" y="-14" width="6" height="28"/><path class="fn-bow" d="M-13 -14 C-19 -23 -26 -17 -13 -14 C-7 -23 0 -17 -13 -14"/>` : ""}
      <text x="${gift ? 7 : 0}" y="5">${text}</text></g>`;
  const token = (i, s) => {
    const w = tw(s), box = `<rect class="fn-tk" x="${-w / 2}" y="-9.5" width="${w}" height="19" rx="5"/><text class="fn-tt" y="4.3">${s}</text>`;
    return `<g data-k="t${i}">${box}<g class="fn-ok" data-k="to${i}">${box}</g></g>`;
  };
  // an open-topped box: the inside back wall, then (separately) the front that hides what's inside
  const boxBack = b => { const [x0, x1] = BX[b]; return `<path class="fn-back" d="M${x0} ${FB} V${FT} L${x0 + 10} ${BT} H${x1 - 10} L${x1} ${FT} V${FB} Z"/>`; };
  const wave = y => { let d = `M-67 ${f1(y)}`; for (let i = 0; i < 12; i++) d += ` q2.8 ${i % 2 ? 2.4 : -2.4} 5.6 0 t5.6 0`; return d + ` L67 ${f1(y)} V18 Q67 23 62 23 H-62 Q-67 23 -67 18 Z`; };

  window.BiasAnim.SCENES[KEY] = {
    q: "nem", viewBox: "0 0 400 272",
    css: `
      ${P} .fn-back{fill:var(--surface-2);stroke:var(--ink);stroke-width:2;stroke-linejoin:round}
      ${P} .fn-front{fill:var(--surface);stroke:var(--ink);stroke-width:2.2;stroke-linejoin:round}
      ${P} .fn-bl{font:600 13px var(--display);fill:var(--ink);text-anchor:middle}
      ${P} .fn-strike{stroke:var(--bad);stroke-width:2.4;stroke-linecap:round}
      ${P} .fn-tk{fill:var(--surface);stroke:var(--muted);stroke-width:1.4}
      ${P} .fn-tt{font:500 12px var(--mono);fill:var(--ink);text-anchor:middle}
      ${P} .fn-ok .fn-tk{stroke:var(--good);stroke-width:1.8}
      ${P} .fn-ok .fn-tt{fill:var(--good);font-weight:600}
      ${P} .fn-note .o{fill:var(--surface);stroke:var(--ink);stroke-width:1.8}
      ${P} .fn-note .i{fill:none;stroke:var(--q);stroke-width:1;stroke-opacity:.6}
      ${P} .fn-note text{font:700 13px var(--display);fill:var(--ink);text-anchor:middle}
      ${P} .fn-rib{fill:var(--q);fill-opacity:.55}
      ${P} .fn-bow{fill:none;stroke:var(--q);stroke-width:1.8;stroke-linejoin:round}
      ${P} .fn-coin circle{fill:var(--surface);stroke:var(--q);stroke-width:1.8}
      ${P} .fn-coin text{font:700 10px var(--display);fill:var(--q);text-anchor:middle}
      ${P} .fn-lab{font:500 9.5px var(--mono);fill:var(--muted);text-anchor:middle}
      ${P} .fn-lab.b{fill:var(--bad)}
      ${P} .fn-eq{font:700 16px var(--display);fill:var(--muted);text-anchor:middle}
      ${P} .fn-bag path{fill:var(--surface);stroke:var(--ink);stroke-width:2;stroke-linejoin:round;stroke-linecap:round}
      ${P} .fn-bag .h{fill:none}
      ${P} .fn-chip rect{fill:var(--surface);stroke:var(--q);stroke-width:1.6}
      ${P} .fn-chip text{font:600 12px var(--display);fill:var(--q);text-anchor:middle}
      ${P} .fn-card .o{fill:var(--surface);stroke:var(--ink);stroke-width:2}
      ${P} .fn-card .hs{fill:none;stroke:var(--ink);stroke-width:1.8;stroke-linejoin:round;stroke-linecap:round}
      ${P} .fn-card .wv{fill:var(--bad);fill-opacity:.3;stroke:var(--bad);stroke-width:1.6;stroke-linejoin:round}
      ${P} .fn-card .k{font:500 11.5px var(--mono);fill:var(--muted)}
      ${P} .fn-card .v{font:700 13px var(--display);fill:var(--ink)}
      ${P} .fn-bub rect,${P} .fn-bub path{fill:var(--surface);stroke:var(--q);stroke-width:1.8;stroke-linejoin:round}
      ${P} .fn-bub text{font:600 12px var(--display);fill:var(--ink);text-anchor:middle}
      ${P} .fn-cell{fill:none;stroke:var(--faint);stroke-width:1}
      ${P} .fn-mark{fill:var(--q)}
      ${P} .fn-arrow{fill:none;stroke:var(--q);stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
      ${P} .fn-cnt{font:700 15px var(--display);fill:var(--good)}
    `,
    text: {
      en: {
        name: "Simpler numbers", shareTitle: "Why we squeeze risks and money into simple boxes, in 30 seconds",
        ecline: "Simple boxes are fine for small things, but big choices deserve the real numbers.",
        tok: ["3.7%", "1 in 250", "0.4%", "68%", "92%", "7/12"],
        box: [["won't happen", "will happen"], ["fun money", "bills"], ["small change", "don't break it"]],
        chip: ["Mental accounting", "Denomination effect", "Normalcy bias"],
        n50: "€50", n10: "€10", coin: "2", gift: "gift", salary: "salary", coins: "five €2 coins", note: "one €10 note", spent: "spent",
        flood: "flood", rate: "3% a year", bubble: "“It's never happened here.”",
        cnt: ["3 years", "in 100"], legend: "1 square = 1 year",
        caps: [
          "Odds, percentages, fractions: your brain finds them <b>hard</b>.",
          "So it sorts them into <b>simple boxes</b>. Quick, and usually good enough.",
          "A €50 gift feels like <b>fun money</b>. €50 of salary goes to bills.",
          "Coins feel like <b>small change</b>. They go faster than one €10 note.",
          "It's never flooded here, so the risk goes under <b>won't happen</b>.",
          "But rare isn't never. The label <b>hid the real risk</b>.",
          "<b>The fix:</b> turn odds into counts, like <b>3 years in 100</b>.",
          "Rough is fine for small stuff. For big choices, <b>open the box</b>."
        ],
        say: [
          "Odds, percentages, fractions. Your brain finds them hard.",
          "So it sorts them into simple boxes. It's quick, and usually good enough.",
          "Mental accounting: a fifty-euro gift feels like fun money. Fifty euros of salary goes to bills.",
          "The denomination effect: coins feel like small change, so they go faster than one ten-euro note.",
          "Normalcy bias: it's never flooded here, so the risk goes under won't happen.",
          "But rare isn't never. The label hid the real risk.",
          "The fix: turn odds into counts. Three percent a year is three years in a hundred.",
          "Rough is fine for small stuff. For big choices, open the box.",
          "Simpler numbers. Simple boxes are fine for small things, but big choices deserve the real numbers."
        ]
      },
      el: {
        name: "Απλοποιούμε τους αριθμούς", shareTitle: "Γιατί στριμώχνουμε κινδύνους και χρήματα σε απλά κουτιά, σε 30 δευτερόλεπτα",
        ecline: "Τα απλά κουτιά αρκούν για τα μικρά, αλλά οι μεγάλες αποφάσεις θέλουν τους πραγματικούς αριθμούς.",
        tok: ["3,7%", "1 στα 250", "0,4%", "68%", "92%", "7/12"],
        box: [["δεν θα γίνει", "θα γίνει"], ["για κέφια", "για λογαριασμούς"], ["ψιλά", "μην το χαλάσεις"]],
        chip: ["Νοητική λογιστική", "Φαινόμενο της ονομαστικής αξίας", "Μεροληψία κανονικότητας"],
        n50: "50 €", n10: "10 €", coin: "2", gift: "δώρο", salary: "μισθός", coins: "πέντε δίευρα", note: "ένα δεκάευρο", spent: "έφυγαν",
        flood: "πλημμύρα", rate: "3% τον χρόνο", bubble: "«Εδώ δεν έχει γίνει ποτέ»",
        cnt: ["3 χρονιές", "στις 100"], legend: "1 τετράγωνο = 1 χρονιά",
        caps: [
          "Πιθανότητες, ποσοστά, κλάσματα: το μυαλό σου <b>δυσκολεύεται</b> μ’ αυτά.",
          "Γι’ αυτό τα χωρίζει σε <b>απλά κουτιά</b>. Είναι γρήγορο, και συνήθως αρκεί.",
          "Τα 50 € του δώρου πάνε <b>για κέφια</b>. Τα 50 € του μισθού, για λογαριασμούς.",
          "Τα κέρματα τα νιώθεις <b>ψιλά</b>, και φεύγουν πιο γρήγορα από ένα δεκάευρο.",
          "Εδώ δεν έχει πλημμυρίσει ποτέ, οπότε ο κίνδυνος μπαίνει στο <b>«δεν θα γίνει»</b>.",
          "Όμως «σπάνια» δεν σημαίνει «ποτέ». Η ταμπέλα <b>έκρυψε τον πραγματικό κίνδυνο</b>.",
          "<b>Η λύση:</b> κάνε τις πιθανότητες συγκεκριμένα νούμερα, όπως <b>3 χρονιές στις 100</b>.",
          "Για τα μικρά, το περίπου αρκεί. Για τα μεγάλα, <b>άνοιξε το κουτί</b>."
        ],
        say: [
          "Πιθανότητες, ποσοστά, κλάσματα. Το μυαλό σου δυσκολεύεται μ’ αυτά.",
          "Γι’ αυτό τα χωρίζει σε απλά κουτιά. Είναι γρήγορο, και συνήθως αρκεί.",
          "Νοητική λογιστική: τα πενήντα ευρώ του δώρου πάνε για κέφια. Τα πενήντα ευρώ του μισθού, για λογαριασμούς.",
          "Φαινόμενο της ονομαστικής αξίας: τα κέρματα τα νιώθεις ψιλά, και φεύγουν πιο γρήγορα από ένα δεκάευρο.",
          "Μεροληψία κανονικότητας: εδώ δεν έχει πλημμυρίσει ποτέ, οπότε ο κίνδυνος μπαίνει στο «δεν θα γίνει».",
          "Όμως «σπάνια» δεν σημαίνει «ποτέ». Η ταμπέλα έκρυψε τον πραγματικό κίνδυνο.",
          "Η λύση: κάνε τις πιθανότητες συγκεκριμένα νούμερα. Τρία τοις εκατό τον χρόνο σημαίνει τρεις χρονιές στις εκατό.",
          "Για τα μικρά, το περίπου αρκεί. Για τα μεγάλα, άνοιξε το κουτί.",
          "Απλοποιούμε τους αριθμούς. Τα απλά κουτιά αρκούν για τα μικρά, αλλά οι μεγάλες αποφάσεις θέλουν τους πραγματικούς αριθμούς."
        ]
      }
    },
    svg(T) {
      let cells = "";
      for (let r = 0; r < 10; r++) {
        cells += `<g data-k="gr${r}">`;
        for (let c = 0; c < 10; c++) cells += `<rect class="fn-cell" x="${f1(GX + c * GP)}" y="${f1(GY + r * GP)}" width="${GC}" height="${GC}" rx="1.2"/>`;
        cells += `</g>`;
      }
      const marks = MARK.map((m, j) => `<rect class="fn-mark" data-k="gm${j}" x="${f1(GX + (m % 10) * GP)}" y="${f1(GY + Math.floor(m / 10) * GP)}" width="${GC}" height="${GC}" rx="1.2"/>`).join("");
      const labels = T.box.map((pair, s) => pair.map((t, b) => `<text class="fn-bl" data-k="l${s}${b}" x="${CX[b]}" y="${LY}">${t}</text>`).join("")).join("");
      const chips = T.chip.map((t, i) => `<g class="fn-chip" data-k="ch${i}"><rect data-k="chr${i}" y="10" height="22" rx="11"/><text data-k="cht${i}" x="200" y="25.2">${t}</text></g>`).join("");
      return `
        <g data-k="backs">${boxBack(0)}${boxBack(1)}</g>
        <g class="fn-bag" data-k="bagh"><path class="h" d="M23 184 V179 Q23 169 34 169 Q45 169 45 179 V184"/></g>
        <g data-k="stuff">
          ${T.tok.map((s, i) => token(i, s)).join("")}
          ${note("n1", T.n50, true)}${note("n2", T.n50, false)}
          ${COIN.map((_, j) => `<g class="fn-coin" data-k="c${j}"><circle r="10"/><text y="3.6">${T.coin}</text></g>`).join("")}
          ${note("n3", T.n10, false)}
          <g class="fn-card" data-k="card">
            <rect class="o" x="-70" y="-26" width="140" height="52" rx="8"/>
            <path class="hs" d="M-60 -3 L-47 -15 L-34 -3 M-57 -5 V15 H-37 V-5 M-49 15 V7 H-45 V15"/>
            <path class="wv" data-k="water" d=""/>
            <text class="k" x="-24" y="-4">${T.flood}</text><text class="v" x="-24" y="13">${T.rate}</text>
          </g>
        </g>
        <g class="fn-bag" data-k="bag"><path d="M13 184 H55 L51 218 H17 Z"/><text class="fn-lab b" x="34" y="234">${T.spent}</text></g>
        <g data-k="fronts">
          <rect class="fn-front" data-k="fL" x="${BX[0][0]}" width="${BX[0][1] - BX[0][0]}" rx="3"/>
          <rect class="fn-front" data-k="fR" x="${BX[1][0]}" width="${BX[1][1] - BX[1][0]}" rx="3"/>
          ${labels}
          <line class="fn-strike" data-k="strike" y1="${LY - 4}" y2="${LY - 4}"/>
        </g>
        <g data-k="nlab"><text class="fn-lab" x="${CX[0]}" y="106">${T.gift}</text><text class="fn-lab" x="${CX[1]}" y="106">${T.salary}</text></g>
        <g data-k="clab"><text class="fn-lab" x="${CX[0]}" y="106">${T.coins}</text><text class="fn-lab" x="${CX[1]}" y="106">${T.note}</text></g>
        <text class="fn-eq" data-k="eq" x="200" y="84">=</text>
        <g class="fn-bub" data-k="bub"><rect data-k="bubr" y="46" height="30" rx="10"/><path d="M236 74.6 L228 87 L248 74.6"/><text data-k="bubt" x="298" y="65.5">${T.bubble}</text></g>
        ${chips}
        <path class="fn-arrow" data-k="arrow" d="M160 76 H176 M171 71 L176 76 L171 81"/>
        <g data-k="grid">${cells}${marks}</g>
        <g data-k="glab"><text class="fn-cnt" x="272" y="72">${T.cnt[0]}</text><text class="fn-cnt" x="272" y="91">${T.cnt[1]}</text>
          <text class="fn-lab" x="${GX + 39}" y="129">${T.legend}</text></g>`;
    },
    S0: { tok: 0, boxes: 0, lab0: 0, lab1: 0, lab2: 0, fly: 0, ch0: 0, ch1: 0, ch2: 0, notes: 0, nfly: 0, bag: 0, spend1: 0,
      coins: 0, cfly: 0, spend2: 0, sink2: 0, sink3: 0, flIn: 0, bub: 0, flDrop: 0, flOut: 0, water: 0, strike: 0, flMove: 0,
      grid: 0, marks: 0, glab: 0, open: 0, ok: 0 },
    render(S, k) {
      const op = (key, v) => { k(key).style.opacity = f1(cl(v) * 1000) / 1000; };
      const tr = (key, x, y, extra) => k(key).setAttribute("transform", `translate(${f1(x)} ${f1(y)})${extra || ""}`);
      const len = (el, fb) => { try { return el.getComputedTextLength() || fb; } catch (e) { return fb; } };
      // an arc from a box up and over into the bag, where it stays sticking out of the top
      const toBag = (x0, y0, [x1, y1], e, h) => [lerp(x0, x1, e), lerp(y0, y1, e) - h * Math.sin(Math.PI * e)];
      const sc = v => ` scale(${f1(Math.max(0, v) * 100) / 100})`;

      // the boxes rise into place; the front drops open at the end
      const rise = (1 - S.boxes) * 10;
      tr("backs", 0, rise); tr("fronts", 0, rise);
      op("backs", S.boxes); op("fronts", S.boxes);
      const fy = lerp(FT, FO, S.open);
      for (const f of ["fL", "fR"]) { k(f).setAttribute("y", f1(fy)); k(f).setAttribute("height", f1(FB - fy)); }
      for (let s = 0; s < 3; s++) for (let b = 0; b < 2; b++) {
        const v = S["lab" + s];
        k(`l${s}${b}`).setAttribute("y", f1(LY + 5 * (1 - v)));
        op(`l${s}${b}`, v * (1 - .55 * S.open));
      }
      const lw = len(k("l00"), 80), sx = CX[0] - lw / 2 - 5;
      k("strike").setAttribute("x1", f1(sx)); k("strike").setAttribute("x2", f1(sx + (lw + 10) * S.strike));
      op("strike", S.strike > 0 ? 1 - S.open : 0);

      // the messy numbers pop up, then fly into their boxes
      TOK.forEach(([x0, y0, r0, , x1, y1], i) => {
        const a = cl((S.tok - i * .12) / .4), e = io(cl((S.fly - i * .08) / .6));
        tr("t" + i, lerp(x0, x1, e), lerp(y0, y1, e) - 34 * Math.sin(Math.PI * e), ` rotate(${f1(r0 * (1 - e))})${sc(back(a))}`);
        op("t" + i, a * 3);
        op("to" + i, S.ok);
      });

      // mental accounting: a gift and a salary, the same €50, into different boxes; the gift gets spent
      const nIn = cl(S.notes * 3);
      const d1 = cl(S.nfly / .8), d2 = cl((S.nfly - .2) / .8), s1 = io(S.spend1);
      if (S.spend1 > 0) { const [x, y] = toBag(CX[0], PEEK, BAG, s1, 90); tr("n1", x, y, ` rotate(${f1(4 - 18 * s1)})${sc(1 - .3 * s1)}`); }
      else tr("n1", CX[0], lerp(TOP, PEEK, d1 * d1), ` rotate(${f1(4 * d1)})${sc(S.notes)}`);
      tr("n2", CX[1], lerp(TOP, PEEK, d2 * d2) + 36 * S.sink2, ` rotate(${f1(-5 * d2)})${sc(S.notes)}`);
      op("n1", nIn * (S.spend1 > 0 ? S.bag : 1)); op("n2", nIn * (1 - S.sink2));
      op("nlab", nIn * (1 - cl(S.nfly * 4)));

      // denomination effect: five coins and one note; the coins leak away into the bag, the note stays
      const cIn = cl(S.coins * 3);
      COIN.forEach((x0, j) => {
        const d = cl((S.cfly - j * .06) / .7), p = io(cl((S.spend2 - j * .14) / .44));
        if (p > 0) { const [x, y] = toBag(x0, COIN_IN, PILE[j], p, 70); tr("c" + j, x, y, sc(1 - .45 * p)); }
        else tr("c" + j, x0, lerp(TOP, COIN_IN, d * d), sc(S.coins));
        op("c" + j, cIn * (p > 0 ? S.bag : 1));
      });
      const d3 = cl((S.cfly - .15) / .7);
      tr("n3", CX[1], lerp(TOP, PEEK, d3 * d3) + 36 * S.sink3, ` rotate(${f1(4 * d3)})${sc(S.coins)}`);
      op("n3", cIn * (1 - S.sink3));
      op("clab", cIn * (1 - cl(S.cfly * 4)));
      op("eq", Math.max(nIn * (1 - cl(S.nfly * 4)), cIn * (1 - cl(S.cfly * 4))));
      op("bag", S.bag); op("bagh", S.bag);

      // normalcy bias: the flood card drops into "won't happen", then pops back out with the water rising
      const dd = S.flDrop * S.flDrop, inBox = dd * (1 - S.flOut);
      tr("card", lerp(CARD[0], CARD7[0], S.flMove), CARD[1] + (CARD_IN - CARD[1]) * inBox + (CARD7[1] - CARD[1]) * S.flMove,
        sc(S.flIn * (1 - .2 * inBox)));
      op("card", S.flIn * 3);
      k("water").setAttribute("d", wave(22 - 19 * S.water));
      op("water", S.water * 4);
      const bw = len(k("bubt"), 160) + 24;
      k("bubr").setAttribute("x", f1(298 - bw / 2)); k("bubr").setAttribute("width", f1(bw));
      op("bub", S.bub);

      // the family member's name
      for (let i = 0; i < 3; i++) {
        const w = len(k("cht" + i), 120) + 26;
        k("chr" + i).setAttribute("x", f1(200 - w / 2)); k("chr" + i).setAttribute("width", f1(w));
        tr("ch" + i, 0, -4 * (1 - S["ch" + i]));
        op("ch" + i, S["ch" + i]);
      }

      // the fix: 3% a year becomes 3 years out of 100
      op("arrow", S.grid * 3);
      for (let r = 0; r < 10; r++) op("gr" + r, (S.grid * 10 - r) * 1.5);
      MARK.forEach((_, j) => op("gm" + j, (S.marks * 3 - j) * 1.5));
      op("glab", S.glab);
    },
    beats: [
      { steps: [{ to: { tok: 1 }, ms: 1300, ease: "lin", sfx: "pluck" }] },
      { steps: [{ to: { boxes: 1, lab0: 1 }, ms: 600 }, { wait: 300 }, { to: { fly: 1 }, ms: 1700, ease: "lin", sfx: "whoosh" }] },
      { steps: [{ to: { lab0: 0, lab1: 1, ch0: 1 }, ms: 500, sfx: "pop" }, { to: { notes: 1 }, ms: 500, ease: "back" }, { wait: 500 },
        { to: { nfly: 1 }, ms: 800, ease: "lin" }, { wait: 250 }, { to: { bag: 1 }, ms: 300 }, { to: { spend1: 1 }, ms: 900, ease: "lin", sfx: "whoosh" }] },
      { steps: [{ to: { lab1: 0, lab2: 1, ch0: 0, ch1: 1, sink2: 1 }, ms: 500, sfx: "pop" }, { to: { coins: 1 }, ms: 500, ease: "back" }, { wait: 500 },
        { to: { cfly: 1 }, ms: 900, ease: "lin" }, { wait: 250 }, { to: { spend2: 1 }, ms: 1400, ease: "lin" }] },
      { steps: [{ to: { lab2: 0, lab0: 1, ch1: 0, ch2: 1, bag: 0, sink3: 1 }, ms: 500 }, { to: { flIn: 1 }, ms: 450, ease: "back" }, { to: { bub: 1 }, ms: 400 },
        { wait: 700 }, { to: { flDrop: 1 }, ms: 700, ease: "lin", sfx: "thud", sfxAt: 600 }] },
      { steps: [{ to: { bub: 0 }, ms: 250 }, { to: { flOut: 1 }, ms: 800, ease: "back", sfx: "spring" }, { to: { water: 1 }, ms: 800, ease: "inOut" }, { to: { strike: 1 }, ms: 400 }] },
      { steps: [{ to: { ch2: 0, water: 0, flMove: 1 }, ms: 600, ease: "inOut" }, { to: { grid: 1 }, ms: 900, ease: "lin", sfx: "tick" }, { to: { marks: 1 }, ms: 500, ease: "lin" }, { to: { glab: 1 }, ms: 400 }] },
      { steps: [{ to: { open: 1 }, ms: 1000, ease: "inOut" }, { to: { ok: 1 }, ms: 500, sfx: "chime" }], hold: 4200 }
    ]
  };
})();
