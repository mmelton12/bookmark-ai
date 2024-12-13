import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Text,
  useToast,
  Slide,
  useDisclosure,
  HStack,
  IconButton,
} from '@chakra-ui/react';
import { CloseIcon } from '@chakra-ui/icons';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    const handler = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show the prompt banner
      onOpen();
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, [onOpen]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      toast({
        title: 'Installation Started',
        description: 'BookmarkAI is being installed on your device',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }

    // Clear the deferredPrompt for the next time
    setDeferredPrompt(null);
    onClose();
  };

  // Don't show anything if there's no installation prompt
  if (!isOpen || !deferredPrompt) {
    return null;
  }

  return (
    <Slide direction="bottom" in={isOpen} style={{ zIndex: 10 }}>
      <Box
        p={4}
        bg="white"
        boxShadow="lg"
        position="fixed"
        bottom={0}
        width="100%"
        borderTopWidth={1}
      >
        <HStack justify="space-between" align="center" maxW="container.lg" mx="auto">
          <Text>
            Install BookmarkAI for easy access and mobile sharing
          </Text>
          <HStack spacing={4}>
            <Button
              colorScheme="blue"
              onClick={handleInstallClick}
              size="sm"
            >
              Install
            </Button>
            <IconButton
              aria-label="Close prompt"
              icon={<CloseIcon />}
              onClick={onClose}
              size="sm"
              variant="ghost"
            />
          </HStack>
        </HStack>
      </Box>
    </Slide>
  );
};

export default PWAInstallPrompt;
