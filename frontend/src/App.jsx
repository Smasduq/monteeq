import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Link, useNavigate } from 'react-router-dom';
import { Zap, Crown } from 'lucide-react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { PageSkeleton } from './components/Skeleton';

const Home = React.lazy(() => import('./pages/Home'));
const Landing = React.lazy(() => import('./pages/Landing'));
const Flash = React.lazy(() => import('./pages/Flash'));
const Posts = React.lazy(() => import('./pages/Posts'));
const Upload = React.lazy(() => import('./pages/Upload'));
const Chat = React.lazy(() => import('./pages/Chat'));

const Login = React.lazy(() => import('./pages/Login'));
const Signup = React.lazy(() => import('./pages/Signup'));
const ForgotPassword = React.lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = React.lazy(() => import('./pages/ResetPassword'));
const Watch = React.lazy(() => import('./pages/Watch'));
const Verify = React.lazy(() => import('./pages/Verify'));

const Search = React.lazy(() => import('./pages/Search'));
const Settings = React.lazy(() => import('./pages/Settings'));
const Profile = React.lazy(() => import('./pages/Profile'));
const ManageContent = React.lazy(() => import('./pages/ManageContent'));
const Achievements = React.lazy(() => import('./pages/Achievements'));
const Notifications = React.lazy(() => import('./pages/Notifications'));
const Insights = React.lazy(() => import('./pages/Insights'));
const Monetization = React.lazy(() => import('./pages/Monetization'));
const Transactions = React.lazy(() => import('./pages/Transactions'));
const Performance = React.lazy(() => import('./pages/Performance'));
const Onboarding = React.lazy(() => import('./pages/Onboarding'));
const PartnerV2 = React.lazy(() => import('./pages/PartnerV2'));
const Challenges = React.lazy(() => import('./pages/Challenges'));
const About = React.lazy(() => import('./pages/About'));
const JoinPro = React.lazy(() => import('./pages/JoinProV2'));
const AdminPortal = React.lazy(() => import('./pages/AdminPortal'));
const Privacy = React.lazy(() => import('./pages/Privacy'));
const Terms = React.lazy(() => import('./pages/Terms'));
const PaymentCallback = React.lazy(() => import('./pages/PaymentCallback'));

import NotificationManager from './components/NotificationManager';
import Sidebar from './components/Sidebar';
import ModernHeader from './components/ModernHeader';
import Footer from './components/Footer';
import MeshBackground from './components/MeshBackground';
import './index.css';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { token, loading, user } = useAuth();
  if (loading) return null; // Can replace with a spinner if needed
  if (!token) return <Navigate to="/login" replace />;

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
};


function AppContent() {
  const { user, logout, token } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isFlashPage = location.pathname === '/flash';
  const isOnboardingPage = location.pathname === '/onboarding';
  const isLandingPage = location.pathname === '/' && !token;
  
  // Hide sidebar/header on auth pages, landing page, and marketing pages
  const isAuthPage = ['/login', '/signup', '/verify', '/forgot-password', '/reset-password'].includes(location.pathname);
  const isMarketingPage = ['/about', '/partner', '/pro', '/privacy', '/terms'].includes(location.pathname);
  const isPaymentPage = location.pathname === '/payment';
  
  // Immersive pages hide everything
  const isImmersive = isAuthPage || isFlashPage || isPaymentPage;
  const hideSidebar = isLandingPage || isImmersive || isMarketingPage;
  const hideHeader = isImmersive || isLandingPage;
  const hideNavigation = hideHeader; 

  // Redirection guard (Onboarding & Verification)
  React.useEffect(() => {
    if (token && user) {
      if (!user.is_verified && location.pathname !== '/verify') {
        navigate('/verify');
      } else if (user.is_verified && !user.is_onboarded && location.pathname !== '/onboarding' && location.pathname !== '/verify') {
        navigate('/onboarding');
      }
    }
  }, [token, user, location.pathname, navigate]);

  return (
    <div className="app-container">
      <MeshBackground />
      {!hideHeader && (
        <ModernHeader
          onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
          isMenuOpen={isMenuOpen}
        />
      )}
      <div className={hideSidebar ? "app-layout-fullscreen" : "app-layout"}>
        {!hideSidebar && <Sidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />}
        <main className={hideSidebar ? "landing-page-main" : `main-stage ${isFlashPage ? 'no-padding' : ''}`}>
          <div className={hideSidebar ? "content-wrapper-fullscreen" : "content-wrapper"} style={hideSidebar ? { minHeight: '100%', display: 'flex' } : {
            display: 'flex',
            gap: '2rem',
            width: '100%',
            flexWrap: 'wrap'
          }}>
            <div style={hideSidebar ? { width: '100%', minHeight: '100%' } : { flex: 1, minWidth: '300px' }}>
              <React.Suspense fallback={<PageSkeleton />}>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={token ? <Home /> : <Landing />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/payment" element={<PaymentCallback />} />
                  
                  {/* Protected App Routes */}
                  <Route path="/flash" element={<ProtectedRoute><Flash /></ProtectedRoute>} />
                  <Route path="/watch/:id" element={<ProtectedRoute><Watch /></ProtectedRoute>} />
                  <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
                  <Route path="/profile/:username" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                  <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                  <Route path="/posts" element={<ProtectedRoute><Posts /></ProtectedRoute>} />
                  <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
                  <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
                  <Route path="/manage" element={<ProtectedRoute><ManageContent /></ProtectedRoute>} />
                  <Route path="/manage-videos" element={<ProtectedRoute><ManageContent /></ProtectedRoute>} />
                  <Route path="/achievements" element={<ProtectedRoute><Achievements /></ProtectedRoute>} />
                  <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
                  <Route path="/insights" element={<ProtectedRoute><Insights /></ProtectedRoute>} />
                  <Route path="/performance" element={<ProtectedRoute><Performance /></ProtectedRoute>} />
                  
                  {/* Protected Context Routings */}
                  <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
                  <Route path="/verify" element={<ProtectedRoute><Verify /></ProtectedRoute>} />
                  <Route path="/partner" element={<ProtectedRoute><PartnerV2 /></ProtectedRoute>} />
                  <Route path="/challenges" element={<ProtectedRoute><Challenges /></ProtectedRoute>} />
                  <Route path="/monetization" element={<ProtectedRoute><Monetization /></ProtectedRoute>} />
                  <Route path="/monetization/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
                  <Route path="/pro" element={<JoinPro />} />
                  
                  {/* Admin Routes */}
                  <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminPortal /></ProtectedRoute>} />
                </Routes>
                {!isImmersive && <Footer />}
              </React.Suspense>
            </div>
          </div>
        </main>
      </div>
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
