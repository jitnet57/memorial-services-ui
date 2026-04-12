/* ========================================
   ALAALA — Auth Page Interactions
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

    // ===== Auth Tab Switching =====
    const tabs = document.querySelectorAll('.auth-tab');
    const signinForm = document.getElementById('signinForm');
    const signupForm = document.getElementById('signupForm');

    function switchTab(target) {
        tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === target));
        signinForm.classList.toggle('active', target === 'signin');
        signupForm.classList.toggle('active', target === 'signup');
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    // Switch-tab links
    document.querySelectorAll('.switch-tab').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            switchTab(btn.dataset.target);
        });
    });

    // ===== Phone / Email Method Toggle =====
    const methodBtns = document.querySelectorAll('.method-btn');
    const phoneForm = document.getElementById('signinPhoneForm');
    const emailForm = document.getElementById('signinEmailForm');

    methodBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            methodBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const method = btn.dataset.method;
            phoneForm.classList.toggle('hidden', method !== 'phone');
            emailForm.classList.toggle('hidden', method !== 'email');
        });
    });

    // ===== OTP Digit Auto-Focus =====
    const otpDigits = document.querySelectorAll('.otp-digit');
    otpDigits.forEach((digit, index) => {
        digit.addEventListener('input', (e) => {
            const val = e.target.value.replace(/\D/g, '');
            e.target.value = val;
            if (val && index < otpDigits.length - 1) {
                otpDigits[index + 1].focus();
            }
        });
        digit.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !digit.value && index > 0) {
                otpDigits[index - 1].focus();
            }
        });
        digit.addEventListener('paste', (e) => {
            e.preventDefault();
            const paste = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, 6);
            paste.split('').forEach((char, i) => {
                if (otpDigits[i]) otpDigits[i].value = char;
            });
            const nextEmpty = Math.min(paste.length, otpDigits.length - 1);
            otpDigits[nextEmpty].focus();
        });
    });

    // ===== Phone Sign-In: Send OTP =====
    const phoneGroup = document.getElementById('phoneGroup');
    const otpGroup = document.getElementById('otpGroup');
    const signinBtn = document.getElementById('signinSubmitBtn');

    document.getElementById('signinPhoneForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const phone = document.getElementById('signinPhone')?.value;
        if (!phone || phone.replace(/\s/g, '').length < 10) return;

        // Show OTP fields
        otpGroup.classList.remove('hidden');
        signinBtn.innerHTML = '<span class="material-symbols-outlined">login</span> Verify & Sign In';

        // Start countdown
        startCountdown();

        // Focus first OTP digit
        otpDigits[0]?.focus();
    });

    // ===== OTP Countdown =====
    let countdownTimer;
    function startCountdown() {
        let seconds = 60;
        const countdownEl = document.getElementById('countdown');
        const resendBtn = document.getElementById('resendBtn');
        resendBtn.disabled = true;

        clearInterval(countdownTimer);
        countdownTimer = setInterval(() => {
            seconds--;
            countdownEl.textContent = seconds;
            if (seconds <= 0) {
                clearInterval(countdownTimer);
                resendBtn.disabled = false;
                resendBtn.textContent = 'Resend code';
            }
        }, 1000);
    }

    document.getElementById('resendBtn')?.addEventListener('click', () => {
        startCountdown();
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

        strengthFill.className = 'strength-fill';
        if (val.length === 0) {
            strengthLabel.textContent = 'Password strength';
            strengthFill.style.width = '0';
        } else if (score <= 1) {
            strengthFill.classList.add('weak');
            strengthLabel.textContent = 'Weak';
        } else if (score <= 2) {
            strengthFill.classList.add('medium');
            strengthLabel.textContent = 'Medium';
        } else {
            strengthFill.classList.add('strong');
            strengthLabel.textContent = 'Strong';
        }
    });

    // ===== Prevent actual form submissions (prototype only) =====
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
        });
    });

    // ===== Social Login (Google & Facebook) =====
    const socialToast = document.getElementById('socialToast');
    const toastIcon = document.getElementById('toastIcon');
    const toastTitle = document.getElementById('toastTitle');
    const toastMsg = document.getElementById('toastMsg');

    function showSocialToast(provider, title, msg) {
        toastIcon.className = 'toast-icon ' + provider;
        toastTitle.textContent = title;
        toastMsg.textContent = msg;
        socialToast.classList.add('show');
    }

    function hideSocialToast() {
        socialToast.classList.remove('show');
    }

    document.querySelectorAll('.social-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const provider = btn.dataset.provider;
            if (!provider) return;

            const providerName = provider === 'google' ? 'Google' : 'Facebook';

            // Loading state
            btn.classList.add('loading');
            document.querySelectorAll('.social-btn').forEach(b => {
                if (b !== btn) b.style.opacity = '0.5';
                b.style.pointerEvents = 'none';
            });

            // Step 1: Connecting
            showSocialToast(provider, `Connecting to ${providerName}...`, 'Opening authentication window');

            // Step 2: Authenticating
            setTimeout(() => {
                showSocialToast(provider, `Signing in with ${providerName}...`, 'Verifying your account');
            }, 1200);

            // Step 3: Success
            setTimeout(() => {
                btn.classList.remove('loading');
                showSocialToast(provider, `Welcome back!`, 'Redirecting to your dashboard...');
                toastIcon.querySelector('.material-symbols-outlined').textContent = 'check_circle';
            }, 2400);

            // Step 4: Redirect
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 3400);
        });
    });

    // Email sign-in → redirect to dashboard
    document.getElementById('signinEmailForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('signinEmail')?.value;
        const pass = document.getElementById('signinPassword')?.value;
        if (!email || !pass) return;

        const submitBtn = e.target.querySelector('.btn-primary');
        submitBtn.innerHTML = '<span class="material-symbols-outlined" style="animation:spin .6s linear infinite">progress_activity</span> Signing in...';
        submitBtn.style.pointerEvents = 'none';

        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
    });

    // Sign-up → redirect to dashboard
    document.getElementById('signupFormFields')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('signupEmail')?.value;
        const pass = document.getElementById('signupPassword')?.value;
        const first = document.getElementById('firstName')?.value;
        if (!email || !pass || !first) return;

        const submitBtn = e.target.querySelector('.btn-primary');
        submitBtn.innerHTML = '<span class="material-symbols-outlined" style="animation:spin .6s linear infinite">progress_activity</span> Creating account...';
        submitBtn.style.pointerEvents = 'none';

        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1800);
    });
});
