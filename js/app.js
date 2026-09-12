/* ============================================================
   VERBUM ORIGO — App bootstrap & router
   ============================================================ */
(function(){
"use strict";
window.APP = window.APP || {};

function boot(){
  /* swap the boot screen for the app shell */
  var appEl = document.getElementById('app');
  if (!appEl){
    appEl = document.createElement('div');
    appEl.id = 'app';
    var bootEl = document.getElementById('boot');
    if (bootEl && bootEl.replaceWith) bootEl.replaceWith(appEl);
    else if (bootEl) bootEl.parentNode.replaceChild(appEl, bootEl);
    else document.body.appendChild(appEl);
  }
  DB.loadState();
  /* prime TTS voice list (browsers load it async) */
  try { if (window.speechSynthesis) window.speechSynthesis.onvoiceschanged = function(){}; } catch(e){}
  /* recompute derived stats on launch (the "nightly job") */
  DB.coverageStats();
  DB.difficultyStats();
  ENGINE.evalBadges();
  window.addEventListener('hashchange', render);
  render();
}

function render(){
  /* kill any open lesson overlay when navigating */
  var lx = document.getElementById('lesson-root');
  if (lx && !location.hash.startsWith('#/lesson/')){ lx.remove(); }
  var root = document.getElementById('app');
  var hash = location.hash || '#/';
  var qm = hash.indexOf('?');
  var pathPart = qm >= 0 ? hash.slice(0, qm) : hash;
  var parts = pathPart.replace(/^#\//, '').split('/');
  var seg0 = parts[0] || 'home';
  var seg1 = parts[1] || null;
  var qs = qm >= 0 ? hash.slice(qm + 1) : '';
  var hl = (qs.match(/hl=([\w-]+)/) || [])[1] || null;
  var from = (qs.match(/from=([\w-]+)/) || [])[1] || null;

  switch(seg0){
    case '':
    case 'home':
      UI.renderHome(); break;
    case 'lesson':
      if (seg1) UI.startLesson(seg1); break;
    case 'verses':
      APP.verseLang = seg1;
      UI.renderVerses(seg1); break;
    case 'verse':
      UI.renderVerse(seg1, hl); break;
    case 'word':
      UI.renderWord(seg1, from); break;
    case 'srs':
      UI.renderSrs(); break;
    case 'quiz':
      UI.renderQuiz(); break;
    case 'parse':
      UI.renderParse(); break;
    case 'lexicon':
      UI.renderLexicon(); break;
    case 'translate':
      UI.renderTranslate(); break;
    case 'profile':
      UI.renderProfile(); break;
    case 'owner':
      UI.renderOwner(); break;
    case 'about':
      UI.renderAbout(); break;
    default:
      UI.renderHome();
  }
  window.scrollTo(0, 0);
}

/* expose for UI */
window.APP.render = render;
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();
})();
