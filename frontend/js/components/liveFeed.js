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
    
    // Add AI summarizer to the feed
    addAISummarizer();
}

/**
 * Add AI summarizer to the feed
 */
function addAISummarizer() {
    // Get the parent element
    const liveFeedPanel = document.getElementById('live-feed');
    
    if (!liveFeedPanel) {
        console.error('Could not find live feed panel');
        return;
    }
    
    // Create AI summarizer container
    const summarizerContainer = createElement('div', {
        className: 'ai-summarizer-container',
        id: 'live-feed-summarizer'
    });
    
    // Create header
    const summarizerHeader = createElement('div', {
        className: 'ai-summarizer-header'
    });
    
    const summarizerTitle = createElement('h3', {
        className: 'ai-summarizer-title'
    }, 'AI Feed Summary');
    
    const refreshButton = createElement('button', {
        className: 'ai-summarizer-refresh'
    }, '↻ Refresh');
    
    refreshButton.addEventListener('click', generateSummary);
    
    summarizerHeader.appendChild(summarizerTitle);
    summarizerHeader.appendChild(refreshButton);
    
    // Create content
    const summarizerContent = createElement('div', {
        className: 'ai-summarizer-content',
        id: 'ai-summary-content'
    }, 'Click refresh to generate a summary of recent social media posts.');
    
    // Add elements to container
    summarizerContainer.appendChild(summarizerHeader);
    summarizerContainer.appendChild(summarizerContent);
    
    // Insert after the filter container
    const filterContainer = liveFeedPanel.querySelector('.filter-container');
    if (filterContainer) {
        filterContainer.parentNode.insertBefore(summarizerContainer, filterContainer.nextSibling);
    } else {
        // If filter container not found, insert after the title
        const title = liveFeedPanel.querySelector('h2');
        if (title) {
            title.parentNode.insertBefore(summarizerContainer, title.nextSibling);
        } else {
            // Last resort, prepend to the panel
            liveFeedPanel.prepend(summarizerContainer);
        }
    }
}

/**
 * Generate a summary of the current posts
 */
function generateSummary() {
    const summaryContent = document.getElementById('ai-summary-content');
    
    if (!summaryContent) return;
    
    // Show loading state
    summaryContent.textContent = 'Generating summary...';
    summaryContent.classList.add('loading');
    
    // In a real app, this would call an AI service
    // For this demo, we'll create a simple summary based on the current posts
    setTimeout(() => {
        if (currentPosts.length === 0) {
            summaryContent.textContent = 'No posts available to summarize.';
            summaryContent.classList.remove('loading');
            return;
        }
        
        // Count disaster types
        const disasterCounts = {};
        currentPosts.forEach(post => {
            const type = post.disaster_type;
            disasterCounts[type] = (disasterCounts[type] || 0) + 1;
        });
        
        // Find most common disaster type
        let mostCommonType = '';
        let maxCount = 0;
        
        Object.entries(disasterCounts).forEach(([type, count]) => {
            if (count > maxCount) {
                mostCommonType = type;
                maxCount = count;
            }
        });
        
        // Count verified vs unverified
        const verifiedCount = currentPosts.filter(post => post.verified).length;
        const unverifiedCount = currentPosts.length - verifiedCount;
        
        // Get most recent post time
        const mostRecent = new Date(Math.max(...currentPosts.map(post => new Date(post.timestamp))));
        const timeAgo = formatTimeAgo(mostRecent);
        
        // Generate summary text
        let summary = `Based on ${currentPosts.length} recent social media posts:\n\n`;
        
        if (mostCommonType) {
            summary += `• Most reported disaster: ${mostCommonType.toUpperCase()} (${disasterCounts[mostCommonType]} reports)\n`;
        }
        
        summary += `• ${verifiedCount} verified and ${unverifiedCount} unverified reports\n`;
        summary += `• Most recent activity: ${timeAgo}\n`;
        
        // Get unique locations
        const locations = [...new Set(currentPosts.map(post => post.location.split(',')[0].trim()))];
        
        if (locations.length > 0) {
            summary += `• Affected areas: ${locations.slice(0, 3).join(', ')}`;
            
            if (locations.length > 3) {
                summary += ` and ${locations.length - 3} more`;
            }
        }
        
        // Update the content
        summaryContent.textContent = summary;
        summaryContent.classList.remove('loading');
    }, 1000);
}

/**
 * Format time ago from date
 * @param {Date} date - The date to format
 * @returns {string} Formatted time ago string
 */
function formatTimeAgo(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    
    if (diffHour > 0) {
        return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
    } else if (diffMin > 0) {
        return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    } else {
        return 'Just now';
    }
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
    
    // Create media element if media_url exists
    if (post.media_url) {
        const mediaElement = createMediaElement(post.media_url);
        if (mediaElement) {
            contentElement.appendChild(mediaElement);
        }
    }
    
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
    
    // Add upvote/downvote controls
    const voteControls = createVoteControls(post);
    postFooter.appendChild(voteControls);
    
    // Add all elements to post container
    postElement.appendChild(postHeader);
    postElement.appendChild(contentElement);
    postElement.appendChild(postFooter);
    
    return postElement;
}

/**
 * Create media element based on URL
 * @param {string} url - The media URL
 * @returns {HTMLElement|null} The media element or null if invalid
 */
function createMediaElement(url) {
    if (!url) return null;
    
    // Create container for media
    const mediaContainer = createElement('div', {
        className: 'social-post-media'
    });
    
    // Determine media type from URL
    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
    const isVideo = /\.(mp4|webm|ogg)$/i.test(url);
    
    if (isImage) {
        // Create image preview
        const img = createElement('img', {
            src: url,
            alt: 'Post attachment',
            loading: 'lazy',
            className: 'social-post-image'
        });
        
        // Add click handler to open lightbox
        img.addEventListener('click', () => openMediaLightbox(url, 'image'));
        
        mediaContainer.appendChild(img);
    } else if (isVideo) {
        // Create video preview
        const video = createElement('video', {
            src: url,
            controls: true,
            className: 'social-post-video'
        });
        
        mediaContainer.appendChild(video);
    } else {
        // Unknown media type, create a link
        const link = createElement('a', {
            href: url,
            target: '_blank',
            rel: 'noopener noreferrer',
            className: 'social-post-attachment'
        }, 'View Attachment');
        
        mediaContainer.appendChild(link);
    }
    
    return mediaContainer;
}

/**
 * Open media in lightbox
 * @param {string} url - The media URL
 * @param {string} type - The media type ('image' or 'video')
 */
function openMediaLightbox(url, type) {
    // Create lightbox container
    const lightbox = createElement('div', {
        className: 'media-lightbox',
        onclick: (e) => {
            // Close lightbox when clicking outside the media
            if (e.target === lightbox) {
                document.body.removeChild(lightbox);
            }
        }
    });
    
    // Create close button
    const closeButton = createElement('button', {
        className: 'lightbox-close',
        onclick: () => document.body.removeChild(lightbox)
    }, '×');
    
    // Create media element
    let mediaElement;
    
    if (type === 'image') {
        mediaElement = createElement('img', {
            src: url,
            alt: 'Full-size image',
            className: 'lightbox-image'
        });
    } else if (type === 'video') {
        mediaElement = createElement('video', {
            src: url,
            controls: true,
            autoplay: true,
            className: 'lightbox-video'
        });
    }
    
    // Add elements to lightbox
    lightbox.appendChild(closeButton);
    lightbox.appendChild(mediaElement);
    
    // Add lightbox to body
    document.body.appendChild(lightbox);
}

/**
 * Create vote controls for a post
 * @param {Object} post - The post data
 * @returns {HTMLElement} The vote controls element
 */
function createVoteControls(post) {
    const voteContainer = createElement('div', {
        className: 'vote-controls'
    });
    
    // Upvote button
    const upvoteBtn = createElement('button', {
        className: 'vote-btn upvote',
        onclick: () => handleVote(post._id, 'up')
    });
    
    const upvoteIcon = document.createTextNode('👍');
    upvoteBtn.appendChild(upvoteIcon);
    
    const upvoteCount = createElement('span', {
        className: 'vote-count',
        'data-vote-type': 'up',
        'data-post-id': post._id
    }, post.upvotes || '0');
    
    upvoteBtn.appendChild(upvoteCount);
    
    // Downvote button
    const downvoteBtn = createElement('button', {
        className: 'vote-btn downvote',
        onclick: () => handleVote(post._id, 'down')
    });
    
    const downvoteIcon = document.createTextNode('👎');
    downvoteBtn.appendChild(downvoteIcon);
    
    const downvoteCount = createElement('span', {
        className: 'vote-count',
        'data-vote-type': 'down',
        'data-post-id': post._id
    }, post.downvotes || '0');
    
    downvoteBtn.appendChild(downvoteCount);
    
    // Add buttons to container
    voteContainer.appendChild(upvoteBtn);
    voteContainer.appendChild(downvoteBtn);
    
    return voteContainer;
}

/**
 * Handle vote action
 * @param {string} postId - The post ID
 * @param {string} voteType - The vote type ('up' or 'down')
 */
async function handleVote(postId, voteType) {
    try {
        // Send vote to server
        const response = await fetch(`${API_BASE_URL}/social-posts/${postId}/vote`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                vote: voteType
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const result = await response.json();
        
        // Update vote counts in UI
        updateVoteCounts(postId, result.upvotes, result.downvotes);
        
    } catch (error) {
        console.error('Error submitting vote:', error);
        // Show error toast
        showToast('Error submitting vote. Please try again.', 'error');
    }
}

/**
 * Update vote counts in UI
 * @param {string} postId - The post ID
 * @param {number} upvotes - The upvote count
 * @param {number} downvotes - The downvote count
 */
function updateVoteCounts(postId, upvotes, downvotes) {
    // Update upvote count
    const upvoteElements = document.querySelectorAll(`.vote-count[data-vote-type="up"][data-post-id="${postId}"]`);
    upvoteElements.forEach(el => {
        el.textContent = upvotes || '0';
    });
    
    // Update downvote count
    const downvoteElements = document.querySelectorAll(`.vote-count[data-vote-type="down"][data-post-id="${postId}"]`);
    downvoteElements.forEach(el => {
        el.textContent = downvotes || '0';
    });
}
