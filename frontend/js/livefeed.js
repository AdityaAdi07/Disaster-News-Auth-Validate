document.addEventListener('DOMContentLoaded', function() {
    const loadLiveFeedBtn = document.getElementById('loadLiveFeed');
    const liveFeedContainer = document.getElementById('liveFeed');

    loadLiveFeedBtn.addEventListener('click', async function() {
        try {
            // Show loading state
            liveFeedContainer.classList.add('loading');
            loadLiveFeedBtn.disabled = true;

            // Fetch live feed data
            const response = await fetch('/api/live-feed', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch live feed');
            }

            const data = await response.json();
            
            console.log('Live feed data received:', data);

            if (!data.success) {
                throw new Error(data.error || 'Failed to load feed');
            }

            // Clear existing feed
            liveFeedContainer.innerHTML = '';

            // Render feed items
            data.data.forEach(item => {
                const feedItem = createFeedItem(item);
                liveFeedContainer.appendChild(feedItem);
            });

        } catch (error) {
            console.error('Error loading live feed:', error);
            liveFeedContainer.innerHTML = `
                <div class="alert alert-danger" role="alert">
                    Failed to load live feed: ${error.message}
                </div>
            `;
        } finally {
            // Remove loading state
            liveFeedContainer.classList.remove('loading');
            loadLiveFeedBtn.disabled = false;
        }
    });

    // Automatically load the live feed when the page loads
    loadLiveFeedBtn.click();

    function createFeedItem(item) {
        const div = document.createElement('div');
        div.className = 'feed-item';
        
        // Format date
        const publishedDate = new Date(item.published);
        const formattedDate = publishedDate.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        div.innerHTML = `
            <div class="title">
                <a href="${item.link}" target="_blank" rel="noopener noreferrer">
                    ${item.title}
                </a>
            </div>
            <div class="meta">
                <span class="source">${item.source}</span> • 
                <span class="date">${formattedDate}</span>
            </div>
            <div class="location mt-2">
                <i class="fas fa-map-marker-alt"></i> ${item.location}
            </div>
        `;

        return div;
    }
}); 