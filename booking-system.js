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
                    duration: 480
