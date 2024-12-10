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
} from '@chakra-ui/react';
import { HamburgerIcon, SunIcon, MoonIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { colorMode, toggleColorMode } = useColorMode();
  const bgColor = useColorModeValue('white', 'gray.800');

  const handleLogout = () => {
    logout();
    navigate('/login');
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
            <Tooltip label={colorMode === 'light' ? 'Dark mode' : 'Light mode'}>
              <IconButton
                aria-label="Toggle color mode"
                icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
                onClick={toggleColorMode}
                variant="ghost"
                mr={2}
              />
            </Tooltip>
            <Button
              onClick={handleLogout}
              colorScheme="brand"
              variant="outline"
            >
              Logout
            </Button>
          </Flex>

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
                <MenuItem onClick={toggleColorMode}>
                  {colorMode === 'light' ? 'Dark Mode' : 'Light Mode'}
                </MenuItem>
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
