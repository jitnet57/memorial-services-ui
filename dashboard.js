/* ========================================
   ALAALA — Dashboard Interactions
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
    });

    // ===== Sidebar Tab Navigation =====
    const navLinks = document.querySelectorAll('.dash-nav-link');
    const tabs = document.querySelectorAll('.dash-tab');

    function switchTab(tabId) {
        navLinks.forEach(l => l.classList.toggle('active', l.dataset.tab === tabId));
        tabs.forEach(t => t.classList.toggle('active', t.id === `tab-${tabId}`));
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            switchTab(link.dataset.tab);
        });
    });

    // "See all" links that switch tabs
    document.querySelectorAll('.dash-see-all').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const tab = link.dataset.tab;
            if (tab) switchTab(tab);
        });
    });

    // ===== Stat Animation on Load =====
    const statNumbers = document.querySelectorAll('.stat-number');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.textContent.replace(/,/g, ''));
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

    // ===== Mark all as read =====
    document.querySelector('.dash-header .btn-outline')?.addEventListener('click', () => {
        document.querySelectorAll('.notif-card.unread').forEach(card => {
            card.classList.remove('unread');
        });
        const badge = document.querySelector('.nav-badge');
        if (badge) badge.style.display = 'none';
    });
});
