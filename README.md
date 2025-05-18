# Disaster Information Dashboard

A real-time, interactive dashboard to visualize and manage data related to natural disasters. The system ingests and displays social media posts, sensor readings, government alerts, and regional analytics.

## Features

- Real-time data updates via WebSockets
- MongoDB Atlas integration for data storage
- Live social media feed related to disasters
- IoT sensor data visualization
- Verified alerts display
- Interactive map with disaster markers
- Analytics dashboard with charts
- Admin panel for alert management

## Project Structure

```
disaster-dashboard/
├── frontend/
│   ├── css/
│   │   ├── style.css
│   │   └── components.css
│   ├── js/
│   │   ├── app.js
│   │   ├── websocket.js
│   │   ├── api.js
│   │   ├── components/
│   │   │   ├── liveFeed.js
│   │   │   ├── verifiedAlerts.js
│   │   │   ├── iotSensors.js
│   │   │   ├── map.js
│   │   │   ├── analytics.js
│   │   │   └── adminPanel.js
│   │   └── utils/
│   │       ├── charts.js
│   │       └── helpers.js
│   └── index.html
├── backend/
│   ├── server.js
│   ├── websocket.js
│   ├── routes/
│   │   ├── api.js
│   │   └── dashboard.js
│   ├── models/
│   │   ├── socialPosts.js
│   │   ├── iotSensorData.js
│   │   ├── disasterAlerts.js
│   │   └── regionsStats.js
│   ├── controllers/
│   │   ├── socialController.js
│   │   ├── sensorController.js
│   │   ├── alertController.js
│   │   └── statsController.js
│   └── config/
│       ├── db.js
│       └── constants.js
├── package.json
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account
- Modern web browser

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Configure MongoDB connection:
   - Create a `.env` file in the root directory
   - Add your MongoDB connection string: `MONGODB_URI=your_connection_string`

4. Start the server:
   ```
   npm start
   ```
5. Open your browser and navigate to `http://localhost:3000`

## Technologies Used

- Frontend: HTML, CSS, JavaScript (Vanilla)
- Backend: Node.js, Express
- Database: MongoDB Atlas
- Real-time Communication: WebSockets
- Map: Leaflet.js
- Charts: Custom Canvas/SVG implementation

## API Endpoints

- `GET /api/dashboard` - Get all current data
- `PUT /api/alerts/:id/verify` - Verify/unverify an alert
- `DELETE /api/alerts/:id` - Delete an alert

## WebSocket Channels

- `social_update` - Updated social posts
- `sensor_update` - IoT sensor data changes
- `alert_update` - Disaster alert changes
- `analytics_update` - Updated regional statistics
