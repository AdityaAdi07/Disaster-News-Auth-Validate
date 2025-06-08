import React from 'react';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-blue-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">ResQ AI Dashboard</h1>
            <nav className="space-x-4">
              <button className="px-4 py-2 rounded bg-blue-700 hover:bg-blue-800 transition-colors">
                Live Alerts
              </button>
              <button className="px-4 py-2 rounded bg-blue-700 hover:bg-blue-800 transition-colors">
                Vehicle Status
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-4">
        <div className="container mx-auto px-4 text-center">
          <p>© 2024 ResQ AI - Disaster Response System</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout; 