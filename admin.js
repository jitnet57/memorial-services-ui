/* ========================================
   ALAALA — Admin Panel Interactions
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {

    // ===== Theme Toggle =====
    const themeToggle = document.getElementById('themeToggle');
    const savedTheme = localStorage.getItem('alaala-theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);

    themeToggle?.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('alaala-theme', next);
        const icon = themeToggle.querySelector('.material-symbols-outlined');
        if (icon) icon.textContent = next === 'dark' ? 'light_mode' : 'dark_mode';
    });

    // Set initial icon
    const themeIcon = themeToggle?.querySelector('.material-symbols-outlined');
    if (themeIcon) themeIcon.textContent = savedTheme === 'dark' ? 'light_mode' : 'dark_mode';

    // ===== Set Current Date =====
    const dateEl = document.getElementById('currentDate');
    if (dateEl) {
        dateEl.textContent = new Date().toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
    }

    // ===== Sidebar Tab Navigation =====
    const navItems = document.querySelectorAll('.sidebar-nav-item');
    const tabs = document.querySelectorAll('.admin-tab');
    const breadcrumbActive = document.getElementById('breadcrumbActive');

    function switchTab(tabId) {
        navItems.forEach(item => item.classList.toggle('active', item.dataset.tab === tabId));
        tabs.forEach(tab => tab.classList.toggle('active', tab.id === `tab-${tabId}`));
        if (breadcrumbActive) {
            breadcrumbActive.textContent = tabId.charAt(0).toUpperCase() + tabId.slice(1);
        }
        // Close mobile sidebar
        document.getElementById('adminSidebar')?.classList.remove('mobile-open');
        document.getElementById('sidebarOverlay')?.classList.remove('show');
    }

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            switchTab(item.dataset.tab);
        });
    });

    // Card links that switch tabs (e.g., "View All" on dashboard)
    document.querySelectorAll('.card-link[data-tab]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            switchTab(link.dataset.tab);
        });
    });

    // ===== Sidebar Collapse Toggle =====
    const sidebar = document.getElementById('adminSidebar');
    const collapseBtn = document.getElementById('sidebarCollapseBtn');

    collapseBtn?.addEventListener('click', () => {
        sidebar?.classList.toggle('collapsed');
    });

    // ===== Mobile Sidebar Toggle =====
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    mobileMenuBtn?.addEventListener('click', () => {
        sidebar?.classList.toggle('mobile-open');
        sidebarOverlay?.classList.toggle('show');
    });

    sidebarOverlay?.addEventListener('click', () => {
        sidebar?.classList.remove('mobile-open');
        sidebarOverlay?.classList.remove('show');
    });

    // ===== Top Bar Search Focus State =====
    const topbarSearch = document.getElementById('topbarSearch');
    topbarSearch?.addEventListener('focus', () => {
        topbarSearch.parentElement?.classList.add('focused');
    });
    topbarSearch?.addEventListener('blur', () => {
        topbarSearch.parentElement?.classList.remove('focused');
    });

    // ===== Notification Bell Dropdown =====
    const notifBtn = document.getElementById('notifBtn');
    const notifDropdown = document.getElementById('notifDropdown');

    notifBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        notifDropdown?.classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
        if (!notifDropdown?.contains(e.target) && e.target !== notifBtn) {
            notifDropdown?.classList.remove('show');
        }
    });

    // Mark all as read
    document.querySelector('.notif-mark-read')?.addEventListener('click', () => {
        document.querySelectorAll('.notif-dropdown-item.unread').forEach(item => {
            item.classList.remove('unread');
        });
        const badge = document.querySelector('.notif-badge');
        if (badge) badge.style.display = 'none';
    });

    // ===== Stat Number Animation =====
    const statNumbers = document.querySelectorAll('.stat-number');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const text = el.textContent.trim();
                // Skip currency values for simplicity
                if (text.startsWith('₱')) {
                    observer.unobserve(el);
                    return;
                }
                const target = parseInt(text.replace(/,/g, ''));
                if (isNaN(target)) return;
                animateCount(el, 0, target, 1200);
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    statNumbers.forEach(el => observer.observe(el));

    function animateCount(el, start, end, duration) {
        const startTime = performance.now();
        function update(now) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(start + (end - start) * eased);
            el.textContent = current.toLocaleString();
            if (progress < 1) requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
    }

    // ===== Period Selector Toggle =====
    document.querySelectorAll('.period-selector').forEach(selector => {
        selector.querySelectorAll('.period-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                selector.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    });

    // ===== Table Row Selection & Bulk Actions =====
    document.querySelectorAll('.sortable-table').forEach(table => {
        const selectAll = table.querySelector('.select-all-check');
        const rowChecks = table.querySelectorAll('.row-check');
        const bulkBar = document.getElementById('bulkActionsBar');
        const selectedCountEl = document.getElementById('selectedCount');

        function updateBulkBar() {
            const checked = table.querySelectorAll('.row-check:checked');
            const count = checked.length;
            if (selectedCountEl) selectedCountEl.textContent = count;
            if (bulkBar) {
                bulkBar.classList.toggle('show', count > 0);
            }
            // Update row highlight
            rowChecks.forEach(check => {
                check.closest('tr')?.classList.toggle('selected', check.checked);
            });
        }

        selectAll?.addEventListener('change', () => {
            rowChecks.forEach(check => {
                check.checked = selectAll.checked;
            });
            updateBulkBar();
        });

        rowChecks.forEach(check => {
            check.addEventListener('change', () => {
                if (selectAll) {
                    selectAll.checked = [...rowChecks].every(c => c.checked);
                }
                updateBulkBar();
            });
        });
    });

    // ===== Sort Table Columns =====
    document.querySelectorAll('.admin-table th.sortable').forEach(th => {
        th.addEventListener('click', () => {
            const table = th.closest('table');
            const idx = [...th.parentElement.children].indexOf(th);
            const isAsc = th.classList.contains('sort-asc');

            // Clear other sort indicators in this table
            table.querySelectorAll('th.sortable').forEach(h => {
                h.classList.remove('sort-asc', 'sort-desc');
                const icon = h.querySelector('.sort-icon');
                if (icon) icon.textContent = 'unfold_more';
            });

            // Set new sort direction
            if (isAsc) {
                th.classList.add('sort-desc');
                const icon = th.querySelector('.sort-icon');
                if (icon) icon.textContent = 'expand_more';
            } else {
                th.classList.add('sort-asc');
                const icon = th.querySelector('.sort-icon');
                if (icon) icon.textContent = 'expand_less';
            }

            // Sort rows (visual prototype)
            const tbody = table.querySelector('tbody');
            const rows = [...tbody.querySelectorAll('tr')];
            const dir = th.classList.contains('sort-asc') ? 1 : -1;

            rows.sort((a, b) => {
                const aText = a.children[idx]?.textContent.trim() || '';
                const bText = b.children[idx]?.textContent.trim() || '';
                const aNum = parseFloat(aText.replace(/[₱,]/g, ''));
                const bNum = parseFloat(bText.replace(/[₱,]/g, ''));

                if (!isNaN(aNum) && !isNaN(bNum)) {
                    return (aNum - bNum) * dir;
                }
                return aText.localeCompare(bText) * dir;
            });

            rows.forEach(row => tbody.appendChild(row));
        });
    });

    // ===== Table Pagination Click Handlers =====
    document.querySelectorAll('.pagination-btn:not(:disabled)').forEach(btn => {
        btn.addEventListener('click', () => {
            const container = btn.closest('.pagination-btns');
            container?.querySelectorAll('.pagination-btn').forEach(b => b.classList.remove('active'));
            // Only add active to numbered buttons
            if (!btn.querySelector('.material-symbols-outlined')) {
                btn.classList.add('active');
            }
        });
    });

    // ===== Filter/Search Input Handlers (Visual Only) =====
    document.querySelectorAll('.filter-select').forEach(select => {
        select.addEventListener('change', () => {
            // Prototype: visual feedback only
            select.style.borderColor = 'var(--primary)';
            setTimeout(() => {
                select.style.borderColor = '';
            }, 500);
        });
    });

    document.querySelectorAll('.table-search-input').forEach(input => {
        input.addEventListener('input', () => {
            // Prototype: visual feedback only
            const icon = input.parentElement?.querySelector('.material-symbols-outlined');
            if (icon) {
                icon.style.color = input.value ? 'var(--primary)' : '';
            }
        });
    });

    // ===== Settings Toggle Switches =====
    document.querySelectorAll('.toggle-input').forEach(toggle => {
        toggle.addEventListener('change', () => {
            // Visual feedback
            const slider = toggle.nextElementSibling;
            if (slider) {
                slider.style.transition = 'all 0.3s ease';
            }
        });
    });

});
