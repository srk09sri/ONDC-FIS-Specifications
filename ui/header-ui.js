// ui/header-ui.js
// Header helpers: show/hide quick-nav & version, header search, back-to-top, quickNavigate, headerSearch

// show/hide the Branch ("version-dropdown")
function setVersionVisibility(show) {
  const version = document.getElementById('version-dropdown');
  if (!version) return;
  // Use class-based transitions instead of abrupt style.display toggles
  if (show) {
    version.classList.add('label-inline', 'v-visible');
    version.classList.remove('v-hidden', 'd-none');
    version.style.display = 'inline-flex';
    version.setAttribute('aria-hidden', 'false');
  } else {
    version.classList.remove('v-visible');
    version.classList.add('v-hidden');
    version.setAttribute('aria-hidden', 'true');
    // keep layout stable for transition, hide after short delay
    setTimeout(() => { if (version.classList.contains('v-hidden')) version.style.display = 'none'; }, 220);
  }
}

// show/hide quick nav (Module)
function showQuickNav(show) {
  const quick = document.getElementById('quick-nav-container');
  if (!quick) return;
  if (show) {
    quick.classList.add('label-inline', 'v-visible');
    quick.classList.remove('v-hidden', 'd-none');
    quick.style.display = 'inline-flex';
    quick.setAttribute('aria-hidden', 'false');
  } else {
    quick.classList.remove('v-visible');
    quick.classList.add('v-hidden');
    quick.setAttribute('aria-hidden', 'true');
    setTimeout(() => { if (quick.classList.contains('v-hidden')) quick.style.display = 'none'; }, 220);
  }
}

// reset Module: dropdown to default
function resetQuickNav() {
    const quickNav = document.getElementById('quick-nav');
    if (quickNav) quickNav.value = ""; // reset to "Quick Jump"
  }

// show/hide header search (home-only)
function showHeaderSearch(show) {
  const headerSearch = document.getElementById('header-search');
  if (!headerSearch) return;
  headerSearch.style.display = show ? '' : 'none';
}

// smooth scroll to top (used by back-to-top element)
function smoothScrollTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// quick navigation to a tab/section
function quickNavigate(target) {
  if (!target) return;
  const tabTrigger = document.querySelector(`a[href="${target}"]`);
  if (tabTrigger && typeof tabTrigger.click === 'function') tabTrigger.click();
  setTimeout(() => {
    const el = document.querySelector(target);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 150);
}

// header search — filters branch cards on the home page
function headerSearch(term) {
  term = (term || '').trim().toLowerCase();
  const home = document.getElementById('home');
  const isHomeVisible = home && window.getComputedStyle(home).display !== 'none';
  if (!isHomeVisible) return;
  const cards = document.querySelectorAll('#branchesList .branch-card');
  cards.forEach(card => {
    const txt = card.innerText.toLowerCase();
    card.style.display = txt.includes(term) ? '' : 'none';
  });
}

// init logic
(function initHeaderUI() {
  // Back-to-top show/hide
  const btn = document.getElementById('back-to-top');
  if (btn) {
    const onScroll = () => {
      if (window.scrollY > 300) btn.classList.add('show');
      else btn.classList.remove('show');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  const homeEl = document.getElementById('home');
  const contentEl = document.getElementById('content');

  // Decide UI state based on URL param OR actual DOM visibility
  function updateUIStateFromUrlOrDom() {
    const params = new URLSearchParams(window.location.search);
    const hasBranchParam = !!params.get('branch');

    // If explicit branch param present, prefer that (legacy behavior)
    if (hasBranchParam) {
      showQuickNav(true);
      showHeaderSearch(false);
      // Branch selector should be visible on branch/content view as well
      setVersionVisibility(true);
      return;
    }

    // Otherwise, infer from DOM visibility (more robust)
    const isHomeVisible = homeEl && window.getComputedStyle(homeEl).display !== 'none';
    const isContentVisible = contentEl && window.getComputedStyle(contentEl).display !== 'none';

    // show search only on home
    showHeaderSearch(isHomeVisible);
    // show quick-nav when content/branch view is visible
    showQuickNav(isContentVisible);
    // show version-dropdown (Branch) on home OR content
    setVersionVisibility(isHomeVisible || isContentVisible);

    //reset dropdown each time UI state changes
    resetQuickNav();
  }

  // initial run
  updateUIStateFromUrlOrDom();

  // When user clicks a branch link in the branches table, show quick-nav and hide search
  document.body.addEventListener('click', (e) => {
    const link = e.target.closest('.branchLink');
    if (link) {
      // small delay to allow other handlers (resolveHomePage) to run
      setTimeout(() => {
        showQuickNav(true);
        showHeaderSearch(false);
        // show branch selector for branch/content view
        setVersionVisibility(true);
      }, 150);
        resetQuickNav();
    }
  });

  // When contract-dropdown changes (select branch), show quick-nav and version, hide search
  const contractDropdown = document.getElementById('contract-dropdown');
  if (contractDropdown) {
    contractDropdown.addEventListener('change', () => {
      showQuickNav(true);
      showHeaderSearch(false);
      setVersionVisibility(true);
      resetQuickNav();
    });
  }

  // Listen for history changes (back/forward) and toggle UI accordingly
  window.addEventListener('popstate', () => {
    updateUIStateFromUrlOrDom();
  });

  // MutationObserver to detect manual content/home visibility changes (covers cases where other scripts toggle display)
  const obsCallback = () => {
    updateUIStateFromUrlOrDom();
  };
  try {
    const observer = new MutationObserver(obsCallback);
    if (homeEl) observer.observe(homeEl, { attributes: true, attributeFilter: ['style', 'class'] });
    if (contentEl) observer.observe(contentEl, { attributes: true, attributeFilter: ['style', 'class'] });
  } catch (e) {
    // MutationObserver not critical; ignore if unsupported
  }

  // Expose functions globally for HTML inline handlers
  window.showQuickNav = showQuickNav;
  window.showHeaderSearch = showHeaderSearch;
  window.smoothScrollTop = smoothScrollTop;
  window.quickNavigate = quickNavigate;
  window.headerSearch = headerSearch;
  window.setVersionVisibility = setVersionVisibility;
})();
