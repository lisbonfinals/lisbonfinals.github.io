(function () {
  'use strict';

  var routeMatch = window.location.pathname.match(/^\/(pt|fr)(?:\/|$)/);
  var routeLang = routeMatch ? routeMatch[1] : 'en';
  window.LF_ROUTE_LANG = routeLang;
  localStorage.setItem('lf_lang', routeLang);

  function currentFile() {
    var parts = window.location.pathname.split('/').filter(Boolean);
    var file = parts[parts.length - 1] || 'index.html';
    if (file === 'pt' || file === 'fr') file = 'index.html';
    return file.indexOf('.') === -1 ? 'index.html' : file;
  }

  function languageUrl(lang) {
    var file = currentFile();
    var suffix = file === 'index.html' ? '' : file;
    var prefix = lang === 'en' ? '/' : '/' + lang + '/';
    return prefix + suffix + window.location.hash;
  }

  window.lfLanguageUrl = languageUrl;

  document.addEventListener('click', function (event) {
    var button = event.target.closest && event.target.closest('.lang-btn');
    if (!button) return;
    var lang = (button.id || '').replace('lang-', '');
    if (!/^(en|pt|fr)$/.test(lang)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    window.location.href = languageUrl(lang);
  }, true);

  function localizeInternalLinks() {
    if (routeLang === 'en') return;
    document.querySelectorAll('a[href^="/"]').forEach(function (link) {
      var href = link.getAttribute('href');
      if (!href || href.indexOf('//') === 0 || /^\/(pt|fr)(?:\/|$)/.test(href)) return;
      if (!/^\/(?:index\.html|data\.html|archive\.html|compare\.html|noise-report\.html|log\.html|about\.html|host-a-node\.html)?(?:[?#]|$)/.test(href)) return;
      link.setAttribute('href', '/' + routeLang + (href === '/' ? '/' : href));
    });
  }

  function markCurrentNavigation() {
    var path = window.location.pathname.replace(/^\/(pt|fr)/, '') || '/';
    var key = path === '/' || path === '/index.html' ? '/' : '/' + path.split('/').filter(Boolean)[0];
    if (key === '/host-a-node.html') key = '/about.html';
    document.querySelectorAll('.nav-links > li > a, .nav-drawer > a').forEach(function (link) {
      var href = (link.getAttribute('href') || '').replace(/^\/(pt|fr)/, '');
      var linkKey = href === '/' || href === '/index.html' ? '/' : '/' + href.split('#')[0].split('/').filter(Boolean)[0];
      var active = linkKey === key;
      if (link.classList.contains('nav-noise')) link.classList.toggle('nav-active', active);
      if (link.classList.contains('drawer-noise')) link.classList.toggle('drawer-active', active);
    });
  }

  function syncDrawerState() {
    var drawer = document.getElementById('nav-drawer');
    if (!drawer) return;
    var sync = function () {
      var open = drawer.classList.contains('open');
      document.documentElement.classList.toggle('drawer-open', open);
      document.body.classList.toggle('drawer-open', open);
    };
    new MutationObserver(sync).observe(drawer, { attributes: true, attributeFilter: ['class'] });
    document.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape' || !drawer.classList.contains('open')) return;
      drawer.classList.remove('open');
      var burger = document.getElementById('nav-burger');
      if (burger) {
        burger.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
        burger.focus();
      }
    });
    sync();
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (routeLang) document.documentElement.lang = routeLang === 'pt' ? 'pt-PT' : routeLang;
    localizeInternalLinks();
    markCurrentNavigation();
    syncDrawerState();
  });
})();
