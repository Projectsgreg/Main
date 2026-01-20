// ====== GREGORY SWARN COACHING - CORE SCRIPT ======

// Mobile menu functionality
class MobileMenu {
    constructor() {
        this.menuToggle = document.querySelector('.menu-toggle');
        this.nav = document.querySelector('.coaching-header nav');
        this.overlay = document.createElement('div');
        
        if (this.menuToggle && this.nav) {
            this.init();
        }
    }
    
    init() {
        // Create overlay
        this.overlay.className = 'menu-overlay';
        document.body.appendChild(this.overlay);
        
        // Style overlay
        this.overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 998;
            display: none;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        
        // Add toggle functionality
        this.menuToggle.addEventListener('click', () => this.toggleMenu());
        this.overlay.addEventListener('click', () => this.closeMenu());
        
        // Close menu when clicking links
        document.querySelectorAll('.coaching-header nav a').forEach(link => {
            link.addEventListener('click', () => this.closeMenu());
        });
    }
    
    toggleMenu() {
        const isActive = this.nav.classList.toggle('active');
        this.menuToggle.textContent = isActive ? '✕' : '☰';
        this.overlay.style.display = isActive ? 'block' : 'none';
        setTimeout(() => {
            this.overlay.style.opacity = isActive ? '1' : '0';
        }, 10);
        document.body.style.overflow = isActive ? 'hidden' : '';
    }
    
    closeMenu() {
        this.nav.classList.remove('active');
        this.menuToggle.textContent = '☰';
        this.overlay.style.opacity = '0';
        setTimeout(() => {
            this.overlay.style.display = 'none';
        }, 300);
        document.body.style.overflow = '';
    }
}

// Form handling base class
class FormHandler {
    constructor(formId) {
        this.form = document.getElementById(formId);
        if (!this.form) return;
        
        this.init();
    }
    
    init() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.setupValidation();
    }
    
    setupValidation() {
        // Add required field indicators
        this.form.querySelectorAll('[required]').forEach(field => {
            const label = field.closest('.form-group')?.querySelector('label');
            if (label && !label.innerHTML.includes('*')) {
                label.innerHTML += ' <span class="required">*</span>';
            }
        });
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        if (!this.validateForm()) {
            this.showError('Please fill in all required fields correctly.');
            return;
        }
        
        const submitBtn = this.form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        // Show loading state
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
        
        try {
            const formData = this.collectFormData();
            await this.submitForm(formData);
            
            this.showSuccess('Thank you! We\'ll contact you within 24 hours.');
            this.form.reset();
            
        } catch (error) {
            console.error('Form submission error:', error);
            this.showError('There was an error submitting the form. Please try again or email us directly.');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }
    
    validateForm() {
        let isValid = true;
        
        this.form.querySelectorAll('[required]').forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                this.highlightError(field);
            } else {
                this.removeErrorHighlight(field);
            }
        });
        
        // Validate email format
        const emailField = this.form.querySelector('input[type="email"]');
        if (emailField && emailField.value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(emailField.value)) {
                isValid = false;
                this.highlightError(emailField, 'Please enter a valid email address');
            }
        }
        
        return isValid;
    }
    
    collectFormData() {
        const formData = new FormData(this.form);
        
        // Add metadata
        formData.append('_subject', `${this.form.id} Submission`);
        formData.append('_format', 'plain');
        formData.append('timestamp', new Date().toISOString());
        formData.append('page_url', window.location.href);
        
        return formData;
    }
    
    async submitForm(formData) {
        // This will be overridden by FormIntegration class
        throw new Error('submitForm method not implemented');
    }
    
    highlightError(field, message = 'This field is required') {
        field.style.borderColor = '#dc3545';
        field.style.boxShadow = '0 0 0 3px rgba(220, 53, 69, 0.1)';
        
        // Remove any existing error message
        this.removeError(field);
        
        // Add error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            color: #dc3545;
            font-size: 0.875rem;
            margin-top: 0.25rem;
        `;
        
        field.parentNode.appendChild(errorDiv);
    }
    
    removeErrorHighlight(field) {
        field.style.borderColor = '';
        field.style.boxShadow = '';
        this.removeError(field);
    }
    
    removeError(field) {
        const existingError = field.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
    }
    
    showError(message) {
        alert(message); // In production, replace with nicer notification
    }
    
    showSuccess(message) {
        alert(message); // In production, replace with nicer notification
    }
}

// Smooth scrolling for anchor links
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const headerHeight = document.querySelector('.coaching-header')?.offsetHeight || 80;
                const targetPosition = target.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Animate numbers
function animateNumbers() {
    const numberElements = document.querySelectorAll('[data-animate-number]');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const target = parseInt(element.dataset.animateNumber);
                const duration = 2000; // 2 seconds
                const steps = 60;
                const increment = target / steps;
                let current = 0;
                
                const timer = setInterval(() => {
                    current += increment;
                    element.textContent = Math.floor(current).toLocaleString();
                    
                    if (current >= target) {
                        element.textContent = target.toLocaleString();
                        clearInterval(timer);
                        observer.unobserve(element);
                    }
                }, duration / steps);
            }
        });
    }, { threshold: 0.5 });
    
    numberElements.forEach(element => observer.observe(element));
}

// Update copyright year
function updateCopyrightYear() {
    const yearElements = document.querySelectorAll('[data-current-year]');
    const currentYear = new Date().getFullYear();
    yearElements.forEach(el => {
        el.textContent = currentYear;
    });
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize mobile menu
    new MobileMenu();
    
    // Initialize smooth scrolling
    initSmoothScrolling();
    
    // Animate numbers
    animateNumbers();
    
    // Update copyright year
    updateCopyrightYear();
    
    // Load external scripts
    loadExternalScripts();
});

// Load external scripts
function loadExternalScripts() {
    // Load Calendly script if booking page
    if (window.location.pathname.includes('contact.html') || 
        document.querySelector('#booking-widget')) {
        const calendlyScript = document.createElement('script');
        calendlyScript.src = 'https://assets.calendly.com/assets/external/widget.js';
        calendlyScript.async = true;
        document.head.appendChild(calendlyScript);
    }
    
    // Load YouTube API if video page
    if (window.location.pathname.includes('podcast.html') || 
        document.querySelector('#youtube-container')) {
        const youtubeScript = document.createElement('script');
        youtubeScript.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(youtubeScript);
    }
}

// Utility function to load config
async function loadConfig() {
    try {
        const response = await fetch('config.json');
        return await response.json();
    } catch (error) {
        console.error('Failed to load config:', error);
        return null;
    }
}

// Make functions available globally
window.FormHandler = FormHandler;
window.loadConfig = loadConfig;
