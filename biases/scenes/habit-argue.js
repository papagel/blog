/* Habit, argue the other side: a café you're sure about, a "for" bubble full of articles that agree,
   an empty "against" bubble you then fill yourself, and a plan that grows a weekend pop-up before
   you go ahead. The two bubbles are the habit's tile drawing, grown into lists. Scene for anim.js. */
(function () {
  const KEY = "habit-argue", P = `.bp[data-scene="${KEY}"]`;
  const FX = 20, AX = 216, BY = 20, BW = 164, BB = 134, R = 12;   // the two bubbles: left edges, top, width, bottom
  const ROW = [52, 78, 104], RH = 22;                              // list rows inside the bubbles
  const G = 230, RY = 220;                                         // ground line, route height
  const HX = 200, HY = 189;                                        // your head
  const JX = 58, SX = 269, CX = 352;                               // job, pop-up stall, café (centres)
  const A0 = 80, A1 = 174, B0 = 226, B1 = 314;                     // route: job -> you, you -> café
  const WX0 = AX + 30, WX1 = AX + BW - 12;                         // write-on span of the "against" rows
  const cl = v => Math.max(0, Math.min(1, v));
  const f2 = v => (+v).toFixed(2);
  // a speech bubble with a short tail leaning towards you, like the habit's tile
  const bubble = (x, t0, tip, t1) => `M${x + R} ${BY} H${x + BW - R} A${R} ${R} 0 0 1 ${x + BW} ${BY + R} V${BB - R} A${R} ${R} 0 0 1 ${x + BW - R} ${BB}` +
    ` H${t0} L${tip[0]} ${tip[1]} L${t1} ${BB} H${x + R} A${R} ${R} 0 0 1 ${x} ${BB - R} V${BY + R} A${R} ${R} 0 0 1 ${x + R} ${BY} Z`;
  const FOR = bubble(FX, 172, [186, 150], 158), AGAINST = bubble(AX, 242, [214, 150], 228);
  const scallops = (x, y, n, w) => { let d = `M${x} ${y}`; for (let i = 0; i < n; i++) d += ` q${w / 2} ${w / 2} ${w} 0`; return d; };

  window.BiasAnim.SCENES[KEY] = {
    q: "tmi", viewBox: "0 0 400 272",
    css: `
      ${P} .ha-bub{fill:var(--surface);stroke:var(--muted);stroke-width:2;stroke-linejoin:round}
      ${P} .ha-bub.q{stroke:var(--q);stroke-width:2.4}
      ${P} .ha-bub.dash{fill:none;stroke:var(--faint);stroke-width:1.6;stroke-dasharray:4 5;stroke-linecap:round}
      ${P} .ha-sign{fill:none;stroke:var(--muted);stroke-width:2.4;stroke-linecap:round}
      ${P} .ha-sign.q{stroke:var(--q)} ${P} .ha-sign.f{stroke:var(--faint)}
      ${P} .ha-h{font:600 12.5px var(--display);fill:var(--ink)}
      ${P} .ha-h.f{fill:var(--faint)}
      ${P} .ha-rule{stroke:var(--rule);stroke-width:1.2;stroke-linecap:round}
      ${P} .ha-row{fill:none;stroke:var(--rule);stroke-width:1.2}
      ${P} .ha-row.q{stroke:var(--q);stroke-opacity:.45}
      ${P} .ha-it{font:600 10.5px var(--display);fill:var(--ink)}
      ${P} .ha-doc{fill:none;stroke:var(--muted);stroke-width:1.3;stroke-linejoin:round;stroke-linecap:round}
      ${P} .ha-ck{fill:none;stroke:var(--q);stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
      ${P} .ha-min circle{fill:none;stroke:var(--q);stroke-width:1.5}
      ${P} .ha-min path{stroke:var(--q);stroke-width:1.8;stroke-linecap:round}
      ${P} .ha-cover{fill:var(--surface)}
      ${P} .ha-pen{stroke:var(--q);stroke-width:2.2;stroke-linecap:round}
      ${P} .ha-empty{font:500 9.5px var(--mono);fill:var(--faint);text-anchor:middle}
      ${P} .ha-spark{fill:none;stroke:var(--q);stroke-width:2;stroke-linecap:round}
      ${P} .ha-ln{fill:var(--surface);stroke:var(--ink);stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
      ${P} .ha-st{fill:none;stroke:var(--ink);stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
      ${P} .ha-aw{fill:none;stroke:var(--q);stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
      ${P} .ha-cup{fill:none;stroke:var(--q);stroke-width:1.4;stroke-linecap:round;stroke-linejoin:round}
      ${P} .ha-eye{fill:var(--ink)}
      ${P} .ha-ground{stroke:var(--rule);stroke-width:2;stroke-linecap:round}
      ${P} .ha-route{stroke:var(--muted);stroke-width:2;stroke-dasharray:2 5;stroke-linecap:round}
      ${P} .ha-head{fill:none;stroke:var(--muted);stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
      ${P} .ha-go{stroke:var(--good);stroke-width:2.6;stroke-linecap:round}
      ${P} .ha-head.ok{stroke:var(--good);stroke-width:2.6}
      ${P} .ha-lab{font:600 10.5px var(--display);fill:var(--ink);text-anchor:middle}
      ${P} .ha-sub{font:500 9.5px var(--mono);fill:var(--muted);text-anchor:middle}
      ${P} .ha-note{font:500 9.5px var(--mono);fill:var(--q);text-anchor:middle}
      ${P} .ha-note.ok{fill:var(--good)}
      ${P} .ha-strike{fill:none;stroke:var(--q);stroke-width:1.8;stroke-linecap:round}
      ${P} .ha-pill rect{fill:var(--surface);stroke:var(--ink);stroke-width:1.6}
      ${P} .ha-pill text{font:600 11px var(--display);fill:var(--ink);text-anchor:middle}
      ${P} .ha-pill.q rect{stroke:var(--q);stroke-width:2}
      ${P} .ha-pill.q path{fill:var(--q)}
      ${P} .ha-pause circle{fill:var(--surface);stroke:var(--q);stroke-width:1.8}
      ${P} .ha-pause path{stroke:var(--q);stroke-width:2.2;stroke-linecap:round}
      ${P} .ha-chk circle{fill:var(--surface);stroke:var(--good);stroke-width:2}
      ${P} .ha-chk path{fill:none;stroke:var(--good);stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round}
    `,
    text: {
      en: {
        name: "Argue the other side", shareTitle: "Argue the other side: a habit in 30 seconds",
        ecline: "Make the strongest case against your plan first, then go ahead with open eyes.",
        forH: "For", agH: "Against", empty: "empty",
        pros: ["Cafés are booming", "Do what you love", "Be your own boss"],
        cons: ["High rent", "Slow first months", "12-hour days"],
        job: "Your job", cafe: "Your café", quit: "quit", quitW: 24, notYet: "not yet",
        popup: "Pop-up", popupSub: "on weekends",
        sure: "100% sure", sureW: 74, bias: "Confirmation bias", biasW: 130,
        caps: [
          "You want to quit your job and open a <b>café</b>. You're sure.",
          "Everything you read seems to <b>agree</b> with you.",
          "So you only collect reasons <b>for</b>. The other side stays empty.",
          "<b>The habit:</b> before you commit, argue the other side.",
          "Write the <b>strongest case against</b> your own plan.",
          "Then adjust the plan: <b>test it</b> with weekend pop-ups first.",
          "This habit catches <b>confirmation bias</b>: seeing only what agrees with you.",
          "You still go ahead, but <b>with open eyes</b>."
        ],
        say: [
          "You want to quit your job and open a café. You're sure.",
          "Everything you read seems to agree with you.",
          "So you only collect reasons for. The other side stays empty.",
          "The habit: before you commit, argue the other side.",
          "Write the strongest case against your own plan. High rent. Slow first months. Twelve-hour days.",
          "Then adjust the plan. Test it with weekend pop-ups first.",
          "This habit catches confirmation bias: seeing only what agrees with you.",
          "You still go ahead, but with open eyes.",
          "Argue the other side. Make the strongest case against your plan first, then go ahead with open eyes."
        ]
      },
      el: {
        name: "Υπερασπίσου την άλλη πλευρά", shareTitle: "Υπερασπίσου την άλλη πλευρά: μια συνήθεια σε 30 δευτερόλεπτα",
        ecline: "Βρες πρώτα τα πιο δυνατά επιχειρήματα κατά του σχεδίου σου και μετά προχώρα με ανοιχτά μάτια.",
        forH: "Υπέρ", agH: "Κατά", empty: "κενό",
        pros: ["Ο καφές πουλάει", "Κάνε ό,τι αγαπάς", "Χωρίς αφεντικό"],
        cons: ["Ακριβό ενοίκιο", "Αργό ξεκίνημα", "12 ώρες τη μέρα"],
        job: "Η δουλειά σου", cafe: "Το καφέ σου", quit: "παραίτηση", quitW: 52, notYet: "όχι ακόμα",
        popup: "Πάγκος", popupSub: "τα Σαββατοκύριακα",
        sure: "100% σίγουρα", sureW: 92, bias: "Μεροληψία επιβεβαίωσης", biasW: 156,
        caps: [
          "Θέλεις να παραιτηθείς και να ανοίξεις ένα <b>καφέ</b>. Δεν έχεις καμία αμφιβολία.",
          "Ό,τι διαβάζεις μοιάζει να σου δίνει <b>δίκιο</b>.",
          "Μαζεύεις μόνο λόγους <b>υπέρ</b>. Η άλλη πλευρά μένει άδεια.",
          "<b>Η συνήθεια:</b> πριν δεσμευτείς, υπερασπίσου την άλλη πλευρά.",
          "Γράψε τα <b>πιο δυνατά επιχειρήματα κατά</b> του σχεδίου σου.",
          "Μετά προσάρμοσε το σχέδιο: <b>δοκίμασέ το</b> πρώτα σε έναν πάγκο τα Σαββατοκύριακα.",
          "Έτσι πιάνεις τη <b>μεροληψία επιβεβαίωσης</b>: να βλέπεις μόνο όσα σου δίνουν δίκιο.",
          "Και προχωράς, αλλά αυτή\u00a0τη\u00a0φορά <b>με ανοιχτά μάτια</b>."
        ],
        say: [
          "Θέλεις να παραιτηθείς και να ανοίξεις ένα καφέ. Δεν έχεις καμία αμφιβολία.",
          "Ό,τι διαβάζεις μοιάζει να σου δίνει δίκιο.",
          "Μαζεύεις μόνο λόγους υπέρ. Η άλλη πλευρά μένει άδεια.",
          "Η συνήθεια: πριν δεσμευτείς, υπερασπίσου την άλλη πλευρά.",
          "Γράψε τα πιο δυνατά επιχειρήματα κατά του σχεδίου σου. Ακριβό ενοίκιο. Αργό ξεκίνημα. Δώδεκα ώρες τη μέρα.",
          "Μετά προσάρμοσε το σχέδιο. Δοκίμασέ το πρώτα σε έναν πάγκο τα Σαββατοκύριακα.",
          "Έτσι πιάνεις τη μεροληψία επιβεβαίωσης: να βλέπεις μόνο όσα σου δίνουν δίκιο.",
          "Και προχωράς, αλλά αυτή τη φορά με ανοιχτά μάτια.",
          "Υπερασπίσου την άλλη πλευρά. Βρες πρώτα τα πιο δυνατά επιχειρήματα κατά του σχεδίου σου και μετά προχώρα με ανοιχτά μάτια."
        ]
      }
    },
    svg(T) {
      // the "for" side: articles that agree, then the bubble drawn around them
      const pros = T.pros.map((s, i) => {
        const y = ROW[i];
        return `<g data-k="f${i}"><rect class="ha-row" x="${FX + 8}" y="${y}" width="${BW - 16}" height="${RH}" rx="6"/>
          <path class="ha-doc" d="M34 ${y + 5} H41 L44 ${y + 8} V${y + 17} H34 Z M36.5 ${y + 11} H41.5 M36.5 ${y + 14} H41.5"/>
          <text class="ha-it" x="50" y="${y + 15}">${s}</text>
          <path class="ha-ck" d="M161.5 ${y + 11} l3 3 l5.5 -6"/></g>`;
      }).join("");
      // the "against" side: rows you write yourself, revealed left to right
      const cons = T.cons.map((s, i) => {
        const y = ROW[i];
        return `<g data-k="a${i}"><rect class="ha-row q" x="${AX + 8}" y="${y}" width="${BW - 16}" height="${RH}" rx="6"/>
          <g class="ha-min"><circle cx="${AX + 18}" cy="${y + 11}" r="5.5"/><path d="M${AX + 15} ${y + 11} H${AX + 21}"/></g>
          <text class="ha-it" data-k="t${i}" x="${AX + 30}" y="${y + 15}">${s}</text>
          <rect class="ha-cover" data-k="cv${i}" y="${y + 3}" height="16"/>
          <path class="ha-pen" data-k="pen${i}" d=""/></g>`;
      }).join("");
      const hdr = (x, sign, label, cls) => `<path class="ha-sign ${cls}" d="${sign === "+" ? `M${x + 13} 36 H${x + 23} M${x + 18} 31 V41` : `M${x + 13} 36 H${x + 23}`}"/>` +
        `<text class="ha-h${cls === "f" ? " f" : ""}" x="${x + 30}" y="40.5">${label}</text>`;
      return `
        <g data-k="forB"><path class="ha-bub" data-k="fb" pathLength="1" d="${FOR}"/>
          <g data-k="fh">${hdr(FX, "+", T.forH, "")}<line class="ha-rule" x1="${FX + 10}" y1="46" x2="${FX + BW - 10}" y2="46"/></g>
          ${pros}</g>
        <g data-k="agB">
          <path class="ha-bub dash" data-k="ab" d="${AGAINST}"/>
          <path class="ha-bub q" data-k="abOn" pathLength="1" d="${AGAINST}"/>
          <g data-k="ahF">${hdr(AX, "-", T.agH, "f")}</g>
          <g data-k="ah">${hdr(AX, "-", T.agH, "q")}<line class="ha-rule" x1="${AX + 10}" y1="46" x2="${AX + BW - 10}" y2="46"/></g>
          <text class="ha-empty" data-k="empty" x="${AX + BW / 2}" y="92">${T.empty}</text>
          <g data-k="spark"><path class="ha-spark" d="M378.6 16.5 L382.8 12.3 M384.9 26.3 H389.1 M369.5 14.4 L370.2 10.2"/></g>
          ${cons}</g>
        <g class="ha-pill" data-k="sure"><rect x="${HX - T.sureW / 2}" y="156" width="${T.sureW}" height="18" rx="9"/><text x="${HX}" y="168.8">${T.sure}</text></g>
        <g data-k="low">
          <line class="ha-ground" x1="14" y1="${G}" x2="386" y2="${G}"/>
          <g data-k="job"><rect class="ha-ln" x="${JX - 16}" y="210" width="32" height="20" rx="3"/>
            <path class="ha-st" d="M${JX - 6} 210 V206 Q${JX - 6} 204 ${JX - 4} 204 H${JX + 4} Q${JX + 6} 204 ${JX + 6} 206 V210 M${JX - 16} 218 H${JX + 16}"/>
            <text class="ha-lab" x="${JX}" y="245">${T.job}</text></g>
          <g data-k="rA"><line class="ha-route" data-k="segA" x1="${A0}" y1="${RY}" y2="${RY}"/>
            <g data-k="quit"><text class="ha-note" x="${(A0 + A1) / 2}" y="212">${T.quit}</text>
              <path class="ha-strike" data-k="strike" pathLength="1" stroke-dasharray="1 1" d="M${(A0 + A1) / 2 - T.quitW / 2 - 3} 209 L${(A0 + A1) / 2 + T.quitW / 2 + 3} 207"/></g>
            <text class="ha-note ok" data-k="notYet" x="${(A0 + A1) / 2}" y="212">${T.notYet}</text></g>
          <g data-k="rB"><line class="ha-route" data-k="segB" x1="${B0}" y1="${RY}" y2="${RY}"/><path class="ha-head" data-k="headB" d="M-5 -5 L0 0 L-5 5"/></g>
          <line class="ha-go" data-k="go" x1="${B0}" y1="${RY}" y2="${RY}"/><path class="ha-head ok" data-k="headG" d="M-5 -5 L0 0 L-5 5"/>
          <g class="ha-pause" data-k="pause"><circle cx="${SX}" cy="${RY}" r="8.5"/><path d="M${SX - 2.8} ${RY - 3.8} V${RY + 3.8} M${SX + 2.8} ${RY - 3.8} V${RY + 3.8}"/></g>
          <g data-k="stall"><path class="ha-st" d="M${SX - 13} 212 V197 M${SX + 13} 212 V197"/>
            <path class="ha-ln" d="M${SX - 19} 197 L${SX - 15} 188 H${SX + 15} L${SX + 19} 197 Z"/><path class="ha-aw" d="${scallops(SX - 19, 197, 4, 9.5)}"/>
            <rect class="ha-ln" x="${SX - 16}" y="212" width="32" height="18" rx="2"/>
            <path class="ha-cup" d="M${SX - 4} 217 h7 v4 a2.5 2.5 0 0 1 -2.5 2.5 h-2 a2.5 2.5 0 0 1 -2.5 -2.5 z M${SX + 3} 218.5 a1.8 1.8 0 0 1 0 3.6"/></g>
          <g data-k="stallL"><text class="ha-lab" x="${SX}" y="245">${T.popup}</text><text class="ha-sub" x="${SX}" y="257">${T.popupSub}</text></g>
          <g data-k="cafe"><path class="ha-ln" d="M${CX - 26} 230 V196 H${CX + 26} V230"/>
            <path class="ha-ln" d="M${CX - 30} 196 L${CX - 25} 184 H${CX + 25} L${CX + 30} 196 Z"/><path class="ha-aw" d="${scallops(CX - 30, 196, 5, 12)}"/>
            <rect class="ha-ln" x="${CX + 8}" y="210" width="12" height="20" rx="1.5"/>
            <rect class="ha-ln" x="${CX - 20}" y="205" width="22" height="16" rx="1.5"/>
            <path class="ha-cup" d="M${CX - 14} 210 h8 v4 a3 3 0 0 1 -3 3 h-2 a3 3 0 0 1 -3 -3 z M${CX - 6} 211.2 a2 2 0 0 1 0 4"/>
            <text class="ha-lab" x="${CX}" y="245">${T.cafe}</text></g>
        </g>
        <g data-k="you"><path class="ha-ln" d="M${HX - 21} ${G} V${G - 7} C${HX - 21} ${G - 19} ${HX - 12} ${G - 26} ${HX} ${G - 26} C${HX + 12} ${G - 26} ${HX + 21} ${G - 19} ${HX + 21} ${G - 7} V${G}"/>
          <circle class="ha-ln" cx="${HX}" cy="${HY}" r="9.5"/>
          <circle class="ha-eye" cx="${HX - 3.6}" cy="${HY - 0.6}" r="1.35"/><circle class="ha-eye" cx="${HX + 3.6}" cy="${HY - 0.6}" r="1.35"/>
          <path class="ha-st" data-k="mouth" style="stroke-width:1.6" d=""/></g>
        <g class="ha-pill q" data-k="bias"><path d="M${FX + 34} 152 L${FX + 40} 145 L${FX + 46} 152 Z"/>
          <rect x="${FX}" y="152" width="${T.biasW}" height="20" rx="10"/><text x="${FX + T.biasW / 2}" y="165.8">${T.bias}</text></g>
        <g class="ha-chk" data-k="done"><circle r="8.5"/><path d="M-3.8 0.4 L-1 3.2 L4.2 -2.8"/></g>`;
    },
    S0: { cafe: 0, you: 0, job: 0, segA: 0, segB: 0, quit: 0, sure: 0, smile: 1,
      f0: 0, f1: 0, f2: 0, fb: 0, ab: 0, abOn: 0, spark: 0, pause: 0, segDim: 0,
      a0: 0, a1: 0, a2: 0, w0: 0, w1: 0, w2: 0, stall: 0, strike: 0, notYet: 0,
      dim: 0, bias: 0, go: 0, done: 0 },
    render(S, k) {
      const op = (key, v) => { k(key).style.opacity = f2(cl(v)); };
      const tr = (key, x, y, extra) => k(key).setAttribute("transform", `translate(${f2(x)} ${f2(y)})${extra || ""}`);
      const pop = (key, cx, cy, p) => k(key).setAttribute("transform", `translate(${cx} ${cy}) scale(${f2(.6 + .4 * p)}) translate(${-cx} ${-cy})`);
      // the "for" side: three articles that agree, then the bubble drawn round them
      for (let i = 0; i < 3; i++) { const p = S["f" + i]; op("f" + i, p * 1.6); tr("f" + i, 10 * (1 - p), 0); }
      const fb = k("fb");
      fb.style.strokeDasharray = "1 1"; fb.style.strokeDashoffset = f2(1 - S.fb); fb.style.fillOpacity = f2(S.fb);
      op("fh", (S.fb - .4) * 2);
      // the "against" side: empty and dashed, then yours to argue
      op("agB", 1 - .45 * S.dim);
      op("ab", S.ab * (1 - S.abOn)); op("ahF", S.ab * (1 - S.abOn)); op("empty", S.ab * (1 - S.abOn * 2));
      const ab = k("abOn");
      ab.style.strokeDasharray = "1 1"; ab.style.strokeDashoffset = f2(1 - S.abOn); ab.style.fillOpacity = f2(S.abOn);
      op("abOn", S.abOn > 0 ? 1 : 0); op("ah", (S.abOn - .3) * 2);
      pop("spark", 380, 20, S.spark); op("spark", S.spark);
      for (let i = 0; i < 3; i++) {
        const p = S["a" + i], w = S["w" + i], y = ROW[i];
        let span = WX1 - WX0;                                      // while writing, the pen runs the length of the words
        if (w > 0 && w < 1) try { span = Math.min(span, k("t" + i).getComputedTextLength() + 3); } catch (e) {}
        const x = WX0 + span * w;
        op("a" + i, p * 1.6); tr("a" + i, 8 * (1 - p), 0);
        const cv = k("cv" + i); cv.setAttribute("x", f2(x)); cv.setAttribute("width", f2(Math.max(0, WX1 + 4 - x)));
        k("pen" + i).setAttribute("d", w > 0 && w < 1 ? `M${f2(x)} ${y + 18} l5 -11` : "");
      }
      // you, your job and the café
      op("sure", S.sure); pop("sure", HX, 165, S.sure);
      op("you", S.you);
      k("mouth").setAttribute("d", `M${HX - 3.5} ${HY + 3.8} Q${HX} ${f2(HY + 3.8 + 3.2 * S.smile)} ${HX + 3.5} ${HY + 3.8}`);
      op("low", 1 - .7 * S.dim);
      op("job", S.job);
      op("cafe", S.cafe); tr("cafe", 0, 8 * (1 - S.cafe));
      // the plan as a route: quit, then straight to the café
      k("segA").setAttribute("x2", f2(A0 + (A1 - A0) * S.segA)); op("segA", S.segA > 0 ? 1 : 0);
      op("quit", S.quit);
      const st = k("strike"); st.style.strokeDashoffset = f2(1 - S.strike); op("strike", S.strike > 0 ? 1 : 0);
      op("notYet", S.notYet);
      const bx = B0 + (B1 - B0) * S.segB;
      k("segB").setAttribute("x2", f2(bx)); op("rB", (S.segB > 0 ? 1 : 0) * (1 - .65 * S.segDim));
      tr("headB", bx + 1, RY); op("headB", (S.segB - .9) * 10);
      // before you commit: a pause, which becomes a weekend pop-up
      op("pause", S.pause); pop("pause", SX, RY, S.pause);
      op("stall", S.stall * 2); tr("stall", 0, 10 * (1 - S.stall)); op("stallL", (S.stall - .5) * 2);
      // the bias it catches
      op("bias", S.bias * 3); tr("bias", 0, -14 * (1 - S.bias));
      // going ahead, eyes open
      const gx = B0 + (B1 - B0) * S.go;
      k("go").setAttribute("x2", f2(gx)); op("go", S.go > 0 ? 1 : 0);
      tr("headG", gx + 1, RY); op("headG", (S.go - .9) * 10);
      tr("done", CX, 170, ` scale(${f2(Math.max(0, S.done))})`); op("done", S.done * 2);
    },
    beats: [
      { steps: [{ to: { cafe: 1 }, ms: 500, ease: "back", sfx: "pluck" }, { to: { you: 1, job: 1 }, ms: 400 },
        { to: { segA: 1 }, ms: 450, ease: "inOut" }, { to: { quit: 1, segB: 1 }, ms: 650, ease: "inOut" },
        { wait: 200 }, { to: { sure: 1 }, ms: 450, ease: "back", sfx: "pop" }] },
      { steps: [{ to: { f0: 1 }, ms: 450, ease: "back", sfx: "tick" }, { wait: 250 }, { to: { f1: 1 }, ms: 450, ease: "back" },
        { wait: 250 }, { to: { f2: 1 }, ms: 450, ease: "back" }] },
      { steps: [{ to: { fb: 1 }, ms: 800, ease: "inOut" }, { wait: 300 }, { to: { ab: 1 }, ms: 600 }] },
      { steps: [{ to: { sure: 0, smile: 0 }, ms: 350 }, { to: { abOn: 1 }, ms: 800, ease: "inOut" },
        { to: { spark: 1 }, ms: 350, ease: "back", sfx: "pop" }, { to: { pause: 1, segDim: 1 }, ms: 400 }] },
      { steps: [{ to: { a0: 1 }, ms: 250 }, { to: { w0: 1 }, ms: 650, ease: "lin", sfx: "scribble" },
        { to: { a1: 1 }, ms: 250 }, { to: { w1: 1 }, ms: 650, ease: "lin" },
        { to: { a2: 1 }, ms: 250 }, { to: { w2: 1 }, ms: 650, ease: "lin", sfx: "scribble" }], hold: 2800 },
      { steps: [{ to: { pause: 0 }, ms: 250 }, { to: { stall: 1, segDim: 0 }, ms: 600, ease: "back", sfx: "pop" }, { wait: 300 },
        { to: { strike: 1 }, ms: 350 }, { to: { quit: 0 }, ms: 250 }, { to: { notYet: 1 }, ms: 350 }], hold: 2800 },
      { steps: [{ to: { dim: 1 }, ms: 500 }, { to: { bias: 1 }, ms: 700, ease: "bounce", sfx: "thud", sfxAt: 260 }], hold: 3000 },
      { steps: [{ to: { dim: 0 }, ms: 450 }, { to: { go: 1 }, ms: 1100, ease: "inOut" },
        { to: { done: 1, smile: 1 }, ms: 450, ease: "back", sfx: "chime" }], hold: 4200 }
    ]
  };
})();
