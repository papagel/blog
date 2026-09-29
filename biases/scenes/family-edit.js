/* Family "Edited memories": we edit and reinforce some memories after the fact. A birthday memory, kept like a
   photo, is rebuilt each time it's recalled. A leading question adds a clown, a dog walks in from a film, a treasure
   map from an old book feels like your own idea, and every recall makes you surer. A note written that day and a
   check of the sources send each extra back where it came from. Scene for anim.js. */
(function () {
  const KEY = "family-edit", P = `.bp[data-scene="${KEY}"]`;
  const cl = v => Math.max(0, Math.min(1, v));
  const f1 = n => +n.toFixed(1);
  // the photo is drawn in its own coordinates, then scaled up by Z around ZO; toL maps a point on screen into them
  const Z = 1.12, ZO = [200, 10], toL = ([x, y]) => [f1(ZO[0] + (x - ZO[0]) / Z), f1(ZO[1] + (y - ZO[1]) / Z)];
  const PX = 122, PY = 10, PW = 156, PH = 176;          // the photo: a polaroid, image on top, title strip below
  const IX = 131, IY = 19, IW = 138, IH = 124;          // its picture area
  const PC = [200, 10 + PH * Z / 2];                    // its centre on screen, for the lift when it's recalled
  const BK = [58, 36];                                  // the book, centre of its spine (on screen)
  const BUB = { x: 12, y: 76, w: 92, h: 38, tip: [116, 80] };   // the question bubble, and its tail's tip
  const FM = { x: 20, y: 128, w: 78, h: 46 };           // the film frame
  const FC = [FM.x + FM.w / 2, FM.y + FM.h / 2];        // the film's picture centre, where its dog sits
  const CL = [153, 62], CL0 = toL(BUB.tip), CS0 = .3 / Z;          // the clown: in the photo, and where it starts
  const DG = [150, 126], DG0 = toL(FC), DS0 = .55 / Z;             // the dog: in the photo, and in the film
  const MP = [156, 33], MP0 = toL([BK[0] + 14.5, BK[1] - .5]), MS0 = .42 / Z;   // the map: in the photo, and in the book
  const MT = { x: 336, y: 64, w: 14, h: 88 };           // the "how sure" meter
  const DY = { x: 297, y: 26, w: 92, h: 132 };          // the diary page
  const ROWS = [94, 114, 134];                          // its three items
  const TY = 222, TH = 28;                              // name tags: top, height
  const lerp = (a, b, t) => a + (b - a) * t;
  const io = t => (t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

  // the extras, each drawn round its own anchor; classes pick ink (part of the memory) or a dashed ghost (from outside)
  const CLOWN = `<circle class="a" cx="-10" cy="-3" r="3.8"/><circle class="a" cx="-10.5" cy="3.5" r="3.2"/>
    <circle class="a" cx="10" cy="-3" r="3.8"/><circle class="a" cx="10.5" cy="3.5" r="3.2"/>
    <path class="s" d="M-16 44 V26 C-16 16 -9 11 0 11 C9 11 16 16 16 26 V44"/>
    <path class="f" d="M0 16 L-6 12.5 V19.5 Z M0 16 L6 12.5 V19.5 Z"/><circle class="d" cx="0" cy="27" r="1.4"/><circle class="d" cx="0" cy="35" r="1.4"/>
    <circle class="s" r="8.5"/><circle class="d" cx="-3" cy="-2.2" r="1.1"/><circle class="d" cx="3" cy="-2.2" r="1.1"/>
    <circle class="f" cx="0" cy="1.2" r="2.4"/><path class="n" d="M-4 4.6 Q0 8 4 4.6"/>`;
  const DOG = `<path class="n" d="M-10 0 Q-16 -3 -14 -9"/><path class="n" d="M-7 6 V12 M-3 7 V12 M4 7 V12 M8 6 V12"/>
    <ellipse class="s" cx="0" cy="2" rx="11" ry="5.5"/><circle class="s" cx="11" cy="-5" r="5"/>
    <path class="a" d="M8.2 -9.2 Q5.2 -6 7.4 -1.8 Q9.6 -4.8 8.2 -9.2 Z"/><circle class="d" cx="12.6" cy="-6" r=".9"/><circle class="d" cx="15.8" cy="-4.2" r="1.1"/>`;
  const MAP = `<path class="s" d="M-17 -10 Q0 -13 17 -10 V10 Q0 13 -17 10 Z"/><path class="t" d="M-12 6 Q-6 -4 0 2 T10 -5"/>
    <path class="n" d="M8.6 -7.6 L13.4 -2.8 M13.4 -7.6 L8.6 -2.8"/>`;
  const extra = (key, shape, rot, more) => `<g data-k="${key}"><g${rot ? ` transform="rotate(${rot})"` : ""}>
    <g class="fe-ink" data-k="${key}s">${shape}</g><g class="fe-gh" data-k="${key}g">${shape}</g></g>${more || ""}</g>`;
  // the recall icon: an arrow going round
  const turn = r => {
    const a0 = -50 * Math.PI / 180, a1 = 250 * Math.PI / 180, p = a => [f1(r * Math.cos(a)), f1(r * Math.sin(a))];
    const [x0, y0] = p(a0), [x1, y1] = p(a1), tx = -Math.sin(a1), ty = Math.cos(a1);
    const head = w => { const c = Math.cos(w), s = Math.sin(w), bx = -tx, by = -ty; return `M${x1} ${y1} L${f1(x1 + 4.2 * (bx * c - by * s))} ${f1(y1 + 4.2 * (bx * s + by * c))}`; };
    return `M${x0} ${y0} A${r} ${r} 0 1 1 ${x1} ${y1} ${head(.6)} ${head(-.6)}`;
  };
  const tick = (x, y) => `M${x - 4.5} ${y} L${x - 1.3} ${y + 3.3} L${x + 4.8} ${y - 3.6}`;
  // one recall: the photo lifts and fades back to blank, is rebuilt with whatever changed, and goes back
  const recall = (n, swap, after, sfx) => [
    { to: { lift: 1, dev: .12, spin: n - .5 }, ms: 380, ease: "inOut", sfx },
    { to: { ...swap, cnt: n } },
    { to: { lift: 0, dev: 1, spin: n, ...after }, ms: 750, ease: "inOut" }
  ];

  window.BiasAnim.SCENES[KEY] = {
    q: "mem", viewBox: "0 0 400 272",
    css: `
      ${P} .fe-frame{fill:var(--surface);stroke:var(--ink);stroke-width:2}
      ${P} .fe-ok{fill:none;stroke:var(--good);stroke-width:2.6}
      ${P} .fe-img{fill:var(--q);stroke:var(--muted);stroke-width:1.2}
      ${P} .fe-ttl{font:600 11px var(--display);fill:var(--muted);text-anchor:middle}
      ${P} .fe-ink .s{fill:var(--surface);stroke:var(--ink);stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
      ${P} .fe-ink .a{fill:var(--q);fill-opacity:.4;stroke:var(--ink);stroke-width:1.5;stroke-linejoin:round}
      ${P} .fe-ink .f{fill:var(--q)}
      ${P} .fe-ink .d{fill:var(--ink)}
      ${P} .fe-ink .n{fill:none;stroke:var(--ink);stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}
      ${P} .fe-ink .q{fill:none;stroke:var(--q);stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
      ${P} .fe-ink .t{fill:none;stroke:var(--q);stroke-width:1.6;stroke-linecap:round;stroke-dasharray:2 2.6}
      ${P} .fe-ink .w{fill:none;stroke:var(--muted);stroke-width:1.1;stroke-linecap:round}
      ${P} .fe-gh .s,${P} .fe-gh .a{fill:var(--surface);stroke:var(--q);stroke-width:1.8;stroke-dasharray:3 2.4;stroke-linecap:round}
      ${P} .fe-gh .f,${P} .fe-gh .d{fill:var(--q)}
      ${P} .fe-gh .n,${P} .fe-gh .t{fill:none;stroke:var(--q);stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}
      ${P} .fe-gh .t{stroke-dasharray:2 2.6}
      ${P} .fe-tag rect{fill:var(--surface);stroke:var(--q);stroke-width:1.4}
      ${P} .fe-tag path{fill:none;stroke:var(--q);stroke-width:1.2}
      ${P} .fe-tag text{font:500 9px var(--mono);fill:var(--q);text-anchor:middle}
      ${P} .fe-bub rect,${P} .fe-bub path{fill:var(--surface);stroke:var(--q);stroke-width:1.8;stroke-linejoin:round}
      ${P} .fe-bub text{font:600 11.5px var(--display);fill:var(--ink);text-anchor:middle}
      ${P} .fe-film .fr{fill:var(--surface);stroke:var(--ink);stroke-width:1.8}
      ${P} .fe-film .ho{fill:var(--ink);fill-opacity:.6}
      ${P} .fe-film .win{fill:var(--q);fill-opacity:.08;stroke:var(--muted);stroke-width:1.2}
      ${P} .fe-book .pg{fill:var(--surface);stroke:var(--ink);stroke-width:1.8;stroke-linejoin:round}
      ${P} .fe-book .ln{stroke:var(--faint);stroke-width:1.4;stroke-linecap:round}
      ${P} .fe-book .mp{fill:none;stroke:var(--q);stroke-width:1.5;stroke-linecap:round;stroke-dasharray:2 2.4}
      ${P} .fe-book .x{fill:none;stroke:var(--q);stroke-width:1.6;stroke-linecap:round}
      ${P} .fe-lab{font:500 9.5px var(--mono);fill:var(--muted);text-anchor:middle}
      ${P} .fe-link{fill:none;stroke:var(--q);stroke-width:1.5;stroke-linecap:round;stroke-dasharray:2 3}
      ${P} .fe-bulb .gs{fill:var(--q);fill-opacity:.18;stroke:var(--q);stroke-width:2;stroke-linejoin:round}
      ${P} .fe-bulb .ln{fill:none;stroke:var(--q);stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
      ${P} .fe-rc{fill:none;stroke:var(--q);stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
      ${P} .fe-num{font:700 20px var(--display);fill:var(--ink)}
      ${P} .fe-bar{fill:var(--surface);stroke:var(--muted);stroke-width:1.6}
      ${P} .fe-fill{fill:var(--q)}
      ${P} .fe-dy .pg{fill:var(--surface);stroke:var(--ink);stroke-width:1.8}
      ${P} .fe-dy .ring{fill:var(--surface);stroke:var(--ink);stroke-width:1.6}
      ${P} .fe-dy .rule{stroke:var(--rule);stroke-width:1.4}
      ${P} .fe-dy .h{font:500 9.5px var(--mono);fill:var(--muted)}
      ${P} .fe-dy .ti{font:600 11.5px var(--display);fill:var(--ink)}
      ${P} .fe-dy .it{font:500 11.5px var(--display);fill:var(--ink)}
      ${P} .fe-tk{fill:none;stroke:var(--good);stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
      ${P} .fe-pill .bx{fill:var(--surface);stroke:var(--q);stroke-width:2}
      ${P} .fe-pill .lb{fill:var(--surface);stroke:none}
      ${P} .fe-pill .lg{font:500 9.5px var(--mono);fill:var(--q)}
      ${P} .fe-pill .nm{font:600 12.5px var(--display);fill:var(--ink);text-anchor:middle}
      ${P} .fe-pill.g .bx{stroke:var(--good)} ${P} .fe-pill.g .lg{fill:var(--good)}
    `,
    text: {
      en: {
        name: "Edited memories", shareTitle: "Why memories change each time we recall them, in 30 seconds",
        ecline: "Every recall rebuilds a memory, so write down what matters while it's fresh.",
        title: "My 8th birthday", ask: ["“Was the", "clown funny?”"], film: "a film", tagFilm: "film", book: "an old book",
        recalls: "recalls", sure: ["how sure", "you feel"],
        date: "12 May", party: "My party!", items: ["cake", "balloons", "presents"],
        bias: "bias", fix: "the fix", tags: ["Suggestibility", "Source confusion", "Cryptomnesia", "False memory", "Keep a record", "Check the sources"],
        tw: [124, 140, 116, 114, 120, 148],
        caps: [
          "Your 8th birthday: cake, balloons, presents. A memory, like a <b>photo</b>.",
          "Each recall <b>rebuilds</b> it and makes it <b>stronger</b>. Usually, that helps.",
          "“Was the <b>clown</b> funny?” There was no clown. Now <b>there is</b>.",
          "A dog from a <b>film</b> slips in. You forget <b>where you saw it</b>.",
          "The treasure hunt feels like <b>your idea</b>. It came from a <b>book</b>.",
          "Each recall made you <b>more sure</b>, but not <b>more right</b>.",
          "<b>The fix:</b> for what matters, <b>write it down</b> soon after.",
          "When it counts, <b>check your notes and sources</b>. The core holds up."
        ],
        say: [
          "Your eighth birthday. Cake, balloons, presents. You keep it as a memory, like a photo.",
          "Each time you recall it, your brain rebuilds it, and the memory gets stronger and easier to reach. It's how you keep what you know up to date. Usually, that helps.",
          "Someone asks: was the clown funny? There was no clown. But the next time you recall the party, there is one. That's suggestibility.",
          "A dog from a film slips into the picture, and you forget where you saw it. That's source confusion.",
          "The treasure hunt feels like your own idea. In fact, you read it in a book years ago. That's cryptomnesia.",
          "Each recall made you more sure, but not more right. That's a false memory, and it can feel just as vivid as a true one.",
          "The fix: for the things that matter, write them down soon after, while they're fresh.",
          "When it counts, check your notes and sources. The core holds up, and each extra goes back where it came from.",
          "Edited memories. Every recall rebuilds a memory, so write down what matters while it's fresh."
        ]
      },
      el: {
        name: "Ξαναγραμμένες μνήμες", shareTitle: "Γιατί οι αναμνήσεις αλλάζουν κάθε φορά που τις θυμόμαστε, σε 30 δευτερόλεπτα",
        ecline: "Όποτε θυμάσαι κάτι, ξαναχτίζεις την ανάμνηση, γι’\u00a0αυτό γράψε ό,τι μετράει όσο είναι ακόμα νωπό.",
        title: "Τα 8α γενέθλιά μου", ask: ["«Είχε πλάκα", "ο κλόουν;»"], film: "μια ταινία", tagFilm: "ταινία", book: "ένα παλιό βιβλίο",
        recalls: "ανακλήσεις", sure: ["σιγουριά"],
        date: "12 Μαΐου", party: "Το πάρτι μου!", items: ["τούρτα", "μπαλόνια", "δώρα"],
        bias: "μεροληψία", fix: "η λύση", tags: ["Επιδεκτικότητα στην υποβολή", "Σύγχυση πηγής", "Κρυπτομνησία", "Ψευδής ανάμνηση", "Κράτα αρχείο", "Έλεγξε τις πηγές"],
        tw: [214, 124, 118, 138, 114, 146],
        caps: [
          "Τα όγδοα γενέθλιά σου: τούρτα, μπαλόνια, δώρα. Μια ανάμνηση σαν <b>φωτογραφία</b>.",
          "Όποτε τη θυμάσαι, το μυαλό την <b>ξαναχτίζει</b> και τη <b>δυναμώνει</b>. Συνήθως βοηθάει.",
          "«Είχε πλάκα ο <b>κλόουν</b>;» Κλόουν δεν υπήρχε. Τώρα <b>υπάρχει</b>.",
          "Ένας σκύλος από μια <b>ταινία</b> τρυπώνει στην εικόνα. Ξεχνάς <b>πού τον είδες</b>.",
          "Το κυνήγι θησαυρού μοιάζει <b>δική\u00a0σου\u00a0ιδέα</b>. Το είχες διαβάσει σε ένα <b>βιβλίο</b>.",
          "Όσο τη θυμάσαι, τόσο <b>λιγότερο αμφιβάλλεις</b>. Όμως δεν γίνεται <b>πιο σωστή</b>.",
          "<b>Η λύση:</b> ό,τι μετράει, <b>γράψ’\u00a0το</b> όσο είναι ακόμα νωπό.",
          "Όταν έχει σημασία, <b>έλεγξε τις σημειώσεις και τις πηγές</b>. Τα βασικά στέκουν."
        ],
        say: [
          "Τα όγδοα γενέθλιά σου. Τούρτα, μπαλόνια, δώρα. Μια ανάμνηση σαν φωτογραφία.",
          "Όποτε τη θυμάσαι, το μυαλό σου την ξαναχτίζει, και η ανάμνηση δυναμώνει και σου έρχεται πιο εύκολα. Έτσι κρατάς ενημερωμένα όσα ξέρεις. Συνήθως, αυτό βοηθάει.",
          "Σε ρωτάνε: είχε πλάκα ο κλόουν; Κλόουν δεν υπήρχε. Την επόμενη φορά όμως που θα θυμηθείς το πάρτι, υπάρχει. Αυτή είναι η επιδεκτικότητα στην υποβολή.",
          "Ένας σκύλος από μια ταινία τρυπώνει στην εικόνα, και ξεχνάς πού τον είδες. Λέγεται σύγχυση πηγής.",
          "Το κυνήγι θησαυρού μοιάζει δική σου ιδέα. Στην πραγματικότητα, το είχες διαβάσει χρόνια πριν σε ένα βιβλίο. Είναι η κρυπτομνησία.",
          "Όσο τη θυμάσαι, τόσο λιγότερο αμφιβάλλεις. Όμως δεν γίνεται πιο σωστή. Είναι μια ψευδής ανάμνηση, και μπορεί να μοιάζει εξίσου ζωντανή με μια αληθινή.",
          "Η λύση: ό,τι μετράει, γράψ’ το λίγο μετά, όσο είναι ακόμα νωπό.",
          "Όταν έχει σημασία, έλεγξε τις σημειώσεις και τις πηγές. Τα βασικά στέκουν, και κάθε προσθήκη γυρίζει πίσω εκεί απ’ όπου ήρθε.",
          "Ξαναγραμμένες μνήμες. Όποτε θυμάσαι κάτι, ξαναχτίζεις την ανάμνηση, γι’ αυτό γράψε ό,τι μετράει όσο είναι ακόμα νωπό."
        ]
      }
    },
    svg(T) {
      const [bx, by] = BK;
      const holes = [];
      for (let x = FM.x + 5; x < FM.x + FM.w - 5; x += 9) holes.push(`<rect class="ho" x="${x}" y="${FM.y + 3.5}" width="4.5" height="3.5" rx="1"/><rect class="ho" x="${x}" y="${FM.y + FM.h - 7}" width="4.5" height="3.5" rx="1"/>`);
      const tags = T.tags.map((t, j) => {
        const w = T.tw[j], x = 200 - w / 2, lg = j < 4 ? T.bias : T.fix;
        return `<g class="fe-pill${j < 4 ? "" : " g"}" data-k="tag${j}"><rect class="bx" x="${x}" y="${TY}" width="${w}" height="${TH}" rx="8"/>
          <rect class="lb" x="${x + 7}" y="${TY - 3}" width="${f1(lg.length * 5.7 + 6)}" height="6"/><text class="lg" x="${x + 10}" y="${TY + 3.4}">${lg}</text>
          <text class="nm" x="200" y="${TY + 18.5}">${t}</text></g>`;
      }).join("");
      const sure = T.sure.map((s, i) => `<text class="fe-lab" x="${MT.x + MT.w / 2}" y="${MT.y + MT.h + 15 + 12 * i}">${s}</text>`).join("");
      const items = T.items.map((s, i) => `<g data-k="w${i + 1}"><text class="it" x="${DY.x + 10}" y="${ROWS[i]}">${s}</text></g>`).join("");
      const ticks = ROWS.map((y, i) => `<path class="fe-tk" data-k="tk${i}" pathLength="1" stroke-dasharray="1 1" d="${tick(DY.x + DY.w - 16, y - 4)}"/>`).join("");
      return `
        <g data-k="book" class="fe-book">
          <path class="pg" d="M${bx} ${by - 11} C${bx - 7} ${by - 15} ${bx - 19} ${by - 16} ${bx - 28} ${by - 13} V${by + 13} C${bx - 19} ${by + 10} ${bx - 7} ${by + 11} ${bx} ${by + 15} Z"/>
          <path class="pg" d="M${bx} ${by - 11} C${bx + 7} ${by - 15} ${bx + 19} ${by - 16} ${bx + 28} ${by - 13} V${by + 13} C${bx + 19} ${by + 10} ${bx + 7} ${by + 11} ${bx} ${by + 15} Z"/>
          <path class="ln" d="M${bx - 22} ${by - 6} H${bx - 6} M${bx - 22} ${by} H${bx - 6} M${bx - 22} ${by + 6} H${bx - 10}"/>
          <path class="mp" d="M${bx + 6} ${by + 7} Q${bx + 11} ${by - 3} ${bx + 15} ${by + 2} T${bx + 21} ${by - 6}"/>
          <path class="x" d="M${bx + 19} ${by - 8} L${bx + 23} ${by - 4} M${bx + 23} ${by - 8} L${bx + 19} ${by - 4}"/>
          <text class="fe-lab" x="${bx}" y="${by + 29}">${T.book}</text></g>
        <path class="fe-link" data-k="link" d="M${bx + 31} ${by} H${f1(ZO[0] + (MP[0] - 19 - ZO[0]) * Z)}"/>
        <g data-k="bub" class="fe-bub"><rect x="${BUB.x}" y="${BUB.y}" width="${BUB.w}" height="${BUB.h}" rx="10"/>
          <path d="M${BUB.x + BUB.w - 1} ${BUB.y + 10} L${BUB.tip[0]} ${BUB.tip[1]} L${BUB.x + BUB.w - 1} ${BUB.y + 22}"/>
          <text x="${BUB.x + BUB.w / 2}" y="${BUB.y + 15}">${T.ask[0]}</text><text x="${BUB.x + BUB.w / 2}" y="${BUB.y + 29}">${T.ask[1]}</text></g>
        <g data-k="film" class="fe-film"><rect class="fr" x="${FM.x}" y="${FM.y}" width="${FM.w}" height="${FM.h}" rx="3"/>${holes.join("")}
          <rect class="win" x="${FM.x + 5}" y="${FM.y + 10}" width="${FM.w - 10}" height="${FM.h - 20}" rx="2"/>
          <g class="fe-ink" transform="translate(${FC[0]} ${FC[1]}) scale(.55)">${DOG}</g>
          <text class="fe-lab" x="${FM.x + FM.w / 2}" y="${FM.y + FM.h + 13}">${T.film}</text></g>
        <g data-k="photo"><g transform="translate(${ZO[0]} ${ZO[1]}) scale(${Z}) translate(${-ZO[0]} ${-ZO[1]})">
          <rect class="fe-frame" x="${PX}" y="${PY}" width="${PW}" height="${PH}" rx="4"/>
          <rect class="fe-img" data-k="img" x="${IX}" y="${IY}" width="${IW}" height="${IH}" rx="1.5"/>
          <g data-k="core" class="fe-ink">
            <path class="w" d="M237 45.5 C234 62 241 76 236 93 M252 40.5 C255 60 243 78 237 93"/>
            <ellipse class="a" cx="237" cy="37" rx="7" ry="8.5"/><ellipse class="a" cx="252" cy="32" rx="7" ry="8.5"/>
          </g>
          ${extra("cl", CLOWN)}
          <g data-k="core2" class="fe-ink">
            <path class="s" d="M180 106 V86 C180 75 189 68 200 68 C211 68 220 75 220 86 V106"/>
            <path class="a" d="M193 46.5 L200 30.5 L207 46.5 Z"/><circle class="f" cx="200" cy="29" r="2.3"/>
            <circle class="s" cx="200" cy="54" r="9"/><circle class="d" cx="197" cy="52.5" r="1.1"/><circle class="d" cx="203" cy="52.5" r="1.1"/>
            <path class="n" d="M196.5 57 Q200 60 203.5 57"/>
            <path class="n" d="M138 106 H262 M172 106 V137 M228 106 V137"/>
            <path class="n" d="M193 85 V92 M200 85 V92 M207 85 V92"/>
            <path class="f" d="M193 77 Q196 81 193 83.5 Q190 81 193 77 Z M200 77 Q203 81 200 83.5 Q197 81 200 77 Z M207 77 Q210 81 207 83.5 Q204 81 207 77 Z"/>
            <rect class="s" x="184" y="92" width="32" height="14" rx="2"/><path class="q" d="M184 96.5 q4 4 8 0 q4 4 8 0 q4 4 8 0 q4 4 8 0"/>
            <rect class="s" x="226" y="93" width="18" height="13" rx="1.5"/><path class="q" d="M235 93 V106 M226 99 H244 M235 93 q-5 -6 -7 -1 q3 2 7 1 q5 -6 7 -1 q-3 2 -7 1"/>
          </g>
          ${extra("dg", DOG, 0, `<g class="fe-tag" data-k="dtag"><path d="M15.5 -6 H21"/>
            <rect x="21" y="-12.5" width="${f1(T.tagFilm.length * 5.4 + 12)}" height="13" rx="3"/>
            <text x="${f1(27 + T.tagFilm.length * 2.7)}" y="-3">${T.tagFilm}</text></g>`)}
          ${extra("mp", MAP, -5)}
          <g class="fe-bulb" data-k="bulb" transform="translate(184 34) scale(.72)">
            <path class="gs" d="M-4 6 C-4 2.5 -8 0.5 -8 -5 A8 8 0 1 1 8 -5 C8 0.5 4 2.5 4 6 Z"/>
            <path class="ln" d="M-2.2 1.5 L0 -3 L2.2 1.5 M-3.6 9.5 H3.6 M-2.4 12.8 H2.4 M0 -17 V-20.5 M-10 -12 L-12.5 -14.5 M10 -12 L12.5 -14.5"/></g>
          <text class="fe-ttl" data-k="ttl" x="200" y="${PY + PH - 17}">${T.title}</text>
          <rect class="fe-ok" data-k="ok" x="${PX}" y="${PY}" width="${PW}" height="${PH}" rx="4"/>
        </g></g>
        <g data-k="rc">
          <text class="fe-lab" x="${MT.x + MT.w / 2}" y="24">${T.recalls}</text>
          <path class="fe-rc" data-k="spin" d="${turn(7)}"/>
          <text class="fe-num" data-k="cnt" x="${MT.x + 5}" y="51">0</text>
          <rect class="fe-bar" x="${MT.x}" y="${MT.y}" width="${MT.w}" height="${MT.h}" rx="${MT.w / 2}"/>
          <rect class="fe-fill" data-k="fill" x="${MT.x + 2}" width="${MT.w - 4}" rx="${MT.w / 2 - 2}"/>
          ${sure}
        </g>
        <g data-k="dy" class="fe-dy">
          <rect class="pg" x="${DY.x}" y="${DY.y}" width="${DY.w}" height="${DY.h}" rx="5"/>
          ${[0, 1, 2, 3, 4, 5].map(i => `<circle class="ring" cx="${DY.x + 14 + i * 14}" cy="${DY.y}" r="2.8"/>`).join("")}
          <g data-k="w0"><text class="h" x="${DY.x + 10}" y="${DY.y + 20}">${T.date}</text><text class="ti" x="${DY.x + 10}" y="${DY.y + 40}">${T.party}</text>
            <line class="rule" x1="${DY.x + 10}" x2="${DY.x + DY.w - 10}" y1="${DY.y + 48}" y2="${DY.y + 48}"/></g>
          ${items}${ticks}
        </g>
        ${tags}`;
    },
    S0: { photo: 0, dev: 0, lift: 0, flick: 0, rc: 0, cnt: 0, spin: 0, sure: 0,
      bub: 0, film: 0, book: 0, link: 0,
      cf: 0, cg: 0, cs: 0, df: 0, dg: 0, ds: 0, dtag: 0, drop: 0, mf: 1, mg: 0, ms: 0, bulb: 0,
      tg0: 0, tg1: 0, tg2: 0, tg3: 0, tg4: 0, tg5: 0, dy: 0, write: 0, ticks: 0, ok: 0 },
    render(S, k) {
      const op = (key, v) => { k(key).style.opacity = +cl(v).toFixed(3); };
      const tr = (key, s) => k(key).setAttribute("transform", s);
      // the photo: slides in, develops; a recall lifts it and fades it back towards blank
      const dev = cl(S.dev) * (1 - .5 * Math.pow(Math.sin(Math.PI * S.flick), 2));   // many quick recalls
      const s = 1 + .035 * S.lift;
      tr("photo", `translate(0 ${f1(10 * (1 - S.photo) - 3 * S.lift)}) translate(${PC[0]} ${PC[1]}) scale(${s.toFixed(4)}) translate(${-PC[0]} ${-PC[1]})`);
      op("photo", S.photo * 1.4);
      k("img").style.fillOpacity = (.07 + .25 * (1 - dev)).toFixed(3);
      op("core", dev); op("core2", dev);
      // the extras: a dashed ghost while they come from outside, ink once they're part of the memory
      const place = (key, a, b, s0, f, g, sv) => {
        const e = io(cl(f));
        tr(key, `translate(${f1(lerp(a[0], b[0], e))} ${f1(lerp(a[1], b[1], e))}) scale(${lerp(s0, 1, e).toFixed(3)})`);
        op(key + "g", g); op(key + "s", sv * dev);
      };
      place("cl", CL0, CL, CS0, S.cf, S.cg, S.cs);
      place("dg", DG0, DG, DS0, S.df, S.dg, S.ds);
      place("mp", MP0, MP, MS0, S.mf, S.mg, S.ms);
      tr("dtag", `translate(0 ${f1(7 * S.drop)})`); op("dtag", S.dtag * (1 - S.drop));
      op("bulb", S.bulb);
      // where they came from
      op("bub", S.bub); op("film", S.film); op("book", S.book); op("link", S.link);
      // the recall counter and the "how sure" meter
      op("rc", S.rc);
      k("cnt").textContent = Math.round(S.cnt);
      tr("spin", `translate(${MT.x - 7} 44) rotate(${f1(S.spin * 360)})`);
      const h = Math.max(0, (MT.h - 4) * cl(S.sure)), fl = k("fill");
      fl.setAttribute("y", f1(MT.y + MT.h - 2 - h)); fl.setAttribute("height", f1(h));
      fl.setAttribute("rx", f1(Math.min(MT.w / 2 - 2, h / 2)));
      // the names
      for (let j = 0; j < 6; j++) { const v = S["tg" + j]; op("tag" + j, v * 1.4); tr("tag" + j, `translate(0 ${f1(6 * (1 - cl(v)))})`); }
      // the diary, written that day, and the check against it
      op("dy", S.dy); tr("dy", `translate(${f1(10 * (1 - cl(S.dy)))} 0)`);
      for (let i = 0; i < 4; i++) { const w = cl(S.write - i); op("w" + i, w); tr("w" + i, `translate(${f1(-4 * (1 - w))} 0)`); }
      for (let i = 0; i < 3; i++) { const t = cl(S.ticks - i); k("tk" + i).style.strokeDashoffset = f1(1 - t); op("tk" + i, t > 0 ? 1 : 0); }
      op("ok", S.ok);
    },
    beats: [
      { steps: [{ to: { photo: 1 }, ms: 550, ease: "back", sfx: "pluck" }, { to: { dev: 1 }, ms: 1300, ease: "inOut" }], hold: 2400 },
      { steps: [{ to: { rc: 1, sure: .16 }, ms: 450 }, { wait: 250 }, ...recall(1, {}, { sure: .34 }, "whoosh")], hold: 2600 },
      { steps: [{ to: { bub: 1 }, ms: 420, ease: "back", sfx: "pop" }, { wait: 250 }, { to: { cg: 1 }, ms: 200 }, { to: { cf: 1 }, ms: 800, ease: "lin" },
        { wait: 200 }, ...recall(2, { cg: 0, cs: 1 }, { bub: .4, sure: .5 }), { to: { tg0: 1 }, ms: 450 }], hold: 2600 },
      { steps: [{ to: { tg0: 0 }, ms: 300 }, { to: { film: 1 }, ms: 420, ease: "back" }, { wait: 200 }, { to: { dg: 1, dtag: 1 }, ms: 200 },
        { to: { df: 1 }, ms: 800, ease: "lin" }, { wait: 300 }, { to: { drop: 1 }, ms: 450, sfx: "tick" },
        ...recall(3, { dg: 0, ds: 1 }, { film: .4, sure: .64 }), { to: { tg1: 1 }, ms: 450 }], hold: 2600 },
      { steps: [{ to: { tg1: 0 }, ms: 300 }, { to: { mg: 1 }, ms: 400 }, { to: { bulb: 1 }, ms: 450, ease: "back", sfx: "pop" }, { wait: 200 },
        ...recall(4, { mg: 0, ms: 1 }, { sure: .76 }), { wait: 150 }, { to: { book: 1, link: 1 }, ms: 500 }, { to: { tg2: 1 }, ms: 450 }], hold: 2800 },
      { steps: [{ to: { tg2: 0, link: 0, book: .4 }, ms: 400 }, { to: { flick: 4, cnt: 12, spin: 12, sure: .97 }, ms: 1600, ease: "inOut", sfx: "spring" },
        { wait: 200 }, { to: { tg3: 1 }, ms: 450 }], hold: 2600 },
      { steps: [{ to: { tg3: 0, rc: 0 }, ms: 450 }, { to: { dy: 1 }, ms: 500, ease: "back" }, { to: { write: 4 }, ms: 1300, ease: "lin", sfx: "scribble" }, { to: { tg4: 1 }, ms: 450 }], hold: 2600 },
      { steps: [{ to: { tg4: 0 }, ms: 300 }, { to: { ticks: 3 }, ms: 800, ease: "lin" }, { wait: 150 },
        { to: { cg: 1, dg: 1, mg: 1, cs: 0, ds: 0, ms: 0, bub: 1, film: 1, book: 1 }, ms: 450 },
        { to: { cf: 0, df: 0, mf: 0, bulb: 0 }, ms: 900, ease: "lin", sfx: "whoosh" }, { to: { cg: 0, dg: 0, mg: 0 }, ms: 350 },
        { to: { ok: 1 }, ms: 500, sfx: "chime" }, { to: { tg5: 1 }, ms: 450 }], hold: 4200 }
    ]
  };
})();
