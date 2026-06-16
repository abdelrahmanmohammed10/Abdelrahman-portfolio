/* ============================================================
   PORTFOLIO V2 INTERACTIVE ENGINE
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  let lastActiveSection = 'hero';

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

  // Progress bar logic moved to the combined throttled scroll handler below.


  /* ----- 3. CURSOR SPOTLIGHT ----- */
  window.addEventListener('mousemove', (e) => {
    if (window.innerWidth <= 1024) return; // Disable on mobile for performance
    document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
    document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
  }, { passive: true });


  /* ----- 4. THREE.JS WebGL 3D SPACE SCENE ----- */
  const canvas = document.getElementById('three-planet-canvas');
  let scene, camera, renderer, starField;
  let planets = [];
  let currentCameraY = 0;
  let targetCameraY = 0;
  const isMobile = window.innerWidth <= 1024;

  const getTexturePath = (filename) => {
    if (window.location.protocol === 'file:') {
      // Under local file protocol, load from CORS-enabled raw GitHub mapping to bypass browser blocks
      return `https://raw.githubusercontent.com/jeromeetienne/threex.planets/master/images/${filename}`;
    }
    return `./textures/${filename}`;
  };

  const planetConfig = [
    { 
      name: 'hero', 
      y: 0, 
      x: 0, 
      size: 3.2, 
      color: 0xF59E0B, 
      materialType: 'basic', 
      map: 'sunmap.jpg' 
    },
    { 
      name: 'about', 
      y: -12, 
      x: -3.8, 
      size: 2.2, 
      color: 0x06B6D4, 
      materialType: 'phong', 
      map: 'earthmap1k.jpg', 
      bumpMap: 'earthbump1k.jpg', 
      bumpScale: 0.05, 
      specularMap: 'earthspec1k.jpg', 
      specular: 0x444444, 
      shininess: 25 
    },
    { 
      name: 'work', 
      y: -24, 
      x: 3.8, 
      size: 1.8, 
      color: 0xef4444, 
      materialType: 'phong', 
      map: 'marsmap1k.jpg', 
      bumpMap: 'marsbump1k.jpg', 
      bumpScale: 0.03, 
      shininess: 12 
    },
    { 
      name: 'campaigns', 
      y: -36, 
      x: -3.8, 
      size: 2.5, 
      color: 0xdca876, 
      materialType: 'standard', 
      map: 'jupitermap.jpg', 
      roughness: 0.8, 
      metalness: 0.1 
    },
    { 
      name: 'journey', 
      y: -48, 
      x: 3.8, 
      size: 2.0, 
      color: 0xdfcdb2, 
      materialType: 'standard', 
      map: 'saturnmap.jpg', 
      roughness: 0.85, 
      metalness: 0.1, 
      ring: { 
        innerRadiusMultiplier: 1.3, 
        outerRadiusMultiplier: 2.3, 
        colorMap: 'saturnringcolor.jpg', 
        patternMap: 'saturnringpattern.gif' 
      } 
    },
    { 
      name: 'credentials', 
      y: -60, 
      x: 3.8, 
      size: 1.9, 
      color: 0xa5d6a7, 
      materialType: 'standard', 
      map: 'uranusmap.jpg', 
      roughness: 0.8, 
      metalness: 0.1 
    },
    { 
      name: 'contact', 
      y: -72, 
      x: 0, 
      size: 2.2, 
      color: 0x3f51b5, 
      materialType: 'standard', 
      map: 'neptunemap.jpg', 
      roughness: 0.8, 
      metalness: 0.1 
    }
  ];

  if (canvas) {
    scene = new THREE.Scene();
    
    // Set up camera aspect and field of view
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 9); // Z position for framing

    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true, // transparent background for style meshes
      antialias: !isMobile,
      powerPreference: "high-performance"
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    // 1. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.16);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 2.0);
    sunLight.position.set(-6, 6, 8); // Top-left rays
    scene.add(sunLight);

    // 2. Starfield (Drifting points)
    const starCount = isMobile ? 300 : 1200;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 60;
      starPositions[i + 1] = (Math.random() - 0.5) * 120;
      starPositions[i + 2] = -Math.random() * 30 - 5;
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.08,
      transparent: true,
      opacity: 0.6,
      sizeAttenuation: true
    });
    starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);

    // 3. Planet Builder
    const textureLoader = new THREE.TextureLoader();
    const isAr = document.documentElement.getAttribute('lang') === 'ar';

    planetConfig.forEach((cfg) => {
      // Create material with fallback color first
      let material;

      if (cfg.materialType === 'basic') {
        material = new THREE.MeshBasicMaterial({
          color: cfg.color
        });
        if (cfg.map) {
          material.map = textureLoader.load(getTexturePath(cfg.map), () => {
            material.color.setHex(0xffffff); // Remove fallback tint once loaded
            material.needsUpdate = true;
          }, undefined, (err) => {
            console.warn("Failed to load basic texture:", cfg.map);
          });
        }
      } else if (cfg.materialType === 'phong') {
        material = new THREE.MeshPhongMaterial({
          color: cfg.color,
          bumpScale: cfg.bumpScale || 0.05,
          shininess: cfg.shininess || 30
        });

        if (cfg.map) {
          material.map = textureLoader.load(getTexturePath(cfg.map), () => {
            material.color.setHex(0xffffff);
            material.needsUpdate = true;
          });
        }
        if (cfg.bumpMap) {
          material.bumpMap = textureLoader.load(getTexturePath(cfg.bumpMap), () => {
            material.needsUpdate = true;
          });
        }
        if (cfg.specularMap) {
          material.specularMap = textureLoader.load(getTexturePath(cfg.specularMap), () => {
            material.specular = new THREE.Color(cfg.specular || 0x111111);
            material.needsUpdate = true;
          });
        }
      } else {
        // PBR Standard Material
        material = new THREE.MeshStandardMaterial({
          color: cfg.color,
          roughness: cfg.roughness !== undefined ? cfg.roughness : 0.8,
          metalness: cfg.metalness !== undefined ? cfg.metalness : 0.1
        });

        if (cfg.map) {
          material.map = textureLoader.load(getTexturePath(cfg.map), () => {
            material.color.setHex(0xffffff);
            material.needsUpdate = true;
          });
        }
        if (cfg.bumpMap) {
          material.bumpMap = textureLoader.load(getTexturePath(cfg.bumpMap), () => {
            material.needsUpdate = true;
          });
        }
      }

      const geometry = new THREE.SphereGeometry(cfg.size, cfg.name === 'hero' ? 64 : 32, cfg.name === 'hero' ? 64 : 32);
      const mesh = new THREE.Mesh(geometry, material);

      const group = new THREE.Group();
      const initialX = isAr ? -cfg.x : cfg.x;
      group.position.set(initialX, cfg.y, 0);
      group.scale.set(0.9, 0.9, 0.9); // Inactive scale
      group.add(mesh);

      // Saturn Rings
      if (cfg.ring) {
        const innerRad = cfg.size * cfg.ring.innerRadiusMultiplier;
        const outerRad = cfg.size * cfg.ring.outerRadiusMultiplier;
        const thetaSegments = 64;
        const phiSegments = 8;
        
        const ringGeo = new THREE.RingGeometry(innerRad, outerRad, thetaSegments, phiSegments);
        
        // Radial UV mapping (U = radius from inner to outer, V = angle around circle)
        const uvs = ringGeo.attributes.uv;
        let uvIndex = 0;
        for (let j = 0; j <= phiSegments; j++) {
          const u = j / phiSegments;
          for (let i = 0; i <= thetaSegments; i++) {
            const v = i / thetaSegments;
            uvs.setXY(uvIndex, u, v);
            uvIndex++;
          }
        }
        uvs.needsUpdate = true;

        const ringMat = new THREE.MeshStandardMaterial({
          color: 0xe5c3a3, // Fallback ring color
          transparent: true,
          side: THREE.DoubleSide,
          roughness: 0.8,
          metalness: 0.1
        });

        ringMat.map = textureLoader.load(getTexturePath(cfg.ring.colorMap), () => {
          ringMat.color.setHex(0xffffff);
          ringMat.needsUpdate = true;
        });

        ringMat.alphaMap = textureLoader.load(getTexturePath(cfg.ring.patternMap), () => {
          ringMat.needsUpdate = true;
        });

        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.rotation.x = Math.PI / 2.5;
        ringMesh.rotation.y = Math.PI / 12;
        group.add(ringMesh);
      }

      scene.add(group);

      planets.push({
        name: cfg.name,
        mesh: mesh,
        group: group,
        baseX: cfg.x,
        baseY: cfg.y,
        targetX: initialX
      });
    });

    // 4. Render loop with Lerp Easing
    function animate() {
      requestAnimationFrame(animate);

      // Smooth camera scroll transition
      currentCameraY += (targetCameraY - currentCameraY) * 0.045;
      camera.position.y = currentCameraY;

      // Axis rotation & swell meshes on scroll focus
      planets.forEach(p => {
        const rotSpeed = p.name === 'hero' ? 0.0006 : 0.0035;
        p.mesh.rotation.y += rotSpeed;

        // Animate X target transitions on language toggling
        p.group.position.x += (p.targetX - p.group.position.x) * 0.08;

        // Breathe expansion when active
        if (p.name === lastActiveSection) {
          p.group.scale.set(
            THREE.MathUtils.lerp(p.group.scale.x, 1.05, 0.05),
            THREE.MathUtils.lerp(p.group.scale.y, 1.05, 0.05),
            THREE.MathUtils.lerp(p.group.scale.z, 1.05, 0.05)
          );
        } else {
          p.group.scale.set(
            THREE.MathUtils.lerp(p.group.scale.x, 0.9, 0.05),
            THREE.MathUtils.lerp(p.group.scale.y, 0.9, 0.05),
            THREE.MathUtils.lerp(p.group.scale.z, 0.9, 0.05)
          );
        }
      });

      if (starField) {
        starField.rotation.y += 0.00008;
      }

      renderer.render(scene, camera);
    }

    animate();

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }


  /* ----- 5. MAGNETIC HOVER EFFECT ----- */
  const magneticButtons = document.querySelectorAll('.magnetic-button');
  magneticButtons.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      if (window.innerWidth <= 1024) return; // Disable on mobile
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
  // lastActiveSection declared at DOMContentLoaded top

  const updateActivePlanet = (activeSec) => {
    if (activeSec === lastActiveSection) return;
    lastActiveSection = activeSec;

    // Update WebGL Camera target Y coordinate
    if (typeof planetConfig !== 'undefined') {
      const activeCfg = planetConfig.find(p => p.name === activeSec);
      if (activeCfg) {
        targetCameraY = activeCfg.y;
      }
    }
  };

  let tickingScroll = false;
  window.addEventListener('scroll', () => {
    if (!tickingScroll) {
      window.requestAnimationFrame(() => {
        const scrollTop = window.scrollY;
        
        // 1. Progress Bar
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        progressBar.style.width = scrollPercent + '%';

        // 2. Active Nav Link Tracking & Background Planets
        let currentActive = '';
        const scrollPos = scrollTop + window.innerHeight / 3;

        sections.forEach(sec => {
          const secTop = sec.offsetTop;
          const secHeight = sec.offsetHeight;
          if (scrollPos >= secTop && scrollPos < secTop + secHeight) {
            currentActive = sec.getAttribute('id');
          }
        });

        // Default to Hero section when near the top of the scroll
        if (scrollTop < 180) {
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

        // 3. Spine timeline progress drawing
        const timeline = document.querySelector('.timeline-container');
        if (timeline) {
          const spineProgress = document.querySelector('.spine-progress');
          const startTrigger = window.innerHeight / 2;
          
          // Use offsetTop instead of getBoundingClientRect for layout performance
          let timelineTop = timeline.offsetTop;
          let parent = timeline.offsetParent;
          while(parent) {
             timelineTop += parent.offsetTop;
             parent = parent.offsetParent;
          }
          const timelineHeight = timeline.offsetHeight;
          
          const scrolled = (scrollTop + startTrigger) - timelineTop;
          const percent = Math.min(Math.max((scrolled / timelineHeight) * 100, 0), 100);
          spineProgress.style.height = percent + '%';
        }

        // 4. Scroll to Top Button Visibility
        const scrollTopBtn = document.getElementById('scroll-to-top');
        if (scrollTopBtn) {
          if (scrollTop > 600) {
            scrollTopBtn.classList.add('visible');
          } else {
            scrollTopBtn.classList.remove('visible');
          }
        }

        tickingScroll = false;
      });
      tickingScroll = true;
    }
  }, { passive: true });


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
  const scrollTopBtn = document.getElementById('scroll-to-top');
  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }


  /* ----- 14. AJAX CONTACT FORM HANDLING ----- */
  const contactForm = document.getElementById('contact-form');
  const formContentArea = document.querySelector('.form-content-area');
  const formSuccessState = document.querySelector('.form-success-state');
  const successUsername = document.getElementById('success-username');
  const resetFormBtn = document.querySelector('.btn-reset-form');
  const submitBtn = contactForm ? contactForm.querySelector('.btn-submit-form') : null;
  const submitBtnSpan = submitBtn ? submitBtn.querySelector('span') : null;

  if (contactForm && formContentArea && formSuccessState) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameVal = document.getElementById('name').value;
      
      // Set submit button loading state
      if (submitBtn) {
        submitBtn.classList.add('loading');
        if (submitBtnSpan) submitBtnSpan.textContent = 'Transmitting...';
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
        alert('Transmission failed. Please check your connection or contact abdelrahman.abdelhafez10@gmail.com directly.');
      })
      .finally(() => {
        // Reset submit button state
        if (submitBtn) {
          submitBtn.classList.remove('loading');
          if (submitBtnSpan) submitBtnSpan.textContent = 'Send Message';
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

    // Update active visual state for language buttons
    const langBtns = document.querySelectorAll('.lang-btn');
    langBtns.forEach(btn => {
      if (btn.getAttribute('data-lang') === lang) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Update Three.js targetX offsets for language toggling
    if (typeof planets !== 'undefined' && planets && planets.length > 0) {
      planets.forEach(p => {
        p.targetX = lang === 'ar' ? -p.baseX : p.baseX;
      });
    }

    // Update document title based on language
    if (lang === 'ar') {
      document.title = 'عبد الرحمن عبد الحافظ — مخطط واستراتيجي تسويق رقمي';
    } else {
      document.title = 'Abdelrahman Abdelhafez — Digital Marketing Strategist';
    }
  };

  initLanguage();

});
