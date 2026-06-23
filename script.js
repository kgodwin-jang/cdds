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
const toastContainer = document.getElementById('toast-container');
const themeToggle = document.querySelector('.toggle-theme');
const counts = document.querySelectorAll('.count');
let testimonialIndex = 0;
let testimonialInterval;

// Set dynamic copyright year
function setCurrentYear() {
  const copyrightYearEl = document.getElementById('copyright-year');
  if (copyrightYearEl) {
    copyrightYearEl.textContent = new Date().getFullYear();
  }
}

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  sessionStorage.setItem('cdds-theme', theme);
  themeToggle.textContent = theme === 'dark' ? '🌙' : '☀️';
}

function initTheme() {
  const storedTheme = sessionStorage.getItem('cdds-theme');
  setTheme(storedTheme === 'dark' ? 'dark' : 'light');
  setCurrentYear();
}

function showToast(message, type = 'info', duration = 4500) {
  if (!toastContainer) return;
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.textContent = '×';
  closeButton.addEventListener('click', () => {
    toast.classList.remove('visible');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
  });

  toast.appendChild(closeButton);
  toastContainer.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('visible'));

  const timeout = setTimeout(() => {
    toast.classList.remove('visible');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
  }, duration);

  toast.addEventListener('mouseenter', () => clearTimeout(timeout));
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

// Modal handling: move the existing contact form into a modal when opened,
// restore it to its original place on close. This preserves event listeners.
let contactFormOriginalParent = null;
let contactFormNextSibling = null;
function openContactModal() {
  const modal = document.getElementById('contact-modal');
  if (!modal || !contactForm) return;
  // remember original location so we can restore it
  if (!contactFormOriginalParent) {
    contactFormOriginalParent = contactForm.parentNode;
    contactFormNextSibling = contactForm.nextSibling;
  }
  const modalBody = modal.querySelector('.modal-body');
  if (modalBody && contactForm) {
    modalBody.appendChild(contactForm);
    // Clear any previous status or inline errors when opening the modal
    const status = contactForm.querySelector('.form-status');
    if (status) {
      status.textContent = '';
      status.style.color = '';
    }
    ['error-email','error-phone','error-project','error-message'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.textContent = '';
    });
    ['#email','#phone','#project','#message'].forEach((sel) => {
      const el = contactForm.querySelector(sel);
      if (el) el.classList.remove('input-error');
    });
  }
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  // prevent background scrolling
  document.body.style.overflow = 'hidden';
  // attach close handlers if not already attached
  const closeBtn = modal.querySelector('.modal-close');
  if (closeBtn && !closeBtn._hasHandler) {
    closeBtn.addEventListener('click', closeContactModal);
    closeBtn._hasHandler = true;
  }
  // close when clicking outside the modal content
  if (!modal._overlayHandler) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeContactModal();
    });
    modal._overlayHandler = true;
  }
  // close on Escape
  if (!modal._escHandler) {
    modal._escHandler = (e) => { if (e.key === 'Escape') closeContactModal(); };
    document.addEventListener('keydown', modal._escHandler);
    modal._escHandlerAttached = true;
  }
}

function closeContactModal() {
  const modal = document.getElementById('contact-modal');
  if (!modal || !contactForm) return;
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  // restore form to original location
  if (contactFormOriginalParent) {
    if (contactFormNextSibling && contactFormNextSibling.parentNode === contactFormOriginalParent) {
      contactFormOriginalParent.insertBefore(contactForm, contactFormNextSibling);
    } else {
      contactFormOriginalParent.appendChild(contactForm);
    }
  }
  document.body.style.overflow = '';
}

function validateForm() {
  const email = sanitizeInput(contactForm.email.value.trim());
  const project = contactForm.project.value;
  const message = sanitizeInput(contactForm.message.value.trim());
  if (!email || !project || !message) {
    return { valid: false, message: 'Please complete all fields before sending.' };
  }
  if (!validateEmail(email)) {
    return { valid: false, message: 'Please enter a valid email address.' };
  }
  return { valid: true, data: { email, project, message } };
}

/**
 * Handle contact form submission.
 * - Prevents the default browser submission (stops Formspree redirect).
 * - Performs simple client-side validation for required fields.
 * - Sends the form data to the configured `action` via Fetch API.
 * - Updates the `.form-status` paragraph with success or error messages.
 */
async function handleFormSubmit(event) {
  // Prevent the browser from submitting the form the default way
  event.preventDefault();

  // Locate UI elements we will update
  const status = contactForm.querySelector('.form-status');
  const submitButton = contactForm.querySelector('button[type="submit"]');

  // --- Custom validation (ensure required fields are present) ---
  const email = sanitizeInput(contactForm.email.value.trim());
  const project = contactForm.project.value;
  const phone = sanitizeInput((contactForm.phone && contactForm.phone.value || '').trim());
  const message = sanitizeInput(contactForm.message.value.trim());

  // Clear previous field error states
  const fields = {
    email: contactForm.querySelector('#email'),
    phone: contactForm.querySelector('#phone'),
    project: contactForm.querySelector('#project'),
    message: contactForm.querySelector('#message'),
  };
  Object.values(fields).forEach((el) => el && el.classList.remove('input-error'));

  // Inline field error elements
  const errors = {
    email: document.getElementById('error-email'),
    phone: document.getElementById('error-phone'),
    project: document.getElementById('error-project'),
    message: document.getElementById('error-message'),
  };
  Object.values(errors).forEach((el) => el && (el.textContent = ''));

  // Honeypot check: if the hidden _gotcha field is filled, quietly abort
  const honeypot = contactForm.querySelector('input[name="_gotcha"]');
  if (honeypot && honeypot.value.trim() !== '') {
    const msg = 'Submission blocked.';
    status.textContent = msg;
    status.style.color = 'var(--color-highlight)';
    // Do not show a success toast for bots; show a subtle info toast
    showToast('Automated submission detected.', 'info');
    return;
  }

  // Ensure all required fields are present first
  if (!email || !phone || !project || !message) {
    const missing = [];
    if (!email) { fields.email && fields.email.classList.add('input-error'); missing.push(fields.email); }
    if (!phone) { fields.phone && fields.phone.classList.add('input-error'); missing.push(fields.phone); }
    if (!project) { fields.project && fields.project.classList.add('input-error'); missing.push(fields.project); }
    if (!message) { fields.message && fields.message.classList.add('input-error'); missing.push(fields.message); }
    const msg = 'Please complete all fields before sending.';
    status.textContent = msg;
    status.style.color = 'var(--color-highlight)';
    showToast(msg, 'error');
    // set inline errors for missing fields
    if (!email && errors.email) errors.email.textContent = 'Required';
    if (!phone && errors.phone) errors.phone.textContent = 'Required';
    if (!project && errors.project) errors.project.textContent = 'Required';
    if (!message && errors.message) errors.message.textContent = 'Required';
    if (missing.length) missing[0].focus();
    return;
  }

  // Additional validation rules: minimum lengths
  // Name field removed — no additional name validation

  if (message.length < 10) {
    const msg = 'Message must be at least 10 characters.';
    status.textContent = msg;
    status.style.color = 'var(--color-highlight)';
    fields.message && fields.message.classList.add('input-error');
    showToast(msg, 'error');
    if (errors.message) errors.message.textContent = msg;
    fields.message && fields.message.focus();
    return;
  }
  if (!validateEmail(email)) {
    const msg = 'Please enter a valid email address.';
    status.textContent = msg;
    status.style.color = 'var(--color-highlight)';
    fields.email && fields.email.classList.add('input-error');
    showToast(msg, 'error');
    if (errors.email) errors.email.textContent = msg;
    fields.email && fields.email.focus();
    return;
  }

  // Basic phone validation: ensure there are at least 6 digits
  const phoneDigits = phone.replace(/\D/g, '');
  if (phoneDigits.length < 6) {
    const msg = 'Please enter a valid phone number.';
    status.textContent = msg;
    status.style.color = 'var(--color-highlight)';
    fields.phone && fields.phone.classList.add('input-error');
    showToast(msg, 'error');
    if (errors.phone) errors.phone.textContent = msg;
    fields.phone && fields.phone.focus();
    return;
  }

  // Prepare UI for submission
  submitButton.disabled = true;
  submitButton.textContent = 'Sending...';
  status.style.color = 'var(--color-primary)';
  status.textContent = 'Submitting your request...';
  // Build FormData from the form (keeps field names intact)
  const formData = new FormData(contactForm);

  // Network safety: use AbortController for timeouts and retry once on transient failures
  const MAX_TIMEOUT = 10000; // 10s
  const MAX_ATTEMPTS = 2;
  let attempt = 0;
  let lastError = null;

  while (attempt < MAX_ATTEMPTS) {
    attempt += 1;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), MAX_TIMEOUT);

    try {
      const response = await fetch(contactForm.action, {
        method: contactForm.method || 'POST',
        headers: { Accept: 'application/json' },
        body: formData,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      // Re-enable the submit button now we have a response
      submitButton.disabled = false;
      submitButton.textContent = 'Submit Request';

      if (response.ok) {
        status.textContent = 'Your request has been received. We will contact you shortly.';
        status.style.color = 'var(--color-primary)';
        showToast('Request sent successfully.', 'success');
        contactForm.reset();
        Object.values(fields).forEach((el) => el && el.classList.remove('input-error'));
        Object.values(errors).forEach((el) => el && (el.textContent = ''));
        return;
      }

      // Non-OK response: attempt to parse and show a helpful message
      let data = {};
      try { data = await response.json(); } catch (e) { /* ignore */ }
      const errorMessage = data.error || data.message || 'Submission failed. Please try again.';
      status.textContent = errorMessage;
      status.style.color = 'var(--color-highlight)';
      showToast(errorMessage, 'error');
      return;
    } catch (err) {
      clearTimeout(timeoutId);
      lastError = err;
      // If this was an abort (timeout), create a clearer message
      const isTimeout = err.name === 'AbortError';
      if (attempt < MAX_ATTEMPTS) {
        showToast(isTimeout ? 'Request timed out, retrying...' : 'Network error, retrying...', 'info', 1800);
        // small backoff before retrying
        await new Promise((r) => setTimeout(r, 700));
        continue;
      }

      // Exhausted retries — surface the error
      submitButton.disabled = false;
      submitButton.textContent = 'Submit Request';
      const errorMessage = isTimeout ? 'Request timed out. Check your connection and try again.' : (err.message || 'Unable to send form. Check your connection.');
      status.textContent = errorMessage;
      status.style.color = 'var(--color-highlight)';
      showToast(errorMessage, 'error');
      return;
    }
  }
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

  // Prefill contact form when 'Learn More' links are clicked
  document.querySelectorAll('a[data-project]').forEach((link) => {
    link.addEventListener('click', (e) => {
      // Prevent default anchor jump; we'll scroll after prefilling
      e.preventDefault();
      const projectType = link.dataset.project;
      const projectSelect = contactForm.querySelector('#project');
      if (projectSelect) {
        // Try to select an option matching the data attribute value
        const option = Array.from(projectSelect.options).find(o => o.value === projectType);
        if (option) {
          projectSelect.value = projectType;
          projectSelect.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
          // Prepare a friendly default message and open the modal
          const projectName = link.dataset.projectName || projectType;
          const messageField = contactForm.querySelector('#message');
          if (messageField) {
            const defaultMsg = `Hello — I'm interested in the "${projectName}" project. Please send pricing, timelines, and next steps so we can get started.`;
            messageField.value = defaultMsg;
          }
          // Open contact form in a modal and focus the first field; show toast
          openContactModal();
          const firstField = contactForm.querySelector('input, select, textarea, button');
          const projectLabels = {
            static: 'Static Website',
            dynamic: 'Dynamic Web App',
            ecommerce: 'E-Commerce Platform',
            mobile: 'Mobile Application',
            security: 'Security Audit',
            seo: 'SEO & Growth'
          };
          const label = projectLabels[projectType] || projectName || 'your selected project';
          setTimeout(() => {
            if (firstField) firstField.focus();
            if (typeof showToast === 'function') showToast(`Prefilled contact form for ${label}`, 'info', 3000);
          }, 300);
    });
  });

  // Portfolio expand/collapse toggle
  const portfolioGrid = document.getElementById('portfolio-grid');
  const viewAllBtn = document.getElementById('view-all-projects');
  function togglePortfolioExpand() {
    if (!portfolioGrid || !viewAllBtn) return;
    const expanded = portfolioGrid.classList.toggle('expanded');
    // when expanded is true, remove collapsed class; otherwise add it
    portfolioGrid.classList.toggle('collapsed', !expanded);
    viewAllBtn.setAttribute('aria-expanded', String(expanded));
    viewAllBtn.textContent = expanded ? 'Show Less' : 'View All Projects';
    if (expanded) {
      // scroll the portfolio into view so the expanded content is visible
      portfolioGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      // when collapsing, keep user focused on the CTA
      viewAllBtn.focus();
    }
  }
  if (viewAllBtn) viewAllBtn.addEventListener('click', togglePortfolioExpand);
  // Clear inline errors as user types/changes fields
  ['#email', '#phone', '#project', '#message'].forEach((sel) => {
    const el = contactForm.querySelector(sel);
    if (!el) return;
    el.addEventListener('input', () => {
      el.classList.remove('input-error');
      const err = document.getElementById(`error-${el.id}`);
      if (err) err.textContent = '';
    });
    // also clear on change for selects
    el.addEventListener('change', () => {
      el.classList.remove('input-error');
      const err = document.getElementById(`error-${el.id}`);
      if (err) err.textContent = '';
    });
  });
}

window.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initReveal();
  initCounters();
  initEventListeners();
  filterServices('all');
  showTestimonial(testimonialIndex);
  startTestimonialCycle();
  // Ensure the contact form status is empty on load
  if (contactForm) {
    const status = contactForm.querySelector('.form-status');
    if (status) status.textContent = '';
  }
  setTimeout(() => {
    preloader.style.opacity = '0';
    preloader.style.visibility = 'hidden';
  }, 1000);
});
