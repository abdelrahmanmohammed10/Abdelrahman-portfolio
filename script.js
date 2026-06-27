/* ============================================================
   PORTFOLIO V2 INTERACTIVE ENGINE
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  let lastActiveSection = 'hero';
  let scrollSpeed = 0;
  let lastScrollTop = window.scrollY || document.documentElement.scrollTop;

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
      lerp: 0.1, // Snappy linear interpolation (standard default)
      wheelMultiplier: 1.15, // Slightly boost wheel response
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


  /* ----- 5. MAGNETIC HOVER EFFECT ----- */
  const magneticButtons = document.querySelectorAll('.magnetic-button');
  magneticButtons.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      if (window.innerWidth <= 1024) return; // Disable on mobile
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      btn.style.transition = 'none';
      const innerSpan = btn.querySelector('span');
      if (innerSpan) innerSpan.style.transition = 'none';

      // Pull button towards cursor by 35% of offset
      btn.style.transform = `translate(${x * 0.35}px, ${y * 0.35}px)`;
      if (innerSpan) {
        innerSpan.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
      }
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
      btn.style.transform = 'translate(0px, 0px)';
      const innerSpan = btn.querySelector('span');
      if (innerSpan) {
        innerSpan.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
        innerSpan.style.transform = 'translate(0px, 0px)';
      }
    });
  });


  /* ----- 6. INTERSECTION OBSERVER REVEALS ----- */
  // Add class 'reveal' dynamically to section content elements
  document.querySelectorAll('.content-section p, .stat-card, .skill-category, .project-glass-card, .campaign-glass-card, .certificate-glass-card, .eyebrow-split').forEach(el => {
    el.classList.add('reveal');
  });

  // Reveal observer for one-time fade-ins
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


  /* ----- 7. NUMBERS COUNT-UP ----- */
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

        // 3. Spine timeline progress drawing
        if (timeline && spineProgress) {
          const startTrigger = window.innerHeight / 2;
          const scrolled = (scrollTop + startTrigger) - cachedTimelineTop;
          const percent = Math.min(Math.max((scrolled / cachedTimelineHeight) * 100, 0), 100);
          spineProgress.style.height = percent + '%';
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

  /* ----- 10. PROJECT DRAWERS ----- */
  const projectCards = document.querySelectorAll('.project-glass-card, .skill-category');
  const drawers = document.querySelectorAll('.project-drawer');

  // Initialize inert attribute on closed drawers to prevent tab navigation of hidden focusable elements
  drawers.forEach(drawer => {
    if (!drawer.classList.contains('active')) {
      drawer.setAttribute('inert', '');
    }
  });

  projectCards.forEach(card => {
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
      const drawerId = card.getAttribute('data-drawer');
      const targetDrawer = document.getElementById(drawerId);
      if (targetDrawer) {
        targetDrawer.removeAttribute('inert'); // Enable interaction
        targetDrawer.classList.add('active');
        targetDrawer.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden'; // prevent scroll behind
        const closeBtn = targetDrawer.querySelector('.drawer-close');
        if (closeBtn) closeBtn.focus();
      }
    });
  });

  drawers.forEach(drawer => {
    const closeBtn = drawer.querySelector('.drawer-close');
    const overlay = drawer.querySelector('.drawer-overlay');
    const panel = drawer.querySelector('.drawer-panel');
    setupFocusTrap(drawer);

    const closeDrawer = () => {
      drawer.classList.remove('active');
      drawer.setAttribute('aria-hidden', 'true');
      drawer.setAttribute('inert', ''); // Disable interaction
      document.body.style.overflow = '';
      if (activeTriggerElement) {
        activeTriggerElement.focus();
        activeTriggerElement = null;
      }
    };

    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
    if (overlay) overlay.addEventListener('click', closeDrawer);

    // Prepend a drag handle to drawer panels for visual cue on mobile bottom sheets
    if (panel) {
      const handle = document.createElement('div');
      handle.className = 'drawer-handle';
      panel.insertBefore(handle, panel.firstChild);
    }

    // Touch Swipe-to-Close Gestures (Horizontal for desktop drawers, vertical down for mobile bottom sheets)
    let startX = 0;
    let startY = 0;
    let currentX = 0;
    let currentY = 0;

    if (panel) {
      panel.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        currentX = startX;
        currentY = startY;
      }, { passive: true });

      panel.addEventListener('touchmove', (e) => {
        currentX = e.touches[0].clientX;
        currentY = e.touches[0].clientY;
      }, { passive: true });

      panel.addEventListener('touchend', () => {
        const diffX = currentX - startX;
        const diffY = currentY - startY;
        const isRtl = document.documentElement.getAttribute('dir') === 'rtl';
        const swipeThreshold = 80; // px

        if (window.innerWidth <= 768) {
          // Mobile bottom sheet: swipe down to close
          if (diffY > swipeThreshold) {
            closeDrawer();
          }
        } else {
          // Table/Desktop side drawer: swipe horizontally out to close
          if ((!isRtl && diffX > swipeThreshold) || (isRtl && diffX < -swipeThreshold)) {
            closeDrawer();
          }
        }
        startX = startY = currentX = currentY = 0;
      }, { passive: true });
    }
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
        const closeBtn = lightbox.querySelector('.lightbox-close');
        if (closeBtn) closeBtn.focus();
      });
    });

    const closeLightbox = () => {
      lightbox.classList.remove('active');
      lightbox.setAttribute('aria-hidden', 'true');
      lightbox.setAttribute('inert', ''); // Disable interaction
      document.body.style.overflow = '';
      setTimeout(() => {
        lightboxImg.src = '';
      }, 500);
      if (activeTriggerElement) {
        activeTriggerElement.focus();
        activeTriggerElement = null;
      }
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
        const closeBtn = document.getElementById('mobile-close');
        if (closeBtn) closeBtn.focus();
      }
    });

    const closeMobileNav = () => {
      burger.classList.remove('active');
      document.body.classList.remove('menu-open');
      mobileNav.classList.remove('active');
      mobileNav.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (activeTriggerElement) {
        activeTriggerElement.focus();
        activeTriggerElement = null;
      }
    };

    if (mobileClose) mobileClose.addEventListener('click', closeMobileNav);
    mobileLinks.forEach(link => link.addEventListener('click', closeMobileNav));
  }


  /* ----- 12. GLASS CARDS mouse tracking (3D TILT EFFECT) ----- */
  const glassCards = document.querySelectorAll('.project-glass-card, .certificate-glass-card, .campaign-glass-card');
  
  glassCards.forEach(card => {
    let rect = null;
    
    card.addEventListener('mouseenter', () => {
      if (window.innerWidth <= 1024) return;
      rect = card.getBoundingClientRect();
    });
    
    card.addEventListener('mousemove', (e) => {
      if (window.innerWidth <= 1024) return; // Disable tilt on mobile/tablets for smooth scrolling
      if (!rect) rect = card.getBoundingClientRect(); // Fallback if enter didn't fire properly

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);

      // 3D Parallax Tilt Calculation
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const tiltX = (centerY - y) / centerY * 6; // max 6 degrees tilt
      const tiltY = (x - centerX) / centerX * 6;

      card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-5px)`;
    });

    card.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s ease, background 0.3s ease';

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
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
    const numStars = window.innerWidth > 768 ? 400 : 150;
    const numClouds = window.innerWidth > 768 ? 48 : 12; // Scaled down cloud count on mobile to prevent overdraw lag

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
    const starColors = ['#FFFFFF', '#FFFFFF', '#F8F9FA', '#E3F2FD', '#FFF9C4', '#FFE0B2'];
    
    // Mouse interaction with interpolation for organic, fluid lag
    let mouse = { x: -1000, y: -1000 };
    let targetMouse = { x: -1000, y: -1000 };
    let scrollSpeed = 0;
    let lastScrollTop = window.scrollY || document.documentElement.scrollTop;

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

    class Star {
      constructor() {
        this.reset();
        // randomize starting twinkle phase
        this.twinklePhase = Math.random() * Math.PI * 2;
        this.twinkleSpeed = Math.random() * 0.05 + 0.01;
      }
      
      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        
        // Powerful Reality: More larger stars, higher base visibility
        const sizeRand = Math.random();
        if (sizeRand > 0.96) this.z = Math.random() * 0.7 + 0.5; // planetary bright stars
        else if (sizeRand > 0.72) this.z = Math.random() * 0.4 + 0.25; // medium stars
        else this.z = Math.random() * 0.15 + 0.08; // small background stars

        this.baseAlpha = Math.random() * 0.7 + 0.3;
        this.alpha = this.baseAlpha;
        
        // Color assignment
        this.color = starColors[Math.floor(Math.random() * starColors.length)];
        
        // Precompute RGB values to avoid hex conversions in every frame
        if (this.color === '#FFFFFF') { this.rgb = { r: 255, g: 255, b: 255 }; }
        else if (this.color === '#F8F9FA') { this.rgb = { r: 248, g: 249, b: 250 }; }
        else if (this.color === '#E3F2FD') { this.rgb = { r: 227, g: 242, b: 253 }; }
        else if (this.color === '#FFF9C4') { this.rgb = { r: 255, g: 249, b: 196 }; }
        else if (this.color === '#FFE0B2') { this.rgb = { r: 255, g: 224, b: 178 }; }
        else { this.rgb = { r: 255, g: 255, b: 255 }; }
        
        // Slower, more realistic drift
        this.vx = (Math.random() - 0.5) * 0.015; // Slowed down for astronomical realism
        this.vy = -Math.random() * 0.015 - 0.008; // Slowed down for astronomical realism 
      }
      
      update() {
        // Base movement
        this.x += this.vx;
        this.y += this.vy;
        
        // Scroll boost
        this.y += scrollSpeed * this.z * 0.5;
        
        // Powerful Twinkle effect
        this.twinklePhase += this.twinkleSpeed;
        let twinkle = Math.sin(this.twinklePhase) * 0.5;
        
        // Mouse repulsion (optimized squared distance check to prevent lag)
        let dx = this.x - mouse.x;
        let dy = this.y - mouse.y;
        let distSq = dx * dx + dy * dy;
        const maxDist = 150;
        if (distSq < maxDist * maxDist) {
          let dist = Math.sqrt(distSq);
          if (dist > 0) {
            let force = (maxDist - dist) / maxDist;
            this.x -= (dx / dist) * force * 2;
            this.y -= (dy / dist) * force * 2;
            this.alpha = Math.min(1, this.baseAlpha + force + twinkle);
          }
        } else {
          this.alpha = Math.max(0.1, Math.min(1, this.baseAlpha + twinkle));
        }
        
        // Screen wrap
        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;
      }
      
      draw() {
        // Dynamic pulsing size based on twinkle
        let currentZ = Math.max(0.1, this.z + (Math.sin(this.twinklePhase) * 0.3));

        // Scale down alpha to make the stars fade a little (35% of original opacity)
        let renderAlpha = this.alpha * 0.35;

        // Draw soft glow halo for brighter stars (replaces slow CPU shadowBlur)
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
        
        // Diffraction spikes (starfish arms) for the largest, brightest stars
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
        // Spawn randomly across width plus horizontal margins
        this.x = Math.random() * (width + 800) - 400;
        // Spawn vertically: randomly on start, or offscreen top on reset
        this.y = randomY ? Math.random() * height : -400;
        
        // Depth scale (z): 0.35 (background layer) to 1.15 (foreground layer)
        this.z = Math.random() * 0.8 + 0.35;
        
        // Pick one of the loaded cloud images
        this.imgIndex = Math.floor(Math.random() * cloudSources.length);
        
        // Size based on depth (increased size for a more voluminous feel)
        this.baseWidth = 550 + Math.random() * 350; // Increased size to make clouds appear more
        this.width = this.baseWidth * this.z;
        this.height = this.width * 0.55; // Maintain aspect ratio
        
        // Opacity: increased base visibility for highly defined volumetric clouds
        this.baseAlpha = (Math.random() * 0.12 + 0.82) * (this.z * 0.2 + 0.8); // Increased cloud prominence
        this.alpha = this.baseAlpha;
        
        // Slow atmospheric drift speeds (drifts rightward and slightly downward)
        this.vx = (0.03 + Math.random() * 0.05) * this.z;
        this.vy = (0.01 + Math.random() * 0.02) * this.z;
        
        // Offset for mouse repulsion
        this.offsetX = 0;
        this.offsetY = 0;
        this.scaleX = 1;
        this.scaleY = 1;
        this.lastTargetX = 0;
        this.lastTargetY = 0;
        
        // Volumetric breath cycle phase
        this.breathPhase = Math.random() * Math.PI * 2;
        this.breathSpeed = Math.random() * 0.005 + 0.002;
      }

      update() {
        // Apply normal drift
        this.x += this.vx;
        this.y += this.vy;
        
        // Gentle vertical floating wave oscillation (adds floating realism)
        this.y += Math.sin(this.breathPhase * 0.5) * 0.06 * this.z;
        
        // Parallax scroll reaction
        this.y += scrollSpeed * this.z * 0.22;
        
        // Mouse repulsion (optimized squared distance check)
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;
        
        const dx = cx - mouse.x;
        const dy = cy - mouse.y;
        const distSq = dx * dx + dy * dy;
        const maxDist = 380; // Wider repulsion radius
        
        let targetOffsetX = 0;
        let targetOffsetY = 0;
        let targetScaleX = 1;
        let targetScaleY = 1;
        let targetAlpha = this.baseAlpha;
        
        if (distSq < maxDist * maxDist) {
          const dist = Math.sqrt(distSq);
          if (dist > 0) {
            const force = (maxDist - dist) / maxDist;
            
            // Push cloud away from mouse: slower, smoother push values
            targetOffsetX = (dx / dist) * force * 110 * this.z;
            targetOffsetY = (dy / dist) * force * 75 * this.z;
            
            // Squash and stretch aspect ratio to organically reshape the cloud itself
            const angle = Math.atan2(dy, dx);
            const stretchAmount = force * 0.24; // Up to 24% morph for more visual personality
            targetScaleX = 1.0 - stretchAmount * Math.cos(2 * angle);
            targetScaleY = 1.0 + stretchAmount * Math.cos(2 * angle);
            
            // Soft opacity boost when interacting with mouse to highlight shape
            targetAlpha = Math.min(1.0, this.baseAlpha + force * 0.18);
          }
        }
        
        // Smoothly interpolate current values towards targets on every frame using a premium spring-like lerp
        const speedFactor = 0.026; // Organic atmospheric damping
        this.offsetX += (targetOffsetX - this.offsetX) * speedFactor;
        this.offsetY += (targetOffsetY - this.offsetY) * speedFactor;
        this.scaleX += (targetScaleX - this.scaleX) * speedFactor;
        this.scaleY += (targetScaleY - this.scaleY) * speedFactor;
        this.alpha += (targetAlpha - this.alpha) * speedFactor;
        
        // Breathing cycle
        this.breathPhase += this.breathSpeed;
        
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
      }

      draw() {
        const img = cloudImages[this.imgIndex];
        if (img && img.complete && img.naturalWidth > 0) {
          ctx.save();
          // Apply subtle breathing opacity fluctuation
          const breathAlpha = Math.sin(this.breathPhase) * 0.03;
          ctx.globalAlpha = Math.max(0.1, Math.min(1.0, this.alpha + breathAlpha));
          
          // Organic, slow shape morphing (independent of mouse)
          const morphX = 1 + Math.sin(this.breathPhase) * 0.09;
          const morphY = 1 + Math.cos(this.breathPhase * 0.75) * 0.09;
          
          // Draw image centered with offset and dynamic scales
          const drawW = this.width * morphX * this.scaleX;
          const drawH = this.height * morphY * this.scaleY;
          
          // Subtle drop shadow disabled to resolve mobile scroll lag and maximize performance
          
          ctx.drawImage(
            img, 
            this.x + this.offsetX - (drawW - this.width) / 2, 
            this.y + this.offsetY - (drawH - this.height) / 2, 
            drawW, 
            drawH
          );
          ctx.restore();
        }
      }
    }

    function init() {
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
          stars.forEach(star => {
            star.update();
            star.draw();
          });
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
    
    window.addEventListener('touchmove', (e) => {
      targetMouse.x = e.touches[0].clientX;
      targetMouse.y = e.touches[0].clientY;
      if (mouse.x === -1000) {
        mouse.x = targetMouse.x;
        mouse.y = targetMouse.y;
      }
    }, { passive: true });
    
    init();
    animate();
  }


  /* ============================================================
     COSMIC AI CHATBOT ENGINE (ASTRO-BOT)
     ============================================================ */
  const initAstroChat = () => {
    const chatTriggerBtn = document.getElementById('chat-trigger-btn');
    const chatWindowPanel = document.getElementById('chat-window-panel');
    const chatMessagesContainer = document.getElementById('chat-messages-container');
    const chatSuggestionsContainer = document.getElementById('chat-suggestions-container');
    const chatInputForm = document.getElementById('chat-input-form');
    const chatUserInput = document.getElementById('chat-user-input');
    const chatCloseBtn = document.getElementById('chat-close-btn');
    
    if (!chatTriggerBtn || !chatWindowPanel || !chatMessagesContainer) return;

    // Conversational Context state
    let lastIntentName = "";

    // Chatbot Knowledge Base
    const KB = {
      en: {
        greeting: "Hello! I'm Astro-Bot, Abdelrahman's AI assistant. Ask me anything about digital marketing or retention strategy, and let's explore!",
        defaultResponse: "I am Astro-Bot, focused on digital marketing, retention strategies, and Abdelrahman's work. Ask me about space, marketing, or check out his CV! You can also ask anything else, and I'll do my best to help.",
        typing: "Astro-Bot is thinking...",
        intents: [
          {
            name: "cv",
            keywords: ["cv", "resume", "download", "pdf", "file", "documents", "sira", "ذاتية", "سيرة", "سيره", "تحميل", "تنزيل", "ملف", "ملخص"],
            response: "You can download my full, up-to-date professional CV in PDF format by clicking <a href=\"Abdelrahman_CV_Final.pdf\" download target=\"_blank\">here</a>."
          },
          {
            name: "contact",
            keywords: ["contact", "email", "phone", "whatsapp", "call", "reach", "hire", "number", "connect", "message", "linked", "تواصل", "راسل", "اتصال", "ايميل", "بريد", "واتساب", "هاتف", "تلفون", "رقم", "لينكد"],
            response: "You can reach me directly via:<br>• <strong>WhatsApp:</strong> <a href=\"https://wa.me/201157265599\" target=\"_blank\">+20 115 726 5599</a><br>• <strong>Email:</strong> <a href=\"mailto:abdelrahman.abdelhafez10@gmail.com\">abdelrahman.abdelhafez10@gmail.com</a><br>• <strong>LinkedIn:</strong> <a href=\"https://www.linkedin.com/in/abdelrahman-abdelhafez-994932167/\" target=\"_blank\">LinkedIn Profile</a>"
          },
          {
            name: "experience",
            keywords: ["experience", "work", "job", "career", "history", "employer", "employ", "company", "role", "concentrix", "tabby", "fine stone", "resala", "خبرة", "عمل", "وظيفة", "وظائف", "سابق", "خبرات"],
            response: "I have over 5 years of experience in digital marketing and customer retention:<br>• <strong>Concentrix (Boost Mobile account):</strong> Sales & Retention Consultant (Aug 2025-Present) - Awarded the 1st Enterprise Loyalty Award (2026) for ranking #1 company-wide in sales conversion and churn reduction.<br>• <strong>Tabby Technologies Egypt (Fintech/BNPL):</strong> Customer Service & E-commerce Experience Specialist (Apr 2025-Aug 2025) - Restructured FAQ support guides and analyzed digital buyer behavior to reduce repeat contact.<br>• <strong>New Direction Academy (EdTech):</strong> Digital Marketer & Brand Strategist (Sep 2020-May 2022) - Led brand launch strategy, Facebook/Instagram campaigns, and dual SWOT analyses.<br>• <strong>Fine Stone (UnionAire Group):</strong> Website Editor & Digital Content Coordinator (Jul 2019-Feb 2020) - Landing page optimizations on Odoo CMS and SEO metrics tracking."
          },
          {
            name: "concentrix",
            keywords: ["concentrix", "loyalty", "retention", "boost mobile", "dish", "كونسنتريكس", "ولاء"],
            response: "At Concentrix (handling the Boost Mobile account by Dish Technologies from Aug 2025-Present as a Sales & Retention Consultant), I resolve critical billing, technical, and mobile plan issues. I was awarded the <strong>1st Enterprise Loyalty Award (2026)</strong> for ranking #1 company-wide in sales conversion and churn reduction, and maintaining top-tier customer satisfaction metrics."
          },
          {
            name: "tabby",
            keywords: ["tabby", "fintech", "bnpl", "customer service", "ambassador", "تابي"],
            response: "At Tabby Technologies Egypt (BNPL Fintech startup located at The Greek Campus, Cairo from Apr 2025-Aug 2025 as a Customer Service & E-commerce Experience Specialist), I supported customers through BNPL payment journeys, mapped user support friction points, and applied copywriting to restructure guides and decrease support contact recurrence."
          },
          {
            name: "projects",
            keywords: ["project", "portfolio", "case", "study", "studies", "kyoko", "gifts", "new direction", "hosting", "hostingwdomain", "مشاريع", "مشروع", "اعمال", "موقع"],
            response: "I have executed several major projects:<br>• <strong>Kyoko Gifts (2026):</strong> A comprehensive marketing playbook covering Business Model Canvas, brand identity, dual SWOT, 5 SMART goals, Blue Ocean strategy, and a 6-category KPI framework.<br>• <strong>New Direction Academy:</strong> Complete brand launch package (competitor pricing, buyer persona, customer journey mapping).<br>• <strong>HostingWDomain:</strong> Detailed UX and Content Audit for a SaaS provider with a 6-point execution roadmap."
          },
          {
            name: "kyoko",
            keywords: ["kyoko", "gifts", "gifting", "e-commerce", "كيوكو", "هدايا"],
            response: "<strong>Kyoko Gifts (2026)</strong> is an e-commerce brand. I built their full marketing playbook, outlining the customer journey, content pillars, Blue Ocean market differentiation, double SWOT analysis, 5 SMART goals, and a 6-category KPI measurement framework."
          },
          {
            name: "new_direction",
            keywords: ["new direction", "academy", "english", "edtech", "نيو دايركشن", "اكاديمية"],
            response: "For <strong>New Direction Academy</strong> (EdTech, Sep 2020-May 2022 as a Digital Marketer & Brand Strategist), I directed the brand launch from zero, establishing their logo direction, brand voice, positioning, and launching monthly Facebook and Instagram campaigns that successfully drove early student acquisition."
          },
          {
            name: "hosting",
            keywords: ["hosting", "hostingwdomain", "saas", "audit", "ux", "هوستنج"],
            response: "For <strong>HostingWDomain</strong>, I performed a detailed content and UX audit. I identified user friction points, mapped drop-off areas, and restructured landing page layouts to optimize their conversion funnel and increase sales."
          },
          {
            name: "skills",
            keywords: ["skills", "toolkit", "competence", "capabilities", "strategy", "planning", "copywriting", "content", "growth", "analytics", "cro", "meta", "tiktok", "ads", "seo", "swot", "smart", "canvas", "odoo", "canva", "مهارات", "ادوات"],
            response: "My skills are categorized into:<br>• <strong>Strategy:</strong> SWOT, SMART goals, Buyer Personas, Blue Ocean Strategy, Business Model Canvas (BMC).<br>• <strong>Content:</strong> Bilingual copywriting (AR/EN), Content Calendars, Brand Voice, Content Audits.<br>• <strong>Growth/Analytics:</strong> KPI frameworks, Meta Insights, CRO (Conversion Rate Optimization), Competitor Analysis.<br>• <strong>Tools:</strong> Meta Ads Manager, TikTok Ads Manager, Odoo CMS, Canva, AI productivity."
          },
          {
            name: "certifications",
            keywords: ["certif", "accredit", "diploma", "course", "fwd", "udacity", "degree", "education", "school", "zagazig", "cct", "ibrahim elfiky", "شهادات", "كورسات", "دبلوم"],
            response: "My top certifications include:<br>• <strong>Professional Diploma in Digital Marketing</strong> from BSA Academy (40+ hours, 2026).<br>• <strong>Certified Corporate Trainer (CCT)</strong> from the Canadian Center / Dr. Ibrahim Elfiky (2024).<br>• <strong>Digital Marketing Challenger Track</strong> from Udacity & Egypt FWD (ITIDA, 2020).<br>• <strong>European Computer Driving Licence (ECDL)</strong> & Microsoft Office Specialist (score 97/100, 2022).<br>• <strong>Space Sciences & Satellite Technologies Course</strong> from Egyptian Space Agency (EgSA, 2022)."
          },
          {
            name: "education",
            keywords: ["education", "degree", "university", "faculty", "science", "astronomy", "meteorology", "al-azhar", "graduat", "دراسة", "تعليم", "جامعة"],
            response: "I graduated with a **Bachelor of Science in Astronomy, Meteorology & Space Science** (2019-2023) from Al-Azhar University, Faculty of Science in Cairo, Egypt. Grade: Good (68.71%). This quantitative background strongly supports my data-driven approach to marketing campaigns and measurement loops."
          },
          {
            name: "volunteer",
            keywords: ["volunteer", "charity", "resala", "team lead", "anwar", "zagazig", "عمل تطوعي", "جمعية", "رسالة"],
            response: "I served as a **Marketing Team Lead** (May 2019 - Oct 2022) at Anwar Resala Zagazig (Resala Charity). I led a team of 8+ members, built awareness campaigns for community initiatives, trained members on content creation, and won the **Presentation & Public Speaking Competition Award**."
          },
          {
            name: "services",
            keywords: ["services", "help", "consult", "strategy", "marketing", "digital marketing", "retention", "loyalty", "growth", "optimization", "plan", "خدمات", "مساعدة", "خدمة", "تسويق"],
            response: "I specialize in digital marketing and customer retention strategy, offering services in:<br>• <strong>Retention & Loyalty:</strong> Churn reduction, customer support behavior analysis, and loyalty plays.<br>• <strong>E-commerce Marketing:</strong> Complete playbook design (SWOT, SMART goals, buyer personas, KPIs).<br>• <strong>Brand Launches:</strong> EdTech launch strategies, visual positioning, and paid social campaigns (Meta, TikTok).<br>• <strong>CRO & Content Audits:</strong> Restructuring landing pages, identifying user friction points, and optimizing conversion funnels."
          },
          {
            name: "rates",
            keywords: ["price", "rate", "cost", "salary", "freelance", "budget", "consult", "charge", "سعر", "راتب", "تكلفة", "فلوس"],
            response: "I am open to full-time opportunities, freelance consulting, and strategic contract roles. My rates and salary expectations depend on the project scope, duration, and alignment. Let's connect via <a href=\"https://wa.me/201157265599\" target=\"_blank\">WhatsApp</a> to discuss your needs!"
          },
          {
            name: "location",
            keywords: ["location", "based", "egypt", "ciza", "cairo", "zagazig", "october", "office", "remote", "مكان", "عنوان", "مصر", "موقع"],
            response: "I am based in <strong>6th of October City, Giza, Egypt</strong>. I am available for on-site roles in Cairo, Zayed, Smart Village, and Maadi, as well as remote opportunities worldwide."
          },
          {
            name: "thanks",
            keywords: ["thank", "thanks", "appreciate", "helpful", "good", "great", "awesome", "شكرا", "شكرًا", "تسلم", "جميل", "رائع"],
            response: "You're very welcome! Let me know if you have any other questions about Abdelrahman's work, experience, or projects."
          },
          {
            name: "abilities",
            keywords: ["what can you do", "help", "capabilities", "do", "how to use", "questions", "ماذا تفعل", "مساعدة", "خدماتك"],
            response: "I can answer questions about Abdelrahman's professional details. Try asking: <br>• 'Tell me about your experience at Tabby/Concentrix'<br>• 'What projects have you worked on?'<br>• 'How can I download your CV?'<br>• 'What are your contact details?'"
          },
          {
            name: "marketing_info",
            keywords: ["what is digital marketing", "define marketing", "explain marketing", "marketing meaning", "ما هو التسويق الرقمي", "تعريف التسويق"],
            response: "Digital marketing is the promotion of brands to connect with potential customers using the internet and digital communication (SEO, Social Media, Paid Ads, Email). Abdelrahman specializes in designing custom strategy playbooks that align business goals with market opportunities!"
          },
          {
            name: "retention_info",
            keywords: ["what is retention", "define retention", "customer loyalty", "churn rate", "ما هو الاحتفاظ بالعملاء", "الولاء"],
            response: "Customer retention refers to the strategy and actions companies take to keep clients loyal and reduce churn. Abdelrahman is an award-winning retention specialist ( Concentrix 1st Enterprise Loyalty Award 2026 ) who maps behavior and restructures guides to lower support recurrence."
          },
          {
            name: "seo_info",
            keywords: ["what is seo", "define seo", "search engine optimization", "ما هو السيو", "تحسين محركات البحث"],
            response: "SEO (Search Engine Optimization) is the practice of optimizing web content and structure to increase organic search visibility. Abdelrahman has experience optimizing CMS systems like Odoo and Wix, commending landing page UX, and tracking search index growth."
          },
          {
            name: "astronomy_info",
            keywords: ["what is astronomy", "astronomy definition", "space science", "meteorology", "ما هو علم الفلك", "علم الفلك"],
            response: "Astronomy is the scientific study of stars, planets, and cosmic space phenomena. Did you know Abdelrahman holds a **Bachelor of Science in Astronomy, Meteorology & Space Science** (2019-2023) from Al-Azhar University? This background fuels his analytical and data-driven approach to marketing campaigns!"
          },
          {
            name: "ai_info",
            keywords: ["what is ai", "define artificial intelligence", "robot", "chatbot", "ما هو الذكاء الاصطناعي", "روبوت"],
            response: "AI (Artificial Intelligence) is the simulation of human cognitive processes by computer systems. I am an AI-driven chatbot representation of Abdelrahman's digital footprint, built to handle marketing, professional, and general questions!"
          },
          {
            name: "greetings",
            keywords: ["hello", "hi", "hey", "greetings", "good morning", "good afternoon", "welcome", "about you", "أهلا", "مرحبا", "سلام", "ازيك"],
            response: "Hello! I'm Astro-Bot, Abdelrahman's AI assistant. Ask me anything about digital marketing or retention strategy, and let's explore!"
          }
        ]
      },
      ar: {
        greeting: "مرحباً! أنا Astro-Bot، المساعد الذكي لعبد الرحمن. اسألني عن أي شيء يخص التسويق الرقمي أو خطط الاحتفاظ بالعملاء، ودعنا نستكشف معاً!",
        defaultResponse: "أنا Astro-Bot، ومهمتي مساعدتك في التسويق الرقمي، خطط الاحتفاظ بالعملاء، ومشاريع عبد الرحمن. اسألني عن الفضاء، أو التسويق، أو تصفح سيرته الذاتية! يمكنك سؤالي عن أي شيء آخر وسأبذل قصارى جهدي لمساعدتك.",
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
            response: "لدي أكثر من 5 سنوات من الخبرة المهنية في التسويق الرقمي والاحتفاظ بالعملاء (Retention):<br>• <strong>كونسنتريكس (Boost Mobile):</strong> مستشار مبيعات واستبقاء العملاء (أغسطس ٢٠٢٥ - الآن) - حصلت على جائزة الولاء الأولى على مستوى المؤسسة (2026).<br>• <strong>تابي (التقنية المالية):</strong> أخصائي خدمة العملاء وتجربة التجارة الإلكترونية (أبريل ٢٠٢٥ - أغسطس ٢٠٢٥) - قمت بتحليل سلوكيات المشترين وتطوير تجربة المستخدم.<br>• <strong>أكاديمية نيو دايركشن:</strong> مسوق رقمي ومخطط استراتيجي للعلامة التجارية (سبتمبر ٢٠٢٠ - مايو ٢٠٢٢) - خطة الإطلاق والهوية الكاملة للمشروع والحملات الإعلانية.<br>• <strong>فاين ستون (يونيون إير):</strong> محرر موقع ومنسق محتوى (يوليو ٢٠١٩ - فبراير ٢٠٢٠) - تحسين محتوى Odoo CMS وتتبع السيو."
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
            name: "kyoko",
            keywords: ["كيوكو", "هدايا", "تجارة", "الكترونية", "هدية", "kyoko", "gifts"],
            response: "<strong>هدايا كيوكو (2026)</strong> هي علامة تجارية رائدة في التجارة الإلكترونية. قمت ببناء دليلها التسويقي الكامل، ورسم خريطة رحلة العميل، وتحديد ركائز المحتوى، وتطبيق استراتيجية المحيط الأزرق مع وضع نظام قياس الأداء المكون من 6 تصنيفات."
          },
          {
            name: "new_direction",
            keywords: ["دايركشن", "اتجاه", "جديد", "أكاديمية", "انجليزي", "تعليم", "new direction"],
            response: "لصالح <strong>أكاديمية نيو دايركشن</strong> لتعليم اللغة الإنجليزية (من سبتمبر ٢٠٢٠ إلى مايو ٢٠٢٢ كمسوق رقمي ومخطط استراتيجي للعلامة التجارية)، توليت إدارة استراتيجية الإطلاق من الصفر، وحددت نبرة الصوت وهوية العلامة التجارية، وأطلقت حملات الاستحواذ الناجحة عبر فيسبوك وإنستجرام."
          },
          {
            name: "hosting",
            keywords: ["استضافة", "هوستنج", "دومين", "تدقيق", "موقع", "تحسين", "مبيعات", "hosting"],
            response: "لمشروع <strong>هوستنج و دومين</strong>، أجريت تحليلاً دقيقاً لتجربة المستخدم وتدقيق المحتوى، وحددت نقاط تسرب العملاء في صفحات الهبوط، مما ساعد في تحسين مسار المبيعات."
          },
          {
            name: "skills",
            keywords: ["مهارات", "أدوات", "ميزات", "قدرات", "تسويق", "تحليل", "اعلانات", "كتابة", "محتوى", "skills", "tools"],
            response: "تنقسم مهاراتي إلى:<br>• <strong>الاستراتيجية:</strong> SWOT، الأهداف الذكية SMART، شخصيات المشتري، استراتيجية المحيط الأزرق، مخطط نموذج العمل.<br>• <strong>المحتوى:</strong> كتابة المحتوى الإعلاني باللغتين العربية والإنجليزية، خطط وجداول المحتوى، نبرة العلامة التجارية.<br>• <strong>النمو والتحليل:</strong> تصميم أطر مؤشرات الأداء (KPIs)، إحصاءات ميتا، تحسين معدلات التحويل (CRO)، وتحليل المنافسين.<br>• <strong>الأدوات:</strong> Meta Ads Manager، TikTok Ads Manager، نظام إدارة المحتوى Odoo، وتطبيقات Canva والذكاء الاصطناعي."
          },
          {
            name: "certifications",
            keywords: ["شهادة", "شهادات", "دبلومة", "كورس", "دورة", "تعليم", "جامعة", "المركز الكندي", "ابراهيم الفقي", "certifications"],
            response: "أبرز شهاداتي المهنية تشمل:<br>• <strong>الدبلوم المهني في التسويق الرقمي</strong> من أكاديمية BSA (أكثر من 40 ساعة تدريبية، 2026).<br>• <strong>مدرب شركات معتمد (CCT)</strong> من المركز الكندي (الدكتور إبراهيم الفقي، 2024).<br>• <strong>مسار تحدي التسويق الرقمي</strong> من Udacity ومبادرة FWD المصرية (2020).<br>• <strong>الرخصة الدولية لقيادة الحاسب الآلي (ECDL)</strong> وأخصائي مايكروسوفت أوفيس (2022/2019).<br>• <strong>دورة تكنولوجيا الفضاء والأقمار الصناعية</strong> من وكالة الفضاء المصرية (2022)."
          },
          {
            name: "education",
            keywords: ["دراسة", "تعليم", "جامعة", "شهادتي", "كلية", "علوم", "الازهر", "فلك", "تخصص", "education", "degree"],
            response: "تخرجت من **كلية العلوم بجامعة الأزهر في القاهرة** وحصلت على **بكالوريوس العلوم في الفلك والأرصاد الجوية وعلوم الفضاء** (2019-2023) بتقدير عام جيد (68.71%). تعزز هذه الخلفية العلمية قدرتي الكبيرة على التحليل الكمي وتفسير البيانات لقياس وتطوير أداء حملات التسويق الرقمية."
          },
          {
            name: "volunteer",
            keywords: ["تطوع", "خيري", "رسالة", "قائد", "انوار", "الزقازيق", "volunteer", "charity"],
            response: "عملت كـ **قائد لفريق التسويق** (مايو ٢٠١٩ - أكتوبر ٢٠٢٢) في نشاط أنوار رسالة الزقازيق (جمعية رسالة للأعمال الخيرية). قمت بقيادة وتدريب فريق من 8 أفراد على كتابة المحتوى، وإطلاق حملات التوعية، وحصلت على جائزة التقديم والإلقاء من الجمعية."
          },
          {
            name: "services",
            keywords: ["خدمات", "مساعدة", "خدمة", "تسويق", "استراتيجية", "استشاري", "حملات", "اعلانات", "تحسين", "عملاء", "ولاء"],
            response: "أتميز بتقديم خدمات متكاملة في التسويق الرقمي واستراتيجيات الاحتفاظ بالعملاء (Retention):<br>• <strong>الاحتفاظ بالعملاء والولاء:</strong> تقليل نسب تسرب العملاء، وتحليل سلوكيات الشكاوى، ووضع خطط الولاء.<br>• <strong>تسويق التجارة الإلكترونية:</strong> بناء خطط تسويقية متكاملة (تحليل SWOT، الأهداف الذكية SMART، شخصيات المشتري، ومؤشرات الأداء).<br>• <strong>إطلاق العلامات التجارية:</strong> خطط إطلاق المنصات التعليمية والخدمية وحملات منصات التواصل الاجتماعي (ميتا، تيك توك).<br>• <strong>تحسين معدلات التحويل (CRO) وتدقيق المحتوى:</strong> تقليل مشكلات تجربة المستخدم بالمواقع وتحسين مسارات الشراء للعملاء."
          },
          {
            name: "rates",
            keywords: ["سعر", "أسعار", "تكلفة", "سعر الخدمات", "راتب", "توظيف", "عقد", "عمل", "ميزانية", "rates", "salary"],
            response: "أنا منفتح لفرص العمل بدوام كامل، والاستشارات المستقلة (Freelance)، والعقود الاستراتيجية. تعتمد الأسعار وتوقعات الرواتب على نطاق العمل ومدة العقد. يسعدني التواصل عبر <a href=\"https://wa.me/201157265599\" target=\"_blank\">واتساب</a> لمناقشة التفاصيل!"
          },
          {
            name: "location",
            keywords: ["مكان", "موقع", "بلد", "مصر", "القاهرة", "أكتوبر", "remote", "عن بعد", "عنوان"],
            response: "أقيم حالياً في <strong>مدينة السادس من أكتوبر، الجيزة، جمهورية مصر العربية</strong>. أنا متاح للعمل الميداني في القاهرة، زايد، القرية الذكية، والمعادي، أو العمل عن بعد مع كافة الدول."
          },
          {
            name: "thanks",
            keywords: ["شكرا", "شكرًا", "تسلم", "جزاك", "مشكور", "رائع", "جميل", "ممتاز", "thank", "thanks"],
            response: "على الرحب والسعة! يسعدني دائماً مساعدتك. لا تتردد في طرح أي أسئلة أخرى حول أعمال عبد الرحمن أو خبراته."
          },
          {
            name: "abilities",
            keywords: ["ماذا تفعل", "مساعدة", "من أنت", "قدراتك", "كيف استعملك", "help", "do"],
            response: "يمكنني الإجابة عن أي استفسار يخص الحياة المهنية لعبد الرحمن. جرب أن تسألني عن:<br>• خبراته في شركتي تابي وكونسنتريكس<br>• تفاصيل مشاريعه التسويقية (مثل هدايا كيوكو)<br>• كيفية تحميل سيرته الذاتية (CV)<br>• قنوات التواصل المباشر معه"
          },
          {
            name: "marketing_info",
            keywords: ["التسويق الرقمي", "ما هو التسويق", "تعريف التسويق", "digital marketing", "define marketing"],
            response: "التسويق الرقمي هو ترويج العلامات التجارية للتواصل مع العملاء عبر الإنترنت وقنوات التواصل الرقمي. يتخصص عبد الرحمن في بناء الأدلة التسويقية المخصصة التي تربط بين أهداف العمل واحتياجات السوق الحقيقية!"
          },
          {
            name: "retention_info",
            keywords: ["الاحتفاظ بالعملاء", "ما هو الاحتفاظ", "الولاء", "retention", "loyalty"],
            response: "الاحتفاظ بالعملاء (Customer Retention) هو الأنشطة التي تتخذها الشركات لزيادة ولاء عملائها وتقليل نسب تسربهم. عبد الرحمن خبير معتمد في الاحتفاظ بالعملاء وحصل على جائزة الولاء الأولى على مستوى مؤسسة كونسنتريكس لتميزه في هذا مجال."
          },
          {
            name: "seo_info",
            keywords: ["السيو", "ما هو السيو", "محركات البحث", "seo", "search engine"],
            response: "تحسين محركات البحث (SEO) هو تحسين المواقع والصفحات لزيادة نسبة ظهورها بشكل طبيعي على محركات البحث. يمتلك عبد الرحمن خبرة في تطوير أداء السيو على أنظمة إدارة المحتوى Odoo و Wix وكتابة الأوصاف التعريفية للمنتجات."
          },
          {
            name: "astronomy_info",
            keywords: ["علم الفلك", "ما هو الفلك", "الفضاء", "الارصاد", "astronomy", "space"],
            response: "علم الفلك هو العلم الذي يدرس النجوم والكواكب والمجرات والظواهر الفضائية. عبد الرحمن خريج كلية العلوم بجامعة الأزهر بتخصص **الفلك والأرصاد الجوية وعلوم الفضاء**، وتساعده هذه الخلفية العلمية والرياضية في التحليل الدقيق لقياسات وأرقام حملات التسويق."
          },
          {
            name: "ai_info",
            keywords: ["الذكاء الاصطناعي", "ما هو الذكاء", "روبوت", "بوت", "ai", "artificial intelligence"],
            response: "الذكاء الاصطناعي هو محاكاة العمليات الذهنية البشرية بواسطة الآلات. أنا مساعد ذكي أعمل كخوارزمية محاكاة لتمثيل الحضور الرقمي لعبد الرحمن ومساعدتك في الإجابة عن أي تساؤل!"
          },
          {
            name: "greetings",
            keywords: ["أهلا", "اهلاً", "مرحباً", "مرحبا", "السلام", "سلام", "ازيك", "أهلاً وسهلاً", "من أنت", "مين"],
            response: "مرحباً! أنا Astro-Bot، المساعد الذكي لعبد الرحمن. اسألني عن أي شيء يخص التسويق الرقمي أو خطط الاحتفاظ بالعملاء، ودعنا نستكشف معاً!"
          }
        ]
      }
    };

    // Helper: Normalize inputs for better token matching (removes diacritics in Arabic)
    const normalizeText = (text) => {
      let str = text.toLowerCase().trim();
      // Remove Arabic diacritics: \u064B-\u0652 covers fathah, dammah, kasrah, sukoon, shaddah, tanween
      str = str.replace(/[\u064B-\u0652]/g, "");
      // Replace Alif variations (أ, إ, آ) with plain Alif (ا)
      str = str.replace(/[\u0622\u0623\u0625]/g, "\u0627");
      // Replace Ta Marbuta (ة) with Ha (ه)
      str = str.replace(/\u0629/g, "\u0647");
      // Replace Alef Maksura (ى) with Ya (ي)
      str = str.replace(/\u0649/g, "\u064A");
      // Remove question marks, periods, commas, slashes, brackets
      str = str.replace(/[?؟.,!/\\()]/g, "");
      return str;
    };

    // NLP Matching logic (Calculates semantic score based on token overlaps & synonyms)
    const getBestResponse = (query, lang) => {
      const normalizedQuery = normalizeText(query);
      const queryTokens = normalizedQuery.split(/\s+/);
      
      const langKB = KB[lang] || KB.en;
      let bestIntent = null;
      let maxScore = 0;

      // Conversational context check: if user asks for continuation/pronoun
      const isContextQuery = (lang === 'ar') 
        ? ["المزيد", "تفاصيل", "اخبرني", "هذا", "ذلك", "هناك", "اكمل"].some(w => normalizedQuery.includes(w))
        : ["more", "detail", "tell me", "that", "it", "this", "there", "continue"].some(w => normalizedQuery.includes(w));

      for (const intent of langKB.intents) {
        let score = 0;
        for (const kw of intent.keywords) {
          const normalizedKw = normalizeText(kw);
          
          if (normalizedQuery.includes(normalizedKw)) {
            score += 3;
          }
          
          for (const token of queryTokens) {
            if (token === normalizedKw) {
              score += 2;
            } else if (token.length > 3 && normalizedKw.includes(token)) {
              score += 1;
            }
          }
        }

        if (score > maxScore) {
          maxScore = score;
          bestIntent = intent;
        }
      }

      if (maxScore >= 2 && bestIntent) {
        lastIntentName = bestIntent.name;
        return bestIntent.response;
      }

      // Contextual fallback: if score is low but it's a context query and we have a last intent, reuse it
      if (isContextQuery && lastIntentName) {
        const matchingIntent = langKB.intents.find(i => i.name === lastIntentName);
        if (matchingIntent) {
          return (lang === 'ar') 
            ? `إليك المزيد من التفاصيل بخصوص ذلك:<br>${matchingIntent.response}`
            : `Here are more details about that:<br>${matchingIntent.response}`;
        }
      }

      return langKB.defaultResponse;
    };

    const getSuggestions = (lang) => {
      if (lang === 'ar') {
        return [
          "ما هو التسويق الرقمي؟",
          "ما هي خبراتك المهنية؟",
          "أخبرني عن دراستك للفلك",
          "كيف يمكنني التواصل معك؟"
        ];
      } else {
        return [
          "What is digital marketing?",
          "What is your experience?",
          "Tell me about your astronomy degree",
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

    const addMessageBubble = (text, sender) => {
      const bubble = document.createElement('div');
      bubble.className = `chat-msg ${sender}`;
      bubble.innerHTML = text;
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

    const handleUserMessage = (text) => {
      if (!text.trim()) return;
      
      const lang = document.documentElement.getAttribute('lang') || 'en';
      addMessageBubble(text, 'user');
      showTypingIndicator();
      
      setTimeout(() => {
        removeTypingIndicator();
        const response = getBestResponse(text, lang);
        addMessageBubble(response, 'bot');
      }, Math.random() * 600 + 600);
    };

    const openChat = () => {
      chatWindowPanel.classList.remove('hidden');
      chatTriggerBtn.classList.add('hidden'); // Hide floating trigger button when open
      
      if (chatMessagesContainer.children.length === 0) {
        const lang = document.documentElement.getAttribute('lang') || 'en';
        addMessageBubble(KB[lang].greeting, 'bot');
        renderSuggestions(lang);
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

