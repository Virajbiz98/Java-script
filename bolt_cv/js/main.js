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
  let currentSlide = 0;
  const testimonialTrack = document.querySelector('.testimonial-track');
  const testimonialCards = document.querySelectorAll('.testimonial-card');
  const dots = document.querySelectorAll('.dot');
  const prevButton = document.querySelector('.slider-prev');
  const nextButton = document.querySelector('.slider-next');
  
  if (!testimonialTrack || testimonialCards.length === 0) return;
  
  // Set initial width for testimonial track
  updateTrackWidth();
  
  // Update on window resize
  window.addEventListener('resize', updateTrackWidth);
  
  // Previous slide button
  prevButton.addEventListener('click', function() {
    currentSlide = (currentSlide > 0) ? currentSlide - 1 : testimonialCards.length - 1;
    updateSlider();
  });
  
  // Next slide button
  nextButton.addEventListener('click', function() {
    currentSlide = (currentSlide < testimonialCards.length - 1) ? currentSlide + 1 : 0;
    updateSlider();
  });
  
  // Dot navigation
  dots.forEach((dot, index) => {
    dot.addEventListener('click', function() {
      currentSlide = index;
      updateSlider();
    });
  });
  
  // Auto advance slides
  let slideInterval = setInterval(nextSlide, 5000);
  
  // Reset interval on manual navigation
  prevButton.addEventListener('click', resetInterval);
  nextButton.addEventListener('click', resetInterval);
  dots.forEach(dot => {
    dot.addEventListener('click', resetInterval);
  });
  
  function nextSlide() {
    currentSlide = (currentSlide < testimonialCards.length - 1) ? currentSlide + 1 : 0;
    updateSlider();
  }
  
  function resetInterval() {
    clearInterval(slideInterval);
    slideInterval = setInterval(nextSlide, 5000);
  }
  
  function updateSlider() {
    // Update track position
    testimonialTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
    
    // Update active dot
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === currentSlide);
    });
  }
  
  function updateTrackWidth() {
    // Set the width of track and cards for responsive layout
    const containerWidth = testimonialTrack.parentElement.clientWidth;
    testimonialTrack.style.width = `${containerWidth * testimonialCards.length}px`;
    
    testimonialCards.forEach(card => {
      card.style.width = `${containerWidth}px`;
    });
    
    // Update slider position for current slide
    testimonialTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
  }
}

// FAQ Accordion
function initFAQAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    
    question.addEventListener('click', () => {
      // Toggle current item
      item.classList.toggle('active');
      
      // Optional: Close other items
      faqItems.forEach(otherItem => {
        if (otherItem !== item && otherItem.classList.contains('active')) {
          otherItem.classList.remove('active');
        }
      });
    });
  });
}

// Sticky Navigation with Background Blur
function initStickyNav() {
  const navbar = document.querySelector('.navbar');
  const heroSection = document.querySelector('.hero');
  
  if (!navbar || !heroSection) return;
  
  const heroHeight = heroSection.offsetHeight;
  const navHeight = navbar.offsetHeight;
  
  function updateNavbar() {
    if (window.scrollY > navHeight) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }
  
  // Initial check
  updateNavbar();
  
  // Check on scroll
  window.addEventListener('scroll', updateNavbar);
}