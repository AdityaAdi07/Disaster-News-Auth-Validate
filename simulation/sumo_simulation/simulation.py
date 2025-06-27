import os
import sys
# Set SUMO_HOME directly in the script
# IMPORTANT: Make sure this path is correct for your SUMO installation!
os.environ['SUMO_HOME'] = "C:\\Program Files (x86)\\Eclipse\\Sumo"

import traci
import json
import asyncio
import websockets
from datetime import datetime

# Removed: No longer need to check SUMO_HOME as it's set above
# if 'SUMO_HOME' not in os.environ:
#     sys.exit("Please declare environment variable 'SUMO_HOME'")

# SUMO configuration
sumo_binary = os.path.join(os.environ['SUMO_HOME'], 'bin', 'sumo')
sumo_cmd = [sumo_binary, "-c", "simple.sumocfg"]

# WebSocket server settings
WS_HOST = "localhost"
WS_PORT = 8000

async def send_vehicle_positions(websocket):
    """Send vehicle positions to connected clients"""
    print("Connected to WebSocket server")
    while True:
        try:
            # Get all vehicle IDs
            vehicle_ids = traci.vehicle.getIDList()
            
            # Create a list of vehicle positions
            vehicles = []
            for veh_id in vehicle_ids:
                pos = traci.vehicle.getPosition(veh_id)
                angle = traci.vehicle.getAngle(veh_id)
                speed = traci.vehicle.getSpeed(veh_id)
                
                vehicle_data = {
                    "id": veh_id,
                    "x": pos[0],
                    "y": pos[1],
                    "angle": angle,
                    "speed": speed,
                    "timestamp": datetime.now().isoformat()
                }
                vehicles.append(vehicle_data)
            
            # Send vehicle positions to all connected clients
            if vehicles:
                await websocket.send(json.dumps(vehicles))
                print(f"Sent positions for {len(vehicles)} vehicles")
            
            # Advance simulation
            traci.simulationStep()
            await asyncio.sleep(0.1)  # 100ms delay
        except Exception as e:
            print(f"Error: {e}")
            break

async def main():
    # Start SUMO
    print("Starting SUMO simulation...")
    traci.start(sumo_cmd)
    
    # Connect to WebSocket server
    uri = f"ws://{WS_HOST}:{WS_PORT}/ws"
    print(f"Connecting to WebSocket server at {uri}")
    
    try:
        async with websockets.connect(uri) as websocket:
            print("Connected to WebSocket server")
            await send_vehicle_positions(websocket)
    except Exception as e:
        print(f"Failed to connect to WebSocket server: {e}")
    finally:
        traci.close()
        print("SUMO simulation closed")

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("Simulation stopped by user")
    finally:
        traci.close() 