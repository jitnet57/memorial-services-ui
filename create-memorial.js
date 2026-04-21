/* ========================================
   ALAALA — Create Memorial Wizard
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

    // ===== Wizard State =====
    let currentStep = 1;
    const totalSteps = 5;
    const panels = document.querySelectorAll('.wizard-panel');
    const steps = document.querySelectorAll('.wizard-step');
    const lines = document.querySelectorAll('.wizard-step-line');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const stepIndicator = document.getElementById('currentStep');

    function goToStep(step) {
        currentStep = step;

        // Panels
        panels.forEach((p, i) => {
            p.classList.toggle('active', i === step - 1);
        });

        // Step circles
        steps.forEach((s, i) => {
            s.classList.remove('active', 'completed');
            if (i + 1 === step) s.classList.add('active');
            else if (i + 1 < step) s.classList.add('completed');
        });

        // Lines
        lines.forEach((l, i) => {
            l.classList.toggle('active', i < step - 1);
        });

        // Navigation buttons
        prevBtn.style.visibility = step === 1 ? 'hidden' : 'visible';
        if (step === totalSteps) {
            nextBtn.innerHTML = '<span class="material-symbols-outlined">check</span> Publish Memorial';
            nextBtn.classList.add('publish');
        } else {
            nextBtn.innerHTML = 'Next <span class="material-symbols-outlined">arrow_forward</span>';
            nextBtn.classList.remove('publish');
        }

        stepIndicator.textContent = step;

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    nextBtn?.addEventListener('click', async () => {
        if (currentStep < totalSteps) {
            goToStep(currentStep + 1);
        } else {
            const { data: { session } } = await sb.auth.getSession();
            if (!session) { window.location.href = 'auth.html'; return; }

            const firstName = document.getElementById('deceasedFirst')?.value?.trim() || '';
            const lastName = document.getElementById('deceasedLast')?.value?.trim() || '';
            const fullName = [firstName, lastName].filter(Boolean).join(' ');
            if (!fullName) { alert('Please enter the deceased\'s name.'); goToStep(1); return; }

            const slug = fullName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();

            nextBtn.disabled = true;
            nextBtn.innerHTML = '<span class="material-symbols-outlined" style="animation:spin .6s linear infinite">progress_activity</span> Publishing...';

            const { data, error } = await sb.from('memorials').insert({
                owner_id: session.user.id,
                full_name: fullName,
                slug,
                birth_date: document.getElementById('birthDate')?.value || null,
                death_date: document.getElementById('deathDate')?.value || null,
                location_name: document.getElementById('restingPlace')?.value || null,
                biography: document.getElementById('obituary')?.value || null,
                status: 'published'
            }).select().single();

            if (error) {
                nextBtn.disabled = false;
                nextBtn.innerHTML = '<span class="material-symbols-outlined">check</span> Publish Memorial';
                nextBtn.classList.add('publish');
                alert('Error: ' + error.message);
                return;
            }
            window.location.href = 'memorial.html?id=' + data.slug;
        }
    });

    prevBtn?.addEventListener('click', () => {
        if (currentStep > 1) goToStep(currentStep - 1);
    });

    // Edit step buttons on review page
    document.querySelectorAll('.edit-step-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const step = parseInt(btn.dataset.goto);
            if (step) goToStep(step);
        });
    });

    // ===== Live Preview — Step 1 =====
    const firstNameInput = document.getElementById('deceasedFirst');
    const lastNameInput = document.getElementById('deceasedLast');
    const birthDateInput = document.getElementById('birthDate');
    const deathDateInput = document.getElementById('deathDate');
    const restingInput = document.getElementById('restingPlace');
    const previewName = document.getElementById('previewName');
    const previewDates = document.getElementById('previewDates');
    const previewLocation = document.getElementById('previewLocation');

    function updatePreview() {
        const first = firstNameInput?.value || '';
        const last = lastNameInput?.value || '';
        previewName.textContent = (first || last) ? `${first} ${last}`.trim() : 'Full Name';

        const birth = birthDateInput?.value;
        const death = deathDateInput?.value;
        const birthYear = birth ? new Date(birth).getFullYear() : '';
        const deathYear = death ? new Date(death).getFullYear() : '';
        previewDates.textContent = (birthYear || deathYear)
            ? `${birthYear || '?'} — ${deathYear || '?'}`
            : 'Birth — Passing';

        const resting = restingInput?.value;
        const locSpan = previewLocation?.querySelector('span:last-child');
        if (locSpan) locSpan.textContent = resting || 'Resting place';
    }

    [firstNameInput, lastNameInput, birthDateInput, deathDateInput, restingInput].forEach(el => {
        el?.addEventListener('input', updatePreview);
    });

    // ===== Epitaph Character Count =====
    const epitaphInput = document.getElementById('epitaph');
    const epitaphCount = document.getElementById('epitaphCount');
    const previewEpitaph = document.getElementById('previewEpitaph');

    epitaphInput?.addEventListener('input', () => {
        const len = epitaphInput.value.length;
        epitaphCount.textContent = len;
        if (previewEpitaph) {
            previewEpitaph.textContent = epitaphInput.value || '"Forever in our hearts"';
        }
    });

    // ===== Obituary to Preview =====
    const obituaryInput = document.getElementById('obituary');
    const previewStory = document.getElementById('previewStory');

    obituaryInput?.addEventListener('input', () => {
        if (previewStory) {
            const text = obituaryInput.value.trim();
            previewStory.innerHTML = text
                ? `<p>${text.substring(0, 200)}${text.length > 200 ? '...' : ''}</p>`
                : '<p>The life story will appear here...</p>';
        }
    });

    // ===== Upload Areas — Click to trigger file input =====
    document.querySelectorAll('.profile-upload-area, .cover-upload-area, .gallery-upload-area').forEach(area => {
        area.addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            if (area.classList.contains('gallery-upload-area')) {
                input.multiple = true;
            }
            input.click();
        });

        // Drag & drop
        area.addEventListener('dragover', (e) => {
            e.preventDefault();
            area.style.borderColor = 'var(--primary)';
            area.style.background = 'rgba(99,102,241,0.05)';
        });
        area.addEventListener('dragleave', () => {
            area.style.borderColor = '';
            area.style.background = '';
        });
        area.addEventListener('drop', (e) => {
            e.preventDefault();
            area.style.borderColor = '';
            area.style.background = '';
        });
    });
});
