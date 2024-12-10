import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Text,
  Link,
  useToast,
  FormErrorMessage,
  Divider,
  Box,
  Center
} from '@chakra-ui/react';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../../contexts/AuthContext';

const LoginForm: React.FC = () => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [emailError, setEmailError] = React.useState('');
  const [passwordError, setPasswordError] = React.useState('');
  const { login } = useAuth();
  const toast = useToast();

  const validateForm = () => {
    let isValid = true;
    
    // Reset errors
    setEmailError('');
    setPasswordError('');

    // Email validation
    if (!email) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    }

    // Password validation
    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await login(email, password);
      // Redirect is handled in AuthContext
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Login Failed',
        description: error instanceof Error 
          ? error.message 
          : 'Unable to log in. Please check your credentials and try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const serverUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
    window.location.href = `${serverUrl}/auth/google`;
  };

  return (
    <VStack spacing={4} as="form" onSubmit={handleSubmit}>
      <Text fontSize="2xl" fontWeight="bold">Login to BookmarkAI</Text>
      
      <Button
        width="full"
        variant="outline"
        leftIcon={<Box as={FcGoogle} />}
        onClick={handleGoogleLogin}
        isLoading={isLoading}
      >
        Continue with Google
      </Button>

      <Center w="full" py={4}>
        <Divider />
        <Text px={4} color="gray.500">or</Text>
        <Divider />
      </Center>
      
      <FormControl isInvalid={!!emailError} isRequired>
        <FormLabel>Email</FormLabel>
        <Input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setEmailError('');
          }}
          placeholder="Enter your email"
        />
        <FormErrorMessage>{emailError}</FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={!!passwordError} isRequired>
        <FormLabel>Password</FormLabel>
        <Input
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setPasswordError('');
          }}
          placeholder="Enter your password"
        />
        <FormErrorMessage>{passwordError}</FormErrorMessage>
      </FormControl>

      <Button
        type="submit"
        colorScheme="blue"
        width="full"
        isLoading={isLoading}
        loadingText="Logging in..."
      >
        Login
      </Button>

      <Text>
        Don't have an account?{' '}
        <Link as={RouterLink} to="/signup" color="blue.500">
          Sign up
        </Link>
      </Text>
    </VStack>
  );
};

export default LoginForm;
