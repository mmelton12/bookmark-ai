import React from 'react';
import { ChakraProvider, Box } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { FolderProvider } from './contexts/FolderContext';
import LoginForm from './components/auth/LoginForm';
import SignupForm from './components/auth/SignupForm';
import BookmarkManager from './components/bookmarks/BookmarkManager';
import ShareTarget from './components/bookmarks/ShareTarget';
import AccountSettings from './components/account/AccountSettings';
import ChatPage from './components/chat/ChatPage';
import FloatingChatBot from './components/chat/FloatingChatBot';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import LandingPage from './components/layout/LandingPage';
import FAQ from './components/pages/FAQ';
import Privacy from './components/pages/Privacy';
import Terms from './components/pages/Terms';
import Contact from './components/pages/Contact';
import CookieConsent from './components/common/CookieConsent';
import TourGuide from './components/common/TourGuide';
import PWAInstallPrompt from './components/common/PWAInstallPrompt';
import theme from './theme';

// Public layout wrapper component
const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Box minH="100vh" display="flex" flexDirection="column">
      <Box flex="1">
        {children}
      </Box>
      <Footer />
    </Box>
  );
};

// Protected route wrapper component
const ProtectedRoute: React.FC<{ children: React.ReactNode, showTour?: boolean }> = ({ children, showTour = false }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return (
    <FolderProvider>
      <Header />
      {children}
      {showTour && <TourGuide />}
      <FloatingChatBot className="chat-bot" />
    </FolderProvider>
  );
};

// Layout wrapper for auth pages
const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // If user is authenticated, redirect to dashboard
  if (isAuthenticated) {
    const from = (location.state as any)?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  return (
    <PublicLayout>
      <Box
        minH="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg="gray.50"
        p={4}
      >
        <Box
          w="full"
          maxW="md"
          p={8}
          borderRadius="lg"
          boxShadow="lg"
          bg="white"
        >
          {children}
        </Box>
      </Box>
    </PublicLayout>
  );
};

// OAuth callback handler
const OAuthCallback: React.FC = () => {
  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="gray.50"
    >
      <Box textAlign="center">
        Processing login...
      </Box>
    </Box>
  );
};

const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" />
            ) : (
              <PublicLayout>
                <LandingPage />
              </PublicLayout>
            )
          }
        />
        <Route
          path="/login"
          element={
            <AuthLayout>
              <LoginForm />
            </AuthLayout>
          }
        />
        <Route
          path="/signup"
          element={
            <AuthLayout>
              <SignupForm />
            </AuthLayout>
          }
        />
        <Route
          path="/auth/callback"
          element={<OAuthCallback />}
        />

        {/* Public Information Pages */}
        <Route
          path="/faq"
          element={
            <PublicLayout>
              <FAQ />
            </PublicLayout>
          }
        />
        <Route
          path="/privacy"
          element={
            <PublicLayout>
              <Privacy />
            </PublicLayout>
          }
        />
        <Route
          path="/terms"
          element={
            <PublicLayout>
              <Terms />
            </PublicLayout>
          }
        />
        <Route
          path="/contact"
          element={
            <PublicLayout>
              <Contact />
            </PublicLayout>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute showTour={true}>
              <Box p={4} height="calc(100vh - 64px)">
                <BookmarkManager />
              </Box>
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <Box p={8}>
                <AccountSettings />
              </Box>
            </ProtectedRoute>
          }
        />
        
        {/* Share Target Route */}
        <Route
          path="/share-target"
          element={
            <ProtectedRoute>
              <ShareTarget />
            </ProtectedRoute>
          }
        />
        
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <CookieConsent />
      <PWAInstallPrompt />
    </>
  );
};

const App: React.FC = () => {
  return (
    <ChakraProvider theme={theme}>
      <Router>
        <AuthProvider>
          <Box minH="100vh" bg="gray.50">
            <AppRoutes />
          </Box>
        </AuthProvider>
      </Router>
    </ChakraProvider>
  );
};

export default App;
