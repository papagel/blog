/* Family "Stories & patterns": we find stories and patterns even in sparse or random data.
   One sky of scattered dots stays on screen. The brain joins some into a wolf (fast, and it kept our
   ancestors alive), then sees a clump, a face and a trend: clustering illusion, pareidolia and
   insensitivity to sample size. A die throws the same dots again: the shapes are gone, and chance
   draws new clumps and faces. The fix: ask what chance would draw, and get more dots.
   Dot positions come from fixed seeds, so every recording is identical. Scene for anim.js. */
(function () {
  const KEY = "family-patterns", P = `.bp[data-scene="${KEY}"]`;
  const f1 = n => +n.toFixed(1);
  const clamp = v => Math.max(0, Math.min(1, v));
  const back = p => 1 + 2.7 * Math.pow(p - 1, 3) + 1.7 * Math.pow(p - 1, 2);
  const outC = p => 1 - Math.pow(1 - p, 3);
  const inQ = p => p * p;
  const seeded = a => () => { a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  const SKY = [18, 14, 382, 220];                       // where dots may land after the throw: x0, y0, x1, y1
  const SKY_A = [18, 16, 382, 256];                     // the first sky can use the bottom row too

  // First sky: the shapes the brain will find, hidden among the other dots
  const WOLF = [[44, 122], [52, 58], [84, 88], [116, 58], [124, 122], [84, 164]];   // outline: cheek, ear, brow, ear, cheek, muzzle
  const EYES = [[70, 111], [98, 111]];
  const NOTE = [84, 188];                               // "better safe than sorry"
  const CC = [232, 60], CR = 23;                        // the clump and its ring
  const CLUMP = [[221, 55], [232, 49], [243, 56], [227, 66], [239, 69], [215, 64]];
  const FC = [336, 140], FR = 20;                       // the face and its ring
  const FACE = [[327, 134], [345, 134], [336, 149]];
  const BOX = [150, 146, 80, 80];                       // the trend: a small window, four rising dots
  const TREND = [[164, 212], [180, 197], [196, 189], [214, 170]];
  const ARROW = "M158 220 L224 162 M213 163.5 L224 162 L222.5 173";
  const L1 = [232, 101], L2 = [336, 178], L3 = [190, 240];   // bias labels (pill centres)

  // Second sky, after the throw: chance makes a new clump and a new face
  const BC = [106, 160], BCD = [[-10, -5], [1, -10], [11, -3], [-4, 6], [8, 8]];
  const BF = [300, 64], BFD = [[-9, -6], [9, -6], [0, 9]];
  const TAGY = 34;                                      // "by chance" tag, below each ring

  // Bottom row: the die (item 1 icon), and the two checks
  const DIE = [30, 246], ROW = 250.5;

  function inWolf(p) {
    let inside = false;
    for (let i = 0, j = WOLF.length - 1; i < WOLF.length; j = i++) {
      const [xi, yi] = WOLF[i], [xj, yj] = WOLF[j];
      if ((yi > p[1]) !== (yj > p[1]) && p[0] < (xj - xi) * (p[1] - yi) / (yj - yi) + xi) inside = !inside;
    }
    if (inside) return true;
    for (let i = 0; i < WOLF.length; i++) {
      const a = WOLF[i], b = WOLF[(i + 1) % WOLF.length], dx = b[0] - a[0], dy = b[1] - a[1];
      const t = clamp(((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy));
      if (dist(p, [a[0] + t * dx, a[1] + t * dy]) < 11) return true;
    }
    return false;
  }
  const inRect = (p, [x0, y0, x1, y1]) => p[0] > x0 && p[0] < x1 && p[1] > y0 && p[1] < y1;
  function scatter(seed, n, taken, minD, bad, box = SKY) {
    const r = seeded(seed), out = [];
    for (let tries = 0; out.length < n && tries < 20000; tries++) {
      const p = [f1(box[0] + r() * (box[2] - box[0])), f1(box[1] + r() * (box[3] - box[1]))];
      if (bad(p) || taken.some(q => dist(p, q) < minD) || out.some(q => dist(p, q) < minD)) continue;
      out.push(p);
    }
    return out;
  }

  const SPECIAL = [...WOLF, ...EYES, ...CLUMP, ...FACE, ...TREND];
  const FILL = scatter(11, 24, SPECIAL, 18, p => inWolf(p) ||
    [[14, 176, 156, 200], [144, 88, 320, 115], [290, 166, 384, 192], [80, 226, 300, 262], [14, 224, 70, 272],
      [BOX[0] - 12, BOX[1] - 12, BOX[0] + BOX[2] + 12, BOX[1] + BOX[3] + 12]].some(z => inRect(p, z)) ||
    dist(p, CC) < CR + 12 || dist(p, FC) < FR + 12, SKY_A);
  const A = [...SPECIAL, ...FILL], N = A.length;
  const BSP = [...BCD.map(([x, y]) => [BC[0] + x, BC[1] + y]), ...BFD.map(([x, y]) => [BF[0] + x, BF[1] + y])];
  const BREST = scatter(23, N - BSP.length, BSP, 19, p => dist(p, BC) < 36 || dist(p, BF) < 34 ||
    inRect(p, [BC[0] - 40, BC[1] + TAGY - 12, BC[0] + 40, BC[1] + TAGY + 6]) || inRect(p, [BF[0] - 40, BF[1] + TAGY - 12, BF[0] + 40, BF[1] + TAGY + 6]));
  const B = [...BSP, ...BREST];
  const MORE = scatter(37, 48, B, 13, p => inRect(p, [BC[0] - 34, BC[1] + TAGY - 13, BC[0] + 34, BC[1] + TAGY + 5]) ||
    inRect(p, [BF[0] - 34, BF[1] + TAGY - 13, BF[0] + 34, BF[1] + TAGY + 5]));
  const rr = seeded(5);
  const RAD = A.map((_, i) => i < SPECIAL.length ? 2.6 : f1(2 + rr() * 1));
  const PIN = A.map(() => rr() * .8);                   // when each dot pops in
  const OUT = A.map(() => rr());                        // when each dot leaves the die
  const MRAD = MORE.map(() => f1(1.7 + rr() * .8)), MPIN = MORE.map(() => rr() * .85);
  const CNT = N + MORE.length;

  const ring = (c, r) => `M${c[0]} ${c[1] - r} a${r} ${r} 0 1 1 0 ${2 * r} a${r} ${r} 0 1 1 0 ${-2 * r}`;
  const pill = key => `<g class="fp-pill" data-k="${key}"><rect data-k="${key}r" height="18" rx="9"/><text data-k="${key}t"></text></g>`;

  window.BiasAnim.SCENES[KEY] = {
    q: "nem", viewBox: "0 0 400 272",
    css: `
      ${P} .fp-dot{fill:var(--ink)}
      ${P} .fp-line{fill:none;stroke:var(--q);stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
      ${P} .fp-eye{fill:var(--q)}
      ${P} .fp-box{fill:none;stroke:var(--muted);stroke-width:1.4;stroke-dasharray:3 3.5}
      ${P} .fp-note{font:500 10px var(--mono);fill:var(--q);text-anchor:middle}
      ${P} .fp-pill rect{fill:var(--surface);stroke:var(--q);stroke-width:1.4}
      ${P} .fp-pill text{font:600 11px var(--display);fill:var(--ink);text-anchor:middle}
      ${P} .fp-chance{fill:none;stroke:var(--muted);stroke-width:1.6;stroke-dasharray:3 3.5}
      ${P} .fp-tag{font:500 9.5px var(--mono);fill:var(--muted);text-anchor:middle}
      ${P} .fp-die rect{fill:var(--surface);stroke:var(--ink);stroke-width:1.8}
      ${P} .fp-die circle{fill:var(--ink)}
      ${P} .fp-rand{font:500 10px var(--mono);fill:var(--q)}
      ${P} .fp-it{font:600 11.5px var(--display);fill:var(--ink)}
      ${P} .fp-it.ok{fill:var(--good)}
      ${P} .fp-tick{fill:none;stroke:var(--good);stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round}
      ${P} .fp-chip rect{fill:var(--surface);stroke:var(--ink);stroke-width:1.6}
      ${P} .fp-chip text{font:600 10px var(--mono);fill:var(--ink);text-anchor:middle}
    `,
    text: {
      en: {
        name: "Stories & patterns", shareTitle: "Why we see patterns in noise, in 30 seconds",
        ecline: "Your brain finds stories even in random dots, so ask what chance would draw before you believe one.",
        note: "better safe than sorry", b1: "Clustering illusion", b2: "Pareidolia", b3: "Insensitivity to sample size",
        rand: "thrown at random", chance: "by chance", q1: "What would chance draw?", q2: "Enough dots?",
        caps: [
          "Life gives you only <b>scattered dots</b>: a few clues, never the full picture.",
          "Your brain <b>joins the dots</b>: a wolf! Quick instincts kept our ancestors alive.",
          "It sees patterns in noise too: a random clump seems to <b>mean something</b>.",
          "Three dots in a triangle, and suddenly <b>a face</b> looks back.",
          "Just four dots, yet they feel like <b>a sure trend</b>.",
          "But the dots fell <b>at random</b>. The stories came from your mind.",
          "<b>The fix:</b> ask what chance alone would draw. Clumps and faces, too.",
          "Then gather <b>more dots</b>. Patterns that hold up are worth trusting."
        ],
        say: [
          "Life gives you only scattered dots: a few clues, never the full picture.",
          "Your brain joins the dots. A wolf! Quick instincts like this kept our ancestors alive. Better safe than sorry.",
          "But it sees patterns in noise too. A random clump seems to mean something. It's called the clustering illusion.",
          "Three dots in a triangle, and suddenly a face looks back. That's pareidolia.",
          "Just four dots, yet they feel like a sure trend. That's insensitivity to sample size.",
          "But the dots fell at random. The stories came from your mind.",
          "The fix: ask what chance alone would draw. It makes clumps and faces too.",
          "Then gather more dots. Patterns that hold up are worth trusting.",
          "Stories and patterns. Your brain finds stories even in random dots, so ask what chance would draw before you believe one."
        ]
      },
      el: {
        name: "Ιστορίες & μοτίβα", shareTitle: "Γιατί βλέπουμε μοτίβα μέσα στον θόρυβο, σε 30 δευτερόλεπτα",
        ecline: "Το μυαλό σου βρίσκει ιστορίες ακόμα και σε τυχαίες κουκκίδες. Πριν πιστέψεις κάποια, σκέψου τι θα έβγαζε η τύχη.",
        note: "ο φόβος φυλάει τα έρμα", b1: "Ψευδαίσθηση ομαδοποίησης", b2: "Παρειδωλία", b3: "Παράβλεψη μεγέθους δείγματος",
        rand: "ρίχτηκαν στην τύχη", chance: "τυχαία", q1: "Τι θα έβγαζε η τύχη;", q2: "Αρκετές κουκκίδες;",
        caps: [
          "Η ζωή σού δίνει μόνο <b>σκόρπιες κουκκίδες</b>: λίγα στοιχεία, ποτέ ολόκληρη την εικόνα.",
          "Το μυαλό σου <b>ενώνει τις κουκκίδες</b>: λύκος! Τέτοια ένστικτα έσωσαν τους προγόνους μας.",
          "Βλέπει μοτίβα και στον θόρυβο: μια τυχαία συστάδα μοιάζει να <b>σημαίνει κάτι</b>.",
          "Τρεις κουκκίδες σε τρίγωνο, και ξαφνικά σε κοιτάζει <b>ένα πρόσωπο</b>.",
          "Μόνο τέσσερις κουκκίδες, κι όμως μοιάζουν με <b>σίγουρη τάση</b>.",
          "Όμως οι κουκκίδες έπεσαν <b>στην τύχη</b>. Τις ιστορίες τις έβαλε το μυαλό σου.",
          "<b>Η λύση:</b> σκέψου τι θα έβγαζε η σκέτη τύχη. Βγάζει κι εκείνη συστάδες και πρόσωπα.",
          "Μετά μάζεψε <b>κι άλλες κουκκίδες</b>. Όσα μοτίβα αντέξουν, αξίζουν εμπιστοσύνη."
        ],
        say: [
          "Η ζωή σού δίνει μόνο σκόρπιες κουκκίδες: λίγα στοιχεία, ποτέ ολόκληρη την εικόνα.",
          "Το μυαλό σου ενώνει τις κουκκίδες. Λύκος! Τέτοια γρήγορα ένστικτα κράτησαν ζωντανούς τους προγόνους μας. Ο φόβος φυλάει τα έρμα.",
          "Όμως βλέπει μοτίβα και στον θόρυβο. Μια τυχαία συστάδα μοιάζει να σημαίνει κάτι. Λέγεται ψευδαίσθηση ομαδοποίησης.",
          "Τρεις κουκκίδες σε τρίγωνο, και ξαφνικά σε κοιτάζει ένα πρόσωπο. Είναι η παρειδωλία.",
          "Μόνο τέσσερις κουκκίδες, κι όμως μοιάζουν με σίγουρη τάση. Εδώ φταίει η παράβλεψη μεγέθους δείγματος.",
          "Όμως οι κουκκίδες έπεσαν στην τύχη. Τις ιστορίες τις έβαλε το μυαλό σου.",
          "Η λύση: σκέψου τι θα έβγαζε η σκέτη τύχη. Βγάζει κι εκείνη συστάδες και πρόσωπα.",
          "Μετά μάζεψε κι άλλες κουκκίδες. Όσα μοτίβα αντέξουν, αξίζουν εμπιστοσύνη.",
          "Ιστορίες και μοτίβα. Το μυαλό σου βρίσκει ιστορίες ακόμα και σε τυχαίες κουκκίδες. Πριν πιστέψεις κάποια, σκέψου τι θα έβγαζε η τύχη."
        ]
      }
    },
    svg(T) {
      const wolf = `M${WOLF.map(p => p.join(" ")).join(" L")} Z`;
      const pips = [[-4.5, -4.5], [4.5, -4.5], [0, 0], [-4.5, 4.5], [4.5, 4.5]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.7"/>`).join("");
      return `
        <path class="fp-line" data-k="wolf" pathLength="1" stroke-dasharray="1 1" d="${wolf}"/>
        <path class="fp-line" data-k="clump" pathLength="1" stroke-dasharray="1 1" d="${ring(CC, CR)}"/>
        <path class="fp-line" data-k="face" pathLength="1" stroke-dasharray="1 1" d="${ring(FC, FR)}"/>
        <rect class="fp-box" data-k="box" x="${BOX[0]}" y="${BOX[1]}" width="${BOX[2]}" height="${BOX[3]}" rx="6"/>
        <path class="fp-line" data-k="arrow" pathLength="1" stroke-dasharray="1 1" d="${ARROW}"/>
        <g data-k="chance">
          <path class="fp-chance" d="${ring(BC, 22)}"/><path class="fp-chance" d="${ring(BF, 20)}"/>
          <text class="fp-tag" x="${BC[0]}" y="${BC[1] + TAGY}">${T.chance}</text><text class="fp-tag" x="${BF[0]}" y="${BF[1] + TAGY}">${T.chance}</text>
        </g>
        <g data-k="dots">${A.map(() => `<circle class="fp-dot" r="0"/>`).join("")}</g>
        <g data-k="more">${MORE.map(([x, y]) => `<circle class="fp-dot" cx="${x}" cy="${y}" r="0"/>`).join("")}</g>
        <g data-k="eyes">${EYES.map(([x, y]) => `<circle class="fp-eye" cx="${x}" cy="${y}" r="3.6"/>`).join("")}</g>
        <text class="fp-note" data-k="note" x="${NOTE[0]}" y="${NOTE[1]}">${T.note}</text>
        ${pill("l1")}${pill("l2")}${pill("l3")}
        <text class="fp-rand" data-k="rand" x="${DIE[0] + 16}" y="${ROW}">${T.rand}</text>
        <g data-k="it1"><text class="fp-it" data-k="it1t" x="${DIE[0] + 16}" y="${ROW}">${T.q1}</text>
          <path class="fp-tick" data-k="tk1" pathLength="1" stroke-dasharray="1 1" d="M0 -4 L4 0 L11 -8"/></g>
        <g data-k="it2"><g class="fp-chip" data-k="chip"><rect x="0" y="${ROW - 12.5}" width="30" height="17" rx="5"/><text data-k="cnt" x="15" y="${ROW - .5}"></text></g>
          <text class="fp-it" data-k="it2t" y="${ROW}">${T.q2}</text>
          <path class="fp-tick" data-k="tk2" pathLength="1" stroke-dasharray="1 1" d="M0 -4 L4 0 L11 -8"/></g>
        <g class="fp-die" data-k="die"><rect x="-9" y="-9" width="18" height="18" rx="4"/>${pips}</g>`;
    },
    S0: { dots: 0, wolf: 0, eyes: 0, note: 0, wolfOp: 1, clump: 0, l1: 0, clumpOp: 1, face: 0, l2: 0, faceOp: 1,
      box: 0, trend: 0, l3: 0, clear: 0, die: 0, gather: 0, shake: 0, scatter: 0, rand: 0,
      chance: 0, it1: 0, tick1: 0, it2: 0, more: 0, tick2: 0 },
    render(S, k, T) {
      const op = (key, v) => { k(key).style.opacity = clamp(v); };
      const draw = (key, v) => { k(key).setAttribute("stroke-dashoffset", f1(1 - clamp(v)) || 0); };
      const keep = 1 - S.clear;
      // the dots: pop in, then fly into the die and out again to new places
      const ds = k("dots").children;
      for (let i = 0; i < N; i++) {
        const pin = clamp((S.dots - PIN[i]) / .2), g = clamp((S.gather - i / N * .4) / .6), s = clamp((S.scatter - OUT[i] * .4) / .6);
        let x, y, r = RAD[i] * (pin > 0 ? back(pin) : 0), o = 1;
        if (s > 0) { const e = outC(s); x = DIE[0] + (B[i][0] - DIE[0]) * e; y = DIE[1] + (B[i][1] - DIE[1]) * e; r *= .4 + .6 * e; }
        else { const e = inQ(g); x = A[i][0] + (DIE[0] - A[i][0]) * e; y = A[i][1] + (DIE[1] - A[i][1]) * e; r *= 1 - .6 * e; o = g > .85 ? 0 : 1; }
        const d = ds[i]; d.setAttribute("cx", f1(x)); d.setAttribute("cy", f1(y)); d.setAttribute("r", f1(r)); d.style.opacity = o;
      }
      const ms = k("more").children;
      for (let i = 0; i < MORE.length; i++) { const p = clamp((S.more - MPIN[i]) / .15); ms[i].setAttribute("r", f1(MRAD[i] * (p > 0 ? back(p) : 0))); }
      // the stories the brain draws
      draw("wolf", S.wolf); op("wolf", (S.wolf > 0) * S.wolfOp * keep);
      op("eyes", S.eyes * S.wolfOp * keep); op("note", S.note * keep);
      draw("clump", S.clump); op("clump", (S.clump > 0) * S.clumpOp * keep);
      draw("face", S.face); op("face", (S.face > 0) * S.faceOp * keep);
      op("box", S.box * keep);
      draw("arrow", S.trend); op("arrow", (S.trend > 0) * keep);
      // bias labels: pills sized to their text
      [["l1", L1, T.b1, S.l1 * S.clumpOp], ["l2", L2, T.b2, S.l2 * S.faceOp], ["l3", L3, T.b3, S.l3]].forEach(([key, [x, y], txt, v]) => {
        const t = k(key + "t"); if (t.textContent !== txt) t.textContent = txt;
        const w = (t.getComputedTextLength ? t.getComputedTextLength() : txt.length * 6) + 20, r = k(key + "r");
        r.setAttribute("x", f1(x - w / 2)); r.setAttribute("y", y - 9); r.setAttribute("width", f1(w));
        t.setAttribute("x", x); t.setAttribute("y", y + 4);
        const sc = .8 + .2 * back(clamp(v));
        k(key).setAttribute("transform", `translate(${x} ${y}) scale(${f1(sc * 100) / 100}) translate(${-x} ${-y})`);
        op(key, Math.min(1, v * 1.5) * keep);
      });
      // the die tumbles in, shakes, and throws the dots
      const rot = (1 - S.die) * -120 + (S.shake > 0 && S.shake < 1 ? Math.sin(S.shake * Math.PI * 6) * 18 : 0);
      k("die").setAttribute("transform", `translate(${DIE[0]} ${f1(DIE[1] + (1 - S.die) * 26)}) rotate(${f1(rot)})`);
      op("die", S.die * 2);
      op("rand", S.rand);
      op("chance", S.chance * (1 - clamp(S.more * 1.6)));
      // the checks
      const t1 = k("it1t"), w1 = t1.getComputedTextLength ? t1.getComputedTextLength() : 130;
      t1.classList.toggle("ok", S.tick1 > .5);
      k("tk1").setAttribute("transform", `translate(${f1(DIE[0] + 16 + w1 + 8)} ${ROW})`); draw("tk1", S.tick1);
      op("it1", S.it1);
      const t2 = k("it2t"), w2 = t2.getComputedTextLength ? t2.getComputedTextLength() : 90;
      const x2 = SKY[2] - (30 + 7 + w2 + 8 + 11);
      k("chip").setAttribute("transform", `translate(${f1(x2)} 0)`);
      t2.setAttribute("x", f1(x2 + 37)); t2.classList.toggle("ok", S.tick2 > .5);
      k("tk2").setAttribute("transform", `translate(${f1(x2 + 37 + w2 + 8)} ${ROW})`); draw("tk2", S.tick2);
      k("cnt").textContent = Math.round(N + MORE.length * S.more);
      op("it2", S.it2);
    },
    beats: [
      { steps: [{ to: { dots: 1 }, ms: 1700, ease: "lin", sfx: "pluck" }], hold: 2400 },
      { steps: [{ to: { wolf: 1 }, ms: 1400, ease: "inOut", sfx: "scribble" }, { to: { eyes: 1 }, ms: 300 }, { to: { note: 1 }, ms: 400 }], hold: 2800 },
      { steps: [{ to: { wolfOp: .3, note: 0 }, ms: 400 }, { to: { clump: 1 }, ms: 700, sfx: "pop" }, { to: { l1: 1 }, ms: 350 }] },
      { steps: [{ to: { clumpOp: .4 }, ms: 400 }, { to: { face: 1 }, ms: 700, sfx: "pop" }, { to: { l2: 1 }, ms: 350 }] },
      { steps: [{ to: { faceOp: .4 }, ms: 400 }, { to: { box: 1 }, ms: 400 }, { to: { trend: 1 }, ms: 800, sfx: "scribble" }, { to: { l3: 1 }, ms: 350 }] },
      { steps: [{ to: { die: 1 }, ms: 600, ease: "back", sfx: "thud", sfxAt: 250 }, { to: { clear: 1, gather: 1 }, ms: 900, ease: "inOut" },
        { to: { shake: 1 }, ms: 380, ease: "lin" }, { to: { scatter: 1 }, ms: 900, sfx: "whoosh" }, { to: { rand: 1 }, ms: 400 }], hold: 2800 },
      { steps: [{ to: { rand: 0 }, ms: 300 }, { to: { chance: 1 }, ms: 700, sfx: "tick" }, { to: { it1: 1 }, ms: 400 }, { to: { tick1: 1 }, ms: 400 }], hold: 2800 },
      { steps: [{ to: { it2: 1 }, ms: 400 }, { to: { more: 1 }, ms: 1800, ease: "lin" }, { to: { tick2: 1 }, ms: 450, sfx: "chime" }], hold: 4200 }
    ]
  };
})();
