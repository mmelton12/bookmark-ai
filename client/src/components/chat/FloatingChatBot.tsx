import React, { useState, useEffect } from 'react';
import {
  Box,
  IconButton,
  useColorModeValue,
} from '@chakra-ui/react';
import { ChatIcon, CloseIcon } from '@chakra-ui/icons';
import ChatBot from './ChatBot';

interface FloatingChatBotProps {
  className?: string;
}

const FloatingChatBot: React.FC<FloatingChatBotProps> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const bgColor = useColorModeValue('white', 'gray.800');

  useEffect(() => {
    const handleOpenChat = () => setIsOpen(true);
    window.addEventListener('openChatBot', handleOpenChat);
    return () => window.removeEventListener('openChatBot', handleOpenChat);
  }, []);

  return (
    <Box
      position="fixed"
      bottom="20px"
      right="20px"
      zIndex={1000}
      className={`chat-bot ${className || ''}`}
    >
      {isOpen ? (
        <Box
          bg={bgColor}
          borderRadius="lg"
          boxShadow="xl"
          width="350px"
          height="500px"
          overflow="hidden"
        >
          <Box
            p={2}
            bg="blue.500"
            color="white"
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box fontWeight="bold">Chat Assistant</Box>
            <IconButton
              aria-label="Close chat"
              icon={<CloseIcon />}
              size="sm"
              variant="ghost"
              color="white"
              _hover={{ bg: 'blue.600' }}
              onClick={() => setIsOpen(false)}
            />
          </Box>
          <Box height="calc(500px - 40px)">
            <ChatBot />
          </Box>
        </Box>
      ) : (
        <IconButton
          aria-label="Open chat"
          icon={<ChatIcon />}
          colorScheme="blue"
          borderRadius="full"
          size="lg"
          boxShadow="lg"
          onClick={() => setIsOpen(true)}
        />
      )}
    </Box>
  );
};

export default FloatingChatBot;
