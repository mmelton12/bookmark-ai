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

const Terms: React.FC = () => {
  const bgColor = useColorModeValue('white', 'gray.900');
  const textColor = useColorModeValue('gray.600', 'gray.400');

  return (
    <Box>
      <PublicHeader />
      <Box bg={bgColor} minH="100vh" pt={20} pb={16}>
        <Container maxW="container.lg">
          <VStack spacing={8} align="stretch">
            <Box textAlign="center" mb={8}>
              <Heading size="2xl" mb={4}>Terms of Service</Heading>
              <Text color={textColor}>
                Last updated: {new Date().toLocaleDateString()}
              </Text>
            </Box>

            <VStack spacing={6} align="stretch">
              <Box>
                <Heading size="lg" mb={4}>1. Agreement to Terms</Heading>
                <Text>
                  By accessing or using BookmarkAI, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing BookmarkAI.
                </Text>
              </Box>

              <Box>
                <Heading size="lg" mb={4}>2. Use License</Heading>
                <Text mb={3}>
                  We grant you a personal, non-transferable, non-exclusive license to use BookmarkAI subject to these Terms. This license is for personal or business use and does not include:
                </Text>
                <UnorderedList spacing={2} pl={4}>
                  <ListItem>Modifying or copying our software</ListItem>
                  <ListItem>Using the service for any commercial purpose without proper authorization</ListItem>
                  <ListItem>Attempting to decompile or reverse engineer the software</ListItem>
                  <ListItem>Removing any copyright or proprietary notations</ListItem>
                  <ListItem>Transferring the software to another person or "mirroring" it on other servers</ListItem>
                </UnorderedList>
              </Box>

              <Divider />

              <Box>
                <Heading size="lg" mb={4}>3. User Responsibilities</Heading>
                <Text mb={3}>You are responsible for:</Text>
                <UnorderedList spacing={2} pl={4}>
                  <ListItem>Maintaining the confidentiality of your account</ListItem>
                  <ListItem>All activities that occur under your account</ListItem>
                  <ListItem>Ensuring your bookmarks do not violate any laws or regulations</ListItem>
                  <ListItem>Providing accurate information when using our service</ListItem>
                </UnorderedList>
              </Box>

              <Box>
                <Heading size="lg" mb={4}>4. Service Modifications</Heading>
                <Text>
                  BookmarkAI reserves the right to modify, suspend, or discontinue any part of the service at any time without notice. We shall not be liable to you or any third party for any modification, suspension, or discontinuation of the service.
                </Text>
              </Box>

              <Box>
                <Heading size="lg" mb={4}>5. Intellectual Property</Heading>
                <Text>
                  The service and its original content, features, and functionality are owned by BookmarkAI and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
                </Text>
              </Box>

              <Box>
                <Heading size="lg" mb={4}>6. User Content</Heading>
                <Text>
                  You retain all rights to your bookmarks and other content you submit to BookmarkAI. By submitting content, you grant us a license to use, modify, and display that content as necessary to provide our service.
                </Text>
              </Box>

              <Box>
                <Heading size="lg" mb={4}>7. Limitation of Liability</Heading>
                <Text>
                  BookmarkAI shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.
                </Text>
              </Box>

              <Box>
                <Heading size="lg" mb={4}>8. Termination</Heading>
                <Text>
                  We may terminate or suspend your account and access to the service immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties, or for any other reason.
                </Text>
              </Box>

              <Box>
                <Heading size="lg" mb={4}>9. Governing Law</Heading>
                <Text>
                  These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which BookmarkAI operates, without regard to its conflict of law provisions.
                </Text>
              </Box>

              <Box>
                <Heading size="lg" mb={4}>10. Changes to Terms</Heading>
                <Text>
                  We reserve the right to modify these terms at any time. We will notify users of any material changes to these terms. Continued use of BookmarkAI after such modifications constitutes acceptance of the updated terms.
                </Text>
              </Box>

              <Box>
                <Heading size="lg" mb={4}>Contact</Heading>
                <Text>
                  For any questions about these Terms of Service, please contact us at legal@bookmarkai.com.
                </Text>
              </Box>
            </VStack>
          </VStack>
        </Container>
      </Box>
    </Box>
  );
};

export default Terms;
