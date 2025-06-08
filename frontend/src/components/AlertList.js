import React, { useState, useEffect } from 'react';

const AlertList = ({ alerts, onAlertClick }) => {
  const [formattedAlerts, setFormattedAlerts] = useState([]);

  useEffect(() => {
    setFormattedAlerts(
      alerts.map(alert => ({
        ...alert,
        formattedTime: new Date(alert.timestamp).toLocaleString()
      }))
    );
  }, [alerts]);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-2">
      {formattedAlerts.map((alert) => (
        <div
          key={alert.id}
          className={`p-3 rounded-lg ${getSeverityColor(alert.severity)} cursor-pointer hover:opacity-80 transition-opacity`}
          onClick={() => onAlertClick(alert.id)}
        >
          <div className="font-semibold">{alert.title}</div>
          <div className="text-sm">{alert.description}</div>
          <div className="text-xs mt-1">
            Location: {alert.location}
          </div>
          <div className="text-xs">
            {alert.formattedTime}
          </div>
          <div className="text-xs mt-1 text-blue-600">
            Click to dispatch nearest available vehicle
          </div>
        </div>
      ))}
    </div>
  );
};

export default AlertList; 