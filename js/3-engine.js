/* ============================================================
   VERBUM ORIGO — Engine
   SM-2 spaced repetition · XP / levels · streaks · badges ·
   TTS pronunciation · utilities
   ============================================================ */
(function(){
"use strict";

/* ---------- SM-2 (spaced repetition, §9) ---------- */
function sm2(p, q){
  /* p = progress row, q = quality 0..5 (we use 1..5) */
  var ef = p.ef || 2.5;
  ef = Math.max(1.3, ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));
  var interval;
  if (q < 3){ p.stage = 0; interval = 0; }         /* lapse: relearn now */
  else {
    p.stage = (p.stage || 0) + 1;
    if (p.stage === 1) interval = 1;
    else if (p.stage === 2) interval = 6;
    else interval = Math.round((p.stage - 1) * ef);
    interval = Math.min(interval, 365);
  }
  p.ef = ef;
  p.next_review_at = Date.now() + interval * 86400000;
  return p;
}
function dueReviews(limit){
  var now = Date.now();
  var rows = [];
  Object.keys(DB.state.progress).forEach(function(wid){
    var p = DB.state.progress[wid];
    if (p.next_review_at <= now && !p.mastered) rows.push({ word_id: wid, p: p });
  });
  rows.sort(function(a,b){ return a.p.next_review_at - b.p.next_review_at; });
  return limit ? rows.slice(0, limit) : rows;
}
function newWords(langCode, exclude, limit){
  var have = {};
  (exclude || []).forEach(function(id){ have[id] = true; });
  var out = [];
  DB.langWords(langCode).sort(function(a,b){ return a.frequency_rank - b.frequency_rank; }).forEach(function(w){
    if (have[w.word_id]) return;
    var p = DB.state.progress[w.word_id];
    if (!p || (p.seen || 0) < 1) out.push(w);
    if (limit && out.length >= limit) return;
  });
  return limit ? out.slice(0, limit) : out;
}

/* ---------- levels (§13) ---------- */
var LEVELS = [
  [0, 'Talmid'], [100, 'Alef-Bet Adept'], [300, 'Scribe'], [700, 'Grammarian'],
  [1500, 'Lexicographer'], [3000, 'Root Master'], [6000, 'Polyglot Scholar'],
  [10000, 'Septuagint Scholar'], [15000, 'Doctor of Letters'], [25000, 'Verbum Origo Master']
];
function levelForXp(xp){
  var n = 0, title = 'Talmid', cur = LEVELS[0];
  for (var i = 0; i < LEVELS.length; i++){
    if (xp >= LEVELS[i][0]){ n = i; title = LEVELS[i][1]; cur = LEVELS[i]; }
  }
  var next = LEVELS[n + 1] || null;
  var floor = cur[0], ceil = next ? next[0] : floor;
  var pct = next ? Math.min(100, Math.round(100 * (xp - floor) / (ceil - floor))) : 100;
  return { n: n, title: title, pct: pct, floor: floor, ceil: ceil,
           nextAt: next ? next[0] : null, nextTitle: next ? next[1] : null };
}

/* ---------- badges (§13) ---------- */
var BADGES = [
  { id:'first-light',  icon:'🕯️', name:'First Light',        desc:'Finish your first lesson',
    test:function(){ return Object.keys(DB.state.completed).length >= 1; } },
  { id:'ten-words',    icon:'📜', name:'Ten Words',          desc:'Master 10 words in any language',
    test:function(){ return countMastered() >= 10; } },
  { id:'fifty-words',  icon:'📚', name:'Fifty Words',        desc:'Master 50 words across all languages',
    test:function(){ return countMastered() >= 50; } },
  { id:'alph-adept',   icon:'✒️', name:'Alphabet Adept',     desc:'Complete all four script & alphabet lessons',
    test:function(){ return ['heb','grc-nt','arc','lat'].every(function(l){ return DB.state.completed[l+'-alph']; }); } },
  { id:'torah-reader', icon:'📖', name:'Torah Reader',       desc:'Study 3 Hebrew passages verse-by-verse',
    test:function(){ return (DB.state.counters.versesOpened||0) >= 3; } },
  { id:'root-master',  icon:'🌳', name:'Root Master',        desc:'Open 10 word roots in their families',
    test:function(){ return (DB.state.counters.rootsSeen||0) >= 10; } },
  { id:'sept-scholar', icon:'🏛️', name:'Septuagint Scholar', desc:'Study a LXX passage',
    test:function(){ return (DB.state.counters.lxxOpened||0) >= 1; } },
  { id:'vulgate-vox',  icon:'⛪', name:'Vulgate Voice',      desc:'Master 10 Vulgate Latin words',
    test:function(){ return countMasteredLang('lat') >= 10; } },
  { id:'koine-keeper', icon:'🌅', name:'Koine Keeper',       desc:'Master 15 Koine Greek words',
    test:function(){ return countMasteredLang('grc-nt') >= 15; } },
  { id:'abba-heart',   icon:'💛', name:'Abba Heart',         desc:'Master 8 Aramaic words of Jesus',
    test:function(){ return countMasteredLang('arc') >= 8; } },
  { id:'streak-3',     icon:'🔥', name:'Kindled',            desc:'Reach a 3-day streak',
    test:function(){ return (DB.state.user.bestStreak||0) >= 3; } },
  { id:'streak-7',     icon:'🔥', name:'Weekly Flame',       desc:'Reach a 7-day streak',
    test:function(){ return (DB.state.user.bestStreak||0) >= 7; } },
  { id:'streak-30',    icon:'🔥', name:'Martyr of Consistency', desc:'Reach a 30-day streak',
    test:function(){ return (DB.state.user.bestStreak||0) >= 30; } },
  { id:'xp-500',       icon:'⭐', name:'Five Hundred',       desc:'Earn 500 XP',
    test:function(){ return DB.state.user.xp >= 500; } },
  { id:'xp-2500',      icon:'⭐', name:'Two-Five',           desc:'Earn 2,500 XP',
    test:function(){ return DB.state.user.xp >= 2500; } },
  { id:'perfect-lesson', icon:'💯', name:'Unbroken',         desc:'Complete a lesson with zero mistakes',
    test:function(){ return (DB.state.counters.perfectLessons||0) >= 1; } },
  { id:'parse-10',     icon:'🧩', name:'Parser',             desc:'Correctly parse 10 words in verses',
    test:function(){ return (DB.state.counters.parsesCorrect||0) >= 10; } },
  { id:'family-5',     icon:'🔗', name:'Bridge Builder',     desc:'View 5 cross-language root families',
    test:function(){ return (DB.state.counters.familiesSeen||0) >= 5; } },
  { id:'translator',   icon:'🔁', name:'Translator',         desc:'Make 10 dictionary translations',
    test:function(){ return (DB.state.counters.translations||0) >= 10; } },
  { id:'ear-of-rama',  icon:'👂', name:'Hear and Obey',      desc:'Listen to 15 pronunciations',
    test:function(){ return (DB.state.counters.listens||0) >= 15; } }
];
function countMastered(){
  var n = 0;
  Object.keys(DB.state.progress).forEach(function(wid){
    if (DB.state.progress[wid].mastered) n++;
  });
  return n;
}
function countMasteredLang(lang){
  var n = 0;
  DB.langWords(lang).forEach(function(w){
    var p = DB.state.progress[w.word_id];
    if (p && p.mastered) n++;
  });
  return n;
}
function evalBadges(){
  var earned = new Set(DB.state.badges.map(function(b){ return b.id; }));
  var fresh = [];
  BADGES.forEach(function(b){
    if (earned.has(b.id)) return;
    try { if (b.test()) fresh.push({ id:b.id, at: Date.now() }); } catch(e){}
  });
  if (fresh.length){
    DB.state.badges = DB.state.badges.concat(fresh);
    DB.saveState();
  }
  return fresh;
}

/* ---------- TTS pronunciation (§8) ---------- */
var VOICES = null;
function voices(){
  if (VOICES === null){
    try { VOICES = window.speechSynthesis ? window.speechSynthesis.getVoices() : []; }
    catch(e){ VOICES = []; }
  }
  return VOICES;
}
function ttsClean(t){
  return String(t)
    .replace(/[’‘ʼ]/g,'').replace(/[ḥḩ]/g,'h').replace(/ṭ/g,'t').replace(/ṣ/g,'s')
    .replace(/ʿ/g,'').replace(/š/g,'sh').replace(/ž/g,'zh').replace(/ḫ/g,'kh').replace(/ġ/g,'gh')
    .replace(/ā/g,'aa').replace(/ē/g,'ee').replace(/ī/g,'ee').replace(/ō/g,'oo').replace(/ū/g,'oo')
    .replace(/[ἀἐἰὐῶάέήίόύῶ]/g,'').replace(/[ἀ-ῶ]/g,'')
    .replace(/[ᾀ-ᾴᾶ-ᾼιὶ-ῶ]/g,'')
    .replace(/[’‘ʼʾ]/g,'').replace(/[‘’]/g,'')
    .replace(/\s+/g,' ').trim();
}
function pickVoice(langCode, conv){
  var list = voices();
  if (!list.length) return null;
  var prefs = [];
  if (langCode === 'heb'){
    prefs = conv === 'tiberian' ? ['en-GB','en-US','he-IL'] : ['he-IL','en-GB','en-US'];
  } else if (langCode === 'grc-nt' || langCode === 'lxx'){
    prefs = conv === 'modern-greek' ? ['el-GR','en-GB','en-US'] : ['el-GR','en-GB','en-US'];
  } else if (langCode === 'lat'){
    prefs = ['it-IT','en-GB','en-US'];
  } else {
    prefs = ['en-GB','en-US','he-IL'];
  }
  for (var i = 0; i < prefs.length; i++){
    var v = list.find(function(x){ return (x.lang||'').toLowerCase().indexOf(prefs[i].toLowerCase()) === 0; });
    if (v) return v;
  }
  return list[0] || null;
}
var lastUtter = null;
function speak(text, langCode, conv, rate){
  if (!DB.state.settings.sound) return false;
  try {
    if (!window.speechSynthesis) return false;
    window.speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(text);
    var v = pickVoice(langCode, conv);
    if (v) u.voice = v;
    u.rate = rate || 0.85;
    u.pitch = 1;
    window.speechSynthesis.speak(u);
    lastUtter = u;
    return true;
  } catch(e){ return false; }
}
function speakWord(word_id, conv, rate){
  var w = DB.w(word_id);
  if (!w) return false;
  var text = (w.audio && w.audio[conv]) || Object.values(w.audio)[0] || w.translit;
  var ok = speak(ttsClean(text) || w.translit, w.language_code, conv, rate);
  if (ok){ DB.state.counters.listens = (DB.state.counters.listens||0) + 1; DB.saveState(); }
  return ok;
}
function convLabel(langCode){
  var map = {
    'heb': [ ['modern-hebrew','Modern Israeli'], ['tiberian','Tiberian (Biblical)'] ],
    'grc-nt': [ ['koine','Koine (Reconstructed)'], ['erasmian','Erasmian (Byzantine)'], ['modern-greek','Modern Greek'] ],
    'lxx': [ ['koine','Koine (LXX)'], ['erasmian','Erasmian'], ['modern-greek','Modern Greek'] ],
    'arc': [ ['reconstructed','Reconstructed Biblical'] ],
    'targum': [ ['reconstructed','Reconstructed Biblical'] ],
    'lat': [ ['ecclesiastical-latin','Ecclesiastical (Church)'] ]
  };
  return map[langCode] || [ ['default','Default'] ];
}
function defaultConv(langCode){
  var m = convLabel(langCode);
  return m[0][0];
}

/* ---------- misc utils ---------- */
function shuffle(a){
  var arr = a.slice();
  for (var i = arr.length - 1; i > 0; i--){
    var j = Math.floor(Math.random() * (i + 1));
    var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
  }
  return arr;
}
function esc(s){
  return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function morphText(m){
  if (!m || Object.keys(m).length === 0) return '—';
  var bits = [];
  if (m.pos) bits.push(m.pos);
  if (m.stem) bits.push(m.stem);
  if (m.tense) bits.push(m.tense);
  if (m.voice) bits.push(m.voice);
  if (m.mood && m.mood !== 'indicative') bits.push(m.mood);
  if (m.tense && !m.mood) bits.push('indicative');
  if (m.person) bits.push({1:'1st',2:'2nd',3:'3rd'}[m.person] || m.person, {c:'comm',m:'masc',f:'fem',n:'neut'}[m.gender] || '', {sg:'sg',pl:'pl',d:'dual'}[m.number] || '');
  if (m.state) bits.push(m.state);
  if (m.case) bits.push(m.case + ' case');
  if (m.note) bits.push('(' + m.note + ')');
  return bits.filter(Boolean).join(' · ');
}
function fmtK(n){
  if (n >= 1000) return (n/1000).toFixed(n % 1000 >= 100 ? 1 : 0) + 'k';
  return String(n);
}

window.ENGINE = {
  sm2:sm2, dueReviews:dueReviews, newWords:newWords,
  levelForXp:levelForXp, LEVELS:LEVELS,
  BADGES:BADGES, evalBadges:evalBadges, countMastered:countMastered, countMasteredLang:countMasteredLang,
  speak:speak, speakWord:speakWord, ttsClean:ttsClean, convLabel:convLabel, defaultConv:defaultConv,
  shuffle:shuffle, esc:esc, morphText:morphText, fmtK:fmtK
};
})();
