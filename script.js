/* ========================================
   ALAALA — Memorial Services UI
   JavaScript Interactions
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {

    // ===== NAVBAR SCROLL EFFECT =====
    const navbar = document.getElementById('navbar');
    const handleScroll = () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    // ===== MOBILE NAV TOGGLE =====
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');

    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
        document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
    });

    // Close mobile nav on link click
    navLinks.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navLinks.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // ===== ACTIVE NAV LINK on SCROLL =====
    const sections = document.querySelectorAll('section[id]');
    const navLinksList = document.querySelectorAll('.nav-link');

    const observerOptions = { rootMargin: '-20% 0px -80% 0px' };
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                navLinksList.forEach(link => {
                    link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => sectionObserver.observe(section));

    // ===== DARK / LIGHT THEME TOGGLE =====
    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement;

    // Check stored preference or system preference
    const savedTheme = localStorage.getItem('alaala-theme');
    if (savedTheme) {
        html.setAttribute('data-theme', savedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        html.setAttribute('data-theme', 'dark');
    }

    themeToggle.addEventListener('click', () => {
        const current = html.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', next);
        localStorage.setItem('alaala-theme', next);
    });

    // ===== LANGUAGE SWITCH =====
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // ===== PRICING TOGGLE (Monthly / Annual) =====
    const pricingToggle = document.getElementById('pricingToggle');
    const toggleLabels = document.querySelectorAll('.toggle-label');
    const priceAmounts = document.querySelectorAll('.price-amount');
    let isAnnual = false;

    pricingToggle.addEventListener('click', () => {
        isAnnual = !isAnnual;
        pricingToggle.classList.toggle('active', isAnnual);

        toggleLabels.forEach(label => {
            const period = label.dataset.period;
            label.classList.toggle('active', isAnnual ? period === 'annual' : period === 'monthly');
        });

        priceAmounts.forEach(el => {
            const value = isAnnual ? el.dataset.annual : el.dataset.monthly;
            animateNumber(el, parseInt(el.textContent.replace(/,/g, '')), parseInt(value), 400);
        });
    });

    // ===== COUNTER ANIMATION =====
    function animateNumber(element, start, end, duration) {
        const startTime = performance.now();
        const update = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
            const current = Math.round(start + (end - start) * eased);
            element.textContent = current.toLocaleString();
            if (progress < 1) requestAnimationFrame(update);
        };
        requestAnimationFrame(update);
    }

    // ===== HERO STATS COUNTER =====
    const statNumbers = document.querySelectorAll('.stat-number[data-count]');
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.dataset.count);
                animateNumber(el, 0, target, 2000);
                statsObserver.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    statNumbers.forEach(el => statsObserver.observe(el));

    // ===== SCROLL REVEAL ANIMATION =====
    const revealElements = document.querySelectorAll(
        '.service-card, .step-item, .memorial-card, .notif-card, ' +
        '.testimonial-card, .pricing-card, .voice-demo-grid > *, ' +
        '.scheduling-grid > *, .section-header'
    );

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, index * 60);
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    revealElements.forEach(el => {
        el.classList.add('reveal');
        revealObserver.observe(el);
    });

    // ===== PLAY BUTTON TOGGLE =====
    const playBtn = document.getElementById('playBtn');
    let isPlaying = false;

    playBtn.addEventListener('click', () => {
        isPlaying = !isPlaying;
        const icon = playBtn.querySelector('.material-symbols-outlined');
        icon.textContent = isPlaying ? 'pause' : 'play_arrow';

        // Toggle wave animation
        const waves = document.querySelectorAll('.sound-waves span');
        waves.forEach(w => {
            w.style.animationPlayState = isPlaying ? 'running' : 'paused';
        });
    });

    // Start waves paused
    document.querySelectorAll('.sound-waves span').forEach(w => {
        w.style.animationPlayState = 'paused';
    });

    // ===== SMOOTH SCROLL FOR ALL ANCHOR LINKS =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // ===== HERO PARTICLES (subtle floating dots) =====
    const particlesContainer = document.getElementById('particles');
    if (particlesContainer) {
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: absolute;
                width: ${Math.random() * 4 + 2}px;
                height: ${Math.random() * 4 + 2}px;
                background: var(--primary);
                border-radius: 50%;
                opacity: ${Math.random() * 0.15 + 0.05};
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: float ${Math.random() * 6 + 4}s ease-in-out infinite;
                animation-delay: ${Math.random() * 4}s;
            `;
            particlesContainer.appendChild(particle);
        }

        const style = document.createElement('style');
        style.textContent = `
            @keyframes float {
                0%, 100% { transform: translate(0, 0); }
                25% { transform: translate(${Math.random() * 30 - 15}px, ${Math.random() * 30 - 15}px); }
                50% { transform: translate(${Math.random() * 30 - 15}px, ${Math.random() * 30 - 15}px); }
                75% { transform: translate(${Math.random() * 30 - 15}px, ${Math.random() * 30 - 15}px); }
            }
        `;
        document.head.appendChild(style);
    }

    // ===== FLOATING QUICK ACTIONS =====
    const quickActionToggle = document.getElementById('quickActionToggle');
    const quickActions = document.getElementById('quickActions');

    if (quickActionToggle && quickActions) {
        quickActionToggle.addEventListener('click', () => {
            quickActions.classList.toggle('open');
        });

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (!quickActions.contains(e.target) && quickActions.classList.contains('open')) {
                quickActions.classList.remove('open');
            }
        });

        // Quick action item clicks
        quickActions.querySelectorAll('.qa-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const service = item.dataset.service;
                quickActions.classList.remove('open');

                // Scroll to relevant section based on service
                const sectionMap = {
                    mass: '#services',
                    flowers: '#services',
                    schedule: '#how-it-works',
                    memorial: '#home'
                };
                const target = document.querySelector(sectionMap[service] || '#services');
                if (target) target.scrollIntoView({ behavior: 'smooth' });
            });
        });
    }
});
