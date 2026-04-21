/* ========================================
   ALAALA — Dashboard (Supabase)
   ======================================== */

document.addEventListener('DOMContentLoaded', async () => {

    // ===== Theme Toggle =====
    const themeToggle = document.getElementById('themeToggle');
    const savedTheme = localStorage.getItem('alaala-theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);

    themeToggle?.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('alaala-theme', next);
    });

    // ===== Auth Guard — redirect to login if not signed in =====
    const { data: { session } } = await sb.auth.getSession();
    if (!session) {
        window.location.href = 'auth.html';
        return;
    }
    const user = session.user;

    // ===== Load user profile =====
    const { data: profile } = await sb.from('profiles').select('*').eq('id', user.id).single();
    const displayName = profile?.display_name || profile?.full_name || user.email.split('@')[0];

    // Update welcome banner
    const greetEl = document.getElementById('dashGreeting');
    if (greetEl) greetEl.textContent = 'Welcome back, ' + displayName + ' 👋';

    // Update avatar
    const avatarEls = document.querySelectorAll('.dash-user-avatar, .topbar-avatar');
    const initials = displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    const svgAvatar = 'data:image/svg+xml,' + encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36">'
        + '<circle cx="18" cy="18" r="18" fill="#7c3aed"/>'
        + '<text x="18" y="23" text-anchor="middle" font-family="Inter,sans-serif" font-size="14" font-weight="600" fill="white">' + initials + '</text>'
        + '</svg>'
    );
    avatarEls.forEach(el => { el.src = svgAvatar; });

    // ===== Sidebar Tab Navigation =====
    const navLinks = document.querySelectorAll('.dash-nav-link');
    const tabs = document.querySelectorAll('.dash-tab');

    function switchTab(tabId) {
        navLinks.forEach(l => l.classList.toggle('active', l.dataset.tab === tabId));
        tabs.forEach(t => t.classList.toggle('active', t.id === 'tab-' + tabId));
        if (tabId === 'memorials') loadMemorials();
        if (tabId === 'orders') loadOrders();
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            switchTab(link.dataset.tab);
        });
    });

    document.querySelectorAll('.dash-see-all').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const tab = link.dataset.tab;
            if (tab) switchTab(tab);
        });
    });

    // ===== Sign Out =====
    document.getElementById('signOutBtn')?.addEventListener('click', async () => {
        await sb.auth.signOut();
        window.location.href = 'auth.html';
    });

    // ===== Load Dashboard Stats =====
    async function loadStats() {
        const [memRes, orderRes, tributeRes] = await Promise.all([
            sb.from('memorials').select('id', { count: 'exact', head: true }).eq('owner_id', user.id),
            sb.from('orders').select('id, total_amount', { count: 'exact' }).eq('user_id', user.id),
            sb.from('tributes').select('id', { count: 'exact', head: true })
                .in('memorial_id',
                    (await sb.from('memorials').select('id').eq('owner_id', user.id)).data?.map(m => m.id) || []
                )
        ]);

        const memCount = memRes.count || 0;
        const orderCount = orderRes.count || 0;
        const totalSpent = (orderRes.data || []).reduce((s, o) => s + (o.total_amount || 0), 0);
        const tributeCount = tributeRes.count || 0;

        setStatEl('statMemorials', memCount);
        setStatEl('statOrders', orderCount);
        setStatEl('statSpent', '₱' + (totalSpent / 100).toLocaleString('en-PH'));
        setStatEl('statTributes', tributeCount);
    }

    function setStatEl(id, val) {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    }

    // ===== Load Memorials =====
    async function loadMemorials() {
        const container = document.getElementById('memorialsContainer');
        if (!container) return;

        container.innerHTML = '<div class="dash-loading"><span class="material-symbols-outlined spin">progress_activity</span> Loading...</div>';

        const { data, error } = await sb.from('memorials')
            .select('*')
            .eq('owner_id', user.id)
            .order('created_at', { ascending: false });

        if (error || !data?.length) {
            container.innerHTML = '<div class="dash-empty"><span class="material-symbols-outlined">auto_stories</span>'
                + '<p>No memorials yet. <a href="create-memorial.html">Create one →</a></p></div>';
            return;
        }

        container.innerHTML = data.map(m => {
            const initial = m.full_name.charAt(0).toUpperCase();
            const statusBadge = { published: 'badge-success', draft: 'badge-warning', flagged: 'badge-error' }[m.status] || 'badge-info';
            const dates = [m.birth_date, m.death_date].filter(Boolean).map(d => d.split('-')[0]).join(' — ');
            return '<div class="memorial-dash-card">'
                + '<div class="mdc-cover" style="background:linear-gradient(135deg,#7c3aed,#a855f7)">'
                + '<div class="mdc-initial">' + initial + '</div>'
                + '</div>'
                + '<div class="mdc-body">'
                + '<div class="mdc-header"><h3>' + m.full_name + '</h3><span class="badge ' + statusBadge + '">' + m.status + '</span></div>'
                + '<p class="mdc-dates">' + (dates || 'Dates not set') + '</p>'
                + '<div class="mdc-stats">'
                + '<span>🕯️ ' + (m.candle_count || 0) + '</span>'
                + '<span>❤️ ' + (m.tribute_count || 0) + '</span>'
                + '<span>👁 ' + (m.visitor_count || 0) + '</span>'
                + '</div>'
                + '<div class="mdc-actions">'
                + '<a href="memorial.html?id=' + m.slug + '" class="btn-dash btn-dash-primary">View</a>'
                + '<a href="create-memorial.html?edit=' + m.id + '" class="btn-dash btn-dash-outline">Edit</a>'
                + '</div>'
                + '</div></div>';
        }).join('');
    }

    // ===== Load Orders =====
    async function loadOrders() {
        const container = document.getElementById('ordersContainer');
        if (!container) return;

        container.innerHTML = '<div class="dash-loading"><span class="material-symbols-outlined spin">progress_activity</span> Loading...</div>';

        const { data, error } = await sb.from('orders')
            .select('*, memorials(full_name)')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(20);

        if (error || !data?.length) {
            container.innerHTML = '<div class="dash-empty"><span class="material-symbols-outlined">receipt_long</span>'
                + '<p>No orders yet. <a href="booking.html">Book a service →</a></p></div>';
            return;
        }

        const statusBadge = { completed: 'badge-success', pending: 'badge-warning', processing: 'badge-info', cancelled: 'badge-error', refunded: 'badge-error' };

        container.innerHTML = '<div class="orders-table-wrap"><table class="orders-table">'
            + '<thead><tr><th>Order</th><th>Service</th><th>Memorial</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>'
            + '<tbody>'
            + data.map(o => '<tr>'
                + '<td><strong>#' + (o.order_ref || o.id.slice(0, 8)) + '</strong></td>'
                + '<td>' + o.service_name + '</td>'
                + '<td>' + (o.memorials?.full_name || '—') + '</td>'
                + '<td>₱' + ((o.total_amount || 0) / 100).toLocaleString('en-PH') + '</td>'
                + '<td><span class="badge ' + (statusBadge[o.status] || 'badge-info') + '">' + o.status + '</span></td>'
                + '<td>' + new Date(o.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }) + '</td>'
                + '</tr>'
            ).join('')
            + '</tbody></table></div>';
    }

    // ===== Load Recent Tributes (notifications) =====
    async function loadRecentTributes() {
        const container = document.getElementById('notificationsContainer');
        if (!container) return;

        const myMemorials = await sb.from('memorials').select('id, full_name').eq('owner_id', user.id);
        if (!myMemorials.data?.length) return;

        const ids = myMemorials.data.map(m => m.id);
        const { data } = await sb.from('tributes')
            .select('*, profiles(full_name), memorials(full_name)')
            .in('memorial_id', ids)
            .order('created_at', { ascending: false })
            .limit(10);

        if (!data?.length) return;

        const typeIcon = { candle: '🕯️', flower: '🌸', comment: '💬', prayer: '🙏' };
        container.innerHTML = data.map(t => {
            const who = t.is_anonymous ? 'Someone' : (t.profiles?.full_name || 'A visitor');
            const what = typeIcon[t.type] || '❤️';
            const when = new Date(t.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
            return '<div class="notif-card">'
                + '<span class="notif-icon">' + what + '</span>'
                + '<div class="notif-body"><strong>' + who + '</strong> left a '
                + t.type + ' on <em>' + (t.memorials?.full_name || '') + '</em>'
                + (t.message ? '<p class="notif-msg">"' + t.message + '"</p>' : '')
                + '</div>'
                + '<span class="notif-time">' + when + '</span>'
                + '</div>';
        }).join('');
    }

    // ===== Stat Number Animation =====
    const statEls = document.querySelectorAll('.stat-number[data-animate]');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.textContent.replace(/,/g, ''));
                if (!isNaN(target)) animateCount(el, 0, target, 1200);
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.5 });
    statEls.forEach(el => observer.observe(el));

    function animateCount(el, start, end, duration) {
        const startTime = performance.now();
        function update(now) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.round(start + (end - start) * eased).toLocaleString();
            if (progress < 1) requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
    }

    // ===== Initial Data Load =====
    loadStats();
    loadMemorials();
    loadRecentTributes();

});
