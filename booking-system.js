// ====== COACHING BOOKING SYSTEM ======

class BookingSystem {
    constructor() {
        this.services = null;
        this.calendlyUsername = 'gregoryswarn'; // Replace with your Calendly username
        this.initialized = false;
        this.selectedService = null;
        
        this.init();
    }
    
    async init() {
        // Load services from config
        const config = await loadConfig();
        if (config?.coaching?.services) {
            this.services = config.coaching.services;
        } else {
            // Fallback services
            this.services = {
                discovery: {
                    name: 'Discovery Call',
                    price: 0,
                    duration: 30,
                    description: '30-minute introductory conversation to explore fit'
                },
                strategy: {
                    name: 'Strategy Session',
                    price: 2500,
                    duration: 90,
                    description: 'Deep dive strategy and action plan development'
                },
                halfDay: {
                    name: 'Half-Day Intensive',
                    price: 7500,
                    duration: 240,
                    description: '4-hour transformational deep work session'
                },
                fullDay: {
                    name: 'Full-Day Mastermind',
                    price: 15000,
                    duration: 480,
                    description: '8-hour complete business and life transformation'
                }
            };
        }
        
        this.initialized = true;
        this.renderBookingWidget();
    }
    
    renderBookingWidget() {
        const container = document.getElementById('booking-widget');
        if (!container || !this.initialized) return;
        
        const html = `
            <div class="booking-widget">
                <h3>Select Your Coaching Session</h3>
                <p class="section-intro">Choose the session that best fits your current needs and goals</p>
                
                <div class="service-selector">
                    ${Object.entries(this.services).map(([key, service]) => `
                        <div class="service-card" data-service="${key}">
                            <h4>${service.name}</h4>
                            <p class="duration">${service.duration} minutes</p>
                            <p class="price">${service.price === 0 ? 'FREE' : '$${service.price.toLocaleString()}'}</p>
                            <p class="description">${service.description}</p>
                            <button class="btn-select" onclick="window.bookingSystem.selectService('${key}')">
                                Select Session
                            </button>
                        </div>
                    `).join('')}
                </div>
                
                <div id="calendly-container" class="calendly-container" style="display: none;">
                    <div class="calendly-header">
                        <h4>Book Your <span id="selected-service-name"></span></h4>
                        <button class="btn-back" onclick="window.bookingSystem.showServiceSelector()">
                            ← Choose Different Session
                        </button>
                    </div>
                    <div id="calendly-widget"></div>
                </div>
                
                <div class="booking-notes">
                    <p><strong>Note:</strong> All sessions are conducted via Zoom. You'll receive calendar invites and preparation materials upon booking.</p>
                    <p>For group sessions or corporate packages, please <a href="mailto:booking@gregoryswarnenterprises.com">email us directly</a>.</p>
                </div>
            </div>
        `;
        
        container.innerHTML = html;
    }
    
    selectService(serviceKey) {
        if (!this.initialized) return;
        
        this.selectedService = serviceKey;
        const service = this.services[serviceKey];
        
        // Show Calendly container
        document.getElementById('calendly-container').style.display = 'block';
        document.querySelector('.service-selector').style.display = 'none';
        
        // Update service name
        document.getElementById('selected-service-name').textContent = service.name;
        
        // Load Calendly widget
        this.loadCalendlyWidget(serviceKey);
    }
    
    showServiceSelector() {
        document.getElementById('calendly-container').style.display = 'none';
        document.querySelector('.service-selector').style.display = 'grid';
        this.selectedService = null;
    }
    
    loadCalendlyWidget(serviceKey) {
        // Wait for Calendly script to load
        if (typeof Calendly === 'undefined') {
            setTimeout(() => this.loadCalendlyWidget(serviceKey), 100);
            return;
        }
        
        // Initialize Calendly widget
        Calendly.initInlineWidget({
            url: `https://calendly.com/${this.calendlyUsername}/${serviceKey}`,
            parentElement: document.getElementById('calendly-widget'),
            prefill: {},
            utm: {}
        });
    }
    
    // Alternative: Custom booking form (if not using Calendly)
    renderCustomBookingForm(serviceKey) {
        const service = this.services[serviceKey];
        
        return `
            <form id="booking-form" class="contact-form">
                <div class="form-group">
                    <label for="booking-name">Full Name *</label>
                    <input type="text" id="booking-name" name="name" required>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="booking-email">Email Address *</label>
                        <input type="email" id="booking-email" name="email" required>
                    </div>
                    <div class="form-group">
                        <label for="booking-phone">Phone Number</label>
                        <input type="tel" id="booking-phone" name="phone">
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="booking-company">Company/Organization</label>
                    <input type="text" id="booking-company" name="company">
                </div>
                
                <div class="form-group">
                    <label for="booking-title">Job Title/Role</label>
                    <input type="text" id="booking-title" name="title">
                </div>
                
                <div class="form-group">
                    <label for="booking-goals">What are your primary goals for this session? *</label>
                    <textarea id="booking-goals" name="goals" rows="3" required></textarea>
                </div>
                
                <div class="form-group">
                    <label for="booking-challenges">What are your biggest challenges right now?</label>
                    <textarea id="booking-challenges" name="challenges" rows="2"></textarea>
                </div>
                
                <div class="form-group">
                    <label for="booking-preferred-dates">Preferred Dates/Times</label>
                    <input type="text" id="booking-preferred-dates" name="preferred_dates" 
                           placeholder="e.g., Weekdays after 2pm, or specific dates">
                </div>
                
                <div class="form-group">
                    <label for="booking-timezone">Your Timezone</label>
                    <select id="booking-timezone" name="timezone">
                        <option value="">Select Timezone</option>
                        <option value="est">Eastern Time (ET)</option>
                        <option value="cst">Central Time (CT)</option>
                        <option value="mst">Mountain Time (MT)</option>
                        <option value="pst">Pacific Time (PT)</option>
                        <option value="other">Other/International</option>
                    </select>
                </div>
                
                <input type="hidden" name="service" value="${service.name}">
                <input type="hidden" name="price" value="${service.price}">
                <input type="hidden" name="duration" value="${service.duration}">
                
                <div class="booking-summary">
                    <h5>Session Summary</h5>
                    <p><strong>Service:</strong> ${service.name}</p>
                    <p><strong>Duration:</strong> ${service.duration} minutes</p>
                    <p><strong>Investment:</strong> ${service.price === 0 ? 'Complimentary' : '$${service.price.toLocaleString()}'}</p>
                </div>
                
                <button type="submit" class="btn btn-primary btn-large">
                    Request Booking →
                </button>
                
                <p class="form-note">
                    We'll contact you within 24 hours to confirm your session details and schedule.
                </p>
            </form>
        `;
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('booking-widget')) {
        window.bookingSystem = new BookingSystem();
    }
});
