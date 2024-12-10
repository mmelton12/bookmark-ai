import React from 'react';
import { ChakraProvider, Box } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SearchProvider } from './contexts/SearchContext';
import { FolderProvider } from './contexts/FolderContext';
import LoginForm from './components/auth/LoginForm';
import SignupForm from './components/auth/SignupForm';
import BookmarkManager from './components/bookmarks/BookmarkManager';
import AccountSettings from './components/account/AccountSettings';
import SearchPage from './components/search/SearchPage';
import ChatPage from './components/chat/ChatPage';
import FloatingChatBot from './components/chat/FloatingChatBot';
import Header from './components/layout/Header';
import theme from './theme';

// Protected route wrapper component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login while preserving the intended destination
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <SearchProvider>
      <FolderProvider>
        <Header />
        {children}
      </FolderProvider>
    </SearchProvider>
  );
};

// Layout wrapper for auth pages
const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // If user is authenticated, redirect to home or the page they came from
  if (isAuthenticated) {
    const from = (location.state as any)?.from?.pathname || '/';
    return <Navigate to={from} replace />;
  }

  return (
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
  );
};

// Wrapper for protected routes that need access to auth context
const ProtectedRouteWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ProtectedRoute>
      {children}
    </ProtectedRoute>
  );
};

// OAuth callback handler
const OAuthCallback: React.FC = () => {
  // The actual handling is done in AuthContext useEffect
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
        <Route
          path="/"
          element={
            <ProtectedRouteWrapper>
              <Box p={4} height="calc(100vh - 64px)">
                <BookmarkManager />
              </Box>
            </ProtectedRouteWrapper>
          }
        />
        <Route
          path="/search"
          element={
            <ProtectedRouteWrapper>
              <SearchPage />
            </ProtectedRouteWrapper>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRouteWrapper>
              <ChatPage />
            </ProtectedRouteWrapper>
          }
        />
        <Route
          path="/account"
          element={
            <ProtectedRouteWrapper>
              <Box p={8}>
                <AccountSettings />
              </Box>
            </ProtectedRouteWrapper>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      {isAuthenticated && <FloatingChatBot />}
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
