import React, { useState } from 'react';
import {
  Box,
  Flex,
  Button,
  Heading,
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
} from '@chakra-ui/react';
import { HamburgerIcon, SunIcon, MoonIcon, SearchIcon, SettingsIcon, AddIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { bookmarkAPI } from '../../services/api';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { colorMode, toggleColorMode } = useColorMode();
  const bgColor = useColorModeValue('white', 'gray.800');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [newBookmarkUrl, setNewBookmarkUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleAddBookmark = async () => {
    if (!newBookmarkUrl.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a URL',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      setIsLoading(true);
      await bookmarkAPI.create(newBookmarkUrl);
      setNewBookmarkUrl('');
      onClose();
      toast({
        title: 'Success',
        description: 'Bookmark added successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      // Refresh the current page to show the new bookmark
      window.location.reload();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add bookmark',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      as="header"
      bg={bgColor}
      borderBottom="1px"
      borderColor="chakra-border-color"
      position="sticky"
      top={0}
      zIndex={10}
      shadow="sm"
    >
      <Container maxW="container.xl">
        <Flex py={4} alignItems="center" justifyContent="space-between">
          <Heading
            size="md"
            cursor="pointer"
            onClick={() => navigate('/')}
            color="brand.500"
          >
            BookmarkAI
          </Heading>

          <Flex alignItems="center" display={{ base: 'none', md: 'flex' }}>
            <Button variant="ghost" mr={2} onClick={() => navigate('/')}>
              Dashboard
            </Button>
            <Button
              variant="ghost"
              mr={2}
              leftIcon={<SearchIcon />}
              onClick={() => navigate('/search')}
            >
              Search
            </Button>
            <Button
              variant="ghost"
              mr={2}
              leftIcon={<AddIcon />}
              onClick={onOpen}
            >
              Add Bookmark
            </Button>
            <Tooltip label={colorMode === 'light' ? 'Dark mode' : 'Light mode'}>
              <IconButton
                aria-label="Toggle color mode"
                icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
                onClick={toggleColorMode}
                variant="ghost"
                mr={2}
              />
            </Tooltip>
            
            {/* Account Menu */}
            <Menu>
              <MenuButton>
                <Avatar
                  size="sm"
                  name={user?.name || user?.email}
                  src={user?.picture}
                  cursor="pointer"
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
                <MenuItem onClick={() => navigate('/')}>Dashboard</MenuItem>
                <MenuItem onClick={() => navigate('/search')}>Search</MenuItem>
                <MenuItem onClick={onOpen}>Add Bookmark</MenuItem>
                <MenuItem onClick={() => navigate('/account')}>Account Settings</MenuItem>
                <MenuItem onClick={toggleColorMode}>
                  {colorMode === 'light' ? 'Dark Mode' : 'Light Mode'}
                </MenuItem>
                <MenuDivider />
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </MenuList>
            </Menu>
          </Box>
        </Flex>
      </Container>

      {/* Add Bookmark Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New Bookmark</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl>
              <FormLabel>URL</FormLabel>
              <Input
                value={newBookmarkUrl}
                onChange={(e) => setNewBookmarkUrl(e.target.value)}
                placeholder="Enter URL"
              />
            </FormControl>
            <Button
              mt={4}
              colorScheme="blue"
              onClick={handleAddBookmark}
              isLoading={isLoading}
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
