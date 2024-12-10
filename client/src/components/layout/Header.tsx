import React from 'react';
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
  Input,
  InputGroup,
  InputLeftElement,
  Avatar,
  Text,
  MenuDivider,
} from '@chakra-ui/react';
import { HamburgerIcon, SunIcon, MoonIcon, SearchIcon, SettingsIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSearch } from '../../contexts/SearchContext';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { colorMode, toggleColorMode } = useColorMode();
  const bgColor = useColorModeValue('white', 'gray.800');
  const { searchQuery, setSearchQuery } = useSearch();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
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

          {/* Search Input - Desktop */}
          <Box flex="1" mx={8} display={{ base: 'none', md: 'block' }}>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.300" />
              </InputLeftElement>
              <Input
                placeholder="Search bookmarks..."
                value={searchQuery}
                onChange={handleSearchChange}
                bg={useColorModeValue('white', 'gray.700')}
                borderRadius="full"
              />
            </InputGroup>
          </Box>

          <Flex alignItems="center" display={{ base: 'none', md: 'flex' }}>
            <Button variant="ghost" mr={2} onClick={() => navigate('/')}>
              Dashboard
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
                {/* Search Input - Mobile */}
                <Box px={4} py={2}>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <SearchIcon color="gray.300" />
                    </InputLeftElement>
                    <Input
                      placeholder="Search bookmarks..."
                      value={searchQuery}
                      onChange={handleSearchChange}
                      bg={useColorModeValue('white', 'gray.700')}
                    />
                  </InputGroup>
                </Box>
                <MenuDivider />
                <MenuItem onClick={() => navigate('/')}>Dashboard</MenuItem>
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
    </Box>
  );
};

export default Header;
