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

    var gMap = null;
    var mapMarkers = {};
    var activePopup = null;

    function createPinIcon(initial, pinned) {
        var fill = pinned ? '#f59e0b' : '#5ba4d3';
        var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="36" height="46" viewBox="0 0 36 46">' +
            '<circle cx="18" cy="18" r="16" fill="' + fill + '" stroke="white" stroke-width="2.5"/>' +
            '<text x="18" y="24" text-anchor="middle" font-family="Arial,sans-serif" font-size="14" font-weight="bold" fill="white">' + initial + '</text>' +
            '<polygon points="10,32 26,32 18,46" fill="' + fill + '"/>' +
            '</svg>';
        return L.divIcon({
            html: '<img src="data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg) + '" width="36" height="46"/>',
            iconSize: [36, 46],
            iconAnchor: [18, 46],
            popupAnchor: [0, -46],
            className: ''
        });
    }

    function makePopupContent(m) {
        var initial = m.name.charAt(0).toUpperCase();
        var gmapsUrl = 'https://www.google.com/maps?q=' + m.lat + ',' + m.lng;
        var wazeUrl = 'https://waze.com/ul?ll=' + m.lat + ',' + m.lng + '&navigate=yes';
        return '<div class="memorial-map-popup">' +
            '<div class="memorial-map-popup-header">' +
            '<div style="width:40px;height:40px;border-radius:50%;background:#5ba4d3;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:16px;flex-shrink:0;">' + initial + '</div>' +
            '<div><div class="memorial-map-popup-name">' + m.name + '</div>' +
            '<div class="memorial-map-popup-dates">' + m.dates + '</div>' +
            '</div></div>' +
            '<div class="memorial-map-popup-location">📍 ' + m.location + '</div>' +
            '<div class="memorial-map-popup-stats">' +
            '<span>🕯️ ' + m.candles + ' candles</span>' +
            '<span>❤️ ' + m.tributes + ' tributes</span>' +
            '</div>' +
            '<div class="memorial-map-popup-nav">' +
            '<a href="' + gmapsUrl + '" target="_blank" rel="noopener" class="memorial-map-nav-btn gmaps-btn">' +
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>' +
            'Google Maps</a>' +
            '<a href="' + wazeUrl + '" target="_blank" rel="noopener" class="memorial-map-nav-btn waze-btn">' +
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.54 6.63C19.08 4.04 16.6 2.23 13.69 1.8c-4.34-.63-8.52 2.17-9.6 6.41-.38 1.51-.25 3.07.24 4.5L2 20l7.5-2.25c.85.28 1.74.42 2.64.42 4.42 0 8.05-3.45 8.37-7.86.15-1.93-.41-3.78-1.47-5.27v-.41z"/></svg>' +
            'Waze</a>' +
            '</div>' +
            '<div class="memorial-map-popup-actions">' +
            '<a href="' + m.link + '" class="memorial-map-popup-link">Visit Memorial →</a>' +
            '<button class="memorial-map-popup-scroll" data-scroll-to="' + m.id + '">See card ↓</button>' +
            '</div></div>';
    }

    function initMap() {
        if (gMap) return;
        var mapEl = document.getElementById('memorialMap');
        if (!mapEl || typeof L === 'undefined') return;
        gMap = L.map(mapEl, { zoomControl: true }).setView([12.5, 122.5], 6);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 19
        }).addTo(gMap);
        memorialsMapData.forEach(function (m) { addMapMarker(m); });
    }

    function focusCard(id) {
        var card = document.querySelector('.memorial-card[data-memorial-id="' + id + '"]');
        if (!card) return;
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        card.classList.add('map-linked');
        setTimeout(function () { card.classList.remove('map-linked'); }, 1800);
    }

    function focusMapMarker(id) {
        var m = memorialsMapData.find(function (d) { return d.id === id; });
        var data = mapMarkers[id];
        if (!m || !data || !gMap) return;
        document.getElementById('memorialMap').scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(function () {
            gMap.setView([m.lat, m.lng], 13);
            setTimeout(function () { data.marker.openPopup(); }, 400);
        }, 400);
    }

    function addMapMarker(m) {
        var pinned = isPinned(m.id);
        var marker = L.marker([m.lat, m.lng], {
            icon: createPinIcon(m.name.charAt(0).toUpperCase(), pinned),
            title: m.name
        }).addTo(gMap);

        marker.bindPopup(makePopupContent(m), { maxWidth: 260 });

        marker.on('popupopen', function () {
            var btn = document.querySelector('.memorial-map-popup-scroll[data-scroll-to="' + m.id + '"]');
            if (btn) {
                btn.onclick = function () {
                    marker.closePopup();
                    focusCard(m.id);
                };
            }
        });

        mapMarkers[m.id] = { marker: marker };
    }

    function refreshMapMarker(id) {
        if (!gMap || !mapMarkers[id]) return;
        var m = memorialsMapData.find(function (d) { return d.id === id; });
        if (!m) return;
        mapMarkers[id].marker.remove();
        delete mapMarkers[id];
        addMapMarker(m);
    }

    document.addEventListener('DOMContentLoaded', function () {
        setTimeout(initMap, 100);
    });

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

    // Init pin buttons + show-on-map buttons
    document.querySelectorAll('.memorial-card[data-memorial-id]').forEach(function (card) {
        var id = card.getAttribute('data-memorial-id');

        // Pin button
        var pinBtn = card.querySelector('.memorial-card-pin-btn');
        if (pinBtn) {
            updatePinButton(card, isPinned(id));
            pinBtn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                togglePin(card);
            });
        }

        // Show on map button — injected into the location row
        var locEl = card.querySelector('.memorial-card-location');
        if (locEl) {
            var mapBtn = document.createElement('button');
            mapBtn.className = 'card-show-on-map';
            mapBtn.title = 'Show on map';
            mapBtn.innerHTML = '<span class="material-symbols-outlined">my_location</span>';
            mapBtn.addEventListener('click', function (e) {
                e.preventDefault();
                focusMapMarker(id);
            });
            locEl.appendChild(mapBtn);
        }
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

    // Replace ui-avatars.com with inline SVGs to avoid CORS issues
    document.querySelectorAll('img').forEach(function (img) {
        if (img.src && img.src.indexOf('ui-avatars.com') !== -1) {
            var name = img.alt || '';
            var parts = name.trim().split(/\s+/);
            var initials = parts.length >= 2
                ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
                : (parts[0] ? parts[0][0].toUpperCase() : '?');
            var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48">' +
                '<circle cx="24" cy="24" r="24" fill="#6366f1"/>' +
                '<text x="24" y="31" text-anchor="middle" font-size="17" font-weight="bold" fill="white" font-family="Arial,sans-serif">' + initials + '</text>' +
                '</svg>';
            img.src = 'data:image/svg+xml,' + encodeURIComponent(svg);
        }
    });

})();
