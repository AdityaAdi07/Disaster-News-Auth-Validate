import React from 'react';

const VehicleList = ({ vehicles }) => {
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'on mission':
        return 'bg-blue-100 text-blue-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getBatteryColor = (level) => {
    if (level > 70) return 'text-green-600';
    if (level > 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-2">
      {vehicles.map((vehicle) => (
        <div
          key={vehicle.id}
          className="p-3 bg-white rounded-lg shadow"
        >
          <div className="font-semibold">{vehicle.type}</div>
          <div className={`text-sm ${getStatusColor(vehicle.status)} px-2 py-1 rounded-full inline-block mt-1`}>
            {vehicle.status}
          </div>
          <div className="text-sm mt-1">
            Location: {vehicle.currentLocation}
          </div>
          <div className="text-sm">
            Battery: <span className={getBatteryColor(vehicle.batteryLevel)}>{vehicle.batteryLevel.toFixed(1)}%</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default VehicleList; 