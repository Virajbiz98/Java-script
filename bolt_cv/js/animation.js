document.addEventListener('DOMContentLoaded', function() {
  // Page load animations
  animatePageLoad();
  
  // Initialize loading spinner
  initLoadingSpinner();
});

// Page load sequence animation
function animatePageLoad() {
  // First, make the body visible
  document.body.style.opacity = '1';
  
  // Get all elements that need to appear in sequence
  const hero = document.querySelector('.hero');
  const heroContent = document.querySelector('.hero-content');
  const heroImage = document.querySelector('.hero-image');
  
  if (hero && heroContent && heroImage) {
    // Add visible class with delay to create sequence
    setTimeout(() => {
      heroContent.classList.add('visible');
    }, 300);
    
    setTimeout(() => {
      heroImage.classList.add('visible');
    }, 600);
  }
}

// Loading spinner initialization
function initLoadingSpinner() {
  // Create a loading spinner element
  const spinner = document.createElement('div');
  spinner.className = 'loading-spinner';
  
  // Keep track of active spinners
  const activeSpinners = new Set();
  
  // Function to show the spinner
  window.showLoading = function(element, text = 'Loading...') {
    if (!element) return;
    
    // Store original content
    const originalContent = element.innerHTML;
    element.dataset.originalContent = originalContent;
    
    // Create a new spinner instance
    const spinnerInstance = spinner.cloneNode();
    activeSpinners.add(spinnerInstance);
    
    // Set loading state
    element.innerHTML = '';
    element.appendChild(spinnerInstance);
    element.appendChild(document.createTextNode(' ' + text));
    element.disabled = true;
    
    return {
      done: function(newText = null, delay = 0) {
        setTimeout(() => {
          if (newText) {
            element.innerHTML = newText;
          } else {
            element.innerHTML = element.dataset.originalContent;
          }
          element.disabled = false;
          
          // Cleanup spinner
          activeSpinners.delete(spinnerInstance);
          if (spinnerInstance.parentNode) {
            spinnerInstance.remove();
          }
        }, delay);
      }
    };
  };
  
  // Cleanup function for page unload
  window.addEventListener('unload', () => {
    activeSpinners.forEach(spinner => {
      if (spinner.parentNode) {
        spinner.remove();
      }
    });
    activeSpinners.clear();
  });
}

// Animation for the burger menu
function animateBurger() {
  const burger = document.querySelector('.burger');
  
  if (!burger) return;
  
  burger.addEventListener('click', function() {
    this.classList.toggle('active');
    
    // Animate the burger spans
    const spans = this.querySelectorAll('span');
    
    if (this.classList.contains('active')) {
      // Animate to X
      spans[0].style.transform = 'translateY(9px) rotate(45deg)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'translateY(-9px) rotate(-45deg)';
    } else {
      // Reset
      spans[0].style.transform = 'none';
      spans[1].style.opacity = '1';
      spans[2].style.transform = 'none';
    }
  });
}

// Parallax effect for hero section
function initParallax() {
  const hero = document.querySelector('.hero');
  
  if (!hero) return;
  
  window.addEventListener('scroll', function() {
    const scrollPosition = window.scrollY;
    hero.style.backgroundPositionY = scrollPosition * 0.5 + 'px';
  });
}

// Button hover effects
function initButtonEffects() {
  const buttons = document.querySelectorAll('.cta-button');
  
  buttons.forEach(button => {
    button.addEventListener('mouseenter', function(e) {
      // Create ripple element
      const ripple = document.createElement('span');
      ripple.classList.add('button-ripple');
      
      // Set position
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      
      // Add to button
      button.appendChild(ripple);
      
      // Remove after animation
      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
  });
}