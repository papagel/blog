/* Family: the here & now. You hold a lens close: whatever is near and concrete looks huge, whatever is far or
   abstract shrinks to a dot. A treat now against savings next year, one named child against thousands, the new
   model against the phone that works. Widening the view brings the far side up to real size, and the choice
   gets fair. Scene for anim.js. */
(function () {
  const KEY = "family-immediate", P = `.bp[data-scene="${KEY}"]`;
  const LX = 150, LY = 136, LR = 62, ZOOM = 2;         // the lens: centre, radius; how much it magnifies
  const NX = 150, FX = 330, ROW = [84, 136, 188];      // the near and far columns, and the three rows at the end
  const REAL = [1.2, 1.3, 1];                          // real size of the far things: savings, thousands, the old phone
  const WIDE = [112, 56, 256, 160, 16];                // the lens opened wide: x, y, width, height, corner
  const TAG_X = 240, TAG_Y = 16, TAG_H = 28;           // bias name tags
  const FOOT = 218;                                    // labels under the near and far columns
  const cl = v => Math.max(0, Math.min(1, v));
  const f1 = n => +n.toFixed(1);
  const f3 = n => +n.toFixed(3);
  const lerp = (a, b, t) => a + (b - a) * t;
  const star = (x, y, r) => `M${x} ${y - r} Q${x} ${y} ${x + r} ${y} Q${x} ${y} ${x} ${y + r} Q${x} ${y} ${x - r} ${y} Q${x} ${y} ${x} ${y - r} Z`;

  // the things, drawn round (0, 0) and about 34 px across at real size
  const PHONE = `<rect class="ih-fl" x="-9" y="-16" width="18" height="32" rx="3.5"/><path class="ih-ln" d="M-2.5 12.5 H2.5"/>`;
  const ICON = {
    gift: `<rect class="ih-fl" x="-13" y="-5" width="26" height="20" rx="2"/><rect class="ih-fl" x="-15" y="-11" width="30" height="7" rx="2"/>
      <path class="ih-acc" d="M0 -11 V15 M0 -11 C-3 -18 -11 -18 -9 -13 C-8 -11 -4 -11 0 -11 C4 -11 8 -11 9 -13 C11 -18 3 -18 0 -11"/>`,
    treat: `<path class="ih-fl" d="M-11 1 L-8 15 H8 L11 1 Z"/><path class="ih-fn" d="M-4 4 L-3 12.5 M4 4 L3 12.5"/>
      <path class="ih-fl" d="M-12 1 C-16 -3 -12 -9 -7 -7 C-6 -12 1 -13 3 -9 C7 -12 13 -8 11 -4 C15 -2 14 2 11 1 Z"/>
      <circle class="ih-dotq" cx="1.5" cy="-13" r="3"/>`,
    savings: `<circle class="ih-coin" cx="1" cy="-12" r="4.5"/>
      <path class="ih-fl" d="M-13 3 C-13 -6 -6 -10 1 -10 C8 -10 13 -6 13 1 C13 7 9 11 4 11 H-5 C-10 11 -13 8 -13 3 Z"/>
      <rect class="ih-fl" x="12" y="-3" width="4.5" height="7" rx="2"/><path class="ih-fl" d="M-7 -8 L-6 -13.5 L-1.5 -9.6"/>
      <path class="ih-ln" d="M-6 11 V15 M5 11 V15 M-13 1 C-16 0 -17 -3 -15 -4 M-2.5 -7.5 H4.5"/><circle class="ih-e" cx="7" cy="-3" r="1.2"/>`,
    child: `<path class="ih-fl" d="M-12 17 V13 C-12 6 -6 2 0 2 C6 2 12 6 12 13 V17"/><circle class="ih-fl" cx="0" cy="-8" r="8"/>
      <path class="ih-ln" d="M-5 -14 Q0 -19 4 -14.5"/><circle class="ih-e" cx="-3" cy="-8.5" r="1.1"/><circle class="ih-e" cx="3" cy="-8.5" r="1.1"/>
      <path class="ih-ln" d="M-2.8 -4.4 Q0 -2.6 2.8 -4.4"/><rect class="ih-name" x="-9" y="6.5" width="18" height="8.5" rx="2"/>`,
    crowd: [-10, -1, 8].map((y, r) => [-12, -6, 0, 6, 12].map(x => {
      const cx = x + (r === 1 ? 3 : 0);
      return cx > 13 ? "" : `<circle class="ih-mb" cx="${cx}" cy="${y}" r="2.2"/><path class="ih-mb" d="M${cx - 3.4} ${y + 6.4} Q${cx} ${y + 2.4} ${cx + 3.4} ${y + 6.4}"/>`;
    }).join("")).join(""),
    fresh: `${PHONE}<rect class="ih-scr" x="-6" y="-12" width="12" height="21" rx="1"/>
      <path class="ih-spk" d="${star(15, -11, 4.5)} ${star(-15, -3, 3.5)} ${star(14, 8, 3)}"/>`,
    old: `${PHONE}<rect class="ih-sco" x="-6" y="-12" width="12" height="21" rx="1"/><path class="ih-chk" d="M-3.6 -1.5 L-1 1.2 L3.8 -3.8"/>`
  };

  window.BiasAnim.SCENES[KEY] = {
    q: "fast", viewBox: "0 0 400 272",
    css: `
      ${P} .ih-it *{vector-effect:non-scaling-stroke}
      ${P} .ih-fl{fill:var(--surface);stroke:var(--ink);stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
      ${P} .ih-ln{fill:none;stroke:var(--ink);stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
      ${P} .ih-fn{fill:none;stroke:var(--faint);stroke-width:1.5;stroke-linecap:round}
      ${P} .ih-acc{fill:none;stroke:var(--q);stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
      ${P} .ih-e{fill:var(--ink)}
      ${P} .ih-dotq{fill:var(--q)}
      ${P} .ih-coin{fill:var(--q);fill-opacity:.25;stroke:var(--q);stroke-width:1.8}
      ${P} .ih-name{fill:var(--q);fill-opacity:.2;stroke:var(--q);stroke-width:1.4}
      ${P} .ih-nt{font:700 6px var(--display);fill:var(--ink);text-anchor:middle}
      ${P} .ih-mb{fill:var(--surface);stroke:var(--muted);stroke-width:1.4;stroke-linecap:round}
      ${P} .ih-scr{fill:var(--q);fill-opacity:.22;stroke:var(--q);stroke-width:1.2}
      ${P} .ih-sco{fill:none;stroke:var(--faint);stroke-width:1.2}
      ${P} .ih-chk{fill:none;stroke:var(--good);stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
      ${P} .ih-spk{fill:var(--q)}
      ${P} .ih-gh *{stroke-dasharray:2.4 2.6}
      ${P} .ih-dot{fill:var(--muted)}
      ${P} .ih-ring{fill:none;stroke:var(--q);stroke-width:2}
      ${P} .ih-ray{stroke:var(--q);stroke-width:1.6;stroke-linecap:round;stroke-dasharray:1.5 5}
      ${P} .ih-you path,${P} .ih-you circle{fill:var(--surface);stroke:var(--ink);stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
      ${P} .ih-you .bd{stroke-linecap:butt}
      ${P} .ih-you .e{fill:var(--ink);stroke:none}
      ${P} .ih-you .m{fill:none}
      ${P} .ih-lens{fill:var(--q);fill-opacity:.07;stroke:var(--q);stroke-width:2.6}
      ${P} .ih-glint{fill:none;stroke:var(--q);stroke-width:2;stroke-linecap:round;opacity:.45}
      ${P} .ih-hd{stroke:var(--ink);stroke-width:7;stroke-linecap:round}
      ${P} .ih-hd2{stroke:var(--surface);stroke-width:3;stroke-linecap:round}
      ${P} .ih-ll{font:500 10px var(--mono);fill:var(--q);text-anchor:middle}
      ${P} .ih-lb{text-anchor:middle}
      ${P} .ih-lb .a{font:600 11.5px var(--display);fill:var(--ink)}
      ${P} .ih-lb .b{font:500 9.5px var(--mono);fill:var(--muted)}
      ${P} .ih-lb .b.q{fill:var(--q)}
      ${P} .ih-real{font:500 9.5px var(--mono);fill:var(--muted);text-anchor:middle}
      ${P} .ih-wl{font:500 10px var(--mono);text-anchor:middle}
      ${P} .ih-tag .bx{fill:var(--surface);stroke:var(--q);stroke-width:1.8}
      ${P} .ih-tag .lb{fill:var(--surface);stroke:none}
      ${P} .ih-tag .lg{font:500 9.5px var(--mono);fill:var(--q)}
      ${P} .ih-tag .nm{font:600 12.5px var(--display);fill:var(--ink);text-anchor:middle}
      ${P} .ih-row text{font:500 9.5px var(--mono);fill:var(--good);text-anchor:middle;paint-order:stroke;stroke:var(--ground);stroke-width:12px;stroke-linejoin:round}
      ${P} .ih-row line{stroke:var(--good);stroke-width:1.4;stroke-linecap:round;stroke-dasharray:1.5 3.5}
    `,
    text: {
      en: {
        name: "The here & now", shareTitle: "Why what's right in front of us wins, in 30 seconds",
        ecline: "What's near looks bigger than it is, so picture the far side up close before you choose.",
        lens: "here & now", wide: "the whole picture", kid: "Alex", bias: "bias", real: ["real size"],
        tags: ["Hyperbolic discounting", "Identifiable victim effect", "Appeal to novelty"], tw: [176, 200, 142],
        labs: [
          [["right here"], ["far off"]],
          [["a treat", "now"], ["savings", "next year"]],
          [["one child", "with a name"], ["thousands", "no names"]],
          [["the new model", "just out"], ["your old one", "works fine"]]
        ],
        rows: ["now or later", "one or thousands", "new or proven"],
        caps: [
          "Things near and far compete for your <b>limited attention</b>.",
          "Your brain zooms in on <b>the\u00a0here\u00a0and\u00a0now</b>. Usually, that's smart.",
          "A treat <b>now</b> looks huge. Savings for <b>next year</b>? A dot.",
          "One child <b>with a name</b> moves you more than <b>thousands</b> in need.",
          "The <b>new</b> model looks better, just because it's new.",
          "Yet what shrinks is often what <b>matters more</b>.",
          "<b>The fix:</b> widen your view. Picture the far side <b>up close</b>.",
          "Side by side, at <b>real size</b>, the choice gets clear."
        ],
        say: [
          "Things near and far all compete for your attention. And your attention is limited.",
          "So your brain zooms in on the here and now. What's close looks huge, and what's far shrinks to a dot. Usually, that's smart: the reward or the threat right in front of you tends to matter most.",
          "A treat now looks huge. Your savings for next year? Just a dot. That's hyperbolic discounting.",
          "One child with a name and a face moves you more than thousands of people in the same need. That's the identifiable victim effect.",
          "And the new model looks better, just because it's new, while the phone that works fine fades away. That's the appeal to novelty.",
          "Yet what shrinks is often what matters more: a bigger reward, more people, something proven.",
          "The fix: widen your view. Picture the far side up close, like your future self a year from now.",
          "Put near and far side by side, at their real size, and the choice gets clear. And if something new feels urgent, give it a day.",
          "The here and now. What's near looks bigger than it is, so picture the far side up close before you choose."
        ]
      },
      el: {
        name: "Το εδώ & τώρα", shareTitle: "Γιατί κερδίζει ό,τι έχουμε μπροστά μας, σε 30 δευτερόλεπτα",
        ecline: "Ό,τι είναι κοντά φαίνεται μεγαλύτερο απ’\u00a0όσο είναι, γι’\u00a0αυτό φέρε και το μακρινό κοντά σου πριν διαλέξεις.",
        lens: "εδώ & τώρα", wide: "όλη η εικόνα", kid: "Άλεξ", bias: "μεροληψία", real: ["πραγματικό", "μέγεθος"],
        tags: ["Υπερβολική προεξόφληση", "Φαινόμενο αναγνωρίσιμου θύματος", "Επίκληση στο καινούργιο"], tw: [184, 252, 190],
        labs: [
          [["εδώ μπροστά σου"], ["μακριά"]],
          [["ένα γλυκό", "τώρα"], ["οικονομίες", "του χρόνου"]],
          [["ένα παιδί", "με όνομα"], ["χιλιάδες", "χωρίς όνομα"]],
          [["το νέο μοντέλο", "μόλις βγήκε"], ["το παλιό σου", "δουλεύει καλά"]]
        ],
        rows: ["τώρα ή αργότερα", "ένα παιδί ή χιλιάδες", "νέο ή δοκιμασμένο"],
        caps: [
          "Κοντινά και μακρινά, όλα διεκδικούν την <b>περιορισμένη προσοχή σου</b>.",
          "Το μυαλό σου εστιάζει στο <b>εδώ\u00a0και\u00a0τώρα</b>. Και συνήθως καλά κάνει.",
          "Ένα γλυκό <b>τώρα</b> μοιάζει τεράστιο. Οι\u00a0οικονομίες για <b>του χρόνου</b>; Μια\u00a0κουκκίδα.",
          "Ένα παιδί <b>με όνομα</b> σε συγκινεί πιο πολύ από <b>χιλιάδες</b> ανθρώπους σε ανάγκη.",
          "Το <b>νέο</b> μοντέλο μοιάζει καλύτερο, μόνο και μόνο επειδή είναι καινούργιο.",
          "Κι όμως, ό,τι μικραίνει συχνά <b>μετράει περισσότερο</b>.",
          "<b>Η λύση:</b> άνοιξε το κάδρο. Φαντάσου το μακρινό <b>από κοντά</b>.",
          "Δίπλα δίπλα, στο <b>πραγματικό τους μέγεθος</b>, η επιλογή ξεκαθαρίζει."
        ],
        say: [
          "Κοντινά και μακρινά, όλα διεκδικούν την προσοχή σου. Κι η προσοχή σου είναι περιορισμένη.",
          "Γι’ αυτό το μυαλό σου εστιάζει στο εδώ και τώρα. Ό,τι είναι κοντά φαίνεται τεράστιο, κι ό,τι είναι μακριά μικραίνει ώσπου γίνεται κουκκίδα. Και συνήθως καλά κάνει: η ανταμοιβή ή η απειλή που έχεις ακριβώς μπροστά σου τείνει να μετράει πιο πολύ.",
          "Ένα γλυκό τώρα μοιάζει τεράστιο. Οι οικονομίες σου για του χρόνου; Μια κουκκίδα. Λέγεται υπερβολική προεξόφληση.",
          "Ένα παιδί με όνομα και πρόσωπο σε συγκινεί πιο πολύ από χιλιάδες ανθρώπους με την ίδια ανάγκη. Είναι το φαινόμενο αναγνωρίσιμου θύματος.",
          "Και το νέο μοντέλο μοιάζει καλύτερο, μόνο και μόνο επειδή είναι καινούργιο, ενώ το κινητό που δουλεύει μια χαρά ξεθωριάζει. Αυτή είναι η επίκληση στο καινούργιο.",
          "Κι όμως, ό,τι μικραίνει συχνά μετράει περισσότερο: μια μεγαλύτερη ανταμοιβή, περισσότεροι άνθρωποι, κάτι δοκιμασμένο.",
          "Η λύση: άνοιξε το κάδρο. Φαντάσου το μακρινό από κοντά, όπως τον εαυτό σου σε έναν χρόνο.",
          "Βάλε το κοντινό και το μακρινό δίπλα δίπλα, στο πραγματικό τους μέγεθος, και η επιλογή ξεκαθαρίζει. Κι αν κάτι καινούργιο σου φαίνεται επείγον, περίμενε μια μέρα.",
          "Το εδώ και τώρα. Ό,τι είναι κοντά φαίνεται μεγαλύτερο απ’ όσο είναι, γι’ αυτό φέρε και το μακρινό κοντά σου πριν διαλέξεις."
        ]
      }
    },
    svg(T) {
      const item = (key, icon, extra = "") => `<g data-k="${key}"><g class="ih-it">${ICON[icon]}${extra}</g></g>`;
      const far = (key, icon) => `<circle class="ih-dot" data-k="${key}d" r="3"/>${item(key, icon)}`;
      const lab = (lines, x, near) => lines.map((s, i) => `<text class="${i ? `b${near ? " q" : ""}` : "a"}" x="${x}" y="${FOOT + i * 13}">${s}</text>`).join("");
      const labs = T.labs.map(([n, f], j) => `<g class="ih-lb" data-k="L${j}">${lab(n, NX, true)}${lab(f, FX, false)}</g>`).join("");
      const tags = T.tags.map((t, j) => {
        const w = T.tw[j], x = TAG_X - w / 2;
        return `<g class="ih-tag" data-k="tag${j}"><rect class="bx" x="${x}" y="${TAG_Y}" width="${w}" height="${TAG_H}" rx="8"/>
          <rect class="lb" x="${x + 7}" y="${TAG_Y - 3}" width="${f1(T.bias.length * 5.7 + 6)}" height="6"/><text class="lg" x="${x + 10}" y="${TAG_Y + 3.4}">${T.bias}</text>
          <text class="nm" x="${TAG_X}" y="${TAG_Y + 18.5}">${t}</text></g>`;
      }).join("");
      const rows = T.rows.map((r, i) => {
        const y = ROW[i];
        return `<g class="ih-row" data-k="row${i}"><line x1="177" y1="${y}" x2="303" y2="${y}"/><text x="240" y="${y + 3.4}">${r}</text></g>`;
      }).join("");
      const a = Math.PI * 3 / 4, hx = LX + LR * Math.cos(a), hy = LY + LR * Math.sin(a);
      return `
        <g class="ih-you" data-k="you" transform="translate(42 140)">
          <path class="bd" d="M-25.5 48 V40.5 C-25.5 28.5 -13.5 21 0 21 C13.5 21 25.5 28.5 25.5 40.5 V48"/><circle r="12.75"/>
          <circle class="e" cx="-4.6" cy="-1" r="1.8"/><circle class="e" cx="4.6" cy="-1" r="1.8"/><path class="m" data-k="mouth"/>
        </g>
        ${labs}
        <g data-k="LR">${T.real.map((s, i) => `<text class="ih-real" x="${FX}" y="${FOOT + i * 13}">${s}</text>`).join("")}</g>
        <line class="ih-ray" data-k="ray"/>
        <circle class="ih-ring" data-k="ring" cx="${FX}" r="8"/>
        ${far("fG", "gift")}${far("fS", "savings")}${far("fC", "crowd")}${far("fP", "old")}
        <g data-k="hand"><line class="ih-hd" x1="${f1(hx - 3)}" y1="${f1(hy + 3)}" x2="${f1(hx - 24)}" y2="${f1(hy + 24)}"/><line class="ih-hd2" x1="${f1(hx - 10)}" y1="${f1(hy + 10)}" x2="${f1(hx - 22)}" y2="${f1(hy + 22)}"/></g>
        <rect class="ih-lens" data-k="lens"/>
        <path class="ih-glint" data-k="glint" d="M${LX - 44} ${LY - 12} A46 46 0 0 1 ${LX - 16} ${LY - 43}"/>
        <text class="ih-ll" data-k="ll" x="${LX}" y="64">${T.lens}</text>
        <text class="ih-wl" data-k="wl" x="${WIDE[0] + WIDE[2] / 2}" y="${WIDE[1] - 8}">${T.wide}</text>
        ${item("nG", "gift")}${item("nT", "treat")}${item("nC", "child", `<text class="ih-nt" data-k="kid" y="12.8">${T.kid}</text>`)}${item("nP", "fresh")}
        ${rows}
        ${tags}`;
    },
    S0: { you: 0, g: 0, lens: 0, ll: 0, zoom: 0, ray: 0, rayY: 136, L0: 0, L1: 0, L2: 0, L3: 0, LR: 0,
      nG: 0, nT: 0, nC: 0, nP: 0, fG: 0, fS: 0, fC: 0, fP: 0, ghost: 0, fill: 0, wide: 0, grid: 0,
      rows: 0, good: 0, smile: 0, wl: 0, tag0: 0, tag1: 0, tag2: 0 },
    render(S, k) {
      const op = (key, v) => { k(key).style.opacity = f3(cl(v)); };
      const at = (key, x, y, s) => k(key).setAttribute("transform", `translate(${f1(x)} ${f1(y)}) scale(${f3(Math.max(.001, s))})`);
      op("you", S.you);
      k("mouth").setAttribute("d", `M-4.6 5.5 Q0 ${f1(5.5 + 4 * S.smile)} 4.6 5.5`);
      // the lens: a round glass held close, then opened out into a wide frame round both sides
      const w = S.wide, s0 = .7 + .3 * cl(S.lens), r = LR * s0;
      const L = k("lens");
      L.setAttribute("x", f1(lerp(LX - r, WIDE[0], w))); L.setAttribute("y", f1(lerp(LY - r, WIDE[1], w)));
      L.setAttribute("width", f1(lerp(2 * r, WIDE[2], w))); L.setAttribute("height", f1(lerp(2 * r, WIDE[3], w)));
      L.setAttribute("rx", f1(lerp(r, WIDE[4], w)));
      const hue = `color-mix(in srgb, var(--good) ${Math.round(100 * cl(S.good))}%, var(--q))`;
      L.style.stroke = hue; k("wl").style.fill = hue; op("wl", S.wl);
      L.style.fillOpacity = f3(.07 * (1 - w));
      op("lens", S.lens * 1.6);
      op("glint", S.lens * (1 - w * 2)); op("hand", S.lens * (1 - w * 2));
      op("ll", S.ll);
      // near things: magnified in the lens, then back to real size in their row
      const z = lerp(1, ZOOM, S.zoom);
      at("nG", LX, LY, z * (.7 + .3 * cl(S.nG))); op("nG", S.nG * 1.5);
      ["nT", "nC", "nP"].forEach((key, i) => {
        const v = S[key];
        at(key, NX, lerp(LY, ROW[i], S.grid), lerp(ZOOM, 1, S.grid) * (.7 + .3 * cl(v)));
        op(key, v * 1.5);
      });
      op("kid", (1 - S.grid) * 1.5 - .4);
      // far things: a dot while the lens is on the near side, their real size once you look properly
      const gs = lerp(1, .12, S.zoom);
      at("fG", FX, LY, gs); op("fG", S.fG * (1 - S.zoom * 1.4));
      k("fGd").setAttribute("cx", FX); k("fGd").setAttribute("cy", LY); op("fGd", S.fG * (S.zoom * 1.6 - .5));
      ["fS", "fC", "fP"].forEach((key, i) => {
        const v = cl(S[key]);
        at(key, FX, ROW[i], lerp(.15, REAL[i], S.ghost));
        op(key, v * (.6 * S.ghost + .4 * S.fill));
        k(key).firstChild.setAttribute("class", S.fill < .5 ? "ih-it ih-gh" : "ih-it");
        const d = k(key + "d"); d.setAttribute("cx", FX); d.setAttribute("cy", ROW[i]);
        op(key + "d", v * (1 - S.ghost));
      });
      // attention: a sight line from the lens to the far thing in question
      const ang = Math.atan2(S.rayY - LY, FX - LX), c = Math.cos(ang), s = Math.sin(ang);
      const ray = k("ray");
      ray.setAttribute("x1", f1(LX + (LR + 6) * c)); ray.setAttribute("y1", f1(LY + (LR + 6) * s));
      ray.setAttribute("x2", f1(FX - 13 * c)); ray.setAttribute("y2", f1(S.rayY - 13 * s));
      op("ray", S.ray);
      k("ring").setAttribute("cy", f1(S.rayY)); op("ring", S.ray);
      // labels
      for (let j = 0; j < 4; j++) op("L" + j, S["L" + j]);
      op("LR", S.LR);
      for (let j = 0; j < 3; j++) {
        const v = S["tag" + j];
        op("tag" + j, v * 1.4); k("tag" + j).setAttribute("transform", `translate(0 ${f1(6 * (1 - cl(v)))})`);
        op("row" + j, cl(S.rows - j) * 1.2);
      }
    },
    beats: [
      { steps: [{ to: { you: 1 }, ms: 500, sfx: "pluck" }, { to: { nG: 1, fG: 1 }, ms: 600 }, { to: { L0: 1 }, ms: 400 }], hold: 2400 },
      { steps: [{ to: { lens: 1, ll: 1 }, ms: 450, ease: "back", sfx: "pop" }, { wait: 250 },
        { to: { zoom: 1 }, ms: 1100, ease: "inOut", sfx: "whoosh" }, { to: { ray: 1 }, ms: 400 }], hold: 3000 },
      { steps: [{ to: { nG: 0, fG: 0, L0: 0 }, ms: 350 }, { to: { nT: 1, fS: 1, rayY: ROW[0] }, ms: 550, ease: "back", sfx: "pop" },
        { to: { L1: 1 }, ms: 350 }, { wait: 200 }, { to: { tag0: 1 }, ms: 400 }], hold: 2600 },
      { steps: [{ to: { nT: 0, L1: 0, tag0: 0 }, ms: 350 }, { to: { nC: 1, fC: 1, rayY: ROW[1] }, ms: 550, ease: "back", sfx: "pluck" },
        { to: { L2: 1 }, ms: 350 }, { wait: 200 }, { to: { tag1: 1 }, ms: 400 }], hold: 3000 },
      { steps: [{ to: { nC: 0, L2: 0, tag1: 0 }, ms: 350 }, { to: { nP: 1, fP: 1, rayY: ROW[2] }, ms: 550, ease: "back", sfx: "pop" },
        { to: { L3: 1 }, ms: 350 }, { wait: 200 }, { to: { tag2: 1 }, ms: 400 }], hold: 2800 },
      { steps: [{ to: { tag2: 0, L3: 0, ray: 0 }, ms: 400 }, { to: { ghost: 1 }, ms: 1100, ease: "inOut", sfx: "tick" }, { to: { LR: 1 }, ms: 400 }], hold: 2800 },
      { steps: [{ to: { LR: 0, ll: 0 }, ms: 300 }, { to: { wide: 1, grid: 1 }, ms: 1300, ease: "inOut", sfx: "whoosh" },
        { to: { fill: 1, nT: 1, nC: 1, wl: 1 }, ms: 600 }], hold: 2800 },
      { steps: [{ to: { rows: 3 }, ms: 1200, ease: "lin" },
        { to: { good: 1, smile: 1 }, ms: 600, sfx: "chime" }], hold: 4200 }
    ]
  };
})();
