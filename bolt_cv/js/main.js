document.addEventListener('DOMContentLoaded', function() {
  // Initialize mobile menu
  initMobileMenu();
  
  // Initialize scroll animations
  initScrollAnimations();
  
  // Initialize testimonial slider
  initTestimonialSlider();
  
  // Initialize FAQ accordion
  initFAQAccordion();
  
  // Initialize sticky navigation with background blur
  initStickyNav();
});

// Mobile Menu
function initMobileMenu() {
  const burger = document.querySelector('.burger');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
  const mobileLinks = document.querySelectorAll('.mobile-link, .mobile-cta');
  
  burger.addEventListener('click', function() {
    mobileMenu.classList.toggle('active');
    mobileMenuToggle.classList.toggle('active');
    document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
  });
  
  // Close mobile menu when clicking on a link
  mobileLinks.forEach(link => {
    link.addEventListener('click', function() {
      mobileMenu.classList.remove('active');
      mobileMenuToggle.classList.remove('active');
      document.body.style.overflow = '';
    });
  });
  
  // Close mobile menu when clicking outside
  document.addEventListener('click', function(event) {
    if (!mobileMenu.contains(event.target) && 
        !mobileMenuToggle.contains(event.target) && 
        mobileMenu.classList.contains('active')) {
      mobileMenu.classList.remove('active');
      mobileMenuToggle.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
}

// Scroll Animations
function initScrollAnimations() {
  const animatedElements = document.querySelectorAll('.animate-on-scroll');
  
  // Show elements that are already in view on page load
  checkInView();
  
  // Check elements on scroll
  window.addEventListener('scroll', throttle(checkInView, 200));
  
  function checkInView() {
    const windowHeight = window.innerHeight;
    const windowTop = window.scrollY;
    const windowBottom = windowTop + windowHeight;
    
    animatedElements.forEach(function(element) {
      const elementHeight = element.offsetHeight;
      const elementTop = getOffsetTop(element);
      const elementBottom = elementTop + elementHeight;
      
      // Check if element is in viewport
      if ((elementBottom > windowTop) && (elementTop < windowBottom)) {
        element.classList.add('visible');
      }
    });
  }
  
  function getOffsetTop(element) {
    let offsetTop = 0;
    while(element) {
      offsetTop += element.offsetTop;
      element = element.offsetParent;
    }
    return offsetTop;
  }
  
  // Throttle function to limit how often a function runs
  function throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
}

// Testimonial Slider
function initTestimonialSlider() {
  try {
    let currentSlide = 0;
    const testimonialTrack = document.querySelector('.testimonial-track');
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    const dots = document.querySelectorAll('.dot');
    const prevButton = document.querySelector('.slider-prev');
    const nextButton = document.querySelector('.slider-next');
    
    if (!testimonialTrack || testimonialCards.length === 0) {
      console.warn('Testimonial slider elements not found');
      return;
    }
    
    let slideInterval;
    
    // Set initial width for testimonial track
    updateTrackWidth();
    
    // Update on window resize with debounce
    const debounceResize = debounce(updateTrackWidth, 250);
    window.addEventListener('resize', debounceResize);
    
    // Previous slide button
    if (prevButton) {
      prevButton.addEventListener('click', function() {
        currentSlide = (currentSlide > 0) ? currentSlide - 1 : testimonialCards.length - 1;
        updateSlider();
        resetInterval();
      });
    }
    
    // Next slide button
    if (nextButton) {
      nextButton.addEventListener('click', function() {
        nextSlide();
        resetInterval();
      });
    }
    
    // Dot navigation
    dots.forEach((dot, index) => {
      dot.addEventListener('click', function() {
        currentSlide = index;
        updateSlider();
        resetInterval();
      });
    });
    
    // Auto advance slides
    startAutoSlide();
    
    function startAutoSlide() {
      if (slideInterval) {
        clearInterval(slideInterval);
      }
      slideInterval = setInterval(nextSlide, 5000);
    }
    
    function nextSlide() {
      currentSlide = (currentSlide < testimonialCards.length - 1) ? currentSlide + 1 : 0;
      updateSlider();
    }
    
    function resetInterval() {
      startAutoSlide();
    }
    
    function updateSlider() {
      try {
        // Update track position
        testimonialTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
        
        // Update active dot
        dots.forEach((dot, index) => {
          dot.classList.toggle('active', index === currentSlide);
        });
      } catch (error) {
        console.error('Error updating slider:', error);
      }
    }
    
    function updateTrackWidth() {
      try {
        // Set the width of track and cards for responsive layout
        const containerWidth = testimonialTrack.parentElement.clientWidth;
        testimonialTrack.style.width = `${containerWidth * testimonialCards.length}px`;
        
        testimonialCards.forEach(card => {
          card.style.width = `${containerWidth}px`;
        });
        
        // Update slider position for current slide
        testimonialTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
      } catch (error) {
        console.error('Error updating track width:', error);
      }
    }
    
    // Cleanup function
    return function cleanup() {
      if (slideInterval) {
        clearInterval(slideInterval);
      }
      window.removeEventListener('resize', debounceResize);
    };
  } catch (error) {
    console.error('Error initializing testimonial slider:', error);
  }
}

// Utility function for debouncing
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// FAQ Accordion
function initFAQAccordion() {
  try {
    const faqItems = document.querySelectorAll('.faq-item');
    
    if (!faqItems || faqItems.length === 0) {
      console.warn('FAQ items not found');
      return;
    }
    
    faqItems.forEach(item => {
      try {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        
        if (!question || !answer) {
          console.warn('FAQ question or answer element missing');
          return;
        }
        
        // Store initial height for animation
        answer.style.maxHeight = '0px';
        answer.style.transition = 'max-height 0.3s ease-out';
        
        question.addEventListener('click', () => {
          try {
            // Toggle current item
            const isActive = item.classList.contains('active');
            
            // Optional: Close other items
            faqItems.forEach(otherItem => {
              if (otherItem !== item && otherItem.classList.contains('active')) {
                otherItem.classList.remove('active');
                const otherAnswer = otherItem.querySelector('.faq-answer');
                if (otherAnswer) {
                  otherAnswer.style.maxHeight = '0px';
                }
              }
            });
            
            // Toggle current item
            item.classList.toggle('active');
            if (!isActive) {
              answer.style.maxHeight = answer.scrollHeight + 'px';
            } else {
              answer.style.maxHeight = '0px';
            }
          } catch (error) {
            console.error('Error handling FAQ click:', error);
          }
        });
      } catch (error) {
        console.error('Error setting up FAQ item:', error);
      }
    });
  } catch (error) {
    console.error('Error initializing FAQ accordion:', error);
  }
}

// Sticky Navigation with Background Blur
function initStickyNav() {
  try {
    const navbar = document.querySelector('.navbar');
    const heroSection = document.querySelector('.hero');
    
    if (!navbar) {
      console.warn('Navbar element not found');
      return;
    }
    
    const navHeight = navbar.offsetHeight;
    
    function updateNavbar() {
      try {
        if (window.scrollY > navHeight) {
          if (!navbar.classList.contains('scrolled')) {
            navbar.classList.add('scrolled');
          }
        } else {
          if (navbar.classList.contains('scrolled')) {
            navbar.classList.remove('scrolled');
          }
        }
      } catch (error) {
        console.error('Error updating navbar:', error);
      }
    }
    
    // Initial check
    updateNavbar();
    
    // Throttle scroll event for better performance
    const throttledUpdate = throttle(updateNavbar, 100);
    
    // Check on scroll
    window.addEventListener('scroll', throttledUpdate);
    
    // Cleanup function
    return function cleanup() {
      window.removeEventListener('scroll', throttledUpdate);
    };
  } catch (error) {
    console.error('Error initializing sticky navigation:', error);
  }
}

// Utility function for throttling
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}