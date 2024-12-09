import React from 'react';
import {
  Box,
  Flex,
  Button,
  Heading,
  useColorModeValue,
  Container,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react';
import { HamburgerIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box
      as="header"
      bg={bgColor}
      borderBottom="1px"
      borderColor={borderColor}
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

          <Box display={{ base: 'none', md: 'block' }}>
            <Button variant="ghost" mr={2} onClick={() => navigate('/')}>
              Dashboard
            </Button>
            <Button
              onClick={handleLogout}
              colorScheme="brand"
              variant="outline"
            >
              Logout
            </Button>
          </Box>

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
