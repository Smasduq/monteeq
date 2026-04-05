import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Link, useNavigate } from 'react-router-dom';
import { Zap } from 'lucide-react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { PageSkeleton } from './components/Skeleton';
import Home from './pages/Home';
import Flash from './pages/Flash';
import Posts from './pages/Posts';
import Upload from './pages/Upload';
import Chat from './pages/Chat';

import Login from './pages/Login';
import Signup from './pages/Signup';
import Watch from './pages/Watch';

import Search from './pages/Search';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import ManageVideos from './pages/ManageVideos';
import ManageContent from './pages/ManageContent';
import Achievements from './pages/Achievements';
import Notifications from './pages/Notifications';
import Insights from './pages/Insights';
import Performance from './pages/Performance';
import Onboarding from './pages/Onboarding';
import Partner from './pages/Partner';
import Challenges from './pages/Challenges';
import NotificationManager from './components/NotificationManager';

import Header from './components/Header';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import './index.css';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { token, loading, user } = useAuth();
  if (loading) return null;
  if (!token) return <Navigate to="/login" />;

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }
  return children;
};

import AdSidebar from './components/AdSidebar';

function AppContent() {
  const { user, logout, token } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isFlashPage = location.pathname === '/flash';
  const isHomePage = location.pathname === '/';
  const isChatPage = location.pathname.startsWith('/chat');
  const isPremiumOrAdmin = user?.is_premium || user?.role === 'admin';
  const isOnboardingPage = location.pathname === '/onboarding';
  const showAdColumn = !isHomePage && !isFlashPage && !isChatPage && !isOnboardingPage && user && !isPremiumOrAdmin;

  // Onboarding redirection
  React.useEffect(() => {
    if (token && user && !user.is_onboarded && location.pathname !== '/onboarding') {
      navigate('/onboarding');
    }
  }, [token, user, location.pathname]);

  return (
    <div className="app-container">
      <Header
        onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
        isMenuOpen={isMenuOpen}
      />
      <div className="app-layout">
        <Sidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
        <main className={`main-stage ${isFlashPage ? 'no-padding' : ''}`}>
          <div style={{
            display: 'flex',
            gap: '2rem',
            width: '100%',
            flexWrap: 'wrap'
          }}>
            <div style={{ flex: showAdColumn ? 2 : 1, minWidth: '300px' }}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/flash" element={<Flash />} />
                <Route path="/watch/:id" element={<Watch />} />
                <Route path="/search" element={<Search />} />
                <Route path="/profile/:username" element={<Profile />} />
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                <Route path="/posts" element={<Posts />} />
                <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
                <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
                <Route path="/manage" element={<ProtectedRoute><ManageContent /></ProtectedRoute>} />
                <Route path="/manage-videos" element={<ProtectedRoute><ManageContent /></ProtectedRoute>} />
                <Route path="/achievements" element={<ProtectedRoute><Achievements /></ProtectedRoute>} />
                <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
                <Route path="/insights" element={<ProtectedRoute><Insights /></ProtectedRoute>} />
                <Route path="/performance" element={<ProtectedRoute><Performance /></ProtectedRoute>} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
                <Route path="/partner" element={<Partner />} />
                <Route path="/challenges" element={<Challenges />} />

              </Routes>
            </div>
            {showAdColumn && (
              <div style={{ flex: 1, minWidth: '300px' }}>
                <AdSidebar />
              </div>
            )}
          </div>
        </main>
      </div>
      <BottomNav />

      {!token && (
        <Link to="/login" className="floating-auth-pill glass">
          <Zap size={20} fill="white" />
          Join Montage
        </Link>
      )}
    </div>
  );
}

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Router>
        <AuthProvider>
          <NotificationProvider>
            <NotificationManager />
            <AppContent />
          </NotificationProvider>
        </AuthProvider>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
