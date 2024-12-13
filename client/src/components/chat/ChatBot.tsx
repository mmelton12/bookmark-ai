import React, { useState, useRef, useEffect } from 'react';
import {
  VStack,
  Box,
  Input,
  Button,
  Text,
  useToast,
  Flex,
  Spinner,
  Avatar,
  Link,
} from '@chakra-ui/react';
import ReactMarkdown from 'react-markdown';
import { chatAPI } from '../../services/api';

interface Message {
  content: string;
  isUser: boolean;
  timestamp: Date;
}

const ChatBot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      content: input.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatAPI.sendMessage(userMessage.content);
      const botMessage: Message = {
        content: response.reply,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to get response',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <VStack h="100%" spacing={4} align="stretch" p={2}>
      <Box
        flex={1}
        overflowY="auto"
        borderWidth={1}
        borderRadius="md"
        p={4}
        bg="gray.50"
        h="calc(100% - 60px)"
      >
        {messages.map((message, index) => (
          <Flex
            key={index}
            mb={4}
            justify={message.isUser ? 'flex-end' : 'flex-start'}
          >
            <Flex
              maxW="80%"
              bg={message.isUser ? 'blue.500' : 'white'}
              color={message.isUser ? 'white' : 'black'}
              p={3}
              borderRadius="lg"
              boxShadow="sm"
              align="center"
            >
              {!message.isUser && (
                <Avatar
                  size="sm"
                  name="AI Assistant"
                  src="/ai-avatar.png"
                  mr={2}
                />
              )}
              <Box fontSize="sm">
                <ReactMarkdown
                  components={{
                    a: ({ node, ...props }) => (
                      <Link
                        color="blue.500"
                        textDecoration="underline"
                        href={props.href}
                        isExternal
                        onClick={(e) => {
                          e.preventDefault();
                          if (props.href) {
                            window.open(props.href, '_blank');
                          }
                        }}
                        {...props}
                      />
                    ),
                    p: ({ node, ...props }) => (
                      <Text {...props} />
                    )
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </Box>
            </Flex>
          </Flex>
        ))}
        {isLoading && (
          <Flex justify="flex-start" mb={4}>
            <Flex
              bg="white"
              p={3}
              borderRadius="lg"
              boxShadow="sm"
              align="center"
            >
              <Avatar
                size="sm"
                name="AI Assistant"
                src="/ai-avatar.png"
                mr={2}
              />
              <Spinner size="sm" />
            </Flex>
          </Flex>
        )}
        <div ref={messagesEndRef} />
      </Box>
      <Flex>
        <Input
          flex={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          mr={2}
          size="sm"
        />
        <Button
          colorScheme="blue"
          onClick={handleSend}
          isLoading={isLoading}
          size="sm"
        >
          Send
        </Button>
      </Flex>
    </VStack>
  );
};

export default ChatBot;
