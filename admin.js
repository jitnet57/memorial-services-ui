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
            const slider = toggle.nextElementSibling;
            if (slider) slider.style.transition = 'all 0.3s ease';
        });
    });

    // ===== Supabase Admin Data =====
    if (typeof sb !== 'undefined') {
        (async () => {
            // Auth guard
            const { data: { session } } = await sb.auth.getSession();
            if (!session) { window.location.href = 'auth.html'; return; }

            // Update admin avatar/name
            const adminName = document.querySelectorAll('.admin-name, .topbar-user-name');
            const adminEmail = document.querySelectorAll('.admin-role, .topbar-user-email');
            adminName.forEach(el => { el.textContent = session.user.user_metadata?.full_name || session.user.email; });
            adminEmail.forEach(el => { el.textContent = session.user.email; });

            // Sign out
            document.getElementById('signOutBtn')?.addEventListener('click', async () => {
                await sb.auth.signOut();
                window.location.href = 'auth.html';
            });

            // Load counts in parallel
            const [usersRes, memorialsRes, ordersRes, revenueRes] = await Promise.all([
                sb.from('profiles').select('id', { count: 'exact', head: true }),
                sb.from('memorials').select('id', { count: 'exact', head: true }),
                sb.from('orders').select('id', { count: 'exact', head: true }),
                sb.from('orders').select('amount').eq('status', 'confirmed')
            ]);

            const setStatEl = (id, val) => {
                const el = document.getElementById(id);
                if (el) el.textContent = typeof val === 'number' ? val.toLocaleString() : val;
            };

            setStatEl('statUsers', usersRes.count || 0);
            setStatEl('statMemorials', memorialsRes.count || 0);
            setStatEl('statOrders', ordersRes.count || 0);

            if (revenueRes.data) {
                const total = revenueRes.data.reduce((sum, r) => sum + (r.amount || 0), 0);
                setStatEl('statRevenue', '₱' + total.toLocaleString('en-PH'));
            }

            // Load recent orders for dashboard
            const { data: recentOrders } = await sb.from('orders')
                .select('id, service_type, amount, status, created_at, memorials(full_name)')
                .order('created_at', { ascending: false })
                .limit(10);

            const ordersTableBody = document.querySelector('#tab-orders .admin-table tbody, #ordersTableBody');
            if (ordersTableBody && recentOrders && recentOrders.length > 0) {
                ordersTableBody.innerHTML = recentOrders.map(o => {
                    const statusClass = o.status === 'confirmed' ? 'active' : o.status === 'pending' ? 'pending' : 'inactive';
                    const d = new Date(o.created_at);
                    const dateStr = d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
                    return `<tr>
                        <td><label class="table-check"><input type="checkbox" class="row-check"><span class="check-mark"></span></label></td>
                        <td><span class="mono">#${o.id.substring(0, 8).toUpperCase()}</span></td>
                        <td>${escapeHtml(o.memorials?.full_name || '—')}</td>
                        <td>${escapeHtml(o.service_type || '—')}</td>
                        <td>${dateStr}</td>
                        <td>₱${(o.amount || 0).toLocaleString('en-PH')}</td>
                        <td><span class="status-badge ${statusClass}">${o.status || 'pending'}</span></td>
                        <td><div class="row-actions"><button class="row-action-btn"><span class="material-symbols-outlined">visibility</span></button></div></td>
                    </tr>`;
                }).join('');
            }

            // Load memorials for admin tab
            const { data: memorials } = await sb.from('memorials')
                .select('id, full_name, slug, status, created_at, profiles(email)')
                .order('created_at', { ascending: false })
                .limit(50);

            const memorialsTableBody = document.querySelector('#tab-memorials .admin-table tbody, #memorialsTableBody');
            if (memorialsTableBody && memorials && memorials.length > 0) {
                memorialsTableBody.innerHTML = memorials.map(m => {
                    const statusClass = m.status === 'published' ? 'active' : m.status === 'draft' ? 'pending' : 'inactive';
                    const d = new Date(m.created_at);
                    const dateStr = d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
                    return `<tr>
                        <td><label class="table-check"><input type="checkbox" class="row-check"><span class="check-mark"></span></label></td>
                        <td>
                            <div class="user-cell">
                                <div class="user-avatar-sm" style="background:var(--primary);display:flex;align-items:center;justify-content:center;border-radius:50%;width:36px;height:36px">
                                    <span style="color:#fff;font-weight:600;font-size:13px">${escapeHtml(m.full_name.substring(0,2).toUpperCase())}</span>
                                </div>
                                <div class="user-info">
                                    <span class="user-name">${escapeHtml(m.full_name)}</span>
                                    <span class="user-email">${escapeHtml(m.slug)}</span>
                                </div>
                            </div>
                        </td>
                        <td>${escapeHtml(m.profiles?.email || '—')}</td>
                        <td>${dateStr}</td>
                        <td><span class="status-badge ${statusClass}">${m.status || 'draft'}</span></td>
                        <td><div class="row-actions">
                            <a href="memorial.html?id=${m.slug}" class="row-action-btn" target="_blank"><span class="material-symbols-outlined">visibility</span></a>
                        </div></td>
                    </tr>`;
                }).join('');
            }

        })();
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = String(str);
        return div.innerHTML;
    }

});
