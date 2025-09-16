(() => {
  const EDIT_ATTR = 'data-edit-mode';

  let blankEditMode = false;
  const setBlankMode = (on, forced) => {
    blankEditMode = on;
    if (on) {
      document.body.setAttribute('data-edit-blank', 'true');
      if (forced) {
        document.body.setAttribute('data-edit-blank-forced', 'true');
      } else {
        document.body.removeAttribute('data-edit-blank-forced');
      }
    } else {
      document.body.removeAttribute('data-edit-blank');
      document.body.removeAttribute('data-edit-blank-forced');
    }
  };
  const isBodyStructurallyEmpty = () => document.body.children.length === 0 && ((document.body.textContent || '').trim().length === 0);
  const ensureBlankMode = () => {
    if (!blankEditMode && isBodyStructurallyEmpty()) setBlankMode(true, false);
  };

  const inEdit = () => document.body.getAttribute(EDIT_ATTR) === 'on';
  const enable = () => {
    document.body.setAttribute(EDIT_ATTR, 'on');
    document.body.contentEditable = 'true';
    document.body.focus();
    setBlankMode(isBodyStructurallyEmpty(), false);
  };
  const disable = () => {
    document.body.removeAttribute(EDIT_ATTR);
    document.body.contentEditable = 'false';
    setBlankMode(false, false);
  };

  const isInteractive = (el) =>
    !!el.closest('a, button, input, textarea, select, summary, [contenteditable="true"]');

  const TOUCH_ACTIVATE_MOVE_TOLERANCE = 10;
  const touchEditState = {
    pointerId: null,
    x: 0,
    y: 0,
  };
  const clearTouchCandidate = () => {
    touchEditState.pointerId = null;
  };

  // Hidden activation: on touch wait for an intentional tap; desktop still activates immediately
  document.addEventListener(
    'pointerdown',
    (e) => {
      const t = e.target;
      const type = e.pointerType || '';
      const interactive = isInteractive(t);

      if (inEdit()) {
        if ((type === 'touch' || type === 'pen') && interactive) {
          disable();
          clearTouchCandidate();
        }
        return;
      }

      if (type === 'touch' || type === 'pen') {
        if (!interactive) {
          touchEditState.pointerId = e.pointerId;
          touchEditState.x = e.clientX;
          touchEditState.y = e.clientY;
        } else {
          clearTouchCandidate();
        }
        return;
      }

      if (!interactive) {
        clearTouchCandidate();
        enable();
        if (isBodyStructurallyEmpty()) {
          document.body.setAttribute('data-edit-blank-trigger', 'true');
        } else {
          document.body.removeAttribute('data-edit-blank-trigger');
        }
      } else {
        clearTouchCandidate();
      }
      // do not prevent default; we want the caret to appear at click
    },
    true
  );

  document.addEventListener(
    'pointermove',
    (e) => {
      if (touchEditState.pointerId == null || e.pointerId !== touchEditState.pointerId) return;
      if (
        Math.abs(e.clientX - touchEditState.x) > TOUCH_ACTIVATE_MOVE_TOLERANCE ||
        Math.abs(e.clientY - touchEditState.y) > TOUCH_ACTIVATE_MOVE_TOLERANCE
      ) {
        clearTouchCandidate();
      }
    },
    true
  );

  document.addEventListener(
    'pointerup',
    (e) => {
      if (touchEditState.pointerId == null || e.pointerId !== touchEditState.pointerId) return;
      clearTouchCandidate();
      if (inEdit()) return;
      const t = e.target;
      if (isInteractive(t)) return;

      enable();
      if (isBodyStructurallyEmpty()) {
        document.body.setAttribute('data-edit-blank-trigger', 'true');
      } else {
        document.body.removeAttribute('data-edit-blank-trigger');
      }
    },
    true
  );

  document.addEventListener(
    'pointercancel',
    (e) => {
      if (touchEditState.pointerId != null && e.pointerId === touchEditState.pointerId) {
        clearTouchCandidate();
      }
    },
    true
  );

  document.addEventListener(
    'input',
    () => {
      if (!inEdit()) return;
      if (document.body.hasAttribute('data-edit-blank-trigger')) {
        document.body.removeAttribute('data-edit-blank-trigger');
        setBlankMode(true, true);
      } else {
        ensureBlankMode();
      }
    },
    true
  );

  // While editing, prevent navigation by clicking links
  document.addEventListener(
    'click',
    (e) => {
      if (!inEdit()) return;
      const link = e.target.closest('a[href]');
      if (link) e.preventDefault();
    },
    true
  );

  // Also block aux-clicks (middle click) on links during edit mode
  document.addEventListener(
    'auxclick',
    (e) => {
      if (!inEdit()) return;
      const link = e.target.closest('a[href]');
      if (link) e.preventDefault();
    },
    true
  );

  // Optional: allow exiting edit mode with Escape (kept hidden; no UI)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && inEdit()) {
      disable();
    }
  });

  // ——— bottom overscroll easter egg ———
  const state = { revealed: false, touchStartY: null, wheelOverscroll: 0 };
  const TOUCH_REVEAL_DISTANCE = 120;
  const TOUCH_HIDE_DISTANCE = 40;
  const WHEEL_REVEAL_DISTANCE = 160;
  const prefersReduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const docEl = document.documentElement;

  // create secret overlay
  const secret = document.createElement('div');
  secret.className = 'secret-message';
  secret.innerHTML = '<div class="text">after all is said and done, what humans really crave is simply to love and be loved</div>';
  document.body.appendChild(secret);

  const atBottom = () => (window.innerHeight + window.scrollY) >= (docEl.scrollHeight - 1);

  function revealSecret() {
    if (state.revealed) return;
    state.revealed = true;
    if (inEdit()) disable();
    document.body.classList.add('secret-revealed');
  }

  function hideSecret() {
    if (!state.revealed) return;
    state.revealed = false;
    document.body.classList.remove('secret-revealed');
  }

  // desktop overscroll via wheel
  const onWheel = (e) => {
    if (!state.revealed) {
      if (atBottom()) {
        if (e.deltaY > 0) {
          state.wheelOverscroll = Math.max(0, state.wheelOverscroll + e.deltaY);
          if (state.wheelOverscroll >= WHEEL_REVEAL_DISTANCE) {
            e.preventDefault();
            revealSecret();
            state.wheelOverscroll = 0;
          }
          return;
        }
        state.wheelOverscroll = 0;
      } else {
        state.wheelOverscroll = 0;
      }
    }

    if (state.revealed && e.deltaY < 0) {
      e.preventDefault();
      hideSecret();
      state.wheelOverscroll = 0;
    }
  };
  try { document.addEventListener('wheel', onWheel, { passive: false }); } catch { document.addEventListener('wheel', onWheel); }

  // desktop fallback: when revealed, any upward scroll position change restores
  // handles scrollbar drags and non-wheel scrolling
  let lastScrollY = window.scrollY;
  const onScroll = () => {
    const y = window.scrollY;
    if (state.revealed && y < lastScrollY - 1) {
      hideSecret();
    }
    lastScrollY = y;
  };
  document.addEventListener('scroll', onScroll, { passive: true });

  // keyboard fallback at bottom
  document.addEventListener('keydown', (e) => {
    const key = e.key;
    if (!state.revealed && atBottom() && key === 'ArrowDown') {
      e.preventDefault();
      revealSecret();
      return;
    }
    if (state.revealed && (key === 'ArrowUp' || key === 'PageUp' || (key === ' ' && e.shiftKey))) {
      e.preventDefault();
      hideSecret();
    }
  });

  // mobile overscroll via touch
  document.addEventListener('touchstart', (e) => {
    state.touchStartY = e.touches && e.touches[0] ? e.touches[0].clientY : null;
  }, { passive: true });
  document.addEventListener('touchmove', (e) => {
    const y = e.touches && e.touches[0] ? e.touches[0].clientY : null;
    if (state.touchStartY != null && y != null) {
      const dy = y - state.touchStartY; // negative when swiping up, positive when pulling down
      if (!state.revealed && atBottom() && dy < -TOUCH_REVEAL_DISTANCE) {
        try { e.preventDefault(); } catch {}
        revealSecret();
      } else if (state.revealed && dy > TOUCH_HIDE_DISTANCE) {
        try { e.preventDefault(); } catch {}
        hideSecret();
      }
    }
  }, { passive: false });
})();
