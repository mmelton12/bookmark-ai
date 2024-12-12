import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  useToast,
  Avatar,
  Divider,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Card,
  CardBody,
  FormControl,
  FormLabel,
  Input,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  InputGroup,
  InputRightElement,
  IconButton,
  Spinner,
  Select,
  FormHelperText,
} from '@chakra-ui/react';
import { useAuth } from '../../contexts/AuthContext';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { bookmarkAPI } from '../../services/api';
import BookmarkImport from '../bookmarks/BookmarkImport';

const ChangePasswordModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { updatePassword } = useAuth();
  const toast = useToast();

  const handleSubmit = async () => {
    if (!currentPassword || !newPassword) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      await updatePassword(currentPassword, newPassword);
      toast({
        title: 'Success',
        description: 'Password updated successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      onClose();
      setCurrentPassword('');
      setNewPassword('');
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update password',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Change Password</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>Current Password</FormLabel>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <FormLabel>New Password</FormLabel>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </FormControl>
            <Button
              colorScheme="blue"
              onClick={handleSubmit}
              isLoading={isLoading}
              width="full"
            >
              Update Password
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

const AccountSettings: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const toast = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [openAiKey, setOpenAiKey] = useState(user?.openAiKey || '');
  const [claudeKey, setClaudeKey] = useState(user?.claudeKey || '');
  const [aiProvider, setAiProvider] = useState<'openai' | 'claude'>(user?.aiProvider || 'openai');
  const [showOpenAiKey, setShowOpenAiKey] = useState(false);
  const [showClaudeKey, setShowClaudeKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { isOpen: isPasswordModalOpen, onOpen: onPasswordModalOpen, onClose: onPasswordModalClose } = useDisclosure();
  const { isOpen: isImportModalOpen, onOpen: onImportModalOpen, onClose: onImportModalClose } = useDisclosure();
  const [stats, setStats] = useState({ totalBookmarks: 0, tagsCount: 0 });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const fetchStats = async () => {
    try {
      const statsData = await bookmarkAPI.getStats();
      setStats(statsData);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      toast({
        title: 'Error',
        description: 'Failed to load account statistics',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleUpdateProfile = async () => {
    setIsLoading(true);
    try {
      await updateProfile({ 
        name, 
        email, 
        openAiKey, 
        claudeKey,
        aiProvider 
      });
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update profile',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportComplete = () => {
    // Refresh stats after import
    setIsLoadingStats(true);
    fetchStats();
  };

  return (
    <VStack spacing={8} align="stretch" w="full" maxW="container.lg" mx="auto" p={4}>
      <Heading size="lg">Account Settings</Heading>

      {/* Profile Section */}
      <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
        <CardBody>
          <VStack spacing={6} align="start">
            <Heading size="md">Profile Information</Heading>
            <Box display="flex" alignItems="center" gap={4}>
              <Avatar
                size="xl"
                name={user?.name || user?.email}
                src={user?.picture}
              />
              <VStack align="start" spacing={4} flex="1">
                {isEditing ? (
                  <>
                    <FormControl>
                      <FormLabel>Name</FormLabel>
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your name"
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Email</FormLabel>
                      <Input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        type="email"
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>AI Provider</FormLabel>
                      <Select
                        value={aiProvider}
                        onChange={(e) => setAiProvider(e.target.value as 'openai' | 'claude')}
                      >
                        <option value="openai">OpenAI (GPT-4)</option>
                        <option value="claude">Anthropic (Claude)</option>
                      </Select>
                      <FormHelperText>
                        Select which AI provider to use for analyzing bookmarks
                      </FormHelperText>
                    </FormControl>
                    <FormControl>
                      <FormLabel>OpenAI API Key</FormLabel>
                      <InputGroup>
                        <Input
                          type={showOpenAiKey ? 'text' : 'password'}
                          value={openAiKey}
                          onChange={(e) => setOpenAiKey(e.target.value)}
                          placeholder="Enter your OpenAI API key"
                        />
                        <InputRightElement>
                          <IconButton
                            aria-label={showOpenAiKey ? 'Hide API key' : 'Show API key'}
                            icon={showOpenAiKey ? <ViewOffIcon /> : <ViewIcon />}
                            onClick={() => setShowOpenAiKey(!showOpenAiKey)}
                            variant="ghost"
                          />
                        </InputRightElement>
                      </InputGroup>
                    </FormControl>
                    <FormControl>
                      <FormLabel>Claude API Key</FormLabel>
                      <InputGroup>
                        <Input
                          type={showClaudeKey ? 'text' : 'password'}
                          value={claudeKey}
                          onChange={(e) => setClaudeKey(e.target.value)}
                          placeholder="Enter your Claude API key"
                        />
                        <InputRightElement>
                          <IconButton
                            aria-label={showClaudeKey ? 'Hide API key' : 'Show API key'}
                            icon={showClaudeKey ? <ViewOffIcon /> : <ViewIcon />}
                            onClick={() => setShowClaudeKey(!showClaudeKey)}
                            variant="ghost"
                          />
                        </InputRightElement>
                      </InputGroup>
                    </FormControl>
                  </>
                ) : (
                  <>
                    <Text fontWeight="bold" fontSize="lg">
                      {user?.name || 'No name set'}
                    </Text>
                    <Text color="gray.500">{user?.email}</Text>
                    <Text color="gray.500">
                      AI Provider: {user?.aiProvider === 'claude' ? 'Claude' : 'OpenAI'}
                    </Text>
                    <Text color="gray.500">
                      OpenAI API Key: {user?.openAiKey ? '••••••••••••••••' : 'Not set'}
                    </Text>
                    <Text color="gray.500">
                      Claude API Key: {user?.claudeKey ? '••••••••••••••••' : 'Not set'}
                    </Text>
                  </>
                )}
              </VStack>
            </Box>
            {isEditing ? (
              <Box>
                <Button
                  colorScheme="blue"
                  mr={3}
                  onClick={handleUpdateProfile}
                  isLoading={isLoading}
                >
                  Save Changes
                </Button>
                <Button variant="ghost" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </Box>
            ) : (
              <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
            )}
          </VStack>
        </CardBody>
      </Card>

      <Divider />

      {/* Account Statistics */}
      <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
        <CardBody>
          <VStack spacing={6} align="start">
            <Heading size="md">Account Statistics</Heading>
            {isLoadingStats ? (
              <Box w="full" display="flex" justifyContent="center">
                <Spinner />
              </Box>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} w="full">
                <Stat>
                  <StatLabel>Total Bookmarks</StatLabel>
                  <StatNumber>{stats.totalBookmarks}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel>Tags Used</StatLabel>
                  <StatNumber>{stats.tagsCount}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel>Member Since</StatLabel>
                  <StatNumber>
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : 'N/A'}
                  </StatNumber>
                </Stat>
              </SimpleGrid>
            )}
          </VStack>
        </CardBody>
      </Card>

      {/* Data Management Section */}
      <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
        <CardBody>
          <VStack spacing={6} align="start">
            <Heading size="md">Data Management</Heading>
            <Text>Import bookmarks from your browser or export your existing bookmarks.</Text>
            <Button colorScheme="blue" onClick={onImportModalOpen}>
              Import Bookmarks
            </Button>
          </VStack>
        </CardBody>
      </Card>

      {/* Account Security */}
      <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
        <CardBody>
          <VStack spacing={6} align="start">
            <Heading size="md">Security</Heading>
            <Button colorScheme="blue" variant="outline" onClick={onPasswordModalOpen}>
              Change Password
            </Button>
            <Button colorScheme="red" variant="ghost">
              Delete Account
            </Button>
          </VStack>
        </CardBody>
      </Card>

      <ChangePasswordModal isOpen={isPasswordModalOpen} onClose={onPasswordModalClose} />
      <BookmarkImport 
        isOpen={isImportModalOpen} 
        onClose={onImportModalClose}
        onComplete={handleImportComplete}
      />
    </VStack>
  );
};

export default AccountSettings;
