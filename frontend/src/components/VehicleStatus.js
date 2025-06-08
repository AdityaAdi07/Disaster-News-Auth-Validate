import React from 'react';

const VehicleStatus = ({ vehicles }) => {
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-500';
      case 'en route':
        return 'bg-blue-500';
      case 'maintenance':
        return 'bg-yellow-500';
      case 'offline':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getVehicleIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'oxygenated_vehicle':
        return '🚑';
      case 'amphibious_vehicle':
        return '🚢';
      case 'snake_bot':
        return '🤖';
      default:
        return '🚗';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <h2 className="text-xl font-semibold mb-4">Vehicle Status</h2>
      <div className="space-y-4">
        {vehicles.map((vehicle, index) => (
          <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{getVehicleIcon(vehicle.type)}</span>
                <div>
                  <h3 className="font-medium">{vehicle.id}</h3>
                  <p className="text-sm text-gray-600">Type: {vehicle.type}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded text-sm text-white ${getStatusColor(vehicle.status)}`}>
                  {vehicle.status}
                </span>
                <button className="text-blue-600 hover:text-blue-800">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
            {vehicle.current_location && (
              <div className="mt-2 text-sm text-gray-500">
                Location: {vehicle.current_location}
              </div>
            )}
            {vehicle.battery_level && (
              <div className="mt-2">
                <div className="flex justify-between text-sm mb-1">
                  <span>Battery Level</span>
                  <span>{vehicle.battery_level}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${vehicle.battery_level}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default VehicleStatus; 