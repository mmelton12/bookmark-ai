import React, { useState } from 'react';
import {
  Box,
  Flex,
  Button,
  Container,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorMode,
  useColorModeValue,
  Tooltip,
  Avatar,
  Text,
  MenuDivider,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  useDisclosure,
  useToast,
  Alert,
  AlertIcon,
  Progress,
  Image,
  Link,
} from '@chakra-ui/react';
import { HamburgerIcon, SunIcon, MoonIcon, SearchIcon, SettingsIcon, AddIcon, QuestionIcon } from '@chakra-ui/icons';
import { FaFolder } from 'react-icons/fa';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useFolder } from '../../contexts/FolderContext';
import { bookmarkAPI } from '../../services/api';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { setSelectedFolder } = useFolder();
  const { colorMode, toggleColorMode } = useColorMode();
  const bgColor = useColorModeValue('white', 'gray.800');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [newBookmarkUrl, setNewBookmarkUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDashboardClick = () => {
    setSelectedFolder(null);
    navigate('/');
  };

  const handleOpenChat = () => {
    window.dispatchEvent(new Event('openChatBot'));
  };

  const handleAddBookmark = async () => {
    if (!newBookmarkUrl.trim()) {
      setError('Please enter a URL');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      let url = newBookmarkUrl;
      if (!/^https?:\/\//i.test(url)) {
        url = 'http://' + url;
      }

      const bookmark = await bookmarkAPI.create(url);
      setNewBookmarkUrl('');
      onClose();
      
      window.dispatchEvent(new Event('bookmarkCreated'));
      
      toast({
        title: 'Success',
        description: 'Bookmark added successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      if (window.location.pathname !== '/dashboard') {
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('Error adding bookmark:', error);
      if (error.message === 'This URL has already been bookmarked') {
        setError('This URL has already been bookmarked');
      } else if (error.message.includes('OpenAI API key')) {
        setError('Please add your OpenAI API key in Account Settings');
      } else {
        setError(error.message || 'Failed to add bookmark');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenFolders = () => {
    if ((window as any).openFolderDrawer) {
      (window as any).openFolderDrawer();
    }
  };

  const handleModalClose = () => {
    setError(null);
    setNewBookmarkUrl('');
    onClose();
  };

  const getAvatarSrc = () => {
    if (user?.picture) {
      return `${user.picture}?t=${Date.now()}`;
    }
    return undefined;
  };

  return (
    <Box
      as="header"
      bg={bgColor}
      borderBottom="1px"
      borderColor="chakra-border-color"
      position="fixed"
      top={0}
      left={0}
      right={0}
      zIndex={1000}
      shadow="sm"
    >
      <Container maxW="container.xl">
        <Flex py={4} alignItems="center" justifyContent="space-between">
          <Flex
            alignItems="center"
            cursor="pointer"
            onClick={handleDashboardClick}
          >
            <Image
              src="/logo-bookmarkai.svg"
              alt="BookmarkAI Logo"
              height="32px"
              mr={2}
            />
            <Text
              fontSize="xl"
              fontWeight="bold"
              color="brand.500"
            >
              BookmarkAI
            </Text>
          </Flex>

          <Flex alignItems="center" display={{ base: 'none', md: 'flex' }}>
            {user ? (
              <>
                <Button variant="ghost" mr={2} onClick={handleDashboardClick}>
                  Dashboard
                </Button>
                <Button
                  variant="ghost"
                  mr={2}
                  leftIcon={<SearchIcon />}
                  onClick={handleOpenChat}
                  className="search-bar"
                >
                  Search
                </Button>
                <Button
                  variant="ghost"
                  mr={2}
                  leftIcon={<AddIcon />}
                  onClick={onOpen}
                  className="add-bookmark"
                >
                  Add Bookmark
                </Button>
              </>
            ) : (
              <>
                <Link as={RouterLink} to="/faq">
                  <Button variant="ghost" mr={2} leftIcon={<QuestionIcon />}>
                    FAQ
                  </Button>
                </Link>
              </>
            )}
            <Tooltip label={colorMode === 'light' ? 'Dark mode' : 'Light mode'}>
              <IconButton
                aria-label="Toggle color mode"
                icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
                onClick={toggleColorMode}
                variant="ghost"
                mr={2}
              />
            </Tooltip>
            
            {user ? (
              <Menu>
                <MenuButton>
                  <Avatar
                    size="sm"
                    name={user?.name || user?.email}
                    src={getAvatarSrc()}
                    cursor="pointer"
                    className="account-settings"
                  />
                </MenuButton>
                <MenuList>
                  <Box px={3} py={2}>
                    <Text fontWeight="medium">{user?.name || 'User'}</Text>
                    <Text fontSize="sm" color="gray.500">
                      {user?.email}
                    </Text>
                  </Box>
                  <MenuDivider />
                  <MenuItem icon={<SettingsIcon />} onClick={() => navigate('/account')}>
                    Account Settings
                  </MenuItem>
                  <MenuDivider />
                  <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </MenuList>
              </Menu>
            ) : (
              <>
                <Button variant="ghost" mr={2} onClick={() => navigate('/login')}>
                  Sign In
                </Button>
                <Button colorScheme="blue" onClick={() => navigate('/signup')}>
                  Sign Up
                </Button>
              </>
            )}
          </Flex>

          {/* Mobile Menu */}
          <Box display={{ base: 'block', md: 'none' }}>
            <Menu>
              <MenuButton
                as={IconButton}
                icon={<HamburgerIcon />}
                variant="ghost"
                aria-label="Menu"
              />
              <MenuList>
                {user ? (
                  <>
                    <MenuItem onClick={handleDashboardClick}>Dashboard</MenuItem>
                    <MenuItem onClick={handleOpenChat}>Search</MenuItem>
                    <MenuItem onClick={onOpen}>Add Bookmark</MenuItem>
                    <MenuItem icon={<FaFolder />} onClick={handleOpenFolders}>Folders</MenuItem>
                    <MenuItem onClick={() => navigate('/account')}>Account Settings</MenuItem>
                  </>
                ) : (
                  <>
                    <MenuItem onClick={() => navigate('/faq')}>FAQ</MenuItem>
                    <MenuItem onClick={() => navigate('/login')}>Sign In</MenuItem>
                    <MenuItem onClick={() => navigate('/signup')}>Sign Up</MenuItem>
                  </>
                )}
                <MenuItem onClick={toggleColorMode}>
                  {colorMode === 'light' ? 'Dark Mode' : 'Light Mode'}
                </MenuItem>
                {user && (
                  <>
                    <MenuDivider />
                    <MenuItem onClick={handleLogout}>Logout</MenuItem>
                  </>
                )}
              </MenuList>
            </Menu>
          </Box>
        </Flex>
      </Container>

      {/* Add Bookmark Modal */}
      <Modal isOpen={isOpen} onClose={handleModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New Bookmark</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {error && (
              <Alert status="error" mb={4}>
                <AlertIcon />
                {error}
              </Alert>
            )}
            <FormControl>
              <FormLabel>URL</FormLabel>
              <Input
                value={newBookmarkUrl}
                onChange={(e) => setNewBookmarkUrl(e.target.value)}
                placeholder="Enter URL"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddBookmark();
                  }
                }}
              />
            </FormControl>
            {isLoading && (
              <Box mt={4}>
                <Text mb={2} fontSize="sm" color="gray.600">
                  Analyzing content and generating summary...
                </Text>
                <Progress size="xs" isIndeterminate />
              </Box>
            )}
            <Button
              mt={4}
              colorScheme="blue"
              onClick={handleAddBookmark}
              isLoading={isLoading}
              width="100%"
            >
              Add Bookmark
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Header;
