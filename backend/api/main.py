from fastapi import FastAPI, WebSocket, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any
import json
import asyncio
from datetime import datetime

app = FastAPI(title="ResQ AI API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Store active WebSocket connections
active_connections: List[WebSocket] = []

# Store current state
current_state = {
    "risk_zones": [],
    "vehicle_positions": [],
    "disaster_overlays": []
}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    active_connections.append(websocket)
    try:
        # Send initial state
        await websocket.send_json({
            "type": "initial_state",
            "payload": current_state
        })
        
        while True:
            data = await websocket.receive_text()
            # Handle incoming messages if needed
            pass
    except Exception as e:
        print(f"WebSocket error: {str(e)}")
    finally:
        active_connections.remove(websocket)

@app.get("/api/risk-zones")
async def get_risk_zones():
    return current_state["risk_zones"]

@app.get("/api/vehicles")
async def get_vehicles():
    return current_state["vehicle_positions"]

@app.get("/api/disasters")
async def get_disasters():
    return current_state["disaster_overlays"]

@app.post("/api/risk-zones")
async def update_risk_zones(zones: List[Dict[str, Any]]):
    current_state["risk_zones"] = zones
    await broadcast_update("risk_zones", zones)
    return {"status": "success"}

@app.post("/api/vehicles")
async def update_vehicles(vehicles: List[Dict[str, Any]]):
    current_state["vehicle_positions"] = vehicles
    await broadcast_update("vehicle_positions", vehicles)
    return {"status": "success"}

@app.post("/api/disasters")
async def update_disasters(disasters: List[Dict[str, Any]]):
    current_state["disaster_overlays"] = disasters
    await broadcast_update("disaster_overlays", disasters)
    return {"status": "success"}

async def broadcast_update(update_type: str, data: Any):
    """Broadcast updates to all connected WebSocket clients"""
    for connection in active_connections:
        try:
            await connection.send_json({
                "type": update_type,
                "payload": data
            })
        except Exception as e:
            print(f"Error broadcasting to client: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 