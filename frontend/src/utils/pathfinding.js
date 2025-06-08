import dijkstra from 'dijkstrajs';
import * as turf from '@turf/turf';
import _ from 'lodash';

// Road network graph
const createRoadNetwork = (intersections, roads) => {
  const graph = {};
  
  // Initialize graph with intersections as nodes
  intersections.forEach(intersection => {
    const [lat, lon] = intersection;
    const key = `${lat},${lon}`;
    graph[key] = {};
  });

  // Add edges (roads) between intersections
  roads.forEach(road => {
    const [start, end] = road;
    const startKey = `${start[0]},${start[1]}`;
    const endKey = `${end[0]},${end[1]}`;
    
    // Calculate distance using Haversine formula
    const distance = turf.distance(
      turf.point([start[1], start[0]]),
      turf.point([end[1], end[0]]),
      { units: 'kilometers' }
    );

    // Add bidirectional edges
    graph[startKey][endKey] = distance;
    graph[endKey][startKey] = distance;
  });

  return graph;
};

// Find shortest path using Dijkstra's algorithm
const findShortestPath = (start, end, intersections, roads) => {
  // Create road network graph
  const graph = createRoadNetwork(intersections, roads);

  // Find closest intersections to start and end points
  const findClosestIntersection = (point) => {
    return intersections.reduce((closest, current) => {
      const closestDist = turf.distance(
        turf.point([point[1], point[0]]),
        turf.point([closest[1], closest[0]]),
        { units: 'kilometers' }
      );
      const currentDist = turf.distance(
        turf.point([point[1], point[0]]),
        turf.point([current[1], current[0]]),
        { units: 'kilometers' }
      );
      return currentDist < closestDist ? current : closest;
    });
  };

  const startIntersection = findClosestIntersection(start);
  const endIntersection = findClosestIntersection(end);

  // If start and end are close to the same intersection, go directly
  if (_.isEqual(startIntersection, endIntersection)) {
    return [start, end];
  }

  // Find path through intersections
  const startKey = `${startIntersection[0]},${startIntersection[1]}`;
  const endKey = `${endIntersection[0]},${endIntersection[1]}`;

  try {
    const path = dijkstra.find_path(graph, startKey, endKey);
    
    // Convert path keys back to coordinates
    const coordinates = path.map(key => {
      const [lat, lon] = key.split(',').map(Number);
      return [lat, lon];
    });

    // Add start and end points
    return [start, ...coordinates, end];
  } catch (error) {
    console.error('Error finding path:', error);
    // Fallback to direct path if no valid path found
    return [start, end];
  }
};

// Optimize path for smoother vehicle movement
const optimizePath = (path) => {
  if (path.length <= 2) return path;

  const optimized = [path[0]];
  
  for (let i = 1; i < path.length - 1; i++) {
    const prev = path[i - 1];
    const current = path[i];
    const next = path[i + 1];

    // Calculate angle between segments
    const angle1 = Math.atan2(current[1] - prev[1], current[0] - prev[0]);
    const angle2 = Math.atan2(next[1] - current[1], next[0] - current[0]);
    const angleDiff = Math.abs(angle1 - angle2);

    // If angle is too sharp, add intermediate points
    if (angleDiff > Math.PI / 4) {
      const midPoint = [
        (current[0] + next[0]) / 2,
        (current[1] + next[1]) / 2
      ];
      optimized.push(midPoint);
    }
    
    optimized.push(current);
  }

  optimized.push(path[path.length - 1]);
  return optimized;
};

export { findShortestPath, optimizePath }; 