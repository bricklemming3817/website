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
    !!el.closest('a, button, input, textarea, select, summary, [contenteditable="true"], .env-widget');

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

      if (inEdit()) {
        if ((type === 'touch' || type === 'pen') && isInteractive(t)) {
          disable();
          clearTouchCandidate();
        }
        return;
      }

      if (isInteractive(t)) {
        clearTouchCandidate();
        return;
      }

      if (type === 'touch' || type === 'pen') {
        touchEditState.pointerId = e.pointerId;
        touchEditState.x = e.clientX;
        touchEditState.y = e.clientY;
        return;
      }

      clearTouchCandidate();
      enable();
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
      if (!isInteractive(t)) {
        enable();
        if (isBodyStructurallyEmpty()) {
          document.body.setAttribute('data-edit-blank-trigger', 'true');
        } else {
          document.body.removeAttribute('data-edit-blank-trigger');
        }
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

  // ——— environment widget helpers ———
  const detectBrowser = () => {
    const ua = navigator.userAgent;
    const data = navigator.userAgentData;
    if (data && data.brands) {
      const brand = data.brands.find((b) => !/Not? ?A/gi.test(b.brand));
      if (brand) {
        return { label: `${brand.brand} ${brand.version}`, key: brand.brand.toLowerCase().replace(/\s+/g, '-') };
      }
    }
    const edge = ua.match(/edg\/(\d+)/i);
    if (edge) return { label: `Microsoft Edge ${edge[1]}`, key: 'edge' };
    const chrome = ua.match(/chrome\/(\d+)/i);
    if (chrome) return { label: `Chrome ${chrome[1]}`, key: 'chrome' };
    const firefox = ua.match(/firefox\/(\d+)/i);
    if (firefox) return { label: `Firefox ${firefox[1]}`, key: 'firefox' };
    const safari = ua.match(/version\/(\d+)[.\d]*.*safari/i);
    if (safari) return { label: `Safari ${safari[1]}`, key: 'safari' };
    return { label: navigator.appName || 'Unknown', key: 'other' };
  };

  const detectOS = () => {
    const data = navigator.userAgentData;
    if (data?.platform) {
      const platform = data.platform.toLowerCase();
      if (platform.includes('win')) return { label: 'Windows', key: 'windows' };
      if (platform.includes('mac')) return { label: 'macOS', key: 'mac' };
      if (platform.includes('ios')) return { label: 'iOS', key: 'ios' };
      if (platform.includes('android')) return { label: 'Android', key: 'android' };
      if (platform.includes('linux')) return { label: 'Linux', key: 'linux' };
    }

    const ua = navigator.userAgent;
    const platform = navigator.platform || '';
    const maxTouch = navigator.maxTouchPoints || 0;
    const isIOSLike = /iphone|ipod|ipad/i.test(ua) || (platform === 'MacIntel' && maxTouch > 1);
    if (isIOSLike) return { label: 'iOS', key: 'ios' };
    if (/android/i.test(ua)) return { label: 'Android', key: 'android' };
    if (/windows nt 1[0-2]/i.test(ua)) return { label: 'Windows 10/11', key: 'windows' };
    if (/windows nt/i.test(ua)) return { label: 'Windows', key: 'windows' };
    if (/mac os x|macintosh/i.test(ua)) return { label: 'macOS', key: 'mac' };
    if (/linux/i.test(ua)) return { label: 'Linux', key: 'linux' };
    return { label: platform || 'Unknown', key: 'other' };
  };

  const detectDevice = () => {
    if (navigator.userAgentData && typeof navigator.userAgentData.mobile === 'boolean') {
      return navigator.userAgentData.mobile ? { label: 'Mobile', key: 'mobile' } : { label: 'Desktop', key: 'desktop' };
    }
    const ua = navigator.userAgent;
    const platform = navigator.platform || '';
    const maxTouch = navigator.maxTouchPoints || 0;
    const isIPad = /ipad/i.test(ua) || (platform === 'MacIntel' && maxTouch > 1);
    const isIPhone = /iphone|ipod/i.test(ua);
    if (isIPad) return { label: 'Tablet', key: 'tablet' };
    if (isIPhone || /android/i.test(ua) || /mobile/i.test(ua)) return { label: 'Mobile', key: 'mobile' };
    return { label: 'Desktop', key: 'desktop' };
  };

  const formatScreenSizes = () => {
    const viewport = `${window.innerWidth} × ${window.innerHeight}`;
    const screenSize = `${window.screen.width} × ${window.screen.height}`;
    return `${viewport} viewport, ${screenSize} screen`;
  };

  const widget = document.createElement('div');
  widget.className = 'env-widget';

  const activator = document.createElement('button');
  activator.type = 'button';
  activator.className = 'env-activator';
  activator.setAttribute('aria-label', 'Open environment dashboard');
  activator.setAttribute('aria-controls', 'environment-panel');
  activator.setAttribute('aria-expanded', 'false');
  activator.innerHTML = '<span class="env-activator__icon">🌐</span><span class="env-activator__text">your setup</span>';

  const panel = document.createElement('section');
  panel.className = 'env-panel';
  panel.id = 'environment-panel';
  panel.setAttribute('aria-hidden', 'true');

  const panelHeader = document.createElement('div');
  panelHeader.className = 'env-panel__header';
  const title = document.createElement('h2');
  title.className = 'env-panel__title';
  title.textContent = 'cosmic visitor console';
  const headerActions = document.createElement('div');
  headerActions.className = 'env-panel__actions';
  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'env-panel__close';
  closeBtn.setAttribute('aria-label', 'Collapse environment panel');
  closeBtn.innerHTML = '&times;';
  headerActions.append(closeBtn);
  panelHeader.append(title, headerActions);

  const panelBody = document.createElement('div');
  panelBody.className = 'env-panel__body';

  const infoList = document.createElement('ul');
  infoList.className = 'env-info';

  panelBody.append(infoList);
  panel.append(panelHeader, panelBody);
  widget.append(panel, activator);
  document.body.appendChild(widget);

  const infoEntries = {};
  const infoSequence = [];
  const addInfoRow = (key, { label, icon, clickable = false }) => {
    const item = document.createElement('li');
    item.className = `env-info__item env-info__item--${key}`;
    item.style.setProperty('--stagger', `${infoSequence.length * 0.12}s`);

    const iconEl = document.createElement('span');
    iconEl.className = `env-info__icon env-info__icon--${icon}`;

    const textWrap = document.createElement('div');
    textWrap.className = 'env-info__text';

    const labelEl = document.createElement('span');
    labelEl.className = 'env-info__label';
    labelEl.textContent = label;

    let valueEl;
    let detailEl = null;
    if (clickable) {
      valueEl = document.createElement('button');
      valueEl.type = 'button';
      valueEl.className = 'env-info__value env-info__value--button';
      valueEl.disabled = true;
      valueEl.setAttribute('aria-expanded', 'false');
      detailEl = document.createElement('div');
      detailEl.className = 'env-info__detail';
      textWrap.append(labelEl, valueEl, detailEl);
    } else {
      valueEl = document.createElement('span');
      valueEl.className = 'env-info__value';
      textWrap.append(labelEl, valueEl);
    }

    item.append(iconEl, textWrap);
    infoList.appendChild(item);

    const entry = { item, icon: iconEl, value: valueEl, detail: detailEl };
    infoEntries[key] = entry;
    infoSequence.push(entry);
    return entry;
  };

  const locationEntry = addInfoRow('location', { label: 'location', icon: 'pin', clickable: true });
  const browserEntry = addInfoRow('browser', { label: 'browser', icon: 'browser' });
  const deviceEntry = addInfoRow('device', { label: 'device', icon: 'device' });
  const screenEntry = addInfoRow('screen', { label: 'screen size', icon: 'screen' });
  const languageEntry = addInfoRow('language', { label: 'language', icon: 'language' });
  const timezoneEntry = addInfoRow('timezone', { label: 'time zone', icon: 'clock' });
  const cookiesEntry = addInfoRow('cookies', { label: 'cookies', icon: 'cookie' });
  const osEntry = addInfoRow('os', { label: 'operating system', icon: 'chip' });

  const browserInfo = detectBrowser();
  browserEntry.value.textContent = browserInfo.label;
  const browserKey = ['chrome', 'firefox', 'safari', 'edge'].includes(browserInfo.key)
    ? browserInfo.key
    : 'other';
  browserEntry.icon.dataset.browser = browserKey;

  const osInfo = detectOS();
  osEntry.value.textContent = osInfo.label;
  osEntry.icon.dataset.os = osInfo.key;

  const deviceInfo = detectDevice();
  deviceEntry.value.textContent = deviceInfo.label;
  deviceEntry.icon.dataset.device = deviceInfo.key;

  screenEntry.value.textContent = formatScreenSizes();
  const updateScreen = () => {
    screenEntry.value.textContent = formatScreenSizes();
  };
  window.addEventListener('resize', updateScreen);

  languageEntry.value.textContent = (navigator.languages && Array.from(new Set(navigator.languages)).join(', ')) || navigator.language;
  timezoneEntry.value.textContent = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Not available';

  const cookiesEnabled = navigator.cookieEnabled;
  cookiesEntry.value.textContent = cookiesEnabled ? 'enabled' : 'disabled';
  if (cookiesEnabled) {
    cookiesEntry.item.classList.add('cookies-enabled');
  }

  const locationDetailId = 'env-location-detail';
  locationEntry.value.textContent = typeof fetch === 'function' ? 'loading…' : 'not supported';
  locationEntry.value.setAttribute('aria-controls', locationDetailId);
  if (locationEntry.detail) {
    locationEntry.detail.id = locationDetailId;
    locationEntry.detail.textContent = typeof fetch === 'function'
      ? 'retrieving approximate location…'
      : 'your browser does not support the fetch API needed for lookups.';
  }

  let locationData = null;
  let locationFetching = false;

  const clearInfoAnimationState = () => {
    infoSequence.forEach((entry) => {
      entry.item.classList.remove('is-visible');
      entry.item.classList.remove('detail-open');
    });
    widget.classList.remove('animating');
    if (locationEntry.value) {
      locationEntry.value.setAttribute('aria-expanded', 'false');
    }
  };

  const playReveal = () => {
    clearInfoAnimationState();
    void panel.offsetWidth;
    widget.classList.add('animating');
    infoSequence.forEach((entry, index) => {
      setTimeout(() => {
        entry.item.classList.add('is-visible');
      }, 240 + index * 140);
    });
    setTimeout(() => {
      widget.classList.remove('animating');
    }, 1800);
  };

  const isPanelOpen = () => widget.classList.contains('open');

  const setPanelOpen = (open) => {
    const willOpen = typeof open === 'boolean' ? open : !isPanelOpen();
    const already = isPanelOpen();
    if (willOpen === already) {
      if (willOpen) {
        playReveal();
      }
      return;
    }
    widget.classList.toggle('open', willOpen);
    panel.setAttribute('aria-hidden', String(!willOpen));
    activator.setAttribute('aria-expanded', String(willOpen));
    activator.setAttribute('aria-label', willOpen ? 'Collapse environment dashboard' : 'Open environment dashboard');
    if (willOpen) {
      requestAnimationFrame(() => {
        playReveal();
      });
      if (!locationData && !locationFetching) {
        loadLocation();
      }
    } else {
      clearInfoAnimationState();
    }
  };

  const applyLocation = (data) => {
    if (!data) return;
    const latitude = Number.parseFloat(data.latitude);
    const longitude = Number.parseFloat(data.longitude);
    const summaryRaw = [data.city, data.region, data.country_name].filter(Boolean).join(', ') || 'Not available';
    const summary = summaryRaw.toLowerCase();
    const detailLines = [];
    if (data.org || data.asn) {
      detailLines.push(`network: ${data.org || data.asn}`);
    }
    if (data.postal) {
      detailLines.push(`postal code: ${data.postal}`);
    }
    if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
      detailLines.push(`lat ${latitude.toFixed(2)}, lon ${longitude.toFixed(2)}`);
    }

    locationData = { latitude, longitude, summary, detail: detailLines.join('\n') };
    locationEntry.value.textContent = summary;
    locationEntry.value.disabled = false;
    if (locationEntry.detail) {
      locationEntry.detail.textContent = locationData.detail || 'no additional detail reported';
    }
    locationEntry.item.classList.remove('is-loading');
    if (isPanelOpen()) {
      playReveal();
    }
  };

  const fetchLocation = async () => {
    const res = await fetch('https://ipapi.co/json/');
    if (!res.ok) throw new Error('request failed');
    return res.json();
  };

  const loadLocation = () => {
    if (locationFetching || locationData || typeof fetch !== 'function') return;
    locationFetching = true;
    locationEntry.item.classList.add('is-loading');
    fetchLocation()
      .then((data) => {
        locationFetching = false;
        applyLocation(data);
      })
      .catch(() => {
        locationFetching = false;
        locationEntry.value.textContent = 'unavailable';
        locationEntry.value.disabled = true;
        if (locationEntry.detail) {
          locationEntry.detail.textContent = 'could not reach the location service right now.';
        }
        locationEntry.item.classList.remove('is-loading');
      });
  };

  const toggleLocationDetail = () => {
    if (!locationData) return;
    const open = !locationEntry.item.classList.contains('detail-open');
    locationEntry.item.classList.toggle('detail-open', open);
    locationEntry.value.setAttribute('aria-expanded', String(open));
  };

  locationEntry.value.addEventListener('click', toggleLocationDetail);
  activator.addEventListener('click', () => {
    setPanelOpen(!isPanelOpen());
  });
  closeBtn.addEventListener('click', () => {
    setPanelOpen(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isPanelOpen()) {
      setPanelOpen(false);
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
