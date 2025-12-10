/* LIVE AUCTION SYSTEM - UI COMPONENTS JS */

// Modal Class
class Modal {
    constructor(id) {
        this.modal = document.getElementById(id);
        if (!this.modal) return;
        this.closeBtn = this.modal.querySelector('.modal-close');
        this.init();
    }

    init() {
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.close());
        }
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.close();
        });
    }

    open() { this.modal.classList.add('active'); document.body.style.overflow = 'hidden'; }
    close() { this.modal.classList.remove('active'); document.body.style.overflow = ''; }
    toggle() { this.modal.classList.contains('active') ? this.close() : this.open(); }
}

// Tab Component
class Tabs {
    constructor(container) {
        this.container = typeof container === 'string' ? document.querySelector(container) : container;
        if (!this.container) return;
        this.tabs = this.container.querySelectorAll('.tab');
        this.panels = this.container.querySelectorAll('.tab-content');
        this.init();
    }

    init() {
        this.tabs.forEach(tab => {
            tab.addEventListener('click', () => this.activate(tab.dataset.tab));
        });
    }

    activate(id) {
        this.tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === id));
        this.panels.forEach(p => p.classList.toggle('active', p.id === id));
    }
}

// Carousel Component
class Carousel {
    constructor(container, options = {}) {
        this.container = typeof container === 'string' ? document.querySelector(container) : container;
        if (!this.container) return;
        this.slides = this.container.querySelectorAll('.carousel-slide, .hero-slide');
        this.currentIndex = 0;
        this.autoplay = options.autoplay ?? true;
        this.interval = options.interval ?? 5000;
        this.init();
    }

    init() {
        if (this.autoplay && this.slides.length > 1) {
            setInterval(() => this.next(), this.interval);
        }
    }

    next() {
        this.slides[this.currentIndex].classList.remove('active');
        this.currentIndex = (this.currentIndex + 1) % this.slides.length;
        this.slides[this.currentIndex].classList.add('active');
    }

    prev() {
        this.slides[this.currentIndex].classList.remove('active');
        this.currentIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
        this.slides[this.currentIndex].classList.add('active');
    }

    goTo(index) {
        this.slides[this.currentIndex].classList.remove('active');
        this.currentIndex = index;
        this.slides[this.currentIndex].classList.add('active');
    }
}

// Form Validation
class FormValidator {
    constructor(form, rules) {
        this.form = typeof form === 'string' ? document.querySelector(form) : form;
        this.rules = rules;
        if (!this.form) return;
        this.init();
    }

    init() {
        this.form.addEventListener('submit', (e) => {
            if (!this.validate()) e.preventDefault();
        });

        this.form.querySelectorAll('input, select, textarea').forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearError(input));
        });
    }

    validate() {
        let valid = true;
        this.form.querySelectorAll('input[required], select[required], textarea[required]').forEach(input => {
            if (!this.validateField(input)) valid = false;
        });
        return valid;
    }

    validateField(input) {
        const value = input.value.trim();
        const name = input.name || input.id;
        let error = '';

        if (input.required && !value) {
            error = 'This field is required';
        } else if (input.type === 'email' && value && !this.isValidEmail(value)) {
            error = 'Please enter a valid email';
        } else if (input.minLength && value.length < input.minLength) {
            error = `Minimum ${input.minLength} characters required`;
        }

        if (error) {
            this.showError(input, error);
            return false;
        }
        this.clearError(input);
        return true;
    }

    showError(input, message) {
        input.classList.add('error');
        let errorEl = input.parentElement.querySelector('.form-error');
        if (!errorEl) {
            errorEl = document.createElement('span');
            errorEl.className = 'form-error';
            input.parentElement.appendChild(errorEl);
        }
        errorEl.textContent = message;
    }

    clearError(input) {
        input.classList.remove('error');
        const errorEl = input.parentElement.querySelector('.form-error');
        if (errorEl) errorEl.remove();
    }

    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
}

// Countdown Timer
class CountdownTimer {
    constructor(element, endTime, onEnd) {
        this.element = typeof element === 'string' ? document.querySelector(element) : element;
        this.endTime = new Date(endTime);
        this.onEnd = onEnd;
        if (!this.element) return;
        this.start();
    }

    start() {
        this.update();
        this.interval = setInterval(() => this.update(), 1000);
    }

    update() {
        const now = new Date();
        const diff = this.endTime - now;

        if (diff <= 0) {
            clearInterval(this.interval);
            if (this.onEnd) this.onEnd();
            this.element.textContent = 'Ended';
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);

        if (this.element.querySelector('.countdown-value')) {
            this.element.querySelector('[data-days]').textContent = String(days).padStart(2, '0');
            this.element.querySelector('[data-hours]').textContent = String(hours).padStart(2, '0');
            this.element.querySelector('[data-minutes]').textContent = String(minutes).padStart(2, '0');
            this.element.querySelector('[data-seconds]').textContent = String(seconds).padStart(2, '0');
        } else {
            this.element.textContent = days > 0 ? `${days}d ${hours}h` : `${hours}h ${minutes}m ${seconds}s`;
        }
    }

    stop() {
        clearInterval(this.interval);
    }
}

// Image Lightbox
class Lightbox {
    constructor() {
        this.current = 0;
        this.images = [];
        this.overlay = null;
        this.init();
    }

    init() {
        document.addEventListener('click', (e) => {
            const trigger = e.target.closest('[data-lightbox]');
            if (trigger) {
                e.preventDefault();
                this.open(trigger);
            }
        });
    }

    open(trigger) {
        const group = trigger.dataset.lightboxGroup || 'default';
        this.images = Array.from(document.querySelectorAll(`[data-lightbox][data-lightbox-group="${group}"]`))
            .map(el => el.href || el.src || el.dataset.lightbox);
        this.current = this.images.indexOf(trigger.href || trigger.src || trigger.dataset.lightbox);
        this.createOverlay();
        this.show();
    }

    createOverlay() {
        if (this.overlay) return;
        this.overlay = document.createElement('div');
        this.overlay.className = 'lightbox-overlay';
        this.overlay.innerHTML = `
      <button class="lightbox-close">✕</button>
      <button class="lightbox-prev">❮</button>
      <img class="lightbox-image" src="" alt="">
      <button class="lightbox-next">❯</button>
      <span class="lightbox-counter"></span>
    `;
        document.body.appendChild(this.overlay);

        this.overlay.querySelector('.lightbox-close').addEventListener('click', () => this.close());
        this.overlay.querySelector('.lightbox-prev').addEventListener('click', () => this.prev());
        this.overlay.querySelector('.lightbox-next').addEventListener('click', () => this.next());
        this.overlay.addEventListener('click', (e) => { if (e.target === this.overlay) this.close(); });
    }

    show() {
        this.overlay.querySelector('.lightbox-image').src = this.images[this.current];
        this.overlay.querySelector('.lightbox-counter').textContent = `${this.current + 1} / ${this.images.length}`;
        this.overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    close() {
        this.overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    next() {
        this.current = (this.current + 1) % this.images.length;
        this.show();
    }

    prev() {
        this.current = (this.current - 1 + this.images.length) % this.images.length;
        this.show();
    }
}

// Range Slider
class RangeSlider {
    constructor(container, options = {}) {
        this.container = typeof container === 'string' ? document.querySelector(container) : container;
        if (!this.container) return;
        this.min = options.min ?? 0;
        this.max = options.max ?? 100;
        this.step = options.step ?? 1;
        this.values = options.values ?? [this.min, this.max];
        this.onChange = options.onChange;
        this.init();
    }

    init() {
        this.container.innerHTML = `
      <div class="range-track"><div class="range-fill"></div></div>
      <input type="range" class="range-min" min="${this.min}" max="${this.max}" step="${this.step}" value="${this.values[0]}">
      <input type="range" class="range-max" min="${this.min}" max="${this.max}" step="${this.step}" value="${this.values[1]}">
    `;
        this.minInput = this.container.querySelector('.range-min');
        this.maxInput = this.container.querySelector('.range-max');
        this.fill = this.container.querySelector('.range-fill');

        this.minInput.addEventListener('input', () => this.updateMin());
        this.maxInput.addEventListener('input', () => this.updateMax());
        this.update();
    }

    updateMin() {
        const val = parseInt(this.minInput.value);
        if (val > parseInt(this.maxInput.value) - this.step) {
            this.minInput.value = parseInt(this.maxInput.value) - this.step;
        }
        this.update();
    }

    updateMax() {
        const val = parseInt(this.maxInput.value);
        if (val < parseInt(this.minInput.value) + this.step) {
            this.maxInput.value = parseInt(this.minInput.value) + this.step;
        }
        this.update();
    }

    update() {
        const min = parseInt(this.minInput.value);
        const max = parseInt(this.maxInput.value);
        const range = this.max - this.min;
        const left = ((min - this.min) / range) * 100;
        const right = ((max - this.min) / range) * 100;
        this.fill.style.left = left + '%';
        this.fill.style.width = (right - left) + '%';
        this.values = [min, max];
        if (this.onChange) this.onChange(this.values);
    }

    getValues() { return this.values; }
}

// Export
window.Modal = Modal;
window.Tabs = Tabs;
window.Carousel = Carousel;
window.FormValidator = FormValidator;
window.CountdownTimer = CountdownTimer;
window.Lightbox = Lightbox;
window.RangeSlider = RangeSlider;

// Auto-init lightbox
document.addEventListener('DOMContentLoaded', () => new Lightbox());
