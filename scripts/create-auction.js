/* LIVE AUCTION SYSTEM - CREATE AUCTION JS */

let currentStep = 1;
const totalSteps = 5;

document.addEventListener('DOMContentLoaded', () => {
    initWizard();
    initUploadZone();
    initRichEditor();
});

function initWizard() {
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    const publishBtn = document.getElementById('publishBtn');
    const saveDraftBtn = document.getElementById('saveDraftBtn');

    nextBtn?.addEventListener('click', () => {
        if (validateStep(currentStep)) {
            goToStep(currentStep + 1);
        }
    });

    prevBtn?.addEventListener('click', () => {
        goToStep(currentStep - 1);
    });

    publishBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        publishAuction();
    });

    saveDraftBtn?.addEventListener('click', () => {
        showToast('Draft saved successfully!', 'success');
    });

    // Step click navigation
    document.querySelectorAll('.step').forEach(step => {
        step.addEventListener('click', () => {
            const targetStep = parseInt(step.dataset.step);
            if (targetStep < currentStep || validateStep(currentStep)) {
                goToStep(targetStep);
            }
        });
    });
}

function goToStep(step) {
    if (step < 1 || step > totalSteps) return;

    // Update step indicators
    document.querySelectorAll('.step').forEach(s => {
        const sNum = parseInt(s.dataset.step);
        s.classList.toggle('active', sNum === step);
        s.classList.toggle('completed', sNum < step);
    });

    document.querySelectorAll('.step-line').forEach((line, i) => {
        line.classList.toggle('active', i < step - 1);
    });

    // Update form steps
    document.querySelectorAll('.form-step').forEach(formStep => {
        formStep.classList.toggle('active', parseInt(formStep.dataset.step) === step);
    });

    // Update buttons
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const publishBtn = document.getElementById('publishBtn');

    prevBtn.style.display = step > 1 ? 'block' : 'none';
    nextBtn.style.display = step < totalSteps ? 'block' : 'none';
    publishBtn.style.display = step === totalSteps ? 'block' : 'none';

    currentStep = step;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function validateStep(step) {
    const formStep = document.querySelector(`.form-step[data-step="${step}"]`);
    if (!formStep) return true;

    const requiredFields = formStep.querySelectorAll('[required]');
    let valid = true;

    requiredFields.forEach(field => {
        if (!field.value && field.type !== 'checkbox' && field.type !== 'radio') {
            field.classList.add('error');
            valid = false;
        } else if ((field.type === 'checkbox' || field.type === 'radio') && field.required && !field.checked) {
            // Check if any radio in the group is checked
            const name = field.name;
            if (name) {
                const checked = formStep.querySelector(`input[name="${name}"]:checked`);
                if (!checked) {
                    valid = false;
                }
            }
        } else {
            field.classList.remove('error');
        }
    });

    if (!valid) {
        showToast('Please fill in all required fields', 'error');
    }

    return valid;
}

function initUploadZone() {
    const uploadZone = document.getElementById('uploadZone');
    const imageInput = document.getElementById('imageInput');
    const imagePreview = document.getElementById('imagePreview');

    if (!uploadZone || !imageInput) return;

    uploadZone.addEventListener('click', () => imageInput.click());

    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('dragover');
    });

    uploadZone.addEventListener('dragleave', () => {
        uploadZone.classList.remove('dragover');
    });

    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('dragover');
        handleFiles(e.dataTransfer.files);
    });

    imageInput.addEventListener('change', () => {
        handleFiles(imageInput.files);
    });

    function handleFiles(files) {
        Array.from(files).forEach((file, index) => {
            if (!file.type.startsWith('image/')) return;
            if (file.size > 5 * 1024 * 1024) {
                showToast(`${file.name} is too large (max 5MB)`, 'error');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const div = document.createElement('div');
                div.className = `image-preview-item ${imagePreview.children.length === 0 ? 'main' : ''}`;
                div.innerHTML = `
          <img src="${e.target.result}" alt="Preview">
          <button type="button" class="image-preview-remove">✕</button>
        `;
                imagePreview.appendChild(div);

                div.querySelector('.image-preview-remove').addEventListener('click', () => {
                    div.remove();
                    updateMainImage();
                });
            };
            reader.readAsDataURL(file);
        });
    }

    function updateMainImage() {
        const items = imagePreview.querySelectorAll('.image-preview-item');
        items.forEach((item, i) => {
            item.classList.toggle('main', i === 0);
        });
    }
}

function initRichEditor() {
    const toolbar = document.querySelector('.editor-toolbar');
    const content = document.querySelector('.editor-content');

    if (!toolbar || !content) return;

    toolbar.querySelectorAll('.editor-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const cmd = btn.dataset.cmd;
            document.execCommand(cmd, false, null);
            content.focus();
            btn.classList.toggle('active');
        });
    });
}

function publishAuction() {
    // Validate all steps
    for (let i = 1; i <= totalSteps; i++) {
        if (!validateStep(i)) {
            goToStep(i);
            return;
        }
    }

    // Check terms checkbox
    const termsCheck = document.querySelector('.review-checklist input[required]');
    if (termsCheck && !termsCheck.checked) {
        showToast('Please agree to the Terms of Service', 'error');
        return;
    }

    // Simulate publishing
    const publishBtn = document.getElementById('publishBtn');
    publishBtn.disabled = true;
    publishBtn.innerHTML = '<span class="spinner spinner-sm"></span> Publishing...';

    setTimeout(() => {
        showToast('🎉 Auction published successfully!', 'success');
        setTimeout(() => {
            window.location.href = 'dashboard.html?tab=selling';
        }, 1500);
    }, 2000);
}

function showToast(message, type = 'info') {
    if (window.showToast) {
        window.showToast(message, type);
        return;
    }

    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<span>${message}</span><button class="toast-close">✕</button>`;
    container.appendChild(toast);

    toast.querySelector('.toast-close').addEventListener('click', () => toast.remove());
    setTimeout(() => toast.remove(), 4000);
}
