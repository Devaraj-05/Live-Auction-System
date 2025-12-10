/* CREATE AUCTION PAGE - API INTEGRATED */

// State
const CreateAuctionState = {
    currentStep: 1,
    totalSteps: 5,
    formData: {},
    images: []
};

document.addEventListener('DOMContentLoaded', () => {
    initCreateAuctionPage();
});

function initCreateAuctionPage() {
    // Check auth
    if (!TokenManager?.isLoggedIn()) {
        showToast('Please login to create an auction', 'warning');
        setTimeout(() => window.location.href = '../index.html', 1500);
        return;
    }

    initStepNavigation();
    initImageUpload();
    initFormInputs();
    loadCategories();
}

// Step navigation
function initStepNavigation() {
    document.querySelectorAll('.next-step-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (validateCurrentStep()) {
                goToStep(CreateAuctionState.currentStep + 1);
            }
        });
    });

    document.querySelectorAll('.prev-step-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            goToStep(CreateAuctionState.currentStep - 1);
        });
    });

    document.querySelectorAll('.step-indicator').forEach((step, idx) => {
        step.addEventListener('click', () => {
            if (idx + 1 < CreateAuctionState.currentStep) {
                goToStep(idx + 1);
            }
        });
    });
}

function goToStep(step) {
    if (step < 1 || step > CreateAuctionState.totalSteps) return;

    CreateAuctionState.currentStep = step;

    // Update step indicators
    document.querySelectorAll('.step-indicator').forEach((el, idx) => {
        el.classList.toggle('active', idx + 1 === step);
        el.classList.toggle('completed', idx + 1 < step);
    });

    // Show/hide step content
    document.querySelectorAll('.form-step').forEach((el, idx) => {
        el.classList.toggle('active', idx + 1 === step);
    });

    // Update review if on last step
    if (step === CreateAuctionState.totalSteps) {
        updateReviewStep();
    }
}

function validateCurrentStep() {
    const step = CreateAuctionState.currentStep;
    const formData = CreateAuctionState.formData;

    switch (step) {
        case 1: // Details
            const title = document.getElementById('auctionTitle')?.value.trim();
            const description = document.getElementById('auctionDescription')?.value.trim();
            const category = document.getElementById('auctionCategory')?.value;
            const condition = document.getElementById('auctionCondition')?.value;

            if (!title || title.length < 5) {
                showToast('Title must be at least 5 characters', 'error');
                return false;
            }
            if (!description || description.length < 20) {
                showToast('Description must be at least 20 characters', 'error');
                return false;
            }

            formData.title = title;
            formData.description = description;
            formData.category_id = category;
            formData.condition_type = condition;
            return true;

        case 2: // Media
            if (CreateAuctionState.images.length === 0) {
                showToast('Please upload at least one image', 'error');
                return false;
            }
            formData.images = CreateAuctionState.images;
            return true;

        case 3: // Pricing
            const startingPrice = parseFloat(document.getElementById('startingPrice')?.value);
            const reservePrice = document.getElementById('reservePrice')?.value;
            const buyNowPrice = document.getElementById('buyNowPrice')?.value;
            const duration = document.getElementById('auctionDuration')?.value;

            if (!startingPrice || startingPrice <= 0) {
                showToast('Please enter a valid starting price', 'error');
                return false;
            }

            formData.starting_price = startingPrice;
            formData.reserve_price = reservePrice ? parseFloat(reservePrice) : null;
            formData.buy_now_price = buyNowPrice ? parseFloat(buyNowPrice) : null;
            formData.duration_days = parseInt(duration) || 7;
            return true;

        case 4: // Shipping
            const shippingCost = document.getElementById('shippingCost')?.value;
            const freeShipping = document.getElementById('freeShipping')?.checked;
            const localPickup = document.getElementById('localPickup')?.checked;
            const returnAccepted = document.getElementById('returnAccepted')?.checked;

            formData.shipping_cost = parseFloat(shippingCost) || 0;
            formData.free_shipping = freeShipping;
            formData.local_pickup = localPickup;
            formData.return_accepted = returnAccepted;
            return true;

        default:
            return true;
    }
}

// Image upload
function initImageUpload() {
    const dropZone = document.getElementById('imageDropZone');
    const fileInput = document.getElementById('imageInput');
    const preview = document.getElementById('imagePreview');

    if (!dropZone || !fileInput) return;

    dropZone.addEventListener('click', () => fileInput.click());

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        handleFiles(e.dataTransfer.files);
    });

    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });

    function handleFiles(files) {
        for (const file of files) {
            if (!file.type.startsWith('image/')) continue;
            if (CreateAuctionState.images.length >= 10) {
                showToast('Maximum 10 images allowed', 'warning');
                break;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const imageData = {
                    url: e.target.result,
                    thumbnail: e.target.result,
                    name: file.name
                };
                CreateAuctionState.images.push(imageData);
                renderImagePreview();
            };
            reader.readAsDataURL(file);
        }
    }

    function renderImagePreview() {
        if (!preview) return;

        preview.innerHTML = CreateAuctionState.images.map((img, idx) => `
      <div class="image-preview-item" data-index="${idx}">
        <img src="${img.url}" alt="Preview ${idx + 1}">
        <button type="button" class="remove-image" onclick="removeImage(${idx})">✕</button>
        ${idx === 0 ? '<span class="primary-badge">Primary</span>' : ''}
      </div>
    `).join('');
    }
}

function removeImage(index) {
    CreateAuctionState.images.splice(index, 1);
    const preview = document.getElementById('imagePreview');
    if (preview) {
        preview.innerHTML = CreateAuctionState.images.map((img, idx) => `
      <div class="image-preview-item" data-index="${idx}">
        <img src="${img.url}" alt="Preview ${idx + 1}">
        <button type="button" class="remove-image" onclick="removeImage(${idx})">✕</button>
        ${idx === 0 ? '<span class="primary-badge">Primary</span>' : ''}
      </div>
    `).join('');
    }
}

// Load categories
async function loadCategories() {
    const select = document.getElementById('auctionCategory');
    if (!select) return;

    try {
        const result = await API.Auctions.getCategories();

        if (result.success && result.data.length > 0) {
            const categories = result.data.filter(c => !c.parent_id);
            select.innerHTML = '<option value="">Select Category</option>' +
                categories.map(c => `<option value="${c.category_id}">${c.icon || ''} ${c.name}</option>`).join('');
        }
    } catch (error) {
        console.error('Load categories error:', error);
    }
}

// Form inputs
function initFormInputs() {
    // Auto-save on input
    document.querySelectorAll('input, textarea, select').forEach(input => {
        input.addEventListener('change', () => {
            if (input.name) {
                CreateAuctionState.formData[input.name] = input.type === 'checkbox' ? input.checked : input.value;
            }
        });
    });
}

// Update review step
function updateReviewStep() {
    const data = CreateAuctionState.formData;

    const setReview = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value || '-';
    };

    setReview('reviewTitle', data.title);
    setReview('reviewDescription', data.description?.substring(0, 200) + '...');
    setReview('reviewStartingPrice', data.starting_price ? `$${data.starting_price}` : '-');
    setReview('reviewReservePrice', data.reserve_price ? `$${data.reserve_price}` : 'None');
    setReview('reviewBuyNowPrice', data.buy_now_price ? `$${data.buy_now_price}` : 'None');
    setReview('reviewDuration', `${data.duration_days || 7} days`);
    setReview('reviewShipping', data.free_shipping ? 'Free Shipping' : `$${data.shipping_cost || 0}`);

    // Show first image
    const imageEl = document.getElementById('reviewImage');
    if (imageEl && CreateAuctionState.images.length > 0) {
        imageEl.src = CreateAuctionState.images[0].url;
    }
}

// Submit auction
async function submitAuction() {
    const submitBtn = document.getElementById('submitAuctionBtn');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating auction...';
    }

    try {
        const result = await API.Auctions.create({
            ...CreateAuctionState.formData,
            start_immediately: true
        });

        if (result.success) {
            showToast('Auction created successfully!', 'success');
            setTimeout(() => {
                window.location.href = `auction.html?id=${result.data.auction_id}`;
            }, 1500);
        } else {
            showToast(result.message || 'Failed to create auction', 'error');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Publish Auction';
            }
        }
    } catch (error) {
        showToast('Error creating auction', 'error');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Publish Auction';
        }
    }
}

function showToast(message, type = 'info') {
    if (typeof window.showToast === 'function') {
        window.showToast(message, type);
    } else {
        alert(message);
    }
}

// Export for button onclick
window.submitAuction = submitAuction;
window.removeImage = removeImage;
