import React from 'react';
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
  Text,
  Image,
} from '@chakra-ui/react';
import { HamburgerIcon, SunIcon, MoonIcon, QuestionIcon } from '@chakra-ui/icons';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

const PublicHeader: React.FC = () => {
  const navigate = useNavigate();
  const { colorMode, toggleColorMode } = useColorMode();
  const bgColor = useColorModeValue('white', 'gray.800');

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
            onClick={() => navigate('/')}
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
            <Button
              as={RouterLink}
              to="/faq"
              variant="ghost"
              mr={2}
              leftIcon={<QuestionIcon />}
            >
              FAQ
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
            <Button variant="ghost" mr={2} onClick={() => navigate('/login')}>
              Sign In
            </Button>
            <Button colorScheme="blue" onClick={() => navigate('/signup')}>
              Sign Up
            </Button>
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
                <MenuItem onClick={() => navigate('/faq')}>FAQ</MenuItem>
                <MenuItem onClick={() => navigate('/login')}>Sign In</MenuItem>
                <MenuItem onClick={() => navigate('/signup')}>Sign Up</MenuItem>
                <MenuItem onClick={toggleColorMode}>
                  {colorMode === 'light' ? 'Dark Mode' : 'Light Mode'}
                </MenuItem>
              </MenuList>
            </Menu>
          </Box>
        </Flex>
      </Container>
    </Box>
  );
};

export default PublicHeader;
