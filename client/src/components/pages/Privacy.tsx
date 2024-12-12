import React from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  UnorderedList,
  ListItem,
  useColorModeValue,
  Divider,
} from '@chakra-ui/react';
import PublicHeader from '../layout/PublicHeader';

const Privacy: React.FC = () => {
  const bgColor = useColorModeValue('white', 'gray.900');
  const textColor = useColorModeValue('gray.600', 'gray.400');

  return (
    <Box>
      <PublicHeader />
      <Box bg={bgColor} minH="100vh" pt={20} pb={16}>
        <Container maxW="container.lg">
          <VStack spacing={8} align="stretch">
            <Box textAlign="center" mb={8}>
              <Heading size="2xl" mb={4}>Privacy Policy</Heading>
              <Text color={textColor}>
                Last updated: {new Date().toLocaleDateString()}
              </Text>
            </Box>

            <VStack spacing={6} align="stretch">
              <Box>
                <Heading size="lg" mb={4}>Introduction</Heading>
                <Text>
                  At BookmarkAI, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.
                </Text>
              </Box>

              <Box>
                <Heading size="lg" mb={4}>Information We Collect</Heading>
                <Text mb={3}>We collect the following types of information:</Text>
                <UnorderedList spacing={2} pl={4}>
                  <ListItem>Account information (email, name, profile picture)</ListItem>
                  <ListItem>Bookmark data (URLs, titles, descriptions)</ListItem>
                  <ListItem>Usage information (access times, features used)</ListItem>
                  <ListItem>Device information (browser type, IP address)</ListItem>
                </UnorderedList>
              </Box>

              <Divider />

              <Box>
                <Heading size="lg" mb={4}>GDPR Compliance</Heading>
                <Text mb={3}>Under GDPR, you have the following rights:</Text>
                <UnorderedList spacing={2} pl={4}>
                  <ListItem>Right to access your personal data</ListItem>
                  <ListItem>Right to rectification of inaccurate data</ListItem>
                  <ListItem>Right to erasure ("right to be forgotten")</ListItem>
                  <ListItem>Right to data portability</ListItem>
                  <ListItem>Right to object to processing</ListItem>
                  <ListItem>Right to withdraw consent</ListItem>
                </UnorderedList>
              </Box>

              <Box>
                <Heading size="lg" mb={4}>How We Use Your Information</Heading>
                <Text mb={3}>We use your information to:</Text>
                <UnorderedList spacing={2} pl={4}>
                  <ListItem>Provide and maintain our service</ListItem>
                  <ListItem>Process and organize your bookmarks</ListItem>
                  <ListItem>Generate AI-powered summaries and tags</ListItem>
                  <ListItem>Improve our service</ListItem>
                  <ListItem>Communicate with you about updates</ListItem>
                  <ListItem>Detect and prevent fraud</ListItem>
                </UnorderedList>
              </Box>

              <Box>
                <Heading size="lg" mb={4}>Data Security</Heading>
                <Text>
                  We implement appropriate technical and organizational measures to protect your personal data against unauthorized or unlawful processing, accidental loss, destruction, or damage. All data is encrypted both in transit and at rest using industry-standard encryption protocols.
                </Text>
              </Box>

              <Box>
                <Heading size="lg" mb={4}>Data Retention</Heading>
                <Text>
                  We retain your personal data only for as long as necessary to provide you with our service and as required by applicable law. When you delete your account, we will delete or anonymize your data within 30 days.
                </Text>
              </Box>

              <Box>
                <Heading size="lg" mb={4}>Cookie Policy</Heading>
                <Text mb={3}>We use cookies for:</Text>
                <UnorderedList spacing={2} pl={4}>
                  <ListItem>Essential service functionality</ListItem>
                  <ListItem>Authentication and security</ListItem>
                  <ListItem>User preferences</ListItem>
                  <ListItem>Analytics (anonymized)</ListItem>
                </UnorderedList>
              </Box>

              <Box>
                <Heading size="lg" mb={4}>Third-Party Services</Heading>
                <Text>
                  We may use third-party services to process your data. All our third-party processors are GDPR compliant and have signed data processing agreements with us.
                </Text>
              </Box>

              <Box>
                <Heading size="lg" mb={4}>Contact Us</Heading>
                <Text>
                  If you have any questions about this Privacy Policy or our data practices, please contact our Data Protection Officer at privacy@bookmarkai.com.
                </Text>
              </Box>

              <Box>
                <Heading size="lg" mb={4}>Changes to This Policy</Heading>
                <Text>
                  We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
                </Text>
              </Box>
            </VStack>
          </VStack>
        </Container>
      </Box>
    </Box>
  );
};

export default Privacy;
