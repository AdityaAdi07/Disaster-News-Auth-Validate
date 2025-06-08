import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Layout from '../components/Layout';
import { findShortestPath, optimizePath } from '../utils/pathfinding';

// Dynamically import components with SSR disabled
const MapViewer = dynamic(() => import('../components/MapViewer'), {
  ssr: false,
  loading: () => <div>Loading map...</div>
});

const AlertList = dynamic(() => import('../components/AlertList'), {
  ssr: false,
  loading: () => <div>Loading alerts...</div>
});

const VehicleList = dynamic(() => import('../components/VehicleList'), {
  ssr: false,
  loading: () => <div>Loading vehicles...</div>
});

// Define locations for better organization
const LOCATIONS = {
  hospitals: [
    { name: 'Manila Medical Center', coordinates: [14.5995, 120.9842] },
    { name: 'St. Luke\'s Medical Center', coordinates: [14.5895, 120.9942] },
    { name: 'Philippine General Hospital', coordinates: [14.5795, 120.9742] }
  ],
  fireStations: [
    { name: 'Manila Fire Station', coordinates: [14.6095, 120.9842] },
    { name: 'Makati Fire Station', coordinates: [14.5895, 121.0142] },
    { name: 'Quezon City Fire Station', coordinates: [14.6295, 121.0242] }
  ],
  disasterAreas: [
    { name: 'Flooded Area', coordinates: [14.5795, 120.9842] },
    { name: 'Fire Incident', coordinates: [14.5995, 121.0042] }
  ],
  // Define road intersections for route planning
  intersections: [
    [14.5995, 120.9842], // Manila Medical Center
    [14.5895, 120.9942], // St. Luke's
    [14.5795, 120.9742], // PGH
    [14.6095, 120.9842], // Manila Fire Station
    [14.5895, 121.0142], // Makati Fire Station
    [14.6295, 121.0242], // Quezon City Fire Station
    [14.5795, 120.9842], // Flooded Area
    [14.5995, 121.0042], // Fire Incident
    [14.5945, 120.9892], // Additional intersection
    [14.5845, 120.9992], // Additional intersection
    [14.6045, 121.0092], // Additional intersection
  ]
};

// Helper function to find the nearest intersection
const findNearestIntersection = (point) => {
  return LOCATIONS.intersections.reduce((nearest, current) => {
    const nearestDist = Math.sqrt(
      Math.pow(nearest[0] - point[0], 2) + Math.pow(nearest[1] - point[1], 2)
    );
    const currentDist = Math.sqrt(
      Math.pow(current[0] - point[0], 2) + Math.pow(current[1] - point[1], 2)
    );
    return currentDist < nearestDist ? current : nearest;
  });
};

// Helper function to find a route through intersections
const findRoute = (start, end) => {
  const startIntersection = findNearestIntersection(start);
  const endIntersection = findNearestIntersection(end);
  
  // Simple route through nearest intersections
  return [start, startIntersection, endIntersection, end];
};

// Helper function to calculate distance between two points
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Sample data for testing
const sampleRiskZones = [
  {
    coordinates: LOCATIONS.disasterAreas[0].coordinates,
    color: '#0000FF',
    description: 'High flood risk area near residential district'
  },
  {
    coordinates: LOCATIONS.disasterAreas[1].coordinates,
    color: '#FF0000',
    description: 'Fire risk zone near commercial area'
  }
];

const sampleVehicles = [
  {
    id: 'v1',
    type: 'Ambulance',
    position: LOCATIONS.hospitals[0].coordinates,
    status: 'Available',
    currentLocation: LOCATIONS.hospitals[0].name,
    batteryLevel: 85,
    speed: 0,
    maxSpeed: 120,
    routeHistory: [],
    assignedAlert: null,
    currentRoute: null,
    currentRouteIndex: 0
  },
  {
    id: 'v2',
    type: 'Fire Truck',
    position: LOCATIONS.fireStations[0].coordinates,
    status: 'Available',
    currentLocation: LOCATIONS.fireStations[0].name,
    batteryLevel: 90,
    speed: 0,
    maxSpeed: 100,
    routeHistory: [],
    assignedAlert: null,
    currentRoute: null,
    currentRouteIndex: 0
  },
  {
    id: 'v3',
    type: 'Rescue Vehicle',
    position: LOCATIONS.hospitals[1].coordinates,
    status: 'Available',
    currentLocation: LOCATIONS.hospitals[1].name,
    batteryLevel: 75,
    speed: 0,
    maxSpeed: 110,
    routeHistory: [],
    assignedAlert: null,
    currentRoute: null,
    currentRouteIndex: 0
  }
];

const sampleAlerts = [
  {
    id: 'a1',
    title: 'Major Flooding',
    description: 'Severe flooding reported in residential area',
    severity: 'high',
    timestamp: new Date().toISOString(),
    location: LOCATIONS.disasterAreas[0].name,
    coordinates: LOCATIONS.disasterAreas[0].coordinates
  },
  {
    id: 'a2',
    title: 'Building Fire',
    description: 'Large fire in commercial building',
    severity: 'high',
    timestamp: new Date().toISOString(),
    location: LOCATIONS.disasterAreas[1].name,
    coordinates: LOCATIONS.disasterAreas[1].coordinates
  }
];

const sampleDisasterOverlays = [
  {
    type: 'flood',
    coordinates: [
      [14.5795, 120.9842],
      [14.5795, 120.9942],
      [14.5895, 120.9942],
      [14.5895, 120.9842]
    ]
  },
  {
    type: 'fire',
    coordinates: [
      [14.5995, 121.0042],
      [14.5995, 121.0142],
      [14.6095, 121.0142],
      [14.6095, 121.0042]
    ]
  }
];

const Dashboard = () => {
  const [vehicles, setVehicles] = useState(() => {
    console.log('Initializing vehicles with positions:', LOCATIONS);
    return [
      {
        id: 'ambulance-1',
        type: 'Ambulance',
        position: [LOCATIONS.hospitals[0].coordinates[0], LOCATIONS.hospitals[0].coordinates[1]],
        status: 'Available',
        batteryLevel: 100,
        speed: 0,
        maxSpeed: 0.0001,
        currentLocation: 'Central Hospital',
        assignedAlert: null,
        routeHistory: [],
        currentRoute: [],
        currentRouteIndex: 0
      },
      {
        id: 'fire-truck-1',
        type: 'Fire Truck',
        position: [LOCATIONS.fireStations[0].coordinates[0], LOCATIONS.fireStations[0].coordinates[1]],
        status: 'Available',
        batteryLevel: 100,
        speed: 0,
        maxSpeed: 0.00008,
        currentLocation: 'Main Fire Station',
        assignedAlert: null,
        routeHistory: [],
        currentRoute: [],
        currentRouteIndex: 0
      },
      {
        id: 'rescue-1',
        type: 'Rescue Vehicle',
        position: [LOCATIONS.hospitals[1].coordinates[0], LOCATIONS.hospitals[1].coordinates[1]],
        status: 'Available',
        batteryLevel: 100,
        speed: 0,
        maxSpeed: 0.00006,
        currentLocation: 'North Hospital',
        assignedAlert: null,
        routeHistory: [],
        currentRoute: [],
        currentRouteIndex: 0
      }
    ];
  });
  const [alerts, setAlerts] = useState(sampleAlerts);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isClient, setIsClient] = useState(false);

  // Set client-side flag
  useEffect(() => {
    setIsClient(true);
    console.log('Dashboard mounted, initial vehicles:', vehicles);
  }, []);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Auto-assign vehicles to alerts
  useEffect(() => {
    const autoAssignVehicles = () => {
      console.log('Auto-assigning vehicles, current state:', vehicles);
      
      setVehicles(prevVehicles => {
        const availableVehicles = prevVehicles.filter(v => v.status === 'Available');
        const unassignedAlerts = alerts.filter(alert => 
          !prevVehicles.some(v => v.assignedAlert?.id === alert.id)
        );

        console.log('Available vehicles:', availableVehicles);
        console.log('Unassigned alerts:', unassignedAlerts);

        if (availableVehicles.length === 0 || unassignedAlerts.length === 0) {
          return prevVehicles;
        }

        const updatedVehicles = prevVehicles.map(vehicle => {
          if (vehicle.status !== 'Available') return vehicle;

          // Find the most appropriate alert for this vehicle type
          const matchingAlert = unassignedAlerts.find(alert => {
            if (vehicle.type === 'Ambulance') return true; // Ambulances can handle any emergency
            if (vehicle.type === 'Fire Truck') return alert.title.includes('Fire');
            if (vehicle.type === 'Rescue Vehicle') return alert.title.includes('Flood');
            return false;
          });

          if (matchingAlert) {
            const route = findRoute(vehicle.position, matchingAlert.coordinates);
            console.log('Assigning vehicle', vehicle.id, 'to alert', matchingAlert.id, 'with route:', route);
            
            return {
              ...vehicle,
              status: 'En Route',
              assignedAlert: matchingAlert,
              speed: vehicle.maxSpeed,
              currentRoute: route,
              currentRouteIndex: 0
            };
          }

          return vehicle;
        });

        console.log('Updated vehicles after assignment:', updatedVehicles);
        return updatedVehicles;
      });
    };

    // Initial assignment
    autoAssignVehicles();

    const interval = setInterval(autoAssignVehicles, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, [alerts]);

  // Simulate vehicle movement
  useEffect(() => {
    const moveVehicles = () => {
      setVehicles(prevVehicles => {
        return prevVehicles.map(vehicle => {
          // Skip if vehicle is available
          if (vehicle.status === 'Available') {
            return {
              ...vehicle,
              speed: 0,
              routeHistory: [],
              currentRoute: [],
              currentRouteIndex: 0
            };
          }

          // If no route, calculate one
          if (!vehicle.currentRoute || vehicle.currentRoute.length === 0) {
            const route = findShortestPath(
              vehicle.position,
              vehicle.assignedAlert.coordinates,
              LOCATIONS.intersections,
              LOCATIONS.roads
            );
            
            // Optimize path for smoother movement
            const optimizedRoute = optimizePath(route);
            console.log('Calculated new route for vehicle', vehicle.id, ':', optimizedRoute);
            
            return {
              ...vehicle,
              currentRoute: optimizedRoute,
              currentRouteIndex: 0
            };
          }

          // Get current target point
          const targetPoint = vehicle.currentRoute[vehicle.currentRouteIndex];
          const [currentLat, currentLon] = vehicle.position;
          const [targetLat, targetLon] = targetPoint;

          // Calculate distance to current target
          const distance = Math.sqrt(
            Math.pow(targetLat - currentLat, 2) + Math.pow(targetLon - currentLon, 2)
          );

          // If reached current target point
          if (distance < 0.0001) {
            // Move to next point in route
            const nextIndex = vehicle.currentRouteIndex + 1;
            
            // If reached final destination
            if (nextIndex >= vehicle.currentRoute.length) {
              return {
                ...vehicle,
                status: 'Available',
                speed: 0,
                assignedAlert: null,
                routeHistory: [],
                currentRoute: [],
                currentRouteIndex: 0
              };
            }

            return {
              ...vehicle,
              currentRouteIndex: nextIndex
            };
          }

          // Calculate direction vector
          const dirLat = (targetLat - currentLat) / distance;
          const dirLon = (targetLon - currentLon) / distance;

          // Gradually increase speed up to max speed
          const currentSpeed = vehicle.speed || 0;
          const maxSpeed = vehicle.maxSpeed;
          const acceleration = 0.1; // Slower acceleration
          const newSpeed = Math.min(currentSpeed + acceleration, maxSpeed);

          // Move at current speed (adjusted scale factor for better movement)
          const movement = newSpeed * 0.00001; // Increased scale factor
          const newLat = currentLat + dirLat * movement;
          const newLon = currentLon + dirLon * movement;

          // Update route history
          const newRouteHistory = [...vehicle.routeHistory, [newLat, newLon]];

          // Keep only last 200 points in route history for longer trails
          if (newRouteHistory.length > 200) {
            newRouteHistory.shift();
          }

          return {
            ...vehicle,
            position: [newLat, newLon],
            speed: newSpeed,
            routeHistory: newRouteHistory,
            batteryLevel: Math.max(0, vehicle.batteryLevel - 0.01) // Slower battery drain
          };
        });
      });
    };

    const interval = setInterval(moveVehicles, 100); // Increased update interval for smoother movement
    return () => clearInterval(interval);
  }, []);

  const handleAlertClick = (alertId) => {
    console.log('Alert clicked:', alertId);
    const alert = alerts.find(a => a.id === alertId);
    if (!alert) return;

    setVehicles(prevVehicles => {
      // Find the closest available vehicle
      const availableVehicles = prevVehicles.filter(v => v.status === 'Available');
      if (availableVehicles.length === 0) return prevVehicles;

      const [alertLat, alertLon] = alert.coordinates;
      const closestVehicle = availableVehicles.reduce((closest, current) => {
        const [closestLat, closestLon] = closest.position;
        const [currentLat, currentLon] = current.position;
        
        const closestDist = Math.sqrt(
          Math.pow(alertLat - closestLat, 2) + Math.pow(alertLon - closestLon, 2)
        );
        const currentDist = Math.sqrt(
          Math.pow(alertLat - currentLat, 2) + Math.pow(alertLon - currentLon, 2)
        );
        
        return currentDist < closestDist ? current : closest;
      });

      const route = findRoute(closestVehicle.position, alert.coordinates);
      console.log('Assigning closest vehicle', closestVehicle.id, 'to alert', alertId, 'with route:', route);

      return prevVehicles.map(vehicle => {
        if (vehicle.id === closestVehicle.id) {
          return {
            ...vehicle,
            status: 'En Route',
            assignedAlert: alert,
            speed: vehicle.maxSpeed,
            currentRoute: route,
            currentRouteIndex: 0
          };
        }
        return vehicle;
      });
    });
  };

  if (!isClient) {
    return <div>Loading...</div>;
  }

  return (
    <Layout>
      <div className="flex h-full">
        <div className="w-1/4 p-4 border-r">
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-2">Active Alerts</h2>
            <AlertList alerts={alerts} onAlertClick={handleAlertClick} />
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-2">Vehicles</h2>
            <VehicleList vehicles={vehicles} />
          </div>
        </div>
        <div className="w-3/4">
          <MapViewer
            riskZones={sampleRiskZones}
            vehicles={vehicles}
            disasterOverlays={sampleDisasterOverlays}
            paths={vehicles
              .filter(v => v.assignedAlert)
              .map(v => ({
                vehicleId: v.id,
                from: v.position,
                to: v.assignedAlert.coordinates,
                vehicle: v,
                route: v.currentRoute
              }))}
          />
        </div>
      </div>
      {isClient && (
        <div className="text-sm text-gray-500">
          {currentTime.toLocaleString()}
        </div>
      )}
    </Layout>
  );
};

export default Dashboard; 