/* ========================================
   ALAALA — Memorial Detail Page JS
   ======================================== */

document.addEventListener('DOMContentLoaded', async () => {
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

    /* ===== Supabase: Load Memorial ===== */
    const slug = new URLSearchParams(window.location.search).get('id');
    let memorialId = null;
    let currentUserId = null;

    if (slug && typeof sb !== 'undefined') {
        try {
            const { data: { session } } = await sb.auth.getSession();
            if (session) currentUserId = session.user.id;

            const { data: memorial } = await sb.from('memorials')
                .select('id, full_name, birth_date, death_date, location_name, biography, cover_photo_url, profile_photo_url, visitor_count')
                .eq('slug', slug)
                .single();

            if (memorial) {
                memorialId = memorial.id;

                // Populate page elements
                document.querySelectorAll('.mem-hero-name, .mem-name').forEach(el => {
                    el.textContent = memorial.full_name;
                });
                if (memorial.birth_date || memorial.death_date) {
                    const b = memorial.birth_date ? new Date(memorial.birth_date).getFullYear() : '?';
                    const d = memorial.death_date ? new Date(memorial.death_date).getFullYear() : '?';
                    document.querySelectorAll('.mem-dates').forEach(el => { el.textContent = `${b} — ${d}`; });
                }
                if (memorial.location_name) {
                    document.querySelectorAll('.mem-location').forEach(el => { el.textContent = memorial.location_name; });
                }
                if (memorial.biography) {
                    const storyEl = document.querySelector('.mem-story-text');
                    if (storyEl) storyEl.innerHTML = `<p>${escapeHtml(memorial.biography)}</p>`;
                }
                if (memorial.cover_photo_url) {
                    const hero = document.querySelector('.mem-hero-bg');
                    if (hero) hero.style.backgroundImage = `url(${memorial.cover_photo_url})`;
                }
                if (memorial.profile_photo_url) {
                    const avatar = document.querySelector('.mem-avatar img');
                    if (avatar) avatar.src = memorial.profile_photo_url;
                }

                // Increment visitor count
                const newCount = (memorial.visitor_count || 0) + 1;
                sb.from('memorials').update({ visitor_count: newCount }).eq('id', memorialId);
                document.querySelectorAll('.visitor-count').forEach(el => { el.textContent = newCount.toLocaleString(); });

                // Update share URL
                const shareInput = document.querySelector('.share-url-box input');
                if (shareInput) shareInput.value = window.location.href;

                // Load candle count
                const { count: candleCount } = await sb.from('tributes')
                    .select('id', { count: 'exact', head: true })
                    .eq('memorial_id', memorialId)
                    .eq('type', 'candle');
                if (candleCount !== null) {
                    const candleStatEl = document.querySelector('.mem-hstat strong');
                    if (candleStatEl) candleStatEl.textContent = candleCount.toLocaleString();
                }

                // Load tributes
                const { data: tributes } = await sb.from('tributes')
                    .select('id, content, author_name, created_at')
                    .eq('memorial_id', memorialId)
                    .eq('type', 'comment')
                    .order('created_at', { ascending: false })
                    .limit(20);

                if (tributes && tributes.length > 0 && tributesList) {
                    tributesList.innerHTML = '';
                    tributes.forEach(t => {
                        const item = document.createElement('div');
                        item.className = 'tribute-item';
                        const initials = (t.author_name || 'A').substring(0, 2).toUpperCase();
                        const timeAgo = formatTimeAgo(new Date(t.created_at));
                        item.innerHTML = `
                            <div class="tri-avatar" style="background:var(--primary);display:flex;align-items:center;justify-content:center;border-radius:50%;width:40px;height:40px;flex-shrink:0">
                                <span style="color:#fff;font-weight:600;font-size:14px">${initials}</span>
                            </div>
                            <div class="tri-body">
                                <div class="tri-header">
                                    <strong>${escapeHtml(t.author_name || 'Anonymous')}</strong>
                                    <span class="tri-time">${timeAgo}</span>
                                </div>
                                <p>${escapeHtml(t.content)}</p>
                            </div>`;
                        tributesList.appendChild(item);
                    });
                }
            }
        } catch (err) {
            console.error('Memorial load error:', err);
        }
    }

    /* Supabase: Save candle */
    if (candleBtn) {
        const origCandleHandler = candleBtn.onclick;
        candleBtn.addEventListener('click', async () => {
            if (memorialId && typeof sb !== 'undefined') {
                const name = candleInput ? candleInput.value.trim() : 'Anonymous';
                await sb.from('tributes').insert({
                    memorial_id: memorialId,
                    type: 'candle',
                    author_name: name || 'Anonymous',
                    user_id: currentUserId || null
                });
            }
        });
    }

    /* Supabase: Save tribute */
    if (postBtn && tributeTextarea) {
        postBtn.addEventListener('click', async () => {
            if (memorialId && typeof sb !== 'undefined') {
                const text = tributeTextarea.value.trim();
                if (text) {
                    await sb.from('tributes').insert({
                        memorial_id: memorialId,
                        type: 'comment',
                        content: text,
                        author_name: currentUserId ? 'You' : 'Anonymous',
                        user_id: currentUserId || null
                    });
                }
            }
        });
    }

    function formatTimeAgo(date) {
        const diff = Math.floor((Date.now() - date.getTime()) / 1000);
        if (diff < 60) return 'Just now';
        if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
        if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
        return Math.floor(diff / 86400) + 'd ago';
    }
});
