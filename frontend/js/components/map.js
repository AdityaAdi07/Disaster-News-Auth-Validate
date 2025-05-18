/**
 * Map Component
 * Displays disaster alerts on a map
 */

// DOM Elements
const mapContainer = document.getElementById('disaster-map');

// Map instance
let map = null;
let markers = {};

// Default map center (India)
const DEFAULT_CENTER = [20.5937, 78.9629];
const DEFAULT_ZOOM = 5;

/**
 * Initialize the Map component
 */
function initMap() {
    console.log('Initializing Map component...');
    
    // Create map if container exists
    if (mapContainer) {
        // Initialize Leaflet map
        map = L.map('disaster-map').setView(DEFAULT_CENTER, DEFAULT_ZOOM);
        
        // Add tile layer (OpenStreetMap)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 18
        }).addTo(map);
        
        // Add scale control
        L.control.scale().addTo(map);
        
        console.log('Map initialized successfully');
    } else {
        console.error('Map container not found');
    }
}

/**
 * Update the Map with new data
 * @param {Array} alerts - The disaster alerts
 */
function updateMap(alerts) {
    // Check if map is initialized
    if (!map) {
        console.error('Map not initialized');
        return;
    }
    
    // Clear existing markers
    clearMarkers();
    
    // Add new markers
    if (alerts && alerts.length > 0) {
        alerts.forEach(alert => {
            addMarker(alert);
        });
        
        // Fit map to markers if there are any
        fitMapToMarkers();
    }
}

/**
 * Refresh the map
 * Called when the map tab is shown
 */
function refreshMap() {
    // Check if map is initialized
    if (map) {
        // Invalidate map size to handle container resize
        map.invalidateSize();
    }
}

/**
 * Add a marker to the map
 * @param {Object} alert - The alert data
 */
function addMarker(alert) {
    // Check if alert has location coordinates
    if (!alert.coordinates || !Array.isArray(alert.coordinates) || alert.coordinates.length !== 2) {
        console.warn('Alert missing valid coordinates:', alert);
        return;
    }
    
    // Get coordinates
    const [lat, lng] = alert.coordinates;
    
    // Create marker icon based on disaster type and severity
    const markerIcon = createMarkerIcon(alert);
    
    // Create marker
    const marker = L.marker([lat, lng], { icon: markerIcon });
    
    // Create popup content
    const popupContent = createPopupContent(alert);
    
    // Bind popup to marker
    marker.bindPopup(popupContent);
    
    // Add marker to map
    marker.addTo(map);
    
    // Store marker reference
    markers[alert._id] = marker;
    
    // Add hover effect
    marker.on('mouseover', function() {
        this.openPopup();
    });
}

/**
 * Create a marker icon based on disaster type and severity
 * @param {Object} alert - The alert data
 * @returns {L.Icon} The marker icon
 */
function createMarkerIcon(alert) {
    // Default icon options
    const iconOptions = {
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    };
    
    // Set icon color based on severity
    let iconColor = 'blue';
    if (alert.severity) {
        switch (alert.severity.toLowerCase()) {
            case 'high':
                iconColor = 'red';
                break;
            case 'medium':
                iconColor = 'orange';
                break;
            case 'low':
                iconColor = 'green';
                break;
        }
    }
    
    // Create icon
    return L.icon({
        iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${iconColor}.png`,
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        ...iconOptions
    });
}

/**
 * Create popup content for a marker
 * @param {Object} alert - The alert data
 * @returns {string} The popup HTML content
 */
function createPopupContent(alert) {
    // Create popup content
    let content = `
        <div class="map-popup">
            <h3>${alert.disaster_type || 'Alert'}</h3>
            <div class="popup-location">📍 ${alert.location}</div>
    `;
    
    // Add severity if available
    if (alert.severity) {
        const severityClass = getSeverityClass(alert.severity);
        content += `
            <div class="popup-severity ${severityClass}">
                Severity: ${alert.severity}
            </div>
        `;
    }
    
    // Add status if available
    if (alert.status) {
        const statusClass = getStatusClass(alert.status);
        content += `
            <div class="popup-status ${statusClass}">
                Status: ${alert.status}
            </div>
        `;
    }
    
    // Add timestamp
    content += `
        <div class="popup-timestamp">
            ${formatDate(alert.timestamp)}
        </div>
    `;
    
    // Close popup div
    content += '</div>';
    
    return content;
}

/**
 * Clear all markers from the map
 */
function clearMarkers() {
    // Remove each marker from the map
    Object.values(markers).forEach(marker => {
        map.removeLayer(marker);
    });
    
    // Clear markers object
    markers = {};
}

/**
 * Fit map to markers
 */
function fitMapToMarkers() {
    // Get all markers
    const markerArray = Object.values(markers);
    
    // Check if there are any markers
    if (markerArray.length > 0) {
        // Create bounds
        const bounds = L.featureGroup(markerArray).getBounds();
        
        // Fit map to bounds with padding
        map.fitBounds(bounds, {
            padding: [50, 50],
            maxZoom: 12
        });
    }
}
