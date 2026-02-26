/**
 * Bazerk Off Road — main.js
 * - Mobile nav toggle
 * - Smooth-scroll (polyfill for older Safari)
 * - Active nav highlighting on scroll
 * - Contact form handling via Formspree
 * - Footer copyright year
 */

(function () {
  'use strict';

  /* ---- Copyright year ---- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---- Mobile menu toggle ---- */
  const menuToggle = document.getElementById('menu-toggle');
  const mainNav    = document.getElementById('main-nav');

  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', function () {
      const isOpen = mainNav.classList.toggle('is-open');
      menuToggle.classList.toggle('is-open', isOpen);
      menuToggle.setAttribute('aria-expanded', String(isOpen));
    });

    // Close menu when a nav link is clicked
    mainNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mainNav.classList.remove('is-open');
        menuToggle.classList.remove('is-open');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Close menu on outside click
    document.addEventListener('click', function (e) {
      if (!menuToggle.contains(e.target) && !mainNav.contains(e.target)) {
        mainNav.classList.remove('is-open');
        menuToggle.classList.remove('is-open');
        menuToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---- Smooth-scroll for anchor links (belt-and-suspenders for older browsers) ---- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href').slice(1);
      if (!targetId) return;

      const target = document.getElementById(targetId);
      if (!target) return;

      e.preventDefault();

      const headerHeight = document.querySelector('.site-header')
        ? document.querySelector('.site-header').offsetHeight
        : 0;

      const targetTop = target.getBoundingClientRect().top + window.scrollY - headerHeight - 8;

      window.scrollTo({ top: targetTop, behavior: 'smooth' });
    });
  });

  /* ---- Active nav link on scroll (Intersection Observer) ---- */
  const sections  = document.querySelectorAll('main section[id]');
  const navLinks  = document.querySelectorAll('.main-nav a[href^="#"]');

  if (sections.length && navLinks.length) {
    const observerOptions = {
      rootMargin: '-30% 0px -60% 0px',
      threshold: 0,
    };

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          navLinks.forEach(function (link) {
            const href = link.getAttribute('href').slice(1);
            if (href === entry.target.id) {
              link.classList.add('is-active');
            } else {
              link.classList.remove('is-active');
            }
          });
        }
      });
    }, observerOptions);

    sections.forEach(function (section) { observer.observe(section); });
  }

  /* ---- Contact form — Formspree AJAX submission ---- */
  const form       = document.getElementById('contact-form');
  const statusEl   = document.getElementById('form-status');
  const submitBtn  = document.getElementById('form-submit');

  if (form && statusEl && submitBtn) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      // Basic client-side validation
      const name    = form.querySelector('#name');
      const email   = form.querySelector('#email');
      const message = form.querySelector('#message');

      if (!name.value.trim()) {
        showStatus('Please enter your name.', 'error');
        name.focus();
        return;
      }

      if (!email.value.trim() || !isValidEmail(email.value)) {
        showStatus('Please enter a valid email address.', 'error');
        email.focus();
        return;
      }

      if (!message.value.trim()) {
        showStatus('Please enter a message.', 'error');
        message.focus();
        return;
      }

      // Check that Formspree ID has been configured
      const action = form.getAttribute('action');
      if (action.includes('YOUR_FORM_ID')) {
        showStatus(
          'Contact form not yet configured. Please call us directly at 435-555-0000.',
          'error'
        );
        return;
      }

      // Submit via fetch
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';
      showStatus('', '');

      try {
        const data = new FormData(form);
        const response = await fetch(action, {
          method:  'POST',
          body:    data,
          headers: { Accept: 'application/json' },
        });

        if (response.ok) {
          showStatus(
            'Message sent! We\'ll be in touch soon. You can also reach us at 435-555-0000.',
            'success'
          );
          form.reset();
        } else {
          const json = await response.json().catch(() => ({}));
          const errMsg = (json.errors && json.errors.map(function (e) { return e.message; }).join(', '))
            || 'Something went wrong. Please call us directly at 435-555-0000.';
          showStatus(errMsg, 'error');
        }
      } catch (err) {
        showStatus(
          'Unable to send message. Please call us directly at 435-555-0000.',
          'error'
        );
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Message';
      }
    });
  }

  function showStatus(msg, type) {
    if (!statusEl) return;
    statusEl.textContent = msg;
    statusEl.className   = 'form-status' + (type ? ' ' + type : '');
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

})();
