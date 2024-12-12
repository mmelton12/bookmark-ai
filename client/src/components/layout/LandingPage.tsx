import React from 'react';
import { Box, Button, Container, Heading, Text, VStack, HStack, Icon, SimpleGrid, useColorModeValue, Image, Divider, Avatar } from '@chakra-ui/react';
import { FaBrain, FaSearch, FaTags, FaBookmark, FaRegLightbulb, FaRegClock, FaRegChartBar, FaRegComments, FaChrome, FaCog, FaFolderOpen, FaRocket, FaFirefox, FaSafari, FaEdge } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import PublicHeader from './PublicHeader';

const Feature: React.FC<{ icon: any; title: string; text: string }> = ({ icon, title, text }) => {
  return (
    <VStack
      align="start"
      p={6}
      bg={useColorModeValue('white', 'gray.700')}
      rounded="xl"
      shadow="md"
      height="100%"
      transition="transform 0.2s"
      _hover={{ transform: 'translateY(-5px)' }}
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

const Step: React.FC<{ number: number; title: string; description: string; icon: any; icons?: any[] }> = ({ number, title, description, icon, icons }) => {
  const bgGradient = useColorModeValue(
    'linear(to-br, blue.50, blue.100)',
    'linear(to-br, blue.900, blue.800)'
  );
  const borderColor = useColorModeValue('blue.200', 'blue.600');
  const iconBg = useColorModeValue('white', 'gray.800');

  return (
    <Box
      p={8}
      position="relative"
      bgGradient={bgGradient}
      rounded="2xl"
      shadow="xl"
      mb={8}
      borderWidth="1px"
      borderColor={borderColor}
      transition="transform 0.3s"
      _hover={{ transform: 'scale(1.02)' }}
    >
      <HStack spacing={6} position="relative">
        <Box position="relative">
          <Box
            position="absolute"
            top="-2px"
            left="-2px"
            right="-2px"
            bottom="-2px"
            bg="blue.500"
            rounded="full"
            opacity={0.3}
          />
          <Box
            w="64px"
            h="64px"
            bg={iconBg}
            rounded="full"
            display="flex"
            alignItems="center"
            justifyContent="center"
            position="relative"
            shadow="lg"
            borderWidth="2px"
            borderColor={borderColor}
          >
            <Icon as={icon} w={6} h={6} color="blue.500" />
          </Box>
          <Box
            position="absolute"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            w="32px"
            h="32px"
            bg="blue.500"
            color="white"
            rounded="full"
            display="flex"
            alignItems="center"
            justifyContent="center"
            fontSize="sm"
            fontWeight="bold"
            shadow="lg"
            border="2px solid white"
          >
            {number}
          </Box>
        </Box>
        <VStack align="start" spacing={3} flex={1}>
          <Heading size="md" color={useColorModeValue('gray.800', 'white')}>
            {title}
          </Heading>
          <Text color={useColorModeValue('gray.600', 'gray.300')} fontSize="lg">
            {description}
          </Text>
          {icons && (
            <HStack spacing={4} mt={2}>
              {icons.map((IconComponent, index) => (
                <Icon key={index} as={IconComponent} w={6} h={6} color="blue.500" />
              ))}
            </HStack>
          )}
        </VStack>
      </HStack>
    </Box>
  );
};

const Testimonial: React.FC<{ name: string; role: string; content: string }> = ({ name, role, content }) => {
  const quoteBgColor = useColorModeValue('white', 'gray.700');
  const quoteTextColor = useColorModeValue('gray.600', 'gray.300');
  const quoteBorderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Box
      bg={quoteBgColor}
      p={8}
      rounded="xl"
      shadow="lg"
      borderWidth="1px"
      borderColor={quoteBorderColor}
      position="relative"
      _before={{
        content: '"❝"',
        position: 'absolute',
        top: '4',
        left: '4',
        fontSize: '24px',
        color: 'blue.500',
        opacity: 0.5,
      }}
    >
      <Text
        fontSize="md"
        color={quoteTextColor}
        mb={6}
        pt={4}
        fontStyle="italic"
        position="relative"
      >
        {content}
      </Text>
      <HStack spacing={4} mt={4}>
        <Avatar
          size="md"
          name={name}
          bg="blue.500"
          color="white"
        />
        <Box>
          <Text fontWeight="bold" fontSize="md">
            {name}
          </Text>
          <Text fontSize="sm" color={quoteTextColor}>
            {role}
          </Text>
        </Box>
      </HStack>
    </Box>
  );
};

const SectionWrapper: React.FC<{ children: React.ReactNode; alternate?: boolean }> = ({ children, alternate }) => {
  const bgColor = useColorModeValue(
    alternate ? 'gray.50' : 'white',
    alternate ? 'gray.800' : 'gray.900'
  );

  return (
    <Box py={20} bg={bgColor}>
      <Container maxW="container.xl">
        {children}
      </Container>
    </Box>
  );
};

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const textColor = useColorModeValue('gray.600', 'gray.300');

  return (
    <Box>
      <PublicHeader />
      <Box pt="64px"> {/* Add padding to account for fixed header */}
        {/* Hero Section */}
        <SectionWrapper>
          <VStack spacing={8} textAlign="center">
            <Image
              src="/logo-bookmarkai.svg"
              alt="BookmarkAI Logo"
              height="120px"
              mb={4}
            />
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
              Import your existing browser bookmarks instantly and let AI organize, tag, and summarize them.
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
        </SectionWrapper>

        {/* Features Section */}
        <SectionWrapper alternate>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={10}>
            <Feature
              icon={FaBookmark}
              title="Easy Import"
              text="Import your existing bookmarks from Chrome, Firefox, Safari, or Edge with just one click."
            />
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
          </SimpleGrid>
        </SectionWrapper>

        {/* How It Works Section */}
        <SectionWrapper>
          <VStack spacing={16}>
            <VStack spacing={4}>
              <Heading 
                textAlign="center" 
                fontSize={{ base: "3xl", md: "4xl" }}
                bgGradient="linear(to-r, blue.400, blue.600)"
                bgClip="text"
              >
                How It Works
              </Heading>
              <Text
                textAlign="center"
                fontSize="xl"
                color={useColorModeValue('gray.600', 'gray.300')}
                maxW="2xl"
              >
                Get started in minutes with our simple process
              </Text>
            </VStack>
            
            <Box w="100%" maxW="4xl" mx="auto">
              <VStack spacing={6} align="stretch" position="relative">
                <Step
                  number={1}
                  icon={FaBookmark}
                  title="Import Your Bookmarks"
                  description="Import your existing bookmarks from any major browser. We support Chrome, Firefox, Safari, and Edge."
                  icons={[FaChrome, FaFirefox, FaSafari, FaEdge]}
                />
                <Step
                  number={2}
                  icon={FaBrain}
                  title="AI Processing"
                  description="Our AI automatically analyzes your bookmarks, generates summaries, and creates relevant tags."
                />
                <Step
                  number={3}
                  icon={FaFolderOpen}
                  title="Smart Organization"
                  description="Your bookmarks are automatically organized into meaningful categories and folders."
                />
                <Step
                  number={4}
                  icon={FaRocket}
                  title="Easy Access"
                  description="Find and access your bookmarks instantly using our powerful search and filtering tools."
                />
              </VStack>
            </Box>
          </VStack>
        </SectionWrapper>

        {/* Benefits Section */}
        <SectionWrapper alternate>
          <VStack spacing={12}>
            <Heading textAlign="center" mb={8}>Why Choose BookmarkAI</Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
              <Feature
                icon={FaRegLightbulb}
                title="Seamless Import"
                text="Import your existing browser bookmarks in seconds - no manual work required."
              />
              <Feature
                icon={FaRegClock}
                title="Time-Saving Summaries"
                text="Get the key points of any article or webpage instantly with AI-generated summaries."
              />
              <Feature
                icon={FaRegChartBar}
                title="Better Organization"
                text="Keep your digital resources perfectly organized with intelligent categorization."
              />
              <Feature
                icon={FaRegComments}
                title="Smart Collaboration"
                text="Share and collaborate on bookmark collections with team members effortlessly."
              />
            </SimpleGrid>
          </VStack>
        </SectionWrapper>

        {/* Testimonials Section */}
        <SectionWrapper>
          <VStack spacing={12}>
            <Heading textAlign="center" mb={8}>What Our Users Say</Heading>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
              <Testimonial
                name="Sarah Johnson"
                role="Content Creator"
                content="Importing my Chrome bookmarks was a breeze! BookmarkAI organized everything perfectly and the AI summaries save me hours of reading time."
              />
              <Testimonial
                name="Michael Chen"
                role="Software Developer"
                content="The browser import feature is fantastic. All my Firefox bookmarks were instantly organized and tagged. Finding resources is so much easier now."
              />
              <Testimonial
                name="Emily Rodriguez"
                role="Digital Marketer"
                content="I imported thousands of bookmarks from multiple browsers and BookmarkAI handled them flawlessly. The AI-powered organization is simply amazing."
              />
            </SimpleGrid>
          </VStack>
        </SectionWrapper>

        {/* Final CTA Section */}
        <SectionWrapper alternate>
          <VStack spacing={8} textAlign="center">
            <Heading>Ready to Transform Your Bookmarks?</Heading>
            <Text fontSize="xl" maxW="2xl" mx="auto" color={textColor}>
              Import your browser bookmarks now and let AI organize them for you. Join thousands of users who have already revolutionized their bookmark management.
            </Text>
            <Button
              size="lg"
              colorScheme="blue"
              onClick={() => navigate('/signup')}
              height="60px"
              px={12}
            >
              Get Started Now
            </Button>
          </VStack>
        </SectionWrapper>
      </Box>
    </Box>
  );
};

export default LandingPage;
