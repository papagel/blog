/* Habit, grade decisions by what you knew: the app warns of heavy traffic, so you leave two hours
   early for your flight. The roads are empty and you wait at the gate for ages. Rewind to the
   moment you decided and grade the choice on what you knew then, not on how it ended. The fork,
   the checked road and the cloud over its end come from the habit's tile. Scene for anim.js. */
(function () {
  const KEY = "habit-grade", P = `.bp[data-scene="${KEY}"]`;
  const f1 = n => +n.toFixed(1);
  const clamp = v => Math.max(0, Math.min(1, v));
  const FX = 128, FY = 176;                          // the fork: the moment you decide
  const HX = 58;                                     // where your car starts, by the house
  const UY = 112, LY = 234;                          // the two roads after the fork: early (up), late (down)
  const BX = 196, EX = 278;                          // where the roads flatten out, and where they end
  const SU = [[FX, FY], [162, FY], [162, UY], [BX, UY]];
  const SL = [[FX, FY], [162, FY], [162, LY], [BX, LY]];
  const CU = 0.55;                                   // share of a branch run spent on its curve
  const TR0 = 204, TR1 = 270;                        // the traffic forecast on each flat stretch
  const OX = 344;                                    // centre of the outcome column
  const BU = [162, 144], BL = [162, 205];            // grade badges, halfway up each curve
  const bez = (Q, t) => { const u = 1 - t, a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, d = t * t * t;
    return [a * Q[0][0] + b * Q[1][0] + c * Q[2][0] + d * Q[3][0], a * Q[0][1] + b * Q[1][1] + c * Q[2][1] + d * Q[3][1]]; };
  const dbez = (Q, t) => { const u = 1 - t, a = 3 * u * u, b = 6 * u * t, c = 3 * t * t;
    return [a * (Q[1][0] - Q[0][0]) + b * (Q[2][0] - Q[1][0]) + c * (Q[3][0] - Q[2][0]), a * (Q[1][1] - Q[0][1]) + b * (Q[2][1] - Q[1][1]) + c * (Q[3][1] - Q[2][1])]; };
  function along(Q, y, u) {                          // u in 0..1 along a branch: the curve, then the flat road
    if (u < CU) { const t = u / CU, [x, yy] = bez(Q, t), [dx, dy] = dbez(Q, t); return [x, yy, Math.atan2(dy, dx) * 180 / Math.PI]; }
    return [BX + (u - CU) / (1 - CU) * (EX - BX), y, 0];
  }
  const car1At = c => (c <= 1 ? [HX + (FX - HX) * c, FY, 0] : along(SU, UY, Math.min(1, c - 1)));
  const head = (x, y, deg, cls) => {                 // an arrowhead at (x, y) pointing along deg
    const r = d => (deg + d) * Math.PI / 180, L = 6.5;
    return `<path class="${cls}" d="M${f1(x + L * Math.cos(r(150)))} ${f1(y + L * Math.sin(r(150)))} L${x} ${y} L${f1(x + L * Math.cos(r(-150)))} ${f1(y + L * Math.sin(r(-150)))}"/>`;
  };
  const PLANE = "M0 -8 C1 -8 1.5 -6.5 1.5 -5 V-1.5 L7.5 2 V4 L1.5 2 V5.5 L3.5 7 V8.2 L0 7.3 L-3.5 8.2 V7 L-1.5 5.5 V2 L-7.5 4 V2 L-1.5 -1.5 V-5 C-1.5 -6.5 -1 -8 0 -8 Z";
  const CAR = `<path d="M-10.5 -3.2 V-6.6 Q-10.5 -8.4 -8.6 -8.4 H-6.2 L-3 -12.4 H3.8 L7.2 -8.4 H8.8 Q10.6 -8.4 10.6 -6.4 V-3.2 Z"/>
    <circle cx="-5.6" cy="-2.9" r="2.7"/><circle cx="5.8" cy="-2.9" r="2.7"/>`;
  // outcome → grade: from the storm over the end of your road down to its badge
  const LK = { d: `M306 72 Q176 44 ${BU[0]} ${BU[1] - 11}`, mid: [f1(.25 * 306 + .5 * 176 + .25 * BU[0]), f1(.25 * 72 + .5 * 44 + .25 * (BU[1] - 11))] };
  // what you knew → grade: from the cards to the same badge
  const KA = `M132 84 Q161 86 ${BU[0]} ${BU[1] - 11}`;

  window.BiasAnim.SCENES[KEY] = {
    q: "tmi", viewBox: "0 0 400 272",
    css: `
      ${P} .hg-road{fill:none;stroke:var(--ink);stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round}
      ${P} .hg-road.m{stroke:var(--muted)}
      ${P} .hg-road.q{stroke:var(--q);stroke-width:2.6}
      ${P} .hg-road.dot{stroke:var(--faint);stroke-dasharray:.1 6}
      ${P} .hg-tr{fill:none;stroke:var(--bad);stroke-opacity:.34;stroke-width:9;stroke-linecap:round}
      ${P} .hg-house{fill:none;stroke:var(--ink);stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
      ${P} .hg-card rect{fill:var(--surface);stroke:var(--muted);stroke-width:1.4}
      ${P} .hg-card .h{font:500 9px var(--mono);fill:var(--muted);letter-spacing:.08em}
      ${P} .hg-card .v{font:700 15px var(--display);fill:var(--ink)}
      ${P} .hg-card .v2{font:600 12px var(--display);fill:var(--ink)}
      ${P} .hg-hl{fill:none;stroke:var(--q);stroke-width:2}
      ${P} .hg-plane{fill:none;stroke:var(--ink);stroke-width:1.3;stroke-linejoin:round}
      ${P} .hg-warn path{fill:none;stroke:var(--bad);stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
      ${P} .hg-warn circle{fill:var(--bad)}
      ${P} .hg-lb{font:500 9.5px var(--mono);fill:var(--muted)}
      ${P} .hg-lb.c{text-anchor:middle} ${P} .hg-lb.e{text-anchor:end}
      ${P} .hg-lb.q{fill:var(--q)} ${P} .hg-lb.f{fill:var(--faint)} ${P} .hg-lb.bad{fill:var(--bad)}
      ${P} .hg-car path{fill:var(--surface);stroke:var(--ink);stroke-width:1.8;stroke-linejoin:round}
      ${P} .hg-car circle{fill:var(--ground);stroke:var(--ink);stroke-width:1.8}
      ${P} .hg-car.o path,${P} .hg-car.o circle{stroke:var(--muted)}
      ${P} .hg-clock circle{fill:var(--surface);stroke:var(--muted);stroke-width:1.8}
      ${P} .hg-clock path{fill:none;stroke:var(--ink);stroke-width:1.8;stroke-linecap:round}
      ${P} .hg-cloud path{fill:none;stroke-linecap:round;stroke-linejoin:round}
      ${P} .hg-cloud .c{fill:var(--surface);stroke:var(--muted);stroke-width:1.5}
      ${P} .hg-cloud .b{stroke:var(--bad);stroke-width:1.5}
      ${P} .hg-cloud .d{stroke:var(--muted);stroke-width:1.3}
      ${P} .hg-sun circle,${P} .hg-sun path{fill:none;stroke:var(--muted);stroke-width:1.8;stroke-linecap:round}
      ${P} .hg-made{font:600 11.5px var(--display);fill:var(--ink);text-anchor:middle}
      ${P} .hg-frame{fill:none;stroke:var(--faint);stroke-width:1.4;stroke-dasharray:3 4}
      ${P} .hg-dl{stroke:var(--q);stroke-width:1.5;stroke-dasharray:2 4.5;stroke-linecap:round}
      ${P} .hg-tag rect{fill:var(--surface);stroke:var(--muted);stroke-width:1.4}
      ${P} .hg-tag .h{font:500 9px var(--mono);fill:var(--faint)}
      ${P} .hg-tag .v{font:600 10.5px var(--display);fill:var(--muted)}
      ${P} .hg-tag.b rect{stroke:var(--bad)} ${P} .hg-tag.b .v{fill:var(--bad)}
      ${P} .hg-bdg circle{fill:var(--surface);stroke-width:2.2}
      ${P} .hg-bdg path{fill:none;stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round}
      ${P} .hg-bdg.x circle,${P} .hg-bdg.x path{stroke:var(--bad)}
      ${P} .hg-bdg.qm circle{stroke:var(--muted)}
      ${P} .hg-bdg.qm text{font:700 11px var(--display);fill:var(--muted);text-anchor:middle}
      ${P} .hg-bdg.ok circle,${P} .hg-bdg.ok path{stroke:var(--good)}
      ${P} .hg-die rect{fill:var(--surface);stroke:var(--muted);stroke-width:1.8}
      ${P} .hg-die circle{fill:var(--muted)}
      ${P} .hg-link{fill:none;stroke:var(--bad);stroke-width:1.8;stroke-dasharray:2 4;stroke-linecap:round}
      ${P} .hg-lh{fill:none;stroke:var(--bad);stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
      ${P} .hg-ka{fill:none;stroke:var(--good);stroke-width:2;stroke-linecap:round}
      ${P} .hg-kh{fill:none;stroke:var(--good);stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
      ${P} .hg-cut circle{fill:var(--ground);stroke:var(--q);stroke-width:1.8}
      ${P} .hg-cut path{fill:none;stroke:var(--q);stroke-width:2.2;stroke-linecap:round}
      ${P} .hg-chip rect{fill:var(--surface);stroke:var(--q);stroke-width:1.8}
      ${P} .hg-rw{fill:var(--q);stroke:var(--q);stroke-width:1.2;stroke-linejoin:round}
      ${P} .hg-chip text{font:600 12.5px var(--display);fill:var(--ink);text-anchor:middle}
    `,
    text: {
      en: {
        name: "Grade decisions by what you knew", shareTitle: "Grade decisions by what you knew: a habit in 30 seconds",
        ecline: "Judge a decision by what you knew when you made it, not by how it turned out.",
        flH: "YOUR FLIGHT", alH: "TRAFFIC ALERT", alV: "Heavy traffic", knew: "what you knew",
        early: "leave early", late: "leave late", empty: "empty roads", waitN: "2 hours", wait: "at the gate",
        judged: "judged by the outcome", when: "when you decided", unknown: "not known yet",
        worst: "worst case", w1: "a long wait", w2: "a missed flight", made: "made it", luck: "luck", bias: "Outcome bias",
        caps: [
          "Your flight leaves at 18:00. The\u00a0app warns of <b>heavy traffic</b>.",
          "So you leave <b>two hours early</b>. The roads turn out empty.",
          "You wait at the gate for ages. “What a <b>stupid decision</b>.”",
          "<b>The habit:</b> rewind to the moment you decided.",
          "You knew traffic was likely, and a <b>missed flight</b> costs far more.",
          "Someone who left late and made it had <b>luck</b>, not good judgement.",
          "This catches <b>outcome bias</b>: judging a decision by how it ended.",
          "Given what you knew, leaving early was <b>right</b>. You'd do it again."
        ],
        say: [
          "Your flight leaves at six in the evening. The app warns of heavy traffic.",
          "So you leave two hours early. The roads turn out empty.",
          "You wait at the gate for ages. What a stupid decision.",
          "The habit: rewind to the moment you decided.",
          "You knew traffic was likely, and a missed flight costs far more.",
          "Someone who left late and made it had luck, not good judgement.",
          "This catches outcome bias: judging a decision by how it ended.",
          "Given what you knew, leaving early was right. You'd do it again.",
          "Grade decisions by what you knew. Judge a decision by what you knew when you made it, not by how it turned out."
        ]
      },
      el: {
        name: "Κρίνε τις αποφάσεις με βάση όσα ήξερες", shareTitle: "Κρίνε τις αποφάσεις με βάση όσα ήξερες: μια συνήθεια σε 30 δευτερόλεπτα",
        ecline: "Κρίνε μια απόφαση με βάση όσα ήξερες όταν την πήρες, όχι από το πώς κατέληξε.",
        flH: "Η ΠΤΗΣΗ ΣΟΥ", alH: "ΕΙΔΟΠΟΙΗΣΗ", alV: "Πολλή κίνηση", knew: "όσα ήξερες",
        early: "φεύγεις νωρίς", late: "φεύγεις αργά", empty: "άδειοι δρόμοι", waitN: "2 ώρες", wait: "στην πύλη",
        judged: "κρίνεις από την κατάληξη", when: "όταν αποφάσισες", unknown: "άγνωστο ακόμα",
        worst: "στη χειρότερη", w1: "πολλή αναμονή", w2: "χαμένη πτήση", made: "πρόλαβε", luck: "τύχη", bias: "Μεροληψία αποτελέσματος",
        caps: [
          "Η πτήση σου φεύγει στις 18:00. Η\u00a0εφαρμογή προειδοποιεί για <b>πολλή κίνηση</b>.",
          "Φεύγεις λοιπόν <b>δύο ώρες νωρίτερα</b>. Τελικά, οι δρόμοι είναι άδειοι.",
          "Περιμένεις μια αιωνιότητα στην πύλη. «Τι <b>χαζή απόφαση</b>».",
          "<b>Η συνήθεια:</b> γύρνα πίσω στη\u00a0στιγμή που αποφάσισες.",
          "Ήξερες ότι μάλλον θα είχε κίνηση, κι ότι <b>μια\u00a0χαμένη πτήση</b> κοστίζει πολύ περισσότερο.",
          "Όποιος έφυγε αργά και πρόλαβε είχε <b>τύχη</b>, όχι καλή κρίση.",
          "Έτσι πιάνεις τη <b>μεροληψία αποτελέσματος</b>: να\u00a0κρίνεις μια απόφαση από την κατάληξή της.",
          "Με όσα ήξερες, <b>σωστά\u00a0έφυγες\u00a0νωρίς</b>. Θα το ξανάκανες."
        ],
        say: [
          "Η πτήση σου φεύγει στις έξι το απόγευμα. Η εφαρμογή προειδοποιεί για πολλή κίνηση.",
          "Φεύγεις λοιπόν δύο ώρες νωρίτερα. Τελικά, οι δρόμοι είναι άδειοι.",
          "Περιμένεις μια αιωνιότητα στην πύλη. Τι χαζή απόφαση.",
          "Η συνήθεια: γύρνα πίσω στη στιγμή που αποφάσισες.",
          "Ήξερες ότι μάλλον θα είχε κίνηση, κι ότι μια χαμένη πτήση κοστίζει πολύ περισσότερο.",
          "Όποιος έφυγε αργά και πρόλαβε είχε τύχη, όχι καλή κρίση.",
          "Έτσι πιάνεις τη μεροληψία αποτελέσματος: να κρίνεις μια απόφαση από την κατάληξή της.",
          "Με όσα ήξερες, σωστά έφυγες νωρίς. Θα το ξανάκανες.",
          "Κρίνε τις αποφάσεις με βάση όσα ήξερες. Κρίνε μια απόφαση με βάση όσα ήξερες όταν την πήρες, όχι από το πώς κατέληξε."
        ]
      }
    },
    svg(T) {
      const branch = (Y, cls, key) => `<path class="hg-road ${cls}" data-k="${key}" d="M${FX} ${FY} C162 ${FY} 162 ${Y} ${BX} ${Y} H${EX}"/>`;
      const [lx, ly] = LK.mid;
      const [kx, ky] = [BU[0], BU[1] - 11];
      return `
        <line class="hg-dl" data-k="dl" x1="${FX}" y1="118" x2="${FX}" y2="246"/>
        <text class="hg-lb q c" data-k="dlt" x="${FX}" y="259">${T.when}</text>
        <g data-k="map">
          <path class="hg-house" d="M14 160 L28 148 L42 160 M18 157 V176 H38 V157 M25 176 V168 H31 V176"/>
          <path class="hg-road" d="M42 ${FY} H${FX}"/>
          ${branch(UY, "m", "upm")}${branch(UY, "q", "upq")}
          ${branch(LY, "m", "lom")}${branch(LY, "dot", "lod")}
        </g>
        <path class="hg-tr" data-k="tr1"/><path class="hg-tr" data-k="tr2"/>
        <g data-k="labs"><text class="hg-lb q" x="184" y="127">${T.early}</text><text class="hg-lb f" x="184" y="252">${T.late}</text></g>
        <text class="hg-lb c" data-k="empty" x="237" y="178">${T.empty}</text>
        <text class="hg-lb q" data-k="knew" x="14" y="18">${T.knew}</text>
        <g class="hg-card" data-k="fl"><rect x="12" y="25" width="116" height="36" rx="7"/>
          <path class="hg-plane" transform="translate(27 43) rotate(45)" d="${PLANE}"/>
          <text class="h" x="42" y="39">${T.flH}</text><text class="v" x="42" y="55">18:00</text></g>
        <g class="hg-card" data-k="al"><rect x="12" y="67" width="116" height="36" rx="7"/>
          <g class="hg-warn" transform="translate(27 86)"><path d="M0 -7.5 L8 6.5 H-8 Z"/><path d="M0 -2.6 V1.6"/><circle cy="3.9" r="1"/></g>
          <text class="h" x="42" y="81">${T.alH}</text><text class="v2" x="42" y="96">${T.alV}</text></g>
        <g data-k="hl"><rect class="hg-hl" x="12" y="25" width="116" height="36" rx="7"/><rect class="hg-hl" x="12" y="67" width="116" height="36" rx="7"/></g>
        <g data-k="out1">
          <g class="hg-cloud" data-k="cloud"><g transform="translate(${OX} 66) scale(1.5) translate(-127 -20)">
            <path class="c" d="M110 30 H144 A7.5 7.5 0 0 0 142 15.5 A10 10 0 0 0 124 11 A8 8 0 0 0 110 17 A6.5 6.5 0 0 0 110 30 Z"/>
            <path class="b" d="M130 32 L125 40 H131 L127 48"/><path class="d" d="M116 34 l-2 5 M142 34 l-2 5"/></g></g>
          <g data-k="clock"><g class="hg-clock" transform="translate(${OX} 128)"><circle r="12"/><path d="M0 0 L-4.5 -3.5"/><path data-k="hand" d="M0 0 V-8.5"/></g>
            <text class="hg-made" x="${OX}" y="157">${T.waitN}</text><text class="hg-lb c" x="${OX}" y="169">${T.wait}</text></g>
        </g>
        <g data-k="veil"><rect class="hg-frame" x="302" y="38" width="86" height="140" rx="10"/><text class="hg-lb f c" x="${OX + 1}" y="191">${T.unknown}</text></g>
        <g data-k="made"><g class="hg-sun" transform="translate(${OX} 211)"><circle r="6.5"/>
          <path d="${[0, 45, 90, 135, 180, 225, 270, 315].map(a => { const r = a * Math.PI / 180; return `M${f1(9.5 * Math.cos(r))} ${f1(9.5 * Math.sin(r))} L${f1(13 * Math.cos(r))} ${f1(13 * Math.sin(r))}`; }).join(" ")}"/></g>
          <text class="hg-made" x="${OX}" y="243">${T.made}</text></g>
        <g class="hg-tag" data-k="t1"><rect x="205" y="134" width="90" height="31" rx="6"/><text class="h" x="212" y="146">${T.worst}</text><text class="v" x="212" y="159">${T.w1}</text></g>
        <g class="hg-tag b" data-k="t2"><rect x="205" y="184" width="90" height="31" rx="6"/><text class="h" x="212" y="196">${T.worst}</text><text class="v" x="212" y="209">${T.w2}</text></g>
        <g data-k="lk"><path class="hg-link" d="${LK.d}"/>${head(kx, ky, Math.atan2(ky - 44, kx - 176) * 180 / Math.PI, "hg-lh")}</g>
        <text class="hg-lb bad c" data-k="lkt" x="${lx + 16}" y="47">${T.judged}</text>
        <g class="hg-cut" data-k="cut"><circle r="7.5"/><path d="M-3.2 -3.2 L3.2 3.2 M3.2 -3.2 L-3.2 3.2"/></g>
        <g class="hg-chip" data-k="chip"><rect data-k="chipr" y="8" height="23" rx="11.5"/><text data-k="chipt" y="24">${T.bias}</text></g>
        <g data-k="ka"><path class="hg-ka" data-k="kap" pathLength="1" stroke-dasharray="1 1" d="${KA}"/><g data-k="kah">${head(kx, ky, Math.atan2(ky - 86, kx - 161) * 180 / Math.PI, "hg-kh")}</g></g>
        <g class="hg-bdg x" data-k="bx"><circle cx="${BU[0]}" cy="${BU[1]}" r="8.5"/><path d="M${BU[0] - 3.2} ${BU[1] - 3.2} l6.4 6.4 m0 -6.4 l-6.4 6.4"/></g>
        <g class="hg-bdg qm" data-k="bq"><circle cx="${BU[0]}" cy="${BU[1]}" r="8.5"/><text x="${BU[0]}" y="${BU[1] + 4}">?</text></g>
        <g class="hg-bdg ok" data-k="bok"><circle cx="${BU[0]}" cy="${BU[1]}" r="8.5"/><path data-k="chk" pathLength="1" stroke-dasharray="1 1" d="M${BU[0] - 4} ${BU[1] + .2} l2.85 2.85 l5.3 -6.1"/></g>
        <g data-k="die"><g class="hg-die" transform="translate(${BL[0]} ${BL[1]})"><rect x="-7" y="-7" width="14" height="14" rx="3"/>
          <circle cx="-3.3" cy="-3.3" r="1.35"/><circle r="1.35"/><circle cx="3.3" cy="3.3" r="1.35"/></g></g>
        <text class="hg-lb" data-k="luck" x="173" y="208">${T.luck}</text>
        <g class="hg-car o" data-k="car2">${CAR}</g>
        <g class="hg-car" data-k="car1">${CAR}</g>
        <path class="hg-rw" data-k="rw" d="M-1 -4.5 L-8 0 L-1 4.5 Z M7 -4.5 L0 0 L7 4.5 Z"/>`;
    },
    S0: { rw: 0, map: 0, fl: 0, al: 0, tr: 0, pick: 0, c1: 0, empty: 0, clock: 0, wait: 0, cloud: 0, link: 0, bx: 0,
      veil: 0, dl: 0, bq: 0, kh: 0, t1: 0, t2: 0, c2op: 0, c2: 0, made: 0, die: 0, link2: 0, chip: 0, cut: 0, ka: 0, bok: 0 },
    render(S, k) {
      const op = (key, v) => { k(key).style.opacity = f1(clamp(v) * 100) / 100; };
      const pop = (key, v, cx, cy) => { const s = .6 + .4 * Math.min(1.08, v); k(key).setAttribute("transform", `translate(${cx} ${cy}) scale(${f1(s * 100) / 100}) translate(${-cx} ${-cy})`); op(key, v * 1.5); };
      // the map, and the choice
      op("map", S.map);
      op("upm", 1 - S.pick); op("upq", S.pick);
      op("lom", 1 - S.pick); op("lod", S.pick);
      op("labs", S.pick);
      // what you knew
      pop("fl", S.fl, 70, 43); pop("al", S.al, 70, 85);
      op("knew", S.kh); op("hl", S.kh);
      // the cars
      const [x1, y1, a1] = car1At(S.c1);
      k("car1").setAttribute("transform", `translate(${f1(x1)} ${f1(y1)}) rotate(${f1(a1)})`);
      op("car1", S.map);
      k("rw").setAttribute("transform", `translate(${f1(x1)} ${f1(y1 - 24)})`); op("rw", S.rw);
      const [x2, y2, a2] = along(SL, LY, S.c2);
      k("car2").setAttribute("transform", `translate(${f1(x2)} ${f1(y2)}) rotate(${f1(a2)})`);
      op("car2", S.c2op);
      // the traffic forecast: a car that drives through finds the road empty, and rewinding brings the forecast back
      for (const [key, x, y] of [["tr1", x1, UY], ["tr2", S.c2op > 0 ? x2 : 0, LY]]) {
        const x0 = Math.max(TR0, Math.min(TR1, x));
        k(key).setAttribute("d", `M${f1(x0)} ${y} H${TR1}`);
        op(key, TR1 - x0 < 1 ? 0 : S.tr);
      }
      op("empty", S.empty);
      // how it turned out: the long wait and the storm, which fade when you rewind to the moment you decided
      const seen = 1 - .82 * S.veil;
      op("clock", S.clock * seen);
      k("hand").setAttribute("transform", `rotate(${f1(S.wait * 720)})`);
      k("cloud").setAttribute("transform", `translate(0 ${f1(-8 * (1 - S.cloud))})`);
      op("cloud", S.cloud * seen);
      op("veil", S.veil);
      op("dl", S.dl); op("dlt", S.dl);
      // judged by the outcome, then named and cut
      op("lk", Math.max(S.link, S.link2)); op("lkt", S.link);
      const cs = Math.max(.001, S.cut);
      k("cut").setAttribute("transform", `translate(${LK.mid[0]} ${LK.mid[1]}) scale(${f1(cs * 100) / 100})`);
      op("cut", S.cut * 3);
      const ct = k("chipt"), w = (ct.getComputedTextLength ? ct.getComputedTextLength() : 150) + 22, cx = 220;
      const cr = k("chipr"); cr.setAttribute("x", f1(cx - w / 2)); cr.setAttribute("width", f1(w)); ct.setAttribute("x", cx);
      pop("chip", S.chip, cx, 19);
      // the grade on your road: ✗ from the outcome, ? when you rewind, ✓ from what you knew
      pop("bx", S.bx, BU[0], BU[1]); pop("bq", S.bq, BU[0], BU[1]);
      op("bok", S.bok * 3);
      k("chk").setAttribute("stroke-dashoffset", f1(1 - S.bok));
      k("kap").setAttribute("stroke-dashoffset", f1(1 - S.ka));
      op("ka", S.ka > .01 ? 1 : 0); op("kah", clamp(S.ka * 8 - 7));
      // the worst case of each choice
      k("t1").setAttribute("transform", `translate(${f1(-10 * (1 - S.t1))} 0)`); op("t1", S.t1);
      k("t2").setAttribute("transform", `translate(${f1(-10 * (1 - S.t2))} 0)`); op("t2", S.t2);
      // the other driver: made it, by luck
      op("made", S.made);
      pop("die", S.die, BL[0], BL[1]); op("luck", S.die);
    },
    beats: [
      { steps: [{ to: { map: 1 }, ms: 600, sfx: "pluck" }, { to: { fl: 1 }, ms: 450, ease: "back" }, { wait: 250 },
        { to: { al: 1 }, ms: 450, ease: "back", sfx: "pop" }, { to: { tr: 1 }, ms: 600 }] },
      { steps: [{ to: { pick: 1 }, ms: 400 }, { to: { c1: 2 }, ms: 1900, ease: "inOut", sfx: "whoosh" }, { to: { empty: 1 }, ms: 400 }] },
      { steps: [{ to: { empty: 0, clock: 1 }, ms: 400 }, { to: { wait: 1 }, ms: 1300, ease: "inOut" },
        { to: { cloud: 1 }, ms: 500, ease: "back", sfx: "thud" }, { to: { link: 1 }, ms: 500 }, { to: { bx: 1 }, ms: 400, ease: "back" }] },
      { steps: [{ to: { link: 0, bx: 0, rw: 1 }, ms: 300 }, { to: { c1: .7, veil: 1 }, ms: 1400, ease: "inOut", sfx: "whoosh" },
        { to: { dl: 1, rw: 0 }, ms: 400 }, { to: { bq: 1 }, ms: 350, ease: "back" }] },
      { steps: [{ to: { kh: 1 }, ms: 500 }, { wait: 300 }, { to: { t1: 1 }, ms: 450 }, { wait: 300 }, { to: { t2: 1 }, ms: 450, ease: "back", sfx: "pop" }], hold: 3000 },
      { steps: [{ to: { c2op: 1 }, ms: 300 }, { to: { c2: 1 }, ms: 1600, ease: "inOut", sfx: "whoosh" }, { to: { made: 1 }, ms: 400 },
        { to: { die: 1 }, ms: 400, ease: "back" }], hold: 2800 },
      { steps: [{ to: { link2: 1 }, ms: 500 }, { to: { chip: 1 }, ms: 450, ease: "back" }, { wait: 250 },
        { to: { cut: 1 }, ms: 500, ease: "back", sfx: "spring" }], hold: 3000 },
      { steps: [{ to: { link2: 0, cut: 0, chip: 0 }, ms: 400 }, { to: { ka: 1 }, ms: 700 }, { to: { bq: 0 }, ms: 200 },
        { to: { bok: 1 }, ms: 450, sfx: "chime" }, { wait: 400 }, { to: { c1: 2, veil: 0 }, ms: 1700, ease: "inOut" }], hold: 4200 }
    ]
  };
})();
