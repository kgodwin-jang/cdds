const preloader = document.getElementById('preloader');
const header = document.querySelector('.site-header');
const navToggle = document.querySelector('.nav-toggle');
const primaryNav = document.querySelector('.primary-nav');
const backToTop = document.querySelector('.back-to-top');
const tabs = document.querySelectorAll('.tab');
const serviceCards = document.querySelectorAll('.service-card');
const testimonials = document.querySelectorAll('.testimonial');
const testimonialContainer = document.querySelector('.testimonial-carousel');
const accordions = document.querySelectorAll('.accordion-item');
const contactForm = document.querySelector('.contact-form');
const themeToggle = document.querySelector('.toggle-theme');
const counts = document.querySelectorAll('.count');
let testimonialIndex = 0;
let testimonialInterval;

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  sessionStorage.setItem('cdds-theme', theme);
  themeToggle.textContent = theme === 'dark' ? '🌙' : '☀️';
}

function initTheme() {
  const storedTheme = sessionStorage.getItem('cdds-theme');
  setTheme(storedTheme === 'dark' ? 'dark' : 'light');
}

function toggleNav() {
  const expanded = navToggle.getAttribute('aria-expanded') === 'true';
  navToggle.setAttribute('aria-expanded', String(!expanded));
  primaryNav.classList.toggle('open');
}

function sanitizeInput(value) {
  return value.replace(/<[^>]*>/g, '').replace(/script/gi, '');
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function closeMobileNav() {
  primaryNav.classList.remove('open');
  navToggle.setAttribute('aria-expanded', 'false');
}

function updateHeader() {
  if (window.scrollY > 24) {
    header.classList.add('shrink');
  } else {
    header.classList.remove('shrink');
  }
}

function handleBackToTop() {
  backToTop.style.display = window.scrollY > 400 ? 'grid' : 'none';
}

function smoothReveal(entries, observer) {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('reveal-visible');
      observer.unobserve(entry.target);
    }
  });
}

function initReveal() {
  const observer = new IntersectionObserver(smoothReveal, { threshold: 0.18 });
  document.querySelectorAll('.section, .service-card, .project-card, .testimonial, .price-card, .blog-card, .contact-form, .accordion-item').forEach((element) => {
    element.classList.add('reveal');
    observer.observe(element);
  });
}

function filterServices(filter) {
  tabs.forEach((tab) => tab.classList.toggle('active', tab.dataset.filter === filter));
  serviceCards.forEach((card) => {
    const categories = card.dataset.category.split(' ');
    card.style.display = filter === 'all' || categories.includes(filter) ? 'grid' : 'none';
  });
}

function showTestimonial(index) {
  testimonials.forEach((slide) => slide.classList.toggle('active', Number(slide.dataset.index) === index));
}

function nextTestimonial() {
  testimonialIndex = (testimonialIndex + 1) % testimonials.length;
  showTestimonial(testimonialIndex);
}

function startTestimonialCycle() {
  testimonialInterval = setInterval(nextTestimonial, 5000);
}

function stopTestimonialCycle() {
  clearInterval(testimonialInterval);
}

function closeAccordion(activeItem) {
  accordions.forEach((item) => {
    if (item !== activeItem) {
      item.classList.remove('open');
      item.querySelector('.accordion-toggle').setAttribute('aria-expanded', 'false');
    }
  });
}

function animateCounts(entries, observer) {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      counts.forEach((count) => {
        const target = Number(count.dataset.target);
        let current = 0;
        const step = Math.max(1, Math.floor(target / 80));
        const interval = setInterval(() => {
          current += step;
          if (current >= target) {
            count.textContent = `${target}${target < 100 ? '+' : ''}`;
            clearInterval(interval);
            return;
          }
          count.textContent = `${current}${target < 100 ? '+' : ''}`;
        }, 20);
      });
      observer.disconnect();
    }
  });
}

function initCounters() {
  const observer = new IntersectionObserver(animateCounts, { threshold: 0.5 });
  observer.observe(document.querySelector('.stats-bar'));
}

function validateForm() {
  const name = sanitizeInput(contactForm.name.value.trim());
  const email = sanitizeInput(contactForm.email.value.trim());
  const project = contactForm.project.value;
  const message = sanitizeInput(contactForm.message.value.trim());
  if (!name || !email || !project || !message) {
    return { valid: false, message: 'Please complete all fields before sending.' };
  }
  if (!validateEmail(email)) {
    return { valid: false, message: 'Please enter a valid email address.' };
  }
  return { valid: true, data: { name, email, project, message } };
}

function handleFormSubmit(event) {
  event.preventDefault();
  const status = contactForm.querySelector('.form-status');
  const submitButton = contactForm.querySelector('button[type="submit"]');
  const result = validateForm();
  if (!result.valid) {
    status.textContent = result.message;
    status.style.color = 'var(--color-highlight)';
    return;
  }
  submitButton.disabled = true;
  submitButton.textContent = 'Sending...';
  status.style.color = 'var(--color-primary)';
  status.textContent = 'Your request has been received. We will contact you shortly.';
  setTimeout(() => {
    submitButton.disabled = false;
    submitButton.textContent = 'Submit Request';
    contactForm.reset();
  }, 3000);
}

function initEventListeners() {
  navToggle.addEventListener('click', toggleNav);
  document.querySelectorAll('.primary-nav a').forEach((link) => {
    link.addEventListener('click', () => closeMobileNav());
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && primaryNav.classList.contains('open')) {
      closeMobileNav();
    }
  });
  document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768 && primaryNav.classList.contains('open') && !e.target.closest('header')) {
      closeMobileNav();
    }
  });
  themeToggle.addEventListener('click', () => setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'));
  window.addEventListener('scroll', () => {
    updateHeader();
    handleBackToTop();
  });
  backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  tabs.forEach((tab) => tab.addEventListener('click', () => filterServices(tab.dataset.filter)));
  testimonialContainer.addEventListener('mouseenter', stopTestimonialCycle);
  testimonialContainer.addEventListener('mouseleave', startTestimonialCycle);
  accordions.forEach((item) => {
    const toggle = item.querySelector('.accordion-toggle');
    toggle.addEventListener('click', () => {
      const isOpen = item.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
      closeAccordion(isOpen ? item : null);
    });
  });
  contactForm.addEventListener('submit', handleFormSubmit);
}

window.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initReveal();
  initCounters();
  initEventListeners();
  filterServices('all');
  showTestimonial(testimonialIndex);
  startTestimonialCycle();
  setTimeout(() => {
    preloader.style.opacity = '0';
    preloader.style.visibility = 'hidden';
  }, 1000);
});
