import os
import sys
import traci
import sumolib
from typing import List, Dict, Any
import json
import asyncio
from datetime import datetime

class SUMOSimulation:
    def __init__(self, config_path: str):
        self.config_path = config_path
        self.simulation_running = False
        self.vehicles = {}
        self.disaster_zones = []

    def start_simulation(self):
        """Start the SUMO simulation"""
        if not self.simulation_running:
            # Start SUMO with the configuration file
            sumo_binary = sumolib.checkBinary('sumo')
            traci.start([sumo_binary, '-c', self.config_path])
            self.simulation_running = True

    def stop_simulation(self):
        """Stop the SUMO simulation"""
        if self.simulation_running:
            traci.close()
            self.simulation_running = False

    def add_vehicle(self, vehicle_id: str, vehicle_type: str, route_id: str):
        """Add a new vehicle to the simulation"""
        if not self.simulation_running:
            raise RuntimeError("Simulation is not running")
        
        traci.vehicle.add(vehicle_id, route_id, typeID=vehicle_type)
        self.vehicles[vehicle_id] = {
            "type": vehicle_type,
            "route": route_id,
            "position": [0, 0],
            "speed": 0
        }

    def update_vehicle_positions(self):
        """Update positions of all vehicles"""
        if not self.simulation_running:
            return []
        
        positions = []
        for vehicle_id in traci.vehicle.getIDList():
            position = traci.vehicle.getPosition(vehicle_id)
            speed = traci.vehicle.getSpeed(vehicle_id)
            
            positions.append({
                "id": vehicle_id,
                "type": self.vehicles[vehicle_id]["type"],
                "position": [position[0], position[1]],
                "speed": speed,
                "timestamp": datetime.now().isoformat()
            })
        
        return positions

    def add_disaster_zone(self, zone_id: str, coordinates: List[List[float]], 
                         disaster_type: str, severity: str):
        """Add a disaster zone to the simulation"""
        self.disaster_zones.append({
            "id": zone_id,
            "coordinates": coordinates,
            "type": disaster_type,
            "severity": severity,
            "timestamp": datetime.now().isoformat()
        })

    def get_disaster_zones(self):
        """Get all disaster zones"""
        return self.disaster_zones

    def step(self):
        """Advance the simulation by one step"""
        if not self.simulation_running:
            raise RuntimeError("Simulation is not running")
        
        traci.simulationStep()
        return self.update_vehicle_positions()

    def run_simulation(self, steps: int = 1000):
        """Run the simulation for a specified number of steps"""
        if not self.simulation_running:
            self.start_simulation()
        
        try:
            for _ in range(steps):
                positions = self.step()
                # Here you would typically send the positions to the frontend
                # through WebSocket or other means
                yield positions
        finally:
            self.stop_simulation()

# Example usage
if __name__ == "__main__":
    # Initialize simulation
    sim = SUMOSimulation("simulation.sumocfg")
    
    # Add some vehicles
    sim.add_vehicle("vehicle1", "oxygenated_vehicle", "route1")
    sim.add_vehicle("vehicle2", "amphibious_vehicle", "route2")
    
    # Add a disaster zone
    sim.add_disaster_zone(
        "flood1",
        [[0, 0], [0, 100], [100, 100], [100, 0]],
        "flood",
        "high"
    )
    
    # Run simulation
    for positions in sim.run_simulation(100):
        print(json.dumps(positions, indent=2)) 