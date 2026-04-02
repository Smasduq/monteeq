import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Dashboard from './Dashboard';
import VideoApprovals from './VideoApprovals';
import StatsDetail from './StatsDetail';
import { NotificationProvider } from './context/NotificationContext';

function App() {
  const [token, setToken] = useState(localStorage.getItem('adminToken'));
  const [theme, setTheme] = useState(localStorage.getItem('adminTheme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('adminTheme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <NotificationProvider>
      <Router>
        <Routes>
          <Route path="/" element={!token ? <Login setToken={setToken} /> : <Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={token ? <Dashboard token={token} setToken={setToken} theme={theme} toggleTheme={toggleTheme} /> : <Navigate to="/" />} />
          <Route path="/approvals" element={token ? <VideoApprovals token={token} setToken={setToken} theme={theme} toggleTheme={toggleTheme} /> : <Navigate to="/" />} />
          <Route path="/stats/:metric" element={token ? <StatsDetail token={token} /> : <Navigate to="/" />} />
        </Routes>
      </Router>
    </NotificationProvider>
  );
}

export default App;
