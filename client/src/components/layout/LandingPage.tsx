import React from 'react';
import { Box, Button, Container, Heading, Text, VStack, HStack, Icon, SimpleGrid, useColorModeValue } from '@chakra-ui/react';
import { FaBrain, FaSearch, FaTags, FaBookmark } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Feature: React.FC<{ icon: any; title: string; text: string }> = ({ icon, title, text }) => {
  return (
    <VStack
      align="start"
      p={6}
      bg={useColorModeValue('white', 'gray.700')}
      rounded="xl"
      shadow="md"
      height="100%"
    >
      <Icon as={icon} w={10} h={10} color="blue.500" />
      <Heading size="md" mt={4} mb={2}>
        {title}
      </Heading>
      <Text color={useColorModeValue('gray.600', 'gray.300')}>
        {text}
      </Text>
    </VStack>
  );
};

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  return (
    <Box bg={bgColor} minH="100vh">
      {/* Hero Section */}
      <Container maxW="container.xl" pt={20} pb={20}>
        <VStack spacing={8} textAlign="center">
          <Heading
            fontSize={{ base: '3xl', md: '5xl' }}
            fontWeight="bold"
            lineHeight="shorter"
          >
            Transform Your Bookmarks with
            <Text as="span" color="blue.500"> AI-Powered </Text>
            Intelligence
          </Heading>
          <Text fontSize={{ base: 'lg', md: 'xl' }} color={textColor} maxW="2xl">
            Automatically organize, tag, and summarize your bookmarks using advanced AI. 
            Never lose track of important content again.
          </Text>
          <HStack spacing={4} pt={4}>
            <Button
              size="lg"
              colorScheme="blue"
              onClick={() => navigate('/signup')}
              height="60px"
              px={8}
            >
              Get Started Free
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/login')}
              height="60px"
              px={8}
            >
              Sign In
            </Button>
          </HStack>
        </VStack>

        {/* Features Section */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={10} mt={20}>
          <Feature
            icon={FaBrain}
            title="AI-Powered Summaries"
            text="Get instant AI-generated summaries of your bookmarked content, saving you valuable time."
          />
          <Feature
            icon={FaTags}
            title="Smart Tagging"
            text="Automatically generate relevant tags for your bookmarks using advanced AI technology."
          />
          <Feature
            icon={FaSearch}
            title="Intelligent Search"
            text="Find any bookmark instantly with our powerful search functionality across tags and summaries."
          />
          <Feature
            icon={FaBookmark}
            title="Clean Interface"
            text="Enjoy a minimalist, distraction-free interface designed for productivity."
          />
        </SimpleGrid>
      </Container>
    </Box>
  );
};

export default LandingPage;
