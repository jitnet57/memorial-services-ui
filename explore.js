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

    // ===== MEMORIAL MAP DATA =====
    var memorialsMapData = [
        {
            id: 'maria-santos',
            name: 'Maria Santos',
            dates: '1945 — 2024',
            location: 'Manila Memorial Park, Parañaque',
            avatar: 'https://ui-avatars.com/api/?name=Maria+Santos&background=6366f1&color=fff&size=48',
            link: 'memorial.html',
            lat: 14.4944, lng: 121.0179,
            candles: 342, tributes: 128
        },
        {
            id: 'jose-reyes',
            name: 'Jose Reyes',
            dates: '1938 — 2023',
            location: 'Quezon City, Metro Manila',
            avatar: 'https://ui-avatars.com/api/?name=Jose+Reyes&background=6366f1&color=fff&size=48',
            link: 'memorial.html',
            lat: 14.6760, lng: 121.0437,
            candles: 218, tributes: 94
        },
        {
            id: 'carmen-dela-cruz',
            name: 'Carmen Dela Cruz',
            dates: '1952 — 2024',
            location: 'Cebu City, Cebu',
            avatar: 'https://ui-avatars.com/api/?name=Carmen+Dela+Cruz&background=6366f1&color=fff&size=48',
            link: 'memorial.html',
            lat: 10.3157, lng: 123.8854,
            candles: 456, tributes: 201
        },
        {
            id: 'roberto-garcia',
            name: 'Roberto Garcia',
            dates: '1940 — 2022',
            location: 'Davao City, Davao del Sur',
            avatar: 'https://ui-avatars.com/api/?name=Roberto+Garcia&background=6366f1&color=fff&size=48',
            link: 'memorial.html',
            lat: 7.1907, lng: 125.4553,
            candles: 189, tributes: 67
        },
        {
            id: 'luisa-mendoza',
            name: 'Luisa Mendoza',
            dates: '1960 — 2024',
            location: 'Makati, Metro Manila',
            avatar: 'https://ui-avatars.com/api/?name=Luisa+Mendoza&background=6366f1&color=fff&size=48',
            link: 'memorial.html',
            lat: 14.5547, lng: 121.0244,
            candles: 278, tributes: 145
        },
        {
            id: 'antonio-ramos',
            name: 'Antonio Ramos',
            dates: '1935 — 2023',
            location: 'Baguio City, Benguet',
            avatar: 'https://ui-avatars.com/api/?name=Antonio+Ramos&background=6366f1&color=fff&size=48',
            link: 'memorial.html',
            lat: 16.4023, lng: 120.5960,
            candles: 312, tributes: 156
        },
        {
            id: 'teresa-villanueva',
            name: 'Teresa Villanueva',
            dates: '1948 — 2024',
            location: 'Iloilo City, Iloilo',
            avatar: 'https://ui-avatars.com/api/?name=Teresa+Villanueva&background=6366f1&color=fff&size=48',
            link: 'memorial.html',
            lat: 10.6969, lng: 122.5644,
            candles: 167, tributes: 89
        },
        {
            id: 'pedro-aquino',
            name: 'Pedro Aquino',
            dates: '1942 — 2023',
            location: 'Tagaytay, Cavite',
            avatar: 'https://ui-avatars.com/api/?name=Pedro+Aquino&background=6366f1&color=fff&size=48',
            link: 'memorial.html',
            lat: 14.1153, lng: 120.9621,
            candles: 245, tributes: 112
        },
        {
            id: 'sofia-tan',
            name: 'Sofia Tan',
            dates: '1955 — 2024',
            location: 'Zamboanga City, Zamboanga del Sur',
            avatar: 'https://ui-avatars.com/api/?name=Sofia+Tan&background=6366f1&color=fff&size=48',
            link: 'memorial.html',
            lat: 6.9214, lng: 122.0790,
            candles: 398, tributes: 176
        }
    ];

    var leafletMap = null;
    var mapMarkers = {};

    function initMap() {
        if (leafletMap) return;
        if (typeof L === 'undefined') return;

        leafletMap = L.map('memorialMap', {
            center: [12.5, 122.5],
            zoom: 6,
            zoomControl: true
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 18
        }).addTo(leafletMap);

        memorialsMapData.forEach(function (m) {
            addMapMarker(m);
        });
    }

    function addMapMarker(m) {
        var pinned = isPinned(m.id);
        var icon = L.divIcon({
            className: '',
            html: '<div class="memorial-map-marker' + (pinned ? ' is-pinned' : '') + '">' +
                  '<img src="' + m.avatar + '" alt="' + m.name + '">' +
                  '</div>',
            iconSize: [42, 42],
            iconAnchor: [21, 42],
            popupAnchor: [0, -44]
        });

        var marker = L.marker([m.lat, m.lng], { icon: icon });

        var popupContent =
            '<div class="memorial-map-popup">' +
            '<div class="memorial-map-popup-header">' +
            '<img src="' + m.avatar + '" class="memorial-map-popup-avatar" alt="' + m.name + '">' +
            '<div>' +
            '<div class="memorial-map-popup-name">' + m.name + '</div>' +
            '<div class="memorial-map-popup-dates">' + m.dates + '</div>' +
            '</div></div>' +
            '<div class="memorial-map-popup-location">📍 ' + m.location + '</div>' +
            '<div class="memorial-map-popup-stats">' +
            '<span>🕯️ ' + m.candles + ' candles</span>' +
            '<span>❤️ ' + m.tributes + ' tributes</span>' +
            '</div>' +
            '<a href="' + m.link + '" class="memorial-map-popup-link">Visit Memorial →</a>' +
            '</div>';

        marker.bindPopup(popupContent, { maxWidth: 240 });
        marker.addTo(leafletMap);
        mapMarkers[m.id] = marker;
    }

    function refreshMapMarker(id) {
        if (!leafletMap || !mapMarkers[id]) return;
        var m = memorialsMapData.find(function (d) { return d.id === id; });
        if (!m) return;
        leafletMap.removeLayer(mapMarkers[id]);
        delete mapMarkers[id];
        addMapMarker(m);
    }

    // ===== VIEW TOGGLE (Grid / List / Map) =====
    const viewToggle = document.getElementById('viewToggle');
    const memorialGrid = document.getElementById('memorialGrid');
    var mapContainer = document.getElementById('exploreMapContainer');
    var paginationSection = document.querySelector('.explore-pagination-section');

    if (viewToggle && memorialGrid) {
        viewToggle.addEventListener('click', function (e) {
            const btn = e.target.closest('.view-btn');
            if (!btn) return;
            viewToggle.querySelectorAll('.view-btn').forEach(function (b) {
                b.classList.remove('active');
            });
            btn.classList.add('active');

            var view = btn.getAttribute('data-view');

            if (view === 'map') {
                memorialGrid.style.display = 'none';
                if (mapContainer) mapContainer.classList.add('active');
                if (paginationSection) paginationSection.style.display = 'none';
                initMap();
                if (leafletMap) {
                    setTimeout(function () { leafletMap.invalidateSize(); }, 100);
                }
            } else {
                memorialGrid.style.display = '';
                if (mapContainer) mapContainer.classList.remove('active');
                if (paginationSection) paginationSection.style.display = '';
                if (view === 'list') {
                    memorialGrid.classList.add('list-view');
                } else {
                    memorialGrid.classList.remove('list-view');
                }
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

    // ===== PIN FEATURE =====
    var PINS_KEY = 'alaala-pinned-memorials';

    function getPins() {
        try { return JSON.parse(localStorage.getItem(PINS_KEY)) || []; }
        catch (e) { return []; }
    }

    function savePins(pins) {
        localStorage.setItem(PINS_KEY, JSON.stringify(pins));
    }

    function isPinned(id) {
        return getPins().some(function (p) { return p.id === id; });
    }

    function togglePin(card) {
        var id = card.getAttribute('data-memorial-id');
        var nameEl = card.querySelector('.memorial-card-name');
        var locEl = card.querySelector('.memorial-card-location');
        var avatarEl = card.querySelector('.memorial-card-avatar img');
        var linkEl = card.querySelector('.memorial-card-btn');

        var name = nameEl ? nameEl.textContent.trim() : '';
        var location = locEl ? locEl.textContent.replace(/^\s*\S+\s*/, '').trim() : '';
        var avatar = avatarEl ? avatarEl.src : '';
        var link = linkEl ? linkEl.getAttribute('href') : 'memorial.html';

        var pins = getPins();
        var idx = pins.findIndex(function (p) { return p.id === id; });

        if (idx >= 0) {
            pins.splice(idx, 1);
        } else {
            pins.push({ id: id, name: name, location: location, avatar: avatar, link: link });
        }

        savePins(pins);
        var nowPinned = pins.some(function (p) { return p.id === id; });
        updatePinButton(card, nowPinned);
        renderPinnedSidebar();
        refreshMapMarker(id);
    }

    function updatePinButton(card, pinned) {
        var btn = card.querySelector('.memorial-card-pin-btn');
        if (!btn) return;
        btn.classList.toggle('pinned', pinned);
        btn.title = pinned ? 'Unpin memorial' : 'Pin for easy access';
    }

    function renderPinnedSidebar() {
        var list = document.getElementById('pinnedList');
        if (!list) return;
        var pins = getPins();

        if (pins.length === 0) {
            list.innerHTML = '<p class="explore-pinned-empty">Pin a memorial to access it quickly here.</p>';
            return;
        }

        list.innerHTML = pins.map(function (p) {
            return '<a href="' + p.link + '" class="explore-pinned-item">' +
                '<img src="' + p.avatar + '" alt="' + p.name + '">' +
                '<div class="explore-pinned-item-info">' +
                    '<p class="explore-pinned-item-name">' + p.name + '</p>' +
                    '<p class="explore-pinned-item-meta">' + p.location + '</p>' +
                '</div>' +
                '<button class="explore-pinned-unpin" data-unpin="' + p.id + '" title="Unpin" aria-label="Unpin">' +
                    '<span class="material-symbols-outlined">close</span>' +
                '</button>' +
                '</a>';
        }).join('');

        list.querySelectorAll('.explore-pinned-unpin').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var unpinId = btn.getAttribute('data-unpin');
                var cardEl = document.querySelector('.memorial-card[data-memorial-id="' + unpinId + '"]');
                if (cardEl) {
                    var pins2 = getPins().filter(function (p) { return p.id !== unpinId; });
                    savePins(pins2);
                    updatePinButton(cardEl, false);
                    renderPinnedSidebar();
                    refreshMapMarker(unpinId);
                }
            });
        });
    }

    // Init pin buttons
    document.querySelectorAll('.memorial-card[data-memorial-id]').forEach(function (card) {
        var pinBtn = card.querySelector('.memorial-card-pin-btn');
        if (!pinBtn) return;
        updatePinButton(card, isPinned(card.getAttribute('data-memorial-id')));
        pinBtn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            togglePin(card);
        });
    });

    renderPinnedSidebar();

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
