/**
 * Live Feed Component
 * Displays social media posts related to disasters
 */

// DOM Elements
const socialPostsContainer = document.getElementById('social-posts-container');
const disasterTypeFilter = document.getElementById('disaster-type-filter');

// Component state
let currentPosts = [];
let currentFilter = 'all';

/**
 * Initialize the Live Feed component
 */
function initLiveFeed() {
    console.log('Initializing Live Feed component...');
    
    // Set up filter change event
    disasterTypeFilter.addEventListener('change', handleFilterChange);
}

/**
 * Handle filter change event
 * @param {Event} event - The change event
 */
function handleFilterChange(event) {
    const newFilter = event.target.value;
    
    // Update filter state
    currentFilter = newFilter;
    
    // Apply filter
    if (newFilter === 'all') {
        // Show all posts
        renderSocialPosts(currentPosts);
    } else {
        // Filter posts by disaster type
        const filteredPosts = currentPosts.filter(post => 
            post.disaster_type.toLowerCase() === newFilter.toLowerCase()
        );
        renderSocialPosts(filteredPosts);
    }
}

/**
 * Update the Live Feed with new data
 * @param {Array} posts - The social media posts
 */
function updateLiveFeed(posts) {
    // Update current posts
    currentPosts = posts;
    
    // Apply current filter
    if (currentFilter === 'all') {
        renderSocialPosts(posts);
    } else {
        const filteredPosts = posts.filter(post => 
            post.disaster_type.toLowerCase() === currentFilter.toLowerCase()
        );
        renderSocialPosts(filteredPosts);
    }
}

/**
 * Render social media posts
 * @param {Array} posts - The posts to render
 */
function renderSocialPosts(posts) {
    // Clear container
    clearElement(socialPostsContainer);
    
    // Check if posts exist
    if (!posts || posts.length === 0) {
        const emptyMessage = createElement('div', {
            className: 'empty-message'
        }, 'No social media posts found.');
        
        socialPostsContainer.appendChild(emptyMessage);
        return;
    }
    
    // Sort posts by timestamp (newest first)
    const sortedPosts = [...posts].sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
    );
    
    // Create post elements
    sortedPosts.forEach(post => {
        const postElement = createPostElement(post);
        socialPostsContainer.appendChild(postElement);
        
        // Add fade-in animation
        setTimeout(() => {
            postElement.classList.add('visible');
        }, 10);
    });
}

/**
 * Create a social post element
 * @param {Object} post - The post data
 * @returns {HTMLElement} The post element
 */
function createPostElement(post) {
    // Create post container
    const postElement = createElement('div', {
        className: 'social-post',
        'data-id': post._id
    });
    
    // Create post header
    const postHeader = createElement('div', {
        className: 'social-post-header'
    });
    
    // Create source element
    const sourceElement = createElement('div', {
        className: 'social-post-source'
    }, post.source);
    
    // Create timestamp element
    const timestampElement = createElement('div', {
        className: 'social-post-timestamp'
    }, formatDate(post.timestamp));
    
    // Add source and timestamp to header
    postHeader.appendChild(sourceElement);
    postHeader.appendChild(timestampElement);
    
    // Create post content
    const contentElement = createElement('div', {
        className: 'social-post-content'
    }, post.content);
    
    // Create post footer
    const postFooter = createElement('div', {
        className: 'social-post-footer'
    });
    
    // Create location element
    const locationElement = createElement('div', {
        className: 'social-post-location'
    });
    
    // Add location icon
    const locationIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    locationIcon.setAttribute('width', '16');
    locationIcon.setAttribute('height', '16');
    locationIcon.setAttribute('viewBox', '0 0 24 24');
    locationIcon.setAttribute('fill', 'none');
    locationIcon.setAttribute('stroke', 'currentColor');
    locationIcon.setAttribute('stroke-width', '2');
    locationIcon.setAttribute('stroke-linecap', 'round');
    locationIcon.setAttribute('stroke-linejoin', 'round');
    
    const locationPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    locationPath.setAttribute('d', 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z');
    
    const locationCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    locationCircle.setAttribute('cx', '12');
    locationCircle.setAttribute('cy', '10');
    locationCircle.setAttribute('r', '3');
    
    locationIcon.appendChild(locationPath);
    locationIcon.appendChild(locationCircle);
    
    // Add location text
    const locationText = document.createTextNode(post.location);
    
    locationElement.appendChild(locationIcon);
    locationElement.appendChild(locationText);
    
    // Create confidence score element
    const confidenceClass = getConfidenceClass(post.confidence_score);
    const confidenceElement = createElement('div', {
        className: `confidence-score ${confidenceClass}`
    }, `Confidence: ${Math.round(post.confidence_score * 100)}%`);
    
    // Add location and confidence to footer
    postFooter.appendChild(locationElement);
    postFooter.appendChild(confidenceElement);
    
    // Add disaster type badge if available
    if (post.disaster_type) {
        const disasterTypeElement = createElement('div', {
            className: 'disaster-type-badge'
        }, post.disaster_type);
        
        postFooter.appendChild(disasterTypeElement);
    }
    
    // Add verified badge if verified
    if (post.verified) {
        const verifiedElement = createElement('div', {
            className: 'verified-badge'
        }, 'Verified');
        
        postFooter.appendChild(verifiedElement);
    }
    
    // Add all elements to post container
    postElement.appendChild(postHeader);
    postElement.appendChild(contentElement);
    postElement.appendChild(postFooter);
    
    return postElement;
}
