/* ========================================
   ALAALA — Auth Page (Supabase)
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

    // ===== Redirect if already signed in =====
    sb.auth.getSession().then(({ data: { session } }) => {
        if (session) window.location.href = 'dashboard.html';
    });

    // ===== Auth Tab Switching =====
    const tabs = document.querySelectorAll('.auth-tab');
    const signinForm = document.getElementById('signinForm');
    const signupForm = document.getElementById('signupForm');

    function switchTab(target) {
        tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === target));
        signinForm?.classList.toggle('active', target === 'signin');
        signupForm?.classList.toggle('active', target === 'signup');
        clearErrors();
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    document.querySelectorAll('.switch-tab').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            switchTab(btn.dataset.target);
        });
    });

    // ===== Error Display =====
    function showError(formEl, message) {
        let err = formEl.querySelector('.auth-error');
        if (!err) {
            err = document.createElement('div');
            err.className = 'auth-error';
            formEl.prepend(err);
        }
        err.textContent = message;
        err.style.display = 'block';
    }

    function clearErrors() {
        document.querySelectorAll('.auth-error').forEach(e => e.style.display = 'none');
    }

    function setLoading(btn, loading, defaultHTML) {
        if (loading) {
            btn.innerHTML = '<span class="material-symbols-outlined" style="animation:spin .6s linear infinite">progress_activity</span> Please wait...';
            btn.disabled = true;
        } else {
            btn.innerHTML = defaultHTML;
            btn.disabled = false;
        }
    }

    // ===== Phone / Email Method Toggle =====
    const methodBtns = document.querySelectorAll('.method-btn');
    const phoneForm = document.getElementById('signinPhoneForm');
    const emailForm = document.getElementById('signinEmailForm');

    methodBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            methodBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const method = btn.dataset.method;
            phoneForm?.classList.toggle('hidden', method !== 'phone');
            emailForm?.classList.toggle('hidden', method !== 'email');
        });
    });

    // ===== OTP Digit Auto-Focus =====
    const otpDigits = document.querySelectorAll('.otp-digit');
    otpDigits.forEach((digit, index) => {
        digit.addEventListener('input', (e) => {
            const val = e.target.value.replace(/\D/g, '');
            e.target.value = val;
            if (val && index < otpDigits.length - 1) otpDigits[index + 1].focus();
        });
        digit.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !digit.value && index > 0) otpDigits[index - 1].focus();
        });
        digit.addEventListener('paste', (e) => {
            e.preventDefault();
            const paste = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, 6);
            paste.split('').forEach((char, i) => { if (otpDigits[i]) otpDigits[i].value = char; });
            otpDigits[Math.min(paste.length, otpDigits.length - 1)].focus();
        });
    });

    // ===== OTP Countdown =====
    let countdownTimer;
    function startCountdown() {
        let seconds = 60;
        const countdownEl = document.getElementById('countdown');
        const resendBtn = document.getElementById('resendBtn');
        if (resendBtn) resendBtn.disabled = true;
        clearInterval(countdownTimer);
        countdownTimer = setInterval(() => {
            seconds--;
            if (countdownEl) countdownEl.textContent = seconds;
            if (seconds <= 0) {
                clearInterval(countdownTimer);
                if (resendBtn) { resendBtn.disabled = false; resendBtn.textContent = 'Resend code'; }
            }
        }, 1000);
    }

    document.getElementById('resendBtn')?.addEventListener('click', () => startCountdown());

    // ===== Phone Sign-In (OTP) =====
    document.getElementById('signinPhoneForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const phoneRaw = document.getElementById('signinPhone')?.value || '';
        const phone = '+63' + phoneRaw.replace(/\D/g, '').replace(/^0/, '');
        if (phone.length < 13) { showError(e.target, 'Enter a valid Philippine mobile number.'); return; }

        const btn = e.target.querySelector('.btn-primary');
        const defaultHTML = btn.innerHTML;

        const otpGroup = document.getElementById('otpGroup');
        if (!otpGroup?.classList.contains('hidden') && otpGroup) {
            // Verify OTP
            const otp = [...otpDigits].map(d => d.value).join('');
            if (otp.length < 6) { showError(e.target, 'Enter the 6-digit code.'); return; }
            setLoading(btn, true, defaultHTML);
            const { error } = await sb.auth.verifyOtp({ phone, token: otp, type: 'sms' });
            if (error) { showError(e.target, error.message); setLoading(btn, false, defaultHTML); return; }
            window.location.href = 'dashboard.html';
        } else {
            // Send OTP
            setLoading(btn, true, defaultHTML);
            const { error } = await sb.auth.signInWithOtp({ phone });
            setLoading(btn, false, defaultHTML);
            if (error) { showError(e.target, error.message); return; }
            otpGroup?.classList.remove('hidden');
            btn.innerHTML = '<span class="material-symbols-outlined">login</span> Verify & Sign In';
            startCountdown();
            otpDigits[0]?.focus();
        }
    });

    // ===== Email Sign-In =====
    document.getElementById('signinEmailForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('signinEmail')?.value?.trim();
        const password = document.getElementById('signinPassword')?.value;
        if (!email || !password) return;

        const btn = e.target.querySelector('.btn-primary');
        const defaultHTML = btn.innerHTML;
        setLoading(btn, true, defaultHTML);

        const { error } = await sb.auth.signInWithPassword({ email, password });
        if (error) {
            setLoading(btn, false, defaultHTML);
            showError(e.target, error.message === 'Invalid login credentials'
                ? 'Incorrect email or password. Please try again.'
                : error.message);
            return;
        }
        window.location.href = 'dashboard.html';
    });

    // ===== Email Sign-Up =====
    document.getElementById('signupFormFields')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const firstName = document.getElementById('firstName')?.value?.trim();
        const lastName = document.getElementById('lastName')?.value?.trim() || '';
        const email = document.getElementById('signupEmail')?.value?.trim();
        const password = document.getElementById('signupPassword')?.value;
        if (!firstName || !email || !password) return;

        const btn = e.target.querySelector('.btn-primary');
        const defaultHTML = btn.innerHTML;
        setLoading(btn, true, defaultHTML);

        const { error } = await sb.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: [firstName, lastName].filter(Boolean).join(' ') },
                emailRedirectTo: window.location.origin + '/dashboard.html'
            }
        });

        if (error) {
            setLoading(btn, false, defaultHTML);
            showError(e.target, error.message);
            return;
        }

        btn.innerHTML = '<span class="material-symbols-outlined">mark_email_read</span> Check your email!';
        const form = document.getElementById('signupForm');
        if (form) {
            form.innerHTML = '<div style="text-align:center;padding:2rem"><span class="material-symbols-outlined" style="font-size:48px;color:var(--success)">mark_email_read</span>'
                + '<h2 style="margin:1rem 0 0.5rem">Check your inbox!</h2>'
                + '<p style="color:var(--text-secondary)">We sent a confirmation link to <strong>' + email + '</strong>. Click it to activate your account.</p></div>';
        }
    });

    // ===== Social Login (Google / Facebook) =====
    document.querySelectorAll('.social-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const provider = btn.dataset.provider;
            if (!provider) return;

            btn.classList.add('loading');
            document.querySelectorAll('.social-btn').forEach(b => { b.style.pointerEvents = 'none'; });

            const { error } = await sb.auth.signInWithOAuth({
                provider: provider,
                options: { redirectTo: window.location.origin + '/dashboard.html' }
            });

            if (error) {
                document.querySelectorAll('.social-btn').forEach(b => { b.classList.remove('loading'); b.style.pointerEvents = ''; });
                showError(document.querySelector('.auth-form.active') || document.body, error.message);
            }
        });
    });

    // ===== Password Visibility Toggle =====
    document.querySelectorAll('.password-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
            const input = btn.parentElement.querySelector('input');
            const icon = btn.querySelector('.material-symbols-outlined');
            if (input.type === 'password') {
                input.type = 'text';
                icon.textContent = 'visibility_off';
            } else {
                input.type = 'password';
                icon.textContent = 'visibility';
            }
        });
    });

    // ===== Password Strength Meter =====
    const signupPassword = document.getElementById('signupPassword');
    const strengthFill = document.querySelector('.strength-fill');
    const strengthLabel = document.querySelector('.strength-label');

    signupPassword?.addEventListener('input', () => {
        const val = signupPassword.value;
        let score = 0;
        if (val.length >= 8) score++;
        if (/[A-Z]/.test(val) && /[a-z]/.test(val)) score++;
        if (/\d/.test(val)) score++;
        if (/[^A-Za-z0-9]/.test(val)) score++;

        if (strengthFill) strengthFill.className = 'strength-fill';
        if (val.length === 0) {
            if (strengthLabel) strengthLabel.textContent = 'Password strength';
            if (strengthFill) strengthFill.style.width = '0';
        } else if (score <= 1) {
            strengthFill?.classList.add('weak');
            if (strengthLabel) strengthLabel.textContent = 'Weak';
        } else if (score <= 2) {
            strengthFill?.classList.add('medium');
            if (strengthLabel) strengthLabel.textContent = 'Medium';
        } else {
            strengthFill?.classList.add('strong');
            if (strengthLabel) strengthLabel.textContent = 'Strong';
        }
    });

});
