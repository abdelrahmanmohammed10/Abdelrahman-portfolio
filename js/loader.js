window.THREE_MANAGER = new THREE.LoadingManager();
/* 
 * V3 Interplanetary Portfolio Redesign
 * 5. Loading Sequence
 */

document.addEventListener('DOMContentLoaded', () => {
  // Check if we've already loaded this session
  if (sessionStorage.getItem('v3_loaded') === 'true') {
    skipLoader();
    return;
  }

  const loaderUi = document.getElementById('loader-ui');
  if (!loaderUi) return;

  const percentText = document.getElementById('load-percent');
  const skipBtn = document.getElementById('skip-btn');
  const rocket = document.getElementById('rocket-container');
  const telescopeMask = document.getElementById('telescope-mask');

  // Skip logic
  const handleSkip = () => {
    sessionStorage.setItem('v3_loaded', 'true');
    skipLoader();
  };
  
  if (skipBtn) {
    skipBtn.addEventListener('click', handleSkip);
    // Show skip after 1s
    setTimeout(() => {
      skipBtn.style.opacity = '1';
      skipBtn.style.pointerEvents = 'auto';
    }, 1000);
  }

  // Prefers reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    handleSkip();
    return;
  }

  // Three.js Loading Manager (attached to window so scene.js can use it)
  
  
  window.THREE_MANAGER.onProgress = function(url, itemsLoaded, itemsTotal) {
    const percent = Math.floor((itemsLoaded / itemsTotal) * 100);
    if (percentText) percentText.innerText = percent + '%';
  };

  window.THREE_MANAGER.onLoad = function() {
    // Assets loaded, trigger sequence
    if (percentText) percentText.innerText = '100%';
    
    // Animate rocket up
    if (rocket) {
      rocket.style.transform = 'translateY(-150vh)';
      rocket.style.transition = 'transform 1.5s cubic-bezier(0.5, 0, 0.2, 1)';
    }

    // Telescope transition
    setTimeout(() => {
      if (telescopeMask) {
        telescopeMask.style.clipPath = 'circle(100% at 50% 50%)';
        telescopeMask.style.transition = 'clip-path 1.5s cubic-bezier(0.7, 0, 0.3, 1)';
      }
      
      // Fade out loader UI entirely
      setTimeout(() => {
        loaderUi.style.opacity = '0';
        loaderUi.style.pointerEvents = 'none';
        sessionStorage.setItem('v3_loaded', 'true');
        setTimeout(() => loaderUi.style.display = 'none', 500);
        
        // Dispatch event that loader is done so scene/slides can start
        window.dispatchEvent(new Event('loaderComplete'));
      }, 1000);
    }, 1000);
  };
});

function skipLoader() {
  const loaderUi = document.getElementById('loader-ui');
  if (loaderUi) {
    loaderUi.style.display = 'none';
  }
  // Dispatch immediately
  setTimeout(() => window.dispatchEvent(new Event('loaderComplete')), 50);
}
