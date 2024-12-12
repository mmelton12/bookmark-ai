import React from 'react';
import {
  Box,
  Container,
  Heading,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';
import PublicHeader from '../layout/PublicHeader';

const FAQ: React.FC = () => {
  const bgColor = useColorModeValue('white', 'gray.900');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box>
      <PublicHeader />
      <Box bg={bgColor} minH="100vh" pt={20} pb={16}>
        <Container maxW="container.lg">
          <VStack spacing={8} align="stretch">
            <Box textAlign="center" mb={8}>
              <Heading size="2xl" mb={4}>Frequently Asked Questions</Heading>
              <Text color={useColorModeValue('gray.600', 'gray.400')}>
                Find answers to common questions about BookmarkAI
              </Text>
            </Box>

            <Accordion allowMultiple>
              <AccordionItem border="1px" borderColor={borderColor} rounded="md" mb={4}>
                <AccordionButton p={4}>
                  <Box flex="1" textAlign="left" fontWeight="medium">
                    What browsers does BookmarkAI support?
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel p={4}>
                  BookmarkAI supports all major browsers including Google Chrome, Mozilla Firefox, Safari, and Microsoft Edge. You can easily import your bookmarks from any of these browsers with just a few clicks.
                </AccordionPanel>
              </AccordionItem>

              <AccordionItem border="1px" borderColor={borderColor} rounded="md" mb={4}>
                <AccordionButton p={4}>
                  <Box flex="1" textAlign="left" fontWeight="medium">
                    How does the AI-powered organization work?
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel p={4}>
                  Our AI technology analyzes your bookmarks' content and automatically generates relevant tags, summaries, and categories. It uses advanced natural language processing to understand the context and subject matter of each bookmark, making organization effortless.
                </AccordionPanel>
              </AccordionItem>

              <AccordionItem border="1px" borderColor={borderColor} rounded="md" mb={4}>
                <AccordionButton p={4}>
                  <Box flex="1" textAlign="left" fontWeight="medium">
                    Is my bookmark data secure?
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel p={4}>
                  Yes, we take security seriously. All your data is encrypted both in transit and at rest. We use industry-standard security practices and regularly update our systems to ensure your bookmarks remain private and secure.
                </AccordionPanel>
              </AccordionItem>

              <AccordionItem border="1px" borderColor={borderColor} rounded="md" mb={4}>
                <AccordionButton p={4}>
                  <Box flex="1" textAlign="left" fontWeight="medium">
                    How do I export my bookmarks?
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel p={4}>
                  You can export your bookmarks at any time in standard HTML format, which is compatible with all major browsers. This ensures you always have control over your data and can easily transfer it if needed.
                </AccordionPanel>
              </AccordionItem>

              <AccordionItem border="1px" borderColor={borderColor} rounded="md" mb={4}>
                <AccordionButton p={4}>
                  <Box flex="1" textAlign="left" fontWeight="medium">
                    What happens to my existing bookmark organization?
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel p={4}>
                  When you import your bookmarks, we preserve your existing folder structure while enhancing it with AI-powered organization. You can choose to keep your original structure or let our AI reorganize everything for optimal accessibility.
                </AccordionPanel>
              </AccordionItem>

              <AccordionItem border="1px" borderColor={borderColor} rounded="md" mb={4}>
                <AccordionButton p={4}>
                  <Box flex="1" textAlign="left" fontWeight="medium">
                    Is BookmarkAI GDPR compliant?
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel p={4}>
                  Yes, BookmarkAI is fully GDPR compliant. We provide tools for data export, deletion, and management of your personal information. You can find more details in our Privacy Policy and GDPR Compliance documentation.
                </AccordionPanel>
              </AccordionItem>

              <AccordionItem border="1px" borderColor={borderColor} rounded="md" mb={4}>
                <AccordionButton p={4}>
                  <Box flex="1" textAlign="left" fontWeight="medium">
                    Can I share my bookmarks with others?
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel p={4}>
                  Yes, BookmarkAI supports sharing individual bookmarks or entire collections with other users. You can control access permissions and collaborate with team members while maintaining privacy for your personal bookmarks.
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          </VStack>
        </Container>
      </Box>
    </Box>
  );
};

export default FAQ;
