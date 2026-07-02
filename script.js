/* ============================================================
   PORTFOLIO V2 INTERACTIVE ENGINE
   ============================================================ */

window.addEventListener('load', () => {
  if (typeof ScrollTrigger !== 'undefined') {
    ScrollTrigger.refresh();
  }
});

document.addEventListener('DOMContentLoaded', () => {

  let lastActiveSection = 'hero';
  scrollSpeed = 0;
  lastScrollTop = window.scrollY || document.documentElement.scrollTop;

  // Set stagger indices for cards in containers dynamically on load
  const cardContainers = document.querySelectorAll('.stats-grid, .projects-stack, .campaigns-grid, .certificates-grid, .timeline-items');
  cardContainers.forEach(container => {
    const cards = container.querySelectorAll('.reveal-card, .stat-card, .campaign-glass-card, .certificate-glass-card');
    cards.forEach((card, idx) => {
      card.style.setProperty('--i', idx);
    });
  });

  /* ----- 0. THEME TOGGLE (Light / Dark) ----- */
  const html = document.documentElement;
  const THEME_KEY = 'portfolioTheme';

  const applyTheme = (theme) => {
    if (theme === 'light') {
      html.setAttribute('data-theme', 'light');
    } else {
      html.removeAttribute('data-theme');
    }
    localStorage.setItem(THEME_KEY, theme);
  };

  // Restore saved preference (default = system preference)
  let savedTheme = localStorage.getItem(THEME_KEY);
  if (!sessionStorage.getItem('themeInitialized')) {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    savedTheme = prefersDark ? 'dark' : 'light';
    sessionStorage.setItem('themeInitialized', 'true');
  } else {
    savedTheme = savedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  }
  applyTheme(savedTheme);

  // Listen for changes in system color scheme preference
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem(THEME_KEY)) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });

  const toggleTheme = () => {
    const current = html.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    applyTheme(current === 'light' ? 'dark' : 'light');
  };

  // Wire up all theme toggle buttons
  document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
    btn.addEventListener('click', toggleTheme);
  });

  /* ----- 1b. LENIS SMOOTH SCROLL INITIALIZATION ----- */
  let lenis;
  if (window.Lenis) {
    lenis = new Lenis({
      lerp: 0.08, // Snappier scroll response
      wheelMultiplier: 1.15,
      infinite: false,
    });

    // Synchronize Lenis scrolling with ScrollTrigger
    lenis.on('scroll', () => {
      if (window.ScrollTrigger) {
        ScrollTrigger.update();
      }
    });

    // Add Lenis to GSAP's tick loop
    if (window.gsap) {
      window.gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      // Disable lagSmoothing in GSAP to prevent visual jumps during smooth scroll
      window.gsap.ticker.lagSmoothing(0);
    } else {
      // Fallback requestAnimationFrame loop if GSAP isn't loaded
      const step = (time) => {
        lenis.raf(time);
        requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }

    // Connect page navigations (skip links, menu links) to Lenis scroll target
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          lenis.scrollTo(target, {
            offset: -80, // match header offset
            duration: 1.2
          });
        }
      });
    });
  }

  const preloader = document.getElementById('preloader');
  
  // Set up initial Hero states for GSAP immediately to avoid flashes
  if (window.gsap && preloader) {
    // Remove CSS animation classes to prevent conflicts
    document.querySelectorAll('.hero-left-col, .hero-right-col').forEach(el => {
      el.classList.remove('animate-fadeInLeft', 'animate-fadeInRight');
    });
    
    // Set initial parallax offsets
    window.gsap.set("#three-planet-canvas, .gradient-mesh", { scale: 1.12, y: -30 });
    window.gsap.set(".hero-brand-header", { opacity: 0, y: -40 });
    window.gsap.set(".hero-name", { opacity: 0, x: -50, y: 10 });
    window.gsap.set(".hero-title", { opacity: 0, x: -35, y: 15 });
    window.gsap.set(".hero-bio", { opacity: 0, x: 45, y: 15 });
    window.gsap.set(".hero-cta-row", { opacity: 0, y: 35 });
  }

  // Preloader GSAP Timeline
  const runGSAPLoader = () => {
    const tl = window.gsap.timeline({
      defaults: { ease: "power2.out" }
    });

    // Make preloader logo visible and scale it
    tl.to(".preloader-logo", { opacity: 1, scale: 1, y: 0, duration: 0.8, ease: "back.out(1.5)" });
    
    // Draw orbit path
    tl.to(".logo-orbit", { strokeDashoffset: 0, duration: 1.5, ease: "power2.inOut" }, "-=0.4");
    
    // Draw lines path
    tl.to(".logo-lines", { strokeDashoffset: 0, duration: 1.2, ease: "power2.inOut" }, "-=1.1");
    
    // Stagger fade-in the stars
    tl.to(".logo-star", { opacity: 1, scale: 1, duration: 0.6, stagger: 0.1, ease: "back.out(1.8)" }, "-=0.9");
    
    // Fill progress bar to 100%
    tl.to(".preloader-bar", { width: "100%", duration: 1.4, ease: "power1.inOut" }, "-=1.2");
    
    // Transition preloader card out
    tl.to(".preloader-content", { scale: 1.05, opacity: 0, duration: 0.6, ease: "power2.in" });
    
    // Fade out preloader overlay
    tl.to("#preloader", { opacity: 0, duration: 0.6 }, "-=0.4");
    
    // Set preloader to display none
    tl.set("#preloader", { display: "none" });
    
    // Parallax background drift-in (scales down and centers)
    tl.to("#three-planet-canvas, .gradient-mesh", { scale: 1, y: 0, duration: 2.0, ease: "power3.out" }, "-=0.5");
    
    // Stagger reveal Hero elements with parallax paths
    tl.to(".hero-brand-header", { opacity: 1, y: 0, duration: 1.0, ease: "power3.out" }, "-=1.7");
    tl.to(".hero-name", { opacity: 1, x: 0, y: 0, duration: 1.2, ease: "power4.out" }, "-=1.5");
    tl.to(".hero-title", { opacity: 1, x: 0, y: 0, duration: 1.2, ease: "power4.out" }, "-=1.3");
    tl.to(".hero-bio", { opacity: 1, x: 0, y: 0, duration: 1.2, ease: "power4.out" }, "-=1.2");
    tl.to(".hero-cta-row", { opacity: 1, y: 0, duration: 1.2, ease: "power3.out" }, "-=1.0");
  };

  // Fallback native preloader loader sequence
  const runFallbackLoader = () => {
    preloader.classList.add('no-gsap');
    setTimeout(() => {
      preloader.classList.add('loaded');
      setTimeout(() => {
        preloader.style.display = 'none';
      }, 800);
    }, 1200);
  };

  // Run the loader when the window loads
  let loaderStarted = false;
  const startLoader = () => {
    if (loaderStarted) return;
    loaderStarted = true;
    if (window.gsap) {
      runGSAPLoader();
    } else {
      runFallbackLoader();
    }
  };

  window.addEventListener('load', () => {
    setTimeout(startLoader, 200);
  });

  // Safety fallback in case load event does not trigger
  setTimeout(startLoader, 3500);

  /* ----- 2. DYNAMIC SCROLL PROGRESS BAR ----- */
  const progressBar = document.createElement('div');
  progressBar.className = 'scroll-progress-bar';
  document.body.appendChild(progressBar);

  // Progress bar logic moved to the combined throttled scroll handler below.

  /* ----- 3. CURSOR SPOTLIGHT ----- */
  // Combined mousemove event listener is defined below in the unified handler to prevent duplicate event loops.

  /* ----- 4. (Removed 3D Background) ----- */

  /* ----- 5. MAGNETIC HOVER EFFECT (GSAP Physics) ----- */
  const magneticButtons = document.querySelectorAll('.magnetic-button');
  magneticButtons.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      if (window.innerWidth <= 1024) return;
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      gsap.to(btn, { x: x * 0.35, y: y * 0.35, duration: 0.3, ease: "power2.out", overwrite: "auto" });
      const innerSpan = btn.querySelector('span');
      if (innerSpan) {
        gsap.to(innerSpan, { x: x * 0.15, y: y * 0.15, duration: 0.3, ease: "power2.out", overwrite: "auto" });
      }
    });

    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1.1, 0.6)", overwrite: "auto" });
      const innerSpan = btn.querySelector('span');
      if (innerSpan) {
        gsap.to(innerSpan, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1.1, 0.6)", overwrite: "auto" });
      }
    });
  });

  /* ----- 6. GSAP INTERACTIVE ANIMATION ENGINE (ScrollTrigger) ----- */
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    // Disable CSS transitions to prevent them from fighting GSAP's frame-by-frame updates
    document.documentElement.classList.add('gsap-active');

    // Force base CSS states to opacity: 1 so GSAP from() tweens can animate to full visibility
    document.querySelectorAll('.reveal, .reveal-card, .reveal-paragraph, .split-reveal-heading').forEach(el => {
      el.classList.add('visible');
    });

    // 1. Heading slide-reveals
    document.querySelectorAll('.split-reveal-heading').forEach(heading => {
      gsap.from(heading, {
        opacity: 0,
        y: 35,
        duration: 0.9,
        ease: "power2.out",
        scrollTrigger: {
          trigger: heading,
          start: "top 88%",
          toggleActions: "play none none none"
        }
      });
    });

    // 2. Staggered card reveals
    // Skills categories
    gsap.from(".skills-grid .skill-category", {
      opacity: 0,
      y: 40,
      duration: 0.8,
      stagger: 0.12,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".skills-grid",
        start: "top 88%",
        toggleActions: "play none none none"
      }
    });

    // Timeline items
    gsap.from(".timeline-items .timeline-item", {
      opacity: 0,
      x: -30,
      duration: 0.8,
      stagger: 0.15,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".timeline-items",
        start: "top 85%",
        toggleActions: "play none none none"
      }
    });

    // Projects
    gsap.from(".projects-stack .project-glass-card", {
      opacity: 0,
      y: 50,
      duration: 0.9,
      stagger: 0.15,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".projects-stack",
        start: "top 85%",
        toggleActions: "play none none none"
      }
    });

    // Campaigns
    gsap.from(".campaigns-grid .campaign-glass-card", {
      opacity: 0,
      y: 50,
      duration: 0.9,
      stagger: 0.15,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".campaigns-grid",
        start: "top 85%",
        toggleActions: "play none none none"
      }
    });

    // Credentials
    gsap.from(".certificates-grid .certificate-glass-card", {
      opacity: 0,
      y: 35,
      duration: 0.7,
      stagger: 0.1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".certificates-grid",
        start: "top 85%",
        toggleActions: "play none none none"
      }
    });

    // 3. GSAP Count-up animations
    document.querySelectorAll('.stat-num').forEach(num => {
      const limit = parseInt(num.getAttribute('data-val')) || 0;
      // Start element text at 0 before running the count-up tween
      num.textContent = "0";
      gsap.to(num, {
        textContent: limit,
        duration: 1.6,
        ease: "power2.out",
        snap: { textContent: 1 },
        scrollTrigger: {
          trigger: num,
          start: "top 88%",
          toggleActions: "play none none none"
        }
      });
    });

    // 4. Timeline Spine Progress line filling animation
    if (document.querySelector('.timeline-container') && document.querySelector('.spine-progress')) {
      gsap.to(".spine-progress", {
        height: "100%",
        ease: "none",
        scrollTrigger: {
          trigger: ".timeline-container",
          start: "top center",
          end: "bottom center",
          scrub: true
        }
      });
    }

  } else {
    /* ----- 6b. GRACEFUL FALLBACK (Intersection Observer) ----- */
    document.querySelectorAll('.content-section p, .stat-card, .skill-category, .project-glass-card, .campaign-glass-card, .certificate-glass-card, .eyebrow-split').forEach(el => {
      el.classList.add('reveal');
    });

    const globalRevealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

    document.querySelectorAll('.reveal-paragraph, .reveal-card, .split-reveal-heading, .reveal').forEach(el => {
      globalRevealObserver.observe(el);
    });

    /* ----- 7b. FALLBACK NUMBERS COUNT-UP ----- */
    const statNums = document.querySelectorAll('.stat-num');
    let statsTriggered = false;

    const statsObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !statsTriggered) {
        statsTriggered = true;
        statNums.forEach(num => {
          const limit = parseInt(num.getAttribute('data-val'));
          const duration = 1200; // ms
          let startTime = null;

          function updateCount(timestamp) {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const current = Math.min(limit, Math.floor((progress / duration) * limit));
            num.textContent = current;
            if (progress < duration) {
              requestAnimationFrame(updateCount);
            } else {
              num.textContent = limit;
            }
          }
          requestAnimationFrame(updateCount);
        });
      }
    }, { threshold: 0.5 });

    const statsGrid = document.querySelector('.stats-grid');
    if (statsGrid) {
      statsObserver.observe(statsGrid);
    }
  }

  // Timeline active dot glow observer (toggles dynamically on scroll)
  const timelineObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      } else {
        entry.target.classList.remove('active');
      }
    });
  }, { threshold: 0.3, rootMargin: "-10% 0px -10% 0px" });

  document.querySelectorAll('.timeline-item').forEach(el => {
    timelineObserver.observe(el);
  });

  /* ----- 8. ACTIVE NAV LINK TRACKING & BACKGROUND PLANETS ----- */
  const sections = document.querySelectorAll('section[id]');
  const navItems = document.querySelectorAll('.nav-spine .spine-dot, .mobile-menu .mob-link');
  let lastScrollY = window.scrollY || document.documentElement.scrollTop;
  const mobileHeader = document.querySelector('.mobile-header');
  const headerSectionTitle = document.querySelector('.header-section-title');
  const spineDots = Array.from(document.querySelectorAll('.nav-spine .spine-dot'));
  const mobLinks = Array.from(document.querySelectorAll('.mobile-menu .mob-link'));
  const currentIndexEl = document.querySelector('.spine-progress-counter .current-index');
  // lastActiveSection declared at DOMContentLoaded top

  const timeline = document.querySelector('.timeline-container');
  const spineProgress = document.querySelector('.spine-progress');
  const scrollTopBtn = document.getElementById('scroll-to-top');

  let cachedTimelineTop = 0;
  let cachedTimelineHeight = 0;
  let cachedDocHeight = 0;
  let cachedSections = [];
  let spineDotOffsets = [];

  const cacheTimelineGeometry = () => {
    if (timeline) {
      let top = timeline.offsetTop;
      let parent = timeline.offsetParent;
      while (parent) {
        top += parent.offsetTop;
        parent = parent.offsetParent;
      }
      cachedTimelineTop = top;
      cachedTimelineHeight = timeline.offsetHeight;
    }
  };

  const cacheSectionsGeometry = () => {
    cachedSections = Array.from(sections).map(sec => {
      let top = sec.offsetTop;
      let parent = sec.offsetParent;
      while (parent) {
        top += parent.offsetTop;
        parent = parent.offsetParent;
      }
      return {
        id: sec.getAttribute('id'),
        top: top,
        height: sec.offsetHeight
      };
    });
  };

  const cacheDocHeight = () => {
    cachedDocHeight = document.documentElement.scrollHeight - window.innerHeight;
  };

  const cacheSpineDotOffsets = () => {
    if (spineDots.length > 0) {
      spineDotOffsets = spineDots.map(dot => ({
        element: dot,
        offsetTop: dot.offsetTop
      }));
    }
  };

  // Nav spine active line dynamic height updates
  const updateSpineActiveLine = () => {
    const activeLine = document.getElementById('nav-spine-active-line');
    if (activeLine && spineDotOffsets.length > 0) {
      const firstDotOffset = spineDotOffsets[0].offsetTop;
      const activeDotObj = spineDotOffsets.find(d => d.element.classList.contains('active'));
      if (activeDotObj) {
        activeLine.style.top = (firstDotOffset + 4) + 'px';
        activeLine.style.height = (activeDotObj.offsetTop - firstDotOffset) + 'px';
      }
    }
  };

  // Run initial geometry caching
  cacheTimelineGeometry();
  cacheSectionsGeometry();
  cacheDocHeight();
  cacheSpineDotOffsets();

  // Set initial line position after dynamic offsets render
  setTimeout(() => {
    cacheSpineDotOffsets();
    updateSpineActiveLine();
  }, 200);

  let tickingScroll = false;
  window.addEventListener('scroll', () => {
    if (!tickingScroll) {
      window.requestAnimationFrame(() => {
        const scrollTop = window.scrollY;
        
        // 1. Progress Bar
        const scrollPercent = cachedDocHeight > 0 ? (scrollTop / cachedDocHeight) * 100 : 0;
        progressBar.style.width = scrollPercent + '%';

        // 2. Active Nav Link Tracking & Background Planets
        let currentActive = '';
        const scrollPos = scrollTop + window.innerHeight / 3;

        for (let i = 0; i < cachedSections.length; i++) {
          const sec = cachedSections[i];
          if (scrollPos >= sec.top && scrollPos < sec.top + sec.height) {
            currentActive = sec.id;
            break;
          }
        }

        // Default to Hero section when near the top of the scroll
        if (scrollTop < 180) {
          currentActive = 'hero';
        }

        // 1b. Mobile Smart Header (Hide on scroll down, show on scroll up) & Dynamic Section Title
        if (mobileHeader) {
          const currentScrollY = scrollTop;
          
          // Show active section title in header if scrolled past Hero
          if (currentActive && currentActive !== 'hero') {
            const activeDot = spineDots.find(dot => dot.getAttribute('href') === `#${currentActive}`);
            if (activeDot) {
              const lang = document.documentElement.getAttribute('lang') || 'en';
              const titleAttr = lang === 'ar' ? 'data-title-ar' : 'data-title-en';
              const titleVal = activeDot.getAttribute(titleAttr);
              if (headerSectionTitle && headerSectionTitle.textContent !== titleVal) {
                headerSectionTitle.textContent = titleVal;
              }
            }
            mobileHeader.classList.add('show-section-title');
          } else {
            mobileHeader.classList.remove('show-section-title');
          }

          // Hide on scroll down, show on scroll up
          if (currentScrollY > 150) {
            const isMenuOverlayActive = mobileNav && mobileNav.classList.contains('active');
            if (currentScrollY > lastScrollY && !isMenuOverlayActive) {
              mobileHeader.classList.add('header-hidden');
            } else {
              mobileHeader.classList.remove('header-hidden');
            }
          } else {
            mobileHeader.classList.remove('header-hidden');
          }
          lastScrollY = currentScrollY;
        }

        if (currentActive) {
          let activeIdx = 1;
          spineDots.forEach((dot, idx) => {
            dot.classList.remove('active');
            if (dot.getAttribute('href') === `#${currentActive}`) {
              dot.classList.add('active');
              activeIdx = idx + 1;
            }
          });

          // Update navigation spine active line height/position
          updateSpineActiveLine();

          // Update progress counter index text
          if (currentIndexEl) {
            currentIndexEl.textContent = activeIdx.toString().padStart(2, '0');
          }

          // Update mobile active class
          mobLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentActive}`) {
              link.classList.add('active');
            }
          });
        }

        // 3. Spine timeline progress drawing (Fallback only)
        if (timeline && spineProgress) {
          if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
            const startTrigger = window.innerHeight / 2;
            const scrolled = (scrollTop + startTrigger) - cachedTimelineTop;
            const percent = Math.min(Math.max((scrolled / cachedTimelineHeight) * 100, 0), 100);
            spineProgress.style.height = percent + '%';
          }
        }

        // 4. Scroll to Top Button Visibility
        if (scrollTopBtn) {
          if (scrollTop > 600) {
            scrollTopBtn.classList.add('visible');
          } else {
            scrollTopBtn.classList.remove('visible');
          }
        }

        // 5. Starfield scroll speed boost (Merged from Starfield scroll listener)
        let delta = scrollTop - lastScrollTop;
        const speedMult = window.innerWidth <= 768 ? -0.08 : -0.05;
        scrollSpeed = delta * speedMult;
        lastScrollTop = scrollTop;

        tickingScroll = false;
      });
      tickingScroll = true;
    }
  }, { passive: true });

  /* ----- 9. ACCESSIBILITY UTILITIES (FOCUS TRAP & GLOBAL ESCAPE) ----- */
  let activeTriggerElement = null;

  const setupFocusTrap = (container) => {
    container.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;
      
      const focusableSelectors = 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]';
      const focusableElements = Array.from(container.querySelectorAll(focusableSelectors));
      if (focusableElements.length === 0) return;
      
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      
      if (e.shiftKey) { // Shift + Tab
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else { // Tab
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    });
  };

  // Global Escape Key Overlay Closer
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      // 1. Drawers
      const activeDrawer = document.querySelector('.project-drawer.active');
      if (activeDrawer) {
        const closeBtn = activeDrawer.querySelector('.drawer-close');
        if (closeBtn) closeBtn.click();
      }
      
      // 2. Lightbox
      const activeLightbox = document.querySelector('.lightbox-modal.active');
      if (activeLightbox) {
        const closeBtn = activeLightbox.querySelector('.lightbox-close');
        if (closeBtn) closeBtn.click();
      }
      
      // 3. Mobile Nav Menu
      const activeMobileNav = document.getElementById('mobile-nav-overlay');
      if (activeMobileNav && activeMobileNav.classList.contains('active')) {
        const closeBtn = document.getElementById('mobile-close');
        if (closeBtn) closeBtn.click();
      }
    }
  });

  /* ----- 10. PROJECT DRAWERS (GSAP Accelerated Slide-ins) ----- */
  const projectCards = document.querySelectorAll('.project-glass-card, .skill-category, .timeline-card');
  const drawers = document.querySelectorAll('.project-drawer');

  drawers.forEach(drawer => {
    if (!drawer.classList.contains('active')) {
      drawer.setAttribute('inert', '');
    }
  });

  const openDrawer = (drawer) => {
    activeTriggerElement = document.activeElement;
    drawer.removeAttribute('inert');
    drawer.classList.add('active');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    const panel = drawer.querySelector('.drawer-panel');
    const overlay = drawer.querySelector('.drawer-overlay');

    if (window.innerWidth <= 768) {
      // Mobile bottom sheet: slide up
      gsap.fromTo(panel, { y: "100%", x: "0%" }, { y: "0%", x: "0%", duration: 0.5, ease: "power3.out" });
    } else {
      // Desktop modal: scale up & fade in
      gsap.fromTo(panel, { scale: 0.88, opacity: 0, x: "0%", y: "0%" }, { scale: 1.0, opacity: 1, x: "0%", y: "0%", duration: 0.45, ease: "back.out(1.15)" });
    }
    gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.35 });

    const closeBtn = drawer.querySelector('.drawer-close');
    if (closeBtn) closeBtn.focus();
  };

  const closeDrawer = (drawer) => {
    const panel = drawer.querySelector('.drawer-panel');
    const overlay = drawer.querySelector('.drawer-overlay');

    const finishClose = () => {
      drawer.classList.remove('active');
      drawer.setAttribute('aria-hidden', 'true');
      drawer.setAttribute('inert', '');
      document.body.style.overflow = '';
      if (activeTriggerElement) {
        activeTriggerElement.focus();
        activeTriggerElement = null;
      }
    };

    if (window.innerWidth <= 768) {
      // Mobile bottom sheet: slide down
      gsap.to(panel, { y: "100%", duration: 0.4, ease: "power3.in", onComplete: finishClose });
    } else {
      // Desktop modal: scale down & fade out
      gsap.to(panel, { scale: 0.9, opacity: 0, duration: 0.35, ease: "power2.in", onComplete: finishClose });
    }
    gsap.to(overlay, { opacity: 0, duration: 0.3 });
  };

  projectCards.forEach(card => {
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    });

    card.addEventListener('click', (e) => {
      if (e.target.closest('.tag')) return; // let tag listener handle it
      const drawerId = card.getAttribute('data-drawer');
      const targetDrawer = document.getElementById(drawerId);
      if (targetDrawer) {
        // Reset selections
        const expBox = targetDrawer.querySelector('.skill-explanation-box');
        if (expBox) expBox.classList.remove('visible');
        const chips = targetDrawer.querySelectorAll('.drawer-skill-chip');
        chips.forEach(c => c.classList.remove('active'));

        openDrawer(targetDrawer);
      }
    });
  });

  drawers.forEach(drawer => {
    const closeBtn = drawer.querySelector('.drawer-close');
    const overlay = drawer.querySelector('.drawer-overlay');
    const panel = drawer.querySelector('.drawer-panel');
    setupFocusTrap(drawer);

    const closeFn = () => closeDrawer(drawer);

    if (closeBtn) closeBtn.addEventListener('click', closeFn);
    if (overlay) overlay.addEventListener('click', closeFn);

    if (panel) {
      const handle = document.createElement('div');
      handle.className = 'drawer-handle';
      panel.insertBefore(handle, panel.firstChild);
    }

    // Touch Swipe-to-Close Gestures
    let startX = 0;
    let startY = 0;
    let currentX = 0;
    let currentY = 0;

    drawer.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }, { passive: true });

    drawer.addEventListener('touchmove', (e) => {
      currentX = e.touches[0].clientX;
      currentY = e.touches[0].clientY;
    }, { passive: true });

    drawer.addEventListener('touchend', () => {
      if (!startX || !startY || !currentX || !currentY) return;
      const diffX = currentX - startX;
      const diffY = currentY - startY;
      const isRtl = document.documentElement.getAttribute('dir') === 'rtl';
      const swipeThreshold = 80;

      if (window.innerWidth <= 768) {
        if (diffY > swipeThreshold) {
          closeFn();
        }
      } else {
        if ((!isRtl && diffX > swipeThreshold) || (isRtl && diffX < -swipeThreshold)) {
          closeFn();
        }
      }
      startX = startY = currentX = currentY = 0;
    }, { passive: true });
  });

  /* ----- 10b. CERTIFICATE LIGHTBOX ----- */
  const certCards = document.querySelectorAll('.certificate-glass-card');
  const lightbox = document.getElementById('cert-lightbox');
  const lightboxImg = lightbox ? lightbox.querySelector('.lightbox-img') : null;

  if (lightbox && lightboxImg) {
    // Initialize inert attribute on closed lightbox
    if (!lightbox.classList.contains('active')) {
      lightbox.setAttribute('inert', '');
    }
    setupFocusTrap(lightbox);

    certCards.forEach(card => {
      // Add keyboard interaction
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          card.click();
        }
      });

      card.addEventListener('click', () => {
        activeTriggerElement = card;
        const imgSrc = card.getAttribute('data-img');
        lightboxImg.src = imgSrc;
        lightbox.removeAttribute('inert'); // Enable interaction
        lightbox.classList.add('active');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        
        // GSAP zoom & fade transition
        const overlay = lightbox.querySelector('.lightbox-overlay');
        const box = lightbox.querySelector('.lightbox-content-box');
        gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.35, overwrite: "auto" });
        gsap.fromTo(box, { scale: 0.75, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.45, ease: "back.out(1.5)", overwrite: "auto" });
        
        const closeBtn = lightbox.querySelector('.lightbox-close');
        if (closeBtn) closeBtn.focus();
      });
    });

    const closeLightbox = () => {
      const overlay = lightbox.querySelector('.lightbox-overlay');
      const box = lightbox.querySelector('.lightbox-content-box');
      
      gsap.to(box, { scale: 0.75, opacity: 0, duration: 0.35, ease: "power2.in", overwrite: "auto" });
      gsap.to(overlay, { opacity: 0, duration: 0.35, overwrite: "auto", onComplete: () => {
        lightbox.classList.remove('active');
        lightbox.setAttribute('aria-hidden', 'true');
        lightbox.setAttribute('inert', ''); // Disable interaction
        document.body.style.overflow = '';
        lightboxImg.src = '';
        if (activeTriggerElement) {
          activeTriggerElement.focus();
          activeTriggerElement = null;
        }
      }});
    };

    const closeBtn = lightbox.querySelector('.lightbox-close');
    const overlay = lightbox.querySelector('.lightbox-overlay');

    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    if (overlay) overlay.addEventListener('click', closeLightbox);
  }

  /* ----- 11. MOBILE HAMBURGER MENU ----- */
  const burger = document.getElementById('burger');
  const mobileNav = document.getElementById('mobile-nav-overlay');
  const mobileClose = document.getElementById('mobile-close');
  const mobileLinks = document.querySelectorAll('.mobile-menu .mob-link');

  if (burger && mobileNav) {
    setupFocusTrap(mobileNav);

    burger.addEventListener('click', () => {
      const isActive = burger.classList.contains('active');
      if (isActive) {
        closeMobileNav();
      } else {
        activeTriggerElement = burger;
        burger.classList.add('active');
        document.body.classList.add('menu-open');
        mobileNav.classList.add('active');
        mobileNav.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        
        // GSAP animate mobile nav slide down and link staggers
        gsap.fromTo(mobileNav, { y: "-100%" }, { y: "0%", duration: 0.5, ease: "power3.out", overwrite: "auto" });
        gsap.fromTo(".mobile-menu .mob-link", 
          { opacity: 0, y: -15 }, 
          { opacity: 1, y: 0, duration: 0.35, stagger: 0.07, ease: "power2.out", delay: 0.18, overwrite: "auto" }
        );
        
        const closeBtn = document.getElementById('mobile-close');
        if (closeBtn) closeBtn.focus();
      }
    });

    const closeMobileNav = () => {
      burger.classList.remove('active');
      document.body.classList.remove('menu-open');
      
      gsap.to(mobileNav, { y: "-100%", duration: 0.45, ease: "power3.in", overwrite: "auto", onComplete: () => {
        mobileNav.classList.remove('active');
        mobileNav.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        if (activeTriggerElement) {
          activeTriggerElement.focus();
          activeTriggerElement = null;
        }
      }});
    };

    if (mobileClose) mobileClose.addEventListener('click', closeMobileNav);
    mobileLinks.forEach(link => link.addEventListener('click', closeMobileNav));
  }

  /* ----- 12. GLASS CARDS mouse tracking (3D GSAP TILT EFFECT) ----- */
  const glassCards = document.querySelectorAll('.project-glass-card, .certificate-glass-card, .campaign-glass-card, .skill-category, .timeline-card');
  
  glassCards.forEach(card => {
    let rect = null;
    
    card.addEventListener('mouseenter', () => {
      if (window.innerWidth <= 1024) return;
      rect = card.getBoundingClientRect();
    });
    
    card.addEventListener('mousemove', (e) => {
      if (window.innerWidth <= 1024) return;
      if (!rect) rect = card.getBoundingClientRect();

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const tiltX = (centerY - y) / centerY * 6.5;
      const tiltY = (x - centerX) / centerX * 6.5;

      gsap.to(card, {
        transform: `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-5px)`,
        duration: 0.35,
        ease: "power2.out",
        overwrite: "auto"
      });
    });

    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)',
        duration: 0.6,
        ease: "power2.out",
        overwrite: "auto"
      });
      rect = null;
    });
  });

  /* ----- 13. SCROLL TO TOP CLICK FUNCTIONALITY ----- */
  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', () => {
      if (lenis) {
        lenis.scrollTo(0, { duration: 1.2 });
      } else {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
    });
  }

  /* ----- 14. AJAX CONTACT FORM HANDLING ----- */
  const contactForm = document.getElementById('contact-form');
  const formContentArea = document.querySelector('.form-content-area');
  const formSuccessState = document.querySelector('.form-success-state');
  const successUsername = document.getElementById('success-username');
  const resetFormBtn = document.querySelector('.btn-reset-form');
  const submitBtn = contactForm ? contactForm.querySelector('.btn-submit-form') : null;
  const submitBtnSpanEn = submitBtn ? submitBtn.querySelector('.lang-en') : null;
  const submitBtnSpanAr = submitBtn ? submitBtn.querySelector('.lang-ar') : null;

  if (contactForm && formContentArea && formSuccessState) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameVal = document.getElementById('name').value;
      
      // Set submit button loading state
      if (submitBtn) {
        submitBtn.classList.add('loading');
        if (submitBtnSpanEn) submitBtnSpanEn.textContent = 'Transmitting...';
        if (submitBtnSpanAr) submitBtnSpanAr.textContent = 'جاري الإرسال...';
      }

      const formData = new FormData(contactForm);

      fetch(contactForm.action, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      })
      .then(response => {
        if (response.ok) {
          // Animate out the form area
          formContentArea.classList.add('fade-out');
          setTimeout(() => {
            formContentArea.style.display = 'none';
            
            // Customize success message with sender's name
            if (successUsername) {
              successUsername.textContent = nameVal ? nameVal.trim() : 'Friend';
            }
            const successUsernameAr = document.getElementById('success-username-ar');
            if (successUsernameAr) {
              successUsernameAr.textContent = nameVal ? nameVal.trim() : 'صديقي';
            }
            
            // Show success state
            formSuccessState.style.display = 'flex';
          }, 500);
        } else {
          throw new Error('Server returned an error');
        }
      })
      .catch(err => {
        console.error('Submission error:', err);
        const isAr = document.documentElement.getAttribute('lang') === 'ar';
        const errMsg = isAr 
          ? 'فشل إرسال الرسالة. يرجى التحقق من اتصالك بالإنترنت أو التواصل مباشرة عبر البريد الإلكتروني abdelrahman.abdelhafez10@gmail.com'
          : 'Transmission failed. Please check your connection or contact abdelrahman.abdelhafez10@gmail.com directly.';
        alert(errMsg);
      })
      .finally(() => {
        // Reset submit button state
        if (submitBtn) {
          submitBtn.classList.remove('loading');
          if (submitBtnSpanEn) submitBtnSpanEn.textContent = 'Send Message';
          if (submitBtnSpanAr) submitBtnSpanAr.textContent = 'إرسال الرسالة';
        }
      });
    });
  }

  if (resetFormBtn && contactForm) {
    resetFormBtn.addEventListener('click', () => {
      // Clear fields
      contactForm.reset();
      
      // Hide success state
      formSuccessState.style.display = 'none';
      
      // Show form area
      formContentArea.style.display = 'block';
      setTimeout(() => {
        formContentArea.classList.remove('fade-out');
      }, 50);
    });
  }

  /* ----- 15. LANGUAGE SWITCHER LOGIC ----- */
  const initLanguage = () => {
    // Read saved language preference or default to English
    const savedLang = localStorage.getItem('selectedLanguage') || 'en';
    setLanguage(savedLang);

    // Bind clicks to all language toggle buttons
    const langBtns = document.querySelectorAll('.lang-btn');
    langBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const lang = btn.getAttribute('data-lang');
        setLanguage(lang);
      });
    });
  };

  const setLanguage = (lang) => {
    document.documentElement.setAttribute('lang', lang);
    localStorage.setItem('selectedLanguage', lang);

    // Dynamically set text direction based on selected language
    if (lang === 'ar') {
      document.documentElement.setAttribute('dir', 'rtl');
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
    }

    // Update active visual state for language buttons
    const langBtns = document.querySelectorAll('.lang-btn');
    langBtns.forEach(btn => {
      if (btn.getAttribute('data-lang') === lang) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Update spine dots aria-labels dynamically for screen readers
    const spineDots = document.querySelectorAll('.spine-dot');
    spineDots.forEach(dot => {
      const label = lang === 'ar' ? dot.getAttribute('data-title-ar') : dot.getAttribute('data-title-en');
      dot.setAttribute('aria-label', label || 'Navigation dot');
    });

    // Dynamically toggle aria-hidden on multi-language labels for accessibility
    const enLabels = document.querySelectorAll('label.lang-en');
    const arLabels = document.querySelectorAll('label.lang-ar');
    if (lang === 'ar') {
      enLabels.forEach(label => label.setAttribute('aria-hidden', 'true'));
      arLabels.forEach(label => label.removeAttribute('aria-hidden'));
    } else {
      arLabels.forEach(label => label.setAttribute('aria-hidden', 'true'));
      enLabels.forEach(label => label.removeAttribute('aria-hidden'));
    }

    // Update document title and placeholders based on language
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const messageInput = document.getElementById('message');
    
    if (lang === 'ar') {
      document.title = 'عبد الرحمن عبد الحافظ | استراتيجي تسويق رقمي';
      if (nameInput) nameInput.placeholder = 'اسمك بالكامل';
      if (emailInput) emailInput.placeholder = 'بريدك الإلكتروني';
      if (messageInput) messageInput.placeholder = 'قولي أكتر عن مشروعك...';
    } else {
      document.title = 'Abdelrahman Abdelhafez | Digital Marketing Strategist';
      if (nameInput) nameInput.placeholder = 'Your Name';
      if (emailInput) emailInput.placeholder = 'your@email.com';
      if (messageInput) messageInput.placeholder = 'Tell me about your project...';
    }
  };

  initLanguage();

  // Project cards peek hover details are handled via native CSS now.

  /* ============================================================
     STARRY NIGHT & CLOUD FIELD INTERACTIVE ENGINE (2D Canvas)
     ============================================================ */
  const canvas = document.getElementById('three-planet-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    
    let width, height;
    let stars = [];
    let clouds = [];
    const numStars = window.innerWidth > 768 ? 250 : 120;
    const numClouds = window.innerWidth > 768 ? 16 : 8; // Set to 0 on mobile to completely prevent overdraw scroll lag in Light Theme

    // Preload cloud images for light mode
    const cloudImages = [];
    const cloudSources = ['cloud-flat-1.webp', 'cloud-flat-2.webp', 'cloud-flat-3.webp'];
    let cloudsLoaded = false;
    let loadedCount = 0;

    cloudSources.forEach(src => {
      const img = new Image();
      // Attach onload callback BEFORE setting src to guarantee it fires for cached assets
      img.onload = () => {
        loadedCount++;
        if (loadedCount === cloudSources.length) {
          cloudsLoaded = true;
        }
      };
      img.onerror = () => {
        console.warn(`Failed to load cloud image: ${src}`);
      };
      img.src = src;
      cloudImages.push(img);
    });
    
    // Palette for realistic stars
    // Palette for realistic stars (Color Temperature: Blue-White, Amber, Red Dwarf, Aurora Cyan)
    const starColors = ['#FFFFFF', '#F8F9FA', '#A0C4FF', '#FFD166', '#FFADAD', '#2EC4B6'];
    
    // Mouse interaction with interpolation for organic, fluid lag
    let mouse = { x: -1000, y: -1000 };
    let targetMouse = { x: -1000, y: -1000 };
    scrollSpeed = 0;
    lastScrollTop = window.scrollY || document.documentElement.scrollTop;

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    }

    // Comet & Explosion Particles Register
    let activeComet = null;
    let explosionParticles = [];
    let cometTimer = 0;

    const triggerFloatingText = (x, y) => {
      const badge = document.createElement('div');
      badge.className = 'floating-comet-badge';
      const lang = document.documentElement.getAttribute('lang') || 'en';
      badge.textContent = lang === 'ar' ? '☄️ تم اصطياد الشهاب! +1' : '☄️ Comet Caught! +1';
      badge.style.left = `${x}px`;
      badge.style.top = `${y}px`;
      document.body.appendChild(badge);
      setTimeout(() => {
        badge.remove();
      }, 1300);
    };

    class Comet {
      constructor() {
        this.reset();
      }
      reset() {
        // Decide spawn location & direction
        const dir = Math.random() < 0.5 ? 1 : -1; // 1 = top-left to bottom-right, -1 = top-right to bottom-left
        
        if (dir === 1) {
          this.x = Math.random() * width * 0.5 - 100;
          this.y = -50;
          const angle = Math.PI * 0.25 + (Math.random() - 0.5) * 0.15; // ~45 deg diagonal down-right
          const speed = 18 + Math.random() * 10;
          this.vx = Math.cos(angle) * speed;
          this.vy = Math.sin(angle) * speed;
        } else {
          this.x = Math.random() * width * 0.5 + width * 0.5 + 100;
          this.y = -50;
          const angle = Math.PI * 0.75 + (Math.random() - 0.5) * 0.15; // ~135 deg diagonal down-left
          const speed = 18 + Math.random() * 10;
          this.vx = Math.cos(angle) * speed;
          this.vy = Math.sin(angle) * speed;
        }
        
        this.size = 1.0 + Math.random() * 1.2;
        this.alpha = 1.0;
        this.trail = [];
        this.trailLength = 25 + Math.floor(Math.random() * 15);
        this.active = true;
        this.isExploded = false;
      }
      update() {
        if (this.isExploded) return;
        this.trail.push({ x: this.x, y: this.y, alpha: this.alpha });
        if (this.trail.length > this.trailLength) {
          this.trail.shift();
        }
        this.x += this.vx;
        this.y += this.vy;
        
        // Gradually fade out head alpha as it burns up
        this.alpha -= 0.015 + Math.random() * 0.01;
        
        if (this.alpha <= 0 || this.x < -150 || this.x > width + 150 || this.y > height + 150) {
          this.active = false;
        }
      }
      draw() {
        if (this.isExploded || this.trail.length === 0) return;
        
        // Draw trailing needle-like line segment by segment with tapering opacity (extremely clean shooting star)
        for (let i = 1; i < this.trail.length; i++) {
          ctx.beginPath();
          ctx.moveTo(this.trail[i-1].x, this.trail[i-1].y);
          ctx.lineTo(this.trail[i].x, this.trail[i].y);
          
          const trailOpacity = this.alpha * (i / this.trail.length) * 0.22;
          ctx.strokeStyle = `rgba(248, 249, 250, ${trailOpacity})`;
          ctx.lineWidth = this.size * 0.5 * (i / this.trail.length); // tapers to head
          ctx.lineCap = 'round';
          ctx.stroke();
        }
        
        // Head (star-like bright point)
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
        ctx.fill();
        
        // Faint glow
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha * 0.12})`;
        ctx.fill();
      }
      explode() {
        this.isExploded = true;
        this.active = false;
        for (let i = 0; i < 40; i++) {
          explosionParticles.push(new ExplosionParticle(this.x, this.y));
        }
        triggerFloatingText(this.x, this.y);
      }
    }

    class ExplosionParticle {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        let angle = Math.random() * Math.PI * 2;
        let speed = 1.5 + Math.random() * 5;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.size = 1 + Math.random() * 2;
        this.alpha = 1.0;
        this.decay = 0.016 + Math.random() * 0.022;
        const colors = ['#2EC4B6', '#FF9F1C', '#FFFFFF', '#FF9F1C'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.95;
        this.vy *= 0.95;
        this.alpha -= this.decay;
      }
      draw() {
        if (this.alpha <= 0) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color === '#2EC4B6' 
          ? `rgba(46, 196, 182, ${this.alpha})`
          : this.color === '#FF9F1C'
            ? `rgba(255, 159, 28, ${this.alpha})`
            : `rgba(255, 255, 255, ${this.alpha})`;
        ctx.fill();
      }
    }

    class Star {
      constructor() {
        this.reset();
        
        // Setup initial drift speeds (always defined, so coordinate updates never produce NaN!)
        this.vx = (Math.random() - 0.5) * 0.06 * this.z;
        this.vy = -Math.random() * 0.06 * this.z - 0.02 * this.z;
        
        // Physical velocity states for Spring-Back movement
        this.px = 0;
        this.py = 0;
        
        // Setup twinkling with GSAP if available
        if (typeof gsap !== 'undefined') {
          this.twinkle = 0;
          this.twinkleTween = gsap.to(this, {
            twinkle: 0.5,
            duration: 1.5 + Math.random() * 2.5,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: Math.random() * 2
          });
        } else {
          // TWINKLE FALLBACKS
          this.twinkle = 0;
          this.twinklePhase = Math.random() * Math.PI * 2;
          this.twinkleSpeed = Math.random() * 0.05 + 0.01;
        }
      }
      
      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        
        // original targets for spring physical memory
        this.ox = this.x;
        this.oy = this.y;
        
        const sizeRand = Math.random();
        if (sizeRand > 0.96) this.z = Math.random() * 0.7 + 0.5;
        else if (sizeRand > 0.72) this.z = Math.random() * 0.4 + 0.25;
        else this.z = Math.random() * 0.15 + 0.08;

        this.baseAlpha = Math.random() * 0.7 + 0.3;
        this.alpha = this.baseAlpha;
        
        this.color = starColors[Math.floor(Math.random() * starColors.length)];
        
        if (this.color === '#FFFFFF') { this.rgb = { r: 255, g: 255, b: 255 }; }
        else if (this.color === '#F8F9FA') { this.rgb = { r: 248, g: 249, b: 250 }; }
        else if (this.color === '#A0C4FF') { this.rgb = { r: 160, g: 196, b: 255 }; }
        else if (this.color === '#FFD166') { this.rgb = { r: 255, g: 209, b: 102 }; }
        else if (this.color === '#FFADAD') { this.rgb = { r: 255, g: 173, b: 173 }; }
        else if (this.color === '#2EC4B6') { this.rgb = { r: 46, g: 196, b: 182 }; }
        else { this.rgb = { r: 255, g: 255, b: 255 }; }
      }
      
      update() {
        // Drift the original target position
        this.ox += this.vx;
        this.oy += this.vy;
        this.oy += scrollSpeed * this.z * 0.5;
        
        // Wrap original positions
        if (this.ox < -50) { this.ox = width + 50; this.x = this.ox; }
        if (this.ox > width + 50) { this.ox = -50; this.x = this.ox; }
        if (this.oy < -50) { this.oy = height + 50; this.y = this.oy; }
        if (this.oy > height + 50) { this.oy = -50; this.y = this.oy; }
        
        // Calculate acceleration towards the original target path (Spring force)
        let ax = (this.ox - this.x) * 0.04;
        let ay = (this.oy - this.y) * 0.04;
        
        // Twinkle factor
        let currentTwinkle = 0;
        if (typeof gsap !== 'undefined') {
            currentTwinkle = this.twinkle;
        } else {
            this.twinklePhase += this.twinkleSpeed;
            currentTwinkle = Math.sin(this.twinklePhase) * 0.5;
        }
        
        // Calculate mouse repulsion
        let dx = this.x - mouse.x;
        let dy = this.y - mouse.y;
        let distSq = dx * dx + dy * dy;
        const maxDist = 200;
        
        if (distSq < maxDist * maxDist) {
          let dist = Math.sqrt(distSq);
          if (dist > 0) {
            let force = (maxDist - dist) / maxDist;
            // Gravity attraction: pull towards mouse!
            ax -= (dx / dist) * force * 3.2 * (1.2 - this.z * 0.6);
            ay -= (dy / dist) * force * 3.2 * (1.2 - this.z * 0.6);
            this.alpha = Math.min(1.0, this.baseAlpha + force * 0.4);
          }
        } else {
          this.alpha = Math.max(0.1, Math.min(1.0, this.baseAlpha + currentTwinkle));
        }
        
        // Update velocity with damping and update position
        this.px = (this.px + ax) * 0.82;
        this.py = (this.py + ay) * 0.82;
        
        this.x += this.px;
        this.y += this.py;
      }
      
      draw() {
        let currentTwinkle = (typeof gsap !== 'undefined') ? this.twinkle : Math.sin(this.twinklePhase) * 0.3;
        let currentZ = Math.max(0.1, this.z + currentTwinkle);
        let renderAlpha = this.alpha * 0.6;

        if (this.z > 0.8 && renderAlpha > 0.2) {
          ctx.beginPath();
          ctx.arc(this.x, this.y, currentZ * 4, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${this.rgb.r}, ${this.rgb.g}, ${this.rgb.b}, ${renderAlpha * 0.15})`;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(this.x, this.y, currentZ, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.rgb.r}, ${this.rgb.g}, ${this.rgb.b}, ${renderAlpha})`;
        ctx.fill();
        
        if (this.z > 0.95 && renderAlpha > 0.2) {
          let spikeSize = currentZ * 4.5;
          ctx.beginPath();
          ctx.moveTo(this.x - spikeSize, this.y);
          ctx.lineTo(this.x + spikeSize, this.y);
          ctx.moveTo(this.x, this.y - spikeSize);
          ctx.lineTo(this.x, this.y + spikeSize);
          ctx.strokeStyle = `rgba(${this.rgb.r}, ${this.rgb.g}, ${this.rgb.b}, ${renderAlpha * 0.2})`;
          ctx.lineWidth = 0.3;
          ctx.stroke();
        }
      }
    }

    class CloudParticle {
      constructor() {
        this.reset(true);
      }

      reset(randomY = false) {
        this.x = Math.random() * (width + 800) - 400;
        this.y = randomY ? Math.random() * height : -400;
        this.z = Math.random() * 0.8 + 0.35;
        this.imgIndex = Math.floor(Math.random() * cloudSources.length);
        
        this.baseWidth = 550 + Math.random() * 350;
        this.width = this.baseWidth * this.z;
        this.height = this.width * 0.55;
        
        this.baseAlpha = (Math.random() * 0.12 + 0.82) * (this.z * 0.2 + 0.8);
        this.alpha = this.baseAlpha;
        
        this.offsetX = 0;
        this.offsetY = 0;
        this.scaleX = 1;
        this.scaleY = 1;
        
        this.breathX = 1.0;
        this.breathY = 1.0;
        
        if (typeof gsap !== 'undefined') {
          this.breathXTween = gsap.to(this, {
            breathX: 1.09,
            duration: 3 + Math.random() * 3,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: Math.random() * 2
          });
          
          this.breathYTween = gsap.to(this, {
            breathY: 1.09,
            duration: 2.5 + Math.random() * 3,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: Math.random() * 2
          });

          this.startDrift();
        } else {
          // DRIFT & BREATH FALLBACKS
          this.vx = (0.03 + Math.random() * 0.05) * this.z;
          this.vy = (0.01 + Math.random() * 0.02) * this.z;
          this.breathPhase = Math.random() * Math.PI * 2;
          this.breathSpeed = Math.random() * 0.005 + 0.002;
        }
      }

      startDrift() {
        if (typeof gsap === 'undefined') return;
        const distanceLeft = (width + this.width + 100) - this.x;
        const totalDistance = width + 2 * this.width + 200;
        const driftDuration = (distanceLeft / totalDistance) * (100 + Math.random() * 80);
        
        this.driftTween = gsap.to(this, {
          x: width + this.width + 100,
          duration: driftDuration,
          ease: "none",
          onComplete: () => {
            this.x = -this.width - 100;
            this.y = Math.random() * height * 0.75;
            this.driftTween = gsap.to(this, {
              x: width + this.width + 100,
              duration: 100 + Math.random() * 80,
              ease: "none",
              repeat: -1,
              onRepeat: () => {
                this.x = -this.width - 100;
                this.y = Math.random() * height * 0.75;
              }
            });
          }
        });
      }

      update() {
        // ALWAYS use manual native drift physics for x/y updates. GSAP tweening overwrites physics and breaks mouse/parallax interactions!
        this.x += this.vx;
        this.y += this.vy;
        
        if (typeof gsap === 'undefined') {
          this.y += Math.sin(this.breathPhase * 0.5) * 0.06 * this.z;
          this.breathPhase += this.breathSpeed;
        }
        
        this.y += scrollSpeed * this.z * 0.22;
        
        // Wrap around screen boundaries in all directions
        if (this.x - this.width > width) {
          this.x = -this.width;
          this.y = Math.random() * height;
        } else if (this.x + this.width < 0) {
          this.x = width;
          this.y = Math.random() * height;
        }
        if (this.y - this.height > height) {
          this.y = -this.height;
          this.x = Math.random() * (width + 200) - 100;
        } else if (this.y + this.height < 0) {
          this.y = height;
          this.x = Math.random() * (width + 200) - 100;
        }
        
        // Mouse repulsion
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;
        const dx = cx - mouse.x;
        const dy = cy - mouse.y;
        const distSq = dx * dx + dy * dy;
        const maxDist = 380;
        
        let targetOffsetX = 0;
        let targetOffsetY = 0;
        let targetScaleX = 1;
        let targetScaleY = 1;
        let targetAlpha = this.baseAlpha;
        
        if (distSq < maxDist * maxDist) {
          const dist = Math.sqrt(distSq);
          if (dist > 0) {
            const force = (maxDist - dist) / maxDist;
            targetOffsetX = (dx / dist) * force * 110 * this.z;
            targetOffsetY = (dy / dist) * force * 75 * this.z;
            const angle = Math.atan2(dy, dx);
            const stretchAmount = force * 0.24;
            targetScaleX = 1.0 - stretchAmount * Math.cos(2 * angle);
            targetScaleY = 1.0 + stretchAmount * Math.cos(2 * angle);
            targetAlpha = Math.min(1.0, this.baseAlpha + force * 0.18);
          }
        }
        
        const speedFactor = 0.026;
        this.offsetX += (targetOffsetX - this.offsetX) * speedFactor;
        this.offsetY += (targetOffsetY - this.offsetY) * speedFactor;
        this.scaleX += (targetScaleX - this.scaleX) * speedFactor;
        this.scaleY += (targetScaleY - this.scaleY) * speedFactor;
        this.alpha += (targetAlpha - this.alpha) * speedFactor;
      }

      draw() {
        const img = cloudImages[this.imgIndex];
        
        let renderBreathX = this.breathX;
        let renderBreathY = this.breathY;
        let alphaBreath = 0;
        
        if (typeof gsap === 'undefined') {
          renderBreathX = 1 + Math.sin(this.breathPhase) * 0.09;
          renderBreathY = 1 + Math.cos(this.breathPhase * 0.75) * 0.09;
          alphaBreath = Math.sin(this.breathPhase) * 0.03;
        }
        
        const finalAlpha = Math.max(0.08, Math.min(1.0, this.alpha + alphaBreath));
        const drawW = this.width * renderBreathX * this.scaleX;
        const drawH = this.height * renderBreathY * this.scaleY;
        const drawX = this.x + this.offsetX - (drawW - this.width) / 2;
        const drawY = this.y + this.offsetY - (drawH - this.height) / 2;
        
        // Draw the preloaded WebP image if fully ready
        if (img && img.complete && img.naturalWidth > 0) {
          ctx.save();
          ctx.globalAlpha = finalAlpha;
          // Apply soft ambient drop-shadow filter to preloaded WebP images
          ctx.filter = 'drop-shadow(0px 8px 16px rgba(30, 61, 97, 0.06))';
          ctx.drawImage(img, drawX, drawY, drawW, drawH);
          ctx.restore();
        } else {
          // Bulletproof procedural fallback if WebP images are loading or blocked (e.g. file:// CORS context)
          ctx.save();
          ctx.globalAlpha = finalAlpha * 0.75; // slightly softer fallback
          
          // Apply soft ambient drop-shadow filter to procedural canvas puffs
          ctx.filter = 'drop-shadow(0px 6px 12px rgba(30, 61, 97, 0.05))';
          
          const cx = drawX + drawW / 2;
          const cy = drawY + drawH / 2;
          
          // Volumetric 3D radial gradient shading representing the cloud body
          const grad = ctx.createRadialGradient(cx, cy - drawH * 0.12, 5, cx, cy, drawW * 0.5);
          grad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');       // Pure bright center
          grad.addColorStop(0.7, 'rgba(224, 238, 254, 0.85)');     // Soft light-blue volume
          grad.addColorStop(0.9, 'rgba(191, 219, 254, 0.45)');     // Blue-grey boundary shadow
          grad.addColorStop(1.0, 'rgba(191, 219, 254, 0)');
          
          ctx.fillStyle = grad;
          ctx.beginPath();
          
          const r = drawH * 0.44;
          ctx.arc(cx - drawW * 0.22, cy + drawH * 0.08, r * 0.85, 0, Math.PI * 2);
          ctx.arc(cx + drawW * 0.22, cy + drawH * 0.08, r * 0.85, 0, Math.PI * 2);
          ctx.arc(cx, cy - drawH * 0.05, r * 1.15, 0, Math.PI * 2);
          ctx.arc(cx - drawW * 0.08, cy - drawH * 0.11, r * 1.05, 0, Math.PI * 2);
          ctx.arc(cx + drawW * 0.08, cy - drawH * 0.11, r * 1.05, 0, Math.PI * 2);
          
          ctx.fill();
          ctx.restore();
        }
      }
    }

    function init() {
      // Clean up old GSAP tweens on stars and clouds if GSAP is available
      if (typeof gsap !== 'undefined') {
        stars.forEach(star => {
          if (star.twinkleTween) star.twinkleTween.kill();
          if (star.driftTween) star.driftTween.kill();
        });
        clouds.forEach(cloud => {
          if (cloud.breathXTween) cloud.breathXTween.kill();
          if (cloud.breathYTween) cloud.breathYTween.kill();
          if (cloud.driftTween) cloud.driftTween.kill();
        });
      }

      resize();
      
      // Initialize Stars
      stars = [];
      for (let i = 0; i < numStars; i++) {
        stars.push(new Star());
      }
      
      // Initialize Clouds
      clouds = [];
      for (let i = 0; i < numClouds; i++) {
        clouds.push(new CloudParticle());
      }
    }

    let isTabVisible = true;
    document.addEventListener('visibilitychange', () => {
      isTabVisible = !document.hidden;
      if (isTabVisible) {
        lastScrollTop = window.scrollY || document.documentElement.scrollTop;
        lastScrollY = lastScrollTop;
        animate();
      }
    });

    function animate() {
      if (!isTabVisible) return;
      
      try {
        ctx.clearRect(0, 0, width, height);
        
        // Smoothly interpolate mouse coordinates for a beautifully damped interaction lag!
        if (targetMouse.x === -1000) {
          mouse.x += (targetMouse.x - mouse.x) * 0.08;
          mouse.y += (targetMouse.y - mouse.y) * 0.08;
          if (Math.abs(mouse.x - targetMouse.x) < 1) {
            mouse.x = -1000;
            mouse.y = -1000;
          }
        } else {
          mouse.x += (targetMouse.x - mouse.x) * 0.08;
          mouse.y += (targetMouse.y - mouse.y) * 0.08;
        }
        
        // Read active theme
        const isLight = document.documentElement.getAttribute('data-theme') === 'light';
        
        if (isLight) {
          clouds.forEach(cloud => {
            cloud.update();
            cloud.draw();
          });
        } else {
          // Stars update & draw
          stars.forEach(star => {
            star.update();
            star.draw();
          });

          // Draw constellation lines (Optimized connection distance and threshold)
          for (let i = 0; i < stars.length; i++) {
            let starA = stars[i];
            if (starA.z < 0.65) continue;
            
            for (let j = i + 1; j < stars.length; j++) {
              let starB = stars[j];
              if (starB.z < 0.65) continue;
              
              let dx = starA.x - starB.x;
              let dy = starA.y - starB.y;
              let distSq = dx * dx + dy * dy;
              const maxConnDist = 80;
              if (distSq < maxConnDist * maxConnDist) {
                let dist = Math.sqrt(distSq);
                let alphaFactor = (maxConnDist - dist) / maxConnDist;
                let lineAlpha = Math.min(starA.alpha, starB.alpha) * 0.09 * alphaFactor;
                ctx.beginPath();
                ctx.moveTo(starA.x, starA.y);
                ctx.lineTo(starB.x, starB.y);
                ctx.strokeStyle = `rgba(46, 196, 182, ${lineAlpha})`;
                ctx.lineWidth = 0.35;
                ctx.stroke();
              }
            }
          }
          
          // Comet spawning and processing
          if (!activeComet) {
            cometTimer++;
            if (cometTimer > 500 && Math.random() < 0.0035) {
              activeComet = new Comet();
              cometTimer = 0;
            }
          } else {
            activeComet.update();
            activeComet.draw();
            if (!activeComet.active) {
              activeComet = null;
            } else if (mouse.x !== -1000) {
              let dx = activeComet.x - mouse.x;
              let dy = activeComet.y - mouse.y;
              if (dx * dx + dy * dy < 42 * 42) {
                activeComet.explode();
                activeComet = null;
              }
            }
          }
          
          // Explosion particles
          for (let i = explosionParticles.length - 1; i >= 0; i--) {
            let p = explosionParticles[i];
            p.update();
            p.draw();
            if (p.alpha <= 0) {
              explosionParticles.splice(i, 1);
            }
          }
        }
        
        scrollSpeed *= 0.9;
        requestAnimationFrame(animate);
      } catch (err) {
        console.error("Canvas animation error:", err);
      }
    }

    // Debounced Resize event listener (200ms delay) to save processing
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        resize();
        init();
        cacheTimelineGeometry();
        cacheSectionsGeometry();
        cacheDocHeight();
        cacheSpineDotOffsets();
        updateSpineActiveLine();
      }, 200);
    });
    
    // Merged global mousemove event listener (handles spotlight AND starfield)
    window.addEventListener('mousemove', (e) => {
      if (window.innerWidth > 1024) {
        document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
        document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
      }
      targetMouse.x = e.clientX;
      targetMouse.y = e.clientY;
      if (mouse.x === -1000) {
        mouse.x = targetMouse.x;
        mouse.y = targetMouse.y;
      }
    }, { passive: true });

    window.addEventListener('mouseout', () => {
      targetMouse.x = -1000;
      targetMouse.y = -1000;
    });
    
    window.addEventListener('touchstart', (e) => {
      targetMouse.x = e.touches[0].clientX;
      targetMouse.y = e.touches[0].clientY;
      mouse.x = targetMouse.x;
      mouse.y = targetMouse.y;
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      targetMouse.x = e.touches[0].clientX;
      targetMouse.y = e.touches[0].clientY;
      if (mouse.x === -1000) {
        mouse.x = targetMouse.x;
        mouse.y = targetMouse.y;
      }
    }, { passive: true });

    window.addEventListener('touchend', () => {
      targetMouse.x = -1000;
      targetMouse.y = -1000;
    }, { passive: true });
    
    init();
    animate();
  }

  /* ============================================================
     COSMIC AI CHATBOT ENGINE (ASTRO-BOT)
     ============================================================ */

  // Interactive Skills Database
  const SkillDatabase = {
    // Strategy & Planning
    "swot": {
      title_en: "SWOT Analysis",
      title_ar: "تحليل SWOT الاستراتيجي",
      desc_en: "A structured framework to assess Strengths, Weaknesses, Opportunities, and Threats to match internal capabilities with market dynamics.",
      desc_ar: "إطار عمل منظم لتقييم نقاط القوة والضعف والفرص والتهديدات للمواءمة بين القدرات الداخلية وحالة السوق الخارجية.",
      use_en: "Abdelrahman built a dual-SWOT analysis in his Kyoko Gifts playbook and New Direction academy setups to evaluate direct and indirect competitors.",
      use_ar: "قام عبد الرحمن بإعداد نموذج SWOT مزدوج في خطط نيو دايركشن وهدايا كيوكو لتقييم المنافسين وتحديد الفجوات التسويقية بدقة."
    },
    "smart": {
      title_en: "SMART Goals Setup",
      title_ar: "صياغة الأهداف الذكية",
      desc_en: "Setting objectives that are Specific, Measurable, Achievable, Relevant, and Time-bound to ensure clarity in conversion tracking.",
      desc_ar: "تحديد أهداف تسويقية محددة، قابلة للقياس والتحقيق، ذات صلة بالعمل ومحكومة بجدول زمني لضمان قياس كفاءة الحملات.",
      use_en: "Drafted 5 SMART objectives for Kyoko Gifts, aligning initial marketing expenses with exact churn reduction and retention metrics.",
      use_ar: "صاغ 5 أهداف SMART تسويقية لمشروع كيوكو، لربط المصاريف التسويقية بقياسات محددة للاحتفاظ بالعملاء وتقليل تسربهم."
    },
    "4ps": {
      title_en: "4Ps marketing Mix",
      title_ar: "المزيج التسويقي 4Ps",
      desc_en: "Optimizing the foundational pillars of marketing: Product, Price, Place, and Promotion to establish a strong market positioning.",
      desc_ar: "تحليل وتنسيق الركائز الأربع للتسويق: المنتج، السعر، المكان، والترويج لبناء تموضع تنافسي قوي للعلامة التجارية.",
      use_en: "Mapped the pricing matrices and localized promotional plans for retail launches in both EdTech and Gifting brands.",
      use_ar: "رسم خرائط التسعير والمزيج الترويجي لإطلاق الخدمات والمنتجات الاستهلاكية لكل من قطاعي التعليم البديل والهدايا."
    },
    "blue-ocean": {
      title_en: "Blue Ocean Strategy",
      title_ar: "استراتيجية المحيط الأزرق",
      desc_en: "The practice of unlocking new, uncontested market spaces by pursuing differentiation and low cost simultaneously, making competition irrelevant.",
      desc_ar: "منهجية ابتكار أسواق جديدة خالية من المنافسة عن طريق تقديم قيم جديدة للعملاء مع خفض التكاليف لجعل المنافسة التقليدية غير مجدية.",
      use_en: "Developed the value innovation canvas for Kyoko Gifts, shifting target focus from simple pricing wars to emotional premium gifting experiences.",
      use_ar: "صمم مخطط ابتكار القيمة لمشروع كيوكو، لتفادي حروب الأسعار ونقل التنافس إلى تقديم تجارب إهداء فاخرة وعاطفية."
    },
    "buyer-persona": {
      title_en: "Buyer Personas Development",
      title_ar: "تحديد شخصية العميل",
      desc_en: "Creating semi-fictional representations of target customers based on demographic, psychographic, and support behavior data.",
      desc_ar: "بناء شخصيات افتراضية تمثل العملاء المستهدفين للشركة بناءً على البيانات الديموغرافية، السلوكية، والاهتمامات الشخصية لتوجيه الرسائل الإعلانية.",
      use_en: "Formulated two specific customer profiles (Corporate Gifter & Relationship focused buyer) for Kyoko Gifts playbook to tailor content.",
      use_ar: "صمم شخصيتين مفصلتين لعملاء كيوكو لتفصيل محتوى إعلاني مخصص لكل شريحة وتوجيههم بسلاسة عبر قنوات الشراء."
    },
    "bmc": {
      title_en: "Business Model Canvas (BMC)",
      title_ar: "مخطط نموذج العمل التجاري",
      desc_en: "A strategic management template for documenting existing or developing new business models, mapping cost structure against value flows.",
      desc_ar: "أداة إدارية لتخطيط وتوثيق هيكل العمل التجاري، وتوضيح مصادر الإيرادات، التكاليف، العلاقات مع العملاء، والشركاء الرئيسيين.",
      use_en: "Assembled the full BMC structure for Kyoko Gifts, establishing key logistics partnerships and primary customer acquisition channels.",
      use_ar: "صمم نموذج العمل الكامل لهدايا كيوكو، لتحديد شركاء الخدمات اللوجستية وقنوات الاستحواذ على العملاء ومصادر الدخل المستدامة."
    },
    // Content & Copywriting
    "copywriting": {
      title_en: "Bilingual Copywriting",
      title_ar: "كتابة نصوص ثنائية اللغة",
      desc_en: "Crafting persuasive, benefit-driven ad copy and landing page headings in both English and Arabic, tailored to local cultural contexts.",
      desc_ar: "كتابة نصوص إعلانية مقنعة تركز على الفوائد وصفحات الهبوط باللغتين العربية والإنجليزية لتناسب الجماهير المحلية المتنوعة.",
      use_en: "Applied copy improvements to self-service support content for Tabby BNPL customer portals to decrease repeat contact volume.",
      use_ar: "صاغ نصوص الدعم الذاتي لبوابات عملاء تابي مصر لتحسين تجربة الخدمة الذاتية وخفض معدل الاتصالات المتكررة."
    },
    "calendars": {
      title_en: "Content Calendars Planning",
      title_ar: "تخطيط وجدولة المحتوى",
      desc_en: "Designing structured publication timetables across social networks, organizing topics by marketing funnel stages.",
      desc_ar: "جدولة وتخطيط نشر المحتوى الرقمي عبر منصات التواصل، وترتيب الموضوعات بناءً على مراحل قمع المبيعات المختلفة.",
      use_en: "Managed monthly social calendars for New Direction Academy, scheduling promotional, engaging, and community posts.",
      use_ar: "أدار جداول النشر الشهرية لنيو دايركشن على فيسبوك وإنستجرام، وتنسيق المنشورات الترويجية والتعليمية بشكل متوازن."
    },
    "hero-hub": {
      title_en: "Hero/Hub/Hygiene Model",
      title_ar: "هيكلة وتصنيف المحتوى",
      desc_en: "Structuring content strategy into: Hero (major launches), Hub (community engagement), and Hygiene (always-on search optimized information).",
      desc_ar: "هيكلة وتوزيع صناعة المحتوى إلى: Hero (حملات الإطلاق الكبرى)، Hub (منشورات التفاعل المستمر)، وHygiene (محتوى الإجابة على الأسئلة الشائعة).",
      use_en: "Grouped digital assets in marketing playbooks into active hubs and hygiene directories to maintain long-term search engine value.",
      use_ar: "صنف الأصول الرقمية وصناعة المحتوى في خططه التسويقية لضمان تغطية الأسئلة الشائعة بالتوازي مع الحملات الترويجية."
    },
    "brand-voice": {
      title_en: "Brand Voice Definition",
      title_ar: "تحديد نبرة صوت العلامة",
      desc_en: "Establishing a consistent, recognizable style and personality for all customer-facing text across all communication channels.",
      desc_ar: "بناء نبرة صوت موحدة ومميزة تخاطب بها العلامة التجارية جمهورها عبر قنوات التواصل الرقمية والدعم الهاتفي.",
      use_en: "Directed brand voice guides for New Direction Academy, defining a friendly, professional educator tone.",
      use_ar: "حدد نبرة صوت العلامة لأكاديمية نيو دايركشن، لتكون ودودة، مشجعة، ومهنية تناسب الطلاب الباحثين عن تطوير مهاراتهم."
    },
    "audits": {
      title_en: "Content Audits",
      title_ar: "تدقيق وتقييم المحتوى",
      desc_en: "Systematically reviewing existing website copy and assets to evaluate search value, clarity, and funnel drop-off risks.",
      desc_ar: "تقييم منهجي للمحتوى الحالي بالمواقع للتأكد من توافقه مع معايير السيو والوضوح، وتقليل معدلات خروج الزوار دون شراء.",
      use_en: "Executed a comprehensive UX and Content Audit for HostingWDomain SaaS platform, establishing a 6-point roadmap to fix funnel leaks.",
      use_ar: "أجرى تدقيقاً كاملاً للمحتوى وتجربة الاستخدام لمنصة HostingWDomain، مع وضع خارطة طريق من 6 خطوات لتحسين المبيعات."
    },
    // Growth & Analytics
    "kpis": {
      title_en: "KPI Frameworks",
      title_ar: "مؤشرات قياس الأداء",
      desc_en: "Defining quantitative metrics (CAC, LTV, conversion, bounce rate) to measure marketing effectiveness and return on investment.",
      desc_ar: "تحديد أرقام ومؤشرات واضحة (تكلفة الاستحواذ، قيمة العميل، معدل التحويل) لقياس مدى نجاح الاستثمار التسويقي وحملات الإعلانات.",
      use_en: "Built a 6-category KPI framework for Kyoko Gifts to measure content health, audience engagement, and conversion efficiency.",
      use_ar: "وضع إطار عمل KPIs مكون من 6 تصنيفات لمشروع كيوكو، لقياس تفاعل الجمهور وكفاءة تحويل الزوار إلى مشترين."
    },
    "insights": {
      title_en: "Meta Insights Tracking",
      title_ar: "تحليلات منصات ميتا",
      desc_en: "Analyzing statistics and engagement metrics on Facebook and Instagram to refine buyer persona assumptions and audience targeting.",
      desc_ar: "تحليل إحصائيات الأداء والتفاعل على فيسبوك وإنستجرام لتطوير استهداف الجماهير وتحسين نفقات الإعلانات.",
      use_en: "Monitored campaign data for New Direction to optimize ad spend and lower acquisition costs.",
      use_ar: "تابع وحلل أداء الحملات لنيو دايركشن لتقليل تكلفة استقطاب الطلاب الجدد وزيادة التفاعل على منشورات الصفحة."
    },
    "competitors": {
      title_en: "Competitor Analysis",
      title_ar: "دراسة وتحليل المنافسين",
      desc_en: "Conducting systematic research on rival pricing, positioning, messaging, and visual style to spot market gaps.",
      desc_ar: "إجراء دراسة تفصيلية لأسعار المنافسين، تموضعهم التسويقي، رسائلهم الإعلانية، وتصميماتهم لتحديد الفرص المتاحة بالسوق.",
      use_en: "Wrote competitor intelligence reviews on Boost Mobile rivals at Concentrix, preparing custom rebuttals for customer retention.",
      use_ar: "حلل عروض وأسعار منافيس Boost Mobile في كونسنتريكس لصياغة حجج إقناع مخصصة ساهمت في إبقائهم وتجديد اشتراكاتهم."
    },
    "cro": {
      title_en: "Conversion Rate Optimization (CRO)",
      title_ar: "تحسين معدل التحويل",
      desc_en: "Improving landing page layouts, headlines, and calls-to-action (CTAs) to turn a higher percentage of visitors into leads or buyers.",
      desc_ar: "تحسين هياكل وعناوين وأزرار صفحات الهبوط لتسهيل الشراء وزيادة نسبة الزوار الذين يتحولون لعملاء فعليين.",
      use_en: "Analyzed checkout drop-off paths and restructured content layouts for the HostingWDomain SaaS platform.",
      use_ar: "حدد وحل مشكلات الخروج في صفحات الشراء وخطوات تسجيل الدخول لمنصة الاستضافة HostingWDomain لتسريع عمليات البيع."
    },
    // Digital Tools
    "meta-ads": {
      title_en: "Meta Ads Manager",
      title_ar: "إعلانات ميتا",
      desc_en: "Setting up, running, and testing paid advertisement campaigns on Facebook and Instagram using precise targeting filters.",
      desc_ar: "تخطيط وإطلاق وإدارة الحملات الإعلانية المدفوعة على منصتي فيسبوك وإنستجرام واستهداف الفئات المهتمة بدقة.",
      use_en: "Designed monthly local social campaigns for New Direction Academy to generate leads and enroll student cohorts.",
      use_ar: "أطلق حملات ميتا الشهرية لأكاديمية نيو دايركشن للحصول على بيانات العملاء المحتملين وتسجيل مجموعات دراسية جديدة."
    },
    "tiktok-ads": {
      title_en: "TikTok Ads Manager",
      title_ar: "إعلانات تيك توك",
      desc_en: "Configuring short-form video advertising campaigns, setting budgets, and measuring conversion loops on TikTok.",
      desc_ar: "تخطيط حملات الفيديو الإعلانية القصيرة على منصة تيك توك، وتحديد الميزانيات وتتبع مقاييس التحويل للعلامات التجارية.",
      use_en: "Included short-form video placement strategies and cost-per-view tracking templates in e-commerce playbooks.",
      use_ar: "دمج استراتيجيات نشر الفيديو وتتبع تكلفة المشاهدة والتحويل في الخطط التسويقية لمشاريع التجارة الإلكترونية."
    },
    "canva": {
      title_en: "Canva Design",
      title_ar: "كانفا للتصميم",
      desc_en: "Creating professional, clean social media templates, pitch presentations, and visual identity guides without heavy tools.",
      desc_ar: "تصميم منشورات منصات التواصل، عروض تقديم الخطط، وكتيبات الهوية البصرية بشكل سريع واحترافي متناسق.",
      use_en: "Designed marketing playbook templates and social post drafts for retail and charity campaigns.",
      use_ar: "صمم العروض التقديمية للخطط التسويقية ونماذج المنشورات لحملات التوعية الخيرية والأعمال الاستشارية."
    },
    "odoo": {
      title_en: "Odoo CMS",
      title_ar: "نظام أودو لإدارة المحتوى",
      desc_en: "Managing website pages, structuring product information, and coordinating digital content on Odoo ERP portals.",
      desc_ar: "إدارة وتنسيق محتوى مواقع الويب، ترتيب المنتجات، والتحكم بالصفحات من خلال نظام إدارة المحتوى Odoo CMS.",
      use_en: "Coordinated digital content, managed product information, and executed page updates for Fine Stone portals.",
      use_ar: "أدار محتوى المنتجات والصفحات الإلكترونية، وحدث العروض الحصرية بموقع شركة فاين ستون التابعة ليونيون إير."
    },
    "ai-tools": {
      title_en: "AI Productivity Tools",
      title_ar: "أدوات الذكاء الاصطناعي",
      desc_en: "Utilizing advanced language and generative models for content drafts, keyword research, and workflow automation.",
      desc_ar: "استثمار النماذج اللغوية المتقدمة في إعداد مسودات المحتوى، البحث عن الكلمات المفتاحية، وأتمتة المهام اليومية.",
      use_en: "Integrates AI prompt generation and visual mockups into strategic marketing processes to double execution speed.",
      use_ar: "يوظف تقنيات الذكاء الاصطناعي لتسريع صياغة المحتوى وإعداد التقارير التحليلية، مما يضاعف سرعة التنفيذ."
    },
    "office": {
      title_en: "Office 365 Suite",
      title_ar: "حزمة أوفيس ٣٦٥",
      desc_en: "Leveraging Excel, Word, and PowerPoint for structured marketing playbooks, budgeting, and performance spreadsheets.",
      desc_ar: "استخدام تطبيقات إكسل، وورد، وبوربوينت لبناء خطط العمل، إعداد الميزانيات، وعرض التقارير التحليلية للمديرين.",
      use_en: "Certified MOS (Microsoft Office Specialist) in ECDL, preparing data models and dashboards.",
      use_ar: "حاصل على شهادة MOS و ECDL، ويستخدم إكسل لإعداد أوراق ميزانيات الحملات ومخططات نموذج العمل التجاري."
    },
    // Leadership
    "team-lead": {
      title_en: "Team Leadership",
      title_ar: "إدارة وقيادة الفرق",
      desc_en: "Guiding team workflows, delegating deliverables, resolving friction points, and running goal-oriented projects.",
      desc_ar: "تنسيق مهام فرق العمل، توجيه الأفراد، تذليل العقبات، وقيادة مشاريع ترويجية متزامنة لتحقيق أهداف محددة.",
      use_en: "Led an 8-member marketing team at Resala Charity, structuring campaigns for local donation collection.",
      use_ar: "قاد فريقاً تسويقياً من 8 أفراد في جمعية رسالة، لتنظيم وإطلاق حملات توعية وجمع تبرعات للمستشفيات والأيتام."
    },
    "trainer": {
      title_en: "Corporate Training (CCT)",
      title_ar: "مدرب شركات معتمد",
      desc_en: "Designing educational workshops, structuring lessons, and delivering skill-development courses for professionals.",
      desc_ar: "تصميم وتقديم ورش العمل التدريبية، ونقل الخبرات وتطوير الكفاءات المهنية للأفراد والشركات.",
      use_en: "Accredited CCT (Certified Corporate Trainer) from Dr. Ibrahim Elfiky Center, running communication skills training.",
      use_ar: "حاصل على دبلومة CCT المعتمدة من مركز كندي (الدكتور إبراهيم الفقي) لتدريب الكفاءات وتطوير مهارات الاتصال."
    },
    "speaking": {
      title_en: "Public Speaking",
      title_ar: "الخطابة والإلقاء",
      desc_en: "Presenting complex strategic strategies in clear, engaging, and persuasive speeches to corporate leaders.",
      desc_ar: "تقديم الخطط والمشاريع المعقدة في عروض تقديمية واضحة ومقنعة أمام الجمهور وصناع القرار بالشركات.",
      use_en: "Won the official Resala Public Speaking Championship, applying stage performance skills to presentations.",
      use_ar: "فاز ببطولة جمعية رسالة الرسمية للتحدث والإلقاء أمام الجمهور، ويوظف هذه المهارة لعرض أفكاره ومخططاته التسويقية."
    },
    "bilingual": {
      title_en: "Bilingual Communication",
      title_ar: "إتقان اللغتين",
      desc_en: "Conducting professional business coordination and correspondence in both English and Arabic with complete fluency.",
      desc_ar: "إدارة المراسلات والاجتماعات المهنية وكتابة التقارير باللغتين العربية والإنجليزية بطلاقة تامة ومهنية.",
      use_en: "Resolved billing and retention cases in English at Concentrix, and designed bilingual marketing briefs.",
      use_ar: "تعامل مع عملاء Boost Mobile بالولايات المتحدة بالإنجليزية في كونسنتريكس، ويصيغ خططه بنصوص ثنائية اللغة."
    }
  };

  const initInteractiveSkills = () => {
    // 1. Convert tags inside drawers to interactive skill chips
    const drawerTagsLists = document.querySelectorAll('.drawer-tags-list');
    drawerTagsLists.forEach(list => {
      const parentDrawer = list.closest('.project-drawer');
      if (!parentDrawer) return;
      const drawerId = parentDrawer.id;

      // Extract existing spans inside list and group by pairs (EN and AR)
      const spans = Array.from(list.querySelectorAll('span'));
      const chipsData = [];
      
      for (let i = 0; i < spans.length; i += 2) {
        if (i + 1 < spans.length) {
          const spanEn = spans[i];
          const spanAr = spans[i + 1];
          const textEn = spanEn.textContent;
          const textAr = spanAr.textContent;
          
          // Map texts to skill-id
          let skillId = "";
          const lowerEn = textEn.toLowerCase();
          if (lowerEn.includes("swot")) skillId = "swot";
          else if (lowerEn.includes("smart")) skillId = "smart";
          else if (lowerEn.includes("4ps") || lowerEn.includes("mix")) skillId = "4ps";
          else if (lowerEn.includes("blue ocean")) skillId = "blue-ocean";
          else if (lowerEn.includes("persona")) skillId = "buyer-persona";
          else if (lowerEn.includes("model canvas") || lowerEn.includes("bmc")) skillId = "bmc";
          else if (lowerEn.includes("bilingual copy") || lowerEn.includes("copy")) skillId = "copywriting";
          else if (lowerEn.includes("calendar")) skillId = "calendars";
          else if (lowerEn.includes("hero/hub")) skillId = "hero-hub";
          else if (lowerEn.includes("brand voice")) skillId = "brand-voice";
          else if (lowerEn.includes("audit")) skillId = "audits";
          else if (lowerEn.includes("kpi")) skillId = "kpis";
          else if (lowerEn.includes("insights")) skillId = "insights";
          else if (lowerEn.includes("competitor")) skillId = "competitors";
          else if (lowerEn.includes("cro")) skillId = "cro";
          else if (lowerEn.includes("meta ads")) skillId = "meta-ads";
          else if (lowerEn.includes("tiktok")) skillId = "tiktok-ads";
          else if (lowerEn.includes("canva")) skillId = "canva";
          else if (lowerEn.includes("odoo")) skillId = "odoo";
          else if (lowerEn.includes("ai tool") || lowerEn.includes("ai productivity")) skillId = "ai-tools";
          else if (lowerEn.includes("office")) skillId = "office";
          else if (lowerEn.includes("team lead")) skillId = "team-lead";
          else if (lowerEn.includes("corporate trainer") || lowerEn.includes("trainer")) skillId = "trainer";
          else if (lowerEn.includes("speaking")) skillId = "speaking";
          else if (lowerEn.includes("bilingual")) skillId = "bilingual";

          chipsData.push({ id: skillId, textEn, textAr });
        }
      }

      // Rebuild the drawer tags list with interactive chips
      list.innerHTML = "";
      chipsData.forEach(chip => {
        const chipBtn = document.createElement('button');
        chipBtn.className = 'drawer-skill-chip';
        chipBtn.setAttribute('data-skill-id', chip.id);
        chipBtn.innerHTML = `<span class="lang-en">${chip.textEn}</span><span class="lang-ar">${chip.textAr}</span>`;
        chipBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          selectSkillInDrawer(parentDrawer, chip.id);
        });
        list.appendChild(chipBtn);
      });

      // Add the explanation box container at the end of drawer-body
      const drawerBody = parentDrawer.querySelector('.drawer-body');
      if (drawerBody && !drawerBody.querySelector('.skill-explanation-box')) {
        const expBox = document.createElement('div');
        expBox.className = 'skill-explanation-box';
        expBox.innerHTML = `
          <div class="explanation-title-row">
            <h4 class="explanation-title-text">Skill Details</h4>
            <span class="drawer-badge lang-en">Application</span>
            <span class="drawer-badge lang-ar">تطبيق عملي</span>
          </div>
          <p class="explanation-desc-text"></p>
          <div class="explanation-usecase"></div>
        `;
        drawerBody.appendChild(expBox);
      }
    });

    // Function to handle skill selection in drawer
    const selectSkillInDrawer = (drawer, skillId) => {
      // Deactivate other chips in this drawer
      const chips = drawer.querySelectorAll('.drawer-skill-chip');
      chips.forEach(c => c.classList.remove('active'));

      // Activate clicked chip
      const activeChip = drawer.querySelector(`.drawer-skill-chip[data-skill-id="${skillId}"]`);
      if (activeChip) activeChip.classList.add('active');

      const expBox = drawer.querySelector('.skill-explanation-box');
      if (!expBox) return;

      const data = SkillDatabase[skillId];
      if (data) {
        // Set titles/descriptions dynamically based on language
        const titleText = expBox.querySelector('.explanation-title-text');
        const descText = expBox.querySelector('.explanation-desc-text');
        const usecaseText = expBox.querySelector('.explanation-usecase');

        // Render bilingual text inside description box
        descText.innerHTML = `
          <span class="lang-en">${data.desc_en}</span>
          <span class="lang-ar">${data.desc_ar}</span>
        `;
        usecaseText.innerHTML = `
          <span class="lang-en"><strong>How I use it:</strong> ${data.use_en}</span>
          <span class="lang-ar"><strong>التطبيق والخبرة:</strong> ${data.use_ar}</span>
        `;

        // Update active language visibility in the dynamically created nodes
        const activeLang = document.documentElement.getAttribute('lang') || 'en';
        descText.querySelectorAll('span').forEach(span => {
          if (span.classList.contains(`lang-${activeLang}`)) {
            span.style.display = 'inline';
          } else {
            span.style.display = 'none';
          }
        });
        usecaseText.querySelectorAll('span').forEach(span => {
          if (span.classList.contains(`lang-${activeLang}`)) {
            span.style.display = 'inline';
          } else {
            span.style.display = 'none';
          }
        });

        // Show description box with animation
        expBox.classList.add('visible');
        gsap.fromTo(expBox, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" });
      } else {
        expBox.classList.remove('visible');
      }
    };

    // 2. Wire up clicks on overview cards
    const categoryCards = document.querySelectorAll('.skill-category');
    categoryCards.forEach(card => {
      // Add data-skill-id to card tags
      const tags = card.querySelectorAll('.tag');
      tags.forEach(tag => {
        let text = tag.textContent.toLowerCase();
        let skillId = "";
        if (text.includes("swot")) skillId = "swot";
        else if (text.includes("smart")) skillId = "smart";
        else if (text.includes("4ps")) skillId = "4ps";
        else if (text.includes("blue ocean") || text.includes("blue")) skillId = "blue-ocean";
        else if (text.includes("persona")) skillId = "buyer-persona";
        else if (text.includes("bmc")) skillId = "bmc";
        else if (text.includes("copy") || text.includes("writing")) skillId = "copywriting";
        else if (text.includes("calendar")) skillId = "calendars";
        else if (text.includes("voice")) skillId = "brand-voice";
        else if (text.includes("hero/hub")) skillId = "hero-hub";
        else if (text.includes("audit")) skillId = "audits";
        else if (text.includes("kpi")) skillId = "kpis";
        else if (text.includes("insight")) skillId = "insights";
        else if (text.includes("competitor")) skillId = "competitors";
        else if (text.includes("cro")) skillId = "cro";
        else if (text.includes("meta ads") || text.includes("meta")) skillId = "meta-ads";
        else if (text.includes("tiktok")) skillId = "tiktok-ads";
        else if (text.includes("canva")) skillId = "canva";
        else if (text.includes("odoo")) skillId = "odoo";
        else if (text.includes("ai tool") || text.includes("ai")) skillId = "ai-tools";
        else if (text.includes("office")) skillId = "office";
        else if (text.includes("team lead")) skillId = "team-lead";
        else if (text.includes("corporate trainer") || text.includes("trainer")) skillId = "trainer";
        else if (text.includes("speaking")) skillId = "speaking";
        else if (text.includes("bilingual")) skillId = "bilingual";
        
        tag.setAttribute('data-skill-id', skillId);

        // Individual tag click listener
        tag.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation(); // prevent card drawer trigger

          const drawerId = card.getAttribute('data-drawer');
          const drawer = document.getElementById(drawerId);
          if (drawer) {
            // Open drawer
            openDrawer(drawer);
            // Select skill and scroll to it
            setTimeout(() => {
              selectSkillInDrawer(drawer, skillId);
            }, 300);
          }
        });
      });

      // Default card click listener
      card.addEventListener('click', (e) => {
        if (e.target.closest('.tag')) return; // handled by tag click
        const drawerId = card.getAttribute('data-drawer');
        const drawer = document.getElementById(drawerId);
        if (drawer) {
          openDrawer(drawer);
          // Hide any previous active selection
          const expBox = drawer.querySelector('.skill-explanation-box');
          if (expBox) expBox.classList.remove('visible');
          const chips = drawer.querySelectorAll('.drawer-skill-chip');
          chips.forEach(c => c.classList.remove('active'));
        }
      });
    });

    // Helper to open drawer
    // Deprecated openDrawerHelper
    const openDrawerHelper_deprecated = (drawer) => {
      drawer.classList.add('visible');
      drawer.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      const panel = drawer.querySelector('.drawer-panel');
      gsap.fromTo(panel, { x: "100%" }, { x: "0%", duration: 0.5, ease: "power3.out" });
    };
  };

  initInteractiveSkills();

  const initAstroChat = () => {
    const chatTriggerBtn = document.getElementById('chat-trigger-btn');
    const chatWindowPanel = document.getElementById('chat-window-panel');
    const chatMessagesContainer = document.getElementById('chat-messages-container');
    const chatSuggestionsContainer = document.getElementById('chat-suggestions-container');
    const chatInputForm = document.getElementById('chat-input-form');
    const chatUserInput = document.getElementById('chat-user-input');
    const chatCloseBtn = document.getElementById('chat-close-btn');
    
    if (!chatTriggerBtn || !chatWindowPanel || !chatMessagesContainer) return;

    // API Key obfuscated
    const keyParts = ['AQ.Ab8RN6LtQNHMzMK', 'UOUUctxKN_igsBXH7r-HX5E', 'ZCiYLlxi7yTA'];
    const apiKey = keyParts.join('');

    // Chatbot Knowledge Base (Local Fallback)
    const KB = {
      en: {
        greeting: "Hello! I'm Astro-Bot, Abdelrahman's AI assistant. Ask me anything about his marketing projects, retention work, or how he can help your team!",
        defaultResponse: "I am Astro-Bot, focused on digital marketing, retention strategies, and Abdelrahman's work. Ask me about his projects, experience, or contact channels!",
        typing: "Astro-Bot is thinking...",
        intents: [
          {
            name: "cv",
            keywords: ["cv", "resume", "download", "pdf", "file", "documents", "sira", "ذاتية", "سيرة", "سيره", "تحميل", "تنزيل", "ملف", "ملخص"],
            response: "You can download my full professional CV in PDF format by clicking <a href=\"Abdelrahman_CV_Final.pdf\" download target=\"_blank\">here</a>."
          },
          {
            name: "contact",
            keywords: ["contact", "email", "phone", "whatsapp", "call", "reach", "hire", "number", "connect", "message", "linked", "تواصل", "راسل", "اتصال", "ايميل", "بريد", "واتساب", "هاتف", "تلفون", "رقم", "لينكد"],
            response: "You can reach me directly via:<br>• <strong>WhatsApp:</strong> <a href=\"https://wa.me/201157265599\" target=\"_blank\">+20 115 726 5599</a><br>• <strong>Email:</strong> <a href=\"mailto:abdelrahman.abdelhafez10@gmail.com\">abdelrahman.abdelhafez10@gmail.com</a><br>• <strong>LinkedIn:</strong> <a href=\"https://www.linkedin.com/in/abdelrahman-abdelhafez-994932167/\" target=\"_blank\">LinkedIn Profile</a>"
          },
          {
            name: "experience",
            keywords: ["experience", "work", "job", "career", "history", "employer", "employ", "company", "role", "concentrix", "tabby", "fine stone", "resala", "خبرة", "عمل", "وظيفة", "وظائف", "سابق", "خبرات"],
            response: "My professional experience includes:<br>• <strong>Concentrix (Boost Mobile account):</strong> Sales & Retention Consultant (Aug 2025-Present) - Awarded the 1st Enterprise Loyalty Award (2026) for ranking #1 in customer retention and sales conversion.<br>• <strong>Tabby Technologies Egypt (Fintech/BNPL):</strong> Customer Service & E-commerce Experience Specialist (Apr 2025-Aug 2025) - Restructured FAQ support content and mapped user customer journeys.<br>• <strong>New Direction Academy:</strong> Digital Marketer & Brand Strategist (Sep 2020-May 2022) - Led brand positioning, Facebook/Instagram campaigns, and dual SWOT analyses.<br>• <strong>Fine Stone:</strong> Website Editor & Digital Content Coordinator (Jul 2019-Feb 2020) - Landing page optimizations on Odoo CMS and SEO tracking."
          },
          {
            name: "concentrix",
            keywords: ["concentrix", "loyalty", "retention", "boost mobile", "dish", "كونسنتريكس", "ولاء"],
            response: "At Concentrix (Aug 2025-Present as a Sales & Retention Consultant), I resolve critical mobile plan and billing issues. I was awarded the <strong>1st Enterprise Loyalty Award (2026)</strong> for ranking #1 company-wide in sales conversion and churn reduction."
          },
          {
            name: "tabby",
            keywords: ["tabby", "fintech", "bnpl", "customer service", "ambassador", "تابي"],
            response: "At Tabby Egypt (Apr 2025-Aug 2025 as a Customer Service & E-commerce Experience Specialist), I supported customers through payment journeys, mapped UX friction points, and restructured self-service guides to reduce support recurrences."
          },
          {
            name: "projects",
            keywords: ["project", "portfolio", "case", "study", "studies", "kyoko", "gifts", "new direction", "hosting", "hostingwdomain", "مشاريع", "مشروع", "اعمال", "موقع"],
            response: "I have executed several major projects:<br>• <strong>Kyoko Gifts (2026):</strong> A comprehensive e-commerce marketing playbook covering Business Model Canvas, brand identity, dual SWOT, 5 SMART goals, 2 buyer personas, and a 6-category KPI framework.<br>• <strong>New Direction Academy:</strong> Complete brand launch package (competitor pricing, buyer persona, customer journey mapping).<br>• <strong>HostingWDomain:</strong> Detailed UX and Content Audit for a SaaS provider with a 6-point execution roadmap."
          },
          {
            name: "skills",
            keywords: ["skills", "toolkit", "competence", "capabilities", "strategy", "planning", "copywriting", "content", "growth", "analytics", "cro", "meta", "tiktok", "ads", "seo", "swot", "smart", "canvas", "odoo", "canva", "مهارات", "ادوات"],
            response: "My skills are categorized into:<br>• <strong>Strategy:</strong> SWOT, SMART goals, Buyer Personas, Blue Ocean Strategy, Business Model Canvas (BMC).<br>• <strong>Content:</strong> Bilingual copywriting (AR/EN), Content Calendars, Brand Voice, Content Audits.<br>• <strong>Growth/Analytics:</strong> KPI frameworks, Meta Insights, CRO (Conversion Rate Optimization), Competitor Analysis.<br>• <strong>Tools:</strong> Meta Ads Manager, TikTok Ads Manager, Odoo CMS, Canva, AI productivity."
          },
          {
            name: "why_hire",
            keywords: ["why", "hire", "recruit", "why you", "results", "fit", "value", "benefits", "choose you"],
            response: "You should hire Abdelrahman because of his proven track record in customer retention and digital marketing. During his time at Concentrix, he won the 1st Enterprise Loyalty Award (2026) for ranking #1 in retaining customers and reducing churn. He has hands-on experience in building marketing playbooks, executing social campaigns, and optimizing customer support experiences to drive brand loyalty."
          }
        ]
      },
      ar: {
        greeting: "مرحباً! أنا Astro-Bot، المساعد الذكي لعبد الرحمن. اسألني عن مشاريعه التسويقية، أو أعماله في الاحتفاظ بالعملاء، أو كيف يمكنه مساعدة فريقك!",
        defaultResponse: "أنا Astro-Bot، ومهمتي مساعدتك في التسويق الرقمي، خطط الاحتفاظ بالعملاء، ومشاريع عبد الرحمن. اسألني عن مشاريعه، أو خبراته، أو قنوات التواصل معه!",
        typing: "المساعد الذكي يفكر...",
        intents: [
          {
            name: "cv",
            keywords: ["سي في", "سيرة", "ذاتية", "سيره", "تحميل", "ملف", "ملخص", "تنزيل", "cv", "resume"],
            response: "يمكنك تحميل سيرتي الذاتية المهنية والمحدثة بالكامل بصيغة PDF مباشرة بالضغط <a href=\"Abdelrahman_CV_Final.pdf\" download target=\"_blank\">هنا</a>."
          },
          {
            name: "contact",
            keywords: ["تواصل", "راسل", "اتصال", "ايميل", "بريد", "واتساب", "واتس", "هاتف", "تلفون", "رقم", "لينكد", "linkedin", "email", "phone"],
            response: "يسعدني تواصلك معي مباشرة عبر القنوات التالية:<br>• <strong>واتساب:</strong> <a href=\"https://wa.me/201157265599\" target=\"_blank\">+20 115 726 5599</a><br>• <strong>البريد الإلكتروني:</strong> <a href=\"mailto:abdelrahman.abdelhafez10@gmail.com\">abdelrahman.abdelhafez10@gmail.com</a><br>• <strong>لينكد إن:</strong> <a href=\"https://www.linkedin.com/in/abdelrahman-abdelhafez-994932167/\" target=\"_blank\">حسابي الشخصي</a>"
          },
          {
            name: "experience",
            keywords: ["خبرة", "عمل", "وظيفة", "تاريخ", "سيرة", "شركة", "دور", "كونسنتريكس", "تابي", "فاين ستون", "رسالة", "experience", "work", "job"],
            response: "تشمل خبراتي المهنية:<br>• <strong>كونسنتريكس (Boost Mobile):</strong> مستشار مبيعات واستبقاء العملاء (أغسطس ٢٠٢٥ - الآن) - حصلت على جائزة الولاء الأولى على مستوى المؤسسة (2026) للتميز في الاحتفاظ بالعملاء والمبيعات.<br>• <strong>تابي (التقنية المالية):</strong> أخصائي خدمة العملاء وتجربة التجارة الإلكترونية (أبريل ٢٠٢٥ - أغسطس ٢٠٢٥) - قمت بتحليل سلوكيات المشترين وتطوير تجربة المستخدم.<br>• <strong>أكاديمية نيو دايركشن:</strong> مسوق رقمي ومخطط استراتيجي للعلامة التجارية (سبتمبر ٢٠٢٠ - مايو ٢٠٢٢) - خطة الإطلاق والهوية الكاملة للمشروع والحملات الإعلانية.<br>• <strong>فاين ستون (يونيون إير):</strong> محرر موقع ومنسق محتوى (يوليو ٢٠١٩ - فبراير ٢٠٢٠) - تحسين محتوى Odoo CMS وتتبع السيو."
          },
          {
            name: "concentrix",
            keywords: ["كونسنتريكس", "ولاء", "احتفاظ", "خدمة", "مبيعات", "جوائز", "جائزة", "concentrix", "loyalty"],
            response: "في شركة كونسنتريكس (مستشار مبيعات واستبقاء العملاء لحساب بوست موبايل التابع لشركة ديش تكنولوجيز من أغسطس ٢٠٢٥ حتى الآن)، حصلت على <strong>جائزة الولاء الأولى على مستوى المؤسسة (٢٠٢٦)</strong> لتميزي في خفض معدلات تسرب العملاء والاحتفاظ بهم وتحقيق الصدارة في المبيعات."
          },
          {
            name: "tabby",
            keywords: ["تابي", "تقنية", "مالية", "تقسيط", "فنتك", "عملاء", "دعم", "tabby"],
            response: "في شركة تابي مصر (أخصائي خدمة العملاء وتجربة التجارة الإلكترونية في الحرم اليوناني بالقاهرة من أبريل ٢٠٢٥ إلى أغسطس ٢٠٢٥)، قمت بمساعدة العملاء وتحديد نقاط الضعف في تجربة المستخدم وتطبيق كتابة المحتوى الإعلاني لرفع الأداء الذاتي للدعم."
          },
          {
            name: "projects",
            keywords: ["مشاريع", "مشروع", "اعمال", "حالة", "دراسة", "كيوكو", "هدايا", "دايركشن", "استضافة", "هوستنج", "projects", "kyoko"],
            response: "أشرفت على تنفيذ عدة مشاريع استراتيجية رئيسية:<br>• <strong>هدايا كيوكو (2026):</strong> خطة تسويقية متكاملة للتجارة الإلكترونية تشمل مخطط نموذج العمل، المزيج التسويقي، واستراتيجية المحيط الأزرق.<br>• <strong>أكاديمية نيو دايركشن:</strong> خطة الإطلاق وتحديد التموضع التنافسي والهوية الكاملة للأكاديمية.<br>• <strong>هوستنج و دومين:</strong> تدقيق شامل لتجربة المستخدم (UX) والمحتوى لرفع المبيعات."
          },
          {
            name: "skills",
            keywords: ["مهارات", "أدوات", "ميزات", "قدرات", "تسويق", "تحليل", "اعلانات", "كتابة", "محتوى", "skills", "tools"],
            response: "تنقسم مهاراتي إلى:<br>• <strong>الاستراتيجية:</strong> SWOT، الأهداف الذكية SMART، شخصيات المشتري، استراتيجية المحيط الأزرق، مخطط نموذج العمل.<br>• <strong>المحتوى:</strong> كتابة المحتوى الإعلاني باللغتين العربية والإنجليزية، خطط وجداول المحتوى، نبرة العلامة التجارية.<br>• <strong>النمو والتحليل:</strong> تصميم أطر مؤشرات الأداء (KPIs)، إحصاءات ميتا، تحسين معدلات التحويل (CRO)، وتحليل المنافسين.<br>• <strong>الأدوات:</strong> Meta Ads Manager، TikTok Ads Manager، نظام إدارة المحتوى Odoo، وتطبيقات Canva والذكاء الاصطناعي."
          },
          {
            name: "why_hire",
            keywords: ["توظيف", "لماذا", "توظف", "تعيين", "مميزات", "لماذا نوظفك", "نتائج", "فائدة"],
            response: "يجب عليك توظيف عبد الرحمن بسبب سجله الحافل في الاحتفاظ بالعملاء والتسويق الرقمي. خلال عمله في كونسنتريكس، حصل على جائزة الولاء الأولى (2026) لتحقيقه المركز الأول في استبقاء العملاء وتقليل تسربهم. كما يمتلك خبرة عملية في إعداد الخطط التسويقية، وإدارة الحملات الاجتماعية، وتحسين تجارب الدعم لتعزيز ولاء العملاء."
          }
        ]
      }
    };

    // System Prompt context for Gemini API
    const systemPrompt = `You are Astro-Bot — AbdelrahmanMohammed's personal AI assistant embedded in his portfolio website.

Your personality: Confident, sharp, strategic. You speak like an elite senior marketing consultant — direct, no fluff, every sentence carries weight. You're proud of Abdelrahman's work and you know his background cold.

Abdelrahman Mohammed Abdelhafez:
• Digital Marketing Strategist & Brand Planner based in Giza, Egypt
• Contact: +201157265599 | abdelrahman.abdelhafez10@gmail.com | LinkedIn: linkedin.com/in/abdelrahman-abdelhafez-994932167/

Career:
1. Concentrix — Boost Mobile (Aug 2025–Present): Sales & Retention Consultant. Ranked #1 company-wide. Won 1st Enterprise Loyalty Award 2026. Conducts competitive intelligence, resolves critical cancellations.
2. Tabby Technologies — Fintech/BNPL (Apr–Aug 2025): E-commerce Experience Specialist. Mapped UX friction points in BNPL checkout flows. Rewrote FAQ content to cut repeat contacts.
3. New Direction Academy — EdTech (Sep 2020–May 2022): Digital Marketer & Brand Strategist. Built brand from zero: logo, tone, positioning. Ran monthly Facebook/Instagram campaigns. Created dual SWOT, buyer personas, competitor pricing analysis.
4. Fine Stone / UnionAire Group (Jul 2019–Feb 2020): Website Editor. Optimized Odoo CMS landing pages. Wrote SEO product descriptions. Commended by E-commerce Manager.

Projects:
• Kyoko Gifts (2026): Complete marketing playbook — Business Model Canvas, brand identity, dual SWOT, 5 SMART goals, 2 buyer personas, 4Ps, Blue Ocean positioning, Push & Pull strategy, Meta + TikTok ad copy, content pillars, sales funnel, moderation guide, 6-category KPI framework.
• New Direction Academy: Strategy & research package — dual SWOT, buyer persona, customer journey map, pricing competitor analysis.
• HostingWDomain: SaaS UX audit — site architecture review, brand identity gaps, landing page friction analysis, A/B testing roadmap.

RESPONSE RULES:
1. Match the user's language (Arabic or English). If Arabic, write natural Egyptian/MSA Arabic.
2. Keep responses concise — 2-4 sentences max for simple questions, up to 6 for concepts.
3. When asked about a marketing/business concept (Blue Ocean, SWOT, CRO, SEO, etc.), structure your answer as:
   • **Definition:** One sharp sentence explaining the concept.
   • **How Abdelrahman Applied It:** Reference a specific project (Kyoko, New Direction, etc.) with real detail.
   • **What This Means For You:** How hiring Abdelrahman means this strategy works for THEIR brand.
4. Never use generic filler phrases like "I'd be happy to help" or "That's a great question". Get straight to the point.
5. Always advocate for hiring Abdelrahman — but with evidence, not empty praise.
6. If asked something unrelated to marketing/business, briefly answer then redirect: "But what really matters — how can Abdelrahman's strategy skills grow your brand?"
7. Never fabricate experience or certifications.

FEW-SHOT EXAMPLES:

User: "What is SWOT analysis?"
Response:
"**Definition:** SWOT is a strategic framework used to evaluate Strengths, Weaknesses, Opportunities, and Threats to align a brand's internal capabilities with external market dynamics.
**How Abdelrahman Applied It:** In his *Kyoko Gifts* playbook, Abdelrahman conducted a double-SWOT analysis to map direct competitors (local gifting apps) and indirect competitors (traditional florists), identifying a high-value niche for premium experiential gifting.
**What This Means For You:** By hiring Abdelrahman, you bring a strategist who doesn't just run ads but builds a structural competitive moat around your brand."

User: "لماذا يجب أن أقوم بتوظيف عبد الرحمن؟"
Response:
"**السبب الأول:** عبد الرحمن مسوق رقمي متميز ومسؤول عن زيادة الاحتفاظ بالعملاء (Retention). في شركة Concentrix، حصل على جائزة الولاء الأولى على مستوى المؤسسة لعام 2026 لتسجيله المركز الأول في الاحتفاظ بالعملاء وتقليل تسرب الاشتراكات.
**السبب الثاني:** يمتلك مهارات تحليلية متطورة للغاية في دراسة السوق ووضع الأطر والخطط الكاملة (مثل مشروع Kyoko Gifts الذي صمم له مخطط نموذج العمل بالكامل ومؤشرات الأداء السنوية).
**النتيجة لك:** تعيين عبد الرحمن يضمن لك نموًا مستدامًا وتقليل تكاليف الاستحواذ مع مضاعفة قيمة دورة حياة العميل (LTV)."`;

    // Local fallback response generator
    const getLocalResponse = (query, lang) => {
      const normalizedQuery = query.toLowerCase().trim();
      const langKB = KB[lang] || KB.en;
      let bestIntent = null;
      let maxScore = 0;

      for (const intent of langKB.intents) {
        let score = 0;
        for (const kw of intent.keywords) {
          if (normalizedQuery.includes(kw)) {
            score += 3;
          }
        }
        if (score > maxScore) {
          maxScore = score;
          bestIntent = intent;
        }
      }

      if (maxScore >= 3 && bestIntent) {
        return bestIntent.response;
      }
      return langKB.defaultResponse;
    };

    // Main API Calling Function
    const fetchGeminiResponse = async (query, lang) => {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        const payload = {
          contents: [{ role: 'user', parts: [{ text: query }] }],
          systemInstruction: {
            parts: [{ text: systemPrompt }]
          },
          generationConfig: {
            maxOutputTokens: 800,
            temperature: 0.7
          }
        };

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error('API request failed');
        }

        const responseData = await response.json();
        return responseData.candidates[0].content.parts[0].text;
      } catch (error) {
        console.warn('Gemini API call failed, falling back to local KB', error);
        return getLocalResponse(query, lang);
      }
    };

    const chatSuggestionsToggle = document.getElementById('chat-suggestions-toggle');

    const getSuggestions = (lang) => {
      if (lang === 'ar') {
        return [
          "لماذا يجب أن نقوم بتوظيفك؟",
          "ما هي خبراتك المهنية؟",
          "ما هي مشاريعه التسويقية؟",
          "كيف يمكنني التواصل معك؟"
        ];
      } else {
        return [
          "Why should we hire you?",
          "What is your experience?",
          "What projects have you worked on?",
          "How can I contact you?"
        ];
      }
    };

    const renderSuggestions = (lang) => {
      chatSuggestionsContainer.innerHTML = '';
      const suggestions = getSuggestions(lang);
      suggestions.forEach(s => {
        const btn = document.createElement('button');
        btn.className = 'suggestion-chip';
        btn.textContent = s;
        btn.addEventListener('click', () => {
          handleUserMessage(s);
        });
        chatSuggestionsContainer.appendChild(btn);
      });
    };

    // Toggle button click listener
    if (chatSuggestionsToggle) {
      chatSuggestionsToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const isHidden = chatSuggestionsContainer.classList.contains('hidden');
        if (isHidden) {
          chatSuggestionsContainer.classList.remove('hidden');
          chatSuggestionsToggle.classList.add('active');
        } else {
          chatSuggestionsContainer.classList.add('hidden');
          chatSuggestionsToggle.classList.remove('active');
        }
      });
    }

    const addMessageBubble = (text, sender) => {
      const bubble = document.createElement('div');
      bubble.className = `chat-msg ${sender}`;
      // Clean up markdown formatting from LLM (bold, list items) for clean HTML rendering
      let htmlText = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/- (.*?)\n/g, '• $1<br>')
        .replace(/- (.*?)$/g, '• $1')
        .replace(/\n/g, '<br>');
      bubble.innerHTML = htmlText;
      chatMessagesContainer.appendChild(bubble);
      chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
    };

    const showTypingIndicator = () => {
      const indicator = document.createElement('div');
      indicator.className = 'chat-msg bot typing-bubble';
      indicator.id = 'typing-indicator';
      indicator.innerHTML = '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';
      chatMessagesContainer.appendChild(indicator);
      chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
    };

    const removeTypingIndicator = () => {
      const indicator = document.getElementById('typing-indicator');
      if (indicator) indicator.remove();
    };

    const handleUserMessage = async (text) => {
      if (!text.trim()) return;
      
      const lang = document.documentElement.getAttribute('lang') || 'en';
      addMessageBubble(text, 'user');
      showTypingIndicator();

      // Automatically hide suggestions container upon sending/clicking message
      chatSuggestionsContainer.classList.add('hidden');
      if (chatSuggestionsToggle) {
        chatSuggestionsToggle.classList.remove('active');
      }
      
      const botResponse = await fetchGeminiResponse(text, lang);
      removeTypingIndicator();
      addMessageBubble(botResponse, 'bot');
    };

    const openChat = () => {
      chatWindowPanel.classList.remove('hidden');
      chatTriggerBtn.classList.add('hidden');
      
      if (chatMessagesContainer.children.length === 0) {
        const lang = document.documentElement.getAttribute('lang') || 'en';
        addMessageBubble(KB[lang].greeting, 'bot');
        renderSuggestions(lang);
      }
      chatSuggestionsContainer.classList.remove('hidden');
      if (chatSuggestionsToggle) {
        chatSuggestionsToggle.classList.add('active');
      }
    };

    const closeChat = () => {
      chatWindowPanel.classList.add('hidden');
      chatTriggerBtn.classList.remove('hidden'); // Show floating trigger button when closed
    };

    chatTriggerBtn.addEventListener('click', (e) => {
      const isHidden = chatWindowPanel.classList.contains('hidden');
      if (isHidden) {
        openChat();
      } else {
        closeChat();
      }
      e.stopPropagation();
    });

    if (chatCloseBtn) {
      chatCloseBtn.addEventListener('click', (e) => {
        closeChat();
        e.stopPropagation();
      });
    }

    document.addEventListener('click', (e) => {
      if (!chatWindowPanel.classList.contains('hidden') && !e.target.closest('#astro-chat-widget')) {
        closeChat();
      }
    });

    chatInputForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = chatUserInput.value.trim();
      if (val) {
        handleUserMessage(val);
        chatUserInput.value = '';
      }
    });

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'lang') {
          const lang = document.documentElement.getAttribute('lang') || 'en';
          chatUserInput.placeholder = lang === 'ar' ? 'اسألني عن أي شيء...' : 'Ask me anything...';
          chatMessagesContainer.innerHTML = '';
          addMessageBubble(KB[lang].greeting, 'bot');
          renderSuggestions(lang);
        }
      });
    });
    
    observer.observe(document.documentElement, { attributes: true });

    const initialLang = document.documentElement.getAttribute('lang') || 'en';
    chatUserInput.placeholder = initialLang === 'ar' ? 'اسألني عن أي شيء...' : 'Ask me anything...';
  };

  initAstroChat();

});

