import React from 'react';
import {
  Box,
  Container,
  Stack,
  SimpleGrid,
  Text,
  Link,
  useColorModeValue,
  Image,
  Divider,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

const Footer: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <Box
      bg={useColorModeValue('gray.50', 'gray.900')}
      color={useColorModeValue('gray.700', 'gray.200')}
      borderTop="1px"
      borderColor={useColorModeValue('gray.200', 'gray.700')}
    >
      <Container as={Stack} maxW="container.xl" py={10}>
        <SimpleGrid
          templateColumns={{ sm: '1fr 1fr', md: '2fr 1fr 1fr 1fr' }}
          spacing={8}
        >
          <Stack spacing={6}>
            <Box>
              <Image
                src="/logo-bookmarkai.svg"
                alt="BookmarkAI Logo"
                height="32px"
              />
            </Box>
            <Text fontSize="sm">
              © {year} BookmarkAI. All rights reserved.
            </Text>
            <Text fontSize="sm">
              BookmarkAI is committed to protecting your privacy and ensuring the security of your data.
            </Text>
          </Stack>
          <Stack align="flex-start">
            <Text fontWeight="semibold" mb={2}>Product</Text>
            <Link as={RouterLink} to="/features">Features</Link>
            <Link as={RouterLink} to="/pricing">Pricing</Link>
            <Link as={RouterLink} to="/faq">FAQ</Link>
          </Stack>
          <Stack align="flex-start">
            <Text fontWeight="semibold" mb={2}>Support</Text>
            <Link as={RouterLink} to="/help">Help Center</Link>
            <Link as={RouterLink} to="/contact">Contact Us</Link>
            <Link as={RouterLink} to="/status">System Status</Link>
          </Stack>
          <Stack align="flex-start">
            <Text fontWeight="semibold" mb={2}>Legal</Text>
            <Link as={RouterLink} to="/privacy">Privacy Policy</Link>
            <Link as={RouterLink} to="/terms">Terms of Service</Link>
            <Link as={RouterLink} to="/gdpr">GDPR Compliance</Link>
          </Stack>
        </SimpleGrid>
        <Divider my={6} />
        <Text fontSize="xs" color={useColorModeValue('gray.600', 'gray.400')}>
          By using BookmarkAI, you agree to our Terms of Service and Privacy Policy. We use essential cookies to ensure the proper functioning of our service. Read our Cookie Policy to learn more.
        </Text>
      </Container>
    </Box>
  );
};

export default Footer;
