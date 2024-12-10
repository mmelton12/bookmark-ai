import React, { useState, useEffect } from 'react';
import {
  VStack,
  Container,
  Heading,
  Text,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Link,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import ChatBot from './ChatBot';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI } from '../../services/api';

const ChatPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { user, updateProfile } = useAuth();
  const toast = useToast();

  useEffect(() => {
    const fetchLatestUser = async () => {
      try {
        // Get latest user data
        const latestUser = await authAPI.getUser();
        
        // If we have an API key, ensure it's synced with the context
        if (latestUser.openAiKey) {
          await updateProfile({ openAiKey: latestUser.openAiKey });
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        toast({
          title: 'Error',
          description: 'Failed to load user data',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchLatestUser();
  }, [updateProfile, toast]);

  if (isLoading) {
    return (
      <Container maxW="container.md" py={8}>
        <Text>Loading...</Text>
      </Container>
    );
  }

  if (!user?.openAiKey) {
    return (
      <Container maxW="container.md" py={8}>
        <Alert
          status="warning"
          variant="subtle"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          height="200px"
          borderRadius="lg"
        >
          <AlertIcon boxSize="40px" mr={0} />
          <AlertTitle mt={4} mb={1} fontSize="lg">
            OpenAI API Key Required
          </AlertTitle>
          <AlertDescription maxWidth="sm">
            To use the chat feature, please add your OpenAI API key in{' '}
            <Link as={RouterLink} to="/account" color="blue.500">
              account settings
            </Link>
            .
          </AlertDescription>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={6} align="stretch">
        <Heading size="lg">AI Chat Assistant</Heading>
        <Text color="gray.600">
          Chat with our AI assistant to help you manage and understand your bookmarks better.
        </Text>
        <ChatBot />
      </VStack>
    </Container>
  );
};

export default ChatPage;
