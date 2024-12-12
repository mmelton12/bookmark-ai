import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Text,
  HStack,
  useColorModeValue,
  Container,
  Link,
  Slide,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

const CookieConsent: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    const hasConsented = localStorage.getItem('cookieConsent');
    if (!hasConsented) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <Slide direction="bottom" in={isVisible} style={{ zIndex: 1000 }}>
      <Box
        position="fixed"
        bottom={0}
        left={0}
        right={0}
        py={4}
        bg={bgColor}
        borderTop="1px"
        borderColor={borderColor}
        shadow="lg"
      >
        <Container maxW="container.xl">
          <HStack spacing={4} justify="space-between" align="center">
            <Text fontSize="sm">
              We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.{' '}
              <Link as={RouterLink} to="/privacy" color="blue.500">
                Learn more
              </Link>
            </Text>
            <Button
              colorScheme="blue"
              size="sm"
              onClick={handleAccept}
              flexShrink={0}
            >
              Accept
            </Button>
          </HStack>
        </Container>
      </Box>
    </Slide>
  );
};

export default CookieConsent;
