// Navigation
document.querySelectorAll('.nav-links li').forEach(item => {
    item.addEventListener('click', () => {
        // Remove active class from all items
        document.querySelectorAll('.nav-links li').forEach(li => li.classList.remove('active'));
        // Add active class to clicked item
        item.classList.add('active');
        
        // Hide all sections
        document.querySelectorAll('.section').forEach(section => section.classList.remove('active'));
        // Show selected section
        const sectionId = item.getAttribute('data-section');
        document.getElementById(sectionId).classList.add('active');
    });
});

// Initialize maps
let feedMap = null;
let reliefMap = null;

function initFeedMap() {
    const mapContainer = document.getElementById('feedMap');
    if (!mapContainer) {
        console.error('Feed map container not found');
        return;
    }

    if (!feedMap) {
        feedMap = L.map('feedMap').setView([20.5937, 78.9629], 5); // Center on India
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(feedMap);
    }
}

function initReliefMap() {
    const mapContainer = document.getElementById('reliefMap');
    if (!mapContainer) {
        console.error('Relief map container not found');
        return;
    }

    if (!reliefMap) {
        reliefMap = L.map('reliefMap').setView([20.5937, 78.9629], 5); // Center on India
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(reliefMap);
    }
}

// Helper function to display errors
function displayError(error) {
    const eventForm = document.getElementById('eventForm');
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';
    errorMessage.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <h3>Error</h3>
        <p>${error}</p>
    `;

    // Clear previous messages
    const existingMessages = eventForm.querySelectorAll('.success-message, .error-message');
    existingMessages.forEach(msg => msg.remove());

    // Add the new error message
    eventForm.appendChild(errorMessage);
}

// Latest Feed Section
document.getElementById('loadFeed').addEventListener('click', async () => {
    const btn = document.getElementById('loadFeed');
    const feedList = document.getElementById('feedList');
    
    btn.classList.add('loading');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';

    try {
        const response = await fetch('/api/disaster-news');
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }

        // Clear previous content
        feedList.innerHTML = '';
        if (feedMap) {
            feedMap.eachLayer((layer) => {
                if (layer instanceof L.Marker) {
                    feedMap.removeLayer(layer);
                }
            });
        }

        // Initialize map if not already done
        initFeedMap();

        // Display feed items and markers
        data.forEach(item => {
            // Add to feed list
            const feedItem = document.createElement('div');
            feedItem.className = 'feed-item';
            feedItem.innerHTML = `
                <h3>${item.title}</h3>
                <p>${item.description}</p>
                <small>Location: ${item.location}</small>
            `;
            feedList.appendChild(feedItem);

            // Add marker to map
            if (item.coordinates) {
                L.marker(item.coordinates)
                    .bindPopup(item.title)
                    .addTo(feedMap);
            }
        });
    } catch (error) {
        console.error('Error loading feed:', error);
        displayError(error.message);
    } finally {
        btn.classList.remove('loading');
        btn.innerHTML = '<i class="fas fa-sync"></i> Load Feed';
    }
});

// Event Details Section
document.getElementById('eventForm').addEventListener('submit', handleEventSubmit);

async function handleEventSubmit(event) {
    event.preventDefault();
    const type = document.getElementById('eventType').value;
    const btn = event.target.querySelector('button');
    const output = document.getElementById('eventOutput');
    
    btn.classList.add('loading');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
    
    // Clear previous messages and output
    output.innerHTML = '';
    const existingMessages = event.target.querySelectorAll('.form-success-message, .form-error-message');
    existingMessages.forEach(msg => msg.remove());

    try {
        const response = await fetch('/api/event-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ type })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.details || data.error || 'Failed to process event');
        }

        // Determine severity class for highlighting
        let severityClass = 'low';
        if (data.severity && data.severity.toLowerCase() === 'high') {
            severityClass = 'high';
        } else if (data.severity && data.severity.toLowerCase() === 'medium') {
            severityClass = 'medium';
        }

        // Determine icon for the main event type
        let eventIcon = 'fas fa-bullhorn'; // Default icon
        if (data.type) {
            const lowerType = data.type.toLowerCase();
            if (lowerType.includes('flood')) eventIcon = 'fas fa-water';
            else if (lowerType.includes('earthquake')) eventIcon = 'fas fa-globe';
            else if (lowerType.includes('cyclone') || lowerType.includes('storm')) eventIcon = 'fas fa-wind';
            else if (lowerType.includes('landslide')) eventIcon = 'fas fa-mountain';
            else if (lowerType.includes('drought')) eventIcon = 'fas fa-sun';
            else if (lowerType.includes('fire')) eventIcon = 'fas fa-fire';
        }

        // Create enhanced event details HTML
        output.innerHTML = `
            <div class="event-details-container">
                <div class="event-details-header">
                     <div class="event-details-icon">
                        <i class="${eventIcon}"></i>
                    </div>
                    <h3 class="event-details-title">Event Type: ${data.type || 'N/A'}</h3>
                </div>

                ${data.description ? `<p class="event-details-description">${data.description}</p>` : ''}
                
                <div class="event-details-meta">
                    ${data.severity ? `
                        <div class="event-details-meta-item">
                            <i class="fas fa-exclamation-triangle"></i>
                            <span>Severity: <span class="severity-level ${severityClass}">${data.severity}</span></span>
                        </div>
                    ` : ''}
                    ${data.timestamp ? `
                        <div class="event-details-meta-item">
                            <i class="fas fa-clock"></i>
                            <span>Last updated: ${data.timestamp}</span>
                        </div>
                    ` : ''}
                     ${data.source ? `
                        <div class="event-details-meta-item">
                            <i class="fas fa-globe"></i>
                            <span>Source: ${data.source}</span>
                        </div>
                    ` : ''}
                     ${data.reported_by ? `
                        <div class="event-details-meta-item">
                            <i class="fas fa-user-alt"></i>
                            <span>Reported by: ${data.reported_by}</span>
                        </div>
                    ` : ''}
                </div>

                ${data.affected_areas && data.affected_areas.length > 0 ? `
                    <h4 class="event-details-section-title"><i class="fas fa-map-marker-alt"></i> Affected Areas:</h4>
                    <ul class="event-details-list">
                        ${data.affected_areas.map(area => `<li>${area}</li>`).join('')}
                    </ul>
                ` : ''}

                ${data.recommendations && data.recommendations.length > 0 ? `
                    <h4 class="event-details-section-title"><i class="fas fa-lightbulb"></i> Recommendations:</h4>
                    <ul class="event-details-list">
                        ${data.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                    </ul>
                ` : ''}

                ${data.recent_news && data.recent_news.length > 0 ? `
                    <h4 class="event-details-section-title"><i class="fas fa-newspaper"></i> Recent News:</h4>
                    <ul class="event-details-list">
                        ${data.recent_news.map(news => `
                            <li>
                                <a href="${news.source_url || '#'}" target="_blank">${news.title || 'Untitled'}</a>
                                ${news.newspaper ? `<small>(${news.newspaper})</small>` : ''}
                            </li>
                        `).join('')}
                    </ul>
                ` : ''}

                ${data.image_url ? `
                    <h4 class="event-details-section-title"><i class="fas fa-image"></i> Related Image:</h4>
                    <img src="${data.image_url}" alt="Related event image" class="event-details-image">
                ` : ''}

            </div>
        `;

    } catch (error) {
        console.error('Error processing event details:', error);
         output.innerHTML = `
            <div class="form-error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>Error retrieving event details.</p>
                <p>${error.message}</p>
            </div>
        `;
    } finally {
        btn.classList.remove('loading');
        btn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Event';
    }
}

// Search Section
document.getElementById('searchForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const query = document.getElementById('searchQuery').value;
    const btn = e.target.querySelector('button');
    const output = document.getElementById('searchOutput');
    
    // Show loading state
    output.innerHTML = '<div class="search-loading"><i class="fas fa-spinner"></i></div>';
    btn.classList.add('loading');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Searching...';

    try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.details || data.error || 'Failed to perform search');
        }

        // Clear loading state
        output.innerHTML = '';

        // Display results
        if (data.results && data.results.length > 0) {
            output.innerHTML = `
                <div class="search-results">
                    ${data.results.map(result => {
                        // Determine priority class
                        let priorityClass = 'low';
                        if (result.severity && result.severity.toLowerCase() === 'high') {
                            priorityClass = 'high';
                        } else if (result.severity && result.severity.toLowerCase() === 'medium') {
                            priorityClass = 'medium';
                        }

                        // Get priority icon and text
                        let priorityIcon = 'fas fa-check-circle';
                        let priorityText = 'Low Priority';
                        if (priorityClass === 'high') {
                            priorityIcon = 'fas fa-exclamation-triangle';
                            priorityText = 'High Priority';
                        } else if (priorityClass === 'medium') {
                            priorityIcon = 'fas fa-exclamation-circle';
                            priorityText = 'Medium Priority';
                        }

                        return `
                            <div class="search-card">
                                <div class="priority-badge ${priorityClass}">
                                    <i class="${priorityIcon}"></i>
                                    ${priorityText}
                                </div>
                                ${result.images && result.images.length > 0 ? `
                                    <div class="search-card-image">
                                        <img src="${result.images[0]}" alt="Related image" onerror="this.style.display='none'">
                                    </div>
                                ` : ''}
                                <div class="search-card-content-wrapper">
                                    <div class="search-card-header">
                                        <div class="search-card-icon">
                                            <i class="fas fa-bullhorn"></i> <!-- Default icon, can be dynamic based on type -->
                                        </div>
                                        <h3 class="search-card-title">${result.title || 'Untitled'}</h3>
                                    </div>
                                    <div class="search-card-content">
                                        <p>${result.description || 'No description available.'}</p>
                                    </div>
                                    <div class="search-card-meta">
                                        ${result.location ? `
                                            <div class="search-card-meta-item">
                                                <i class="fas fa-map-marker-alt"></i>
                                                <span>${result.location}</span>
                                            </div>
                                        ` : ''}
                                        ${result.timestamp ? `
                                            <div class="search-card-meta-item">
                                                <i class="fas fa-clock"></i>
                                                <span>${result.timestamp}</span>
                                            </div>
                                        ` : ''}
                                         ${result.source ? `
                                            <div class="search-card-meta-item">
                                                <i class="fas fa-globe"></i>
                                                <span>${result.source}</span>
                                            </div>
                                        ` : ''}
                                         ${result.reported_by ? `
                                            <div class="search-card-meta-item">
                                                <i class="fas fa-user-alt"></i>
                                                <span>${result.reported_by}</span>
                                            </div>
                                        ` : ''}
                                    </div>
                                    ${result.tags && result.tags.length > 0 ? `
                                        <div class="search-card-tags">
                                            ${result.tags.map(tag => `<span class="search-card-tag">${tag}</span>`).join('')}
                                        </div>
                                    ` : ''}
                                    ${result.url ? `
                                        <div class="search-card-actions">
                                            <a href="${result.url}" target="_blank" class="search-card-btn">
                                                <i class="fas fa-info-circle"></i>
                                                View Details
                                            </a>
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        } else {
            output.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <p>No results found for "${query}"</p>
                    <p>Try different keywords or check your spelling</p>
                </div>
            `;
        }

    } catch (error) {
        console.error('Error during search:', error);
        output.innerHTML = `
            <div class="no-results">
                <i class="fas fa-exclamation-circle"></i>
                <p>Error performing search.</p>
                <p>${error.message}</p>
            </div>
        `;
    } finally {
        btn.classList.remove('loading');
        btn.innerHTML = '<i class="fas fa-search"></i> Search';
    }
});

// Nearest Relief Section
document.getElementById('findRelief').addEventListener('click', async () => {
    const city = document.getElementById('reliefLocation').value.trim();
    if (!city) {
        alert('Please enter a city name');
        return;
    }

    const btn = document.getElementById('findRelief');
    const resultsContainer = document.getElementById('reliefResults');
    
    if (!resultsContainer) {
        console.error('Results container not found');
        return;
    }

    btn.classList.add('loading');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Finding...';

    // Show loading state
    resultsContainer.innerHTML = `
        <div class="loading-state">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Searching for relief centers...</p>
        </div>
    `;

    try {
        const response = await fetch('http://localhost:5001/get_relief_centers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ city })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.error) {
            throw new Error(data.error);
        }

        if (!data.centers || !Array.isArray(data.centers)) {
            throw new Error('Invalid response format from server');
        }

        // Initialize map if needed
        initReliefMap();

        // Update map with centers
        if (reliefMap) {
            // Clear existing markers
            reliefMap.eachLayer((layer) => {
                if (layer instanceof L.Marker) {
                    reliefMap.removeLayer(layer);
                }
            });

            // Add new markers
            const bounds = L.latLngBounds(data.centers.map(center => [center.lat, center.lng]));
            reliefMap.fitBounds(bounds);

            data.centers.forEach(center => {
                L.marker([center.lat, center.lng])
                    .bindPopup(`
                        <strong>${center.name}</strong><br>
                        ${center.address}<br>
                        <a href="tel:${center.phone}">${center.phone}</a>
                    `)
                    .addTo(reliefMap);
            });
        }

        // Display results
        if (data.centers.length === 0) {
            resultsContainer.innerHTML = `
                <div class="alert alert-info">
                    <i class="fas fa-info-circle"></i>
                    <strong>No relief centers found</strong>
                    <p>Try searching for a different city or check your spelling.</p>
                </div>
            `;
        } else {
            resultsContainer.innerHTML = data.centers.map(center => `
                <div class="relief-item" data-type="${center.type}">
                    <span class="type-badge ${center.type}">${getTypeLabel(center.type)}</span>
                    <h4>${center.name}</h4>
                    <p><i class="fas fa-map-marker-alt"></i> ${center.address}</p>
                    <div class="contact-info">
                        <i class="fas fa-phone"></i>
                        <a href="tel:${center.phone}">${center.phone}</a>
                    </div>
                </div>
            `).join('');
        }

    } catch (error) {
        console.error('Error finding relief centers:', error);
        resultsContainer.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-circle"></i>
                <strong>Error:</strong> ${error.message || 'Failed to fetch relief centers. Please try again.'}
            </div>
        `;
    } finally {
        btn.classList.remove('loading');
        btn.innerHTML = '<i class="fas fa-search"></i> Find Relief Centers';
    }
});

// Initial map setup for feed section when the section is activated
document.querySelector('.nav-links li[data-section="latest-feed"]').addEventListener('click', initFeedMap);

// Initial map setup for relief section when the section is activated
document.querySelector('.nav-links li[data-section="relief"]').addEventListener('click', initReliefMap);

// Trigger initial load for the active section (Latest Feed)
document.addEventListener('DOMContentLoaded', () => {
    // Check if the latest-feed section is the active one on load
    if (document.getElementById('latest-feed').classList.contains('active')) {
        // You might want to trigger the feed loading here if desired
        // document.getElementById('loadFeed').click(); 
    }
});

// Global variables
let map = null;
let markers = [];

// Initialize map only once
function initMap() {
    const mapContainer = document.getElementById('reliefMap');
    if (!mapContainer) {
        console.error('Map container not found');
        return;
    }

    // Check if map is already initialized
    if (map) {
        console.log('Map already initialized');
        return;
    }

    try {
        // Initialize map
        map = L.map('reliefMap').setView([0, 0], 2);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);
        console.log('Map initialized successfully');
    } catch (error) {
        console.error('Error initializing map:', error);
    }
}

function clearMarkers() {
    if (!map) return;
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
}

function addMarker(center) {
    if (!map) return;
    try {
        const marker = L.marker([center.lat, center.lng]).addTo(map);
        marker.bindPopup(`
            <strong>${center.name}</strong><br>
            ${center.address}<br>
            <a href="tel:${center.phone}">${center.phone}</a>
        `);
        markers.push(marker);
    } catch (error) {
        console.error('Error adding marker:', error);
    }
}

function updateMap(centers) {
    if (!map) {
        console.error('Map not initialized');
        return;
    }
    
    try {
        clearMarkers();
        if (centers.length === 0) return;
        
        const bounds = L.latLngBounds(centers.map(c => [c.lat, c.lng]));
        map.fitBounds(bounds);
        
        centers.forEach(center => addMarker(center));
    } catch (error) {
        console.error('Error updating map:', error);
    }
}

function getTypeLabel(type) {
    const labels = {
        'fire_station': 'Fire Station',
        'medical_center': 'Medical Center',
        'relief_shelter': 'Relief Shelter',
        'emergency_center': 'Emergency Center'
    };
    return labels[type] || type;
}

function displayResults(centers) {
    const resultsContainer = document.getElementById('reliefResults');
    if (!resultsContainer) {
        console.error('Results container not found');
        return;
    }
    
    try {
        if (!Array.isArray(centers)) {
            console.error('Invalid centers data:', centers);
            resultsContainer.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-circle"></i>
                    <strong>Error:</strong> Invalid data received from server
                </div>
            `;
            return;
        }
        
        if (centers.length === 0) {
            resultsContainer.innerHTML = `
                <div class="alert alert-info">
                    <i class="fas fa-info-circle"></i>
                    <strong>No relief centers found</strong>
                    <p>Try searching for a different city or check your spelling.</p>
                </div>
            `;
            return;
        }
        
        resultsContainer.innerHTML = centers.map(center => `
            <div class="relief-item" data-type="${center.type}">
                <span class="type-badge ${center.type}">${getTypeLabel(center.type)}</span>
                <h4>${center.name}</h4>
                <p><i class="fas fa-map-marker-alt"></i> ${center.address}</p>
                <div class="contact-info">
                    <i class="fas fa-phone"></i>
                    <a href="tel:${center.phone}">${center.phone}</a>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error displaying results:', error);
        resultsContainer.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-circle"></i>
                <strong>Error:</strong> Failed to display results
            </div>
        `;
    }
}

// Initialize everything when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize map
    initMap();
    
    // Set up relief center search
    const findReliefBtn = document.getElementById('findRelief');
    if (findReliefBtn) {
        findReliefBtn.addEventListener('click', async function() {
            const cityInput = document.getElementById('reliefLocation');
            if (!cityInput) {
                console.error('City input not found');
                return;
            }
            
            const city = cityInput.value.trim();
            if (!city) {
                alert('Please enter a city name');
                return;
            }
            
            // Show loading state
            const resultsContainer = document.getElementById('reliefResults');
            if (resultsContainer) {
                resultsContainer.innerHTML = `
                    <div class="loading-state">
                        <i class="fas fa-spinner fa-spin"></i>
                        <p>Searching for relief centers...</p>
                    </div>
                `;
            }
            
            try {
                const response = await fetch('http://localhost:5001/get_relief_centers', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ city })
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                if (data.error) {
                    throw new Error(data.error);
                }
                
                if (!data.centers || !Array.isArray(data.centers)) {
                    throw new Error('Invalid response format from server');
                }
                
                updateMap(data.centers);
                displayResults(data.centers);
                
            } catch (error) {
                console.error('Error finding relief centers:', error);
                const resultsContainer = document.getElementById('reliefResults');
                if (resultsContainer) {
                    resultsContainer.innerHTML = `
                        <div class="alert alert-danger">
                            <i class="fas fa-exclamation-circle"></i>
                            <strong>Error:</strong> ${error.message || 'Failed to fetch relief centers. Please try again.'}
                        </div>
                    `;
                }
            }
        });
    }
    
    // Set up filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // Update active state
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const type = this.dataset.type;
            const items = document.querySelectorAll('.relief-item');
            
            items.forEach(item => {
                if (type === 'all' || item.dataset.type === type) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
}); 