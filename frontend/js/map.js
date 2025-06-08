document.addEventListener('DOMContentLoaded', function() {
    // Initialize map centered on India
    const map = L.map('map').setView([20.5937, 78.9629], 5);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Store markers for later reference
    let markers = [];

    // Predefined coordinates for cities in India
    const cityCoordinates = {
        'Mumbai': { lat: 19.0760, lon: 72.8777 },
        'Delhi': { lat: 28.7041, lon: 77.1025 },
        'Chennai': { lat: 13.0827, lon: 80.2707 },
        'Bengaluru': { lat: 12.9716, lon: 77.5946 },
        'Kolkata': { lat: 22.5726, lon: 88.3639 },
        'Jodhpur': { lat: 26.2389, lon: 73.0243 },
        'Gwalior': { lat: 26.2124, lon: 78.1772 },
        'Jammu': { lat: 32.7357, lon: 74.8695 },
        'Raipur': { lat: 21.2514, lon: 81.6296 },
        'Amritsar': { lat: 31.6340, lon: 74.8737 },
        'Lucknow': { lat: 26.8467, lon: 80.9462 },
        'Kozhikode': { lat: 11.2588, lon: 75.7804 },
        'Guwahati': { lat: 26.1445, lon: 91.7362 },
        'Pune': { lat: 18.5204, lon: 73.8567 },
        'Chandigarh': { lat: 30.7333, lon: 76.7794 },
        'Patna': { lat: 25.594095, lon: 85.137645 },
        'Nashik': { lat: 19.9975, lon: 73.7898 },
        'Jaipur': { lat: 26.9124, lon: 75.7873 },
        // Add more cities as needed
    };

    // Function to create a marker with popup
    function createMarker(lat, lon, item) {
        const marker = L.marker([lat, lon]).addTo(map);
        
        // Format date
        const publishedDate = new Date(item.published);
        const formattedDate = publishedDate.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        // Create popup content
        const popupContent = `
    <div class="marker-popup" style="font-family: 'Poppins', sans-serif; color: #333;">
        <h6 style="font-size: 1rem; font-weight: 600; color: #1a1a1a;">${item.title}</h6>
        <p class="mb-1" style="font-size: 0.85rem; color: #444;">
            <small>
                <i class="fas fa-newspaper" style="color: #555;"></i> ${item.source}<br>
                <i class="fas fa-calendar" style="color: #555;"></i> ${formattedDate}
            </small>
        </p>
        <a href="${item.link}" target="_blank" rel="noopener noreferrer" 
           class="btn btn-sm btn-primary mt-2" 
           style="color: white; font-size: 0.8rem; font-weight: 500; letter-spacing: 0.3px;">
            Read More
        </a>
    </div>
`;


        marker.bindPopup(popupContent);
        return marker;
    }

    // Function to update map with new data
    async function updateMap(data) {
        console.log(`Updating map with ${data.length} items.`);
        // Clear existing markers
        markers.forEach(marker => map.removeLayer(marker));
        markers = [];

        // Process each item
        for (const item of data) {
            if (item.location) {
                console.log(`Processing item with location: ${item.location}`);
                const coords = cityCoordinates[item.location];

                if (coords) {
                    console.log(`Found predefined coordinates for ${item.location}:`, coords);
                    const marker = createMarker(coords.lat, coords.lon, item);
                    markers.push(marker);
                } else {
                    console.warn(`No predefined coordinates found for location: ${item.location}. Skipping marker.`);
                }
            }
        }

        // Fit map bounds to show all markers
        if (markers.length > 0) {
            const group = new L.featureGroup(markers);
            map.fitBounds(group.getBounds().pad(0.1));
        }
    }

    // Listen for live feed updates
    const liveFeedContainer = document.getElementById('liveFeed');
    if (liveFeedContainer) {
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    // Extract data from feed items
                    const feedItems = Array.from(liveFeedContainer.getElementsByClassName('feed-item'));
                    const data = feedItems.map(item => {
                        const title = item.querySelector('.title a').textContent;
                        const link = item.querySelector('.title a').href;
                        const source = item.querySelector('.source').textContent;
                        const date = item.querySelector('.date').textContent;
                        const location = item.querySelector('.location').textContent.replace('📍', '').trim();
                        
                        return {
                            title,
                            link,
                            source,
                            published: new Date(date).toISOString(),
                            location
                        };
                    });

                    // Update map with new data
                    updateMap(data);
                }
            });
        });

        observer.observe(liveFeedContainer, { childList: true });
    }
}); 