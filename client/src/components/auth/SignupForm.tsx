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

const SignupForm: React.FC = () => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [emailError, setEmailError] = React.useState('');
  const [passwordError, setPasswordError] = React.useState('');
  const [confirmPasswordError, setConfirmPasswordError] = React.useState('');
  const { signup } = useAuth();
  const toast = useToast();

  const validateForm = () => {
    let isValid = true;
    
    // Reset errors
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');

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

    // Confirm password validation
    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password');
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
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
      await signup(email, password);
      // No need to navigate here as it's handled in AuthContext
    } catch (error) {
      console.error('Signup error:', error);
      toast({
        title: 'Signup Failed',
        description: error instanceof Error 
          ? error.message 
          : 'Unable to create account. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    const serverUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
    window.location.href = `${serverUrl}/auth/google`;
  };

  return (
    <VStack spacing={4} as="form" onSubmit={handleSubmit}>
      <Text fontSize="2xl" fontWeight="bold">Create Account</Text>

      <Button
        width="full"
        variant="outline"
        leftIcon={<Box as={FcGoogle} />}
        onClick={handleGoogleSignup}
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

      <FormControl isInvalid={!!confirmPasswordError} isRequired>
        <FormLabel>Confirm Password</FormLabel>
        <Input
          type="password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            setConfirmPasswordError('');
          }}
          placeholder="Confirm your password"
        />
        <FormErrorMessage>{confirmPasswordError}</FormErrorMessage>
      </FormControl>

      <Button
        type="submit"
        colorScheme="blue"
        width="full"
        isLoading={isLoading}
        loadingText="Creating account..."
      >
        Sign Up
      </Button>

      <Text>
        Already have an account?{' '}
        <Link as={RouterLink} to="/login" color="blue.500">
          Login
        </Link>
      </Text>
    </VStack>
  );
};

export default SignupForm;
