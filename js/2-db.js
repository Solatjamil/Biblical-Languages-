/* ============================================================
   VERBUM ORIGO — DB layer
   Builds index maps over VO_DATA tables and manages the
   writable runtime tables (user_progress, learning_event,
   content_pack.downloaded) with localStorage persistence.
   ============================================================ */
(function(){
"use strict";
var D = window.VO_DATA;

/* ---------- read-time index maps ---------- */
var Words = {}, Verses = {}, Books = {}, Langs = {}, Roots = {}, Fams = {}, Packs = {};
D.word.forEach(function(w){ Words[w.word_id] = w; });
D.verse.forEach(function(v){ Verses[v.verse_id] = v; });
D.book.forEach(function(b){ Books[b.book_id] = b; });
D.language.forEach(function(l){ Langs[l.code] = l; });
D.root.forEach(function(r){ Roots[r.root_id] = r; });
D.family.forEach(function(f){ Fams[f.family_id] = f; });
D.content_pack.forEach(function(p){ Packs[p.pack_id] = p; });

var VW = {};                      /* verse_id -> [verse_word rows] */
var OccByWord = {}, OccByRoot = {};  /* word_id/root_id -> [occurrence rows] */
D.verse_word.forEach(function(vw){
  (VW[vw.verse_id] = VW[vw.verse_id] || []).push(vw);
  var occ = { verse_id: vw.verse_id, word_id: vw.word_id, position: vw.position, form: vw.form };
  (OccByWord[vw.word_id] = OccByWord[vw.word_id] || []).push(occ);
  var w = Words[vw.word_id];
  if (w && w.root_id) (OccByRoot[w.root_id] = OccByRoot[w.root_id] || []).push(occ);
});
Object.keys(VW).forEach(function(k){ VW[k].sort(function(a,b){ return a.position - b.position; }); });
Object.keys(OccByWord).forEach(function(k){ OccByWord[k].sort(function(a,b){ return a.position - b.position; }); });

var Gloss = [];                   /* glossary_entry rows with normalized keys */
function normKey(s){
  return String(s).toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/[\u2018\u2019\u201a\u02bc\u02bb\u02ba]/g,"'")
    .replace(/[\u201c\u201d]/g,'"').replace(/[\u2013\u2014]/g,'-')
    .replace(/ā/g,'a').replace(/ē/g,'e').replace(/ī/g,'i').replace(/ō/g,'o').replace(/ū/g,'u')
    .replace(/ā/g,'a').replace(/’/g,"'").replace(/’/g,"'")
    .replace(/\s+/g,' ').trim();
}
D.glossary.forEach(function(g,i){
  var keys = [g.source_term].concat(g.aliases||[]).map(normKey).filter(Boolean);
  Gloss.push({ entry_id:'g'+i, word_id:g.word_id, source_lang:g.source_lang,
               source_term:g.source_term, keys:keys });
});

var SyntaxByVerse = {};
D.syntax_node.forEach(function(n){
  (SyntaxByVerse[n.verse_id] = SyntaxByVerse[n.verse_id] || []).push(n);
});

var ScriptByLang = {};
D.script.forEach(function(lt){
  (ScriptByLang[lt.lang] = ScriptByLang[lt.lang] || []).push(lt);
});

/* ---------- persistent runtime state ---------- */
var MEM = {};
var store = {
  get: function(k, dflt){
    try { var v = window.localStorage.getItem('vo-'+k); return v ? JSON.parse(v) : dflt; }
    catch(e){ return (k in MEM) ? MEM[k] : dflt; }
  },
  set: function(k, v){
    try { window.localStorage.setItem('vo-'+k, JSON.stringify(v)); }
    catch(e){ MEM[k] = v; }
  },
  remove: function(k){
    try { window.localStorage.removeItem('vo-'+k); } catch(e){}
    delete MEM[k];
  }
};

var state = {
  user: { xp:0, level:0, title:'Talmid', streak:0, bestStreak:0, activeDays:{},
          hearts:5, heartsResetDay:'', dailyGoal:50, dailyXp:0, dailyXpDay:'' },
  settings: { lang:'heb', dispMode:'script', heartsOn:true, sound:true, ownerMode:false,
              pronConv:{ 'heb':'modern-hebrew','grc-nt':'koine','lxx':'koine','arc':'reconstructed','lat':'ecclesiastical-latin','targum':'reconstructed' } },
  progress: {},     /* word_id -> {stage,ef,next_review_at,seen,mastered,xp_earned} */
  events: [],       /* learning_event (append-only, capped) */
  completed: {},    /* lesson_id -> {xp, mistakes, at} */
  packs: {},        /* pack_id -> true (downloaded) */
  counters: { versesOpened:0, rootsSeen:0, translations:0, parsesCorrect:0, familiesSeen:0,
              quizFamilyCorrect:0, perfectLessons:0, listens:0 },
  badges: []        /* badge ids earned, with dates */
};
function loadState(){
  var s = store.get('state-v1', null);
  if (s){
    state.user = Object.assign(state.user, s.user);
    state.settings = Object.assign(state.settings, s.settings);
    if (s.settings.pronConv) state.settings.pronConv = Object.assign(state.settings.pronConv, s.settings.pronConv);
    state.progress = s.progress || {};
    state.events = s.events || [];
    state.completed = s.completed || {};
    state.packs = s.packs || {};
    state.counters = Object.assign(state.counters, s.counters || {});
    state.badges = s.badges || [];
  }
}
function saveState(){ store.set('state-v1', state); }

function todayStr(){
  var d = new Date();
  return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();
}
function daysBetween(a, b){ /* a,b = 'YYYY-MM-DD' */
  var da = new Date(a + 'T12:00:00'), db = new Date(b + 'T12:00:00');
  return Math.round((db - da) / 86400000);
}

/* ---------- streak / daily goal maintenance ---------- */
function touchActivity(){
  var t = todayStr();
  var u = state.user;
  if (!u.activeDays[t]){
    u.activeDays[t] = true;
    var y = new Date(Date.now() - 86400000);
    var ys = y.getFullYear()+'-'+(y.getMonth()+1)+'-'+y.getDate();
    u.streak = (u.activeDays[ys]) ? u.streak + 1 : 1;
    u.bestStreak = Math.max(u.bestStreak, u.streak);
  }
  if (u.dailyXpDay !== t){ u.dailyXpDay = t; u.dailyXp = 0; }
  if (u.heartsResetDay !== t && state.settings.heartsOn){ u.hearts = 5; u.heartsResetDay = t; }
  saveState();
}
function addXP(n){
  touchActivity();
  state.user.xp += n;
  state.user.dailyXp += n;
  var L = ENGINE.levelForXp(state.user.xp);
  var leveledUp = false;
  if (L.n > state.user.level){ state.user.level = L.n; state.user.title = L.title; leveledUp = true; }
  saveState();
  return leveledUp;
}
function loseHeart(){
  if (!state.settings.heartsOn) return false;
  if (state.user.hearts > 0){ state.user.hearts--; saveState(); return true; }
  return false;
}
function gainHearts(n){
  state.user.hearts = Math.min(5, state.user.hearts + n); saveState();
}

/* ---------- learning_event (append-only raw log, §14) ---------- */
function logEvent(event_type, word_id, correct, response_ms){
  state.events.push({
    event_id: 'e' + (state.events.length+1) + '-' + Date.now().toString(36),
    user_id: 'local', word_id: word_id || null, event_type: event_type,
    correct: (correct===undefined ? null : !!correct),
    response_ms: response_ms || null,
    occurred_at: new Date().toISOString()
  });
  if (state.events.length > 3000) state.events = state.events.slice(-3000);
  saveState();
}

/* ---------- user_progress (SRS rows) ---------- */
function prog(word_id){
  return state.progress[word_id];
}
function ensureProg(word_id){
  if (!state.progress[word_id]){
    state.progress[word_id] = { stage:0, ef:2.5, next_review_at:0, seen:0, mastered:false, xp_earned:0 };
  }
  return state.progress[word_id];
}
function srsReview(word_id, quality, ms){
  var p = ensureProg(word_id);
  var s = ENGINE.sm2(p, quality);
  p.seen++;
  if (quality >= 4 && p.seen >= 3) p.mastered = true;
  if (quality < 3 && p.mastered){ p.mastered = false; }
  saveState();
  return p;
}

/* ---------- derived: weak spots (from user's own events) ---------- */
function difficultyStats(){
  var agg = {};
  state.events.forEach(function(e){
    if (!e.word_id || e.correct === null || e.correct === undefined) return;
    if (['flashcard_review','quiz_answer','parse_attempt'].indexOf(e.event_type) < 0) return;
    var a = agg[e.word_id] = agg[e.word_id] || { attempts:0, errors:0, ms:0 };
    a.attempts++;
    if (!e.correct) a.errors++;
    if (e.response_ms) a.ms += e.response_ms;
  });
  return Object.keys(agg).map(function(wid){
    var a = agg[wid];
    return { word_id:wid, attempt_count:a.attempts,
             error_rate:a.errors / a.attempts,
             avg_response_ms: a.ms / a.attempts };
  }).filter(function(r){ return r.attempt_count >= 2; })
    .sort(function(a,b){ return b.error_rate - a.error_rate || b.attempt_count - a.attempt_count; });
}

/* ---------- derived: content coverage (owner dashboard, §14) ---------- */
function coverageStats(){
  var byKey = {};
  D.word.forEach(function(w){
    var k = w.language_code + '|' + (w.primary_book||'core');
    var c = byKey[k] = byKey[k] || { language_code:w.language_code, book_id:w.primary_book||'core',
      words_total:0, words_with_audio:0, words_with_etymology:0, words_with_gloss:0 };
    c.words_total++;
    if (Object.keys(w.audio).length > 0) c.words_with_audio++;
    if (w.etymology) c.words_with_etymology++;
    if (Gloss.some(function(g){ return g.word_id === w.word_id; })) c.words_with_gloss++;
  });
  var out = Object.keys(byKey).map(function(k){
    var c = byKey[k];
    c.verses = D.verse.filter(function(v){ return v.language_code === c.language_code && v.book_id === c.book_id; }).length;
    c.coverage_pct = Math.round(100 * (c.words_with_audio + c.words_with_etymology + c.words_with_gloss) / (3 * Math.max(1, c.words_total)));
    return c;
  }).sort(function(a,b){ return a.language_code === b.language_code ? a.book_id.localeCompare(b.book_id) : a.language_code.localeCompare(b.language_code); });
  return out;
}

/* ---------- glossary lookup (translation tool, §11) — dictionary only, no AI ---------- */
function lev(a, b){
  var m = a.length, n = b.length;
  if (Math.abs(m-n) > 3) return 99;
  var dp = [];
  for (var i=0;i<=m;i++){ dp[i]=[i]; }
  for (var j=0;j<=n;j++){ dp[0][j]=j; }
  for (i=1;i<=m;i++) for (j=1;j<=n;j++){
    dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
  }
  return dp[m][n];
}
function lookupGlossary(input, source_lang, target_langs){
  var q = normKey(input);
  if (!q) return { exact:[], fuzzy:[] };
  var cands = Gloss.filter(function(g){ return g.source_lang === source_lang; });
  var res = { exact:[], fuzzy:[] };
  cands.forEach(function(g){
    var w = Words[g.word_id];
    if (!w) return;
    if (target_langs && target_langs.indexOf(w.language_code) < 0) return;
    if (g.keys.indexOf(q) >= 0){ res.exact.push({ entry:g, word:w, quality:'exact' }); return; }
    var best = 99;
    g.keys.forEach(function(k){ best = Math.min(best, lev(q, k)); });
    if (best <= 2) res.fuzzy.push({ entry:g, word:w, quality:best === 1 ? 'close' : 'fuzzy', dist:best });
  });
  res.fuzzy.sort(function(a,b){ return (a.dist - b.dist) || a.word.word_id.localeCompare(b.word.word_id); });
  return res;
}

/* ---------- verse helpers ---------- */
function verseRefs(verse_id){
  /* all source texts for the same book+chapter+verse */
  var v = Verses[verse_id];
  if (!v) return [];
  return D.verse.filter(function(x){
    return x.book_id === v.book_id && x.chapter === v.chapter && x.verse_num === v.verse_num;
  });
}
function refLabel(v){
  return Books[v.book_id].name + ' ' + v.chapter + ':' + v.verse_num;
}
function sourceLabel(s){
  return { masoretic:'Masoretic', dss:'Dead Sea Scrolls', tr:'Textus Receptus', na28:'NA28',
           vulgate:'Vulgate', lxx:'Septuagint', targum:'Targum', arc:'Aramaic',
           'mt':'Masoretic' }[s] || s;
}

/* ---------- progress per language/book ---------- */
function langWords(langCode){
  return D.word.filter(function(w){ return w.language_code === langCode; });
}
function bookProgress(langCode, bookId){
  var ws = D.word.filter(function(w){ return w.language_code === langCode && (w.primary_book||'core') === bookId; });
  var mastered = ws.filter(function(w){ var p = state.progress[w.word_id]; return p && p.mastered; }).length;
  return { total: ws.length, mastered: mastered,
           pct: ws.length ? Math.round(100 * mastered / ws.length) : 0 };
}

window.DB = {
  Words:Words, Verses:Verses, Books:Books, Langs:Langs, Roots:Roots, Fams:Fams, Packs:Packs,
  VW:VW, Gloss:Gloss, SyntaxByVerse:SyntaxByVerse, ScriptByLang:ScriptByLang,
  w:function(id){ return Words[id]; },
  v:function(id){ return Verses[id]; },
  vw:function(verse_id){ return VW[verse_id] || []; },
  occ:function(word_id){ return OccByWord[word_id] || []; },
  rootOcc:function(root_id){ return OccByRoot[root_id] || []; },
  family:function(fid){
    var fam = Fams[fid];
    var roots = D.root.filter(function(r){ return r.family_id === fid; });
    var words = [];
    roots.forEach(function(r){
      D.word.forEach(function(w){ if (w.root_id === r.root_id) words.push(w); });
    });
    return { family:fam, roots:roots, words:words };
  },
  verseRefs:verseRefs, refLabel:refLabel, sourceLabel:sourceLabel,
  state:state, saveState:saveState, loadState:loadState,
  logEvent:logEvent, addXP:addXP, loseHeart:loseHeart, gainHearts:gainHearts,
  touchActivity:touchActivity, todayStr:todayStr, daysBetween:daysBetween,
  prog:prog, ensureProg:ensureProg, srsReview:srsReview,
  difficultyStats:difficultyStats, coverageStats:coverageStats,
  lookupGlossary:lookupGlossary, normKey:normKey,
  langWords:langWords, bookProgress:bookProgress
};
})();
