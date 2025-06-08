import React from 'react';

const AlertPanel = ({ alerts }) => {
  const getSeverityColor = (severity) => {
    switch (severity.toLowerCase()) {
      case 'low':
        return 'bg-risk-low';
      case 'moderate':
        return 'bg-risk-moderate';
      case 'high':
        return 'bg-risk-high';
      case 'severe':
        return 'bg-risk-severe';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <h2 className="text-xl font-semibold mb-4">Active Alerts</h2>
      <div className="space-y-4">
        {alerts.map((alert, index) => (
          <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-lg">{alert.title}</h3>
                <p className="text-gray-600 mt-1">{alert.description}</p>
                <div className="mt-2 flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded text-sm text-white ${getSeverityColor(alert.severity)}`}>
                    {alert.severity}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(alert.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
              <button className="text-blue-600 hover:text-blue-800">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            {alert.location && (
              <div className="mt-2 text-sm text-gray-500">
                Location: {alert.location}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlertPanel; 