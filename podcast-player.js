// ====== PODCAST INTEGRATION SYSTEM ======

class PodcastIntegration {
    constructor() {
        this.config = null;
        this.rssFeed = null;
        this.platform = null;
        this.cacheKey = 'podcast_cache';
        this.cacheDuration = 7200000; // 2 hours
        
        this.init();
    }
    
    async init() {
        await this.loadConfig();
        this.displayEpisodes();
    }
    
    async loadConfig() {
        try {
            const response = await fetch('config.json');
            this.config = await response.json();
            
            this.platform = this.config?.integrations?.podcast?.platform || 'buzzsprout';
            this.rssFeed = this.config?.integrations?.podcast?.rssFeed || 'YOUR_RSS_FEED';
            
            if (!this.rssFeed) {
                console.warn('Podcast RSS feed not configured');
            }
        } catch (error) {
            console.error('Failed to load podcast config:', error);
        }
    }
    
    async displayEpisodes(containerId = 'podcast-container', limit = 3) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        // Check cache first
        const cached = this.getCachedEpisodes();
        if (cached) {
            this.renderEpisodes(container, cached.slice(0, limit));
            return;
        }
        
        try {
            const episodes = await this.fetchEpisodes();
            this.cacheEpisodes(episodes);
            this.renderEpisodes(container, episodes.slice(0, limit));
        } catch (error) {
            console.error('Failed to fetch podcast episodes:', error);
            this.renderFallback(container);
        }
    }
    
    async fetchEpisodes() {
        if (!this.rssFeed) {
            throw new Error('Podcast RSS feed not configured');
        }
        
        // Use rss2json.com service
        const rss2jsonUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(this.rssFeed)}`;
        
        const response = await fetch(rss2jsonUrl);
        if (!response.ok) {
            throw new Error(`RSS feed error: ${response.status}`);
        }
        
        const data = await response.json();
        
        return data.items.map(item => ({
            title: item.title,
            description: item.description,
            audioUrl: item.enclosure?.link,
            duration: this.extractDuration(item.description),
            date: item.pubDate,
            guid: item.guid,
            isPremium: this.isPremiumEpisode(item.title),
            previewUrl: item.link || '#'
        }));
    }
    
    extractDuration(description) {
        // Try to extract duration from description
        const durationMatch = description.match(/(\d+)\s*(min|minutes|minute)/i);
        if (durationMatch) {
            return `${durationMatch[1]} min`;
        }
        return 'Duration unknown';
    }
    
    isPremiumEpisode(title) {
        const premiumIndicators = [
            '[PREMIUM]',
            '[MEMBERS]',
            '[MASTERY]',
            '[ELITE]',
            '(Premium)',
            '(Members Only)'
        ];
        
        return premiumIndicators.some(indicator => 
            title.toLowerCase().includes(indicator.toLowerCase())
        );
    }
    
    renderEpisodes(container, episodes) {
        if (episodes.length === 0) {
            this.renderFallback(container);
            return;
        }
        
        let html = '<div class="episodes-grid">';
        
        episodes.forEach(episode => {
            if (episode.isPremium) {
                html += this.renderPremiumEpisode(episode);
            } else {
                html += this.renderFreeEpisode(episode);
            }
        });
        
        html += '</div>';
        container.innerHTML = html;
        
        // Check membership access for premium episodes
        if (typeof membershipGate !== 'undefined') {
            membershipGate.protectPodcasts();
        }
    }
    
    renderFreeEpisode(episode) {
        const cleanTitle = episode.title.replace(/\[FREE\]|\(Free\)/gi, '').trim();
        
        return `
            <div class="episode-card free">
                <div class="episode-header">
                    <h4>${cleanTitle}</h4>
                    <span class="episode-badge free">Free Episode</span>
                </div>
                <p>${this.truncateText(episode.description, 150)}</p>
                
                <div class="audio-player">
                    <audio controls>
                        <source src="${episode.audioUrl}" type="audio/mpeg">
                        Your browser does not support the audio element.
                    </audio>
                </div>
                
                <div class="episode-meta">
                    <span class="episode-date">${this.formatDate(episode.date)}</span>
                    <span class="episode-duration">${episode.duration}</span>
                </div>
                
                <div class="episode-actions">
                    <a href="${episode.previewUrl}" target="_blank" class="btn-link">
                        Listen on ${this.platform.charAt(0).toUpperCase() + this.platform.slice(1)} →
                    </a>
                </div>
            </div>
        `;
    }
    
    renderPremiumEpisode(episode) {
        const cleanTitle = episode.title.replace(/\[PREMIUM\]|\[MEMBERS\]|\(Premium\)/gi, '').trim();
        
        return `
            <div class="episode-card premium" 
                 data-access-tier="podcast_full"
                 data-title="${cleanTitle}"
                 data-teaser="${this.truncateText(episode.description, 200)}"
                 data-preview-url="${episode.audioUrl}">
                <div class="episode-header">
                    <h4>${cleanTitle}</h4>
                    <span class="episode-badge premium">🔒 Members Only</span>
                </div>
                <p>${this.truncateText(episode.description, 150)}</p>
                
                <div class="premium-lock">
                    <div class="lock-icon">🔒</div>
                    <h5>Premium Podcast Episode</h5>
                    <p>This full episode is available to Foundation members and above.</p>
                    
                    <div class="preview-teaser">
                        <p><strong>Preview:</strong> 5-minute sample of this episode</p>
                        <div class="teaser-audio">
                            <div class="audio-wave"></div>
                            <div class="audio-wave"></div>
                            <div class="audio-wave"></div>
                            <div class="audio-wave"></div>
                            <div class="audio-wave"></div>
                        </div>
                        <p class="teaser-note">Full episode includes in-depth analysis, Q&A, and downloadable resources</p>
                    </div>
                    
                    <div class="upgrade-options">
                        <a href="/membership.html#foundation" class="btn btn-primary">
                            Join Foundation - $97/month
                        </a>
                        <a href="/membership.html#compare" class="btn btn-secondary">
                            Compare All Tiers
                        </a>
                    </div>
                </div>
                
                <div class="episode-meta">
                    <span class="episode-date">${this.formatDate(episode.date)}</span>
                    <span class="episode-duration">${episode.duration}</span>
                </div>
            </div>
        `;
    }
    
    renderFallback(container) {
        container.innerHTML = `
            <div class="podcast-fallback">
                <h3>Performance Principles Podcast</h3>
                <p>Weekly conversations on integrated performance, leadership, and business growth.</p>
                
                <div class="buzzsprout-player">
                    <iframe src="https://www.buzzsprout.com/123456?client_source=small_player&iframe=true" 
                            width="100%" height="200" frameborder="0" scrolling="no"></iframe>
                </div>
                
                <div class="podcast-platforms">
                    <p>Also available on:</p>
                    <div class="platform-icons">
                        <a href="https://open.spotify.com/show/example" target="_blank">🎧 Spotify</a>
                        <a href="https://podcasts.apple.com/us/podcast/example" target="_blank">🎙️ Apple Podcasts</a>
                        <a href="https://podcasts.google.com/feed/example" target="_blank">📻 Google Podcasts</a>
                    </div>
                </div>
                
                <div class="subscribe-cta">
                    <a href="https://podcast.platform.com/gregoryswarn" target="_blank" class="btn btn-primary">
                        Subscribe on ${this.platform.charAt(0).toUpperCase() + this.platform.slice(1)} →
                    </a>
                </div>
            </div>
        `;
    }
    
    cacheEpisodes(episodes) {
        const cacheData = {
            timestamp: Date.now(),
            episodes: episodes
        };
        localStorage.setItem(this.cacheKey, JSON.stringify(cacheData));
    }
    
    getCachedEpisodes() {
        const cached = localStorage.getItem(this.cacheKey);
        if (!cached) return null;
        
        try {
            const data = JSON.parse(cached);
            if (Date.now() - data.timestamp < this.cacheDuration) {
                return data.episodes;
            }
        } catch (error) {
            console.error('Failed to parse cached episodes:', error);
        }
        
        return null;
    }
    
    truncateText(text, maxLength) {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }
    
    formatDate(dateString) {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (error) {
            return 'Recent';
        }
    }
    
    // Platform-specific embed codes
    getPlatformEmbed(episodeId) {
        switch(this.platform) {
            case 'buzzsprout':
                return `
                    <iframe src="https://www.buzzsprout.com/${episodeId}?client_source=small_player&iframe=true" 
                            width="100%" height="200" frameborder="0" scrolling="no"></iframe>
                `;
            case 'transistor':
                return `
                    <iframe src="https://share.transistor.fm/e/${episodeId}" 
                            width="100%" height="180" frameborder="0" scrolling="no"></iframe>
                `;
            case 'anchor':
                return `
                    <iframe src="https://anchor.fm/gregoryswarn/embed/episodes/${episodeId}" 
                            width="100%" height="180" frameborder="0" scrolling="no"></iframe>
                `;
            default:
                return '';
        }
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('podcast-container')) {
        window.podcastIntegration = new PodcastIntegration();
    }
});
