// ====== COMPLETE FORM INTEGRATION SYSTEM ======

class FormIntegration extends FormHandler {
    constructor(formId) {
        super(formId);
        this.config = null;
        this.formType = this.detectFormType(formId);
        this.loadConfig();
    }
    
    detectFormType(formId) {
        if (formId.includes('contact')) return 'contact';
        if (formId.includes('consultation') || formId.includes('booking')) return 'consultation';
        if (formId.includes('membership')) return 'membership';
        if (formId.includes('waitlist')) return 'waitlist';
        return 'contact';
    }
    
    async loadConfig() {
        const config = await fetch('config.json').then(r => r.json());
        this.config = config;
    }
    
    async submitForm(formData) {
        if (!this.config) {
            await this.loadConfig();
        }
        
        // Get the correct endpoint for this form type
        const endpoints = this.config?.integrations?.formspree;
        let endpoint;
        
        switch(this.formType) {
            case 'consultation':
                endpoint = endpoints?.consultation || 'YOUR_CONSULTATION_FORM_ENDPOINT';
                break;
            case 'membership':
                endpoint = endpoints?.membership || 'YOUR_MEMBERSHIP_FORM_ENDPOINT';
                break;
            case 'waitlist':
                endpoint = endpoints?.waitlist || 'YOUR_WAITLIST_FORM_ENDPOINT';
                break;
            default:
                endpoint = endpoints?.contact || 'YOUR_CONTACT_FORM_ENDPOINT';
        }
        
        // Add form type to data
        formData.append('form_type', this.formType);
        
        // Submit to Formspree
        const response = await fetch(endpoint, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Form submission failed: ${response.status}`);
        }
        
        return response.json();
    }
    
    collectFormData() {
        const formData = super.collectFormData();
        
        // Add additional data based on form type
        switch(this.formType) {
            case 'consultation':
                this.addConsultationData(formData);
                break;
            case 'membership':
                this.addMembershipData(formData);
                break;
        }
        
        return formData;
    }
    
    addConsultationData(formData) {
        // Add UTM parameters
        const urlParams = new URLSearchParams(window.location.search);
        urlParams.forEach((value, key) => {
            if (key.startsWith('utm_')) {
                formData.append(key, value);
            }
        });
        
        // Add page information
        formData.append('page_title', document.title);
        formData.append('referrer', document.referrer);
        
        // Add coaching-specific questions
        const coachingGoals = this.form.querySelector('[name="coaching_goals"]');
        if (coachingGoals) {
            formData.append('coaching_goals', coachingGoals.value);
        }
        
        const challenges = this.form.querySelector('[name="challenges"]');
        if (challenges) {
            formData.append('challenges', challenges.value);
        }
        
        const investment = this.form.querySelector('[name="investment_willingness"]');
        if (investment) {
            formData.append('investment_willingness', investment.value);
        }
    }
    
    addMembershipData(formData) {
        // Add selected tier
        const tierSelect = this.form.querySelector('[name="tier"]');
        if (tierSelect) {
            formData.append('selected_tier', tierSelect.value);
            
            // Get tier price from config
            const tierConfig = this.config?.coaching?.membership?.[tierSelect.value];
            if (tierConfig) {
                formData.append('tier_price', tierConfig.price);
                formData.append('tier_name', tierConfig.name);
            }
        }
        
        // Add business information
        const businessRevenue = this.form.querySelector('[name="business_revenue"]');
        if (businessRevenue) {
            formData.append('business_revenue', businessRevenue.value);
        }
        
        const teamSize = this.form.querySelector('[name="team_size"]');
        if (teamSize) {
            formData.append('team_size', teamSize.value);
        }
        
        // Add experience level
        const experience = this.form.querySelector('[name="coaching_experience"]');
        if (experience) {
            formData.append('coaching_experience', experience.value);
        }
    }
}

// Initialize all forms on the page
class FormManager {
    constructor() {
        this.forms = [];
        this.initializeForms();
    }
    
    initializeForms() {
        // Find all forms with specific IDs
        const formIds = [
            'contactForm',
            'consultationForm', 
            'bookingForm',
            'membershipForm',
            'waitlistForm'
        ];
        
        formIds.forEach(formId => {
            const form = document.getElementById(formId);
            if (form) {
                this.forms.push(new FormIntegration(formId));
            }
        });
        
        // Also initialize any form with data-form-type attribute
        document.querySelectorAll('form[data-form-type]').forEach(form => {
            const formIntegration = new FormIntegration(form.id);
            this.forms.push(formIntegration);
        });
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    window.formManager = new FormManager();
});
