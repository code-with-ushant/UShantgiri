/**
 * Apple-Inspired Portfolio Interactive Core
 * Implemented in accordance with Emil Kowalski's Apple Design Skill & WWDC Principles:
 * - Fluid tab switching with sliding pill indicator
 * - 3D Perspective Tilt & Specular Rim Spotlight (visionOS / Apple TV cards)
 * - Multimodal Tactile Feedback (Synthesized iOS micro-tick via Web Audio API)
 * - Apple Fluid Modal Sheet with interruptible dismissal
 * - Deep linking with window.location.hash (#about, #resume, #portfolio, #contact)
 * - Dynamic Light/Dark mode with system synchronization & persistence
 * - Interactive copy-to-clipboard with visual confirmation
 * - Zero layout shifts and strict prefers-reduced-motion compliance
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {

  // --------------------------------------------------------------------------
  // 1. Multimodal Tactile Audio Feedback (WWDC: Audio-Haptic Experiences)
  // --------------------------------------------------------------------------
  let audioCtx = null;

  const playHapticTick = () => {
    // Check if user prefers reduced motion or accessibility
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      // Generate a subtle, physical 4ms click (similar to an Apple Watch digital crown tap)
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.005);

      gain.gain.setValueAtTime(0.035, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.005);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.006);
    } catch {
      // AudioContext unavailable or not allowed yet; fail silently
    }
  };

  // --------------------------------------------------------------------------
  // 2. Theme Management (Apple Dynamic Light / Dark Mode)
  // --------------------------------------------------------------------------
  const themeToggleBtn = document.querySelector('[data-theme-toggle]');
  const htmlRoot = document.documentElement;

  const getPreferredTheme = () => {
    const saved = localStorage.getItem('ushant-theme');
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  };

  const applyTheme = (theme) => {
    htmlRoot.setAttribute('data-theme', theme);
    localStorage.setItem('ushant-theme', theme);
  };

  applyTheme(getPreferredTheme());

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      playHapticTick();
      const current = htmlRoot.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
      const next = current === 'light' ? 'dark' : 'light';
      applyTheme(next);
    });
  }

  window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
    if (!localStorage.getItem('ushant-theme')) {
      applyTheme(e.matches ? 'light' : 'dark');
    }
  });

  // --------------------------------------------------------------------------
  // 3. Navigation & Sliding Segmented Pill Indicator
  // --------------------------------------------------------------------------
  const navLinks = document.querySelectorAll('[data-nav-link]');
  const articles = document.querySelectorAll('[data-page]');
  const navIndicator = document.querySelector('[data-nav-indicator]');
  const navbarList = document.querySelector('.navbar-list');

  const updateNavIndicator = (activeElement) => {
    if (!navIndicator || !activeElement || !navbarList) return;
    const listRect = navbarList.getBoundingClientRect();
    const activeRect = activeElement.getBoundingClientRect();

    const left = activeRect.left - listRect.left;
    const width = activeRect.width;

    navIndicator.style.transform = `translateX(${left}px)`;
    navIndicator.style.width = `${width}px`;
    navIndicator.style.opacity = '1';
  };

  const activateTab = (targetPageName, updateHash = true, triggerSound = false) => {
    let matchedLink = null;
    let matchedArticle = null;

    if (triggerSound) {
      playHapticTick();
    }

    articles.forEach((article) => {
      if (article.dataset.page === targetPageName) {
        article.classList.add('active');
        matchedArticle = article;
      } else {
        article.classList.remove('active');
      }
    });

    navLinks.forEach((link) => {
      if (link.dataset.navLink === targetPageName) {
        link.classList.add('active');
        link.setAttribute('aria-selected', 'true');
        matchedLink = link;
      } else {
        link.classList.remove('active');
        link.setAttribute('aria-selected', 'false');
      }
    });

    if (matchedLink) {
      updateNavIndicator(matchedLink);
    }

    if (updateHash && window.location.hash.slice(1) !== targetPageName) {
      history.replaceState(null, '', `#${targetPageName}`);
    }

    // Scroll smoothly to top on mobile
    if (window.innerWidth < 1080 && matchedArticle) {
      const topOffset = matchedArticle.getBoundingClientRect().top + window.scrollY - 100;
      if (window.scrollY > topOffset) {
        window.scrollTo({ top: topOffset, behavior: 'smooth' });
      }
    }
  };

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      const targetPage = link.dataset.navLink;
      activateTab(targetPage, true, true);
    });
  });

  const handleInitialHash = () => {
    const hash = window.location.hash.replace('#', '').toLowerCase();
    const validPages = Array.from(articles).map((a) => a.dataset.page);
    if (hash && validPages.includes(hash)) {
      activateTab(hash, false, false);
    } else {
      activateTab('about', false, false);
    }
  };

  handleInitialHash();
  window.addEventListener('popstate', handleInitialHash);

  window.addEventListener('resize', () => {
    const activeLink = document.querySelector('[data-nav-link].active');
    if (activeLink) updateNavIndicator(activeLink);
  });

  setTimeout(() => {
    const activeLink = document.querySelector('[data-nav-link].active');
    if (activeLink) updateNavIndicator(activeLink);
  }, 100);

  // --------------------------------------------------------------------------
  // 4. Apple Card Spotlight & 3D Tilt (visionOS / Apple TV Effect)
  // --------------------------------------------------------------------------
  const tiltCards = document.querySelectorAll('.tilt-card, .bento-card, .project-card');

  tiltCards.forEach((card) => {
    card.classList.add('spotlight-card');

    card.addEventListener('pointermove', (e) => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Update spotlight position
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);

      // Gentle 3D perspective tilt
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const tiltX = ((y - centerY) / centerY) * -4; // max -4 to +4 deg
      const tiltY = ((x - centerX) / centerX) * 4;

      card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-3px) scale3d(1.01, 1.01, 1.01)`;
    });

    card.addEventListener('pointerleave', () => {
      card.style.transform = '';
      card.style.removeProperty('--mouse-x');
      card.style.removeProperty('--mouse-y');
    });
  });

  // --------------------------------------------------------------------------
  // 5. Mobile Sidebar Accordion Toggle
  // --------------------------------------------------------------------------
  const sidebar = document.querySelector('[data-sidebar]');
  const sidebarToggleBtn = document.querySelector('[data-sidebar-btn]');

  if (sidebar && sidebarToggleBtn) {
    sidebarToggleBtn.addEventListener('click', () => {
      playHapticTick();
      const isExpanded = sidebar.classList.toggle('expanded');
      sidebarToggleBtn.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
      const btnSpan = sidebarToggleBtn.querySelector('span');
      if (btnSpan) {
        btnSpan.textContent = isExpanded ? 'Hide Contacts' : 'Contacts';
      }
    });
  }

  // --------------------------------------------------------------------------
  // 6. Interactive Copy-to-Clipboard with Feedback
  // --------------------------------------------------------------------------
  const copyButtons = document.querySelectorAll('[data-copy-target]');

  copyButtons.forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      playHapticTick();
      const textToCopy = btn.getAttribute('data-copy-target');
      if (!textToCopy) return;

      try {
        await navigator.clipboard.writeText(textToCopy);
        const originalTitle = btn.getAttribute('title') || 'Copy';
        btn.setAttribute('title', 'Copied!');
        
        const svg = btn.querySelector('svg');
        if (svg) {
          svg.style.transform = 'scale(1.25)';
          svg.style.color = 'var(--success)';
        }

        setTimeout(() => {
          btn.setAttribute('title', originalTitle);
          if (svg) {
            svg.style.transform = '';
            svg.style.color = '';
          }
        }, 1800);
      } catch (err) {
        console.warn('Clipboard write failed:', err);
      }
    });
  });

  // --------------------------------------------------------------------------
  // 7. Portfolio Category Filter
  // --------------------------------------------------------------------------
  const filterButtons = document.querySelectorAll('[data-filter-btn]');
  const projectCards = document.querySelectorAll('[data-filter-item]');

  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      playHapticTick();
      const filterCategory = btn.dataset.filterBtn.toLowerCase();

      filterButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      projectCards.forEach((card, index) => {
        const itemCategory = (card.dataset.category || '').toLowerCase();
        if (filterCategory === 'all' || itemCategory.includes(filterCategory)) {
          card.style.display = 'flex';
          card.style.opacity = '0';
          card.style.transform = 'translateY(12px)';
          setTimeout(() => {
            card.style.transition = 'opacity 0.28s var(--ease-spring), transform 0.28s var(--ease-spring)';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, index * 40);
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // --------------------------------------------------------------------------
  // 8. Apple Fluid Project Modal Sheet
  // --------------------------------------------------------------------------
  const sheetBackdrop = document.querySelector('[data-sheet-backdrop]');
  const sheetCloseBtn = document.querySelector('[data-sheet-close]');
  const sheetTitle = document.querySelector('[data-sheet-title]');
  const sheetBadge = document.querySelector('[data-sheet-badge]');
  const sheetImage = document.querySelector('[data-sheet-image]');
  const sheetDesc = document.querySelector('[data-sheet-desc]');
  const sheetLink = document.querySelector('[data-sheet-link]');

  const projectData = {
    'web': {
      title: 'Personal Portfolio & Webpage Architecture',
      badge: 'Web Design & Frontend',
      image: 'assets/image/project web.png',
      desc: 'A responsive developer portfolio showcasing background, skills, and projects with editorial typography, modular layout components, and high-performance vanilla JavaScript navigation.',
      github: 'https://github.com/code-with-ushant/webproject'
    },
    'dsa': {
      title: 'Student Data Management System in C',
      badge: 'Systems & Data Structures',
      image: 'assets/image/Screenshot 2026-01-03 222805.png',
      desc: 'A robust console-based records database engineered in C. Implements file persistence, record indexing, multi-field search algorithms, memory safety, and systematic sorting routines.',
      github: 'https://github.com/code-with-ushant/learning-c/blob/main/otherproject/student_database.c'
    }
  };

  const openProjectSheet = (categoryKey) => {
    playHapticTick();
    const data = projectData[categoryKey];
    if (!data || !sheetBackdrop) return;

    sheetTitle.textContent = data.title;
    sheetBadge.textContent = data.badge;
    sheetImage.src = data.image;
    sheetDesc.textContent = data.desc;
    sheetLink.href = data.github;

    sheetBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeProjectSheet = () => {
    if (!sheetBackdrop) return;
    playHapticTick();
    sheetBackdrop.classList.remove('active');
    document.body.style.overflow = '';
  };

  if (sheetCloseBtn) sheetCloseBtn.addEventListener('click', closeProjectSheet);
  if (sheetBackdrop) {
    sheetBackdrop.addEventListener('click', (e) => {
      if (e.target === sheetBackdrop) closeProjectSheet();
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sheetBackdrop && sheetBackdrop.classList.contains('active')) {
      closeProjectSheet();
    }
  });

  // Attach quick preview trigger to project cards
  projectCards.forEach((card) => {
    card.addEventListener('click', (e) => {
      // If user clicked directly on the "Source Code" link inside the card, let it open GitHub directly
      if (e.target.closest('a')) return;
      const cat = card.dataset.category;
      if (cat) openProjectSheet(cat);
    });
  });

  // --------------------------------------------------------------------------
  // 9. Contact Form Validation & State
  // --------------------------------------------------------------------------
  const contactForm = document.querySelector('[data-form]');
  const formSubmitBtn = document.querySelector('[data-form-btn]');
  const formFeedback = document.querySelector('[data-form-feedback]');

  if (contactForm && formSubmitBtn) {
    const validateForm = () => {
      if (contactForm.checkValidity()) {
        formSubmitBtn.removeAttribute('disabled');
      } else {
        formSubmitBtn.setAttribute('disabled', 'true');
      }
    };

    contactForm.addEventListener('input', validateForm);
    validateForm();

    contactForm.addEventListener('submit', () => {
      playHapticTick();
      formSubmitBtn.setAttribute('disabled', 'true');
      const btnSpan = formSubmitBtn.querySelector('span');
      if (btnSpan) {
        btnSpan.textContent = 'Sending...';
      }
      if (formFeedback) {
        formFeedback.classList.add('success');
        formFeedback.textContent = 'Thank you! Your message is being sent.';
      }
    });
  }
});
