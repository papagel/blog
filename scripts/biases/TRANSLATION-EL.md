# Greek translation guide: Cognitive Bias Explorer

The Greek page lives at papangelis.com/biases/el/. It is built from the same
template as the English page. Content comes from `data/el/q1..q4.json`, which
mirror `data/q1..q4.json` exactly in structure and order.

## Voice

- Natural, modern Greek for curious adults with no psychology background.
  Plain words, short sentences. Write the way a thoughtful Greek writer would
  explain this in a good popular-science magazine, not a literal translation.
- Address the reader in the singular "εσύ" (informal), matching the English "you".
- Use the Greek question mark ";" and Greek quotation marks «...».
- No em-dashes as asides, no emoji, no filler.
- Keep facts exactly as in the English. Do not add or drop claims, numbers,
  dates or names. Researcher names stay in their usual Greek-press form
  (e.g. Amos Tversky and Daniel Kahneman can stay in Latin script).

## Glossary (use consistently)

| English | Greek |
|---|---|
| cognitive bias | γνωστική μεροληψία (plural: γνωστικές μεροληψίες) |
| bias (general) | μεροληψία |
| prejudice (the specific entry) | προκατάληψη |
| heuristic | ευρετική |
| fallacy | πλάνη |
| effect | φαινόμενο |
| illusion | ψευδαίσθηση |
| family (group of related biases) | οικογένεια |
| Too Much Information | Πάρα πολλή πληροφορία |
| Not Enough Meaning | Ανεπαρκές νόημα |
| Need To Act Fast | Ανάγκη για γρήγορη δράση |
| What Should We Remember? | Τι να θυμόμαστε; |
| my map / your bias map | ο χάρτης μου / ο χάρτης σου |
| It got me | Την πάτησα |
| I've caught this in myself | Το κάνω κι εγώ |
| experiment | πείραμα |
| base rate | βασικό ποσοστό |
| anchor / anchoring | άγκυρα / αγκύρωση |
| framing | πλαισίωση |
| confirmation bias | μεροληψία επιβεβαίωσης |

## Bias names (`n`)

- Use the established Greek term when one exists (e.g. "Μεροληψία επιβεβαίωσης",
  "Αγκύρωση", "Φαινόμενο Dunning-Kruger", "Πλάνη του τζογαδόρου").
- When there is no established term, write a clear, natural Greek name.
- Keep names short: aim for 32 characters or fewer, because they are drawn
  around a wheel. Eponyms stay as they are (Dunning-Kruger, Von Restorff,
  Baader-Meinhof, Semmelweis, Forer, Barnum, Peltzman, Murphy, IKEA, Google).
- Put the original English name in a new field `"en"` on every bias, copied
  exactly from the English file. The page uses it for links and shows it as a
  subtitle.

## Money, numbers, examples

- Keep the examples' situations but make them feel natural to a Greek reader
  (e.g. use euros instead of dollars, Greek-context names or places when a name
  or place appears). Keep numbers the same.
- Decimal comma (3,5) and "%" as usual.

## JSON rules

- Same keys, same order, same group `id`s. Translate `title`, `why`, `cost`,
  `spot[]`, `fix[]`, and for each bias `n`, `alias` (if present), `d`, `ex`,
  `q`, `spot`, `fix`. Add `en`.
- Plain UTF-8 Greek. Straight ASCII double quotes only as JSON delimiters; use
  «» inside text.
- Validate: `node -e "JSON.parse(require('fs').readFileSync('<path>','utf8'))"`.
- Also check that every bias `en` matches the English file at the same position.

## Naturalness checklist (editing pass)

The first translation was accurate but often too literal. A Greek reader should
never feel they are reading a translation. Watch for:

- **Calqued verb + noun pairs.** "take shortcuts" is «κάνω συντομεύσεις», not
  «παίρνω συντομεύσεις». "make sense" is «βγάζει νόημα» / «στέκει», not
  «κάνει νόημα». "pay attention" is «προσέχω», "take into account" is «λαμβάνω υπόψη».
- **Phrases that mean something else in Greek.** «Δοκίμασέ το πάνω σου» sounds
  like trying on clothes. «Με έπιασε» is weaker than «Την πάτησα» for "It got me".
  «Το έχω πιάσει στον εαυτό μου» is a calque; «Μου έχει συμβεί» / «Το κάνω κι εγώ» is natural.
- **English word order and structure.** Greek often puts the verb first, drops
  subject pronouns (no «εσύ»/«εμείς» unless stressed), and needs fewer
  possessives («σου», «μας») than English.
- **Noun stacks.** «η τάση της υπερεκτίμησης της πιθανότητας της επιτυχίας»
  becomes a verb phrase: «τείνουμε να υπερεκτιμούμε πόσο πιθανό είναι να πετύχουμε».
- **Passives and "αυτό" openings.** Prefer active voice. Don't start sentence
  after sentence with «Αυτό...» or «Το...» as a stand-in for "This...".
- **Title Case.** Greek headings use sentence case: «Γιατί υπάρχουν οι μεροληψίες», not «Γιατί Υπάρχουν Οι Μεροληψίες».
- **Register.** Friendly, informal «εσύ», everyday vocabulary, like a good Greek
  popular-science writer. Avoid bureaucratic or academic words when a common one exists.
- **Grammar.** Check gender, case and number agreement, accents (τόνοι), final ς, «» quotes, ";" for questions.
- **Keep the meaning.** Never change facts, numbers, names or what a bias means.
  Rewrite the sentence, not the idea.
