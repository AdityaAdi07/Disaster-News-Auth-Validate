from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
import asyncio
import json
import websockets
import uvicorn

app = FastAPI()

# Mount static files (your frontend HTML, CSS, JS)
app.mount("/static", StaticFiles(directory="../frontend"), name="static")

# Enable CORS
origins = [
    "http://localhost",
    "http://localhost:8000",
    "http://127.0.0.1",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Store connected clients
connected_clients = set()

@app.get("/", response_class=HTMLResponse)
async def read_root():
    # Serve index.html directly from the static files
    with open("../frontend/index.html", "r") as f:
        html_content = f.read()
    return HTMLResponse(content=html_content)

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    connected_clients.add(websocket)
    try:
        while True:
            # Forward messages from SUMO simulation to all connected clients
            data = await websocket.receive_text()
            for client in connected_clients:
                if client != websocket:  # Don't send back to the sender
                    await client.send_text(data)
    except websockets.exceptions.ConnectionClosed:
        connected_clients.remove(websocket)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000) 