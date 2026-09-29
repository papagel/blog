/* Family "Invested": to get things done, we finish what we've put time, money and energy into. A half-built
   bridge keeps getting bricks even after the far bank turns out to be the wrong place (escalation of commitment,
   the generation effect, loss aversion), until you judge from today and put your bricks somewhere better.
   Scene for anim.js. */
(function () {
  const KEY = "family-invested", P = `.bp[data-scene="${KEY}"]`;
  const GY = 160;                          // the ground and the top of the deck
  const BX0 = 96, BW = 20, BH = 14;        // the bridge: left edge of its first slot, one brick's size
  const NB = 7, NS = 11;                   // bricks laid by the end, slots across the gap
  const TIP = BX0 + BW * NB;               // where the bridge stops
  const FX = 352;                          // the far bank's flag
  const PILE = [[14, 146], [34, 146], [54, 146], [24, 132], [44, 132], [34, 118]];   // your spare bricks, near bank
  const HOUSE = [[14, 146], [34, 146], [54, 146], [14, 132], [34, 132], [54, 132]];  // the same bricks, built into a house
  const SRC = PILE[5];                     // new bricks fly to the bridge from the top of the pile
  const WHO0 = 90;                         // where you stand on the near bank at the end
  const HEAD = [TIP - 12, GY - 30];         // your head while you stand at the tip
  const cl = v => Math.max(0, Math.min(1, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const f1 = n => +n.toFixed(1);
  const inOut = t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  const brick = (cls, key) => `<rect class="fi-br${cls ? " " + cls : ""}"${key ? ` data-k="${key}"` : ""} width="${BW}" height="${BH}" rx="1.5"/>`;
  const joints = `<path class="fi-jt" d="M1 7 H19 M10 1 V7"/>`;
  const waves = y => {
    let d = `M108 ${y}`;
    for (let x = 108; x < 300; x += 16) d += ` q4 -3.5 8 0 t8 0`;
    return `<path class="fi-wave" d="${d}"/>`;
  };

  window.BiasAnim.SCENES[KEY] = {
    q: "fast", viewBox: "0 0 400 272",
    css: `
      ${P} .fi-bank{fill:none;stroke:var(--ink);stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round}
      ${P} .fi-wave{fill:none;stroke:var(--muted);stroke-width:1.8;stroke-linecap:round}
      ${P} .fi-br{fill:var(--surface);stroke:var(--ink);stroke-width:1.8;stroke-linejoin:round}
      ${P} .fi-br.r{fill:none;stroke:var(--bad);stroke-width:2.4}
      ${P} .fi-jt{fill:none;stroke:var(--muted);stroke-width:1.2;stroke-linecap:round}
      ${P} .fi-gh{fill:none;stroke:var(--muted);stroke-width:1.6;stroke-dasharray:3 3}
      ${P} .fi-who circle{fill:var(--surface);stroke:var(--ink);stroke-width:2.2}
      ${P} .fi-who path{fill:none;stroke:var(--ink);stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
      ${P} .fi-brace{fill:none;stroke:var(--q);stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
      ${P} .fi-note{font:500 9.5px var(--mono);fill:var(--muted)}
      ${P} .fi-note.q{fill:var(--q)} ${P} .fi-note.g{fill:var(--good)} ${P} .fi-note.b{fill:var(--bad)}
      ${P} .fi-note.m{text-anchor:middle}
      ${P} .fi-val{font:600 12px var(--display);fill:var(--ink)}
      ${P} .fi-val.b{fill:var(--bad)}
      ${P} .fi-arw{fill:none;stroke:var(--q);stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
      ${P} .fi-pole{stroke:var(--ink);stroke-width:2.2;stroke-linecap:round}
      ${P} .fi-flag{fill:var(--q);stroke:var(--q);stroke-width:1.6;stroke-linejoin:round}
      ${P} .fi-flag.g{fill:var(--good);stroke:var(--good)}
      ${P} .fi-sign rect{fill:var(--surface);stroke:var(--bad);stroke-width:2}
      ${P} .fi-sign path{fill:none;stroke:var(--bad);stroke-width:2.6;stroke-linecap:round}
      ${P} .fi-pill rect{fill:var(--surface);stroke:var(--q);stroke-width:1.8}
      ${P} .fi-pill text{font:600 11.5px var(--display);fill:var(--q);text-anchor:middle}
      ${P} .fi-card rect{fill:var(--surface);stroke:var(--muted);stroke-width:1.6;stroke-dasharray:4 3}
      ${P} .fi-card.y rect{stroke:var(--q);stroke-width:2;stroke-dasharray:none}
      ${P} .fi-card text{font:500 9.5px var(--mono);fill:var(--muted);text-anchor:middle}
      ${P} .fi-card.y text{fill:var(--ink)}
      ${P} .fi-sk{fill:none;stroke:var(--muted);stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
      ${P} .fi-sk.y{stroke:var(--q);stroke-width:2.2}
      ${P} .fi-pin{fill:var(--q);stroke:var(--surface);stroke-width:1.5}
      ${P} .fi-bub rect,${P} .fi-bub circle{fill:var(--surface);stroke:var(--muted);stroke-width:1.8}
      ${P} .fi-bub text{font:600 11.5px var(--display);fill:var(--ink);text-anchor:middle}
      ${P} .fi-today{stroke:var(--good);stroke-width:2;stroke-dasharray:4 4;stroke-linecap:round}
      ${P} .fi-qm{font:700 18px var(--display);fill:var(--good);text-anchor:middle}
      ${P} .fi-roof{fill:none;stroke:var(--good);stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round}
      ${P} .fi-chk circle{fill:var(--surface);stroke:var(--good);stroke-width:2}
      ${P} .fi-chk path{fill:none;stroke:var(--good);stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round}
    `,
    text: {
      en: {
        name: "Finishing what we started", shareTitle: "Why we keep going just because we started, in 30 seconds",
        ecline: "Finish what's still worth it: decide from today, not from what you've already put in.",
        goal: "the goal", wrong: "wrong place", put: "already put in", gone: "gone either way", keep: "keep going",
        months: n => (n === 1 ? "1 month" : `${n} months`), lost: n => `−${n} month${n === 1 ? "" : "s"}`,
        yours: "your plan", theirs: "their idea", sticks: "sticks", fades: "fades", stop: "stop?", stopW: 52,
        today: "from today", left: "what's left",
        pills: [["Escalation of commitment", 170], ["Generation effect", 126], ["Loss aversion", 104]],
        caps: [
          "You start building something big, like a business or a career.",
          "Your brain says: <b>finish what you started</b>. Usually, that gets things done.",
          "Then bad news: where you're heading is <b>the wrong place</b>.",
          "Yet you <b>double down</b>, to prove it wasn't a mistake.",
          "The plan you <b>made yourself</b> sticks. Other people's ideas <b>fade</b>.",
          "And stopping now would feel like <b>losing</b> all you put in.",
          "<b>The fix:</b> ask, “Starting fresh today, would I choose this?”",
          "If yes, <b>keep going</b>. If not, put your bricks <b>somewhere better</b>."
        ],
        say: [
          "You start building something big, like a business or a career.",
          "Your brain says: finish what you started. Usually, that's exactly how things get done.",
          "Then bad news. Where you're heading turns out to be the wrong place.",
          "Escalation of commitment. Instead of stopping, you double down, to prove it wasn't a mistake.",
          "The generation effect. The plan you came up with yourself sticks in your mind, while other people's ideas fade.",
          "Loss aversion. Stopping now would feel like losing everything you've put in.",
          "The fix: ask yourself, if I were starting fresh today, would I choose this?",
          "If yes, keep going. If not, put your next bricks somewhere better.",
          "Finishing what we started. Finish what's still worth it: decide from today, not from what you've already put in."
        ]
      },
      el: {
        name: "Τελειώνουμε ό,τι αρχίσαμε", shareTitle: "Γιατί συνεχίζουμε μόνο και μόνο επειδή ξεκινήσαμε, σε 30 δευτερόλεπτα",
        ecline: "Να τελειώνεις ό,τι αξίζει ακόμα: αποφάσιζε με βάση το σήμερα, όχι όσα έχεις ήδη βάλει.",
        goal: "ο στόχος", wrong: "λάθος μέρος", put: "όσα έχεις ήδη βάλει", gone: "δεν γυρίζουν πίσω", keep: "μη σταματάς",
        months: n => (n === 1 ? "1 μήνας" : `${n} μήνες`), lost: n => `−${n} ${n === 1 ? "μήνας" : "μήνες"}`,
        yours: "το σχέδιό σου", theirs: "η ιδέα των άλλων", sticks: "μένει", fades: "ξεθωριάζει", stop: "να σταματήσω;", stopW: 96,
        today: "από σήμερα", left: "ό,τι απομένει",
        pills: [["Κλιμάκωση της δέσμευσης", 176], ["Φαινόμενο παραγωγής", 150], ["Αποστροφή στην απώλεια", 170]],
        caps: [
          "Ξεκινάς να χτίζεις κάτι μεγάλο, όπως μια επιχείρηση ή μια καριέρα.",
          "Το μυαλό σου λέει: <b>τελείωσε ό,τι άρχισες</b>. Συνήθως, έτσι γίνεται η δουλειά.",
          "Ώσπου έρχονται άσχημα\u00a0νέα: πας σε <b>λάθος μέρος</b>.",
          "Εσύ όμως <b>ρίχνεις κι άλλα</b>, για να αποδείξεις ότι δεν ήταν λάθος.",
          "Το σχέδιο που <b>σκέφτηκες εσύ</b> σου μένει. Οι ιδέες των άλλων <b>ξεθωριάζουν</b>.",
          "Κι αν σταματήσεις τώρα, θα νιώσεις πως όλα όσα έβαλες <b>πάνε χαμένα</b>.",
          "<b>Η λύση:</b> αναρωτήσου «Αν ξεκινούσα σήμερα από το μηδέν, θα το διάλεγα;»",
          "Αν ναι, <b>συνέχισε</b>. Αν όχι, βάλε τα τούβλα σου <b>κάπου καλύτερα</b>."
        ],
        say: [
          "Ξεκινάς να χτίζεις κάτι μεγάλο, όπως μια επιχείρηση ή μια καριέρα.",
          "Το μυαλό σου λέει: τελείωσε ό,τι άρχισες. Συνήθως, έτσι ακριβώς γίνεται η δουλειά.",
          "Ώσπου έρχονται άσχημα νέα. Αποδεικνύεται ότι πας σε λάθος μέρος.",
          "Κλιμάκωση της δέσμευσης. Αντί να σταματήσεις, ρίχνεις ακόμα περισσότερα, για να αποδείξεις ότι δεν ήταν λάθος.",
          "Φαινόμενο παραγωγής. Το σχέδιο που σκέφτηκες εσύ σου μένει, ενώ οι ιδέες των άλλων ξεθωριάζουν.",
          "Αποστροφή στην απώλεια. Αν σταματήσεις τώρα, θα νιώσεις πως όλα όσα έβαλες πάνε χαμένα.",
          "Η λύση: αναρωτήσου, αν ξεκινούσα σήμερα από το μηδέν, θα το διάλεγα;",
          "Αν ναι, συνέχισε. Αν όχι, βάλε τα επόμενα τούβλα σου κάπου καλύτερα.",
          "Τελειώνουμε ό,τι αρχίσαμε. Να τελειώνεις ό,τι αξίζει ακόμα: αποφάσιζε με βάση το σήμερα, όχι όσα έχεις ήδη βάλει."
        ]
      }
    },
    svg(T) {
      const bricks = Array.from({ length: NB }, (_, i) => `<g data-k="b${i}">${brick()}${joints}${brick("r", "r" + i)}</g>`).join("");
      const pile = PILE.map((_, j) => `<g data-k="h${j}">${brick()}${joints}</g>`).join("");
      let outline = "";   // the planned bridge, all the way across
      for (let i = 0; i < NS; i++) outline += `<rect class="fi-gh" data-k="g${i}" x="${BX0 + BW * i + 1}" y="${GY + 1}" width="${BW - 2}" height="${BH - 2}" rx="1.5"/>`;
      const pills = T.pills.map(([name, w], i) => `<g class="fi-pill" data-k="p${i + 1}">
          <rect x="12" y="10" width="${w}" height="22" rx="11"/><text x="${12 + w / 2}" y="25">${name}</text></g>`).join("");
      const [hx, hy] = HEAD, bw = T.stopW, bcx = hx + 18, bcy = 92;
      return `
        <g data-k="land">
          <path class="fi-bank" d="M12 ${GY} H${BX0} L${BX0 + 3} 250"/>
          <path class="fi-bank" d="M388 ${GY} H${BX0 + BW * NS} L${BX0 + BW * NS - 4} 250"/>
          ${waves(238)}${waves(248)}
          <g data-k="pile">${pile}</g>
        </g>
        <g data-k="plan">${outline}</g>
        <text class="fi-qm" data-k="qm" x="${(TIP + BX0 + BW * NS) / 2}" y="150">?</text>
        <text class="fi-note g" data-k="left" x="12" y="180">${T.left}</text>
        <g data-k="flag"><line class="fi-pole" x1="${FX}" y1="${GY}" x2="${FX}" y2="114"/><path class="fi-flag" d="M${FX} 114 L${FX + 26} 121 L${FX} 128 Z"/></g>
        <g class="fi-sign" data-k="sign"><line class="fi-pole" x1="${FX}" y1="${GY}" x2="${FX}" y2="128"/>
          <rect x="${FX - 18}" y="104" width="36" height="24" rx="4"/><path d="M${FX - 6} 110 L${FX + 6} 122 M${FX + 6} 110 L${FX - 6} 122"/></g>
        <text class="fi-note q m" data-k="goalT" x="${FX}" y="182">${T.goal}</text>
        <text class="fi-note b m" data-k="wrongT" x="${FX}" y="182">${T.wrong}</text>
        ${bricks}
        <g data-k="braceG">
          <path class="fi-brace" data-k="brace" d=""/>
          <text class="fi-note q" data-k="putT" x="104" y="203">${T.put}</text>
          <text class="fi-note" data-k="goneT" x="104" y="203">${T.gone}</text>
          <text class="fi-val" data-k="val" x="104" y="217"></text>
          <text class="fi-val b" data-k="valL" x="104" y="217"></text>
        </g>
        <g data-k="pull"><path class="fi-arw" data-k="pullp" d=""/><text class="fi-note q" data-k="pullt" y="137">${T.keep}</text></g>
        <g data-k="today"><line class="fi-today" data-k="todayL" x1="${TIP}" x2="${TIP}" y1="56" y2="56"/>
          <text class="fi-note g m" data-k="todayT" x="${TIP}" y="47">${T.today}</text></g>
        <g data-k="who"><g class="fi-who" data-k="whoF"><circle cy="-30" r="6"/>
          <path d="M0 -24 V-11 M0 -11 L-6 0 M0 -11 L6 0 M0 -20 L-6 -13 M0 -20 L6 -23"/></g></g>
        <g data-k="cards">
          <g class="fi-card" data-k="theirs"><rect x="43" y="40" width="110" height="58" rx="8"/><text x="98" y="54">${T.theirs}</text>
            <path class="fi-sk" transform="translate(98 75)" d="M-20 0 H20 L14 9 H-14 Z M-8 0 V-8 H8 V0 M-30 15 q3.75 -3 7.5 0 t7.5 0 t7.5 0 t7.5 0 t7.5 0 t7.5 0 t7.5 0 t7.5 0"/></g>
          <g class="fi-card y"><rect x="163" y="40" width="110" height="58" rx="8"/><text x="218" y="54">${T.yours}</text>
            <path class="fi-sk y" data-k="sky" pathLength="1" stroke-dasharray="1 1" transform="translate(218 80)"
              d="M-32 8 H30 M-24 8 Q0 -12 24 8 M-12 8 V0 M12 8 V0 M30 8 V-12 L40 -8 L30 -4"/>
            <circle class="fi-pin" cx="218" cy="40" r="4"/></g>
          <g data-k="stat"><text class="fi-note m" x="98" y="112">${T.fades}</text><text class="fi-note q m" x="218" y="112">${T.sticks}</text></g>
        </g>
        <g class="fi-bub" data-k="bub"><circle cx="${hx + 5}" cy="${hy - 13}" r="2"/><circle cx="${hx + 10}" cy="${hy - 21}" r="3"/>
          <rect x="${bcx - bw / 2}" y="${bcy - 12}" width="${bw}" height="24" rx="12"/><text x="${bcx}" y="${bcy + 4}">${T.stop}</text></g>
        <path class="fi-roof" data-k="roof" pathLength="1" stroke-dasharray="1 1" d="M10 132 L44 110 L78 132"/>
        <g data-k="nflag"><line class="fi-pole" x1="44" y1="110" x2="44" y2="90"/><path class="fi-flag g" d="M44 90 L60 95 L44 100 Z"/></g>
        <g data-k="chk"><g class="fi-chk"><circle r="9"/><path d="M-4 0.5 L-1 3.5 L4.5 -3"/></g></g>
        ${pills}`;
    },
    S0: { land: 0, goal: 0, who: 0, b: 0, brace: 0, pull: 0, bad: 0, p1: 0, p2: 0, p3: 0, cards: 0, draw: 0, fadeT: 0,
      bub: 0, red: 0, flinch: 0, dim: 0, today: 0, ask: 0, clear: 0, left: 0, turn: 0, back: 0, house: 0, roof: 0, chk: 0 },
    render(S, k, T) {
      const op = (key, v) => { k(key).style.opacity = cl(v); };
      const tr = (key, s) => k(key).setAttribute("transform", s);
      op("land", S.land);
      // bricks fly up out of the pile, over your head, then down into their slot in front of you
      for (let i = 0; i < NB; i++) {
        const q = cl((S.b - i) / .8), ex = inOut(cl(q / .75));
        const x = lerp(SRC[0], BX0 + BW * i, ex), y = lerp(SRC[1], GY, q) - 70 * Math.sin(Math.PI * q);
        tr("b" + i, `translate(${f1(x)} ${f1(y)}) rotate(${f1(-30 * Math.sin(Math.PI * ex))} 10 7)`);
        op("b" + i, q <= 0 ? 0 : q < 1 ? 1 : 1 - .6 * S.dim);
        op("r" + i, S.red);
      }
      // once a brick lands you step onto it; the pull moves ahead while it's still in the air
      const n = Math.floor(S.b + 1e-3), fr = S.b - n;
      const laid = Math.min(NB, n + cl((fr - .8) / .2)), landed = Math.min(NB, Math.floor(S.b + .2 + 1e-3));
      const tip = BX0 + BW * laid, tipA = BX0 + BW * Math.min(NB, n + inOut(cl(fr / .4)));
      // what you've already put in, under the laid part
      const x0 = 100, x1 = Math.max(x0 + 12, tip), m = (x0 + x1) / 2;
      k("brace").setAttribute("d", `M${f1(x0)} 178 Q${f1(x0)} 184 ${f1(x0 + 5)} 184 H${f1(m - 4)} Q${f1(m)} 184 ${f1(m)} 189 ` +
        `Q${f1(m)} 184 ${f1(m + 4)} 184 H${f1(x1 - 5)} Q${f1(x1)} 184 ${f1(x1)} 178`);
      op("braceG", S.brace * (1 - .35 * S.dim));
      op("putT", 1 - cl(S.dim * 2)); op("goneT", cl(S.dim * 2 - 1));
      k("val").textContent = T.months(landed); k("valL").textContent = T.lost(landed);
      op("val", 1 - cl(S.red * 2)); op("valL", cl(S.red * 2 - 1));
      // and the pull to keep going, which grows with it
      const ax = tipA + 6, al = 12 + 4 * laid;
      k("pullp").setAttribute("d", `M${f1(ax)} 148 H${f1(ax + al)} M${f1(ax + al - 6)} 143 L${f1(ax + al)} 148 L${f1(ax + al - 6)} 153`);
      k("pullt").setAttribute("x", f1(ax));
      op("pull", S.pull);
      // you: at the tip, flinching at the thought of stopping, then turning back to the near bank
      const walk = inOut(cl(S.back));
      const bx = lerp(tip - 12, WHO0, walk) - 4 * Math.sin(S.flinch * Math.PI * 4) * (1 - S.flinch);
      const by = GY - 2.5 * Math.abs(Math.sin(cl(S.back) * Math.PI * 6));
      tr("who", `translate(${f1(bx)} ${f1(by)})`); op("who", S.who);
      tr("whoF", `scale(${Math.cos(Math.PI * cl(S.turn)).toFixed(3)} 1)`);
      // the far bank: the goal, then a sign that it's the wrong place
      tr("flag", `translate(0 ${f1(10 * (1 - S.goal) + 16 * cl(S.bad))})`); op("flag", S.goal * (1 - cl(S.bad * 2)));
      tr("sign", `translate(${FX} ${GY}) scale(${Math.max(0, S.bad).toFixed(3)}) translate(${-FX} ${-GY})`); op("sign", S.bad * 3);
      op("goalT", S.goal * (1 - cl(S.bad * 2))); op("wrongT", cl(S.bad * 2 - 1));
      // which bias this is
      for (let i = 1; i <= 3; i++) {
        const p = S["p" + i];
        tr("p" + i, `translate(12 21) scale(${(.8 + .2 * cl(p)).toFixed(3)}) translate(-12 -21)`);
        op("p" + i, p);
      }
      // your own plan sticks, theirs fades
      tr("cards", `translate(0 ${f1(8 * (1 - cl(S.cards)))})`); op("cards", S.cards);
      k("sky").style.strokeDashoffset = (1 - cl(S.draw)).toFixed(3);
      op("theirs", 1 - .55 * S.fadeT); op("stat", S.fadeT);
      // "stop?"
      const bs = Math.max(0, S.bub).toFixed(3);
      tr("bub", `translate(${HEAD[0]} ${HEAD[1] - 6}) scale(${bs}) translate(${-HEAD[0]} ${-HEAD[1] + 6})`); op("bub", S.bub * 2);
      // the fix: from today, the laid part is gone either way; only what's ahead counts
      k("todayL").setAttribute("y2", f1(56 + 170 * cl(S.today)));
      op("today", S.today > 0 ? 1 : 0); op("todayT", S.today);
      op("plan", .7 * S.goal * (1 - S.clear));
      for (let i = 0; i < NS; i++) op("g" + i, i >= landed ? 1 : 0);
      op("qm", S.ask * (1 - S.clear)); op("left", S.left);
      // what's left goes into something better: the top three bricks move into a second row
      PILE.forEach(([px, py], j) => {
        const e = j < 3 ? 0 : inOut(cl((S.house - (j - 3) * .2) / .6)), [qx, qy] = HOUSE[j];   // the bottom row stays put
        tr("h" + j, `translate(${f1(lerp(px, qx, e))} ${f1(lerp(py, qy, e) - 14 * Math.sin(Math.PI * e))})`);
      });
      k("roof").style.strokeDashoffset = (1 - cl(S.roof)).toFixed(3); op("roof", S.roof > 0 ? 1 : 0);
      tr("nflag", `translate(44 110) scale(1 ${cl(S.chk).toFixed(3)}) translate(-44 -110)`); op("nflag", S.chk);
      tr("chk", `translate(74 96) scale(${Math.max(0, S.chk).toFixed(3)})`); op("chk", S.chk * 2);
    },
    beats: [
      { steps: [{ to: { land: 1 }, ms: 600, sfx: "pluck" }, { to: { goal: 1 }, ms: 450, ease: "back" }, { to: { who: 1 }, ms: 300 },
        { to: { b: 2 }, ms: 1400, ease: "lin" }] },
      { steps: [{ to: { brace: 1 }, ms: 400, sfx: "tick" }, { to: { b: 4 }, ms: 1400, ease: "lin" }, { to: { pull: 1 }, ms: 500 }] },
      { steps: [{ wait: 300 }, { to: { bad: 1 }, ms: 700, ease: "back", sfx: "thud", sfxAt: 150 }] },
      { steps: [{ to: { p1: 1 }, ms: 400, ease: "back", sfx: "pop" }, { to: { b: NB }, ms: 1200, ease: "lin", sfx: "whoosh" }] },
      { steps: [{ to: { p1: 0 }, ms: 250 }, { to: { p2: 1, cards: 1 }, ms: 450, ease: "back" }, { to: { draw: 1 }, ms: 900, ease: "lin", sfx: "scribble" },
        { wait: 300 }, { to: { fadeT: 1 }, ms: 800, ease: "inOut" }] },
      { steps: [{ to: { p2: 0, cards: 0 }, ms: 300 }, { to: { p3: 1 }, ms: 400, ease: "back" }, { to: { bub: 1 }, ms: 400, ease: "back" },
        { to: { red: 1, flinch: 1 }, ms: 600, ease: "lin", sfx: "spring" }] },
      { steps: [{ to: { p3: 0, bub: 0, red: 0, pull: 0 }, ms: 400 }, { to: { dim: 1 }, ms: 600 },
        { to: { today: 1 }, ms: 700, ease: "inOut", sfx: "whoosh" }, { to: { ask: 1 }, ms: 500 }, { to: { left: 1 }, ms: 400 }] },
      { steps: [{ to: { clear: 1 }, ms: 400 }, { to: { turn: 1 }, ms: 300 }, { to: { back: 1 }, ms: 1200, ease: "lin" },
        { to: { house: 1 }, ms: 900, ease: "lin" }, { to: { roof: 1 }, ms: 450 }, { to: { chk: 1 }, ms: 450, ease: "back", sfx: "chime" }], hold: 4200 }
    ]
  };
})();
