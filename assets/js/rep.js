/**
 * USHANT GIRI — APPLE STUDIO JAVASCRIPT ENGINE
 * Tab navigation, Spotlight Command Palette, Interactive Terminal, DSA Visualizer & Audio Haptics
 */

(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // 0. SECURITY & HTML SANITIZATION UTILITIES
  // ---------------------------------------------------------------------------
  function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // ---------------------------------------------------------------------------
  // 1. WEB AUDIO API SYNTHESIZED HAPTIC CLICKS
  // ---------------------------------------------------------------------------
  let audioCtx = null;
  function playHapticClick(frequency = 800, duration = 0.012) {
    try {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      if (!audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        audioCtx = new AudioContext();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (_) {}
  }

  // ---------------------------------------------------------------------------
  // 2. THEME CONTROLLER
  // ---------------------------------------------------------------------------
  const root = document.documentElement;
  const themeToggles = document.querySelectorAll('[data-theme-toggle]');

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    localStorage.setItem('ushant_theme', theme);
  }

  const savedTheme = localStorage.getItem('ushant_theme') ||
    (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  applyTheme(savedTheme);

  themeToggles.forEach(btn => {
    btn.addEventListener('click', () => {
      const current = root.getAttribute('data-theme');
      const next = current === 'light' ? 'dark' : 'light';
      applyTheme(next);
      playHapticClick(next === 'light' ? 900 : 600);
    });
  });

  // ---------------------------------------------------------------------------
  // 3. SEGMENTED TAB NAVIGATION & SPRING SLIDER
  // ---------------------------------------------------------------------------
  const navTabs = document.querySelectorAll('[data-nav-link]');
  const tabPanels = document.querySelectorAll('.tab-panel');
  const slidingPill = document.querySelector('[data-nav-indicator]');

  function updateSlidingPill(activeBtn) {
    if (!slidingPill || !activeBtn) return;
    const parent = activeBtn.parentElement;
    if (!parent) return;
    const parentRect = parent.getBoundingClientRect();
    const btnRect = activeBtn.getBoundingClientRect();
    slidingPill.style.width = `${btnRect.width}px`;
    slidingPill.style.left = `${btnRect.left - parentRect.left + parent.scrollLeft}px`;
  }

  function switchTab(pageId) {
    if (!pageId) return;
    navTabs.forEach(btn => {
      const match = btn.getAttribute('data-nav-link') === pageId;
      btn.classList.toggle('active', match);
      btn.setAttribute('aria-selected', match ? 'true' : 'false');
      if (match && btn.classList.contains('nav-tab')) {
        updateSlidingPill(btn);
        if (typeof btn.scrollIntoView === 'function') {
          btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
        }
      }
    });

    tabPanels.forEach(panel => {
      const isMatch = panel.getAttribute('data-page') === pageId;
      panel.classList.toggle('active', isMatch);
    });

    if (window.location.hash !== '#' + pageId) {
      history.replaceState(null, '', '#' + pageId);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
    playHapticClick(750, 0.015);
  }

  navTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      const pageId = tab.getAttribute('data-nav-link');
      if (pageId) switchTab(pageId);
    });
  });

  // Handle URL hash on initial load
  function handleInitialHash() {
    const hash = window.location.hash.replace('#', '').toLowerCase();
    if (hash === 'lab') {
      switchTab('milestones');
      if (typeof openTerminalModal === 'function') openTerminalModal();
    } else if (hash && ['about', 'resume', 'portfolio', 'milestones', 'contact'].includes(hash)) {
      switchTab(hash);
    } else {
      const activeNavTab = document.querySelector('.nav-tab.active');
      if (activeNavTab) updateSlidingPill(activeNavTab);
    }
  }

  window.addEventListener('load', handleInitialHash);
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '').toLowerCase();
    if (hash === 'lab') {
      switchTab('milestones');
      if (typeof openTerminalModal === 'function') openTerminalModal();
    } else if (hash && ['about', 'resume', 'portfolio', 'milestones', 'contact'].includes(hash)) {
      switchTab(hash);
    }
  });
  window.addEventListener('resize', () => {
    const activeNavTab = document.querySelector('.nav-tab.active');
    if (activeNavTab) updateSlidingPill(activeNavTab);
  });

  // ---------------------------------------------------------------------------
  // 4. MOBILE SIDEBAR DRAWER TOGGLE
  // ---------------------------------------------------------------------------
  const sidebarBtn = document.querySelector('[data-sidebar-btn]');
  const sidebarExpandable = document.querySelector('.sidebar-expandable');

  if (sidebarBtn && sidebarExpandable) {
    sidebarBtn.addEventListener('click', () => {
      const isOpen = sidebarExpandable.classList.toggle('open');
      sidebarBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      playHapticClick(600);
    });
  }

  // ---------------------------------------------------------------------------
  // 5. CLIPBOARD COPY DISPATCHER
  // ---------------------------------------------------------------------------
  document.querySelectorAll('[data-copy-target]').forEach(el => {
    el.addEventListener('click', async (e) => {
      e.preventDefault();
      const text = el.getAttribute('data-copy-target');
      if (!text) return;
      try {
        await navigator.clipboard.writeText(text);
        const pill = el.querySelector('.row-action-pill');
        if (pill) {
          const original = pill.textContent;
          pill.textContent = 'Copied!';
          pill.style.color = 'var(--accent-live)';
          setTimeout(() => {
            pill.textContent = original;
            pill.style.color = '';
          }, 2000);
        }
        playHapticClick(1000, 0.02);
      } catch (_) {}
    });
  });

  // ---------------------------------------------------------------------------
  // 6. PORTFOLIO CATEGORY FILTER
  // ---------------------------------------------------------------------------
  const filterBtns = document.querySelectorAll('[data-filter-btn]');
  const filterItems = document.querySelectorAll('[data-filter-item]');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.getAttribute('data-filter-btn');
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      filterItems.forEach(item => {
        const itemCat = item.getAttribute('data-category');
        if (cat === 'all' || itemCat === cat) {
          item.style.display = 'flex';
          item.style.opacity = '1';
        } else {
          item.style.display = 'none';
          item.style.opacity = '0';
        }
      });
      playHapticClick(700);
    });
  });

  // ---------------------------------------------------------------------------
  // 7. PROJECT DETAILS MODAL SHEET
  // ---------------------------------------------------------------------------
  const sheetBackdrop = document.querySelector('[data-sheet-backdrop]');
  const sheetClose = document.querySelector('[data-sheet-close]');
  const sheetImg = document.querySelector('[data-sheet-image]');
  const sheetTitle = document.querySelector('[data-sheet-title]');
  const sheetBadge = document.querySelector('[data-sheet-badge]');
  const sheetDesc = document.querySelector('[data-sheet-desc]');
  const sheetLink = document.querySelector('[data-sheet-link]');

  const projectCatalog = {
    kolve: {
      title: 'KOLVE — Digital Solutions & Web Platform',
      badge: 'Co-Founder (Team of 4) • Next.js 16',
      img: 'assets/image/kolve_studio.svg',
      link: 'https://github.com/KOLV3/KOLV3',
      desc: 'Full-stack web application and digital solutions studio platform for KOLVE, based in Sunsari, Nepal.\n\nKey Engineering Architecture:\n• Co-founded by Ushant Giri alongside 3 partners (Sandesh Sunar, Bhishan Katwal, Jeshis Jamarkatel)\n• Next.js 16 server-rendered platform with TypeScript and Tailwind CSS v4\n• Automated 37-point CI design system and integration route audit suite\n• High-performance serverless endpoints with defensive security policies\n• Production deployment on Vercel with zero performance bottlenecks'
    },
    lords: {
      title: "Lord's Home Nepal — Children Welfare Platform",
      badge: 'Full-Stack & Privacy Safeguards • Node.js',
      img: 'assets/image/lordshome_platform.svg',
      link: 'https://github.com/jeshisjamarkatel/lordshomenepal',
      desc: "Official website and staff administration platform for Lord's Home Nepal children's welfare residence in Dharan-04, Sunsari.\n\nKey Engineering Architecture:\n• Native Node.js HTTP server built with zero runtime dependencies\n• Bidirectional English and Nepali bilingual translation and content infrastructure\n• Automated image mosaic face-blurring pipeline ensuring child privacy compliance\n• 16-point automated verification test suite verifying security headers and rate limits"
    },
    sys: {
      title: 'Wireless Webcam Pro (Sub-50ms 1080p 60FPS)',
      badge: 'Systems & Video Streaming',
      img: 'assets/image/wireless_webcam.svg',
      link: 'https://github.com/code-with-ushant/Wireless-Webcam-Pro',
      desc: 'An open-source ultra-low latency wireless webcam system turning Android devices into 1080p 60FPS cameras for OBS Studio, Zoom, and Teams over local Wi-Fi.\n\nKey Engineering Architecture:\n• Zero-copy Android hardware encoding via MediaCodec Surface\n• Python zero-latency PyAV decoding context without lookahead B-frames\n• Direct raw socket networking with MTU-aligned packet framing\n• Virtual camera driver output directly mapped into OBS Studio'
    },
    web: {
      title: 'CCT Real-Time Campus Bus Tracker',
      badge: 'Real-Time Transit & Telemetry',
      img: 'assets/image/bustracker.png',
      link: 'https://github.com/code-with-ushant/UShantgiri',
      desc: 'Transit telemetry and tracking system engineered for Central Campus of Technology (CCT), Tribhuvan University, Dharan, Nepal.\n\nKey Engineering Architecture:\n• Continuous Android GPS background driver streaming coordinates\n• Node.js & WebSocket coordination hub with heartbeat monitoring\n• Leaflet.js interactive OpenStreetMap route visualization\n• Dynamic ETA calculations and route deviation alerts for students'
    },
    dsa: {
      title: 'Student Data Management System in C',
      badge: 'C Language & Data Structures',
      img: 'assets/image/Screenshot 2026-01-03 222805.png',
      link: 'https://github.com/code-with-ushant/learning-c/blob/main/otherproject/student_database.c',
      desc: 'A structured records indexing utility written in standard C.\n\nKey Engineering Architecture:\n• Direct binary file I/O operations (fread / fwrite) ensuring zero serial overhead\n• In-memory struct tables for fast linear and binary search lookups\n• Memory-safe record deletion and compaction algorithms\n• Formatted terminal reporting with zero external C dependencies'
    },
    lib: {
      title: 'Library Bookkeeping & Inventory System in C',
      badge: 'C Language & Struct Architecture',
      img: 'assets/image/library_system.svg',
      link: 'https://github.com/code-with-ushant/learning-c/blob/main/otherproject/library_bookkeeping.c',
      desc: 'A structured library inventory catalog and author search utility written in standard C.\n\nKey Engineering Architecture:\n• Custom `struct book` encapsulating title[20], author[20], publisher[20], and float price\n• Dynamic collection memory allocation `struct book books[size]` based on runtime input\n• Author-targeted search filter `fbbyaouthor()` using string comparisons (strcmp)\n• Real-time formatted terminal catalog view and valuation tracking with zero external libraries'
    },
    arch: {
      title: 'Portfolio Architecture & Apple Design System',
      badge: 'Web Architecture',
      img: 'assets/image/project web.png',
      link: 'https://github.com/code-with-ushant/UShantgiri',
      desc: 'Personal engineering showcase built strictly adhering to Apple WWDC fluid interface design principles.\n\nKey Engineering Architecture:\n• Zero bloated runtime frameworks (Vanilla ES6+)\n• Web Audio API synthesized micro-haptic clicks\n• macOS Spotlight fuzzy search command palette (⌘K)\n• Fully responsive fluid layout with critically damped spring transitions'
    }
  };

  function openSheet(projKey) {
    const data = projectCatalog[projKey];
    if (!data || !sheetBackdrop) return;
    if (sheetImg) sheetImg.src = data.img;
    if (sheetTitle) sheetTitle.textContent = data.title;
    if (sheetBadge) sheetBadge.textContent = data.badge;
    if (sheetDesc) sheetDesc.textContent = data.desc;
    if (sheetLink) sheetLink.href = data.link;

    sheetBackdrop.classList.add('active');
    sheetBackdrop.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    playHapticClick(850);
  }

  function closeSheet() {
    if (!sheetBackdrop) return;
    sheetBackdrop.classList.remove('active');
    sheetBackdrop.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    playHapticClick(450);
  }

  document.querySelectorAll('[data-open-project]').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const key = trigger.getAttribute('data-open-project');
      if (key) openSheet(key);
    });
  });

  if (sheetClose) sheetClose.addEventListener('click', closeSheet);
  if (sheetBackdrop) {
    sheetBackdrop.addEventListener('click', (e) => {
      if (e.target === sheetBackdrop) closeSheet();
    });
  }

  // ---------------------------------------------------------------------------
  // 8. SPOTLIGHT COMMAND PALETTE (CMD + K)
  // ---------------------------------------------------------------------------
  const spotlightBackdrop = document.querySelector('[data-spotlight-backdrop]');
  const spotlightInput = document.querySelector('[data-spotlight-input]');
  const spotlightResults = document.querySelector('[data-spotlight-results]');
  const spotlightTriggers = document.querySelectorAll('[data-spotlight-open]');

  const spotlightItems = [
    { label: 'Overview & About', category: 'Navigation', action: () => switchTab('about') },
    { label: 'Resume & Academic Degree', category: 'Navigation', action: () => switchTab('resume') },
    { label: 'Engineering Projects', category: 'Navigation', action: () => switchTab('portfolio') },
    { label: 'Key Milestones & Ventures', category: 'Navigation', action: () => switchTab('milestones') },
    { label: 'Contact & Collaboration', category: 'Navigation', action: () => switchTab('contact') },
    { label: 'Developer Terminal (Interactive CLI)', category: 'Tools', action: () => openTerminalModal() },
    { label: 'KOLVE Studio (Co-Founder & Web Platform)', category: 'Venture', action: () => openSheet('kolve') },
    { label: "Lord's Home Nepal (Welfare Platform & Privacy)", category: 'Project', action: () => openSheet('lords') },
    { label: 'Wireless Webcam Pro (Sub-50ms 1080p)', category: 'Project', action: () => openSheet('sys') },
    { label: 'CCT Campus Bus Tracker (Live GPS)', category: 'Project', action: () => openSheet('web') },
    { label: 'Student Data Management System (C)', category: 'Project', action: () => openSheet('dsa') },
    { label: 'Library Bookkeeping & Inventory System (C)', category: 'Project', action: () => openSheet('lib') },
    { label: 'FastAPI (High-Performance Python Backend)', category: 'Skill', action: () => switchTab('about') },
    { label: 'Supabase (PostgreSQL & Realtime Cloud Backend)', category: 'Skill', action: () => switchTab('about') },
    { label: 'Firebase (Cloud Firestore & Auth Infrastructure)', category: 'Skill', action: () => switchTab('about') },
    { label: 'Chat on WhatsApp (+977 9805315275)', category: 'Action', action: () => {
      window.open('https://wa.me/9779805315275', '_blank');
    }},
    { label: 'Open Offline Concierge Bot', category: 'Action', action: () => {
      if (window.toggleWaModal) window.toggleWaModal(true);
    }},
    { label: 'Toggle Appearance (Light/Dark)', category: 'System', action: () => {
      const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      applyTheme(next);
    }},
    { label: 'Copy Email Address (ushantgiri3@gmail.com)', category: 'Action', action: () => {
      navigator.clipboard.writeText('ushantgiri3@gmail.com');
    }},
    { label: 'Copy Phone (+977 9805315275)', category: 'Action', action: () => {
      navigator.clipboard.writeText('+9779805315275');
    }}
  ];

  let activeSpotlightIdx = 0;
  let filteredSpotlight = [...spotlightItems];

  function renderSpotlightResults() {
    if (!spotlightResults) return;
    spotlightResults.innerHTML = '';
    if (filteredSpotlight.length === 0) {
      spotlightResults.innerHTML = '<div style="padding: 1.25rem; text-align: center; color: var(--text-tertiary); font-size: 0.84rem;">No matching commands or projects</div>';
      return;
    }
    filteredSpotlight.forEach((item, idx) => {
      const div = document.createElement('div');
      div.className = `spotlight-item ${idx === activeSpotlightIdx ? 'selected' : ''}`;
      div.innerHTML = `
        <span class="spotlight-item-text">${item.label}</span>
        <span class="spotlight-item-category">${item.category}</span>
      `;
      div.addEventListener('click', () => {
        item.action();
        closeSpotlight();
      });
      spotlightResults.appendChild(div);
    });
  }

  function openSpotlight() {
    if (!spotlightBackdrop) return;
    spotlightBackdrop.classList.add('active');
    spotlightBackdrop.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (spotlightInput) {
      spotlightInput.value = '';
      filteredSpotlight = [...spotlightItems];
      activeSpotlightIdx = 0;
      renderSpotlightResults();
      setTimeout(() => spotlightInput.focus(), 50);
    }
    playHapticClick(850);
  }

  function closeSpotlight() {
    if (!spotlightBackdrop) return;
    spotlightBackdrop.classList.remove('active');
    spotlightBackdrop.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    playHapticClick(450);
  }

  spotlightTriggers.forEach(btn => btn.addEventListener('click', openSpotlight));
  if (spotlightBackdrop) {
    spotlightBackdrop.addEventListener('click', (e) => {
      if (e.target === spotlightBackdrop) closeSpotlight();
    });
  }

  if (spotlightInput) {
    spotlightInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      filteredSpotlight = spotlightItems.filter(item =>
        item.label.toLowerCase().includes(q) || item.category.toLowerCase().includes(q)
      );
      activeSpotlightIdx = 0;
      renderSpotlightResults();
    });

    spotlightInput.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        activeSpotlightIdx = (activeSpotlightIdx + 1) % filteredSpotlight.length;
        renderSpotlightResults();
        playHapticClick(500, 0.008);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        activeSpotlightIdx = (activeSpotlightIdx - 1 + filteredSpotlight.length) % filteredSpotlight.length;
        renderSpotlightResults();
        playHapticClick(500, 0.008);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredSpotlight[activeSpotlightIdx]) {
          filteredSpotlight[activeSpotlightIdx].action();
          closeSpotlight();
        }
      } else if (e.key === 'Escape') {
        closeSpotlight();
      }
    });
  }

  window.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (spotlightBackdrop && spotlightBackdrop.classList.contains('active')) {
        closeSpotlight();
      } else {
        openSpotlight();
      }
    } else if (e.key === 'Escape') {
      if (sheetBackdrop && sheetBackdrop.classList.contains('active')) closeSheet();
      if (spotlightBackdrop && spotlightBackdrop.classList.contains('active')) closeSpotlight();
      if (terminalBackdrop && terminalBackdrop.classList.contains('active')) closeTerminalModal();
    }
  });

  // ---------------------------------------------------------------------------
  // 9. DEVELOPER STUDIO TERMINAL (INTERACTIVE CLI)
  // ---------------------------------------------------------------------------
  const terminalBackdrop = document.querySelector('[data-terminal-backdrop]');
  const terminalCloseBtns = document.querySelectorAll('[data-terminal-close]');
  const openTerminalBtns = document.querySelectorAll('[data-open-terminal]');
  const terminalInput = document.querySelector('[data-terminal-input]');
  const terminalOutput = document.querySelector('[data-terminal-output]');
  const terminalBody = document.querySelector('[data-terminal-body]');
  const terminalChips = document.querySelectorAll('[data-run-cmd]');

  function openTerminalModal() {
    if (!terminalBackdrop) return;
    terminalBackdrop.classList.add('active');
    terminalBackdrop.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (terminalInput) setTimeout(() => terminalInput.focus(), 200);
    playHapticClick(850, 0.015);
  }

  function closeTerminalModal() {
    if (!terminalBackdrop) return;
    terminalBackdrop.classList.remove('active');
    terminalBackdrop.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    playHapticClick(450, 0.015);
  }

  window.openTerminalModal = openTerminalModal;
  window.closeTerminalModal = closeTerminalModal;

  openTerminalBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openTerminalModal();
    });
  });

  terminalCloseBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      closeTerminalModal();
    });
  });

  if (terminalBackdrop) {
    terminalBackdrop.addEventListener('click', (e) => {
      if (e.target === terminalBackdrop) closeTerminalModal();
    });
  }

  const terminalCommands = {
    help: () => [
      'Available studio commands:',
      '  <span class="terminal-accent-val">skills</span>      — Render tech stack tree',
      '  <span class="terminal-accent-val">kolve</span>       — Inspect KOLVE studio venture specs',
      '  <span class="terminal-accent-val">lordshome</span>   — Inspect Lord\'s Home Nepal platform',
      '  <span class="terminal-accent-val">student_db</span>  — Simulate C-based student record database',
      '  <span class="terminal-accent-val">library_db</span>  — Simulate C library inventory & author search',
      '  <span class="terminal-accent-val">dsa</span>         — Trigger Binary Search memory tape simulation',
      '  <span class="terminal-accent-val">theme</span>       — Toggle light/dark appearance',
      '  <span class="terminal-accent-val">contact</span>     — Dispatch contact details',
      '  <span class="terminal-accent-val">clear</span>       — Clear terminal history'
    ],
    kolve: () => [
      '[KOLVE - Digital Solutions & Systems Studio]:',
      '  Role: Co-Founder & Lead Systems / Backend Engineer',
      '  Partners: Ushant Giri + 3 Co-Founders (Sandesh, Bhishan, Jeshis)',
      '  Stack: Next.js 16, TypeScript, Tailwind CSS v4, Automated CI Quality Audit',
      '  Mission: Real problems. Practical solutions. Built with technology.',
      '  Repo: https://github.com/KOLV3/KOLV3'
    ],
    lordshome: () => [
      "[Lord's Home Nepal - Welfare & Staff Administration]:",
      '  Role: Lead Full-Stack Developer & Privacy Systems',
      '  Architecture: Zero-dependency native Node.js HTTP server',
      '  Safeguards: Automated face-blur mosaic tool for child privacy',
      '  Language: Bidirectional English and Nepali bilingual engine',
      '  Repo: https://github.com/jeshisjamarkatel/lordshomenepal'
    ],
    skills: () => [
      '├── Backend & Cloud',
      '│   ├── FastAPI (Asynchronous Python APIs & Microservices)',
      '│   ├── Supabase (PostgreSQL, Auth & Realtime Subscriptions)',
      '│   ├── Firebase (Firestore, Auth & Serverless Infrastructure)',
      '│   └── Node.js & WebSockets (Real-time transit telemetry)',
      '├── Core Languages & Algorithms',
      '│   ├── Python (FastAPI, PyAV, Data Pipelines)',
      '│   ├── C / C++ (Data Structures, Pointers, Binary File I/O)',
      '│   └── JavaScript (ES6+, Modern Semantic Architecture)',
      '└── Academic Degree',
      '    └── BIT — Central Campus of Technology (CCT), Dharan'
    ],
    student_db: () => [
      '[C Memory DB]: Initializing struct records buffer (sizeof=128B)...',
      'Loaded 3 indexed records:',
      '  ID 101: Ushant Giri     | BIT Computer Science | GPA: 3.8',
      '  ID 102: Aarav Sharma    | Food Technology      | GPA: 3.5',
      '  ID 103: Smriti Adhikari | Microbiology         | GPA: 3.9',
      'Query execution complete (Binary Search lookups verified in O(log N)).'
    ],
    library_db: () => [
      '[C Struct Library]: Allocating `struct book books[size]`...',
      'Loaded catalog inventory:',
      '  1. Title: The C Programming Language | Author: Ritchie   | Price: Rs 850.00',
      '  2. Title: Clean Code                 | Author: Martin    | Price: Rs 920.00',
      '  3. Title: Introduction to Algorithms | Author: Cormen    | Price: Rs 1450.00',
      'Query `fbbyaouthor("Ritchie")` matched 1 catalog record in memory.'
    ],
    dsa: () => {
      if (window.runDsaStep) window.runDsaStep();
      return ['[DSA Visualizer]: Stepped binary search pointers forward. Inspect the Memory Tape panel!'];
    },
    theme: () => {
      const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      applyTheme(next);
      return [`[Theme]: Switched appearance to ${next} mode.`];
    },
    contact: () => [
      'Direct Channels for Ushant Giri:',
      '  Email : ushantgiri3@gmail.com',
      '  Phone : +977 9805315275',
      '  Base  : Sunsari / Dharan, Nepal'
    ],
    clear: () => []
  };

  function executeCliCommand(rawCmd) {
    const cmd = rawCmd.trim().toLowerCase();
    if (!cmd) return;
    if (cmd === 'clear') {
      if (terminalOutput) terminalOutput.innerHTML = '';
      return;
    }

    const row = document.createElement('div');
    row.style.margin = '0.5rem 0';
    const cleanCmd = escapeHtml(rawCmd.trim());
    const handler = terminalCommands[cmd];
    if (handler) {
      const lines = handler();
      row.innerHTML = `<span class="terminal-user-prompt">ushant@dharan:~$</span> ${cleanCmd}<br>${lines.join('<br>')}`;
    } else {
      row.innerHTML = `<span class="terminal-user-prompt">ushant@dharan:~$</span> ${cleanCmd}<br><span style="color: #ff7b72;">command not found: ${cleanCmd}. Type "help" for options.</span>`;
    }

    if (terminalOutput) terminalOutput.appendChild(row);
    if (terminalBody) terminalBody.scrollTop = terminalBody.scrollHeight;
    playHapticClick(650, 0.015);
  }

  if (terminalInput) {
    terminalInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const val = terminalInput.value;
        terminalInput.value = '';
        executeCliCommand(val);
      }
    });
  }

  terminalChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const cmd = chip.getAttribute('data-run-cmd');
      if (cmd) executeCliCommand(cmd);
    });
  });

  // ---------------------------------------------------------------------------
  // 10. DSA BINARY SEARCH MEMORY TAPE VISUALIZER
  // ---------------------------------------------------------------------------
  const dsaGrid = document.querySelector('[data-dsa-grid]');
  const dsaStatus = document.querySelector('[data-dsa-status]');
  const dsaStepBtn = document.querySelector('[data-dsa-step]');
  const dsaAutoBtn = document.querySelector('[data-dsa-auto]');
  const dsaResetBtn = document.querySelector('[data-dsa-reset]');
  const dsaTargetSelect = document.querySelector('[data-dsa-target]');

  const dsaArray = [7, 12, 19, 28, 35, 42, 53, 67, 74, 89];
  let dsaLow = 0;
  let dsaHigh = dsaArray.length - 1;
  let dsaMid = -1;
  let dsaFinished = false;
  let dsaAutoInterval = null;

  function renderDsaTape() {
    if (!dsaGrid) return;
    dsaGrid.innerHTML = '';
    dsaArray.forEach((val, idx) => {
      const cell = document.createElement('div');
      cell.className = 'dsa-cell';
      if (idx < dsaLow || idx > dsaHigh) {
        cell.classList.add('eliminated');
      }
      if (idx === dsaMid) {
        cell.classList.add('active-mid');
      }
      const target = parseInt(dsaTargetSelect ? dsaTargetSelect.value : '42', 10);
      if (dsaFinished && val === target && idx === dsaMid) {
        cell.classList.remove('active-mid');
        cell.classList.add('found-match');
      }
      cell.innerHTML = `
        <span class="dsa-cell-val">${val}</span>
        <span class="dsa-cell-idx">[${idx}]</span>
      `;
      dsaGrid.appendChild(cell);
    });
  }

  function resetDsa() {
    dsaLow = 0;
    dsaHigh = dsaArray.length - 1;
    dsaMid = -1;
    dsaFinished = false;
    if (dsaAutoInterval) {
      clearInterval(dsaAutoInterval);
      dsaAutoInterval = null;
    }
    if (dsaStatus) {
      dsaStatus.innerHTML = `Search initialized. Range: [0 ... ${dsaHigh}]. Click <strong>Step Next</strong> to calculate Mid pointer.`;
    }
    renderDsaTape();
  }

  function stepDsa() {
    if (dsaFinished) {
      resetDsa();
      return;
    }
    const target = parseInt(dsaTargetSelect ? dsaTargetSelect.value : '42', 10);

    if (dsaLow > dsaHigh) {
      dsaFinished = true;
      if (dsaStatus) {
        dsaStatus.innerHTML = `<span style="color: #ff7b72;">Target ${target} NOT found in memory</span>. Range collapsed (Low > High).`;
      }
      playHapticClick(350, 0.03);
      renderDsaTape();
      return;
    }

    dsaMid = Math.floor((dsaLow + dsaHigh) / 2);
    const midVal = dsaArray[dsaMid];
    renderDsaTape();

    if (midVal === target) {
      dsaFinished = true;
      if (dsaStatus) {
        dsaStatus.innerHTML = `<span style="color: var(--accent-live); font-weight: 700;">Success! Found ${target} at memory offset [${dsaMid}].</span> Verified in O(log N).`;
      }
      playHapticClick(1000, 0.03);
    } else if (midVal < target) {
      if (dsaStatus) {
        dsaStatus.innerHTML = `Mid [${dsaMid}] = ${midVal} &lt; ${target}. Eliminating left partition. Moving Low to [${dsaMid + 1}].`;
      }
      dsaLow = dsaMid + 1;
      playHapticClick(650, 0.015);
    } else {
      if (dsaStatus) {
        dsaStatus.innerHTML = `Mid [${dsaMid}] = ${midVal} &gt; ${target}. Eliminating right partition. Moving High to [${dsaMid - 1}].`;
      }
      dsaHigh = dsaMid - 1;
      playHapticClick(650, 0.015);
    }
  }

  window.runDsaStep = stepDsa;

  if (dsaStepBtn) dsaStepBtn.addEventListener('click', stepDsa);
  if (dsaResetBtn) dsaResetBtn.addEventListener('click', resetDsa);
  if (dsaTargetSelect) dsaTargetSelect.addEventListener('change', resetDsa);

  if (dsaAutoBtn) {
    dsaAutoBtn.addEventListener('click', () => {
      if (dsaAutoInterval) {
        clearInterval(dsaAutoInterval);
        dsaAutoInterval = null;
        dsaAutoBtn.textContent = 'Auto Run';
      } else {
        dsaAutoBtn.textContent = 'Pause';
        dsaAutoInterval = setInterval(() => {
          if (dsaFinished) {
            clearInterval(dsaAutoInterval);
            dsaAutoInterval = null;
            dsaAutoBtn.textContent = 'Auto Run';
          } else {
            stepDsa();
          }
        }, 900);
      }
    });
  }

  resetDsa();

  // ---------------------------------------------------------------------------
  // 11. CONTACT FORM VALIDATION & ASYNC SUBMISSION
  // ---------------------------------------------------------------------------
  const form = document.querySelector('[data-form]');
  const formInputs = document.querySelectorAll('[data-form-input]');
  const formBtn = document.querySelector('[data-form-btn]');
  const formFeedback = document.querySelector('[data-form-feedback]');

  if (form && formBtn) {
    formInputs.forEach(input => {
      input.addEventListener('input', () => {
        const allValid = Array.from(formInputs).every(inp => inp.value.trim().length > 0);
        formBtn.disabled = !allValid;
      });
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const allValid = Array.from(formInputs).every(inp => inp.value.trim().length > 0);
      if (!allValid) return;

      const originalBtnHtml = formBtn.innerHTML;
      formBtn.disabled = true;
      formBtn.innerHTML = `
        <span>Sending...</span>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin-icon">
          <circle cx="12" cy="12" r="10" stroke-dasharray="32" stroke-linecap="round"></circle>
        </svg>
      `;

      if (formFeedback) {
        formFeedback.style.display = 'none';
        formFeedback.textContent = '';
      }

      try {
        const formData = new FormData(form);
        const endpoint = form.action || 'https://formsubmit.co/ushantgiri3@gmail.com';
        const response = await fetch(endpoint, {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json'
          }
        });

        if (response.ok) {
          form.reset();
          formBtn.disabled = true;
          if (formFeedback) {
            formFeedback.style.display = 'block';
            formFeedback.style.background = 'rgba(48, 209, 88, 0.12)';
            formFeedback.style.color = '#30d158';
            formFeedback.style.border = '1px solid rgba(48, 209, 88, 0.3)';
            formFeedback.textContent = 'Message dispatched successfully! Ushant will get back to you shortly.';
          }
          playHapticClick(850, 0.02);
        } else {
          throw new Error('Network response not ok');
        }
      } catch (err) {
        if (formFeedback) {
          formFeedback.style.display = 'block';
          formFeedback.style.background = 'rgba(255, 59, 48, 0.12)';
          formFeedback.style.color = '#ff453a';
          formFeedback.style.border = '1px solid rgba(255, 59, 48, 0.3)';
          formFeedback.innerHTML = 'Transmission failed. You can connect directly on <a href="https://wa.me/9779805315275" target="_blank" rel="noopener noreferrer" style="color: inherit; text-decoration: underline; font-weight: 600;">WhatsApp (+977 9805315275)</a> or via email ushantgiri3@gmail.com.';
        }
        playHapticClick(400, 0.02);
      } finally {
        formBtn.innerHTML = originalBtnHtml;
      }
    });
  }

  // ---------------------------------------------------------------------------
  // 12. WHATSAPP FLOATING TRIGGER & OFFLINE CLIENT CONCIERGE BOT ENGINE
  // ---------------------------------------------------------------------------
  const waTrigger = document.querySelector('[data-wa-trigger]');
  const waSheet = document.querySelector('[data-wa-sheet]');
  const waClose = document.querySelector('[data-wa-close]');
  const waBadge = document.querySelector('[data-wa-badge]');
  const waBody = document.querySelector('[data-wa-body]');
  const waForm = document.querySelector('[data-wa-form]');
  const waInput = document.querySelector('[data-wa-input]');
  const waTopicBtns = document.querySelectorAll('[data-wa-topic]');

  const waPhone = '9779805315275';

  function toggleWaModal(forceState) {
    if (!waSheet) return;
    const isCurrentlyActive = waSheet.classList.contains('active');
    const targetState = typeof forceState === 'boolean' ? forceState : !isCurrentlyActive;

    if (targetState) {
      waSheet.classList.add('active');
      waSheet.setAttribute('aria-hidden', 'false');
      if (waTrigger) waTrigger.setAttribute('aria-expanded', 'true');
      if (waBadge) waBadge.classList.add('hidden');
      if (waInput) setTimeout(() => waInput.focus(), 200);
      playHapticClick(850, 0.015);
    } else {
      waSheet.classList.remove('active');
      waSheet.setAttribute('aria-hidden', 'true');
      if (waTrigger) waTrigger.setAttribute('aria-expanded', 'false');
      playHapticClick(450, 0.015);
    }
  }

  window.toggleWaModal = toggleWaModal;

  if (waTrigger) {
    waTrigger.addEventListener('click', (e) => {
      e.preventDefault();
      toggleWaModal();
    });
  }

  if (waClose) {
    waClose.addEventListener('click', (e) => {
      e.preventDefault();
      toggleWaModal(false);
    });
  }

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!waSheet || !waSheet.classList.contains('active')) return;
    if (waSheet.contains(e.target) || (waTrigger && waTrigger.contains(e.target))) return;
    toggleWaModal(false);
  });

  // Pre-scripted responses for offline assistant
  const scriptedBotReplies = {
    project: {
      text: "Ushant specializes in end-to-end full-stack software: high-throughput web apps (Next.js 16, TypeScript), backend APIs (FastAPI, Node.js), cloud databases (Supabase, Firebase), and streaming systems. Ready to review project scopes, timelines, or technical specs directly on WhatsApp.",
      ctaText: "Chat on WhatsApp about a Project",
      prefill: "Hi Ushant, I would like to discuss a software project with you."
    },
    kolve: {
      text: "Ushant is Co-Founder & Lead Systems Engineer at KOLVE alongside 3 partners (Sandesh, Bhishan, Jeshis). KOLVE is an independent digital services and solutions studio in Sunsari, Nepal delivering modern Next.js platforms and practical technology.",
      ctaText: "Inquire about KOLVE Services",
      prefill: "Hi Ushant, I'm interested in KOLVE services and collaboration."
    },
    stack: {
      text: "Core engineering competencies:\n• Cloud Backends: FastAPI, Supabase, Firebase, Node.js, WebSockets\n• Systems & Algorithms: Python, C/C++ (DSA, pointer memory, binary I/O)\n• Frontend & Architecture: Next.js 16, TypeScript, Tailwind CSS, Apple Studio UI",
      ctaText: "Discuss Tech Specs on WhatsApp",
      prefill: "Hi Ushant, reaching out regarding your technical stack and capabilities."
    },
    hours: {
      text: "Based in Sunsari/Dharan, Nepal (GMT +5:45). When offline or coding, Ushant checks incoming WhatsApp pings within 1–2 hours during business hours.",
      ctaText: "Send Direct WhatsApp Message",
      prefill: "Hi Ushant, sending you a quick message from your portfolio."
    }
  };

  function appendBotBubble(contentHtml) {
    if (!waBody) return;
    const bubble = document.createElement('div');
    bubble.className = 'wa-msg-bubble incoming';
    bubble.innerHTML = `
      <p class="wa-msg-text">${contentHtml}</p>
      <span class="wa-msg-meta">Auto • Just now</span>
    `;
    waBody.appendChild(bubble);
    waBody.scrollTop = waBody.scrollHeight;
  }

  function appendUserBubble(text) {
    if (!waBody) return;
    const bubble = document.createElement('div');
    bubble.className = 'wa-msg-bubble outgoing';
    const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    bubble.innerHTML = `
      <p class="wa-msg-text">${escaped}</p>
      <span class="wa-msg-meta">You • Just now</span>
    `;
    waBody.appendChild(bubble);
    waBody.scrollTop = waBody.scrollHeight;
  }

  // Handle topic clicks
  waTopicBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const topic = btn.getAttribute('data-wa-topic');
      const reply = scriptedBotReplies[topic];
      if (!reply) return;

      playHapticClick(650, 0.012);

      // Append user inquiry label
      const topicLabel = btn.querySelector('span')?.textContent || topic;
      appendUserBubble(topicLabel);

      // Short delay for natural typing effect
      setTimeout(() => {
        const formattedText = reply.text.replace(/\n/g, '<br>');
        const waLink = `https://wa.me/${waPhone}?text=${encodeURIComponent(reply.prefill)}`;
        const fullHtml = `
          ${formattedText}
          <div style="margin-top: 0.5rem;">
            <a href="${waLink}" target="_blank" rel="noopener noreferrer" class="wa-dispatch-btn">
              <span>${reply.ctaText}</span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </a>
          </div>
        `;
        appendBotBubble(fullHtml);
        playHapticClick(900, 0.015);
      }, 300);
    });
  });

  // Handle client custom message form
  if (waForm && waInput) {
    waForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const userText = waInput.value.trim();
      if (!userText) return;

      appendUserBubble(userText);
      waInput.value = '';
      playHapticClick(700, 0.012);

      setTimeout(() => {
        const waLink = `https://wa.me/${waPhone}?text=${encodeURIComponent('Hi Ushant, ' + userText)}`;
        const responseHtml = `
          Thank you for reaching out! Because I'm offline right now, click the button below to forward your inquiry directly to my WhatsApp (+977 9805315275) so my phone alerts me immediately:
          <div style="margin-top: 0.55rem;">
            <a href="${waLink}" target="_blank" rel="noopener noreferrer" class="wa-dispatch-btn">
              <span>Forward to WhatsApp Phone (+977 9805315275)</span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </a>
          </div>
        `;
        appendBotBubble(responseHtml);
        playHapticClick(920, 0.016);
      }, 400);
    });
  }

})();
