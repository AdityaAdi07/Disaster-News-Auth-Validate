import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Create a client-side only version of the map component
const MapViewer = ({ riskZones, vehicles, disasterOverlays, paths }) => {
  const mapRef = useRef(null);
  const markersRef = useRef({});
  const pathsRef = useRef({});
  const routePolylinesRef = useRef({});
  const trailPolylinesRef = useRef({});

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) {
      console.log('Initializing map...');
      mapRef.current = L.map('map').setView([14.5995, 120.9842], 13);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapRef.current);

      // Add risk zones
      riskZones.forEach(zone => {
        L.circle(zone.coordinates, {
          radius: 500,
          color: zone.color,
          fillColor: zone.color,
          fillOpacity: 0.3
        }).addTo(mapRef.current).bindPopup(zone.description);
      });

      // Add disaster overlays
      disasterOverlays.forEach(overlay => {
        L.polygon(overlay.coordinates, {
          color: overlay.type === 'flood' ? '#0000FF' : '#FF0000',
          fillColor: overlay.type === 'flood' ? '#0000FF' : '#FF0000',
          fillOpacity: 0.3
        }).addTo(mapRef.current);
      });

      console.log('Map initialized');
    }
  }, [riskZones, disasterOverlays]);

  // Update vehicles and paths
  useEffect(() => {
    if (!mapRef.current) {
      console.log('Map not initialized yet');
      return;
    }

    console.log('Updating vehicle markers and paths:', vehicles.length, 'vehicles');

    // Update vehicle markers
    vehicles.forEach(vehicle => {
      console.log('Processing vehicle:', vehicle.id, vehicle.position);
      
      // Create or update vehicle marker
      if (!markersRef.current[vehicle.id]) {
        console.log('Creating new marker for vehicle:', vehicle.id);
        
        // Create vehicle icon based on type
        const icon = L.divIcon({
          className: 'vehicle-icon',
          html: `
            <div style="
              width: 50px;
              height: 50px;
              background-color: ${vehicle.type === 'Ambulance' ? '#FF0000' : 
                               vehicle.type === 'Fire Truck' ? '#FFA500' : '#0000FF'};
              border: 4px solid #00FF00;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
              font-size: 24px;
              box-shadow: 0 0 10px rgba(0,0,0,0.5);
              text-shadow: 2px 2px 2px rgba(0,0,0,0.5);
            ">
              ${vehicle.type === 'Ambulance' ? '🚑' : 
                vehicle.type === 'Fire Truck' ? '🚒' : '🚓'}
            </div>
          `,
          iconSize: [50, 50],
          iconAnchor: [25, 25]
        });

        // Create marker with higher z-index
        const marker = L.marker(vehicle.position, { 
          icon,
          zIndexOffset: 1000 // Ensure vehicles are above other markers
        }).addTo(mapRef.current);

        // Create popup with vehicle info
        const popup = L.popup({
          maxWidth: 300,
          className: 'vehicle-popup'
        }).setContent(`
          <div style="padding: 10px;">
            <h3 style="margin: 0 0 10px 0; color: #333;">${vehicle.type}</h3>
            <p style="margin: 5px 0; color: #666;">
              <strong>Status:</strong> 
              <span style="color: ${vehicle.status === 'Available' ? '#4CAF50' : '#FFA500'}">
                ${vehicle.status}
              </span>
            </p>
            <p style="margin: 5px 0; color: #666;">
              <strong>Battery:</strong> 
              <span style="color: ${vehicle.batteryLevel > 20 ? '#4CAF50' : '#FF0000'}">
                ${vehicle.batteryLevel.toFixed(1)}%
              </span>
            </p>
            <p style="margin: 5px 0; color: #666;">
              <strong>Speed:</strong> ${vehicle.speed.toFixed(1)} km/h
            </p>
            <p style="margin: 5px 0; color: #666;">
              <strong>Location:</strong><br>
              Lat: ${vehicle.position[0].toFixed(6)}<br>
              Lon: ${vehicle.position[1].toFixed(6)}
            </p>
            ${vehicle.assignedAlert ? `
              <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #ddd;">
                <p style="margin: 5px 0; color: #666;">
                  <strong>Assigned Alert:</strong><br>
                  ${vehicle.assignedAlert.type} - ${vehicle.assignedAlert.severity}
                </p>
              </div>
            ` : ''}
          </div>
        `);

        marker.bindPopup(popup);
        markersRef.current[vehicle.id] = marker;
      } else {
        // Update existing marker
        const marker = markersRef.current[vehicle.id];
        marker.setLatLng(vehicle.position);
        
        // Update popup content
        const popup = marker.getPopup();
        popup.setContent(`
          <div style="padding: 10px;">
            <h3 style="margin: 0 0 10px 0; color: #333;">${vehicle.type}</h3>
            <p style="margin: 5px 0; color: #666;">
              <strong>Status:</strong> 
              <span style="color: ${vehicle.status === 'Available' ? '#4CAF50' : '#FFA500'}">
                ${vehicle.status}
              </span>
            </p>
            <p style="margin: 5px 0; color: #666;">
              <strong>Battery:</strong> 
              <span style="color: ${vehicle.batteryLevel > 20 ? '#4CAF50' : '#FF0000'}">
                ${vehicle.batteryLevel.toFixed(1)}%
              </span>
            </p>
            <p style="margin: 5px 0; color: #666;">
              <strong>Speed:</strong> ${vehicle.speed.toFixed(1)} km/h
            </p>
            <p style="margin: 5px 0; color: #666;">
              <strong>Location:</strong><br>
              Lat: ${vehicle.position[0].toFixed(6)}<br>
              Lon: ${vehicle.position[1].toFixed(6)}
            </p>
            ${vehicle.assignedAlert ? `
              <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #ddd;">
                <p style="margin: 5px 0; color: #666;">
                  <strong>Assigned Alert:</strong><br>
                  ${vehicle.assignedAlert.type} - ${vehicle.assignedAlert.severity}
                </p>
              </div>
            ` : ''}
          </div>
        `);
      }

      // Create or update route and trail
      if (vehicle.currentRoute && vehicle.currentRoute.length > 0) {
        // Create route polyline (planned path)
        if (!routePolylinesRef.current[vehicle.id]) {
          const routePolyline = L.polyline(vehicle.currentRoute, {
            color: '#FF0000',
            weight: 8,
            opacity: 0.8,
            lineJoin: 'round',
            dashArray: '10, 10',
            lineCap: 'round'
          }).addTo(mapRef.current);
          routePolylinesRef.current[vehicle.id] = routePolyline;
        } else {
          routePolylinesRef.current[vehicle.id].setLatLngs(vehicle.currentRoute);
        }

        // Create trail polyline (actual path)
        if (!trailPolylinesRef.current[vehicle.id]) {
          const trailColor = vehicle.type === 'Ambulance' ? '#FF0000' :
                            vehicle.type === 'Fire Truck' ? '#FFA500' : '#0000FF';
          const trailPolyline = L.polyline(vehicle.routeHistory, {
            color: trailColor,
            weight: 6,
            opacity: 0.6,
            lineJoin: 'round',
            lineCap: 'round'
          }).addTo(mapRef.current);
          trailPolylinesRef.current[vehicle.id] = trailPolyline;
        } else {
          trailPolylinesRef.current[vehicle.id].setLatLngs(vehicle.routeHistory);
        }
      }
    });

    // Remove old markers and paths
    Object.keys(markersRef.current).forEach(id => {
      if (!vehicles.find(v => v.id === id)) {
        mapRef.current.removeLayer(markersRef.current[id]);
        delete markersRef.current[id];
      }
    });

    Object.keys(routePolylinesRef.current).forEach(id => {
      if (!vehicles.find(v => v.id === id)) {
        mapRef.current.removeLayer(routePolylinesRef.current[id]);
        delete routePolylinesRef.current[id];
      }
    });

    Object.keys(trailPolylinesRef.current).forEach(id => {
      if (!vehicles.find(v => v.id === id)) {
        mapRef.current.removeLayer(trailPolylinesRef.current[id]);
        delete trailPolylinesRef.current[id];
      }
    });
  }, [vehicles, paths]);

  return <div id="map" style={{ height: '100%', width: '100%' }} />;
};

// Export a client-side only version of the component
export default MapViewer; 