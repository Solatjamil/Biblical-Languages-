/* Headless boot test: minimal DOM stub, run all 6 scripts, visit every route. */
"use strict";
const fs = require('fs');
function El(tag){
  return {
    id: '', tagName: (tag||'div').toUpperCase(), children: [], innerHTML: '', _text: '',
    className: '', style: {}, dataset: {}, disabled: false, value: '', _listeners: {}, parentNode: null,
    classList: {
      _s: new Set(),
      add(c){ this._s.add(c); },
      remove(c){ this._s.delete(c); },
      contains(c){ return this._s.has(c); }
    },
    set textContent(v){ this._text = String(v); this.innerHTML = String(v); },
    get textContent(){ return this._text; },
    addEventListener(t, f){ (this._listeners[t] = this._listeners[t] || []).push(f); },
    removeEventListener(){},
    appendChild(c){ this.children.push(c); c.parentNode = this; return c; },
    insertAdjacentHTML(){},
    querySelector(){ return El('i'); },   /* dummy element so wiring code executes */
    querySelectorAll(){ return []; },
    closest(){ return null; },
    focus(){},
    click(){ (this._listeners.click||[]).forEach(f=>f({target:this, preventDefault(){}, closest(){return null;}})); },
    replaceWith(n){ if (this.parentNode){ const ch = this.parentNode.children; ch[ch.indexOf(this)] = n; } n.parentNode = this.parentNode; },
    remove(){ if (this.parentNode){ const ch = this.parentNode.children; const i = ch.indexOf(this); if (i >= 0) ch.splice(i, 1); } }
  };
}
const byId = {};
const docChildren = [];
byId['boot'] = El('div');
byId['boot'].id = 'boot';
byId['boot'].parentNode = {
  children: docChildren,
  replaceChild(a, b){ const i = docChildren.indexOf(b); if (i >= 0) docChildren[i] = a; else docChildren.push(a); a.parentNode = this; }
};
docChildren.push(byId['boot']);

global.window = global;
global.document = {
  readyState: 'complete',
  body: { children: docChildren, appendChild(c){ docChildren.push(c); c.parentNode = this; return c; }, addEventListener(){} },
  getElementById(id){ if (byId[id]) return byId[id]; return docChildren.find(c => c.id === id) || null; },
  createElement(t){ return El(t); },
  addEventListener(){},
  querySelector(){ return null; },
  querySelectorAll(){ return []; }
};
global.location = { _h: [] };
Object.defineProperty(global.location, 'hash', {
  get(){ return this._h[this._h.length-1] || '#/'; },
  set(v){ this._h.push(v); const c = global.__hashCb; if (c) c(); }
});
global.addEventListener = function(t, f){ if (t === 'hashchange') global.__hashCb = f; };
global.scrollTo = function(){};
global.confirm = function(){ return true; };
global.Notification = undefined;
global.speechSynthesis = undefined;
const LS = {};
global.localStorage = {
  getItem(k){ return Object.prototype.hasOwnProperty.call(LS,k) ? LS[k] : null; },
  setItem(k,v){ LS[k] = String(v); },
  removeItem(k){ delete LS[k]; }
};

// load scripts in order
['js/1-data.js','js/2-db.js','js/3-engine.js','js/4-lessons.js','js/5-ui.js','js/app.js'].forEach(f=>{
  const src = fs.readFileSync(__dirname + '/' + f, 'utf8');
  (new Function('window','document','location','localStorage','speechSynthesis','Notification','confirm','scrollTo', src + '\n'))(
    global, global.document, global.location, global.localStorage, undefined, undefined, global.confirm, global.scrollTo);
});

const appEl = docChildren.find(c => c.id === 'app');
if (!appEl){ console.log('FATAL: #app was never created at boot'); process.exit(1); }

const routes = [
  '#/', '#/verses/heb', '#/verse/v-heb-gen-1-1', '#/verse/v-grc-john-1-1-tr',
  '#/verse/v-heb-hab-2-4', '#/verse/v-heb-hab-2-4?hl=w-heb-emunah',
  '#/word/w-heb-elohim', '#/word/w-heb-elohim?from=v-heb-gen-1-1',
  '#/lesson/heb-alph', '#/lesson/heb-v1', '#/lesson/heb-g2',
  '#/lesson/grc-v1', '#/lesson/arc-v1', '#/lesson/lat-v2',
  '#/lesson/heb-v3', '#/lesson/heb-v4', '#/lesson/grc-v3', '#/lesson/arc-v2', '#/lesson/lat-v3',
  '#/lesson/heb-v5', '#/lesson/heb-v6', '#/lesson/grc-v4', '#/lesson/grc-v5', '#/lesson/arc-v3', '#/lesson/lat-v4',
  '#/lesson/heb-g3', '#/lesson/heb-g4', '#/lesson/heb-g5', '#/lesson/heb-v7', '#/lesson/heb-v8', '#/lesson/heb-v9',
  '#/lesson/grc-g3', '#/lesson/grc-g4', '#/lesson/grc-v6', '#/lesson/grc-v7', '#/lesson/grc-v8', '#/lesson/grc-v9',
  '#/lesson/arc-v4', '#/lesson/arc-v5', '#/lesson/arc-v6', '#/lesson/arc-g2', '#/lesson/arc-v7',
  '#/lesson/lat-g2', '#/lesson/lat-g3', '#/lesson/lat-v5', '#/lesson/lat-v6', '#/lesson/lat-v7',
  '#/srs', '#/quiz', '#/parse', '#/lexicon', '#/translate',
  '#/profile', '#/owner', '#/about', '#/verses/grc-nt', '#/verses/arc', '#/verses/lat'
];
let errors = 0;
for (const r of routes){
  try {
    global.location.hash = r;
    if (!appEl.innerHTML || appEl.innerHTML.length < 50) { console.log('EMPTY render at', r); errors++; }
    else console.log('OK   ', r, '(', appEl.innerHTML.length, 'chars)');
  } catch(e){
    console.log('ERR  ', r, ':', e.message);
    console.log(e.stack.split('\n').slice(1,4).join('\n'));
    errors++;
  }
}
// quiz generation per language (fresh quiz each time)
['heb','grc-nt','arc','lat'].forEach(lang=>{
  try {
    global.APP.quizLang = lang;
    global.location.hash = '#/quiz';
    // force a new quiz state by toggling away and back
    global.location.hash = '#/';
    global.location.hash = '#/quiz';
    console.log('OK   quiz generated for', lang);
  } catch(e){ console.log('quiz ERR', lang, ':', e.message); errors++; }
});
// SRS with a manual queue (weak-spot path)
try {
  global.APP.srsQueue = ['w-heb-elohim','w-grc-logos'];
  global.location.hash = '#/srs';
  console.log('OK   SRS queue render (', appEl.innerHTML.length, 'chars )');
} catch(e){ console.log('SRS ERR:', e.message); errors++; }
// XP + streak + badges + derived stats
try {
  window.DB.addXP(250);
  window.ENGINE.evalBadges();
  console.log('OK   after +250 XP: level =', window.ENGINE.levelForXp(window.DB.state.user.xp).title,
    '| badges =', window.DB.state.badges.map(b=>b.id).join(','),
    '| events =', window.DB.state.events.length,
    '| diffStats =', window.DB.difficultyStats().length);
} catch(e){ console.log('XP ERR:', e.message); errors++; }
console.log(errors ? 'BOOT TEST: ' + errors + ' ERRORS' : 'BOOT TEST: ALL ROUTES OK');
process.exit(errors ? 1 : 0);
