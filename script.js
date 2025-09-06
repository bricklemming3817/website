// Tiny enhancements only. Works fine without JS.

// Set current year in footer
const yearEl = document.getElementById('year');
if (yearEl) {
  yearEl.textContent = String(new Date().getFullYear());
}

// Mobile menu toggle with ARIA
const toggle = document.querySelector('.menu-toggle');
const nav = document.getElementById('nav');
if (toggle && nav) {
  const closeMenu = () => toggle.setAttribute('aria-expanded', 'false');
  const openMenu = () => toggle.setAttribute('aria-expanded', 'true');
  const isOpen = () => toggle.getAttribute('aria-expanded') === 'true';

  toggle.addEventListener('click', () => {
    isOpen() ? closeMenu() : openMenu();
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen()) {
      closeMenu();
      toggle.focus();
    }
  });

  // Close when clicking a nav link (on small screens)
  nav.addEventListener('click', (e) => {
    const t = e.target;
    if (t && t instanceof HTMLElement && t.closest('a')) {
      closeMenu();
    }
  });
}

// Smooth scroll respecting reduced motion
const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reduceMotion) {
  document.addEventListener('click', (e) => {
    const a = e.target instanceof Element ? e.target.closest('a[href^="#"]') : null;
    if (!a) return;
    const hash = a.getAttribute('href');
    if (!hash || hash.length <= 1) return;
    const target = document.getElementById(hash.slice(1));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.pushState(null, '', hash);
    target.focus({ preventScroll: true });
  });
}

// Number guessing mini game
const guessInput = document.getElementById('guess-input');
const guessBtn = document.getElementById('guess-button');
const resetBtn = document.getElementById('reset-button');
const gameMsg = document.getElementById('game-message');
if (guessInput && guessBtn && resetBtn && gameMsg) {
  let secret = Math.floor(Math.random() * 10) + 1;
  const reset = () => {
    secret = Math.floor(Math.random() * 10) + 1;
    guessInput.value = '';
    gameMsg.textContent = '';
    guessBtn.disabled = false;
    resetBtn.hidden = true;
    guessInput.focus();
  };
  guessBtn.addEventListener('click', () => {
    const guess = Number(guessInput.value);
    if (!guess || guess < 1 || guess > 10) {
      gameMsg.textContent = 'Enter a number from 1 to 10.';
      return;
    }
    if (guess === secret) {
      gameMsg.textContent = 'You got it!';
      guessBtn.disabled = true;
      resetBtn.hidden = false;
      resetBtn.focus();
    } else {
      gameMsg.textContent = guess < secret ? 'Too low.' : 'Too high.';
    }
  });
  resetBtn.addEventListener('click', reset);
}

