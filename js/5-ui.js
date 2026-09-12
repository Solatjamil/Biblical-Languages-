/* ============================================================
   VERBUM ORIGO — UI
   All screens render as views over the DB schema (§4 map).
   The Word breakdown card is ONE reusable component used by
   Verse Study, Parsing, Lexicon and Translation (§19).
   ============================================================ */
(function(){
"use strict";
var APP = window.APP || (window.APP = {});
var E = ENGINE.esc, SC = ENGINE.shuffle;
function rtl(lang){ return lang === 'heb' || lang === 'arc' || lang === 'targum'; }
function curLang(){ return APP.lang || DB.state.settings.lang; }

/* ---------------- tiny helpers ---------------- */
function toast(msg, gold){
  var t = document.getElementById('toast');
  if (!t){ t = document.createElement('div'); t.id = 'toast'; document.body.appendChild(t); }
  t.textContent = msg;
  t.className = 'show' + (gold ? ' gold' : '');
  clearTimeout(t._h);
  t._h = setTimeout(function(){ t.className = ''; }, 2600);
}
function modal(html, onMount){
  var root = document.getElementById('modal-root');
  if (!root){
    root = document.createElement('div');
    root.id = 'modal-root';
    root.className = 'modal-root';
    root.innerHTML = '<div class="modal-back" data-close></div><div class="modal"><button class="mclose" data-close>×</button><div class="mbody"></div></div>';
    document.body.appendChild(root);
    root.addEventListener('click', function(e){ if (e.target.closest('[data-close]')) closeModal(); });
  }
  root.querySelector('.mbody').innerHTML = html;
  root.classList.add('open');
  if (onMount) onMount(root);
}
function closeModal(){
  var root = document.getElementById('modal-root');
  if (root) root.classList.remove('open');
}
function nav(route){ location.hash = route; }

function adSlot(kind){
  var rewarded = kind === 'reward';
  return '<div class="ad-slot">' +
    '<div class="adk">Ad space · Verbum Origo</div>' +
    '<div class="adt">Your advertisement could be here — without disrupting the study flow (§17).</div>' +
    (rewarded ? '<button class="btn small gold" id="ad-reward">▶ Watch a 15s ad (simulated) → +30 XP</button>' : '') +
    '</div>';
}
function wireAd(root){
  var b = root.querySelector('#ad-reward');
  if (b) b.addEventListener('click', function(){
    b.disabled = true;
    var s = 15;
    b.textContent = 'Ad playing… ' + s + 's';
    var iv = setInterval(function(){
      s--;
      if (s <= 0){ clearInterval(iv); DB.addXP(30); ENGINE.evalBadges(); toast('Reward claimed: +30 XP', true); closeModal(); }
      else b.textContent = 'Ad playing… ' + s + 's';
    }, 1000);
  });
}

/* ---------------- top bar / bottom nav ---------------- */
function topbar(){
  var u = DB.state.user;
  return '<div class="topbar">' +
    '<a class="brand" href="#/" style="text-decoration:none">' +
      '<b>VERBUM&nbsp;ORIGO</b><span>Biblical Languages · saulspodship.com</span></a>' +
    '<div class="spacer"></div>' +
    '<div class="stat-pill hearts" title="Hearts">❤ ' + (DB.state.settings.heartsOn ? u.hearts : '∞') + '</div>' +
    '<div class="stat-pill streak" title="Streak">🔥 ' + u.streak + '</div>' +
    '<div class="stat-pill xp" title="XP">⚡ ' + ENGINE.fmtK(u.xp) + '</div>' +
    '</div>';
}
function bottomnav(active){
  var due = ENGINE.dueReviews().length;
  var items = [
    ['home', '🏛️', 'Home'],
    ['practice', '🔁', 'Practice'],
    ['lexicon', '🔎', 'Lexicon'],
    ['translate', '🔁', 'Translate'],
    ['profile', '👤', 'Profile']
  ];
  return '<nav class="bottomnav">' + items.map(function(it){
    var cls = it[0] === active ? 'active' : '';
    var dot = (it[0] === 'practice' && due > 0) ? '<span class="badge-dot">' + Math.min(due, 99) + '</span>' : '';
    return '<button data-nav="' + it[0] + '" class="' + cls + '">' + dot + '<span class="nic">' + it[1] + '</span>' + it[2] + '</button>';
  }).join('') + '</nav>';
}
function wireNav(root){
  root.querySelectorAll('[data-nav]').forEach(function(b){
    b.addEventListener('click', function(){ nav('#/' + b.dataset.nav); });
  });
}

/* ============================================================
   WORD BREAKDOWN CARD — the reusable component (§6, §19)
   ============================================================ */
function wordCard(wid, opts){
  opts = opts || {};
  var w = DB.w(wid);
  if (!w) return '<div class="panel">Word not found.</div>';
  var lang = w.language_code;
  var convs = ENGINE.convLabel(lang);
  var activeConv = DB.state.settings.pronConv[lang] || ENGINE.defaultConv(lang);
  var dirCls = rtl(lang) ? 'script' : 'script ltr';
  var strongTag = w.strong_number ? '<span class="tag">S ' + (lang.indexOf('grc') === 0 || lang === 'lxx' ? 'G' : 'H') + w.strong_number + '</span>' : '';
  var root = w.root_id ? DB.Roots[w.root_id] : null;
  var fam = root ? DB.Fams[root.family_id] : null;

  var morphRows = '';
  var m = w.morphology || {};
  if (Object.keys(m).length){
    var cells = [];
    function cell(k, v){ if (v) cells.push('<div class="mg"><div class="k">' + k + '</div><div class="v">' + E(v) + '</div></div>'); }
    cell('Part of speech', m.pos);
    cell('Stem', m.stem);
    cell('Gender', {masc:'masculine',fem:'feminine',neut:'neuter',comm:'common'}[m.gender]);
    cell('Number', {sg:'singular',pl:'plural',d:'dual'}[m.number]);
    cell('State', m.state);
    cell('Case', m.case);
    cell('Tense', m.tense);
    cell('Voice', m.voice);
    cell('Mood', m.mood);
    cell('Person', {1:'1st',2:'2nd',3:'3rd'}[m.person]);
    if (cells.length) morphRows = '<div class="morph-grid">' + cells.join('') + '</div>';
  }

  /* cross-language root family (§6) */
  var famHtml = '';
  if (fam){
    var f = DB.family(root.family_id);
    var rows = f.roots.map(function(r){
      var words = f.words.filter(function(x){ return x.root_id === r.root_id; });
      var wtxt = words.map(function(x){ return '<span style="color:var(--gold-bright)">' + E(x.script) + '</span> <span class="fgloss">' + E(x.translit) + ' — ' + E(x.gloss_en) + '</span>'; }).join('<br>');
      return '<div class="family-row"><span class="flang">' + E((DB.Langs[r.language_code]||{}).short || r.language_code) + '</span>' +
        '<span class="fscript">' + E(r.root_form) + '</span>' +
        '<span style="flex:1;min-width:0">' + (wtxt || '<span class="fgloss">' + E(r.gloss) + '</span>') + '</span></div>';
    }).join('');
    famHtml = '<div class="wc-section"><h4>🔗 Root family — ' + E(fam.name) + '</h4>' +
      (fam.note ? '<div class="small dim" style="margin-bottom:8px;font-style:italic">' + E(fam.note) + '</div>' : '') +
      rows +
      '<button class="btn small gold mt8" data-act="practice-family" data-wid="' + wid + '">Practice this family</button></div>';
  }

  /* glossary (§11) */
  var gRows = DB.Gloss.filter(function(g){ return g.word_id === wid; });
  var gHtml = '';
  if (gRows.length){
    var langs = [['en','English'],['ur-roman','Roman Urdu'],['ur','اردو'],['hi','हिन्दी']];
    gHtml = '<div class="wc-section"><h4>🔁 Dictionary (translation index)</h4>' +
      gRows.map(function(g){
        var ln = langs.find(function(x){ return x[0] === g.source_lang; });
        return '<div class="family-row"><span class="flang">' + (ln ? ln[1] : g.source_lang) + '</span><span style="flex:1">' + E(g.source_term) + (g.aliases && g.aliases.length ? ' <span class="fgloss">(' + E(g.aliases.join(', ')) + ')</span>' : '') + '</span></div>';
      }).join('') + '</div>';
  }

  /* occurrences (§10) */
  var occ = DB.occ(wid);
  var occHtml = '';
  if (occ.length){
    occHtml = '<div class="wc-section"><h4>📖 Occurrences (' + occ.length + ')</h4>' +
      occ.slice(0, 8).map(function(o){
        var v = DB.Verses[o.verse_id];
        var snippet = v.text_en.length > 64 ? v.text_en.slice(0, 64) + '…' : v.text_en;
        return '<div class="occ-row" data-act="open-verse" data-vid="' + o.verse_id + '" data-hl="' + wid + '">' +
          '<span class="oref">' + E(DB.refLabel(v)) + ' · ' + DB.sourceLabel(v.source_text) + '</span>' +
          '<span class="otext">' + E(snippet) + '</span><span style="color:var(--gold)">→</span></div>';
      }).join('') + '</div>';
  }

  var html = '<div class="wordcard panel" style="margin-top:0">' +
    '<div class="wc-head"><div>' +
      '<div class="' + dirCls + '" style="font-size:44px;line-height:1.3;color:var(--gold-bright)">' + E(w.script) + '</div>' +
      '<div class="wc-translit">' + E(w.translit) + '</div>' +
      '<div class="wc-gloss">' + E(w.gloss_en) + '</div>' +
      '<div class="wc-sub">' + strongTag +
        (root ? '<span class="tag plain" data-act="root" data-rid="' + root.root_id + '">root: ' + E(root.root_form) + '</span>' : '') +
        (w.frequency_rank ? '<span class="tag plain">freq #' + w.frequency_rank + '</span>' : '') +
        (w.phrasebook ? '<span class="tag">✝ phrasebook</span>' : '') +
      '</div>' +
    '</div></div>' +
    (morphRows ? '<div class="wc-section"><h4>⚖ Morphology</h4>' + morphRows + (m.note ? '<div class="small dim mt8">' + E(m.note) + '</div>' : '') + '</div>' : '') +
    '<div class="wc-section"><h4>🔊 Pronunciation</h4><div class="pron-btns">' +
      convs.map(function(c){
        return '<button class="pb' + (c[0] === activeConv ? ' active' : '') + '" data-act="speak" data-wid="' + wid + '" data-conv="' + c[0] + '">🔊 ' + E(c[1]) + '</button>';
      }).join('') + '</div></div>' +
    (w.etymology ? '<div class="wc-section"><h4>📜 Etymology</h4><div class="etym">' + E(w.etymology) + '<span class="src">structured from ' + (root ? 'root ' + E(root.root_form) + ' · ' : '') + (w.strong_number ? 'Strong\'s ' : '') + (w.strong_number ? (lang.indexOf('grc') === 0 || lang === 'lxx' ? 'G' : 'H') + w.strong_number : 'the schema') + '</span></div></div>' : '') +
    famHtml + gHtml + occHtml +
    '<div class="wc-section" style="display:flex;gap:8px;flex-wrap:wrap">' +
      '<button class="btn small ok" data-act="srs-word" data-wid="' + wid + '">🔁 Practice this word</button>' +
      (w.root_id ? '<button class="btn small gold" data-act="root" data-rid="' + w.root_id + '">🔗 Root family</button>' : '') +
    '</div>' +
  '</div>';
  return html;
}
function wireWordCard(root, container){
  container = container || root;
  container.querySelectorAll('[data-act="speak"]').forEach(function(b){
    b.addEventListener('click', function(){
      var ok = ENGINE.speakWord(b.dataset.wid, b.dataset.conv);
      if (!ok) toast('Audio unavailable in this context — tap again after interacting');
    });
  });
  container.querySelectorAll('[data-act="root"]').forEach(function(b){
    b.addEventListener('click', function(){
      var r = DB.Roots[b.dataset.rid];
      if (!r) return;
      DB.state.counters.rootsSeen = (DB.state.counters.rootsSeen || 0) + 1;
      DB.state.counters.familiesSeen = (DB.state.counters.familiesSeen || 0) + 1;
      DB.saveState(); ENGINE.evalBadges();
      var f = DB.family(r.family_id);
      var rows = f.roots.map(function(rr){
        var ww = f.words.filter(function(x){ return x.root_id === rr.root_id; });
        return '<div class="family-row"><span class="flang">' + E((DB.Langs[rr.language_code]||{}).short||rr.language_code) + '</span>' +
          '<span class="fscript">' + E(rr.root_form) + '</span>' +
          '<span style="flex:1">' + (ww.length ? ww.map(function(x){ return '<a href="#/word/' + x.word_id + '">' + E(x.script) + ' <span class="fgloss">' + E(x.gloss_en) + '</span></a>'; }).join('<br>') : '<span class="fgloss">' + E(rr.gloss) + '</span>') + '</span></div>';
      }).join('');
      modal('<div class="mtag">Root family</div><h2 style="font-size:20px">' + E(f.family ? f.family.name : '') + '</h2>' +
        (f.family && f.family.note ? '<div class="small dim" style="margin-bottom:10px;font-style:italic">' + E(f.family.note) + '</div>' : '') +
        rows + '<div class="small faint mt12">Every word above links to its full breakdown. Same concept, four tongues (§6).</div>');
    });
  });
  container.querySelectorAll('[data-act="practice-family"]').forEach(function(b){
    b.addEventListener('click', function(){
      var r = DB.Roots[DB.w(b.dataset.wid).root_id];
      var f = DB.family(r.family_id);
      var ids = f.words.map(function(x){ return x.word_id; });
      APP.srsQueue = SC(ids);
      nav('#/srs');
    });
  });
  container.querySelectorAll('[data-act="srs-word"]').forEach(function(b){
    b.addEventListener('click', function(){ APP.srsQueue = [b.dataset.wid]; nav('#/srs'); });
  });
  container.querySelectorAll('[data-act="open-verse"]').forEach(function(b){
    b.addEventListener('click', function(){ nav('#/verse/' + b.dataset.vid + '?hl=' + b.dataset.hl); });
  });
}

/* ============================================================
   HOME — dashboard + learning path (§4)
   ============================================================ */
function screenHome(){
  var lang = curLang();
  var u = DB.state.user;
  var L = ENGINE.levelForXp(u.xp);
  var due = ENGINE.dueReviews().length;
  var langs = ['heb','grc-nt','arc','lat'];

  var todayVerse = (function(){
    var vs = Object.keys(DB.Verses).map(function(k){ return DB.Verses[k]; }).filter(function(v){ return !v.source_text.startsWith('na28'); });
    var doy = Math.floor((Date.now() - new Date(new Date().getFullYear(),0,0)) / 86400000);
    return vs[doy % vs.length];
  })();

  var html = topbar() +
    '<div style="padding:14px 14px 0">' +
    '<div class="langtabs">' + langs.map(function(l){
      var la = DB.Langs[l];
      return '<button data-lang="' + l + '" class="' + (l === lang ? 'active' : '') + '"><span class="lname">' + E(la.short) + '</span><span class="lsub">' + E(la.note.split('·')[0]) + '</span></button>';
    }).join('') + '</div>' +

    '<div class="home-grid">' +
    '<div class="hg-hero hero-strip">' +
      '<div class="center" style="margin-bottom:8px;font-size:11px;letter-spacing:2px;color:var(--ink-faint)">A BIBLICAL MINISTRY PROJECT</div>' +
      '<h2 class="center">Verbum Origo</h2>' +
      '<p class="center">Learn the Bible in its original tongues — Hebrew, Koine Greek, Aramaic and Vulgate Latin — word by word, root by root.</p>' +
      '<div class="ring-wrap">' +
        '<div class="ring"><svg width="64" height="64"><circle cx="32" cy="32" r="26" stroke="#2e271c" stroke-width="7" fill="none"/><circle cx="32" cy="32" r="26" stroke="#c9a227" stroke-width="7" fill="none" stroke-linecap="round" stroke-dasharray="' + (163.4 * Math.min(1, u.dailyXp / u.dailyGoal)).toFixed(1) + ' 163.4"/></svg><div class="rv">' + u.dailyXp + '</div></div>' +
        '<div><div style="font-size:13.5px;font-weight:700">Daily goal</div><div class="small dim">' + u.dailyGoal + ' XP today · ' + (u.dailyXp >= u.dailyGoal ? 'complete — keep the flame 🔥' : 'keep studying') + '</div>' +
        '<div class="small dim mt8">Level ' + (L.n + 1) + ' · ' + E(L.title) + (L.nextAt ? ' · next: ' + L.nextTitle + ' at ' + L.nextAt + ' XP' : '') + '</div></div>' +
      '</div>' +
    '</div>' +

    '<div class="hg-verse panel">' +
      '<div class="card-title"><span class="ico">📖</span> Today’s verse <span class="chip gold" style="margin-left:auto">' + E(DB.Langs[todayVerse.language_code].short) + '</span></div>' +
      '<div class="verse-ref">' + E(DB.refLabel(todayVerse)) + ' · ' + DB.sourceLabel(todayVerse.source_text) + '</div>' +
      '<div class="serif" style="margin-top:6px;font-size:14.5px;color:var(--ink-dim)">' + E(todayVerse.text_en) + '</div>' +
      '<button class="btn small gold mt8" data-act="open-verse" data-vid="' + todayVerse.verse_id + '">Study it word by word →</button>' +
    '</div>' +

    '<div class="hg-path"><div class="card-title" style="padding:0 4px"><span class="ico">🧭</span> ' + E(DB.Langs[lang].short) + ' track</div>' +
    renderPath(lang) + '</div>' +
    '<div class="hg-ad">' + adSlot('banner') + '</div>' +
    '<div class="hg-note panel hollow center" style="border:none">' +
      '<div class="small faint">Part of the <a href="#/about">Saul’s Podship</a> family · <a href="#/about">saulspodship.com</a></div>' +
    '</div>' +
    '</div>' +
    '</div>' + bottomnav('home');

  var root = document.getElementById('app');
  root.innerHTML = html;
  wireNav(root);
  root.querySelectorAll('[data-lang]').forEach(function(b){
    b.addEventListener('click', function(){
      APP.lang = b.dataset.lang;
      DB.state.settings.lang = APP.lang;
      DB.saveState();
      render();
    });
  });
  var ov = root.querySelector('[data-act="open-verse"]');
  if (ov) ov.addEventListener('click', function(){ nav('#/verse/' + ov.dataset.vid); });
  wirePathNodes(root, lang);
}

function renderPath(lang){
  var nodes = PATH.pathFor(lang);
  var doneCount = 0;
  var nodesHtml = nodes.map(function(n, i){
    var cls = '', flag = '';
    if (n.kind === 'lesson'){
      if (DB.state.completed[n.id]){ cls = 'done'; doneCount++; }
      else if (i === firstOpenIndex(nodes)){ cls = 'current'; flag = '<span class="flag">🚩</span>'; }
    } else if (n.kind === 'verse'){
      cls = doneCount ? 'current' : '';
    } else {
      cls = 'done'; /* utility circles always open */
    }
    return '<div class="path-node ' + cls + '" data-node="' + n.kind + ':' + n.id + '">' + flag +
      '<span class="pico">' + n.icon + '</span><span class="plabel">' + E(n.label) + '</span></div>';
  }).join('');
  return '<div class="path">' + nodesHtml + '</div>';
}
function firstOpenIndex(nodes){
  for (var i = 0; i < nodes.length; i++){
    if (nodes[i].kind === 'lesson' && !DB.state.completed[nodes[i].id]) return i;
  }
  return -1;
}
function wirePathNodes(root, lang){
  root.querySelectorAll('.path-node').forEach(function(n){
    n.addEventListener('click', function(){
      var parts = n.dataset.node.split(':');
      var kind = parts[0], id = parts.slice(1).join(':');
      if (kind === 'lesson') nav('#/lesson/' + id);
      else if (kind === 'verse') APP.verseLang = lang, nav('#/verses/' + lang);
      else if (kind === 'parse') { APP.parseLang = lang; nav('#/parse'); }
      else if (kind === 'quiz') { APP.quizLang = lang; nav('#/quiz'); }
      else if (kind === 'srs') nav('#/srs');
    });
  });
}

/* verses list per language */
function screenVerses(lang){
  var vs = PATH.versesForLang(lang);
  var html = topbar() + '<div class="narrow-wrap" style="padding:14px">' +
    '<button class="btn small ghost" data-back>← Track</button>' +
    '<div class="card-title mt12"><span class="ico">📖</span> Verse-by-Verse Study — ' + E(DB.Langs[lang].short) + '</div>' +
    '<div class="small dim" style="margin-bottom:10px">Every word is tappable and opens the full breakdown card. Multiple source texts (MT/DSS, TR/NA28) are toggleable.</div>' +
    vs.map(function(v){
      var srcs = v._refs.length > 1 ? ' <span class="chip">' + v._refs.length + ' sources</span>' : '';
      return '<div class="res-row" data-vid="' + v.verse_id + '">' +
        '<div class="rscript" style="flex:0 0 auto;min-width:86px">' + E(DB.refLabel(v).split(' ')[0]) + '<div class="rsub">' + v.chapter + ':' + v.verse_num + '</div></div>' +
        '<div class="rmeta"><div class="rgloss">' + E(v.text_en.length > 70 ? v.text_en.slice(0, 70) + '…' : v.text_en) + '</div>' +
        '<div class="rsub">' + DB.sourceLabel(v.source_text) + srcs + (v.apparatus ? ' · ⚑ variant noted' : '') + '</div></div></div>';
    }).join('') +
    '</div>' + bottomnav('home');
  var root = document.getElementById('app');
  root.innerHTML = html;
  wireNav(root);
  root.querySelector('[data-back]').addEventListener('click', function(){ nav('#/'); });
  root.querySelectorAll('[data-vid]').forEach(function(r){
    r.addEventListener('click', function(){ nav('#/verse/' + r.dataset.vid); });
  });
}

/* ============================================================
   VERSE STUDY SCREEN (§4)
   ============================================================ */
function screenVerse(vid, hlWid){
  var v = DB.Verses[vid];
  if (!v){ screenVerseHomeFallback(); return; }
  var refs = DB.verseRefs(vid);
  if (v.language_code === 'lxx') DB.state.counters.lxxOpened = (DB.state.counters.lxxOpened || 0) + 1;
  if (v.language_code === 'heb') DB.state.counters.versesOpened = (DB.state.counters.versesOpened || 0) + 1;
  DB.saveState(); ENGINE.evalBadges();

  var lang = v.language_code;
  var mode = DB.state.settings.dispMode || 'script';
  var vws = DB.vw(vid);
  var dirCls = rtl(lang) ? 'script' : 'script ltr';
  var sizeOrigin = mode === 'script' ? '26px' : '17px';
  var sizeEng = mode === 'english' ? '18px' : '14px';

  function lineFor(srcVerse){
    var rows = DB.vw(srcVerse.verse_id);
    return rows.map(function(rw){
      var w = DB.w(rw.word_id);
      return '<span class="vw' + (hlWid && rw.word_id === hlWid ? ' hl' : '') + '" data-wid="' + rw.word_id + '">' + E(rw.form || w.script) + '</span> ';
    }).join('');
  }
  function translitFor(srcVerse){
    var rows = DB.vw(srcVerse.verse_id);
    return rows.map(function(rw){
      var w = DB.w(rw.word_id);
      return '<span class="vw" data-wid="' + rw.word_id + '">' + E(w.translit) + '</span> ';
    }).join(' ');
  }

  var html = topbar() + '<div class="wide-wrap" style="padding:14px">' +
    '<button class="btn small ghost" data-back>← Verses</button>' +
    '<div class="card-title mt12"><span class="ico">📖</span> <span class="verse-ref">' + E(DB.refLabel(v)) + '</span></div>' +
    '<div class="small dim">' + E(DB.Langs[lang].name) + ' · <span class="chip">' + E((DB.Books[v.book_id]||{}).name || v.book_id) + '</span></div>' +
    (refs.length > 1 ? '<div class="verse-source">' + refs.map(function(r){
      return '<button data-src="' + r.verse_id + '" class="' + (r.verse_id === vid ? 'active' : '') + '">' + DB.sourceLabel(r.source_text) + (r.source_text === 'na28' && DB.vw(r.verse_id).length === 0 ? ' (empty)' : '') + '</button>';
    }).join('') + '</div>' : '<div class="small faint">Source: ' + DB.sourceLabel(v.source_text) + '</div>') +
    '<div class="disp-toggle">' +
      [['script','Script'],['translit','Transliteration'],['english','English']].map(function(d){
        return '<button data-mode="' + d[0] + '" class="' + (mode === d[0] ? 'active' : '') + '">' + d[1] + '</button>';
      }).join('') +
      '<button data-diagram style="margin-left:auto">🌿 Diagram</button>' +
    '</div>' +
    '<div class="verse-block">' +
      '<div class="vline origin ' + (rtl(lang) ? 'rtl' : '') + '" style="font-size:' + sizeOrigin + '">' + lineFor(v) + '</div>' +
      (mode !== 'translit' ? '<div class="vline translit" style="' + (mode === 'script' ? 'font-size:13px' : 'font-size:20px;color:var(--ink)') + '">' + translitFor(v) + '</div>' : '') +
      '<div class="vline english" style="font-size:' + sizeEng + '">' + E(v.text_en) + '</div>' +
      (v.apparatus ? '<div class="apparatus"><b>Textual note ·</b> ' + E(v.apparatus) + '</div>' : '') +
    '</div>' +
    '<div class="small faint center">Tap any word for its root, parsing, Strong’s number, family and occurrences.</div>' +
    adSlot('banner') +
    '</div>' + bottomnav('home');
  var root = document.getElementById('app');
  root.innerHTML = html;
  wireNav(root);
  root.querySelector('[data-back]').addEventListener('click', function(){ nav('#/verses/' + lang); });
  root.querySelectorAll('[data-src]').forEach(function(b){
    b.addEventListener('click', function(){ nav('#/verse/' + b.dataset.src); });
  });
  root.querySelectorAll('[data-mode]').forEach(function(b){
    b.addEventListener('click', function(){
      DB.state.settings.dispMode = b.dataset.mode; DB.saveState(); render();
    });
  });
  root.querySelector('[data-diagram]').addEventListener('click', function(){
    var nodes = DB.SyntaxByVerse[vid];
    if (!nodes){
      toast('Diagram lands with fuller content for this passage');
      return;
    }
    var byParent = {};
    nodes.forEach(function(n){ (byParent[n.parent_node_id || '∅'] = byParent[n.parent_node_id || '∅'] || []).push(n); });
    function branch(pid){
      var kids = byParent[pid] || [];
      if (!kids.length) return '';
      return '<ul>' + kids.map(function(k){
        var label = k.word_id ? DB.w(k.word_id).script : '';
        return '<li><span class="role">' + E(k.clause_role) + '</span>' +
          (k.word_id ? '<span class="tw" data-wid="' + k.word_id + '">' + E(label) + '</span> ' : '') +
          E(k.word_id ? (DB.w(k.word_id).translit) : '') + branch(k.node_id) + '</li>';
      }).join('') + '</ul>';
    }
    modal('<div class="mtag">Syntax diagram</div><h2 style="font-size:17px;margin-bottom:10px">' + E(DB.refLabel(v)) + '</h2><div class="tree">' + branch('∅') + '</div><div class="small faint mt12">Built from the syntax_node table — subject, verb, object and dependent clauses.</div>');
  });
  root.querySelectorAll('.vw[data-wid]').forEach(function(s){
    s.addEventListener('click', function(){
      if (s.dataset.wid) nav('#/word/' + s.dataset.wid + '?from=' + vid);
    });
  });
}
function screenVerseHomeFallback(){ nav('#/'); }

/* ============================================================
   WORD SCREEN (full-page breakdown)
   ============================================================ */
function screenWord(wid, from){
  var w = DB.w(wid);
  if (!w){ nav('#/'); return; }
  var html = topbar() + '<div class="wide-wrap" style="padding:14px">' +
    (from ? '<button class="btn small ghost" data-back>← Verse</button>' : '<button class="btn small ghost" data-back>← Back</button>') +
    '<div class="mt12">' + wordCard(wid) + '</div>' +
    '</div>' + bottomnav('lexicon');
  var root = document.getElementById('app');
  root.innerHTML = html;
  wireNav(root);
  root.querySelector('[data-back]').addEventListener('click', function(){
    if (from) nav('#/verse/' + from); else history.back();
  });
  wireWordCard(root);
}

/* ============================================================
   LESSON PLAYER (Duolingo-style, §9)
   ============================================================ */
var LX = null;
function startLesson(lessonId){
  var lesson = PATH.lessonById(lessonId);
  if (!lesson){ nav('#/'); return; }
  var words = extractLessonWords(lesson);
  LX = { lesson:lesson, phase:'intro', i:0, xp:0, mistakes:0, combo:0, maxCombo:0,
         hearts:DB.state.settings.heartsOn ? DB.state.user.hearts : Infinity,
         words:words, answered:{}, matched:null, picked:null, tray:[], bank:[], startMs:Date.now() };
  var el = document.createElement('div');
  el.id = 'lesson-root';
  document.body.appendChild(el);
  renderLX();
}
function extractLessonWords(lesson){
  var ids = {};
  function add(id){ if (id && DB.w(id)) ids[id] = true; }
  (lesson.ex||[]).forEach(function(e){
    if (e.wid) add(e.wid);
    (e.opts||[]).forEach(function(o){ if (typeof o === 'string') add(o); });
    (e.answer||[]).forEach(add);
    (e.distract||[]).forEach(add);
    (e.pairs||[]).forEach(function(p){ add(p[0]); });
  });
  return Object.keys(ids);
}
function lxtop(){
  var total = LX.lesson.intro.length + LX.lesson.ex.length;
  var done = LX.phase === 'intro' ? LX.i : (LX.i + LX.lesson.intro.length);
  var pct = Math.min(100, Math.round(100 * done / total));
  return '<div class="ltop">' +
    '<button class="lclose" id="lx-close">×</button>' +
    '<div class="lprog"><i style="width:' + pct + '%"></i></div>' +
    (LX.hearts === Infinity ? '<span class="lstat">⚡ ' + LX.xp + '</span>' : '<span class="lstat h">❤ ' + LX.hearts + '</span>') +
    '</div>';
}
function renderLX(){
  var root = document.getElementById('lesson-root');
  if (!LX){ return; }
  var body = '', footer = '';
  var heartsOut = LX.hearts !== Infinity && LX.hearts <= 0;

  if (heartsOut){
    body = '<div class="result"><div class="rico">💔</div><h2>Out of hearts</h2>' +
      '<p class="dim">Like Duolingo, mistakes cost a heart. Hearts refill every day.</p>' +
      adSlot('reward') +
      '<button class="btn primary" id="lx-hearts">♥ Restore 2 hearts (simulated ad)</button>' +
      '<button class="btn ghost mt12" id="lx-quit">Exit lesson</button></div>';
    footer = '';
  }
  else if (LX.phase === 'intro'){
    body = '<div class="lq-title">' + E(LX.lesson.title) + ' · ' + (LX.i + 1) + '/' + LX.lesson.intro.length + '</div><div class="info-card">' + LX.lesson.intro[LX.i] + '</div>';
    footer = '<button class="btn primary block" id="lx-next">' + (LX.i === LX.lesson.intro.length - 1 ? 'Start practice →' : 'Continue →') + '</button>';
  }
  else if (LX.phase === 'exercise'){
    body = renderExercise(LX.lesson.ex[LX.i]);
    footer = renderLXFooter();
  }
  else { /* done */
    body = renderLXResult();
    footer = '';
  }

  root.innerHTML = lxtop() + '<div class="lbody" id="lx-body">' + body + '</div><div class="lfooter" id="lx-footer">' + footer + '</div>';
  wireLX(root);
}
function renderExercise(ex){
  var t = ex.t;
  var head = '<div class="lq-title">Question ' + (LX.i + 1) + ' of ' + LX.lesson.ex.length + '</div>';
  if (t === 'mcq'){
    return head + '<div class="lq-main">' + E(ex.q) + '</div>' +
      ex.opts.map(function(o, i){ return '<button class="opt" data-opt="' + i + '"><span class="onum">' + (i + 1) + '</span><span class="om">' + E(o) + '</span></button>'; }).join('');
  }
  if (t === 'listen'){
    var w = DB.w(ex.wid);
    return head + '<div class="center mt16"><button class="btn primary" id="lx-play" style="font-size:17px">🔊 Play</button>' +
      '<div class="small faint mt12">Tap to hear, then choose the word you heard</div></div>' +
      '<div style="margin-top:18px">' + ex.opts.map(function(oid, i){
        var ow = DB.w(oid);
        return '<button class="opt" data-opt="' + i + '"><span class="onum">' + (i + 1) + '</span><span class="' + (rtl(w.language_code) ? 'script' : 'script ltr') + ' om">' + E(ow.script) + '</span><span class="ogloss">' + E(ow.translit) + '</span></button>';
      }).join('') + '</div>';
  }
  if (t === 'build'){
    var pool = LX.bank;
    return head + '<div class="lq-main" style="font-size:17px">' + E(ex.prompt) + '</div>' +
      '<div class="build-tray" id="lx-tray">' + LX.tray.map(function(id, i){
        var w = DB.w(id);
        return '<span class="token" data-tray="' + i + '"><span class="tmain ' + (rtl(w.language_code) ? '' : '') + '">' + E(w.script) + '</span></span>';
      }).join('') + '</div>' +
      '<div id="lx-bank">' + pool.map(function(id, i){
        var w = DB.w(id);
        return '<span class="token' + (LX.tray.indexOf(id) >= 0 ? ' used' : '') + '" data-bank="' + i + '"><span class="tmain">' + E(w.script) + '</span><span class="tsub">' + E(w.translit) + '</span></span>';
      }).join('') + '</div>';
  }
  if (t === 'type'){
    return head + '<div class="lq-main" style="font-size:17px">' + E(ex.prompt) + '</div>' +
      '<input class="type-input" id="lx-input" autocomplete="off" placeholder="' + E(ex.placeholder || 'type answer…') + '" />';
  }
  if (t === 'match'){
    var left = SC(ex.pairs.map(function(p){ return p[0]; }));
    var right = SC(ex.pairs);
    return head + '<div class="small dim" style="margin-bottom:12px">Match each word with its meaning. Tap one from each side.</div>' +
      '<div class="match-row">' +
      '<div class="match-col">' + left.map(function(id, i){
        var w = DB.w(id);
        return '<button class="match-item" data-side="L" data-i="' + i + '" data-pid="' + id + '"><span class="' + (rtl(w.language_code) ? '' : '') + '">' + E(w.script) + '</span></button>';
      }).join('') + '</div>' +
      '<div class="match-col">' + right.map(function(p, i){
        return '<button class="match-item" data-side="R" data-i="' + i + '" data-pid="' + p[0] + '"><span style="font-size:12.5px">' + E(p[1]) + '</span></button>';
      }).join('') + '</div></div>';
  }
  if (t === 'verse'){
    var v = DB.Verses[ex.vid];
    var rows = DB.vw(ex.vid);
    return head + '<div class="lq-main" style="font-size:15px">Read this passage. You will meet its words in study mode.</div>' +
      '<div class="verse-block" style="margin-top:12px"><div class="vline origin" style="font-size:22px">' + rows.map(function(rw){
        var w = DB.w(rw.word_id); return E(rw.form || w.script) + ' ';
      }).join('') + '</div><div class="vline english" style="margin-top:8px">' + E(v.text_en) + '</div></div>';
  }
  if (t === 'tree'){
    var nodes = DB.SyntaxByVerse[ex.vid];
    var byParent = {};
    (nodes||[]).forEach(function(n){ (byParent[n.parent_node_id || '∅'] = byParent[n.parent_node_id || '∅'] || []).push(n); });
    function branch(pid){
      var kids = byParent[pid] || [];
      if (!kids.length) return '';
      return '<ul>' + kids.map(function(k){
        return '<li><span class="role">' + E(k.clause_role) + '</span>' + (k.word_id ? '<b style="color:var(--gold-bright)">' + E(DB.w(k.word_id).script) + '</b> ' : '') + branch(k.node_id) + '</li>';
      }).join('') + '</ul>';
    }
    return head + '<div class="lq-main" style="font-size:15px">The sentence, diagrammed.</div><div class="tree mt12">' + branch('∅') + '</div>';
  }
  return head + '<div class="info-card">' + E(ex.q || '…') + '</div>';
}
function renderLXFooter(){
  if (LX.locked){
    var ex = LX.lesson.ex[LX.i];
    var show = '';
    if (ex.t === 'mcq'){
      var cw = ex.opts[ex.a];
      var w = ex.wid ? DB.w(ex.wid) : null;
      show = '<span class="fbx">✗</span><span class="fbt">Correct: <b>' + E(cw) + '</b>' + (w ? ' — ' + E(w.gloss_en) : '') + (ex.why ? '<br><span class="small" style="font-weight:400">' + E(ex.why) + '</span>' : '') + '</span>';
    } else if (ex.t === 'build'){
      var ans = ex.answer.map(function(id){ return DB.w(id).script; }).join(' ');
      show = '<span class="fbx">✗</span><span class="fbt">Correct: <b>' + E(ans) + '</b>' + (ex.why ? '<br><span class="small" style="font-weight:400">' + E(ex.why) + '</span>' : '') + '</span>';
    } else if (ex.t === 'type'){
      show = '<span class="fbx">✗</span><span class="fbt">Answer: <b>' + E(ex.accepts[0]) + '</b></span>';
    } else if (ex.t === 'listen'){
      var ow = DB.w(ex.opts[ex.a]);
      show = '<span class="fbx">✗</span><span class="fbt">You heard <b>' + E(ow.script) + '</b> — ' + E(ow.gloss_en) + '</span>';
    } else {
      show = '<span class="fbx">✗</span><span class="fbt">See it above</span>';
    }
    return '<div class="lfeedback bad">' + show + '</div><button class="btn block bad" id="lx-next">Continue</button>';
  }
  if (LX.flocked){
    var ex = LX.lesson.ex[LX.i];
    var good = ex.why ? '<br><span class="small" style="font-weight:400">' + E(ex.why) + '</span>' : '';
    return '<div class="lfeedback ok"><span class="fbx">✓</span><span class="fbt">Correct! +' + lastGain + ' XP' + (LX.combo > 1 ? ' · 🔥 ' + LX.combo + ' combo' : '') + good + '</span></div><button class="btn block ok" id="lx-next">Continue</button>';
  }
  var ex2 = LX.lesson.ex[LX.i];
  var label = ex2.t === 'build' ? 'Check' : (ex2.t === 'type' ? 'Check' : (ex2.t === 'match' ? 'Finish' : 'Continue'));
  var showBtn = (ex2.t === 'build' || ex2.t === 'type' || ex2.t === 'match');
  return showBtn ? '<button class="btn primary block" id="lx-check" ' + (ex2.t === 'match' ? '' : '') + '>' + label + '</button>' : '<button class="btn primary block" id="lx-skip">Skip (no XP)</button>';
}
var lastGain = 0;
function wireLX(root){
  var close = root.querySelector('#lx-close');
  if (close) close.addEventListener('click', function(){
    if (LX && confirm('Leave this lesson? Progress in it is lost.')) endLessonUI(false);
  });
  var body = root.querySelector('#lx-body');
  var footer = root.querySelector('#lx-footer');
  function next(){
    if (LX.phase === 'intro'){ LX.i++; if (LX.i >= LX.lesson.intro.length){ LX.phase = 'exercise'; LX.i = 0; LX.tray = []; LX.bank = SC(extractBank(LX.lesson.ex[0]||{})); } renderLX(); }
    else if (LX.phase === 'exercise'){ LX.locked = false; LX.flocked = false; LX.tray = []; LX.i++; if (LX.i >= LX.lesson.ex.length) LX.phase = 'done'; else LX.bank = SC(extractBank(LX.lesson.ex[LX.i])); renderLX(); }
  }
  var nb = footer.querySelector('#lx-next');
  if (nb) nb.addEventListener('click', next);
  var done = root.querySelector('#lx-done');
  if (done) done.addEventListener('click', function(){ endLessonUI(true); nav('#/'); });
  var hb = footer ? footer.querySelector('#lx-hearts') : null;
  if (!hb) hb = body.querySelector('#lx-hearts');
  if (hb) hb.addEventListener('click', function(){
    DB.gainHearts(2);
    LX.hearts = DB.state.settings.heartsOn ? DB.state.user.hearts : Infinity;
    toast('+2 hearts — back to it!');
    renderLX();
  });
  var qb = footer ? footer.querySelector('#lx-quit') : null;
  if (!qb) qb = body.querySelector('#lx-quit');
  if (qb) qb.addEventListener('click', function(){ endLessonUI(false); nav('#/'); });
  var sk = footer.querySelector('#lx-skip');
  if (sk) sk.addEventListener('click', function(){ next(); });
  var chk = footer.querySelector('#lx-check');
  if (chk) chk.addEventListener('click', function(){
    var ex = LX.lesson.ex[LX.i];
    if (ex.t === 'build') checkBuild(ex);
    else if (ex.t === 'type') checkType(ex);
  });
  var play = body.querySelector('#lx-play');
  if (play) play.addEventListener('click', function(){
    var ex = LX.lesson.ex[LX.i];
    ENGINE.speakWord(ex.wid, DB.state.settings.pronConv[DB.w(ex.wid).language_code]);
  });
  /* mcq / listen options */
  body.querySelectorAll('[data-opt]').forEach(function(b){
    b.addEventListener('click', function(){
      if (LX.locked || LX.flocked) return;
      var ex = LX.lesson.ex[LX.i];
      var pick = parseInt(b.dataset.opt, 10);
      var isRight = pick === ex.a;
      body.querySelectorAll('[data-opt]').forEach(function(x, i){
        x.disabled = true;
        if (i === ex.a) x.classList.add('correct');
        else if (i === pick && !isRight) x.classList.add('wrong');
      });
      settle(isRight, ex);
    });
  });
  /* build */
  body.querySelectorAll('[data-bank]').forEach(function(b){
    b.addEventListener('click', function(){
      if (LX.locked || LX.flocked) return;
      var id = LX.bank[parseInt(b.dataset.bank, 10)];
      if (LX.tray.indexOf(id) >= 0) return;
      LX.tray.push(id);
      renderLX();
    });
  });
  body.querySelectorAll('[data-tray]').forEach(function(t){
    t.addEventListener('click', function(){
      if (LX.locked || LX.flocked) return;
      LX.tray.splice(parseInt(t.dataset.tray, 10), 1);
      renderLX();
    });
  });
  var input = body.querySelector('#lx-input');
  if (input){
    input.addEventListener('keydown', function(e){
      if (e.key === 'Enter'){
        var ex = LX.lesson.ex[LX.i];
        var v = ENGINE.normKey(input.value);
        var ok = ex.accepts.map(ENGINE.normKey).indexOf(v) >= 0;
        settle(ok, ex);
      }
    });
  }
  /* match */
  var matchState = { L:null, R:null, done:0 };
  body.querySelectorAll('.match-item').forEach(function(b){
    b.addEventListener('click', function(){
      if (LX.locked || LX.flocked || b.classList.contains('done')) return;
      var side = b.dataset.side;
      matchState[side] = b;
      b.classList.add('sel');
      var Lb = matchState.L, Rb = matchState.R;
      if (Lb && Rb){
        if (Lb.dataset.pid === Rb.dataset.pid){
          Lb.classList.remove('sel'); Rb.classList.remove('sel');
          Lb.classList.add('good'); Rb.classList.add('good');
          setTimeout(function(){ Lb.classList.add('done'); Rb.classList.add('done'); }, 260);
          matchState.L = matchState.R = null;
          matchState.done++;
          if (matchState.done >= LX.lesson.ex[LX.i].pairs.length) setTimeout(function(){ settle(true, LX.lesson.ex[LX.i]); }, 300);
        } else {
          Lb.classList.add('wrong'); Rb.classList.add('wrong');
          LX.mistakes++; LX.combo = 0;
          if (DB.state.settings.heartsOn){ LX.hearts--; DB.loseHeart(); }
          setTimeout(function(){
            Lb.classList.remove('wrong','sel'); Rb.classList.remove('wrong','sel');
            matchState.L = matchState.R = null;
          }, 500);
        }
      }
    });
  });
  function settle(ok, ex){
    if (ok){
      var gain = ex.t === 'match' ? 20 : (ex.t === 'build' ? 15 : 10);
      if (LX.combo >= 2) gain += 2;
      lastGain = gain;
      LX.xp += gain; LX.combo++; LX.maxCombo = Math.max(LX.maxCombo, LX.combo);
      LX.flocked = true;
      logLXEvent(ex, true, null);
    } else {
      lastGain = 0;
      LX.mistakes++; LX.combo = 0;
      if (DB.state.settings.heartsOn){ LX.hearts--; DB.loseHeart(); }
      LX.locked = true;
      logLXEvent(ex, false, null);
    }
    renderLX();
  }
}
function extractBank(ex){
  if (ex.t !== 'build') return [];
  return (ex.answer || []).concat(ex.distract || []);
}
function checkBuild(ex){
  if (LX.tray.length === 0) return;
  var ok = LX.tray.length === ex.answer.length && LX.tray.every(function(id, i){ return id === ex.answer[i]; });
  if (ok) settle(true, ex);
  else { settle(false, ex); setTimeout(function(){ LX.tray = []; LX.locked = false; renderLX(); }, 400); }
}
function checkType(ex){
  var input = document.getElementById('lx-input');
  if (!input) return;
  var v = ENGINE.normKey(input.value);
  settle(ex.accepts.map(ENGINE.normKey).indexOf(v) >= 0, ex);
}
function logLXEvent(ex, correct, ms){
  var wid = ex.wid || null;
  if (!wid){
    if (ex.t === 'mcq' && ex.opts) { /* find word by option */ }
    if (ex.t === 'listen') wid = ex.wid;
    if (ex.t === 'build') wid = (ex.answer && ex.answer[0]) || null;
    if (ex.t === 'match' && ex.pairs) wid = ex.pairs[0][0];
    if (ex.t === 'type') wid = null;
  }
  if (wid) DB.logEvent('quiz_answer', wid, correct, ms);
}
function renderLXResult(){
  var bonus = 20;
  var perfect = LX.mistakes === 0;
  if (perfect) bonus += 10;
  var totalXp = LX.xp + bonus;
  var leveled = DB.addXP(totalXp);
  var fresh = ENGINE.evalBadges();
  /* mark lesson words as seen (enters SRS pipeline) */
  LX.words.forEach(function(wid){
    var p = DB.ensureProg(wid);
    if (!p.seen){ p.seen = 1; p.next_review_at = Date.now() + 86400000; }
  });
  DB.state.completed[LX.lesson.id] = { xp: totalXp, mistakes: LX.mistakes, at: Date.now() };
  if (perfect) DB.state.counters.perfectLessons = (DB.state.counters.perfectLessons || 0) + 1;
  DB.saveState();
  var wordChips = LX.words.slice(0, 8).map(function(wid){
    var w = DB.w(wid);
    return '<span class="chip gold">' + E(w.script) + ' <span class="faint" style="font-size:10px">' + E(w.translit) + '</span></span>';
  }).join(' ');
  return '<div class="result">' +
    '<div class="rico">' + (perfect ? '👑' : '📜') + '</div>' +
    '<h2>' + (perfect ? 'Flawless lesson!' : 'Lesson complete!') + '</h2>' +
    '<div class="small dim">' + E(LX.lesson.title) + ' — ' + E(DB.Langs[LX.lesson.lang].short) + '</div>' +
    '<div class="rstats">' +
      '<div class="rstat"><b>+' + totalXp + '</b><span>XP</span></div>' +
      '<div class="rstat"><b>' + (perfect ? '0' : LX.mistakes) + '</b><span>Mistakes</span></div>' +
      '<div class="rstat"><b>' + LX.maxCombo + '</b><span>Best combo</span></div>' +
      '<div class="rstat"><b>' + LX.words.length + '</b><span>Words learned</span></div>' +
    '</div>' +
    '<div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin-bottom:14px">' + wordChips + '</div>' +
    '<div class="small dim center" style="margin-bottom:10px">These words entered your <b>spaced-repetition</b> deck — you’ll see them again when due.</div>' +
    (leveled ? '<div class="chip gold center" style="display:flex;margin:0 auto 10px">🎖 Level up! You are now a ' + E(ENGINE.levelForXp(DB.state.user.xp).title) + '</div>' : '') +
    (fresh.length ? '<div class="chip gold center" style="display:flex;margin:0 auto 10px">🏅 New badge: ' + E(ENGINE.BADGES.find(function(b){ return b.id === fresh[0].id; }).name) + '</div>' : '') +
    adSlot('reward') +
    '<button class="btn primary" id="lx-done">Continue →</button>' +
    '</div>';
}
function endLessonUI(claim){
  if (LX && claim && LX.phase === 'exercise'){ /* nothing */ }
  var el = document.getElementById('lesson-root');
  if (el) el.remove();
  LX = null;
  render();
}

/* ============================================================
   SRS SESSION (§9) — also used for "weak spots"
   ============================================================ */
var SRS = null;
function startSRS(queue){
  var q = (queue && queue.length) ? queue : (APP.srsQueue || []);
  APP.srsQueue = null;
  if (!q.length) q = ENGINE.dueReviews().map(function(r){ return r.word_id; });
  if (!q.length){
    modal('<div class="mtag">Spaced repetition</div><h2 style="font-size:19px">Nothing due yet</h2><div class="dim mt8">Finish a vocabulary lesson and words enter your SM-2 deck. New words are scheduled for tomorrow; due reviews appear here.</div><div class="mt16"><button class="btn primary" data-close>OK</button></div>');
    return;
  }
  SRS = { queue:q, i:0, revealed:false, t0:Date.now(), good:0, again:0, xp:0 };
  nav('#/srs');
}
function screenSrs(){
  if (!SRS){ startSRS(null); return; }
  var q = SRS.queue;
  var w = DB.w(q[SRS.i]);
  var lang = w.language_code;
  var mode = DB.state.settings.dispMode || 'script';
  var conv = DB.state.settings.pronConv[lang] || ENGINE.defaultConv(lang);
  var pct = Math.round(100 * SRS.i / q.length);
  var m = w.morphology || {};

  var html = topbar() + '<div class="srs-wrap" style="padding:14px">' +
    '<div class="card-title"><span class="ico">🔁</span> Spaced repetition <span class="due-chip" style="margin-left:auto">' + (SRS.i + 1) + ' / ' + q.length + '</span></div>' +
    '<div class="progress-line"><i style="width:' + pct + '%"></i></div>' +
    '<div class="panel" style="text-align:center;padding:26px 14px">' +
      '<div class="small faint" style="margin-bottom:10px">' + E(DB.Langs[lang].short) + ' · ' + (w.strong_number ? (lang.indexOf('grc') === 0 || lang === 'lxx' ? 'G' : 'H') + w.strong_number : '') + '</div>' +
      '<div class="srs-front ' + (rtl(lang) ? '' : 'ltr') + '">' + (mode === 'script' ? E(w.script) : E(w.translit)) + '</div>' +
      '<button class="btn small ghost" id="srs-play">🔊 ' + E(ENGINE.convLabel(lang).find(function(c){ return c[0] === conv; })[1]) + '</button>' +
      (!SRS.revealed ? '' :
        '<div class="divider"></div>' +
        '<div class="serif" style="font-size:20px;color:var(--gold-bright)">' + E(mode === 'script' ? w.translit : w.script) + '</div>' +
        '<div style="font-size:17px;margin-top:6px">' + E(w.gloss_en) + '</div>' +
        (Object.keys(m).length ? '<div class="small dim mt8">' + E(ENGINE.morphText(m)) + '</div>' : '') +
        (w.root_id ? '<div class="small dim mt4">root ' + E(DB.Roots[w.root_id].root_form) + '</div>' : '') +
        '<div class="srs-controls mt16">' +
          '<button class="btn bad" data-q="1">😓 Again</button>' +
          '<button class="btn" data-q="3">🤔 Hard</button>' +
          '<button class="btn ok" data-q="4">🙂 Good</button>' +
          '<button class="btn primary" data-q="5">😎 Easy</button>' +
        '</div>') +
      (SRS.revealed ? '' : '<button class="btn primary block mt16" id="srs-reveal">Show answer</button>') +
    '</div>' +
    '</div>' + bottomnav('practice');
  var root = document.getElementById('app');
  root.innerHTML = html;
  wireNav(root);
  root.querySelector('#srs-play').addEventListener('click', function(){ ENGINE.speakWord(w.word_id, conv); });
  var rev = root.querySelector('#srs-reveal');
  if (rev) rev.addEventListener('click', function(){ SRS.revealed = true; render(); });
  root.querySelectorAll('[data-q]').forEach(function(b){
    b.addEventListener('click', function(){
      var qv = parseInt(b.dataset.q, 10);
      var ms = Date.now() - SRS.t0;
      var p = DB.srsReview(w.word_id, qv, ms);
      DB.logEvent('flashcard_review', w.word_id, qv >= 3, ms);
      var gain = qv >= 5 ? 3 : (qv >= 3 ? 2 : 0);
      SRS.xp += gain;
      if (qv >= 3) SRS.good++; else SRS.again++;
      DB.addXP(gain);
      SRS.i++; SRS.revealed = false; SRS.t0 = Date.now();
      if (SRS.i >= q.length) finishSRS();
      else render();
    });
  });
}
function finishSRS(){
  var fresh = ENGINE.evalBadges();
  var html = topbar() + '<div class="srs-wrap" style="padding:14px">' +
    '<div class="result"><div class="rico">🔁</div><h2>Review complete</h2>' +
    '<div class="rstats"><div class="rstat"><b>' + SRS.good + '</b><span>Recalled</span></div><div class="rstat"><b>' + SRS.again + '</b><span>Again</span></div><div class="rstat"><b>+' + SRS.xp + '</b><span>XP</span></div></div>' +
    '<div class="small dim center">Intervals updated by SM-2: good answers stretch your next review; “again” brings words back quickly.</div>' +
    (fresh.length ? '<div class="chip gold" style="display:flex;margin:12px auto 0">🏅 ' + E(ENGINE.BADGES.find(function(b){ return b.id === fresh[0].id; }).name) + ' unlocked</div>' : '') +
    '<button class="btn primary mt16" id="srs-back">Back to Home</button></div>' +
    '</div>' + bottomnav('practice');
  document.getElementById('app').innerHTML = html;
  wireNav(document.getElementById('app'));
  document.getElementById('srs-back').addEventListener('click', function(){ SRS = null; nav('#/'); });
}

/* ============================================================
   QUIZ (auto-generated from word + morphology_tag, §9)
   ============================================================ */
var QZ = null;
function genQuiz(lang){
  var words = DB.langWords(lang).filter(function(w){ return w.morphology && Object.keys(w.morphology).length || w.gloss_en; });
  var qs = [];
  function pick4(pool, self){
    var others = SC(pool.filter(function(x){ return x.word_id !== self; })).slice(0, 3);
    return SC([self].concat(others.map(function(x){ return x.word_id; })));
  }
  /* gloss -> word */
  var pool = SC(words).slice(0, 14);
  pool.forEach(function(w, i){
    if (i % 2 === 0){
      var opts = pick4(words, w.word_id);
      qs.push({ type:'g2w', wid:w.word_id, q:'Which word means “' + w.gloss_en + '”?', opts:opts, a:opts.indexOf(w.word_id) });
    } else {
      var opts2 = pick4(words, w.word_id);
      var glosses = opts2.map(function(id){ return DB.w(id).gloss_en; });
      qs.push({ type:'w2g', wid:w.word_id, q:'What does this word mean?', show:DB.w(w.word_id), opts:glosses, a:glosses.indexOf(w.gloss_en) });
    }
  });
  /* parsing */
  var parseWords = words.filter(function(w){ return w.morphology.pos; }).slice(0, 6);
  parseWords.forEach(function(w){
    var correct = ENGINE.morphText(w.morphology);
    var distr = [];
    words.forEach(function(o){
      if (o.word_id !== w.word_id && o.morphology.pos === w.morphology.pos){
        var t = ENGINE.morphText(o.morphology);
        if (t !== correct && distr.indexOf(t) < 0) distr.push(t);
      }
    });
    var opts = SC([correct].concat(SC(distr).slice(0, 3)));
    qs.push({ type:'parse', wid:w.word_id, show:DB.w(w.word_id), q:'How is this word parsed?', opts:opts, a:opts.indexOf(correct) });
  });
  /* family */
  var famWords = words.filter(function(w){
    var r = w.root_id && DB.Roots[w.root_id];
    if (!r) return false;
    var f = DB.family(r.family_id);
    return f.roots.length >= 2;
  }).slice(0, 4);
  famWords.forEach(function(w){
    var r = DB.Roots[w.root_id];
    var f = DB.family(r.family_id);
    var otherLangs = f.roots.filter(function(rr){
      var target = rr.language_code !== w.language_code;
      return target && f.words.some(function(x){ return x.root_id === rr.root_id; });
    });
    if (!otherLangs.length) return;
    var target = otherLangs[0];
    var tw = f.words.filter(function(x){ return x.root_id === target.root_id; })[0];
    var correctW = tw.word_id;
    var pool2 = SC(DB.langWords(target.language_code)).slice(0, 4);
    if (pool2.indexOf(tw) < 0) pool2[3] = tw;
    var opts = pool2.map(function(x){ return x.word_id; });
    qs.push({ type:'fam', wid:w.word_id, show:w, targetWord:tw, q:'“' + w.gloss_en + '” in ' + DB.Langs[w.language_code].short + ' — which is its ' + DB.Langs[target.language_code].short + ' cognate in this root family?', opts:opts, a:opts.indexOf(correctW) });
  });
  /* type translit */
  SC(words).slice(0, 4).forEach(function(w){
    qs.push({ type:'type', wid:w.word_id, show:w, q:'Type the transliteration of this word', accepts:[w.translit] });
  });
  return SC(qs).slice(0, 10);
}
function screenQuiz(){
  if (!QZ){
    var lang = APP.quizLang || curLang();
    QZ = { lang:lang, qs:genQuiz(lang), i:0, score:0, xp:0, wrong:[], t0:Date.now() };
  }
  if (QZ.i >= QZ.qs.length) return quizResult();
  var q = QZ.qs[QZ.i];
  var html = topbar() + '<div class="srs-wrap" style="padding:14px">' +
    '<button class="btn small ghost" id="qz-exit">Exit</button>' +
    '<div class="card-title mt12"><span class="ico">🎯</span> Quiz — ' + E(DB.Langs[QZ.lang].short) + ' <span class="chip" style="margin-left:auto">' + (QZ.i + 1) + ' / ' + QZ.qs.length + '</span></div>' +
    '<div class="progress-line"><i style="width:' + Math.round(100 * QZ.i / QZ.qs.length) + '%"></i></div>' +
    '<div class="q-item">' +
      (q.show ? '<div class="serif ' + (rtl(q.show.language_code) ? 'script' : 'script ltr') + '" style="font-size:30px;text-align:center;color:var(--gold-bright);margin-bottom:4px">' + E(q.show.script) + '</div><div class="small dim center">' + E(q.show.translit) + '</div>' : '') +
      '<div class="serif" style="font-size:16px;margin:10px 0 14px;text-align:center">' + E(q.q) + '</div>' +
      (q.type === 'type' ? '<input class="type-input" id="qz-input" autocomplete="off" placeholder="type here…">' :
        q.opts.map(function(o, i){
          if (q.type === 'g2w' || q.type === 'fam'){
            var w = DB.w(o);
            return '<button class="opt" data-opt="' + i + '"><span class="onum">' + (i + 1) + '</span><span class="script om">' + E(w.script) + '</span><span class="ogloss">' + E(w.translit) + '</span></button>';
          }
          return '<button class="opt" data-opt="' + i + '"><span class="onum">' + (i + 1) + '</span><span class="om" style="font-size:13.5px">' + E(o) + '</span></button>';
        }).join('')) +
    '</div></div>' + bottomnav('practice');
  var root = document.getElementById('app');
  root.innerHTML = html;
  wireNav(root);
  root.querySelector('#qz-exit').addEventListener('click', function(){ if (confirm('Leave the quiz?')) { QZ = null; nav('#/'); } });
  root.querySelectorAll('[data-opt]').forEach(function(b){
    b.addEventListener('click', function(){
      var pick = parseInt(b.dataset.opt, 10);
      var ok = pick === q.a;
      var ms = Date.now() - QZ.t0;
      QZ.finishAnswer(ok, ms);
    });
  });
  var input = root.querySelector('#qz-input');
  if (input){
    input.addEventListener('keydown', function(e){
      if (e.key === 'Enter'){
        var ok = q.accepts.map(ENGINE.normKey).indexOf(ENGINE.normKey(input.value)) >= 0;
        QZ.finishAnswer(ok, Date.now() - QZ.t0);
      }
    });
  }
}
function protoQuizFinish(){ /* defined after QZ is created */ }
function quizAnswer(ok, ms){
  var q = QZ.qs[QZ.i];
  if (ok){ QZ.score++; var g = 10; QZ.xp += g; DB.addXP(g); DB.logEvent('quiz_answer', q.wid, true, ms); }
  else { QZ.wrong.push(q); DB.logEvent('quiz_answer', q.wid, false, ms); }
  if (q.type === 'fam' && ok) DB.state.counters.quizFamilyCorrect = (DB.state.counters.quizFamilyCorrect || 0) + 1;
  QZ.i++; QZ.t0 = Date.now();
  render();
}
function quizResult(){
  ENGINE.evalBadges();
  var wrongList = QZ.wrong.slice(0, 5).map(function(q){
    var w = q.show || DB.w(q.wid);
    return '<div class="family-row"><span class="flang">' + (q.type === 'parse' ? 'parse' : q.type === 'fam' ? 'family' : 'gloss') + '</span><span class="fscript">' + E(w.script) + '</span><span class="fgloss">' + E(w.gloss_en) + '</span></div>';
  }).join('');
  var html = topbar() + '<div style="padding:14px">' +
    '<div class="result"><div class="rico">' + (QZ.score >= 8 ? '🏆' : QZ.score >= 5 ? '📜' : '✍️') + '</div>' +
    '<h2>' + QZ.score + ' / ' + QZ.qs.length + '</h2>' +
    '<div class="rstats"><div class="rstat"><b>+' + QZ.xp + '</b><span>XP</span></div><div class="rstat"><b>' + (QZ.qs.length - QZ.score) + '</b><span>Missed</span></div></div>' +
    (wrongList ? '<div class="panel mt16" style="text-align:left"><div class="card-title"><span class="ico">🔍</span> Review these</div>' + wrongList + '</div>' : '<div class="small dim center">A clean sweep — every question right.</div>') +
    '<button class="btn primary mt16" id="qz-again">New quiz</button> <button class="btn ghost mt16" id="qz-home">Home</button>' +
    '</div></div>' + bottomnav('practice');
  document.getElementById('app').innerHTML = html;
  wireNav(document.getElementById('app'));
  document.getElementById('qz-again').addEventListener('click', function(){ QZ = { lang:QZ.lang, qs:genQuiz(QZ.lang), i:0, score:0, xp:0, wrong:[], t0:Date.now() }; render(); });
  document.getElementById('qz-home').addEventListener('click', function(){ QZ = null; nav('#/'); });
}

/* ============================================================
   INTERACTIVE VERSE PARSING (§9)
   ============================================================ */
var PS = null;
function screenParse(){
  var lang = APP.parseLang || curLang();
  if (!PS || PS.lang !== lang){
    var vs = PATH.versesForLang(lang);
    var html = topbar() + '<div class="narrow-wrap" style="padding:14px">' +
      '<button class="btn small ghost" data-back>← Track</button>' +
      '<div class="card-title mt12"><span class="ico">🧩</span> Verse Parsing — ' + E(DB.Langs[lang].short) + '</div>' +
      '<div class="small dim" style="margin-bottom:10px">Pick a passage. Tap each word and name its parsing before the answer reveals. +15 XP per correct parse.</div>' +
      vs.map(function(v){
        return '<div class="res-row" data-vid="' + v.verse_id + '"><div class="rscript" style="flex:0 0 auto;min-width:80px">' + E(((DB.Books[v.book_id]||{}).name||'').split(' ')[0]) + '<div class="rsub">' + v.chapter + ':' + v.verse_num + '</div></div>' +
          '<div class="rmeta"><div class="rgloss">' + E(v.text_en.length > 60 ? v.text_en.slice(0, 60) + '…' : v.text_en) + '</div><div class="rsub">' + DB.sourceLabel(v.source_text) + ' · ' + DB.vw(v.verse_id).length + ' words</div></div></div>';
      }).join('') + '</div>' + bottomnav('practice');
    var root = document.getElementById('app');
    root.innerHTML = html;
    wireNav(root);
    root.querySelector('[data-back]').addEventListener('click', function(){ nav('#/'); });
    root.querySelectorAll('[data-vid]').forEach(function(r){
      r.addEventListener('click', function(){
        PS = { lang:lang, vid:r.dataset.vid, done:{}, wrong:{}, solved:0, total:DB.vw(r.dataset.vid).length, xp:0 };
        render();
      });
    });
    return;
  }
  /* session view */
  var v = DB.Verses[PS.vid];
  var rows = DB.vw(PS.vid);
  var solved = rows.filter(function(rw){ return PS.done[rw.word_id + ':' + rw.position]; }).length;
  var html = topbar() + '<div class="wide-wrap" style="padding:14px">' +
    '<button class="btn small ghost" id="ps-exit">← Passages</button>' +
    '<div class="card-title mt12"><span class="ico">🧩</span> Parsing — <span class="verse-ref">' + E(DB.refLabel(v)) + '</span></div>' +
    '<div class="progress-line"><i style="width:' + Math.round(100 * solved / PS.total) + '%"></i></div>' +
    '<div class="verse-block"><div class="vline origin" style="font-size:21px">' + rows.map(function(rw){
      var key = rw.word_id + ':' + rw.position;
      var w = DB.w(rw.word_id);
      var cls = PS.done[key] ? 'done' : (PS.wrong[key] ? 'wrong' : '');
      return '<span class="parse-chip ' + cls + '" data-key="' + key + '" data-wid="' + rw.word_id + '" data-pos="' + rw.position + '">' + E(rw.form || w.script) + '</span>';
    }).join('') + '</div><div class="vline english" style="margin-top:10px">' + E(v.text_en) + '</div></div>' +
    '<div class="small faint">Tap a word → identify its parsing. Green = solved, red = try again.</div>' +
    '</div>' + bottomnav('practice');
  var root = document.getElementById('app');
  root.innerHTML = html;
  wireNav(root);
  root.querySelector('#ps-exit').addEventListener('click', function(){ PS = null; render(); });
  root.querySelectorAll('.parse-chip').forEach(function(c){
    c.addEventListener('click', function(){
      if (c.classList.contains('done')) return;
      var wid = c.dataset.wid;
      var w = DB.w(wid);
      var correct = ENGINE.morphText(w.morphology);
      var distr = [];
      DB.langWords(w.language_code).forEach(function(o){
        if (o.word_id !== wid && o.morphology.pos === w.morphology.pos){
          var t = ENGINE.morphText(o.morphology);
          if (t !== correct && distr.indexOf(t) < 0) distr.push(t);
        }
      });
      var opts = SC([correct].concat(SC(distr).slice(0, 3)));
      modal('<div class="mtag">Parse this word</div>' +
        '<div class="' + (rtl(w.language_code) ? 'script' : 'script ltr') + '" style="font-size:34px;text-align:center;color:var(--gold-bright)">' + E(w.script) + '</div>' +
        '<div class="dim center" style="margin:4px 0 14px">' + E(w.translit) + ' · ' + E(w.gloss_en) + '</div>' +
        opts.map(function(o, i){ return '<button class="opt" data-pi="' + i + '"><span class="onum">' + (i + 1) + '</span><span class="om" style="font-size:13px">' + E(o) + '</span></button>'; }).join('') +
        '<div class="small faint mt12" id="ps-why"></div>', function(mroot){
        mroot.querySelectorAll('[data-pi]').forEach(function(b){
          b.addEventListener('click', function(){
            var pick = parseInt(b.dataset.pi, 10);
            var key = c.dataset.key;
            if (pick === opts.indexOf(correct)){
              PS.done[key] = true; PS.solved++;
              PS.xp += 15; DB.addXP(15);
              DB.state.counters.parsesCorrect = (DB.state.counters.parsesCorrect || 0) + 1;
              DB.logEvent('parse_attempt', wid, true, null);
              ENGINE.evalBadges();
              closeModal(); render();
            } else {
              PS.wrong[key] = true;
              b.classList.add('wrong');
              mroot.querySelector('#ps-why').innerHTML = 'Not quite — the ' + correct.split(' · ')[0] + ' answer is marked <b style="color:var(--ok)">green</b> below.';
              mroot.querySelectorAll('[data-pi]').forEach(function(x, i){ if (i === opts.indexOf(correct)) x.classList.add('correct'); x.disabled = true; });
            }
          });
        });
      });
    });
  });
  /* completion */
  var allDone = rows.every(function(rw){ return PS.done[rw.word_id + ':' + rw.position]; });
  if (allDone){
    modal('<div class="result" style="padding:24px 10px"><div class="rico">🧩</div><h2>Parsed it all!</h2>' +
      '<div class="small dim">' + E(DB.refLabel(v)) + ' · +15 XP per word · ' + PS.xp + ' XP this session</div>' +
      '<button class="btn primary mt16" data-close>Keep going</button></div>');
  }
}

/* ============================================================
   LEXICON / CONCORDANCE (§10)
   ============================================================ */
var LEX = { q:'', lang:'all' };
function lexSearch(){
  var q = LEX.q.trim();
  if (!q) return [];
  var nq = ENGINE.normKey(q);
  var strongRe = /^([hg])(\d{1,5})$/i.exec(q);
  var out = [];
  DB.word.forEach(function(w){
    if (LEX.lang !== 'all' && w.language_code !== LEX.lang) return;
    var hay = ENGINE.normKey(w.script + ' ' + w.translit + ' ' + w.gloss_en);
    if (strongRe){
      var langOk = (strongRe[1].toLowerCase() === 'h' && (w.language_code === 'heb' || w.language_code === 'arc' || w.language_code === 'targum')) ||
                   (strongRe[1].toLowerCase() === 'g' && (w.language_code === 'grc-nt' || w.language_code === 'lxx'));
      if (langOk && w.strong_number === parseInt(strongRe[2], 10)) out.push({ w:w, hit:'strong' });
      return;
    }
    if (hay.indexOf(nq) >= 0) out.push({ w:w, hit:'full' });
    else if (nq.length >= 3 && w.translit && ENGINE.lev(nq, ENGINE.normKey(w.translit)) <= 2) out.push({ w:w, hit:'fuzzy' });
  });
  out.sort(function(a, b){
    if (a.hit !== b.hit) return a.hit === 'strong' ? -1 : (b.hit === 'strong' ? 1 : (a.hit === 'full' ? -1 : 1));
    return (a.w.frequency_rank || 999) - (b.w.frequency_rank || 999);
  });
  return out.slice(0, 30);
}
function screenLexicon(){
  var res = lexSearch();
  var html = topbar() + '<div class="narrow-wrap" style="padding:14px">' +
    '<div class="card-title"><span class="ico">🔎</span> Lexicon & Concordance</div>' +
    '<div class="small dim" style="margin-bottom:8px">Search script, transliteration, English or Strong’s number (H430 · G3056). Every result links to full occurrences.</div>' +
    '<div class="searchbox"><input id="lex-input" placeholder="e.g. λόγος · barā · light · H776" value="' + E(LEX.q) + '"></div>' +
    '<div class="seg">' +
      ['all','heb','grc-nt','arc','lat'].map(function(l){
        return '<button data-lexlang="' + l + '" class="' + (LEX.lang === l ? 'active' : '') + '">' + (l === 'all' ? 'All languages' : E(DB.Langs[l].short)) + '</button>';
      }).join('') + '</div>' +
    (LEX.q ? (res.length ? res.map(function(r){
      var w = r.w;
      var occ = DB.occ(w.word_id).length;
      return '<div class="res-row" data-wid="' + w.word_id + '">' +
        '<div class="rscript ' + (rtl(w.language_code) ? '' : 'ltr') + '">' + E(w.script.length > 9 ? w.script.slice(0, 9) : w.script) + '</div>' +
        '<div class="rmeta"><div class="rgloss">' + E(w.gloss_en) + '</div>' +
        '<div class="rsub">' + E(w.translit) + ' · ' + E(DB.Langs[w.language_code].short) + (w.strong_number ? ' · ' + (w.language_code.indexOf('grc') === 0 || w.language_code === 'lxx' ? 'G' : 'H') + w.strong_number : '') + (occ ? ' · ' + occ + ' occurrences' : '') + '</div></div>' +
        '<span style="color:var(--gold)">→</span></div>';
    }).join('') : '<div class="panel hollow center" style="border:none;color:var(--ink-faint)">No matches — try the transliteration or a Strong’s number.</div>') :
      '<div class="small faint center" style="padding:26px 0">Search the entire word table — 166 words, 4 languages, one index.</div>') +
    '</div>' + bottomnav('lexicon');
  var root = document.getElementById('app');
  root.innerHTML = html;
  wireNav(root);
  var input = root.querySelector('#lex-input');
  var t;
  input.addEventListener('input', function(){
    clearTimeout(t);
    t = setTimeout(function(){ LEX.q = input.value; render(); }, 220);
  });
  root.querySelectorAll('[data-lexlang]').forEach(function(b){
    b.addEventListener('click', function(){ LEX.lang = b.dataset.lexlang; render(); });
  });
  root.querySelectorAll('[data-wid]').forEach(function(r){
    r.addEventListener('click', function(){ nav('#/word/' + r.dataset.wid); });
  });
  setTimeout(function(){ input.focus(); }, 60);
}

/* ============================================================
   TRANSLATION TOOL (§11 — dictionary only, no AI)
   ============================================================ */
var TR = { src:'en', tgt:'all', q:'' };
function screenTranslate(){
  var q = TR.q;
  var res = q ? DB.lookupGlossary(q, TR.src, TR.tgt === 'all' ? null : [TR.tgt]) : null;
  function resCard(r){
    var w = r.word;
    var badge = r.quality === 'exact' ? '<span class="tag">exact match</span>' : (r.quality === 'close' ? '<span class="tag plain">close match</span>' : '<span class="tag plain">fuzzy match</span>');
    return '<div class="res-row" data-wid="' + w.word_id + '">' +
      '<div class="rscript ' + (rtl(w.language_code) ? '' : 'ltr') + '">' + E(w.script.length > 9 ? w.script.slice(0, 9) : w.script) + '</div>' +
      '<div class="rmeta"><div class="rgloss">' + E(w.gloss_en) + ' <span class="faint">· ' + E(DB.Langs[w.language_code].short) + '</span></div>' +
      '<div class="rsub">' + E(w.translit) + (w.strong_number ? ' · ' + (w.language_code.indexOf('grc') === 0 || w.language_code === 'lxx' ? 'G' : 'H') + w.strong_number : '') + '</div></div>' +
      '<div style="text-align:right">' + badge + '<div class="small" style="color:var(--gold);margin-top:4px">full breakdown →</div></div></div>';
  }
  var html = topbar() + '<div class="narrow-wrap" style="padding:14px">' +
    '<div class="card-title"><span class="ico">🔁</span> Translation Tool</div>' +
    '<div class="small dim" style="margin-bottom:10px">Type in English, Roman Urdu, Urdu or Hindi — get the biblical word in Hebrew, Koine Greek, Aramaic or Vulgate Latin. <b>Dictionary lookup only — never AI-guessed</b> (§11).</div>' +
    '<div class="seg" style="margin-bottom:6px">' +
      [['en','English'],['ur-roman','Roman Urdu'],['ur','اردو'],['hi','हिन्दी']].map(function(s){
        return '<button data-src="' + s[0] + '" class="' + (TR.src === s[0] ? 'active' : '') + '">' + s[1] + '</button>';
      }).join('') + '</div>' +
    '<div class="seg" style="margin-bottom:10px">' +
      [['all','All biblical langs'],['heb','Hebrew'],['grc-nt','Greek'],['arc','Aramaic'],['lat','Latin']].map(function(s){
        return '<button data-tgt="' + s[0] + '" class="' + (TR.tgt === s[0] ? 'active' : '') + '">' + s[1] + '</button>';
      }).join('') + '</div>' +
    '<div class="searchbox"><input id="tr-input" placeholder="e.g. word · khuda · خدا · शब्द" value="' + E(q) + '" dir="auto"><button class="btn primary" id="tr-go">Find</button></div>' +
    (res ? (res.exact.length || res.fuzzy.length ?
        (res.exact.length ? '<div class="small" style="color:var(--ok);font-weight:700;margin:6px 0">Exact matches</div>' + res.exact.map(resCard).join('') : '') +
        (res.fuzzy.length ? '<div class="small dim mt12" style="margin:8px 0 6px">Close matches (dictionary fallback)</div>' + res.fuzzy.slice(0, 6).map(resCard).join('') : '') +
        '<div class="small faint mt12">No AI was used — this is a direct lookup in the glossary table, exact key first, then fuzzy string match.</div>' :
        '<div class="panel hollow center" style="border:1.5px dashed var(--line2);color:var(--ink-dim);padding:22px">' +
          '<div style="font-size:30px">📇</div><div class="serif" style="font-size:16px;margin-top:6px">“' + E(q) + '” is not in the dictionary yet</div>' +
          '<div class="small faint mt8">Verbum Origo never guesses. When this entry is added to the glossary table, it will appear here — with full root breakdown.</div>' +
        '</div>') : '') +
    adSlot('banner') +
    '</div>' + bottomnav('translate');
  var root = document.getElementById('app');
  root.innerHTML = html;
  wireNav(root);
  function doSearch(){
    TR.q = root.querySelector('#tr-input').value.trim();
    if (TR.q){
      var r2 = DB.lookupGlossary(TR.q, TR.src, TR.tgt === 'all' ? null : [TR.tgt]);
      if (r2.exact.length || r2.fuzzy.length){
        DB.state.counters.translations = (DB.state.counters.translations || 0) + 1;
        DB.saveState(); ENGINE.evalBadges();
      }
    }
    render();
  }
  root.querySelector('#tr-go').addEventListener('click', doSearch);
  var input = root.querySelector('#tr-input');
  input.addEventListener('keydown', function(e){ if (e.key === 'Enter') doSearch(); });
  root.querySelectorAll('[data-src]').forEach(function(b){ b.addEventListener('click', function(){ TR.src = b.dataset.src; render(); }); });
  root.querySelectorAll('[data-tgt]').forEach(function(b){ b.addEventListener('click', function(){ TR.tgt = b.dataset.tgt; render(); }); });
  root.querySelectorAll('[data-wid]').forEach(function(r){ r.addEventListener('click', function(){ nav('#/word/' + r.dataset.wid); }); });
}

/* ============================================================
   PROFILE — gamification, weak spots, leaderboard, packs, settings
   ============================================================ */
var PEERS = [
  ['Miriam', '🕊️', 4200], ['Daniel', '📖', 3650], ['Ruth', '🌾', 3100],
  ['Paul', '✉️', 2740], ['Esther', '👑', 2210], ['David', '🎶', 1880],
  ['Lydia', '🪡', 1450], ['Peter', '🐟', 1120], ['Hannah', '🕊️', 830]
];
function screenProfile(){
  var u = DB.state.user;
  var L = ENGINE.levelForXp(u.xp);
  var mastered = ENGINE.countMastered();
  var langs = ['heb','grc-nt','arc','lat'];
  var weak = DB.difficultyStats().slice(0, 8);
  var due = ENGINE.dueReviews().length;
  var dayBase = DB.daysBetween('2026-09-12', DB.todayStr());
  var peerRows = PEERS.map(function(p, i){
    return { name:p[0], ico:p[1], xp:p[2] + (dayBase * (7 + i * 3)) };
  }).concat([{ me:true, name:'You', ico:'✦', xp:u.xp }]).sort(function(a, b){ return b.xp - a.xp; });

  var html = topbar() + '<div style="padding:14px">' +
    '<div class="profile-grid">' +
    '<div class="panel" style="display:flex;gap:14px;align-items:center">' +
      '<div class="avatar">✦</div>' +
      '<div style="flex:1"><div class="serif" style="font-size:18px">Saul’s Student</div>' +
      '<div class="small dim">Level ' + (L.n + 1) + ' · ' + E(L.title) + '</div>' +
      '<div class="levelbar mt8"><i style="width:' + L.pct + '%"></i></div>' +
      '<div class="small faint mt8">' + u.xp + ' / ' + (L.nextAt || u.xp) + ' XP ' + (L.nextTitle ? '· next: ' + E(L.nextTitle) : '· max level') + '</div></div>' +
    '</div>' +
    '<div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap">' +
      '<div class="stat-pill streak">🔥 ' + u.streak + '-day streak</div>' +
      '<div class="stat-pill xp">⚡ ' + u.xp + ' total XP</div>' +
      '<div class="stat-pill">📚 ' + mastered + ' words mastered</div>' +
      (due ? '<button class="due-chip" data-act="practice-due" style="cursor:pointer">🔁 ' + due + ' reviews due</button>' : '<span class="chip">🔁 deck resting</span>') +
    '</div>' +

    '<div class="panel"><div class="card-title"><span class="ico">🌍</span> Progress by language</div>' +
      langs.map(function(l){
        var ws = DB.langWords(l);
        var m = ws.filter(function(w){ var p = DB.state.progress[w.word_id]; return p && p.mastered; }).length;
        var pct = ws.length ? Math.round(100 * m / ws.length) : 0;
        return '<div style="margin-bottom:10px"><div style="display:flex;font-size:13px"><b>' + E(DB.Langs[l].short) + '</b><span class="faint small" style="margin-left:auto">' + m + '/' + ws.length + ' mastered</span></div>' +
          '<div class="levelbar" style="height:9px;margin-top:4px"><i style="width:' + pct + '%"></i></div></div>';
      }).join('') +
    '</div>' +

    '<div class="panel"><div class="card-title"><span class="ico">🏅</span> Badges <span class="chip" style="margin-left:auto">' + DB.state.badges.length + '/' + ENGINE.BADGES.length + '</span></div>' +
      '<div class="badge-grid">' + ENGINE.BADGES.map(function(b){
        var has = DB.state.badges.some(function(x){ return x.id === b.id; });
        return '<div class="badge' + (has ? '' : ' locked') + '" title="' + E(b.desc) + '"><span class="bico">' + b.icon + '</span><span class="bname">' + E(b.name) + '</span></div>';
      }).join('') + '</div>' +
    '</div>' +

    (weak.length ? '<div class="panel"><div class="card-title"><span class="ico">🎯</span> My weak spots <span class="chip" style="margin-left:auto">from your practice log</span></div>' +
      weak.map(function(rw){
        var w = DB.w(rw.word_id);
        if (!w) return '';
        return '<div class="weak-row" data-wid="' + w.word_id + '"><span class="wscript">' + E(w.script.length > 8 ? w.script.slice(0, 8) : w.script) + '</span>' +
          '<span class="small dim">' + E(w.gloss_en) + ' · ' + rw.attempt_count + ' attempts</span>' +
          '<span class="wpct">' + Math.round(100 * rw.error_rate) + '% error</span></div>';
      }).join('') +
      '<div class="small faint mt8">Tap a word to drill it in SRS. This list is computed from your own learning_event rows (§14).</div>' +
    '</div>' : '') +

    '<div class="panel"><div class="card-title"><span class="ico">🏆</span> Leaderboard <span class="chip" style="margin-left:auto">local prototype</span></div>' +
      peerRows.map(function(p, i){
        return '<div class="lb-row' + (p.me ? ' me' : '') + '"><span class="lbrank">' + (i + 1) + '</span><span class="lbav">' + p.ico + '</span><span>' + E(p.name) + '</span><span class="lbxp">' + ENGINE.fmtK(p.xp) + ' XP</span></div>';
      }).join('') +
      '<div class="small faint mt8">Global leaderboard syncs with the Android release. Rankings are by total XP.</div>' +
    '</div>' +

    '<div class="panel"><div class="card-title"><span class="ico">📦</span> Offline packs</div>' +
      Object.keys(DB.Packs).map(function(pid){
        var p = DB.Packs[pid];
        var dl = DB.state.packs[pid];
        return '<div class="pack-row"><div><div class="pname">' + E(DB.Langs[p.language_code].short) + ' · ' + E((DB.Books[p.book_id] || {}).name || p.book_id) + '</div>' +
          '<div class="psize">' + p.size_mb + ' MB · words + verses + audio</div>' +
          (dl ? '<div class="dl-progress"><i style="width:100%"></i></div>' : '') +
        '</div><div class="pdl">' +
          (dl ? '<span class="chip gold">✓ downloaded</span>' : '<button class="btn small gold" data-pack="' + pid + '">Download</button>') +
        '</div></div>';
      }).join('') +
      '<div class="small faint mt8">Once downloaded, that language+book works fully offline (IndexedDB on the Android build).</div>' +
    '</div>' +

    '<div class="panel"><div class="card-title"><span class="ico">⚙️</span> Settings</div>' +
      '<div class="set-row"><div><div class="sk">Pronunciation convention</div><div class="sd">For ' + E(DB.Langs[curLang()].short) + ' (per-language on word cards)</div></div>' +
        '<select class="sel" id="set-conv">' + ENGINE.convLabel(curLang()).map(function(c){
          return '<option value="' + c[0] + '" ' + ((DB.state.settings.pronConv[curLang()]||'') === c[0] ? 'selected' : '') + '>' + E(c[1]) + '</option>';
        }).join('') + '</select></div>' +
      '<div class="set-row"><div><div class="sk">Display mode</div><div class="sd">Default verse display</div></div>' +
        '<select class="sel" id="set-disp"><option value="script" ' + (DB.state.settings.dispMode === 'script' ? 'selected' : '') + '>Script</option><option value="translit" ' + (DB.state.settings.dispMode === 'translit' ? 'selected' : '') + '>Transliteration</option><option value="english" ' + (DB.state.settings.dispMode === 'english' ? 'selected' : '') + '>English</option></select></div>' +
      '<div class="set-row"><div><div class="sk">Hearts</div><div class="sd">Mistakes cost a heart (5/day)</div></div>' +
        '<label class="toggle"><input type="checkbox" id="set-hearts" ' + (DB.state.settings.heartsOn ? 'checked' : '') + '><span class="track"></span></label></div>' +
      '<div class="set-row"><div><div class="sk">Sound</div><div class="sd">Pronunciation playback (TTS, §8)</div></div>' +
        '<label class="toggle"><input type="checkbox" id="set-sound" ' + (DB.state.settings.sound ? 'checked' : '') + '><span class="track"></span></label></div>' +
      '<div class="set-row"><div><div class="sk">Daily practice reminder</div><div class="sd">Local notification hook</div></div>' +
        '<button class="btn tiny gold" id="set-remind">Request</button></div>' +
      '<div class="set-row"><div><div class="sk">Owner mode</div><div class="sd">Content-health dashboard (not shown to learners)</div></div>' +
        '<label class="toggle"><input type="checkbox" id="set-owner" ' + (DB.state.settings.ownerMode ? 'checked' : '') + '><span class="track"></span></label></div>' +
      '<div class="set-row"><div><div class="sk">Reset all progress</div><div class="sd">Wipe XP, SRS, events, badges</div></div>' +
        '<button class="btn tiny danger" id="set-reset">Reset</button></div>' +
    '</div>' +
    '<div class="panel hollow center" style="border:none">' +
      '<a href="#/about" class="serif" style="color:var(--gold)">✦ About Verbum Origo · Saul’s Podship ✦</a>' +
    '</div>' +
    '</div>' +
    '</div>' + bottomnav('profile');
  var root = document.getElementById('app');
  root.innerHTML = html;
  wireNav(root);
  root.querySelector('#set-conv').addEventListener('change', function(e){ DB.state.settings.pronConv[curLang()] = e.target.value; DB.saveState(); });
  root.querySelector('#set-disp').addEventListener('change', function(e){ DB.state.settings.dispMode = e.target.value; DB.saveState(); });
  root.querySelector('#set-hearts').addEventListener('change', function(e){ DB.state.settings.heartsOn = e.target.checked; DB.saveState(); render(); });
  root.querySelector('#set-sound').addEventListener('change', function(e){ DB.state.settings.sound = e.target.checked; DB.saveState(); });
  root.querySelector('#set-remind').addEventListener('click', function(){
    try {
      if (!('Notification' in window)) return toast('Notifications unsupported here');
      Notification.requestPermission().then(function(p){ toast(p === 'granted' ? 'Daily reminder armed 🔔' : 'Reminder not enabled'); });
    } catch(e){ toast('Reminder hook available in the Android build'); }
  });
  root.querySelector('#set-owner').addEventListener('change', function(e){
    DB.state.settings.ownerMode = e.target.checked; DB.saveState();
    if (e.target.checked) nav('#/owner');
  });
  root.querySelector('#set-reset').addEventListener('click', function(){
    if (confirm('Reset ALL progress? XP, streaks, SRS, events and badges will be wiped.') && confirm('Really? This cannot be undone.')){
      DB.store.remove ? DB.store.remove('state-v1') : null;
      location.reload();
    }
  });
  var pd = root.querySelector('[data-act="practice-due"]');
  if (pd) pd.addEventListener('click', function(){ startSRS(ENGINE.dueReviews().map(function(r){ return r.word_id; })); });
  root.querySelectorAll('[data-pack]').forEach(function(b){
    b.addEventListener('click', function(){
      var pid = b.dataset.pack;
      b.disabled = true;
      var row = b.closest('.pack-row');
      row.insertAdjacentHTML('beforeend', '');
      b.textContent = '0%';
      var p = 0;
      var iv = setInterval(function(){
        p += 18 + Math.random() * 22;
        if (p >= 100){
          clearInterval(iv);
          DB.state.packs[pid] = true; DB.saveState();
          toast('Pack downloaded — ' + (DB.Books[DB.Packs[pid].book_id] || {}).name + ' ready offline', true);
          render();
        } else b.textContent = Math.floor(p) + '%';
      }, 220);
    });
  });
  root.querySelectorAll('.weak-row[data-wid]').forEach(function(r){
    r.addEventListener('click', function(){ APP.srsQueue = [r.dataset.wid]; nav('#/srs'); });
  });
}

/* ============================================================
   OWNER DASHBOARD (content health, §14 — not shown to learners)
   ============================================================ */
function screenOwner(){
  if (!DB.state.settings.ownerMode){
    DB.state.settings.ownerMode = true; DB.saveState();
  }
  var cov = DB.coverageStats();
  var diff = DB.difficultyStats().slice(0, 8);
  var ev = {};
  DB.state.events.forEach(function(e){ ev[e.event_type] = (ev[e.event_type] || 0) + 1; });
  var html = topbar() + '<div class="wide-wrap" style="padding:14px">' +
    '<button class="btn small ghost" data-back>← Profile</button>' +
    '<div class="card-title mt12"><span class="ico">🛠️</span> Owner dashboard</div>' +
    '<div class="small dim">Content-health view over your own data — where to prioritize next. (Single-device prototype: “global” aggregates = this device.)</div>' +
    '<div class="panel"><div class="card-title"><span class="ico">📊</span> Content coverage</div>' +
      '<table class="otable"><tr><th>Lang</th><th>Book</th><th>Words</th><th>Audio</th><th>Ety</th><th>Gloss</th><th>Verses</th><th>Coverage</th></tr>' +
      cov.map(function(c){
        var audioPct = Math.round(100 * c.words_with_audio / Math.max(1, c.words_total));
        var etyPct = Math.round(100 * c.words_with_etymology / Math.max(1, c.words_total));
        var gPct = Math.round(100 * c.words_with_gloss / Math.max(1, c.words_total));
        return '<tr><td>' + E(DB.Langs[c.language_code].short) + '</td><td>' + E((DB.Books[c.book_id]||{}).name || c.book_id) + '</td><td class="num">' + c.words_total + '</td>' +
          '<td class="num ' + (audioPct < 100 ? 'gap' : 'good') + '">' + audioPct + '%</td>' +
          '<td class="num ' + (etyPct < 60 ? 'gap' : 'good') + '">' + etyPct + '%</td>' +
          '<td class="num ' + (gPct < 50 ? 'gap' : 'good') + '">' + gPct + '%</td>' +
          '<td class="num">' + c.verses + '</td><td class="num ' + (c.coverage_pct < 80 ? 'gap' : 'good') + '">' + c.coverage_pct + '%</td></tr>';
      }).join('') + '</table>' +
      '<div class="small faint mt8">Red = gap to fill next (audio_clip / etymology narrative / glossary_entry rows).</div>' +
    '</div>' +
    (diff.length ? '<div class="panel"><div class="card-title"><span class="ico">📉</span> Hardest words (aggregated from learning_event)</div>' +
      diff.map(function(rw){
        var w = DB.w(rw.word_id);
        if (!w) return '';
        return '<div class="family-row"><span class="flang">' + E(DB.Langs[w.language_code].short) + '</span><span class="fscript">' + E(w.script) + '</span><span class="fgloss">' + E(w.gloss_en) + '</span><span class="wpct" style="margin-left:auto">' + Math.round(100 * rw.error_rate) + '% err · ' + rw.attempt_count + '×</span></div>';
      }).join('') + '</div>' : '') +
    '<div class="panel"><div class="card-title"><span class="ico">🧾</span> Learning event log</div>' +
      '<div class="small dim">' + DB.state.events.length + ' raw events (append-only, capped at 3,000)</div>' +
      Object.keys(ev).map(function(k){ return '<span class="chip mt8" style="margin:4px 4px 0 0">' + E(k) + ': <b>' + ev[k] + '</b></span>'; }).join('') +
      '<div class="small faint mt12">word_difficulty_stat & content_coverage_stat recompute from this log — screens never join the raw events live (§14).</div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">' +
        '<button class="btn small gold" id="ow-recompute">⟳ Recompute stats now</button>' +
        '<button class="btn small danger" id="ow-wipe">Wipe all data</button>' +
      '</div>' +
    '</div>' +
    '</div>' + bottomnav('profile');
  var root = document.getElementById('app');
  root.innerHTML = html;
  wireNav(root);
  root.querySelector('[data-back]').addEventListener('click', function(){ nav('#/profile'); });
  root.querySelector('#ow-recompute').addEventListener('click', function(){
    DB.coverageStats(); DB.difficultyStats(); DB.saveState();
    toast('Stats recomputed (nightly job, simulated)');
  });
  root.querySelector('#ow-wipe').addEventListener('click', function(){
    if (confirm('Wipe all local data?') && confirm('Really? This cannot be undone.')){
      DB.store.remove('state-v1'); location.reload();
    }
  });
}

/* ============================================================
   ABOUT — Saul's Podship branding & ownership
   ============================================================ */
function screenAbout(){
  var html = topbar() + '<div class="narrow-wrap" style="padding:14px">' +
    '<div class="about-logo"><div class="al1">✦ VERBUM ORIGO ✦</div><div class="al2">Biblical Original Languages · v1.0</div></div>' +
    '<div class="hero-strip"><h2 class="center" style="font-size:16px">A Biblical Ministry Project</h2>' +
      '<p class="center">Part of the Saul’s Podship scriptorium — a rigorous digital library for Christian exegesis, historic theology and scripture analysis. Verbum Origo teaches the four biblical languages in the context of Scripture itself: word by word, root by root, verse by verse.</p></div>' +
    '<div class="panel"><div class="card-title"><span class="ico">🏛️</span> The Podship family</div>' +
      '<div class="family-chips">' +
        '<div class="fam-chip"><span class="fic">📚</span><div><div class="fn">Saul’s Podship — parent</div><div class="fu">saulspodship.com · 51-volume theological encyclopedia, prophecy atlas, interlinked Bible</div></div></div>' +
        '<div class="fam-chip"><span class="fic">🎓</span><div><div class="fn">Saul’s Sunday School — sister app</div><div class="fu">saulssundayschool.saulspodship.com</div></div></div>' +
        '<div class="fam-chip"><span class="fic">✒️</span><div><div class="fn">Verbum Origo — you are here</div><div class="fu">biblicallanguages.saulspodship.com · Hebrew · Koine Greek · Aramaic · Vulgate Latin</div></div></div>' +
      '</div>' +
      '<div class="divider"></div>' +
      '<div class="serif" style="text-align:center;font-size:14.5px;color:var(--gold-bright)">This web app and its Android app belong to Saul’s Podship.<br><span class="small dim" style="font-family:var(--sans)">Built under the Podship seal — free, ad-supported, and scholarly.</span></div>' +
    '</div>' +
    '<div class="panel"><div class="card-title"><span class="ico">📜</span> Texts & sources</div>' +
      '<div class="small dim" style="line-height:1.8">Hebrew: Masoretic (Leningrad-based) with Dead Sea Scrolls variants noted · Greek: Textus Receptus & NA28 with apparatus notes · Aramaic: Daniel & Ezra native Aramaic + the Aramaic words of Jesus · Latin: Jerome’s Vulgate. Strong’s Concordance numbers (H/G) index every word. TTS pronunciation stands in for recorded audio in v1 — the schema keeps the same audio_clip slots for real recordings later.</div>' +
    '</div>' +
    '<div class="panel"><div class="card-title"><span class="ico">🤖</span> What is (and isn’t) AI here</div>' +
      '<div class="small dim" style="line-height:1.8">Translation is a <b>dictionary lookup</b> — exact index match, then fuzzy string match. No language model anywhere in that path (§11). Morphology, roots and Strong’s data are structured and static, so everything works offline. Only etymology narratives and quiz phrasing may be AI-assisted, and never replace structured fields.</div>' +
    '</div>' +
    '<div class="ad-slot"><div class="adk">Ad space · Verbum Origo</div><div class="adt">Free & ad-supported — the Podship way.</div></div>' +
    '<div class="center small faint">© Saul’s Podship · saulspodship.com<br>“Let the word of Christ dwell in you richly.” — Col 3:16</div>' +
    '</div>' + bottomnav('profile');
  var root = document.getElementById('app');
  root.innerHTML = html;
  wireNav(root);
}

/* ---------------- public ---------------- */
window.UI = {
  renderHome:screenHome, renderVerses:screenVerses, renderVerse:screenVerse,
  renderWord:screenWord, renderSrs:screenSrs, renderQuiz:screenQuiz,
  renderParse:screenParse, renderLexicon:screenLexicon, renderTranslate:screenTranslate,
  renderProfile:screenProfile, renderOwner:screenOwner, renderAbout:screenAbout,
  startLesson:startLesson, startSrs:startSRS, toast:toast, modal:modal, closeModal:closeModal,
  topbar:topbar, bottomnav:bottomnav, wordCard:wordCard, wireWordCard:wireWordCard
};
})();
