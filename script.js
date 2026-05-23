/* =====================================================================
   CDDS - Complete Digital Design Solutions
   Production-Ready JavaScript Application
   ===================================================================== */

// ====================== OBSERVER & INTERSECTION =====================
/**
 * Intersection Observer for Scroll-Driven Reveals
 * Triggers fade-in and slide-up animations when elements enter viewport
 */
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('reveal');
            // Optional: unobserve after revealing
            revealObserver.unobserve(entry.target);
        }
    });
}, observerOptions);

/**
 * Initialize reveal animations on service cards and portfolio cards
 */
function initializeScrollReveals() {
    const serviceCards = document.querySelectorAll('.service-card');
    const portfolioCards = document.querySelectorAll('.portfolio-card');

    serviceCards.forEach(card => {
        revealObserver.observe(card);
    });

    portfolioCards.forEach(card => {
        revealObserver.observe(card);
    });
}

// ====================== NAVBAR STICKY BEHAVIOR =====================
/**
 * Sticky Navbar Transition
 * Navbar becomes solid white with shadow after scrolling 50px
 */
function initializeStickyNavbar() {
    const navbar = document.getElementById('navbar');
    const scrollThreshold = 50;
    const sections = document.querySelectorAll('section[id]');

    let heroTheme = 'light';

    function getCurrentSection() {
        const probePosition = navbar.offsetHeight + 20;
        let currentSection = 'home';

        sections.forEach(section => {
            const sectionRect = section.getBoundingClientRect();

            if (sectionRect.top <= probePosition && sectionRect.bottom > probePosition) {
                currentSection = section.getAttribute('id');
            }
        });

        return currentSection;
    }

    function applyNavbarTheme() {
        const currentSection = getCurrentSection();
        navbar.dataset.theme = currentSection === 'home' ? heroTheme : 'light';
    }

    function updateNavbarState() {
        const scrollPosition = window.scrollY;

        if (scrollPosition > scrollThreshold) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        applyNavbarTheme();
    }

    const heroImage = new Image();
    heroImage.src = 'assets/hero_bg.png';
    heroImage.onload = () => {
        try {
            const canvas = document.createElement('canvas');
            const sampleSize = 24;
            canvas.width = sampleSize;
            canvas.height = sampleSize;

            const context = canvas.getContext('2d', { willReadFrequently: true });
            context.drawImage(heroImage, 0, 0, sampleSize, sampleSize);

            const imageData = context.getImageData(0, 0, sampleSize, sampleSize).data;
            let totalLuminance = 0;
            let pixelCount = 0;

            for (let index = 0; index < imageData.length; index += 4) {
                const red = imageData[index];
                const green = imageData[index + 1];
                const blue = imageData[index + 2];
                const alpha = imageData[index + 3] / 255;

                if (alpha > 0) {
                    totalLuminance += (0.2126 * red + 0.7152 * green + 0.0722 * blue) * alpha;
                    pixelCount += 1;
                }
            }

            const averageLuminance = pixelCount ? totalLuminance / pixelCount : 255;
            heroTheme = averageLuminance < 150 ? 'dark' : 'light';
        } catch (error) {
            heroTheme = 'light';
        }

        applyNavbarTheme();
    };
    heroImage.onerror = () => {
        heroTheme = 'light';
        applyNavbarTheme();
    };

    window.addEventListener('scroll', () => {
        const scrollPosition = window.scrollY;

        if (scrollPosition > scrollThreshold) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        applyNavbarTheme();
    });

    window.addEventListener('resize', debounce(applyNavbarTheme, 100));
    updateNavbarState();
}

// ====================== ANIMATED COUNTER =====================
/**
 * Animated Counter Function
 * Counts up numbers from 0 to target value
 */
function animateCounter(element, target, duration = 2000) {
    const start = 0;
    const startTime = Date.now();

    const updateCounter = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function for smooth animation
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        const currentValue = Math.floor(start + (target - start) * easedProgress);

        element.textContent = currentValue;

        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target;
        }
    };

    updateCounter();
}

/**
 * Intersection Observer for Counter Animation
 * Triggers counter animation when metrics section becomes visible
 */
const counterObserverOptions = {
    threshold: 0.5
};

const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.hasAttribute('data-animated')) {
            // Mark as animated to prevent multiple animations
            entry.target.setAttribute('data-animated', 'true');

            // Get all metric values
            const metricValues = entry.target.querySelectorAll('.metric-value');

            metricValues.forEach(metric => {
                const targetValue = parseInt(metric.getAttribute('data-target'));
                animateCounter(metric, targetValue, 2000);
            });

            // Unobserve after animation
            counterObserver.unobserve(entry.target);
        }
    });
}, counterObserverOptions);

/**
 * Initialize counter animations
 */
function initializeCounterAnimation() {
    const metricsDashboard = document.querySelector('.metrics-dashboard');
    if (metricsDashboard) {
        counterObserver.observe(metricsDashboard);
    }
}

// ====================== SMOOTH SCROLL LINKS =====================
/**
 * Smooth scroll to anchors functionality
 */
function initializeSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (event) {
            event.preventDefault();
            const targetId = this.getAttribute('href').slice(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 80; // Account for sticky navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ====================== CONTACT FORM HANDLING =====================
/**
 * Contact Form Submission Handler
 */
function initializeContactForm() {
    const contactForm = document.getElementById('contactForm');

    if (contactForm) {
        contactForm.addEventListener('submit', function (event) {
            event.preventDefault();

            // Get form data
            const formData = new FormData(this);
            const name = formData.get('name');
            const email = formData.get('email');
            const message = formData.get('message');

            // Basic validation
            if (!name || !email || !message) {
                alert('Please fill in all fields');
                return;
            }

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('Please enter a valid email address');
                return;
            }

            // In a real application, you would send this data to a server
            // For now, we'll show a success message
            console.log('Form submitted with:', { name, email, message });

            // Show success feedback
            const submitButton = this.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;

            submitButton.textContent = 'Message Sent! ✓';
            submitButton.style.backgroundColor = '#0A4174';
            submitButton.disabled = true;

            // Reset after 3 seconds
            setTimeout(() => {
                this.reset();
                submitButton.textContent = originalText;
                submitButton.style.backgroundColor = '';
                submitButton.disabled = false;
            }, 3000);
        });
    }
}

// ====================== NAVIGATION LINKS ACTIVE STATE =====================
/**
 * Update active navigation link based on scroll position
 */
function initializeActiveNavLinks() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let currentSection = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;

            if (window.scrollY >= sectionTop - 200) {
                currentSection = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').slice(1) === currentSection) {
                link.classList.add('active');
            }
        });
    });
}

// ====================== MOBILE MENU =====================
/**
 * Mobile Menu Toggle (for future enhancement)
 */
function initializeMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            // This is a placeholder for mobile menu functionality
            // In a real implementation, you'd show/hide a mobile menu
            console.log('Mobile menu toggle clicked');
        });
    }
}

// ====================== INTERSECTION OBSERVER ANIMATION DELAYS =====================
/**
 * Add staggered animation delays to service cards and portfolio cards
 */
function addAnimationDelays() {
    const serviceCards = document.querySelectorAll('.service-card');
    const portfolioCards = document.querySelectorAll('.portfolio-card');

    // Add staggered delays to service cards
    serviceCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.15}s`;
    });

    // Add staggered delays to portfolio cards
    portfolioCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
    });
}

// ====================== PARALLAX EFFECT (Optional Enhancement) =====================
/**
 * Simple parallax scroll effect for hero section
 */
function initializeParallaxEffect() {
    const hero = document.querySelector('.hero');

    window.addEventListener('scroll', () => {
        const scrollPosition = window.scrollY;
        if (hero) {
            hero.style.backgroundPosition = `center ${scrollPosition * 0.5}px`;
        }
    });
}

// ====================== KEYBOARD ACCESSIBILITY =====================
/**
 * Keyboard navigation enhancements
 */
function initializeKeyboardAccessibility() {
    // Focus management for buttons
    const buttons = document.querySelectorAll('button, a.btn');

    buttons.forEach(button => {
        button.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                button.click();
            }
        });
    });
}

// ====================== PERFORMANCE OPTIMIZATION =====================
/**
 * Passive event listeners for scroll performance
 */
function optimizeScrollPerformance() {
    // Use passive event listeners for better scroll performance
    let ticking = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                // Scroll-dependent updates happen here
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
}

// ====================== INITIALIZATION =====================
/**
 * Initialize all functionality when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('CDDS Portal - Initializing...');

    // Initialize all components
    initializeScrollReveals();
    initializeStickyNavbar();
    initializeCounterAnimation();
    initializeSmoothScroll();
    initializeContactForm();
    initializeActiveNavLinks();
    initializeMobileMenu();
    addAnimationDelays();
    initializeKeyboardAccessibility();
    optimizeScrollPerformance();

    // Optional: Uncomment for parallax effect
    // initializeParallaxEffect();

    console.log('CDDS Portal - All systems initialized ✓');
});

// ====================== UTILITY FUNCTIONS =====================
/**
 * Utility: Debounce function for resize and other frequent events
 */
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

/**
 * Utility: Check if element is in viewport
 */
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

/**
 * Utility: Throttle function for performance-critical events
 */
function throttle(func, limit) {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
}
