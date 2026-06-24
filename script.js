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

  // Restore saved preference (default = dark, force dark on fresh session load)
  let savedTheme = localStorage.getItem(THEME_KEY);
  if (!sessionStorage.getItem('themeInitialized')) {
    savedTheme = 'dark';
    sessionStorage.setItem('themeInitialized', 'true');
  } else {
    savedTheme = savedTheme || 'dark';
  }
  applyTheme(savedTheme);

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

  // Nav spine active line dynamic height updates
  const updateSpineActiveLine = () => {
    const activeLine = document.getElementById('nav-spine-active-line');
    if (activeLine && spineDots.length > 0) {
      const firstDot = spineDots[0];
      const activeDot = spineDots.find(dot => dot.classList.contains('active'));
      if (activeDot) {
        activeLine.style.top = (firstDot.offsetTop + 4) + 'px';
        activeLine.style.height = (activeDot.offsetTop - firstDot.offsetTop) + 'px';
      }
    }
  };

  // Run initial geometry caching
  cacheTimelineGeometry();
  cacheSectionsGeometry();
  cacheDocHeight();

  // Set initial line position after dynamic offsets render
  setTimeout(updateSpineActiveLine, 200);

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
  const projectCards = document.querySelectorAll('.project-glass-card');
  const drawers = document.querySelectorAll('.project-drawer');

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
    card.addEventListener('mousemove', (e) => {
      if (window.innerWidth <= 1024) return; // Disable tilt on mobile/tablets for smooth scrolling

      const rect = card.getBoundingClientRect();
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


  /* === NEW INTERSECTION OBSERVER FOR MICRO-REVEALS === */
  // Select all major sections, cards, and paragraphs to reveal
  const elementsToReveal = document.querySelectorAll('.content-section p, .stat-card, .skill-category, .project-glass-card, .campaign-glass-card, .certificate-glass-card, .eyebrow-split');
  
  elementsToReveal.forEach((el) => {
    el.classList.add('reveal');
  });

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

  document.querySelectorAll('.reveal').forEach(el => {
    revealObserver.observe(el);
  });

  // Project cards peek hover details are handled via native CSS now.

  /* ============================================================
     STARRY NIGHT INTERACTIVE ENGINE (2D Canvas)
     ============================================================ */
  const canvas = document.getElementById('three-planet-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    
    let width, height;
    let stars = [];
    const numStars = window.innerWidth > 768 ? 400 : 150;

    
    // Palette for realistic stars
    const starColors = ['#FFFFFF', '#FFFFFF', '#FFFFFF', '#FF9F1C', '#2EC4B6', '#274C77'];
    
    // Mouse interaction
    let mouse = { x: -1000, y: -1000 };
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
        if (sizeRand > 0.90) this.z = Math.random() * 2.0 + 1.5; // huge
        else if (sizeRand > 0.60) this.z = Math.random() * 1.2 + 0.8; // medium
        else this.z = Math.random() * 0.6 + 0.3; // small

        this.baseAlpha = Math.random() * 0.7 + 0.3;
        this.alpha = this.baseAlpha;
        
        // Color assignment
        this.color = starColors[Math.floor(Math.random() * starColors.length)];
        
        // Precompute RGB values to avoid hex conversions in every frame
        if (this.color === '#FFFFFF') { this.rgb = { r: 255, g: 255, b: 255 }; }
        else if (this.color === '#FF9F1C') { this.rgb = { r: 255, g: 159, b: 28 }; }
        else if (this.color === '#2EC4B6') { this.rgb = { r: 46, g: 196, b: 182 }; }
        else if (this.color === '#274C77') { this.rgb = { r: 39, g: 76, b: 119 }; }
        
        // Slower, more realistic drift
        this.vx = (Math.random() - 0.5) * 0.1;
        this.vy = -Math.random() * 0.1 - 0.05; 
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
        
        // Mouse repulsion
        let dx = this.x - mouse.x;
        let dy = this.y - mouse.y;
        let dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          let force = (150 - dist) / 150;
          this.x -= (dx / dist) * force * 2;
          this.y -= (dy / dist) * force * 2;
          this.alpha = Math.min(1, this.baseAlpha + force + twinkle);
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

        // Draw soft glow halo for brighter stars (replaces slow CPU shadowBlur)
        if (this.z > 0.8 && this.alpha > 0.3) {
          ctx.beginPath();
          ctx.arc(this.x, this.y, currentZ * 4, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${this.rgb.r}, ${this.rgb.g}, ${this.rgb.b}, ${this.alpha * 0.15})`;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(this.x, this.y, currentZ, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.rgb.r}, ${this.rgb.g}, ${this.rgb.b}, ${this.alpha})`;
        ctx.fill();
        
        // Diffraction spikes (starfish arms) for the largest, brightest stars
        if (this.z > 1.8 && this.alpha > 0.4) {
          let spikeSize = currentZ * 5;
          ctx.beginPath();
          ctx.moveTo(this.x - spikeSize, this.y);
          ctx.lineTo(this.x + spikeSize, this.y);
          ctx.moveTo(this.x, this.y - spikeSize);
          ctx.lineTo(this.x, this.y + spikeSize);
          ctx.strokeStyle = `rgba(${this.rgb.r}, ${this.rgb.g}, ${this.rgb.b}, ${this.alpha * 0.4})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }



    function init() {
      resize();
      stars = [];
      for (let i = 0; i < numStars; i++) {
        stars.push(new Star());
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
        stars.forEach(star => {
          star.update();
          star.draw();
        });
        
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
      }, 200);
    });
    
    // Merged global mousemove event listener (handles spotlight AND starfield)
    window.addEventListener('mousemove', (e) => {
      if (window.innerWidth > 1024) {
        document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
        document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
      }
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    }, { passive: true });

    window.addEventListener('mouseout', () => {
      mouse.x = -1000;
      mouse.y = -1000;
    });
    
    window.addEventListener('touchmove', (e) => {
      mouse.x = e.touches[0].clientX;
      mouse.y = e.touches[0].clientY;
    }, { passive: true });
    
    init();
    animate();
  }
});

