import React from 'react';
import { ChakraProvider, Box } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginForm from './components/auth/LoginForm';
import SignupForm from './components/auth/SignupForm';
import BookmarkList from './components/bookmarks/BookmarkList';
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
    <>
      <Header />
      {children}
    </>
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

const AppRoutes: React.FC = () => {
  return (
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
        path="/"
        element={
          <ProtectedRouteWrapper>
            <Box p={8}>
              <BookmarkList />
            </Box>
          </ProtectedRouteWrapper>
        }
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
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
