/* ============================================================
   VERBUM ORIGO — LESSONS (learning path, §5)
   Data-driven: every exercise references word ids, script
   entries or verse ids from the schema — no ad-hoc content.
   Exercise types: info | mcq | match | build | type | listen |
                   verse | tree
   ============================================================ */
(function(){
"use strict";
function L(id,lang,type,icon,title,subtitle,intro,ex){
  return { id:id, lang:lang, type:type, icon:icon, title:title, subtitle:subtitle, intro:intro||[], ex:ex||[] };
}
function M(pairs){ return {t:'match', pairs:pairs}; }
function MC(q,opts,a,why,wid){ return {t:'mcq', q:q, opts:opts, a:a, why:why||'', wid:wid||null}; }
function BD(prompt,answer,distract){ return {t:'build', prompt:prompt, answer:answer, distract:distract||[]}; }
function TY(prompt,accepts,placeholder){ return {t:'type', prompt:prompt, accepts:accepts, placeholder:placeholder||''}; }
function LS(wid,opts,why){ return {t:'listen', wid:wid, opts:opts, why:why||''}; }
function VER(vid){ return {t:'verse', vid:vid}; }
function TREE(vid){ return {t:'tree', vid:vid}; }

var LESSONS=[
/* ================= HEBREW ================= */
L('heb-alph','heb','alphabet','א','Script & Alphabet','The 22 letters of Hebrew',
 [ "<h4>Right to left</h4>Hebrew reads <b>right&nbsp;to&nbsp;left</b>, like its cousin Aramaic. The 22 letters are the same ones that open Daniel and Ezra in Aramaic — and the ancestors of the square script used for Jewish and Arabic-descended scripts.",
   "<h4>Five final letters</h4>כ ך, מ ם, נ ן, פ ף, צ ץ — five letters take a special “closed” shape at the <i>end</i> of a word.",
   "<h4>Letters are pictures</h4>Each letter began as a simple picture: aleph = ox, bet = house, shin = tooth. The names survive in the English “alphabet.”"],
 [ MC('Which letter is this?  ש',['shin','samekh','ayin','qof'],0,'ש is <b>shin</b> (sh) — the “tooth.” The dot on the right makes it shin; on the left, sin (s).'),
   M([['he-aleph','ox (aleph)'],['he-bet','house (bet)'],['he-shin','tooth (shin)'],['he-lamed','goad (lamed)'],['he-mem','water (mem)'],['he-tav','mark (tav)']]),
   MC('At the <b>end</b> of a word, מ becomes…',['ם (final mem)','ך (final kaf)','ן (final nun)','ף (final pe)'],0,'מ → ם at word-end. The same rule gives כ→ך, נ→ן, פ→ף, צ→ץ.'),
   TY('Type the name of this letter:  ג',['gimel','gamel','gimel'], 'gimel'),
   MC('How many letters does the Hebrew alphabet have?',['22','24','26','18'],0,'22 — the same count as Aramaic.'),
   MC('This vowel sign ַ (patah) gives which sound?',['a (as in “cat”)','e (as in “bed”)','i (as in “bit”)','o (as in “boat”)'],0,'Patah = a. (Qamats ָ is a/o, segol ֶ is e, tsere ֵ is e/ai, hiriq ִ is i, holam ֹ is o, qubuts ֻ is u.)') ]),

L('heb-v1','heb','vocab','📜','The First Verse','Genesis 1:1 — seven words',
 [ "<h4>בְּרֵאשִׁית בָּרָא אֱלֹהִים</h4><div class='ex'>בְּרֵאשִׁית בָּרָא אֱלֹהִים אֵת הַשָּׁמַיִם וְאֵת הָאָרֶץ</div>“In the beginning God created the heavens and the earth.” Every word in this verse is a cornerstone of the Old Testament.",
   "<h4>How to read it</h4>Right to left. The small circle <b>ְ</b> (shva) is a light “uh” vowel; the horizontal line <b>ַ</b> is “a.” Tap any word in a verse study to open its full breakdown."],
 [ M([['w-heb-elohim','God'],['w-heb-bara','created'],['w-heb-shamayim','heavens'],['w-heb-aretz','earth'],['w-heb-reshit','beginning']]),
   BD('“God created the heavens and the earth”',['w-heb-elohim','w-heb-bara','w-heb-shamayim','w-heb-ve','w-heb-aretz'],['w-heb-or','w-heb-tob','w-heb-et']),
   MC('בָּרָא — how is this word parsed?',['Qal perfect, 3rd person masculine singular (“he created”)','Qal imperfect, 1st person (“I create”)','Piel perfect, 3rd feminine (“she created”)','Niphal perfect, 3rd masculine (“he was created”)'],0,'בָּרָא is Qal perfect 3ms — the completed action: “he created.”', 'w-heb-bara'),
   LS('w-heb-elohim',['w-heb-elohim','w-heb-adam','w-heb-or'],'That was אֱלֹהִים — “Elohim.”'),
   MC('What job does אֵת do in this verse?',['It marks the definite direct object','It means “and”','It negates the sentence','It makes a word plural'],0,'אֵת flags a definite object: God created THE heavens and THE earth. Aramaic does the same with יָת (yat).','w-heb-et'),
   MC('שָׁמַיִם (“heavens”) is unusual because it is…',['a dual form','always plural','feminine','never written with niqqud'],0,'A dual — like “two heavens” (the sky-firmament and the abode of God). Same with מַיִם (waters) and יָדַי (my hands).','w-heb-shamayim') ]),

L('heb-v2','heb','vocab','🕯️','Light & Voice','Genesis 1:3 — God speaks',
 [ "<h4>וַיֹּאמֶר אֱלֹהִים יְהִי אוֹר</h4><div class='ex'>וַיֹּאמֶר אֱלֹהִים יְהִי אוֹר וַיְהִי־אוֹר</div>“And God said, Let there be light: and there was light.” Creation happens by speech — the same idea as John 1:1 and Romans 10:8.",
   "<h4>Two verb tenses</h4>Hebrew verbs come in two great families: <b>perfect</b> (completed) and <b>imperfect</b> (incomplete). יְהִי “let there be” is a <b>jussive</b> — a short imperfect meaning “may it be!”"],
 [ M([['w-heb-or','light'],['w-heb-choshekh','darkness'],['w-heb-yom','day'],['w-heb-laylah','night'],['w-heb-tob','good']]),
   BD('“Let there be light”',['w-heb-hayah','w-heb-or'],['w-heb-amar','w-heb-elohim','w-heb-choshekh']),
   MC('וַיֹּאמֶר — the prefix וַ- before a verb marks…',['waw-consecutive (narrative “and he said”)','negation','the plural','a question'],0,'The narrative waw: וַ- + imperfect = “and he did…” — the engine of Hebrew storytelling.','w-heb-amar'),
   MC('Which word means “good”?',['טוֹב (tov)','אוֹר (or)','יוֹם (yom)','לֹא (lo)'],0,'טוֹב — “and God saw that it was good” is repeated through the creation week.','w-heb-tob'),
   LS('w-heb-or',['w-heb-or','w-heb-yom','w-heb-aretz'],'That was אוֹר — “light.”') ]),

L('heb-g1','heb','grammar','🧱','Nouns: Gender & Number','Feminine, masculine, and the dual',
 [ "<h4>Two genders</h4>Hebrew nouns are <b>masculine</b> or <b>feminine</b>. Most feminine singulars end in <b>-ah</b> (אֶרֶץ… cf. צְדָקָה), most masculine plurals in <b>-im</b> (אֲדָמִים).",
   "<h4>The dual</h4>Pairs get a special form: <b>-ayim</b> (שָׁמַיִם heavens, יָדַי my two hands, חַיִּים life)."],
 [ MC('שָׁמַיִם (heavens) is which number?',['Dual','Singular','Plural','Collective'],0,'The ending -ayim marks the dual.','w-heb-shamayim'),
   MC('Which of these is feminine singular?',['אֶרֶץ (earth)','שָׁמַיִם (heavens)','חַיִּים (life)','מַיִם (waters)'],0,'אֶרֶץ is feminine singular — one of the most common feminine nouns in the OT.','w-heb-aretz'),
   M([['w-heb-elohim','masc. plural'],['w-heb-aretz','fem. singular'],['w-heb-shamayim','masc. dual'],['w-heb-mayim','masc. dual'],['w-heb-adam','masc. singular'],['w-heb-emunah','fem. singular']]),
   TY('The common feminine plural ending is “-ot”. What is the common <b>masculine</b> plural ending? (letters only)',['im','ים'],'im') ]),

L('heb-g2','heb','grammar','⚖️','Verbs: Two Aspects','Perfect vs imperfect',
 [ "<h4>Completed vs incomplete</h4>Hebrew verbs split into <b>perfect</b> (qatal — completed, e.g. בָּרָא “he created”) and <b>imperfect</b> (yiqtol — incomplete, e.g. יִחְיֶה “he shall live”).",
   "<h4>Who is acting?</h4>Person + gender + number live in the endings: -ā (3ms), -îm (3mp), -î (1cs), -t (2ms), -t (2fs)…"],
 [ MC('יִחְיֶה — how is it parsed?',['Qal imperfect, 3rd masculine singular','Qal perfect, 3rd masculine singular','Qal imperfect, 1st common singular','Piel perfect, 3rd feminine singular'],0,'יִ-חְ-יֶ-ה = imperfect 3ms: “he shall live” (Hab 2:4).','w-heb-chayah'),
   MC('Which is the 1st person common singular imperfect (“I…”)?',['אֶחְסָר (I lack)','יִחְיֶה (he lives)','בָּרָא (he created)','תִּמְלֹא (she is filled)'],0,'אֶ-חְסָר = “I shall lack” — the psalmist’s word in Ps 23:1.','w-heb-chasar'),
   MC('בָּרָא — the stem “qal” means…',['simple, basic action','intensive/action on self','causing to happen','being acted upon'],0,'Qal is the simple active stem — the default: “he created.”','w-heb-bara'),
   MC('The form וַיְהִי (and there was) is…',['imperfect with narrative waw','perfect with conjunction','jussive','participle'],0,'וַ- + imperfect = narrative past: “and there was.”','w-heb-hayah') ]),

/* ================= KOINE GREEK ================= */

L('heb-v3','heb','vocab','🌊','Chaos & Spirit','Genesis 1:2 — the first theodrama',
 [ "<h4>וְהָאָרֶץ הָיְתָה תֹהוּ וָבֹהוּ</h4><div class='ex'>וְהָאָרֶץ הָיְתָה תֹהוּ וָבֹהוּ וְחֹשֶׁךְ עַל־פְּנֵי תְהוֹם וְרוּחַ אֱלֹהִים מְרַחֶפֶת עַל־פְּנֵי הַמָּיִם</div>“And the earth was without form and void; and darkness was upon the face of the deep. And the Spirit of God moved upon the face of the waters.” Verse 2 of the Bible — chaos, darkness, deep — and then, the hovering Spirit.",
   "<h4>A duet</h4>תֹהוּ (tohu, “formless”) and בֹהוּ (bohu, “void”) are a famous pair — <b>tohu wabohu</b>. The LXX splits them into two Greek adjectives: ἀόρμος (“without form”) and κενή (“empty”) — the same picture, two tongues."],
 [ M([['w-heb-tohu','formless'],['w-heb-bohu','void'],['w-heb-tehom','the deep'],['w-heb-choshekh','darkness'],['w-heb-ruach','spirit'],['w-heb-mayim','waters']]),
   MC('The pair תֹהוּ וָבֹהוּ means…',['without form and void','heaven and earth','light and darkness','king and priest'],0,'tohu wabohu — “formless and void.” The LXX says ἀόρμος καὶ κενή — “without form and empty.”','w-heb-tohu'),
   MC('מְרַחֶפֶת (merachefet) — “the Spirit …”',['hovers (Piel participle)','created (Qal perfect)','slept (Qal imperfect)','spoke (Piel participle)'],0,'Piel participle of רִחַף “to hover, skim” — once in all the OT, and the LXX matches it with ἐπεράζε “skimmeth.”','w-heb-rachaph'),
   MC('Which word does the LXX render as ἄβυσσος (“the abyss”)?',['t’ehom “the deep”','tohu “formless”','mayim “waters”','ruach “spirit”'],0,'t’ehom, “the deep,” is what the LXX calls ἄβυσσος — the word quoted again in Rom 10:9.','w-heb-tehom'),
   LS('w-heb-rachaph',['w-heb-rachaph','w-heb-bara','w-heb-ruach'],'That was מְרַחֶפֶת — the Spirit hovering, like a bird skimming the water.'),
   BD('“and the Spirit of God hovered”',['w-heb-ruach','w-heb-elohim','w-heb-rachaph'],['w-heb-or','w-heb-tohu','w-heb-tob']),
   VER('v-heb-gen-1-2'),
   TREE('v-heb-gen-1-2') ]),

L('heb-v4','heb','vocab','🐑','The Shepherd’s Song','Psalm 23 — the verb chain of care',
 [ "<h4>יְהוָה רֹעִי</h4><div class='ex'>יְהוָה רֹעִי לֹא אֶחְסָר · בִּנְאוֹת דֶּשֶׁא יַרְבִּיצֵנִי עַל־מֵימֵי מְנֻחוֹת יְנַחֵנִי · נַפְשִׁי יְשׁוֹבְבֶן מַעְגְּלֵי צֶדֶק יַנְחֵנִי לְמַעַן שְׁמוֹ</div>“The LORD is my shepherd; I shall not want. He maketh me to lie down in green pastures: he leadeth me beside the still waters. He restoreth my soul: he leadeth me in the paths of righteousness for his name’s sake.”",
   "<h4>Five Shepherd actions</h4>He <b>is</b> (יְהוָה רֹעִי), he <b>makes lie down</b> (יַרְבִּיצֵנִי), he <b>leads</b> (יְנַחֵנִי), he <b>restores</b> (יְשׁוֹבְבֶן), he <b>guides</b> (יַנְחֵנִי). The psalm is a chain of verbs — a whole theology of care."],
 [ M([['w-heb-roeh','shepherd (my)'],['w-heb-naot','pastures'],['w-heb-deshav','green grass'],['w-heb-rabats','he makes me lie down'],['w-heb-menuchah','still waters'],['w-heb-naphash','my soul']]),
   MC('יַרְבִּיצֵנִי is…',['Hiphil imperfect 3ms with 1sg suffix (“he makes ME lie down”)','Qal perfect 1cs','Piel passive','Pual participle'],0,'Hiphil is the causative stem: “he causes ME (‑enî) to lie down.” The shepherd does the making.','w-heb-rabats'),
   MC('צֶדֶק (tsedeq) and the familiar צְדָקָה (tsedeqah) are…',['two abstracts of the same root צדק (righteousness)','unrelated roots','the same word, misspelled','a noun and its verb'],0,'Both from the root צדק: tsedeq, the masculine abstract; tsedeqah, the feminine — one root, two abstracts.','w-heb-tsedeq'),
   MC('לְמַעַן שְׁמוֹ — “for his name’s sake” — the name here means…',['God’s honor and presence','a secret code word','the psalmist’s name','a list of God’s titles'],0,'The shem of God is his honored presence. The shepherd works for the name’s sake — covenant signature on the care.','w-heb-shem'),
   LS('w-heb-naphash',['w-heb-naphash','w-heb-ruach','w-heb-or'],'That was נַפְשִׁי — “my soul.”'),
   BD('“he leadeth me beside the still waters”',['w-heb-nachah','w-heb-al','w-heb-mayim','w-heb-menuchah'],['w-heb-naot','w-heb-or','w-heb-tob']),
   VER('v-heb-ps-23-2') ]),
L('grc-alph','grc-nt','alphabet','Ω','Script & Alphabet','24 letters + accents',
 [ "<h4>24 letters</h4>Greek reads left to right. The NT is written in a 24-letter alphabet — many of its letters came to us via Greek.",
   "<h4>Two vowels per sound</h4>α and ο are “short”; ε → ει (long e), ο → ω (long o), ι → υ (y/i). In New Testament Greek, <b>η</b> says long “e.”",
   "<h4>Accents & breathings</h4>The <b>rough breathing</b> (῾) marks the “h” of θ, φ, χ… wait — of <b>initial h-sounds</b> (θεός has one). The <b>acute</b> (´), <b>grave</b> (`) and <b>circumflex</b> (ˆ) mark the stressed syllable."],
 [ M([['gr-alpha','alpha'],['gr-beta','beta'],['gr-gamma','gamma'],['gr-sigma','sigma'],['gr-omega','omega'],['gr-theta','theta']]),
   MC('How many letters are in the Greek alphabet?',['24','22','26','20'],0,'24 — from alpha to omega.'),
   MC('At the <b>end</b> of a word, sigma looks like…',['ς','σ','Σ','ξ'],0,'Final sigma (ς) — that’s why ἦν ends “-ν” with a smooth last sigma… (σ mid-word, ς final).'),
   TY('Type the name of this letter:  λ',['lambda'],'lambda'),
   MC('θεός carries a rough breathing at the start. It marks…',['an “h” sound (th in “theos”)','stress on the last syllable','a long vowel','negation'],0,'The rough breathing is the ancient “h” — θεός was once pronounced like “théos.”'),
   MC('Which letter says the “ph” in “phone” / “Philip” / “phos”?',['φ (phi)','θ (theta)','χ (chi)','ψ (psi)'],0,'φ = ph — light, phōs, Philip, philosophy all begin with it.') ]),

L('grc-v1','grc-nt','vocab','Λ','The Word','John 1:1 in Koine',
 [ "<h4>Ἐν ἀρχῇ ἦν ὁ λόγος</h4><div class='ex'>Ἐν ἀρχῇ ἦν ὁ λόγος, καὶ ὁ λόγος ἦν πρὸς τὸν θεόν, καὶ θεὸς ἦν ὁ λόγος.</div>“In the beginning was the Word, and the Word was with God, and the Word was God.” The most grammar-packed sentence in the NT — and the LXX’s opening of Genesis 1:1 is the same template: ἐν ἀρχῇ.",
   "<h4>Watch the article</h4>ὁ/τὸν = “the” (masc.). Its absence is meaningful: the final θεός has NO article — it predicates a quality: “<i>divine</i> was the Word.”"],
 [ M([['w-grc-logos','word'],['w-grc-theos','God'],['w-grc-archi','beginning'],['w-grc-eimi','to be'],['w-grc-kai','and']]),
   BD('“In the beginning was the Word”',['w-grc-en','w-grc-archi','w-grc-eimi','w-grc-logos'],['w-grc-theos','w-grc-pros','w-grc-kai']),
   BD('“the Word was God”',['w-grc-logos','w-grc-eimi','w-grc-theos'],['w-grc-art-ho','w-grc-art-ton']),
   MC('In “θεὸς ἦν ὁ λόγος,” the final θεός has no article. This expresses…',['a predicate quality (“God was the Word”)','a definite subject','a vocative (“O God”)','a genitive'],0,'Without the article, θεός describes WHAT the Word was — divine in nature. Compare “Moses was a prophet” (anarthrous) in John 1:21.','w-grc-theos'),
   LS('w-grc-logos',['w-grc-logos','w-grc-theos','w-grc-phos'],'That was λόγος — “the Word.”'),
   MC('ἀρχή (beginning) is the LXX’s rendering of Hebrew…',['בְּרֵאשִׁית (bereshit)','דָּבָר (davar)','אוֹר (or)','רֹאשׁ (rosh)'],0,'LXX Gen 1:1 = ἐν ἀρχῇ ἐποίησεν ὁ θεός… — the same “in the beginning” as the Hebrew.' ) ]),

L('grc-v2','grc-nt','vocab','💗','The Love','John 3:16 in Koine',
 [ "<h4>ὅτι οὕτως ἠγάπησεν ὁ θεὸς τὸν κόσμον</h4><div class='ex'>ὅτι οὕτως ἠγάπησεν ὁ θεὸς τὸν κόσμον, ὥστε τὸν υἱὸν αὐτοῦ τὸν μονογενῆ δώσειν…</div>“For God so loved the world, that he gave his only begotten Son…”",
   "<h4>Three special verb forms</h4>ἠγάπησεν = <b>aorist</b> (simple past). δώσειν = <b>aorist infinitive</b> (“to give”). πιστεύων = <b>present participle</b> (“believing”) — the NT loves its participles."],
 [ M([['w-grc-hagapeo','to love'],['w-grc-kosmos','world'],['w-grc-huios','son'],['w-grc-pisteuo','to believe'],['w-grc-zoe','life']]),
   BD('“God so loved the world”',['w-grc-theos','w-grc-hagapeo','w-grc-kosmos'],['w-grc-art-ho','w-grc-zoe','w-grc-kai']),
   MC('ἠγάπησεν is which tense of ἀγαπάω?',['Aorist (“loved” — a single complete act)','Present (“loves”)','Imperfect (“was loving”)','Future (“will love”)'],0,'Aorist indicative 3sg — the completed act of love that triggers everything else in the verse.','w-grc-hagapeo'),
   MC('πιστεύων (“believing”) is a…',['present active participle','aorist infinitive','perfect passive verb','present subjunctive'],0,'A participle — a verb acting as an adjective: “everyone believing” = “everyone who believes.”','w-grc-pisteuo'),
   MC('δώσειν in this verse means…',['“to give” (aorist infinitive)','“given” (past)','“giving now” (present)','“he will give” (future)'],0,'Aorist active infinitive after ὥστε — “so that… to give.”','w-grc-didomi') ]),

L('grc-g1','grc-nt','grammar','📐','Nouns & Cases','Five cases, endings tell',
 [ "<h4>Cases, not prepositions</h4>Greek marks a noun’s role with its <b>ending</b>: nominative (subject), genitive (of), dative (to/with), accusative (direct object), vocative (O…).",
   "<h4>Two big declensions</h4>1st declension (mostly -ης, feminine): ἀρχή → ἀρχῇ (dat.), ἀρχήν (acc.). 2nd declension (-ος, m/n): λόγος → λόγου (gen.), λόγῳ (dat.), λόγον (acc.)."],
 [ MC('ἀρχῇ (in John 1:1) is which case?',['Dative','Accusative','Genitive','Nominative'],0,'-ῃ marks the dative of 1st-declension feminine nouns — “in the beginning.”','w-grc-archi'),
   MC('θεόν (in “with God”) is which case?',['Accusative','Nominative','Dative','Vocative'],0,'-όν after πρὸς: the preposition πρὸς takes the accusative.','w-grc-theos'),
   MC('Which case does the preposition εἰς take?',['Accusative','Dative','Genitive','Ablative'],0,'εἰς + acc. = “into / toward.” “Believe IN him” = εἰς αὐτόν.','w-grc-eis'),
   M([['w-grc-logos','nominative: λόγος'],['w-grc-kosmos','accusative: κόσμον'],['w-grc-archi','dative: ἀρχῇ'],['w-grc-hemera','genitive: ἡμέρας']]),
   MC('Which of these is a vocative (direct address)?',['Πατέρα (O Father!)','ἡ ἡμέρα (the day)','τὸ πνεῦμα (the spirit)','ἐν ἀρχῇ (in the beginning)'],0,'The vocative is for calling someone: Πατέρα — as in “Pater noster” = Πατὴρ ἡμῶν, “O our Father.”') ]),

L('grc-g2','grc-nt','grammar','⏳','Verbs & Tenses','Aspect, not just time',
 [ "<h4>Greek verbs encode aspect</h4><b>Present</b> = ongoing (ἔχω “I have/am holding”), <b>aorist</b> = simple completed act (ἠγάπησεν “loved”), <b>imperfect</b> = ongoing in the past (ἦν “was being”), <b>perfect</b> = completed with lasting results.",
   "<h4>Moods</h4>Indicative states facts (ἦν “was”), subjunctive aims at the unknown (ἔχῃ “may have” — purpose clauses), infinitive is the “verb as noun” (δώσειν “to give”)."],
 [ MC('ἦν in John 1:1 is the…',['imperfect of εἰμί (“was” — ongoing state)','aorist of εἰμί','perfect of εἰμί','present of γίνομαι'],0,'Imperfect 3sg: continuous being — “the Word WAS (continually) God.”','w-grc-eimi'),
   MC('ἔχῃ in John 3:16 is which mood?',['Present subjunctive (“may have”)','Present indicative','Aorist indicative','Perfect subjunctive'],0,'Subjunctive of purpose: “that he MAY HAVE eternal life.”','w-grc-echo'),
   MC('Which word is a participle?',['πιστεύων','ἔπεσεν','δώσειν','ἦν'],0,'-ων marks the present active participle: “believing.”','w-grc-pisteuo'),
   MC('δώσειν is…',['an aorist infinitive (“to give”)','a present participle','an aorist imperative','a perfect verb'],0,'The -σειν ending: aorist active infinitive.') ]),

/* ================= ARAMAIC ================= */

L('grc-v3','grc-nt','vocab','☀️','Light of the World','Matthew 5:14 & John 1:5',
 [ "<h4>ὑμεῖς ἐσθέ τὸ φῶς</h4><div class='ex'>ὑμεῖς ἐσθέ τὸ φῶς τοῦ κόσμου · τὸ φῶς ἐν τῇ σκοτίᾳ λαμπέι· καὶ ἡ σκοτία αὐτὸ οὐ κατέλαβεν</div>“Ye are the light of the world” (Matt 5:14). And John’s prologue: “And the light shineth in darkness; and the darkness comprehended it not” (Jhn 1:5). One light, two witnesses.",
   "<h4>Articles do the work</h4>τὸ φῶς — “THE light.” The Greek article (ὁ / ἡ / τό) does the work of English “the”; drop it, and the verse loses its weight."],
 [ M([['w-grc-hymeis','you (pl.)'],['w-grc-este','you are'],['w-grc-phos','light'],['w-grc-kosmos','world'],['w-grc-skotia','darkness'],['w-grc-lampo','it shines']]),
   MC('ὑμεῖς ἐσθέ — “you are” — is which person and number?',['2nd person plural','1st person singular','3rd person plural','2nd person singular'],0,'hymeis esté — the “you” of the Sermon on the Mount. An identity call: you ARE light.','w-grc-este'),
   MC('In “τὸ φῶς τοῦ κόσμου,” τοῦ is…',['the genitive article (“of the”)','a noun meaning “head”','a 2nd-person pronoun','an adverb (“now”)'],0,'tou is the genitive of the article: “light OF the world.”','w-grc-tou'),
   MC('οὐ κατέλαβεν — “comprehended it not” — the negation οὐ…',['negates indicative statements (cf. Hebrew lōʾ, Latin non)','negates subjunctives (that is mē)','is a preposition “outside”','is an interjection “oh”'],0,'ou is the “not” of statements — kin of Hebrew lōʾ and Latin non. (mē belongs to subjunctive moods.)','w-grc-ou'),
   LS('w-grc-lampo',['w-grc-lampo','w-grc-kosmos','w-grc-phos'],'That was λαμπέι — “it shines.”'),
   BD('“and the darkness comprehended it not”',['w-grc-kai','w-grc-e','w-grc-skotia','w-grc-auto','w-grc-ou','w-grc-katalaben'],['w-grc-phos','w-grc-este','w-grc-hymeis']),
   VER('v-grc-mat-5-14'),
   VER('v-grc-jhn-1-5') ]),
L('arc-alph','arc','alphabet','א','Script & Alphabet','The square script',
 [ "<h4>One script, two languages</h4>Biblical Aramaic uses the <b>square script</b> — the same letter shapes as Hebrew, written right to left. The difference is in <i>names</i> and a few words: aleph is called “elyph,” shin is “shin,” tav is “taw.”",
   "<h4>Where it lives in the Bible</h4>Native Aramaic appears in Daniel 2:4b–7:28 and Ezra 4:8–6:18 — plus the Aramaic words of Jesus himself in the Gospels."],
 [ M([['ar-elyph','ox'],['ar-beth','house'],['ar-resh','head'],['ar-taw','mark'],['ar-ʿeyn','eye'],['ar-pe','mouth']]),
   MC('Aramaic shares its letter SHAPES with which language?',['Hebrew','Koine Greek','Latin','Punic'],0,'The square (Aramaic) script is exactly what Hebrew adopted — so the two look almost identical on the page.'),
   MC('Which is the Aramaic name of the letter ת?',['taw','tav','teth','taw? no—taw'],0,'In Aramaic it’s “taw”; Hebrew calls it “tav.”'),
   TY('Type the Aramaic name of א',['elyph','aleph'],'elyph'),
   MC('How many letters does the Aramaic alphabet have?',['22','24','26','20'],0,'22 — identical count to Hebrew.') ]),

L('arc-v1','arc','vocab','✝️','The Words of Jesus','Aramaic phrasebook',
 [ "<h4>Jesus spoke Aramaic</h4>The Gospels record Jesus in Aramaic several times — and the Greek text keeps the original sound, untranslated. This phrasebook is the smallest and most precious corner of the Aramaic module.",
   "<h4>Six moments</h4>Mark 5:41 (Talitha koum) · Mark 7:34 (Pethora) · Mark 15:34 (Eli, Eli…) · Mark 14:36 (Abba) · Mark 14:39 (Shta) — the voice beneath the Greek."],
 [ M([['w-arc-talitha','little girl'],['w-arc-qum','arise!'],['w-arc-lemah','why'],['w-arc-abba','father'],['w-arc-ptach','open!'],['w-arc-shta','immediately']]),
   BD('“My God, my God, why have you forsaken me?”',['w-arc-eli','w-arc-eli','w-arc-lemah','w-arc-shavaktni'],['w-arc-abba','w-arc-qum','w-arc-shta']),
   MC('“Talitha koum” (Mark 5:41) means…',['“Little girl, arise!”','“Peace be with you”','“I have fasted forty days”','“Open the door”'],0,'טַלִּיתָא = “little girl” (diminutive of טַלְיָא “little one”); קוּם = “arise!”','w-arc-talitha'),
   MC('Jesus says one Aramaic word to the deaf-mute in Mark 7:34. Which?',['Pethora (Open!)','Talitha (Little girl)','Abba (Father)','Shema (Hear)'],0,'The Greek text preserves it as the strange 9-letter string πεθαθγραμθα — read as פֵּתַח, “open!”','w-arc-ptach'),
   LS('w-arc-abba',['w-arc-abba','w-arc-lemah','w-arc-talitha'],'That was אַבָּא — “Abba,” intimate for “Father.”'),
   MC('“Eli, Eli, lema sabachthani” is the Aramaic of…',['Psalm 22:1 at the cross','the prayer of Solomon','Ezra 4:6','Daniel 2:4'],0,'The cry of the cross — Mark keeps it in Aramaic idiom; Matthew’s ΕΛΟΙ is closer to the Hebrew אֱלֹהִי.','w-arc-eli') ]),

L('arc-g1','arc','grammar','🏛️','Aramaic of the Bible','Daniel 2 & the suffixes',
 [ "<h4>Where Aramaic is native</h4>Bible Aramaic is not a translation — it’s the court language of Babylon: Daniel 2:4b–7:28, the letters of Ezra 4:8–6:18, and a phrase in Ezra 7.",
   "<h4>Absolute state + suffixes</h4>An Aramaic noun stands “absolute” (malkā = “king”), then takes pronominal endings: malkā<sub>kh</sub> = “your (m.) king,” malkān = “my king.” Daniel 2:4 ends מִלִּיךְ — “O king!” (by you, king)."],
 [ MC('Daniel switches from Hebrew to Aramaic at…',['2:4','7:28','4:1','12:4'],0,'Daniel 2:4 begins “Aramaic! (ʼaramāyā)” — and stays in Aramaic until 7:28.'),
   MC('What does אֲרַמַיָּא mean?',['“Aramaic (is being spoken)!”','“The Aramaic people”','“We are Aramaic”','“Aram, the land”'],0,'It flags the language switch — “(From here on) Aramaic!”','w-arc-aramayya'),
   MC('מִלִּיךְ (“O king”) is built from…',['malkā + 2ms suffix','malkā + 1cs suffix','malkā + 3mp suffix','malk + article'],0,'מַלְכָּא “king” + the 2ms possessive = “(O) king (of yours)” — the royal address.','w-arc-milikh'),
   MC('פִּשְׁרָא is an Aramaic word that means…',['“interpretation”','“dream”','“exile”','“kingdom”'],0,'“Interpretation” — its ancestor is the Hebrew פָּשָׁר used in Ps 78:2 and Ps 119:116.','w-arc-pishratam') ]),

/* ================= LATIN (VULGATE) ================= */

L('arc-v2','arc','vocab','👑','King & Kingdom','Daniel 2:44 — the court’s Aramaic',
 [ "<h4>מַלְכָּא → מַלְכוּתָא</h4><div class='ex'>וּבִזְמַן מַלְכֵי יִיחַד אֱלָהָא דִשְׁמַיָּא מַלְכוּתָא וְלָא תִפְרֵץ לְעָלְמָא</div>“And in the days of these kings shall the God of heaven set up a kingdom, which shall never be destroyed.” The Aramaic of the royal court — and the word behind “thy kingdom come.”",
   "<h4>King → Kingdom</h4>malkā (“king”) + a feminine ending = malkhūtā (“kingdom”). One root (מלק) builds both words. In Daniel’s vision the kings of the world share the stage — and the God of heaven brings ONE kingdom."],
 [ M([['w-arc-malka','king'],['w-arc-malkhuta','kingdom'],['w-arc-elaha','God'],['w-arc-shamaya','heaven'],['w-arc-bizman','in the time of'],['w-arc-lelama','forever']]),
   MC('מַלְכוּתָא (“kingdom”) is built from…',['the root מלק (“king”) + a feminine ending','the word šamaya (“heaven”)','a separate root meaning “reign”','the Hebrew word for “city”'],0,'malkā (king) → malkhūtā (kingdom): same root, one ending. “Thy kingdom come” is Aramaic malkhūtkā.','w-arc-malkhuta'),
   MC('דִּי (dī) in “אֱלָהָא דִשְׁמַיָּא” means…',['of (“the God of heaven”)','and','not','therefore'],0,'dī is Aramaic’s possessive/relative particle — “the God OF heaven,” “a kingdom THAT …”','w-arc-di'),
   MC('יִיחַד (yiḥaḏ) — “shall set up” — is from…',['יָחַד “to be one, to join”','מָלַךְ “to reign”','יָשַׁב “to sit”','יָדַע “to know”'],0,'“Set up a kingdom” literally means “make one / join”: the kingdom of God is a making-one.','w-arc-yikhud'),
   MC('וְלָא תִפְרֵץ — “which shall not be destroyed” — the negation לָא is…',['the Aramaic “not” (kin of Hebrew lōʾ)','a preposition “to”','the word “no,” used only in oaths','a relative particle'],0,'lā — the Aramaic “not.” The kingdom that shall not be broken: forever, lelama.','w-arc-lo'),
   BD('“the God of heaven set up a kingdom”',['w-arc-elaha','w-arc-di','w-arc-shamaya','w-arc-yikhud','w-arc-malkhuta'],['w-arc-bizman','w-arc-malka','w-arc-we']),
   VER('v-arc-dan-2-44'),
   TREE('v-arc-dan-2-44') ]),
L('lat-alph','lat','alphabet','✠','Script & Alphabet','Church Latin sounds',
 [ "<h4>One alphabet, one pronunciation</h4>The Latin alphabet is the one your keyboard uses. Ecclesiastical (Church) Latin has a few rules that make it sound Italian-adjacent.",
   "<h4>The sound rules</h4><b>c</b> before e/i = “ch” (centum → CHENT-um). <b>v</b> = “w” (Vulgate → WUL-gate). <b>h</b> is always silent. Double consonants are both pronounced (pāscit → PAAS-chit)."],
 [ M([['la-c','k / ch'],['la-v','w'],['la-h','silent'],['la-x','ks'],['la-z','ts'],['la-q','k (before u)']]),
   MC('In “centum,” the c says…',['“ch” (tʃ)','“k”','“s”','nothing'],0,'Before e/i, c softens to “ch” — the same rule you already know from English “century.”'),
   MC('The letter v in Church Latin sounds like…',['w','v (as in “very”)','f','b'],0,'V is pronounced “w” — VERBUM is chanted “ver-boom.” That is the Church-Latin ear.','w-lat-verbum'),
   TY('Type the Latin letter that is ALWAYS silent in ecclesiastical pronunciation',['h'],'h'),
   MC('Which word keeps its consonant cluster tight in Church Latin?',['pāscit (paas-chit)','vita (VEE-ta)','lux (LOOKS)','pax (PAKS)'],0,'pāscit — the sc cluster plus the long ā: “PAAS-chit.” Church Latin keeps its clusters and doubles sounded.') ]),

L('lat-v1','lat','vocab','📜','The Beginning','John 1:1 in Vulgate Latin',
 [ "<h4>IN PRINCIPIO ERAT VERBUM</h4><div class='ex'>In principio erat verbum, et verbum erat apud Deum, et Deus erat verbum.</div>Jerome’s Vulgate — the Bible of the Latin West for 1,500 years. Note: it says <b>“the Word was with (apud) God”</b>, and the final <b>Deus</b> has no article — Latin has none at all.",
   "<h4>Word order</h4>Latin puts the verb where it wants: <i>creāvit Deus caelum et terram</i> (“created God heaven and earth” — subject last, weight on the object)."],
 [ M([['w-lat-verbum','word'],['w-lat-deus','God'],['w-lat-principium','beginning'],['w-lat-sum','to be (was)'],['w-lat-apud','with']]),
   BD('“In the beginning was the Word”',['w-lat-in','w-lat-principium','w-lat-sum','w-lat-verbum'],['w-lat-deus','w-lat-et','w-lat-apud']),
   MC('PRINCIPIO is in which case?',['Ablative','Accusative','Genitive','Nominative'],0,'The ablative of prīncipium — Latin marks “in the beginning” with the case, not a separate preposition word… (in + ablative here).','w-lat-principium'),
   MC('“The Word was with God” uses which preposition for “with”?',['apud (+ acc.)','in (+ abl.)','ab (+ abl.)','per (+ acc.)'],0,'APUD DEUM — apud + accusative = “in the company of.” Jerome’s exact word for πρὸς τὸν θεόν.','w-lat-apud'),
   LS('w-lat-verbum',['w-lat-verbum','w-lat-lux','w-lat-pax'],'That was VERBUM — “the Word.”') ]),

L('lat-v2','lat','vocab','💗','The Love','John 3:16 in Vulgate Latin',
 [ "<h4>SIC ENIM DILEXIT DEUS MUNDUM</h4><div class='ex'>Sic enim dilexit Deus mundum, ut Filium suum unigenitum dedit, ut omnis qui credit in eum non pereat, sed habeat vitam aeternam.</div>“For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.”",
   "<h4>ut … -et</h4>The purpose clause is the Latin signature: <b>ut</b> + subjunctive. <i>ut non pereat, sed habeat</i> — “that he may not perish, but may have.”"],
 [ M([['w-lat-diligo','loved'],['w-lat-mundus','world'],['w-lat-filius','son'],['w-lat-credo','believes'],['w-lat-vita','life'],['w-lat-aeternus','eternal']]),
   BD('“he gave his only begotten Son”',['w-lat-dare','w-lat-suus','w-lat-unigenitus','w-lat-filius'],['w-lat-diligo','w-lat-mundus','w-lat-et']),
   MC('CREDIT (whosoever believeth) is which form?',['Perfect with present force','Present indicative','Aorist','Future'],0,'The Latin perfect can read as present: “whosoever believeth.” (Jerome’s rendering of πιστεύων.)','w-lat-credo'),
   MC('PEREAT and HABEAT are…',['present subjunctives of purpose (after ut)','perfect verbs','imperfects','infinitives'],0,'ut … non pereat, sed habeat — “that he may not perish, but may have.” The subjunctive marks purpose.','w-lat-perire'),
   MC('AETERNAM agrees with which word?',['vitam (fem. acc. sg.)','filius (masc. nom.)','mundum (masc. acc.)','Deus (masc. nom.)'],0,'aeternam = feminine accusative singular — it dresses up vitam like a matching adjective.') ]),

L('lat-g1','lat','grammar','📐','Cases & Tenses','From Psalm 23 & John 1',
 [ "<h4>Cases carry the sentence</h4><b>DEUS</b> (nom.) does the loving; <b>MUNDUM</b> (acc.) is loved; <b>PRINCIPIO</b> (abl.) is “in the beginning”; <b>DEUM</b> (acc.) is who the Word was with. The ending tells you the job.",
   "<h4>Three tenses to start</h4>Present (pāscit “he shepherds” — now, continually), imperfect (erat “was”), perfect (creāvit “he created” — once, done), future (deerit “shall be lacking”)."],
 [ MC('DEUM (John 1:1) is which case?',['Accusative','Nominative','Ablative','Genitive'],0,'-um marks the masculine/neuter accusative of the 2nd declension — “the Word was with GOD.”','w-lat-deus'),
   MC('PASCIT in “Dominus pascit me” is…',['present indicative 3sg (“he shepherds”)','perfect 3sg','future 3sg','imperfect 3sg'],0,'Present, 3sg — the Shepherd’s care is ongoing: “The LORD shepherds me (now, always).”','w-lat-pascere'),
   MC('DEERIT (“I shall not want”) is which tense?',['Future','Perfect','Present','Imperfect'],0,'Future of dēesse: “it shall be lacking.” The Shepherd’s promise is forward-looking.','w-lat-deesse'),
   MC('AETERNAM (John 3:16) is…',['feminine accusative singular','masculine nominative singular','neuter ablative','feminine genitive'],0,'It must match vitam: fem. acc. sg. — “eternal life” = vitam aeternam.') ]),

L('lat-v3','lat','vocab','🐏','The Shepherd','Psalm 23:2 in the Vulgate',
 [ "<h4>IN PASCUIS … PASCET</h4><div class='ex'>In pascuis, ubi habitat me, pascet; super aquam quietis, ibi me convertet.</div>“He maketh me to lie down in green pastures: he leadeth me beside the still waters.” The shepherd-verb appears twice — pascuus (pastures) and pascet (he shall feed) — from one root, pāscere.",
   "<h4>Adverbs place the scene</h4>UBI (“where”) opens the first clause; IBI (“there”) opens the second. One adverb pair draws the whole picture: WHERE he makes me dwell, THERE he refreshes me."],
 [ M([['w-lat-pascuus','pastures'],['w-lat-ubi','where'],['w-lat-habitat','he dwells'],['w-lat-pascet','he shall feed'],['w-lat-super','upon; beside'],['w-lat-convertet','he shall refresh']]),
   MC('PASCUIS (“in green pastures”) is…',['ablative plural of pāscuus','nominative singular','accusative plural','genitive singular'],0,'-is marks the ablative plural — the case of location: “IN pastures.”','w-lat-pascuus'),
   MC('PASCET (“he shall feed”) is which tense?',['future (the -et ending)','present','perfect','imperfect'],0,'pāscet — future 3sg: the shepherd’s promise looks forward.','w-lat-pascet'),
   MC('UBI and IBI are…',['adverbs: “where” and “there”','prepositions','nouns (“water,” “rest”)','conjunctions'],0,'ubi = where (the place in question); ibi = there (that place). Two little words carry the whole scene.','w-lat-ubi'),
   MC('QUIETIS (“of stillness”) is which case?',['genitive','ablative','accusative','dative'],0,'quiētis is the genitive of quietēs “stillness” — “water OF stillness” (aquam quietis); the genitive dresses the noun.','w-lat-quietus'),
   BD('“beside the still waters he refreshes me”',['w-lat-super','w-lat-aqua','w-lat-quietus','w-lat-mi','w-lat-convertet'],['w-lat-ubi','w-lat-pascet','w-lat-et']),
   VER('v-lat-ps-23-2'),
   TREE('v-lat-ps-23-2') ])
];

/* ---------- path per language (order of the learning path, §5) ---------- */
var LABELS = {
  'heb-alph':'Alphabet','heb-v1':'Genesis 1:1','heb-v2':'Light','heb-v3':'Chaos','heb-v4':'Shepherd','heb-g1':'Nouns','heb-g2':'Verbs',
  'grc-alph':'Alphabet','grc-v1':'John 1:1','grc-v2':'John 3:16','grc-v3':'Light','grc-g1':'Cases','grc-g2':'Tenses',
  'arc-alph':'Alphabet','arc-v1':'Phrasebook','arc-v2':'Kingdom','arc-g1':'Daniel 2',
  'lat-alph':'Alphabet','lat-v1':'John 1:1','lat-v2':'John 3:16','lat-v3':'Shepherd','lat-g1':'Cases & Tenses'
};
function pathFor(lang){
  var les = LESSONS.filter(function(l){ return l.lang === lang; });
  var nodes = [];
  les.forEach(function(l){ nodes.push({ kind:'lesson', id:l.id, icon:l.icon, label:LABELS[l.id] || l.title.split(' ')[0], title:l.title }); });
  nodes.push({ kind:'verse', id:'verse-'+lang, icon:'📖', label:'Verses', title:'Verse-by-Verse Study' });
  nodes.push({ kind:'parse', id:'parse-'+lang, icon:'🧩', label:'Parsing', title:'Interactive Verse Parsing' });
  nodes.push({ kind:'quiz', id:'quiz-'+lang, icon:'🎯', label:'Quiz', title:'Auto-generated Quiz' });
  nodes.push({ kind:'srs', id:'srs-'+lang, icon:'🔁', label:'Review', title:'Spaced-repetition Review' });
  return nodes;
}
function lessonById(id){
  for (var i=0;i<LESSONS.length;i++) if (LESSONS[i].id === id) return LESSONS[i];
  return null;
}
function versesForLang(lang){
  var list = [];
  Object.keys(DB.Verses).forEach(function(vid){
    var v = DB.Verses[vid];
    if (v.language_code === lang) list.push(v);
  });
  /* group by book+ch:vn, keep first source per group but remember siblings */
  var seen = {};
  var out = [];
  list.sort(function(a,b){ return a.book_id.localeCompare(b.book_id) || a.chapter - b.chapter || a.verse_num - b.verse_num; }).forEach(function(v){
    var k = v.book_id+'-'+v.chapter+':'+v.verse_num;
    if (!seen[k]){ seen[k] = true; v._refs = DB.verseRefs(v.verse_id); out.push(v); }
  });
  return out;
}

window.LESSONS = LESSONS;
window.PATH = { pathFor:pathFor, lessonById:lessonById, versesForLang:versesForLang };
})();
