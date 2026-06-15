/* ============================================================
   PORTFOLIO V2 INTERACTIVE ENGINE
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ----- 1. PRELOADER SEQUENCE ----- */
  const preloader = document.getElementById('preloader');
  window.addEventListener('load', () => {
    setTimeout(() => {
      preloader.classList.add('loaded');
      setTimeout(() => {
        preloader.style.display = 'none';
      }, 800);
    }, 1200);
  });

  // Fallback in case window load doesn't trigger
  setTimeout(() => {
    if (!preloader.classList.contains('loaded')) {
      preloader.classList.add('loaded');
      setTimeout(() => {
        preloader.style.display = 'none';
      }, 800);
    }
  }, 3500);


  /* ----- 2. DYNAMIC SCROLL PROGRESS BAR ----- */
  const progressBar = document.createElement('div');
  progressBar.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    height: 3px;
    background: linear-gradient(90deg, #F59E0B, #06B6D4, #7C3AED);
    z-index: 1000000;
    width: 0%;
    transition: width 0.1s ease-out;
  `;
  document.body.appendChild(progressBar);

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = scrollPercent + '%';
  });


  /* ----- 3. CURSOR SPOTLIGHT ----- */
  window.addEventListener('mousemove', (e) => {
    document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
    document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
  });


  /* ----- 4. CANVAS PARTICLE SYSTEM (MINIMAL STARFIELD) ----- */
  const canvas = document.getElementById('particle-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    class Star {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 1.0 + 0.3; // Tiny stars
        this.vx = (Math.random() - 0.5) * 0.08; // Very slow drift
        this.vy = (Math.random() - 0.5) * 0.08;
        this.alpha = Math.random() * 0.5 + 0.2; // Translucent
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Wrap around boundaries
        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
        ctx.fill();
      }
    }

    function init() {
      particles = [];
      const count = Math.floor((width * height) / 18000);
      const safeCount = Math.min(Math.max(count, 40), 100);
      for (let i = 0; i < safeCount; i++) {
        particles.push(new Star());
      }
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
      }

      requestAnimationFrame(animate);
    }

    init();
    animate();
  }


  /* ----- 5. MAGNETIC HOVER EFFECT ----- */
  const magneticButtons = document.querySelectorAll('.magnetic-button');
  magneticButtons.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      // Pull button towards cursor by 35% of offset
      btn.style.transform = `translate(${x * 0.35}px, ${y * 0.35}px)`;
      if (btn.querySelector('span')) {
        btn.querySelector('span').style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
      }
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0px, 0px)';
      if (btn.querySelector('span')) {
        btn.querySelector('span').style.transform = 'translate(0px, 0px)';
      }
    });
  });


  /* ----- 6. INTERSECTION OBSERVER REVEALS ----- */
  // Paragraphs fade-in reveal
  const revealParagraphs = document.querySelectorAll('.reveal-paragraph');
  const paragraphObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        paragraphObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealParagraphs.forEach(p => {
    p.style.opacity = '0';
    p.style.transform = 'translateY(15px)';
    p.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    paragraphObserver.observe(p);
  });

  // Cards stagger reveal
  const revealCards = document.querySelectorAll('.reveal-card');
  const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, idx) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, idx * 60); // subtle cascade delay
        cardObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  revealCards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'opacity 1s cubic-bezier(0.16, 1, 0.3, 1), transform 1s cubic-bezier(0.16, 1, 0.3, 1)';
    cardObserver.observe(card);
  });

  // Heading split mimic
  const revealHeadings = document.querySelectorAll('.split-reveal-heading');
  const headingObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        headingObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  revealHeadings.forEach(heading => {
    heading.style.opacity = '0';
    heading.style.transform = 'translateY(25px)';
    heading.style.transition = 'opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1), transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)';
    headingObserver.observe(heading);
  });


  /* ----- 7. NUMBERS COUNT-UP ----- */
  const statNums = document.querySelectorAll('.stat-num');
  let statsTriggered = false;

  const statsObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !statsTriggered) {
      statsTriggered = true;
      statNums.forEach(num => {
        const limit = parseInt(num.getAttribute('data-val'));
        let current = 0;
        const duration = 1200; // ms
        const increment = limit / (duration / 16); // ~60fps
        
        const counter = setInterval(() => {
          current += increment;
          if (current >= limit) {
            num.textContent = limit;
            clearInterval(counter);
          } else {
            num.textContent = Math.floor(current);
          }
        }, 16);
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
  const planetElements = document.querySelectorAll('.bg-planet');
  let lastActiveSection = '';

  const updateActivePlanet = (activeSec) => {
    if (activeSec === lastActiveSection) return;
    lastActiveSection = activeSec;

    // Solar system mapping coordinates (Center is 1500, 1500)
    const coordinates = {
      'hero': { x: 1500, y: 1500, scale: 1.6 },
      'about': { x: 1747, y: 1253, scale: 1.25 },
      'work': { x: 1076, y: 1076, scale: 1.25 },
      'campaigns': { x: 1925, y: 2236, scale: 1.25 },
      'journey': { x: 722, y: 2278, scale: 1.25 },
      'credentials': { x: 2150, y: 374, scale: 1.25 },
      'contact': { x: 138, y: 1996, scale: 1.25 }
    };

    const coord = coordinates[activeSec] || coordinates['hero'];

    // Dynamic panning based on text layout alignment (desktop only)
    const isMobile = window.innerWidth <= 900;
    let xOffset = 0;
    if (!isMobile) {
      // Offset planet to the left (text on right) or right (text on left)
      const rightLayoutSections = ['work', 'credentials'];
      xOffset = rightLayoutSections.includes(activeSec) ? -280 : 280;
    }

    const panX = 1500 - coord.x + xOffset;
    const panY = 1500 - coord.y;

    // Set translation and scale variables for CSS transform panning
    document.documentElement.style.setProperty('--pan-x', `${panX}px`);
    document.documentElement.style.setProperty('--pan-y', `${panY}px`);
    document.documentElement.style.setProperty('--zoom-scale', coord.scale);

    // Toggle active classes on background planets
    planetElements.forEach(p => {
      p.classList.remove('active');
      if (p.getAttribute('data-sec') === activeSec) {
        p.classList.add('active');
      }
    });
  };

  window.addEventListener('scroll', () => {
    let currentActive = '';
    const scrollPos = window.scrollY + window.innerHeight / 3;

    sections.forEach(sec => {
      const secTop = sec.offsetTop;
      const secHeight = sec.offsetHeight;
      if (scrollPos >= secTop && scrollPos < secTop + secHeight) {
        currentActive = sec.getAttribute('id');
      }
    });

    // Default to Hero section when near the top of the scroll
    if (window.scrollY < 180) {
      currentActive = 'hero';
    }

    if (currentActive) {
      navItems.forEach(item => {
        item.classList.remove('active');
        // When hero is active, highlight the home/hero link as active
        if (item.getAttribute('href') === `#${currentActive}`) {
          item.classList.add('active');
        }
      });
      updateActivePlanet(currentActive);
    }

    // Spine timeline progress drawing
    const timeline = document.querySelector('.timeline-container');
    if (timeline) {
      const spineProgress = document.querySelector('.spine-progress');
      const rect = timeline.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate how much of the timeline has been scrolled past the center of the viewport
      const startTrigger = windowHeight / 2;
      const scrolled = startTrigger - rect.top;
      const percent = Math.min(Math.max((scrolled / rect.height) * 100, 0), 100);
      spineProgress.style.height = percent + '%';
    }
  });


  /* ----- 9. PROJECT DRAWERS ----- */
  const projectCards = document.querySelectorAll('.project-glass-card');
  const drawers = document.querySelectorAll('.project-drawer');

  projectCards.forEach(card => {
    card.addEventListener('click', () => {
      const drawerId = card.getAttribute('data-drawer');
      const targetDrawer = document.getElementById(drawerId);
      if (targetDrawer) {
        targetDrawer.classList.add('active');
        targetDrawer.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden'; // prevent scroll behind
      }
    });
  });

  drawers.forEach(drawer => {
    const closeBtn = drawer.querySelector('.drawer-close');
    const overlay = drawer.querySelector('.drawer-overlay');

    const closeDrawer = () => {
      drawer.classList.remove('active');
      drawer.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    };

    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
    if (overlay) overlay.addEventListener('click', closeDrawer);
  });


  /* ----- 10. CERTIFICATE LIGHTBOX ----- */
  const certCards = document.querySelectorAll('.certificate-glass-card');
  const lightbox = document.getElementById('cert-lightbox');
  const lightboxImg = lightbox ? lightbox.querySelector('.lightbox-img') : null;

  if (lightbox && lightboxImg) {
    certCards.forEach(card => {
      card.addEventListener('click', () => {
        const imgSrc = card.getAttribute('data-img');
        lightboxImg.src = imgSrc;
        lightbox.classList.add('active');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
      });
    });

    const closeLightbox = () => {
      lightbox.classList.remove('active');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      setTimeout(() => {
        lightboxImg.src = '';
      }, 500);
    };

    const closeBtn = lightbox.querySelector('.lightbox-close');
    const overlay = lightbox.querySelector('.lightbox-overlay');

    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    if (overlay) overlay.addEventListener('click', closeLightbox);

    // Close on Escape key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightbox.classList.contains('active')) {
        closeLightbox();
      }
    });
  }


  /* ----- 11. MOBILE HAMBURGER MENU ----- */
  const burger = document.getElementById('burger');
  const mobileNav = document.getElementById('mobile-nav-overlay');
  const mobileClose = document.getElementById('mobile-close');
  const mobileLinks = document.querySelectorAll('.mobile-menu .mob-link');

  if (burger && mobileNav) {
    burger.addEventListener('click', () => {
      mobileNav.classList.add('active');
      mobileNav.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';

      // Stagger link entrance animations
      mobileLinks.forEach((link, idx) => {
        link.style.opacity = '0';
        link.style.transform = 'translateY(30px)';
        link.style.transition = 'none'; // reset

        setTimeout(() => {
          link.style.transition = 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
          link.style.opacity = '1';
          link.style.transform = 'translateY(0)';
        }, 120 + idx * 60);
      });
    });

    const closeMobileNav = () => {
      mobileNav.classList.remove('active');
      mobileNav.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    };

    if (mobileClose) mobileClose.addEventListener('click', closeMobileNav);
    mobileLinks.forEach(link => link.addEventListener('click', closeMobileNav));
  }


  /* ----- 12. GLASS CARDS mouse tracking (3D TILT EFFECT) ----- */
  const glassCards = document.querySelectorAll('.project-glass-card, .certificate-glass-card');
  
  glassCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      if (window.innerWidth <= 900) return; // Disable tilt on mobile/tablets for smooth scrolling

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

});
