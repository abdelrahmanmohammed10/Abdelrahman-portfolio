/* 
 * V3 Interplanetary Portfolio Redesign
 * 9. Responsive Behavior Matrix & Layout State
 */

let isMobile = window.innerWidth <= 1024;
let isLandscape = window.innerWidth > window.innerHeight;
let currentSlideIndex = 0;
let sections = [];

document.addEventListener('DOMContentLoaded', () => {
  sections = Array.from(document.querySelectorAll('.slide-section'));
  
  window.addEventListener('loaderComplete', () => {
    initLayout();
  });

  window.addEventListener('sceneResize', () => {
    const newIsMobile = window.innerWidth <= 1024;
    const newIsLandscape = window.innerWidth > window.innerHeight;
    
    if (newIsMobile !== isMobile || newIsLandscape !== isLandscape) {
      isMobile = newIsMobile;
      isLandscape = newIsLandscape;
      initLayout(); // Rebind events and GSAP triggers
    } else {
      updatePlanetPosition(currentSlideIndex);
    }
  });
});

function initLayout() {
  // Clear GSAP
  if (typeof ScrollTrigger !== 'undefined') {
    ScrollTrigger.getAll().forEach(t => t.kill());
  }

  const slidesContainer = document.getElementById('slides-container');
  
  if (isMobile) {
    // Compact Mode (Swipe + Snapping)
    slidesContainer.style.transform = \	ranslateX(-\vw)\;
    document.body.style.overflow = 'hidden';
    
    setupCompactControls();
    updatePlanetPosition(currentSlideIndex);

  } else {
    // Desktop Mode (GSAP ScrollTrigger)
    slidesContainer.style.transform = 'none';
    document.body.style.overflow = 'auto';

    sections.forEach((sec, i) => {
      ScrollTrigger.create({
        trigger: sec,
        start: "top 60%",
        end: "bottom 40%",
        onEnter: () => updatePlanetPosition(i),
        onEnterBack: () => updatePlanetPosition(i)
      });
    });
    
    // Initial check
    const currentScroll = window.scrollY;
    let found = 0;
    sections.forEach((sec, i) => {
      if (currentScroll >= sec.offsetTop - window.innerHeight / 2) found = i;
    });
    updatePlanetPosition(found);
  }
}

function updatePlanetPosition(index) {
  currentSlideIndex = index;
  
  // Progress ratio (0 = start, 1 = end)
  const ratio = index / (Math.max(1, sections.length - 1));

  // Determine transition between Earth and Moon based on ratio
  // First 60% of site is Earth, last 40% is Moon
  let earthScale = 1.0 - (ratio * 1.5);
  let moonScale = -0.5 + (ratio * 2.0);
  
  if (earthScale < 0) earthScale = 0;
  if (moonScale < 0) moonScale = 0;
  if (moonScale > 1) moonScale = 1;

  // Base positions
  let targetX = 0;
  let targetY = 0;

  if (isMobile) {
    if (isLandscape) {
      targetX = -25; // 25% left
      targetY = 0;
    } else {
      targetX = 0;
      targetY = -30; // 30% up
    }
  } else {
    // Alternate left/right on desktop based on even/odd sections
    targetX = index % 2 === 0 ? -30 : 30;
    targetY = 0;
  }

  if (window.moveEarthTo) {
    window.moveEarthTo(targetX, targetY, Math.max(0.01, earthScale), 'earth');
    window.moveEarthTo(targetX, targetY, Math.max(0.01, moonScale), 'moon');
  }
}

/* Compact Mode Swipe & Controls */
let touchStartX = 0;
let touchStartY = 0;

function setupCompactControls() {
  const nextBtn = document.getElementById('nav-next');
  const prevBtn = document.getElementById('nav-prev');

  const goToSlide = (idx) => {
    if (idx < 0 || idx >= sections.length) return;
    currentSlideIndex = idx;
    document.getElementById('slides-container').style.transform = \	ranslateX(-\vw)\;
    updatePlanetPosition(currentSlideIndex);
    
    if (prevBtn) prevBtn.disabled = currentSlideIndex === 0;
    if (nextBtn) nextBtn.disabled = currentSlideIndex === sections.length - 1;
  };

  // Ensure controls exist and bind
  if (nextBtn && prevBtn) {
    // Clone and replace to clear old listeners
    const newNext = nextBtn.cloneNode(true);
    const newPrev = prevBtn.cloneNode(true);
    nextBtn.parentNode.replaceChild(newNext, nextBtn);
    prevBtn.parentNode.replaceChild(newPrev, prevBtn);

    newNext.addEventListener('click', () => goToSlide(currentSlideIndex + 1));
    newPrev.addEventListener('click', () => goToSlide(currentSlideIndex - 1));
    
    newPrev.disabled = currentSlideIndex === 0;
    newNext.disabled = currentSlideIndex === sections.length - 1;
  }

  // Touch Swipe
  window.addEventListener('touchstart', e => {
    if (!isMobile) return;
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
  }, {passive: true});

  window.addEventListener('touchend', e => {
    if (!isMobile) return;
    const touchEndX = e.changedTouches[0].screenX;
    const touchEndY = e.changedTouches[0].screenY;
    
    const deltaX = touchEndX - touchStartX;
    const deltaY = Math.abs(touchEndY - touchStartY);

    // If mostly horizontal swipe
    if (Math.abs(deltaX) > 50 && deltaY < 50) {
      if (deltaX < 0) goToSlide(currentSlideIndex + 1); // Swipe left = next
      if (deltaX > 0) goToSlide(currentSlideIndex - 1); // Swipe right = prev
    }
  }, {passive: true});

  // Keyboard navigation
  window.addEventListener('keydown', e => {
    if (!isMobile) return;
    if (e.key === 'ArrowRight') goToSlide(currentSlideIndex + 1);
    if (e.key === 'ArrowLeft') goToSlide(currentSlideIndex - 1);
  });
}
