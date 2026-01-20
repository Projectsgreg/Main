// ====== YOUTUBE CONTENT INTEGRATION ======

class YouTubeIntegration {
    constructor() {
        this.apiKey = null;
        this.channelId = null;
        this.cacheDuration = 3600000; // 1 hour
        this.cacheKey = 'youtube_cache';
        this.config = null;
        
        this.init();
    }
    
    async init() {
        // Load configuration
        await this.loadConfig();
        
        // Display videos if container exists
        this.displayVideos();
    }
    
    async loadConfig() {
        try {
            const response = await fetch('config.json');
            this.config = await response.json();
            
            this.apiKey = this.config?.integrations?.youtube?.apiKey || 'YOUR_YOUTUBE_API_KEY';
            this.channelId = this.config?.integrations?.youtube?.channelId || 'YOUR_YOUTUBE_CHANNEL_ID';
            
            if (!this.apiKey || !this.channelId) {
                console.warn('YouTube API key or channel ID not configured');
            }
        } catch (error) {
            console.error('Failed to load YouTube config:', error);
        }
    }
    
    async displayVideos(containerId = 'youtube-container') {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        // Check cache first
        const cached = this.getCachedVideos();
        if (cached) {
            this.renderVideos(container, cached);
            return;
        }
        
        try {
            const videos = await this.fetchVideos();
            this.cacheVideos(videos);
            this.renderVideos(container, videos);
        } catch (error) {
            console.error('Failed to fetch YouTube videos:', error);
            this.renderFallback(container);
        }
    }
    
    async fetchVideos(maxResults = 6) {
        if (!this.apiKey || !this.channelId) {
            throw new Error('YouTube API not configured');
        }
        
        const url = `https://www.googleapis.com/youtube/v3/search?key=${this.apiKey}&channelId=${this.channelId}&part=snippet,id&order=date&maxResults=${maxResults}&type=video`;
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`YouTube API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        return data.items.map(item => ({
            id: item.id.videoId,
            title: item.snippet.title,
            description: item.snippet.description,
            thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default.url,
            publishedAt: item.snippet.publishedAt,
            isPremium: this.isPremiumContent(item.snippet.title),
            previewUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`
        }));
    }
    
    isPremiumContent(title) {
        // Check if title contains premium indicators
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
    
    renderVideos(container, videos) {
        if (videos.length === 0) {
            this.renderFallback(container);
            return;
        }
        
        let html = '<div class="video-grid">';
        
        videos.forEach(video => {
            if (video.isPremium) {
                html += this.renderPremiumVideo(video);
            } else {
                html += this.renderFreeVideo(video);
            }
        });
        
        html += '</div>';
        container.innerHTML = html;
        
        // Check membership access for premium videos
        if (typeof membershipGate !== 'undefined') {
            membershipGate.protectVideos();
        }
    }
    
    renderFreeVideo(video) {
        return `
            <div class="video-card free">
                <div class="video-thumbnail">
                    <a href="${video.previewUrl}" target="_blank" rel="noopener">
                        <img src="${video.thumbnail}" alt="${video.title}" loading="lazy">
                        <div class="play-button"></div>
                    </a>
                </div>
                <div class="video-content">
                    <h4><a href="${video.previewUrl}" target="_blank" rel="noopener">${video.title}</a></h4>
                    <p>${this.truncateText(video.description, 100)}</p>
                    <div class="video-meta">
                        <span class="video-date">${this.formatDate(video.publishedAt)}</span>
                        <span class="video-badge free">Free</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderPremiumVideo(video) {
        const cleanTitle = video.title.replace(/\[PREMIUM\]|\[MEMBERS\]|\(Premium\)/gi, '').trim();
        
        return `
            <div class="video-card premium" data-access-tier="premium">
                <div class="video-thumbnail locked">
                    <img src="${video.thumbnail}" alt="${cleanTitle}" loading="lazy">
                    <div class="lock-overlay">
                        <div class="lock-icon">🔒</div>
                        <div class="lock-text">Premium Content</div>
                    </div>
                </div>
                <div class="video-content">
                    <h4>${cleanTitle}</h4>
                    <p>${this.truncateText(video.description, 100)}</p>
                    <div class="video-meta">
                        <span class="video-date">${this.formatDate(video.publishedAt)}</span>
                        <span class="video-badge premium">Members Only</span>
                    </div>
                    <div class="video-teaser">
                        <p><strong>Preview:</strong> This premium coaching video covers advanced strategies...</p>
                        <a href="/membership.html" class="btn btn-secondary btn-small">
                            Unlock Full Video →
                        </a>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderFallback(container) {
        container.innerHTML = `
            <div class="video-fallback">
                <h3>Coaching Video Library</h3>
                <p>Subscribe to our YouTube channel for transformative coaching content, strategy sessions, and performance insights.</p>
                <div class="fallback-videos">
                    <div class="fallback-video">
                        <div class="fallback-thumbnail"></div>
                        <div class="fallback-content">
                            <h4>Performance Principles</h4>
                            <p>Weekly coaching videos on integrated performance</p>
                        </div>
                    </div>
                    <div class="fallback-video">
                        <div class="fallback-thumbnail"></div>
                        <div class="fallback-content">
                            <h4>Strategy Sessions</h4>
                            <p>Deep dives into business and personal growth</p>
                        </div>
                    </div>
                </div>
                <a href="https://youtube.com/@gregoryswarn" target="_blank" class="btn btn-primary">
                    Visit YouTube Channel →
                </a>
            </div>
        `;
    }
    
    cacheVideos(videos) {
        const cacheData = {
            timestamp: Date.now(),
            videos: videos
        };
        localStorage.setItem(this.cacheKey, JSON.stringify(cacheData));
    }
    
    getCachedVideos() {
        const cached = localStorage.getItem(this.cacheKey);
        if (!cached) return null;
        
        try {
            const data = JSON.parse(cached);
            if (Date.now() - data.timestamp < this.cacheDuration) {
                return data.videos;
            }
        } catch (error) {
            console.error('Failed to parse cached videos:', error);
        }
        
        return null;
    }
    
    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }
    
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('youtube-container')) {
        window.youtubeIntegration = new YouTubeIntegration();
    }
});
