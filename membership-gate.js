// ====== MEMBERSHIP CONTENT PROTECTION SYSTEM ======

class MembershipGate {
    constructor() {
        this.tiers = {
            free: {
                access: ['free_content', 'blog_posts', 'podcast_previews'],
                name: 'Free Member'
            },
            foundation: {
                access: ['all_free', 'weekly_videos', 'community_access', 'monthly_qna'],
                name: 'Foundation Member'
            },
            mastery: {
                access: ['all_foundation', 'biweekly_calls', 'custom_templates', 'strategy_reviews'],
                name: 'Mastery Member'
            },
            elite: {
                access: ['all_mastery', 'weekly_calls', 'priority_support', 'in_person_days'],
                name: 'Elite Member'
            }
        };
        
        this.currentTier = this.getUserTier();
        this.protectedSelectors = [
            '.premium-content',
            '[data-access-tier]',
            '.members-only',
            '.video-card.premium',
            '.episode-card.premium'
        ];
    }
    
    getUserTier() {
        // In production, this would check:
        // 1. User session/cookie
        // 2. Database query
        // 3. Payment status
        
        // For now, default to free
        return localStorage.getItem('membership_tier') || 'free';
    }
    
    setUserTier(tier) {
        if (this.tiers[tier]) {
            localStorage.setItem('membership_tier', tier);
            this.currentTier = tier;
            this.protectContent(); // Re-protect with new tier
            return true;
        }
        return false;
    }
    
    checkAccess(contentTier) {
        const userTier = this.currentTier;
        const userAccess = this.tiers[userTier]?.access || [];
        
        // Free tier can only access free content
        if (contentTier === 'free') return true;
        
        // Check if user's tier has access to this content tier
        return userAccess.includes(contentTier) || 
               (contentTier === 'free_content' && userTier !== 'free');
    }
    
    protectContent() {
        // Protect premium videos
        this.protectVideos();
        
        // Protect premium podcasts
        this.protectPodcasts();
        
        // Protect premium articles
        this.protectArticles();
        
        // Protect downloads and resources
        this.protectResources();
    }
    
    protectVideos() {
        document.querySelectorAll('.video-card.premium, [data-access-tier="premium"]').forEach(video => {
            if (!this.checkAccess('weekly_videos')) {
                video.innerHTML = `
                    <div class="premium-lock">
                        <div class="lock-icon">🔒</div>
                        <h3>Premium Coaching Content</h3>
                        <p>This video is available to Foundation members and above. Upgrade to access our full library of coaching videos, case studies, and strategy sessions.</p>
                        <div class="upgrade-options">
                            <a href="/membership.html#foundation" class="btn btn-primary">
                                Join Foundation - $97/month
                            </a>
                            <a href="/membership.html#compare" class="btn btn-secondary">
                                Compare All Tiers →
                            </a>
                        </div>
                        <p class="teaser-text">
                            <strong>Preview:</strong> In this session, we cover advanced revenue scaling strategies for 7-figure businesses...
                        </p>
                    </div>
                `;
            }
        });
    }
    
    protectPodcasts() {
        document.querySelectorAll('.episode-card.premium, [data-access-tier="podcast_full"]').forEach(episode => {
            if (!this.checkAccess('weekly_videos')) {
                const title = episode.dataset.title || 'Premium Episode';
                const teaser = episode.dataset.teaser || 'Full episode available to members';
                
                episode.innerHTML = `
                    <div class="premium-teaser">
                        <div class="teaser-header">
                            <h4>${title}</h4>
                            <span class="episode-badge premium">🔒 Members Only</span>
                        </div>
                        <p>${teaser}</p>
                        
                        <div class="audio-teaser">
                            <div class="teaser-audio">
                                <div class="audio-wave"></div>
                                <div class="audio-wave"></div>
                                <div class="audio-wave"></div>
                                <div class="audio-wave"></div>
                                <div class="audio-wave"></div>
                            </div>
                            <div class="teaser-info">
                                <p><strong>Preview:</strong> 5-minute sample of this episode</p>
                                <audio controls>
                                    <source src="${episode.dataset.previewUrl || '#'}" type="audio/mpeg">
                                </audio>
                            </div>
                        </div>
                        
                        <div class="upgrade-cta">
                            <p><strong>Want the full episode?</strong></p>
                            <a href="/membership.html" class="btn btn-primary">
                                Upgrade Your Membership →
                            </a>
                            <p class="cta-note">Includes full podcast library, transcripts, and bonus materials</p>
                        </div>
                    </div>
                `;
            }
        });
    }
    
    protectArticles() {
        document.querySelectorAll('.article.premium, [data-access-tier="article_full"]').forEach(article => {
            if (!this.checkAccess('weekly_videos')) {
                article.innerHTML = `
                    <div class="article-teaser">
                        <h3>Premium Article Preview</h3>
                        <div class="teaser-content">
                            ${article.dataset.teaser || 'This premium article discusses advanced strategies for...'}
                        </div>
                        <div class="teaser-lock">
                            <p>The full article is <strong>${article.dataset.readTime || '8'}-minute read</strong> with:</p>
                            <ul>
                                <li>Detailed case studies</li>
                                <li>Actionable frameworks</li>
                                <li>Downloadable templates</li>
                                <li>Implementation guides</li>
                            </ul>
                            <a href="/membership.html" class="btn btn-primary">
                                Read Full Article →
                            </a>
                        </div>
                    </div>
                `;
            }
        });
    }
    
    protectResources() {
        document.querySelectorAll('.resource-download, [data-access-tier="download"]').forEach(resource => {
            if (!this.checkAccess('custom_templates')) {
                resource.innerHTML = `
                    <div class="resource-teaser">
                        <div class="resource-icon">📋</div>
                        <h4>${resource.dataset.title || 'Premium Resource'}</h4>
                        <p>${resource.dataset.description || 'Downloadable template or resource'}</p>
                        <div class="resource-preview">
                            <p><strong>Preview:</strong> ${resource.dataset.preview || 'First 3 sections available'}</p>
                        </div>
                        <div class="resource-cta">
                            <p>Full resource available to Mastery and Elite members</p>
                            <a href="/membership.html#mastery" class="btn btn-primary">
                                Upgrade to Mastery - $497/month
                            </a>
                        </div>
                    </div>
                `;
            }
        });
    }
    
    // Show upgrade modal
    showUpgradeModal(requiredTier = 'foundation') {
        const tier = this.tiers[requiredTier];
        if (!tier) return;
        
        const modal = document.createElement('div');
        modal.className = 'upgrade-modal';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <button class="modal-close">×</button>
                <h2>Upgrade Required</h2>
                <p>This content requires <strong>${tier.name}</strong> access.</p>
                
                <div class="tier-benefits">
                    <h4>With ${tier.name}, you get:</h4>
                    <ul>
                        <li>Full access to coaching video library</li>
                        <li>Complete podcast episodes</li>
                        <li>${requiredTier === 'mastery' ? 'Bi-weekly group coaching' : 'Weekly video content'}</li>
                        <li>Resource library access</li>
                        <li>Community membership</li>
                    </ul>
                </div>
                
                <div class="modal-actions">
                    <a href="/membership.html#${requiredTier}" class="btn btn-primary">
                        Upgrade to ${tier.name} →
                    </a>
                    <a href="/membership.html#compare" class="btn btn-secondary">
                        Compare All Tiers
                    </a>
                    <button class="btn-text close-modal">
                        Maybe Later
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listeners
        modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
        modal.querySelector('.close-modal').addEventListener('click', () => modal.remove());
        modal.querySelector('.modal-overlay').addEventListener('click', () => modal.remove());
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .upgrade-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 9999;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .modal-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.7);
                backdrop-filter: blur(5px);
            }
            
            .modal-content {
                position: relative;
                background: white;
                padding: 2rem;
                border-radius: 12px;
                max-width: 500px;
                width: 90%;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            }
            
            .modal-close {
                position: absolute;
                top: 1rem;
                right: 1rem;
                background: none;
                border: none;
                font-size: 1.5rem;
                cursor: pointer;
                color: #666;
            }
            
            .tier-benefits {
                background: #f8f9fa;
                padding: 1rem;
                border-radius: 8px;
                margin: 1.5rem 0;
            }
            
            .tier-benefits ul {
                list-style: none;
                padding: 0;
            }
            
            .tier-benefits li {
                padding: 0.5rem 0;
                border-bottom: 1px solid #eee;
            }
            
            .modal-actions {
                display: flex;
                flex-direction: column;
                gap: 0.75rem;
            }
            
            .btn-text {
                background: none;
                border: none;
                color: #666;
                cursor: pointer;
                padding: 0.5rem;
            }
        `;
        
        document.head.appendChild(style);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    window.membershipGate = new MembershipGate();
    window.membershipGate.protectContent();
});
