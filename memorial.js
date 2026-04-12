/* ========================================
   ALAALA — Memorial Detail Page JS
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
    /* ===== Theme Toggle ===== */
    const theme = localStorage.getItem('alaala-theme') || 'light';
    document.documentElement.setAttribute('data-theme', theme);

    document.querySelectorAll('#themeToggle').forEach(btn => {
        btn.addEventListener('click', () => {
            const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            localStorage.setItem('alaala-theme', next);
        });
    });

    /* ===== Navbar scroll ===== */
    const navbar = document.querySelector('.mem-navbar');
    if (navbar) {
        const update = () => navbar.classList.toggle('scrolled', window.scrollY > 80);
        window.addEventListener('scroll', update, { passive: true });
        update();
    }

    /* ===== Sticky tab highlight on scroll ===== */
    const tabs = document.querySelectorAll('.mem-tab');
    const sections = [];

    tabs.forEach(tab => {
        const id = tab.getAttribute('data-section');
        const el = document.getElementById(id);
        if (el) sections.push({ id, el, tab });
    });

    function highlightTab() {
        const offset = window.scrollY + 160;
        let current = sections[0];
        sections.forEach(s => {
            if (s.el.offsetTop <= offset) current = s;
        });
        tabs.forEach(t => t.classList.remove('active'));
        if (current) current.tab.classList.add('active');
    }

    window.addEventListener('scroll', highlightTab, { passive: true });
    highlightTab();

    /* Tab click → smooth scroll */
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const id = tab.getAttribute('data-section');
            const el = document.getElementById(id);
            if (el) {
                const y = el.getBoundingClientRect().top + window.scrollY - 140;
                window.scrollTo({ top: y, behavior: 'smooth' });
            }
        });
    });

    /* ===== Voice Player ===== */
    const vpPlay = document.querySelector('.vp-play');
    const vpWave = document.querySelector('.vp-wave');
    let playing = false;

    if (vpPlay && vpWave) {
        vpPlay.addEventListener('click', () => {
            playing = !playing;
            vpWave.classList.toggle('playing', playing);
            const icon = vpPlay.querySelector('.material-symbols-outlined');
            if (icon) icon.textContent = playing ? 'pause' : 'play_arrow';
        });
    }

    /* ===== Share Modal ===== */
    const shareModal = document.getElementById('shareModal');
    const shareOpenBtns = document.querySelectorAll('#shareBtn, [data-action="share"]');
    const shareClose = document.querySelector('.modal-close');

    function openShareModal() {
        if (shareModal) shareModal.classList.add('active');
    }
    function closeShareModal() {
        if (shareModal) shareModal.classList.remove('active');
    }

    shareOpenBtns.forEach(btn => btn.addEventListener('click', openShareModal));
    if (shareClose) shareClose.addEventListener('click', closeShareModal);
    if (shareModal) {
        shareModal.addEventListener('click', (e) => {
            if (e.target === shareModal) closeShareModal();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeShareModal();
    });

    /* ===== Copy Link ===== */
    const copyBtn = document.getElementById('copyLinkBtn');
    const shareInput = document.querySelector('.share-url-box input');

    if (copyBtn && shareInput) {
        copyBtn.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(shareInput.value);
                showToast('Link copied to clipboard');
            } catch {
                shareInput.select();
                document.execCommand('copy');
                showToast('Link copied to clipboard');
            }
        });
    }

    /* ===== Toast ===== */
    const toast = document.getElementById('toast');
    let toastTimer;

    function showToast(msg) {
        if (!toast) return;
        toast.querySelector('span:last-child').textContent = msg;
        toast.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
    }

    /* ===== Light a Candle ===== */
    const candleBtn = document.querySelector('.candle-btn');
    const candleInput = document.querySelector('.candle-input');
    const candleGrid = document.querySelector('.candle-grid');
    const candleCountEl = document.querySelector('.mem-hstat strong');

    if (candleBtn) {
        candleBtn.addEventListener('click', () => {
            const name = candleInput ? candleInput.value.trim() : 'Someone';
            if (!name) {
                candleInput.focus();
                return;
            }

            // Add candle to grid
            if (candleGrid) {
                const candle = document.createElement('div');
                candle.className = 'cw-candle lit';
                candle.innerHTML = `
                    <div class="cw-flame"></div>
                    <div class="cw-body"></div>
                    <span class="cw-name">${escapeHtml(name)}</span>
                `;
                candleGrid.prepend(candle);
            }

            // Clear input
            if (candleInput) candleInput.value = '';

            showToast('Your candle has been lit 🕯️');
        });
    }

    /* Sidebar candle quick action */
    const sidebarCandleBtn = document.querySelector('.candle-quick .btn');
    if (sidebarCandleBtn) {
        sidebarCandleBtn.addEventListener('click', () => {
            const section = document.getElementById('candles');
            if (section) {
                const y = section.getBoundingClientRect().top + window.scrollY - 140;
                window.scrollTo({ top: y, behavior: 'smooth' });
                setTimeout(() => {
                    if (candleInput) candleInput.focus();
                }, 600);
            }
        });
    }

    /* ===== Tribute Reactions ===== */
    document.querySelectorAll('.tri-react').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.classList.toggle('active');
            const countEl = btn.querySelector('span:last-child');
            if (countEl && !isNaN(parseInt(countEl.textContent))) {
                const val = parseInt(countEl.textContent);
                countEl.textContent = btn.classList.contains('active') ? val + 1 : Math.max(0, val - 1);
            }
        });
    });

    /* ===== Post Tribute ===== */
    const postBtn = document.querySelector('.tc-actions .btn');
    const tributeTextarea = document.querySelector('.tc-form textarea');
    const tributesList = document.querySelector('.tributes-list');

    if (postBtn && tributeTextarea && tributesList) {
        postBtn.addEventListener('click', () => {
            const text = tributeTextarea.value.trim();
            if (!text) {
                tributeTextarea.focus();
                return;
            }

            const item = document.createElement('div');
            item.className = 'tribute-item';
            item.innerHTML = `
                <div class="tri-avatar" style="background:var(--primary)">
                    <span class="material-symbols-outlined" style="font-size:18px;color:#fff">person</span>
                </div>
                <div class="tri-body">
                    <div class="tri-header">
                        <strong>You</strong>
                        <span class="tri-time">Just now</span>
                    </div>
                    <p>${escapeHtml(text)}</p>
                    <div class="tri-reactions">
                        <button class="tri-react"><span class="material-symbols-outlined">favorite</span> <span>0</span></button>
                        <button class="tri-react"><span class="material-symbols-outlined">candle</span> <span>0</span></button>
                    </div>
                </div>
            `;

            tributesList.prepend(item);
            tributeTextarea.value = '';

            // Rebind reactions on new element
            item.querySelectorAll('.tri-react').forEach(btn => {
                btn.addEventListener('click', () => {
                    btn.classList.toggle('active');
                    const c = btn.querySelector('span:last-child');
                    if (c && !isNaN(parseInt(c.textContent))) {
                        const v = parseInt(c.textContent);
                        c.textContent = btn.classList.contains('active') ? v + 1 : Math.max(0, v - 1);
                    }
                });
            });

            showToast('Your tribute has been posted');
        });
    }

    /* ===== Gallery Lightbox ===== */
    const galItems = document.querySelectorAll('.gal-item:not(.gal-more)');
    galItems.forEach(item => {
        item.addEventListener('click', () => {
            const img = item.querySelector('img');
            if (!img) return;

            const overlay = document.createElement('div');
            overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.9);display:flex;align-items:center;justify-content:center;z-index:2000;cursor:zoom-out;padding:2rem;';
            const bigImg = document.createElement('img');
            bigImg.src = img.src;
            bigImg.alt = img.alt;
            bigImg.style.cssText = 'max-width:100%;max-height:100%;object-fit:contain;border-radius:8px;';
            overlay.appendChild(bigImg);
            document.body.appendChild(overlay);

            overlay.addEventListener('click', () => overlay.remove());
            document.addEventListener('keydown', function esc(e) {
                if (e.key === 'Escape') {
                    overlay.remove();
                    document.removeEventListener('keydown', esc);
                }
            });
        });
    });

    /* ===== Wave bars random heights ===== */
    const bars = document.querySelectorAll('.vp-bar');
    bars.forEach(bar => {
        const h = Math.floor(Math.random() * 25) + 10;
        bar.style.height = h + 'px';
    });

    /* ===== Candle wall — start lit ===== */
    document.querySelectorAll('.cw-candle').forEach(c => c.classList.add('lit'));

    /* ===== Utility ===== */
    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
});
