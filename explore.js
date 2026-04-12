/* ========================================
   ALAALA — Explore Page Scripts
   ======================================== */

(function () {
    'use strict';

    // ===== THEME TOGGLE =====
    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement;
    const THEME_KEY = 'alaala-theme';

    function applyTheme(theme) {
        html.setAttribute('data-theme', theme);
        localStorage.setItem(THEME_KEY, theme);
    }

    // Load saved theme
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme) applyTheme(savedTheme);

    if (themeToggle) {
        themeToggle.addEventListener('click', function () {
            const current = html.getAttribute('data-theme');
            applyTheme(current === 'dark' ? 'light' : 'dark');
        });
    }

    // ===== SEARCH INPUT FOCUS EFFECTS =====
    const searchInput = document.getElementById('searchInput');
    const searchBar = searchInput ? searchInput.closest('.explore-search-bar') : null;

    if (searchInput && searchBar) {
        searchInput.addEventListener('focus', function () {
            searchBar.classList.add('focused');
        });
        searchInput.addEventListener('blur', function () {
            searchBar.classList.remove('focused');
        });
    }

    // ===== SEARCH FORM SUBMIT (prototype — prevent default) =====
    const searchForm = document.getElementById('searchForm');
    if (searchForm) {
        searchForm.addEventListener('submit', function (e) {
            e.preventDefault();
        });
    }

    // ===== FILTER CHIPS =====
    const filterChips = document.getElementById('filterChips');
    if (filterChips) {
        filterChips.addEventListener('click', function (e) {
            const chip = e.target.closest('.filter-chip');
            if (!chip) return;
            filterChips.querySelectorAll('.filter-chip').forEach(function (c) {
                c.classList.remove('active');
            });
            chip.classList.add('active');
        });
    }

    // ===== VIEW TOGGLE (Grid / List) =====
    const viewToggle = document.getElementById('viewToggle');
    const memorialGrid = document.getElementById('memorialGrid');

    if (viewToggle && memorialGrid) {
        viewToggle.addEventListener('click', function (e) {
            const btn = e.target.closest('.view-btn');
            if (!btn) return;
            viewToggle.querySelectorAll('.view-btn').forEach(function (b) {
                b.classList.remove('active');
            });
            btn.classList.add('active');

            var view = btn.getAttribute('data-view');
            if (view === 'list') {
                memorialGrid.classList.add('list-view');
            } else {
                memorialGrid.classList.remove('list-view');
            }
        });
    }

    // ===== SORT DROPDOWN =====
    var sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', function () {
            // Visual-only for prototype
        });
    }

    // ===== PAGINATION =====
    var pagination = document.getElementById('pagination');
    if (pagination) {
        pagination.addEventListener('click', function (e) {
            var pageBtn = e.target.closest('.pagination-page');
            if (!pageBtn) return;
            pagination.querySelectorAll('.pagination-page').forEach(function (p) {
                p.classList.remove('active');
            });
            pageBtn.classList.add('active');

            // Update prev/next disabled state
            var pages = Array.from(pagination.querySelectorAll('.pagination-page'));
            var activeIndex = pages.indexOf(pageBtn);
            var prevBtn = pagination.querySelector('.pagination-prev');
            var nextBtn = pagination.querySelector('.pagination-next');

            if (prevBtn) prevBtn.disabled = activeIndex === 0;
            if (nextBtn) nextBtn.disabled = activeIndex === pages.length - 1;
        });

        // Prev / Next buttons
        var prevBtn = pagination.querySelector('.pagination-prev');
        var nextBtn = pagination.querySelector('.pagination-next');

        function navigatePage(direction) {
            var pages = Array.from(pagination.querySelectorAll('.pagination-page'));
            var activeIndex = pages.findIndex(function (p) { return p.classList.contains('active'); });
            var newIndex = activeIndex + direction;
            if (newIndex >= 0 && newIndex < pages.length) {
                pages[activeIndex].classList.remove('active');
                pages[newIndex].classList.add('active');
                if (prevBtn) prevBtn.disabled = newIndex === 0;
                if (nextBtn) nextBtn.disabled = newIndex === pages.length - 1;
            }
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', function () { navigatePage(-1); });
        }
        if (nextBtn) {
            nextBtn.addEventListener('click', function () { navigatePage(1); });
        }
    }

    // ===== SCROLL-REVEAL (IntersectionObserver) =====
    var revealCards = document.querySelectorAll('.reveal-card');
    if (revealCards.length > 0 && 'IntersectionObserver' in window) {
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    // Stagger animation based on card index
                    var card = entry.target;
                    var siblings = Array.from(card.parentElement.children);
                    var index = siblings.indexOf(card);
                    card.style.transitionDelay = (index % 3) * 80 + 'ms';
                    card.classList.add('visible');
                    observer.unobserve(card);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -40px 0px'
        });

        revealCards.forEach(function (card) {
            observer.observe(card);
        });
    } else {
        // Fallback: show all cards immediately
        revealCards.forEach(function (card) {
            card.classList.add('visible');
        });
    }

})();
