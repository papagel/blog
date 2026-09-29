/* Family, primed & repeated: a phone feed scrolls past far more than you can check, so the brain lets
   through what it has seen before. The same claim ("Bats are blind") comes back again and again and a
   "feels true" meter climbs with each repeat, though nothing new was learned; a song heard more is liked
   more; a new word lights up in posts that were there all along. Voices you don't usually hear bring a
   new fact, and a note of what you checked beats the echo. Scene for anim.js. */
(function () {
  const KEY = "family-primed", P = `.bp[data-scene="${KEY}"]`;
  const SX = 24, SY = 26, SW = 120, SH = 220;                      // phone screen
  const PX = 28, PW = 112, PH = 38, PITCH = 44, TOP0 = 30;         // feed posts
  const SC = n => n * PITCH;                                       // scroll that puts post n in the top slot
  // the feed, top to bottom: p plain, w plain with the new word, f familiar, m the claim, s the song,
  // n a voice you don't usually hear, x that voice with a fact
  const FEED = "ppwppwpppwpppp" + "pfwfp" + "ppmpwmpmpm" + "pswswsww" + "npxnn";
  const FAM = [15, 17];                                            // seen before (step 2)
  const LIT = { 31: "w0", 33: "w1", 35: "w2", 36: "w3" };          // the new word, noticed
  const RX = 172, RW = 214, BW = 188, RY = [34, 110, 186];         // right panel: meter rows
  const cl = v => Math.max(0, Math.min(1, v));
  const f1 = n => +n.toFixed(1);
  // one more repeat scrolls in: count it, and its meter jumps
  const rep = (n, r, c, v, sfx) => [{ to: { sc: SC(n) }, ms: 450, ease: "inOut" }, { to: { ["c" + r]: c } },
    { to: { ["v" + r]: v }, ms: 350, ease: "back", ...(sfx ? { sfx } : {}) }, { wait: 150 }];
  // the new word lights up in one more post
  const lit = (w, c, v, sfx) => [{ to: { c2: c } }, { to: { [w]: 1, v2: v }, ms: 350, ease: "back", ...(sfx ? { sfx } : {}) }, { wait: 120 }];

  const LN = [[92, 64], [84, 50], [96, 72], [78, 58], [90, 44], [88, 68]];
  const post = (t, i, T) => {
    const [a, b] = LN[i % LN.length], nm = 44 + (i % 3) * 7;
    let av = `<circle class="fp-av" cx="11" cy="11" r="5"/>`, body;
    if (t === "m") av = `<circle class="fp-avm" cx="11" cy="11" r="5"/>`;
    if (t === "n" || t === "x") {
      const sh = [`<rect x="6" y="6" width="10" height="10" rx="2.5"/>`, `<path d="M11 5.5 L16.5 15.5 H5.5 Z"/>`, `<path d="M11 5 L17 11 L11 17 L5 11 Z"/>`];
      av = `<g class="fp-avn">${sh[t === "x" ? 2 : i % 2]}</g>`;
    }
    if (t === "m" || t === "x") {
      const L = t === "m" ? T.myth : T.fact, c = t === "x" ? " g" : "";
      body = `<text class="fp-say${c}" x="22" y="15.5">${L[0]}</text><text class="fp-say${c}" x="22" y="29.5">${L[1]}</text>`;
    } else if (t === "s") {
      let wave = "";
      const H = [3, 5, 7, 4, 6, 8, 5, 3, 6, 7, 4, 5, 3];
      H.forEach((h, j) => { wave += `M${30 + j * 5.4} ${27 - h / 2} V${27 + h / 2} `; });
      body = `<path class="fp-nm" d="M21 11 H${nm}"/><ellipse class="fp-nh" cx="11" cy="31" rx="3.4" ry="2.6"/>
        <path class="fp-ns" d="M14.2 30.6 V20.5 Q19 21.5 19.5 25.5"/><path class="fp-wv" d="${wave}"/>`;
    } else if (t === "w") {
      const W = T.wordW, x0 = 26;
      body = `<path class="fp-nm" d="M21 11 H${nm}"/><path class="fp-tx" d="M8 21 H${8 + a} M8 30 H${x0 - 6} M${x0 + W + 7} 30 H${Math.max(x0 + W + 14, 8 + b + 20)}"/>
        <text class="fp-wd" x="${x0 + 1}" y="33.2">${T.word}</text>
        ${LIT[i] ? `<g class="fp-wl" data-k="wl${i}"><rect x="${x0 - 2.5}" y="23.5" width="${W + 7}" height="13" rx="3.5"/><text x="${x0 + 1}" y="33.2">${T.word}</text></g>` : ""}`;
    } else {
      body = `<path class="fp-nm" d="M21 11 H${nm}"/><path class="fp-tx" d="M8 21 H${8 + a} M8 30 H${8 + b}"/>`;
    }
    const hl = t === "f" ? `<g class="fp-hl" data-k="hl${i}"><rect x="-1" y="-1" width="${PW + 2}" height="${PH + 2}" rx="8"/>
        <path d="M91 11 Q98 4.5 105 11 Q98 17.5 91 11 Z"/><circle cx="98" cy="11" r="1.8"/></g>` : "";
    const ring = t === "x" ? `<rect class="fp-xr" data-k="xr" x="-1" y="-1" width="${PW + 2}" height="${PH + 2}" rx="8"/>` : "";
    return `<g data-k="p${i}"><rect class="fp-card" width="${PW}" height="${PH}" rx="7"/>${av}${body}${hl}${ring}</g>`;
  };

  window.BiasAnim.SCENES[KEY] = {
    q: "tmi", viewBox: "0 0 400 272",
    css: `
      ${P} .fp-body{fill:var(--surface);stroke:var(--ink);stroke-width:2.2}
      ${P} .fp-scr{fill:var(--ground);stroke:var(--rule);stroke-width:1.2}
      ${P} .fp-hw{stroke:var(--muted);stroke-width:2.2;stroke-linecap:round}
      ${P} .fp-card{fill:var(--surface);stroke:var(--rule);stroke-width:1.4}
      ${P} .fp-av{fill:none;stroke:var(--muted);stroke-width:1.6}
      ${P} .fp-avm{fill:var(--muted);stroke:var(--muted);stroke-width:1.6}
      ${P} .fp-avn *{fill:none;stroke:var(--good);stroke-width:1.8;stroke-linejoin:round}
      ${P} .fp-nm{fill:none;stroke:var(--muted);stroke-width:2.4;stroke-linecap:round}
      ${P} .fp-tx{fill:none;stroke:var(--faint);stroke-width:2.4;stroke-linecap:round}
      ${P} .fp-say{font:600 10.5px var(--display);fill:var(--ink)}
      ${P} .fp-say.g{fill:var(--good)}
      ${P} .fp-nh{fill:var(--ink)}
      ${P} .fp-ns{fill:none;stroke:var(--ink);stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
      ${P} .fp-wv{fill:none;stroke:var(--muted);stroke-width:2;stroke-linecap:round}
      ${P} .fp-wd{font:500 9px var(--mono);fill:var(--faint)}
      ${P} .fp-wl rect{fill:var(--q);fill-opacity:.2;stroke:var(--q);stroke-width:1.3}
      ${P} .fp-wl text{font:500 9px var(--mono);fill:var(--q)}
      ${P} .fp-hl rect{fill:none;stroke:var(--q);stroke-width:2}
      ${P} .fp-hl path{fill:none;stroke:var(--q);stroke-width:1.5;stroke-linejoin:round}
      ${P} .fp-hl circle{fill:var(--q)}
      ${P} .fp-xr{fill:none;stroke:var(--good);stroke-width:2}
      ${P} .fp-big{font:700 34px var(--display);fill:var(--ink);text-anchor:middle}
      ${P} .fp-lab{font:500 10px var(--mono);fill:var(--muted)}
      ${P} .fp-lab.c{text-anchor:middle}
      ${P} .fp-ask{font:600 13px var(--display);fill:var(--ink)}
      ${P} .fp-yes{font:500 10px var(--mono);fill:var(--q)}
      ${P} .fp-no{font:500 10px var(--mono);fill:var(--muted)}
      ${P} .fp-arr{fill:none;stroke:var(--q);stroke-width:1.6;stroke-dasharray:2 4;stroke-linecap:round}
      ${P} .fp-hd{font:600 12px var(--display);fill:var(--ink)}
      ${P} .fp-nf{font:500 9.5px var(--mono);text-anchor:end}
      ${P} .fp-nf.b{fill:var(--bad)} ${P} .fp-nf.g{fill:var(--good)}
      ${P} .fp-trk{fill:none;stroke:var(--rule);stroke-width:1.4}
      ${P} .fp-bar{fill:var(--q)}
      ${P} .fp-cn{font:500 11px var(--mono);fill:var(--q);text-anchor:end}
      ${P} .fp-pill rect{fill:none;stroke:var(--q);stroke-width:1.4}
      ${P} .fp-pill text{font:600 10px var(--display);fill:var(--q);text-anchor:middle}
      ${P} .fp-note .pa{fill:var(--surface);stroke:var(--ink);stroke-width:1.8;stroke-linejoin:round}
      ${P} .fp-note .fo{fill:none;stroke:var(--ink);stroke-width:1.8;stroke-linejoin:round}
      ${P} .fp-note .h{font:500 9.5px var(--mono);fill:var(--muted)}
      ${P} .fp-note .c{font:600 11px var(--display);fill:var(--muted)}
      ${P} .fp-note .st{fill:none;stroke:var(--bad);stroke-width:1.8;stroke-linecap:round}
      ${P} .fp-note .ok{font:600 12px var(--display);fill:var(--good)}
      ${P} .fp-chk circle{fill:var(--surface);stroke:var(--good);stroke-width:2}
      ${P} .fp-chk path{fill:none;stroke:var(--good);stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round}
    `,
    text: {
      en: {
        name: "Primed & repeated", shareTitle: "Why repeated things feel true, in 30 seconds",
        ecline: "Familiar isn't the same as true: trust what you've checked, not the echo.",
        today: "posts today", ask: "Seen it before?", yes: "yes → notice it", no: "no → scroll past",
        myth: ["Bats are", "blind."], fact: ["Bats can", "see!"], word: "umami", wordW: 27,
        feel: ["feels true", "you like it", "feels common"],
        names: ["Illusory truth effect", "Mere exposure effect", "Frequency illusion"], pw: [128, 124, 112],
        nf0: "new facts: 0", nf1: "new facts: 1",
        notes: "My notes", claim: "Bats are blind?", claimW: 84, ok: "No, they can see.",
        caps: [
          "Every day, <b>hundreds of posts</b> fly past. You can't check them all.",
          "So your brain favors <b>what it's seen before</b>. Usually, that saves time.",
          "A claim scrolls past: <b>“Bats are blind.”</b> You're not sure.",
          "Each repeat makes it <b>feel truer</b>, yet you learned nothing new.",
          "A song works the same way: <b>hear it more, like it more</b>.",
          "Learn a new word, and suddenly it's <b>everywhere</b>. It always was.",
          "<b>The fix:</b> seek out voices you <b>don't usually hear</b>.",
          "Write down what you've checked. <b>Trust that, not the echo.</b>"
        ],
        say: [
          "Every day, hundreds of posts fly past. You can't check them all.",
          "So your brain favors what it has seen before. Usually, that saves time.",
          "A claim scrolls past. Bats are blind. You're not sure.",
          "It comes back, again and again, and each time it feels a little truer. Yet you learned nothing new. That's the illusory truth effect.",
          "A song works the same way. Hear it more, like it more. The mere exposure effect.",
          "Learn a new word, and suddenly it's everywhere. It always was. That's the frequency illusion.",
          "The fix: seek out voices you don't usually hear.",
          "Write down what you've checked. Trust that, not the echo.",
          "Primed and repeated. Familiar isn't the same as true: trust what you've checked, not the echo."
        ]
      },
      el: {
        name: "Ό,τι έχουμε ξαναδεί", shareTitle: "Γιατί ό,τι επαναλαμβάνεται μοιάζει αληθινό, σε 30 δευτερόλεπτα",
        ecline: "Οικείο δεν σημαίνει αληθινό: εμπιστέψου ό,τι έχεις ελέγξει, όχι την ηχώ.",
        today: "αναρτήσεις σήμερα", ask: "Το έχω ξαναδεί;", yes: "ναι → το προσέχω", no: "όχι → το προσπερνάω",
        myth: ["Οι νυχτερίδες", "είναι τυφλές."], fact: ["Οι νυχτερίδες", "βλέπουν!"], word: "ουμάμι", wordW: 32,
        feel: ["μοιάζει αληθινό", "σου αρέσει", "μοιάζει συχνή"],
        names: ["Φαινόμενο ψευδαίσθησης αλήθειας", "Φαινόμενο απλής έκθεσης", "Ψευδαίσθηση συχνότητας"], pw: [196, 156, 144],
        nf0: "νέα στοιχεία: 0", nf1: "νέα στοιχεία: 1",
        notes: "Οι σημειώσεις μου", claim: "Οι νυχτερίδες είναι τυφλές;", claimW: 166, ok: "Όχι, βλέπουν κανονικά.",
        caps: [
          "Κάθε μέρα βλέπεις <b>εκατοντάδες αναρτήσεις</b>. Δεν μπορείς να τις ελέγξεις όλες.",
          "Γι’ αυτό το μυαλό σου προτιμά <b>ό,τι έχει ξαναδεί</b>. Συνήθως, έτσι κερδίζει χρόνο.",
          "Στη ροή σου περνάει κάτι: <b>«Οι νυχτερίδες είναι τυφλές»</b>. Δεν ξέρεις αν ισχύει.",
          "Με κάθε επανάληψη <b>μοιάζει πιο αληθινό</b>, κι ας μην έμαθες τίποτα καινούργιο.",
          "Το ίδιο και με ένα τραγούδι: <b>όσο πιο πολύ το ακούς, τόσο πιο πολύ σου αρέσει</b>.",
          "Μαθαίνεις μια καινούργια λέξη και ξαφνικά τη βλέπεις <b>παντού</b>. Πάντα εκεί ήταν.",
          "<b>Η λύση:</b> ψάξε φωνές που <b>δεν ακούς συνήθως</b>.",
          "Σημείωνε ό,τι έχεις ελέγξει. <b>Εμπιστέψου αυτό, όχι την ηχώ.</b>"
        ],
        say: [
          "Κάθε μέρα βλέπεις εκατοντάδες αναρτήσεις. Δεν μπορείς να τις ελέγξεις όλες.",
          "Γι’ αυτό το μυαλό σου προτιμά ό,τι έχει ξαναδεί. Συνήθως, έτσι κερδίζει χρόνο.",
          "Στη ροή σου περνάει κάτι: οι νυχτερίδες είναι τυφλές. Δεν ξέρεις αν ισχύει.",
          "Εμφανίζεται ξανά και ξανά, και κάθε φορά μοιάζει λίγο πιο αληθινό. Κι όμως, δεν έμαθες τίποτα καινούργιο. Αυτό είναι το φαινόμενο ψευδαίσθησης αλήθειας.",
          "Το ίδιο και με ένα τραγούδι: όσο πιο πολύ το ακούς, τόσο πιο πολύ σου αρέσει. Το φαινόμενο απλής έκθεσης.",
          "Μαθαίνεις μια καινούργια λέξη και ξαφνικά τη βλέπεις παντού. Πάντα εκεί ήταν. Αυτή είναι η ψευδαίσθηση συχνότητας.",
          "Η λύση: ψάξε φωνές που δεν ακούς συνήθως.",
          "Σημείωνε ό,τι έχεις ελέγξει. Εμπιστέψου αυτό, όχι την ηχώ.",
          "Ό,τι έχουμε ξαναδεί. Οικείο δεν σημαίνει αληθινό: εμπιστέψου ό,τι έχεις ελέγξει, όχι την ηχώ."
        ]
      }
    },
    svg(T) {
      const posts = [...FEED].map((t, i) => post(t, i, T)).join("");
      const row = r => {
        const y = RY[r], pw = T.pw[r];
        return `<g data-k="row${r}">
          <text class="fp-hd" x="${RX}" y="${y + 10}">${T.feel[r]}</text>
          ${r === 0 ? `<text class="fp-nf b" data-k="nf0" x="${RX + RW}" y="${y + 10}">${T.nf0}</text><text class="fp-nf g" data-k="nf1" x="${RX + RW}" y="${y + 10}">${T.nf1}</text>` : ""}
          <rect class="fp-trk" x="${RX}" y="${y + 18}" width="${BW}" height="14" rx="7"/>
          <rect class="fp-bar" data-k="bar${r}" x="${RX}" y="${y + 18}" width="0" height="14" rx="7"/>
          <text class="fp-cn" data-k="cn${r}" x="${RX + RW}" y="${y + 29}"></text>
          <g class="fp-pill" data-k="pl${r}"><rect x="${RX}" y="${y + 40}" width="${pw}" height="17" rx="8.5"/><text x="${RX + pw / 2}" y="${y + 52}">${T.names[r]}</text></g>
        </g>`;
      };
      const NY = 118, NB = 214;                                   // the note, top and bottom
      return `
        <defs><clipPath id="primed-feed-clip"><rect x="${SX}" y="${SY}" width="${SW}" height="${SH}" rx="6"/></clipPath></defs>
        <g data-k="phone">
          <rect class="fp-body" x="16" y="12" width="136" height="248" rx="18"/>
          <rect class="fp-scr" x="${SX}" y="${SY}" width="${SW}" height="${SH}" rx="6"/>
          <path class="fp-hw" d="M72 19 H96 M70 253 H98"/>
          <g clip-path="url(#primed-feed-clip)">${posts}</g>
        </g>
        <g data-k="cnt"><text class="fp-big" data-k="cntN" x="279" y="128"></text><text class="fp-lab c" x="279" y="148">${T.today}</text></g>
        <g data-k="flt">
          <path class="fp-arr" d="M146 ${TOP0 + PITCH + PH / 2} C160 ${TOP0 + PITCH + PH / 2} 158 124 168 128 M146 ${TOP0 + 3 * PITCH + PH / 2} C160 ${TOP0 + 3 * PITCH + PH / 2} 158 132 168 128"/>
          <text class="fp-ask" x="${RX + 2}" y="112">${T.ask}</text>
          <text class="fp-yes" x="${RX + 2}" y="132">${T.yes}</text>
          <text class="fp-no" x="${RX + 2}" y="150">${T.no}</text>
        </g>
        ${row(0)}${row(1)}${row(2)}
        <g class="fp-note" data-k="note">
          <path class="pa" d="M${RX} ${NY} H${RX + RW - 16} L${RX + RW} ${NY + 16} V${NB} H${RX} Z"/><path class="fo" d="M${RX + RW - 16} ${NY} V${NY + 16} H${RX + RW}"/>
          <text class="h" x="${RX + 12}" y="${NY + 20}">${T.notes}</text>
          <text class="c" x="${RX + 12}" y="${NY + 45}">${T.claim}</text>
          <path class="st" data-k="st" pathLength="1" stroke-dasharray="1 1" d="M${RX + 9} ${NY + 41} H${RX + 15 + T.claimW}"/>
          <g data-k="okl"><g class="fp-chk" transform="translate(${RX + 21} ${NY + 71})"><circle r="8"/><path d="M-3.8 0.4 L-1 3.2 L4.2 -2.8"/></g>
            <text class="ok" x="${RX + 36}" y="${NY + 75.5}">${T.ok}</text></g>
        </g>`;
    },
    S0: { phone: 0, sc: 0, cn: 0, cnt: 0, filt: 0, flt: 0,
      r0: 0, r1: 0, r2: 0, v0: 0, v1: 0, v2: 0, c0: 0, c1: 0, c2: 0, l0: 0, l1: 0, l2: 0, nf0: 0, nf: 0,
      w0: 0, w1: 0, w2: 0, w3: 0, xr: 0, note: 0, st: 0, ok: 0 },
    render(S, k, T) {
      const op = (key, v) => { k(key).style.opacity = cl(v); };
      const tr = (key, x, y) => k(key).setAttribute("transform", `translate(${f1(x)} ${f1(y)})`);
      op("phone", S.phone);
      tr("phone", 0, 8 * (1 - S.phone));
      // the feed: only posts near the screen are drawn
      for (let i = 0; i < FEED.length; i++) {
        const top = TOP0 + i * PITCH - S.sc, g = k("p" + i);
        if (top < SY - PH - 4 || top > SY + SH + 4) { g.style.display = "none"; continue; }
        g.style.display = "";
        g.setAttribute("transform", `translate(${PX} ${f1(top)})`);
        const fam = FAM.includes(i);
        g.style.opacity = fam ? 1 : 1 - .62 * cl(S.filt);
        if (fam) op("hl" + i, S.filt);
        if (LIT[i]) op("wl" + i, S[LIT[i]]);
      }
      op("xr", S.xr);
      // how much comes in, and the shortcut
      k("cntN").textContent = Math.round(S.cnt);
      op("cnt", S.cn);
      op("flt", S.flt);
      // the meters
      for (let r = 0; r < 3; r++) {
        const a = S["r" + r];
        op("row" + r, a); tr("row" + r, 0, 6 * (1 - cl(a)));
        k("bar" + r).setAttribute("width", f1(BW * cl(S["v" + r])));
        const c = Math.round(S["c" + r]);
        k("cn" + r).textContent = c ? "×" + c : "";
        const l = S["l" + r];
        op("pl" + r, l * 2); tr("pl" + r, -8 * (1 - cl(l)), 0);
      }
      op("nf0", S.nf0 * (1 - S.nf)); op("nf1", S.nf);
      // the note
      op("note", S.note); tr("note", 0, 8 * (1 - cl(S.note)));
      k("st").style.strokeDashoffset = (1 - S.st).toFixed(3); op("st", S.st > 0 ? 1 : 0);
      op("okl", S.ok);
    },
    beats: [
      { steps: [{ to: { phone: 1 }, ms: 500 }, { to: { cn: 1 }, ms: 300 },
        { to: { sc: SC(14), cnt: 312 }, ms: 2400, ease: "inOut", sfx: "whoosh" }], hold: 2200 },
      { steps: [{ to: { cn: 0 }, ms: 350 }, { to: { filt: 1 }, ms: 600, sfx: "tick" }, { to: { flt: 1 }, ms: 500 }], hold: 2800 },
      { steps: [{ to: { flt: 0, filt: 0 }, ms: 400 }, { to: { sc: SC(19) }, ms: 1000, ease: "inOut" }, { wait: 150 },
        { to: { r0: 1 }, ms: 350 }, { to: { c0: 1 } }, { to: { v0: .25 }, ms: 450, ease: "back", sfx: "pop" }] },
      { steps: [...rep(20, 0, 2, .45, "tick"), ...rep(22, 0, 3, .66), ...rep(24, 0, 4, .88),
        { to: { nf0: 1 }, ms: 350 }, { wait: 200 }, { to: { l0: 1 }, ms: 400, ease: "back" }], hold: 2400 },
      { steps: [{ to: { r1: 1 }, ms: 350 }, ...rep(26, 1, 1, .3, "pluck"), ...rep(28, 1, 2, .55), ...rep(30, 1, 3, .8),
        { to: { l1: 1 }, ms: 400, ease: "back" }], hold: 2400 },
      { steps: [{ to: { r2: 1 }, ms: 350 }, { wait: 250 }, ...lit("w0", 1, .25, "tick"), ...lit("w1", 2, .45),
        { to: { sc: SC(32) }, ms: 550, ease: "inOut" }, ...lit("w2", 3, .65), ...lit("w3", 4, .84),
        { wait: 150 }, { to: { l2: 1 }, ms: 400, ease: "back" }], hold: 2400 },
      { steps: [{ to: { sc: SC(37) }, ms: 1200, ease: "inOut", sfx: "whoosh" }, { wait: 250 },
        { to: { xr: 1 }, ms: 350 }, { to: { nf: 1 }, ms: 350 }, { to: { v0: .5 }, ms: 700, ease: "inOut" }], hold: 2600 },
      { steps: [{ to: { r1: 0, r2: 0 }, ms: 400 }, { to: { note: 1 }, ms: 450, ease: "back" },
        { to: { st: 1 }, ms: 450, sfx: "scribble" }, { to: { ok: 1 }, ms: 400 }, { to: { v0: .1 }, ms: 800, ease: "inOut", sfx: "chime" }], hold: 4200 }
    ]
  };
})();
