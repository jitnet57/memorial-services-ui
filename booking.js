/* ========================================
   ALAALA — Service Booking & Checkout JS
   ======================================== */

(function () {
    'use strict';

    // ===== THEME TOGGLE =====
    const themeToggle = document.getElementById('themeToggle');
    const root = document.documentElement;

    function applyTheme(theme) {
        root.setAttribute('data-theme', theme);
        localStorage.setItem('alaala-theme', theme);
    }

    const savedTheme = localStorage.getItem('alaala-theme') || 'light';
    applyTheme(savedTheme);

    if (themeToggle) {
        themeToggle.addEventListener('click', function () {
            const current = root.getAttribute('data-theme');
            applyTheme(current === 'dark' ? 'light' : 'dark');
        });
    }

    // ===== STATE =====
    let currentStep = 1;
    let selectedService = null;
    let servicePrice = 0;
    const SERVICE_FEE = 25;

    var calBooked = false;
    var calBookedStart = null;

    var calLinks = {
        'mass': 'kenneth-call/mass-offering',
        'flowers': 'kenneth-call/flower-delivery',
        'livestream': 'kenneth-call/live-stream',
        'ai-voice': 'kenneth-call/ai-voice-tribute',
        'lot-cleaning': 'kenneth-call/lot-cleaning',
        'tombstone-repair': 'kenneth-call/tombstone-repair'
    };

    (function() {
        window.Cal = window.Cal || function() {
            (window.Cal.q = window.Cal.q || []).push(arguments);
        };
        Cal('on', {
            action: 'bookingSuccessful',
            callback: function(e) {
                calBooked = true;
                calBookedStart = (e.detail && e.detail.data && e.detail.data.startTime) || null;
                var bannerKey = (selectedService === 'mass') ? 'mass'
                             : (selectedService === 'flowers') ? 'flowers'
                             : 'generic';
                var banner = document.getElementById('calBooked-' + bannerKey);
                var timeEl = document.getElementById('calBookedTime-' + bannerKey);
                if (timeEl && calBookedStart) {
                    var d = new Date(calBookedStart);
                    timeEl.textContent = d.toLocaleDateString('en-PH', {
                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                    });
                }
                if (banner) banner.style.display = 'flex';
            }
        });
    }());

    const serviceNames = {
        'mass': 'Mass Offering',
        'flowers': 'Flower Delivery',
        'livestream': 'Live Stream',
        'ai-voice': 'AI Voice Tribute',
        'sms': 'SMS Notifications',
        'candle': 'Virtual Candle',
        'lot-cleaning': 'Memorial Lot Cleaning',
        'tombstone-repair': 'Tombstone Repair'
    };

    const serviceIcons = {
        'mass': 'church',
        'flowers': 'local_florist',
        'livestream': 'videocam',
        'ai-voice': 'record_voice_over',
        'sms': 'sms',
        'candle': 'candle',
        'lot-cleaning': 'cleaning_services',
        'tombstone-repair': 'construction'
    };

    // ===== STEP NAVIGATION =====
    const steps = document.querySelectorAll('.booking-step');
    const stepIndicators = document.querySelectorAll('.step[data-step]');
    const stepLines = document.querySelectorAll('.step-line');

    function goToStep(n) {
        if (n < 1 || n > 4) return;

        // Hide all steps
        steps.forEach(function (s) { s.classList.remove('active'); });

        // Show target step
        const target = document.getElementById('step-' + n);
        if (target) target.classList.add('active');

        // Update stepper indicators
        stepIndicators.forEach(function (ind) {
            const stepNum = parseInt(ind.getAttribute('data-step'));
            ind.classList.remove('active', 'completed');
            if (stepNum < n) ind.classList.add('completed');
            else if (stepNum === n) ind.classList.add('active');
        });

        // Update connecting lines
        stepLines.forEach(function (line, idx) {
            var fill = line.querySelector('.step-line-fill');
            if (fill) {
                fill.style.width = (idx < n - 1) ? '100%' : '0';
                fill.style.height = (idx < n - 1) ? '100%' : '0';
            }
        });

        currentStep = n;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // ===== STEP 1: SERVICE SELECTION =====
    const serviceCards = document.querySelectorAll('.service-card');
    const step1Next = document.getElementById('step1Next');

    serviceCards.forEach(function (card) {
        card.addEventListener('click', function () {
            // Deselect all
            serviceCards.forEach(function (c) { c.classList.remove('selected'); });
            // Select this
            card.classList.add('selected');
            selectedService = card.getAttribute('data-service');
            servicePrice = parseInt(card.getAttribute('data-price')) || 0;

            // Enable next button
            if (step1Next) step1Next.disabled = false;
        });
    });

    if (step1Next) {
        step1Next.addEventListener('click', function () {
            if (!selectedService) return;
            setupStep2();
            goToStep(2);
        });
    }

    // ===== STEP 2: DYNAMIC FORM =====
    function setupStep2() {
        calBooked = false;
        calBookedStart = null;
        document.querySelectorAll('.cal-booked-banner').forEach(function(b) { b.style.display = 'none'; });

        // Hide all service forms
        document.querySelectorAll('.service-form').forEach(function (f) {
            f.classList.remove('active');
            f.style.display = 'none';
        });

        // Show relevant form
        var formId;
        if (selectedService === 'mass') formId = 'form-mass';
        else if (selectedService === 'flowers') formId = 'form-flowers';
        else formId = 'form-generic';

        var form = document.getElementById(formId);
        if (form) {
            form.classList.add('active');
            form.style.display = 'block';
        }

        // Set cal-link for generic widget based on selected service
        var genericWidget = document.getElementById('calWidget-generic');
        if (genericWidget && calLinks[selectedService]) {
            genericWidget.setAttribute('cal-link', calLinks[selectedService]);
        }
        // Hide cal embed for services that don't need scheduling
        var genericContainer = document.getElementById('calContainer-generic');
        if (genericContainer) {
            genericContainer.style.display = calLinks[selectedService] ? '' : 'none';
        }

        // Update summary sidebar
        var summaryIcon = document.getElementById('summaryIcon');
        var summaryName = document.getElementById('summaryServiceName');
        var summaryPrice = document.getElementById('summaryPrice');

        if (summaryIcon) summaryIcon.textContent = serviceIcons[selectedService] || 'storefront';
        if (summaryName) summaryName.textContent = serviceNames[selectedService] || 'Service';
        if (summaryPrice) summaryPrice.textContent = '₱' + numberFormat(servicePrice);

        // For flowers, update price based on selected arrangement
        if (selectedService === 'flowers') {
            updateFlowerPrice();
        }
    }

    // Flower arrangement price
    var flowerRadios = document.querySelectorAll('input[name="flowerType"]');
    flowerRadios.forEach(function (radio) {
        radio.addEventListener('change', function () {
            updateFlowerPrice();
        });
    });

    function updateFlowerPrice() {
        var checked = document.querySelector('input[name="flowerType"]:checked');
        if (checked) {
            var card = checked.closest('.arrangement-card');
            if (card) {
                servicePrice = parseInt(card.getAttribute('data-price')) || 800;
                var summaryPrice = document.getElementById('summaryPrice');
                if (summaryPrice) summaryPrice.textContent = '₱' + numberFormat(servicePrice);
            }
        }
    }

    // Include card toggle
    var includeCard = document.getElementById('includeCard');
    var cardMessageGroup = document.getElementById('cardMessageGroup');
    if (includeCard && cardMessageGroup) {
        includeCard.addEventListener('change', function () {
            cardMessageGroup.style.display = includeCard.checked ? 'block' : 'none';
        });
    }

    // Step 2 navigation
    var step2Back = document.getElementById('step2Back');
    var step2Next = document.getElementById('step2Next');

    if (step2Back) {
        step2Back.addEventListener('click', function () { goToStep(1); });
    }

    if (step2Next) {
        step2Next.addEventListener('click', function () {
            if (validateStep2()) {
                setupStep3();
                goToStep(3);
            }
        });
    }

    function validateStep2() {
        var form;
        if (selectedService === 'mass') {
            form = document.getElementById('form-mass');
            var parish = document.getElementById('massParish');
            if (!parish.value) {
                highlightInvalid(form);
                return false;
            }
            if (!calBooked) {
                flashCalContainer('calContainer-mass');
                return false;
            }
        } else if (selectedService === 'flowers') {
            form = document.getElementById('form-flowers');
            var fAddr = document.getElementById('flowerAddress');
            var fRecip = document.getElementById('flowerRecipient');
            if (!fAddr.value || !fRecip.value) {
                highlightInvalid(form);
                return false;
            }
            if (!calBooked) {
                flashCalContainer('calContainer-flowers');
                return false;
            }
        } else if (calLinks[selectedService]) {
            if (!calBooked) {
                flashCalContainer('calContainer-generic');
                return false;
            }
        }
        return true;
    }

    function flashCalContainer(id) {
        var el = document.getElementById(id);
        if (!el) return;
        el.style.outline = '2px solid var(--error)';
        el.style.borderRadius = 'var(--radius-md)';
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(function() { el.style.outline = ''; }, 2500);
    }

    function highlightInvalid(form) {
        if (!form) return;
        var inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
        inputs.forEach(function (inp) {
            if (!inp.value) {
                inp.style.borderColor = 'var(--error)';
                inp.addEventListener('input', function handler() {
                    inp.style.borderColor = '';
                    inp.removeEventListener('input', handler);
                }, { once: true });
                inp.addEventListener('change', function handler() {
                    inp.style.borderColor = '';
                    inp.removeEventListener('change', handler);
                }, { once: true });
            }
        });
    }

    // ===== STEP 3: PAYMENT =====
    function setupStep3() {
        var osServiceName = document.getElementById('osServiceName');
        var osServicePrice = document.getElementById('osServicePrice');
        var osSubtotal = document.getElementById('osSubtotal');
        var osTotal = document.getElementById('osTotal');
        var payAmount = document.getElementById('payAmount');
        var osMemorial = document.getElementById('osMemorial');
        var osDate = document.getElementById('osDate');

        if (osServiceName) osServiceName.textContent = serviceNames[selectedService] || 'Service';
        if (osServicePrice) osServicePrice.textContent = '₱' + numberFormat(servicePrice);
        if (osSubtotal) osSubtotal.textContent = '₱' + numberFormat(servicePrice);

        var total = servicePrice + SERVICE_FEE;
        if (osTotal) osTotal.textContent = '₱' + numberFormat(total);
        if (payAmount) payAmount.textContent = '₱' + numberFormat(total);

        // Get memorial name
        var memSelect = document.getElementById('memorialSelect');
        if (osMemorial && memSelect) {
            osMemorial.textContent = memSelect.options[memSelect.selectedIndex].text;
        }

        // Get date
        var dateVal = getScheduledDate();
        if (osDate) osDate.textContent = dateVal || '—';

        updatePayButton();
    }

    function getScheduledDate() {
        if (calBookedStart) {
            var d = new Date(calBookedStart);
            return d.toLocaleDateString('en-PH', {
                year: 'numeric', month: 'long', day: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });
        }
        return null;
    }

    // Payment method toggle
    var paymentMethods = document.querySelectorAll('.payment-method-card');
    var paymentForms = {
        'gcash': document.getElementById('pmForm-gcash'),
        'paymaya': document.getElementById('pmForm-paymaya'),
        'card': document.getElementById('pmForm-card'),
        'bank': document.getElementById('pmForm-bank')
    };

    paymentMethods.forEach(function (pm) {
        pm.addEventListener('click', function () {
            var method = pm.getAttribute('data-method');

            // Update active state
            paymentMethods.forEach(function (p) { p.classList.remove('active'); });
            pm.classList.add('active');

            // Show/hide forms
            Object.keys(paymentForms).forEach(function (key) {
                if (paymentForms[key]) {
                    paymentForms[key].style.display = (key === method) ? 'block' : 'none';
                }
            });
        });
    });

    // Card number formatting
    var cardNumber = document.getElementById('cardNumber');
    if (cardNumber) {
        cardNumber.addEventListener('input', function () {
            var val = cardNumber.value.replace(/\D/g, '').substring(0, 16);
            var formatted = val.replace(/(.{4})/g, '$1 ').trim();
            cardNumber.value = formatted;
        });
    }

    // Expiry formatting
    var cardExpiry = document.getElementById('cardExpiry');
    if (cardExpiry) {
        cardExpiry.addEventListener('input', function () {
            var val = cardExpiry.value.replace(/\D/g, '').substring(0, 4);
            if (val.length >= 2) {
                val = val.substring(0, 2) + '/' + val.substring(2);
            }
            cardExpiry.value = val;
        });
    }

    // CVV — digits only
    var cardCvv = document.getElementById('cardCvv');
    if (cardCvv) {
        cardCvv.addEventListener('input', function () {
            cardCvv.value = cardCvv.value.replace(/\D/g, '').substring(0, 4);
        });
    }

    // Phone number formatting
    function setupPhoneInput(id) {
        var input = document.getElementById(id);
        if (!input) return;
        input.addEventListener('input', function () {
            var val = input.value.replace(/\D/g, '').substring(0, 10);
            if (val.length > 3 && val.length <= 6) {
                val = val.substring(0, 3) + ' ' + val.substring(3);
            } else if (val.length > 6) {
                val = val.substring(0, 3) + ' ' + val.substring(3, 6) + ' ' + val.substring(6);
            }
            input.value = val;
        });
    }
    setupPhoneInput('gcashPhone');
    setupPhoneInput('paymayaPhone');

    // Promo code
    var applyPromo = document.getElementById('applyPromo');
    var promoCode = document.getElementById('promoCode');
    var promoFeedback = document.getElementById('promoFeedback');

    if (applyPromo) {
        applyPromo.addEventListener('click', function () {
            var code = promoCode ? promoCode.value.trim().toUpperCase() : '';
            if (!code) return;

            // Demo promo codes
            if (code === 'ALAALA10' || code === 'MEMORIAL') {
                if (promoFeedback) {
                    promoFeedback.textContent = '✓ Promo code applied! 10% discount.';
                    promoFeedback.className = 'promo-feedback success';
                }
                var discount = Math.round(servicePrice * 0.1);
                var total = servicePrice - discount + SERVICE_FEE;
                var osTotal = document.getElementById('osTotal');
                var payAmount = document.getElementById('payAmount');
                if (osTotal) osTotal.textContent = '₱' + numberFormat(total);
                if (payAmount) payAmount.textContent = '₱' + numberFormat(total);
            } else {
                if (promoFeedback) {
                    promoFeedback.textContent = '✗ Invalid promo code. Please try again.';
                    promoFeedback.className = 'promo-feedback error';
                }
            }
        });
    }

    // Terms checkbox + Pay button
    var agreeTerms = document.getElementById('agreeTerms');
    var payBtn = document.getElementById('payBtn');

    function updatePayButton() {
        if (payBtn && agreeTerms) {
            payBtn.disabled = !agreeTerms.checked;
        }
    }

    if (agreeTerms) {
        agreeTerms.addEventListener('change', updatePayButton);
    }

    // Step 3 back
    var step3Back = document.getElementById('step3Back');
    if (step3Back) {
        step3Back.addEventListener('click', function () { goToStep(2); });
    }

    // Pay button → confirmation
    if (payBtn) {
        payBtn.addEventListener('click', async function () {
            if (!agreeTerms || !agreeTerms.checked) return;
            if (!validatePayment()) return;

            payBtn.disabled = true;
            payBtn.textContent = 'Processing...';

            // Save order to Supabase
            if (typeof sb !== 'undefined') {
                try {
                    const { data: { session } } = await sb.auth.getSession();
                    var memSelect = document.getElementById('memorialSelect');
                    var memorialIdVal = memSelect ? memSelect.value : null;
                    var total = servicePrice + SERVICE_FEE;
                    var paymentMethodEl = document.querySelector('.payment-method-card.active');
                    var paymentMethod = paymentMethodEl ? paymentMethodEl.getAttribute('data-method') : 'unknown';

                    var orderData = {
                        service_type: selectedService,
                        amount: total,
                        status: 'confirmed',
                        payment_method: paymentMethod,
                        scheduled_at: calBookedStart || null
                    };
                    if (session) orderData.user_id = session.user.id;
                    if (memorialIdVal) orderData.memorial_id = memorialIdVal;

                    await sb.from('orders').insert(orderData);
                } catch (err) {
                    console.error('Order save error:', err);
                }
            }

            setupStep4();
            goToStep(4);
        });
    }

    function validatePayment() {
        var method = document.querySelector('input[name="paymentMethod"]:checked');
        if (!method) return false;

        var val = method.value;
        if (val === 'gcash') {
            var phone = document.getElementById('gcashPhone');
            if (!phone || phone.value.replace(/\D/g, '').length < 10) {
                if (phone) phone.style.borderColor = 'var(--error)';
                return false;
            }
        } else if (val === 'paymaya') {
            var phone2 = document.getElementById('paymayaPhone');
            if (!phone2 || phone2.value.replace(/\D/g, '').length < 10) {
                if (phone2) phone2.style.borderColor = 'var(--error)';
                return false;
            }
        } else if (val === 'card') {
            var cn = document.getElementById('cardNumber');
            var ce = document.getElementById('cardExpiry');
            var cc = document.getElementById('cardCvv');
            var cname = document.getElementById('cardName');
            var valid = true;
            if (!cname || !cname.value.trim()) { if (cname) cname.style.borderColor = 'var(--error)'; valid = false; }
            if (!cn || cn.value.replace(/\D/g, '').length < 13) { if (cn) cn.style.borderColor = 'var(--error)'; valid = false; }
            if (!ce || ce.value.length < 5) { if (ce) ce.style.borderColor = 'var(--error)'; valid = false; }
            if (!cc || cc.value.length < 3) { if (cc) cc.style.borderColor = 'var(--error)'; valid = false; }
            return valid;
        }
        return true;
    }

    // ===== STEP 4: CONFIRMATION =====
    function setupStep4() {
        var confirmService = document.getElementById('confirmService');
        var confirmMemorial = document.getElementById('confirmMemorial');
        var confirmDate = document.getElementById('confirmDate');
        var confirmAmount = document.getElementById('confirmAmount');

        if (confirmService) confirmService.textContent = serviceNames[selectedService] || 'Service';

        var memSelect = document.getElementById('memorialSelect');
        if (confirmMemorial && memSelect) {
            confirmMemorial.textContent = memSelect.options[memSelect.selectedIndex].text;
        }

        var dateVal = getScheduledDate();
        if (confirmDate) confirmDate.textContent = dateVal || '—';

        var total = servicePrice + SERVICE_FEE;
        if (confirmAmount) confirmAmount.textContent = '₱' + numberFormat(total);
    }

    // ===== HELPERS =====
    function numberFormat(n) {
        return n.toLocaleString('en-PH');
    }

    // ===== URL PARAM: PRE-SELECT SERVICE =====
    (function () {
        var params = new URLSearchParams(window.location.search);
        var preservice = params.get('service');
        if (!preservice) return;

        var card = document.querySelector('.service-card[data-service="' + preservice + '"]');
        if (!card) return;

        serviceCards.forEach(function (c) { c.classList.remove('selected'); });
        card.classList.add('selected');
        selectedService = card.getAttribute('data-service');
        servicePrice = parseInt(card.getAttribute('data-price')) || 0;
        if (step1Next) step1Next.disabled = false;

        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }());

})();
