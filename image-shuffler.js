// ====== IMAGE SHUFFLER FOR COACHING PLATFORM ======

class ImageShuffler {
    constructor() {
        this.manifest = null;
        this.initialized = false;
        this.init();
    }
    
    async init() {
        try {
            const response = await fetch('manifest.json');
            if (!response.ok) throw new Error('Manifest not found');
            this.manifest = await response.json();
            console.log('✅ ImageShuffler loaded successfully');
            this.initialized = true;
            this.shuffleAllImages();
        } catch (error) {
            console.error('❌ ImageShuffler failed:', error);
            this.manifest = {
                greg: [],
                wellness: [],
                business: [],
                testimonials: []
            };
            this.initialized = true;
        }
    }
    
    shuffleAllImages() {
        if (!this.initialized) {
            setTimeout(() => this.shuffleAllImages(), 100);
            return;
        }
        
        // 1. Shuffle hero image (Gregory)
        this.shuffleHeroImage();
        
        // 2. Shuffle gallery images
        this.shuffleGallery();
        
        // 3. Shuffle testimonials
        this.shuffleTestimonials();
        
        // 4. Shuffle background images
        this.shuffleBackgrounds();
    }
    
    shuffleHeroImage() {
        // Look for hero images
        const heroImages = [
            document.getElementById('dynamic-hero'),
            document.querySelector('[data-shuffle="greg"]'),
            document.querySelector('.coach-image img')
        ].filter(img => img !== null);
        
        heroImages.forEach(heroImg => {
            const randomImage = this.getRandomImage('greg');
            if (randomImage) {
                heroImg.src = randomImage;
                heroImg.alt = 'Gregory Swarn - Performance Coach';
                console.log('🎯 Hero image set:', randomImage);
            }
        });
    }
    
    shuffleGallery() {
        // Shuffle gallery sections
        const galleries = document.querySelectorAll('.photo-gallery, [data-shuffle-gallery]');
        
        galleries.forEach(gallery => {
            const category = gallery.dataset.category || 'greg';
            const count = parseInt(gallery.dataset.count) || 6;
            
            if (this.manifest[category] && this.manifest[category].length > 0) {
                const shuffled = this.getRandomImages(category, count);
                gallery.innerHTML = shuffled.map(img => `
                    <div class="gallery-item">
                        <img src="${img}" 
                             alt="${category.charAt(0).toUpperCase() + category.slice(1)} coaching image" 
                             loading="lazy"
                             style="width:100%;height:180px;object-fit:cover;border-radius:8px;">
                    </div>
                `).join('');
                
                console.log(`🖼️ ${category} gallery shuffled with ${shuffled.length} images`);
            }
        });
    }
    
    shuffleTestimonials() {
        const testimonialContainers = document.querySelectorAll('.testimonial-grid, [data-shuffle="testimonials"]');
        
        testimonialContainers.forEach(container => {
            if (this.manifest.testimonials && this.manifest.testimonials.length > 0) {
                const shuffled = this.getRandomImages('testimonials', 3);
                
                if (shuffled.length > 0) {
                    container.innerHTML = shuffled.map((img, index) => `
                        <div class="testimonial-card">
                            <div class="testimonial-image">
                                <img src="${img}" alt="Client testimonial" loading="lazy">
                            </div>
                            <div class="testimonial-content">
                                <p>"Working with Gregory transformed my leadership approach and business results."</p>
                                <div class="testimonial-author">
                                    <strong>Client ${index + 1}</strong>
                                    <span>CEO, Tech Company</span>
                                </div>
                            </div>
                        </div>
                    `).join('');
                }
            }
        });
    }
    
    shuffleBackgrounds() {
        // Set random background images for sections
        document.querySelectorAll('[data-bg-shuffle]').forEach(section => {
            const category = section.dataset.bgShuffle;
            const randomImage = this.getRandomImage(category);
            
            if (randomImage) {
                section.style.backgroundImage = `url('${randomImage}')`;
                section.style.backgroundSize = 'cover';
                section.style.backgroundPosition = 'center';
                section.style.backgroundAttachment = 'fixed';
            }
        });
    }
    
    getRandomImage(category) {
        if (!this.manifest || !this.manifest[category] || this.manifest[category].length === 0) {
            return null;
        }
        
        const images = this.manifest[category];
        const randomIndex = Math.floor(Math.random() * images.length);
        return images[randomIndex];
    }
    
    getRandomImages(category, count) {
        if (!this.manifest || !this.manifest[category] || this.manifest[category].length === 0) {
            return [];
        }
        
        const images = [...this.manifest[category]];
        
        // Shuffle array
        for (let i = images.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [images[i], images[j]] = [images[j], images[i]];
        }
        
        // Return requested number of images
        return images.slice(0, Math.min(count, images.length));
    }
    
    // Preload images for better performance
    preloadImages(categories = ['greg', 'wellness', 'business']) {
        categories.forEach(category => {
            if (this.manifest[category]) {
                this.manifest[category].forEach(src => {
                    const img = new Image();
                    img.src = src;
                });
            }
        });
        console.log('📸 Images preloaded');
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.imageShuffler = new ImageShuffler();
    
    // Also preload images
    setTimeout(() => {
        if (window.imageShuffler && window.imageShuffler.initialized) {
            window.imageShuffler.preloadImages();
        }
    }, 1000);
});
