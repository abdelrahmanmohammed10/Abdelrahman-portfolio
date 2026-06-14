/* ============================================================
   COSMIC PORTFOLIO — CINEMATIC SCRIPT
   Starfield · Meteors · Parallax · Reveals · Navigation · Drawers
   ============================================================ */

(function () {
  'use strict';

  // ---- DOM Elements ----
  var header = document.getElementById('header');
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');
  var navLinks = nav.querySelectorAll('a');
  var sections = document.querySelectorAll('section[id]');
  var reveals = document.querySelectorAll('.reveal');
  var meteors = document.getElementById('meteors');
  var spineNodes = document.querySelectorAll('.spine-node');

  // Background Planet Elements for Parallax
  var mercuryPlanet = document.querySelector('.mercury-planet');
  var venusPlanet = document.querySelector('.venus-planet');
  var jupiterPlanet = document.querySelector('.jupiter-planet');
  var earthPlanet = document.querySelector('.earth-planet');
  var marsPlanet = document.querySelector('.mars-planet');

  var aboutSec = document.getElementById('about');
  var workSec = document.getElementById('work');
  var campaignsSec = document.getElementById('campaigns');
  var journeySec = document.getElementById('journey');
  var contactSec = document.getElementById('contact');

  // ============================================================
  // STARFIELD — Box-shadow technique (GPU-efficient)
  // ============================================================
  function stars(count, w, h, palette) {
    var s = [];
    for (var i = 0; i < count; i++) {
      var x = Math.floor(Math.random() * w);
      var y = Math.floor(Math.random() * h);
      s.push(x + 'px ' + y + 'px 0 ' + palette[Math.floor(Math.random() * palette.length)]);
    }
    return s.join(',');
  }

  function buildStarfield() {
    var w = window.innerWidth;
    var h = document.documentElement.scrollHeight;

    var layers = [
      { id: 'sl1', n: 250, size: '1px', palette: ['rgba(248,250,252,.22)','rgba(248,250,252,.28)','rgba(6,182,212,.10)'] },
      { id: 'sl2', n: 130, size: '1px', palette: ['rgba(248,250,252,.36)','rgba(248,250,252,.32)','rgba(124,58,237,.08)'] },
      { id: 'sl3', n: 50, size: '1.5px', palette: ['rgba(248,250,252,.5)','rgba(6,182,212,.25)','rgba(245,158,11,.12)'] },
      { id: 'sl4', n: 16, size: '2px', palette: ['rgba(248,250,252,.65)','rgba(6,182,212,.35)'] }
    ];

    layers.forEach(function (l) {
      var el = document.getElementById(l.id);
      if (!el) return;
      el.innerHTML = '';
      var dot = document.createElement('div');
      dot.style.cssText = 'position:absolute;width:' + l.size + ';height:' + l.size +
        ';top:0;left:0;border-radius:50%;box-shadow:' + stars(l.n, w, h, l.palette);
      el.appendChild(dot);
    });
  }

  // ============================================================
  // METEORS — Rare shooting stars
  // ============================================================
  function spawnMeteor() {
    if (!meteors) return;
    var m = document.createElement('div');
    m.className = 'meteor';
    m.style.top = Math.random() * 45 + '%';
    m.style.left = 25 + Math.random() * 75 + '%';
    m.style.width = 80 + Math.random() * 100 + 'px';
    meteors.appendChild(m);
    setTimeout(function () { if (m.parentNode) m.parentNode.removeChild(m); }, 1000);
  }

  // Rare loop triggers every 5 to 14 seconds
  function meteorLoop() {
    setTimeout(function () { spawnMeteor(); meteorLoop(); }, 5000 + Math.random() * 9000);
  }

  // ============================================================
  // PARALLAX — Star layers & Background Planets
  // ============================================================
  function handleParallax() {
    var y = window.scrollY;
    
    // Starfield parallax
    var s1 = document.getElementById('sl1');
    var s2 = document.getElementById('sl2');
    if (s1) s1.style.transform = 'translateY(' + y * 0.015 + 'px)';
    if (s2) s2.style.transform = 'translateY(' + y * 0.04 + 'px)';

    // Large background planets parallax (translate based on section top in viewport)
    if (aboutSec && mercuryPlanet) {
      var rect = aboutSec.getBoundingClientRect();
      mercuryPlanet.style.transform = 'translate3d(0, ' + rect.top * 0.18 + 'px, 0)';
    }
    if (workSec && venusPlanet) {
      var rect = workSec.getBoundingClientRect();
      venusPlanet.style.transform = 'translate3d(0, ' + rect.top * 0.22 + 'px, 0)';
    }
    if (campaignsSec && jupiterPlanet) {
      var rect = campaignsSec.getBoundingClientRect();
      jupiterPlanet.style.transform = 'translate3d(0, ' + rect.top * 0.24 + 'px, 0)';
    }
    if (journeySec && earthPlanet) {
      var rect = journeySec.getBoundingClientRect();
      earthPlanet.style.transform = 'translate3d(0, ' + rect.top * 0.16 + 'px, 0)';
    }
    if (contactSec && marsPlanet) {
      var rect = contactSec.getBoundingClientRect();
      marsPlanet.style.transform = 'translate3d(0, ' + rect.top * 0.20 + 'px, 0)';
    }
  }

  // ============================================================
  // ACTIVE NAVIGATION — Spine & Header
  // ============================================================
  function updateNavigation() {
    var pos = window.scrollY + 220;
    var currentSec = 'hero';

    sections.forEach(function (sec) {
      var top = sec.offsetTop;
      var h = sec.offsetHeight;
      var id = sec.getAttribute('id');
      if (pos >= top && pos < top + h) {
        currentSec = id;
      }
    });

    // Update standard nav links
    navLinks.forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('href') === '#' + currentSec);
    });

    // Update solar spine navigation nodes
    spineNodes.forEach(function (node) {
      node.classList.toggle('active', node.getAttribute('data-sec') === currentSec);
    });
  }

  // ============================================================
  // REVEAL ON SCROLL
  // ============================================================
  function reveal() {
    var wh = window.innerHeight;
    reveals.forEach(function (el) {
      if (el.getBoundingClientRect().top < wh - 70) el.classList.add('vis');
    });
  }

  // ============================================================
  // HEADER STATE
  // ============================================================
  function headerState() {
    if (header) {
      header.classList.toggle('scrolled', window.scrollY > 50);
    }
  }

  // ============================================================
  // SCROLL HANDLER (rAF throttled)
  // ============================================================
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (!ticking) {
      requestAnimationFrame(function () {
        headerState();
        updateNavigation();
        reveal();
        handleParallax();
        ticking = false;
      });
      ticking = true;
    }
  });

  // ============================================================
  // MOBILE MENU
  // ============================================================
  if (burger && nav) {
    burger.addEventListener('click', function () {
      burger.classList.toggle('open');
      nav.classList.toggle('open');
      document.body.style.overflow = nav.classList.contains('open') ? 'hidden' : '';
    });

    navLinks.forEach(function (a) {
      a.addEventListener('click', function () {
        burger.classList.remove('open');
        nav.classList.remove('open');
        document.body.style.overflow = '';
      });
    });

    document.addEventListener('click', function (e) {
      if (nav.classList.contains('open') && !nav.contains(e.target) && !burger.contains(e.target)) {
        burger.classList.remove('open');
        nav.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

  // ============================================================
  // ACTIVE THEORY STYLE PROJECT DRAWERS
  // ============================================================
  var drawers = document.querySelectorAll('.project-drawer');
  var projectCards = document.querySelectorAll('.project-world[data-drawer]');

  projectCards.forEach(function (card) {
    card.addEventListener('click', function (e) {
      // Prevent drawer opening if they clicked directly on PDF download links
      if (e.target.closest('a') || e.target.closest('button.btn')) return;

      var drawerId = this.getAttribute('data-drawer');
      var targetDrawer = document.getElementById(drawerId);
      if (targetDrawer) {
        targetDrawer.classList.add('open');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  drawers.forEach(function (drawer) {
    var closeBtn = drawer.querySelector('.drawer-close');
    var overlay = drawer.querySelector('.drawer-overlay');

    function closeDrawer() {
      drawer.classList.remove('open');
      // Only restore scroll if no other drawers are open
      var anyOpen = Array.prototype.some.call(drawers, function (d) {
        return d.classList.contains('open');
      });
      if (!anyOpen) {
        document.body.style.overflow = '';
      }
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', closeDrawer);
    }
    if (overlay) {
      overlay.addEventListener('click', closeDrawer);
    }
  });

  // Close drawers with ESC key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      drawers.forEach(function (drawer) {
        if (drawer.classList.contains('open')) {
          drawer.classList.remove('open');
        }
      });
      document.body.style.overflow = '';
    }
  });

  // ============================================================
  // SMOOTH SCROLL
  // ============================================================
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = this.getAttribute('href');
      if (id === '#') return;
      var t = document.querySelector(id);
      if (t) {
        e.preventDefault();
        t.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // ============================================================
  // INIT
  // ============================================================
  function init() {
    buildStarfield();
    meteorLoop();
    headerState();
    updateNavigation();
    reveal();
    handleParallax();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.addEventListener('load', reveal);

  var rTimer;
  window.addEventListener('resize', function () {
    clearTimeout(rTimer);
    rTimer = setTimeout(buildStarfield, 300);
  });

})();
