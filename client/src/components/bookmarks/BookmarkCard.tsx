import React from 'react';
import {
  Box,
  Heading,
  Text,
  Tag,
  HStack,
  IconButton,
  useToast,
  VStack,
  Link,
  Alert,
  AlertIcon,
  useColorModeValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react';
import { DeleteIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { FaStar, FaEllipsisV, FaFolderOpen, FaTag, FaBookmark } from 'react-icons/fa';
import { Bookmark } from '../../types';

interface BookmarkCardProps {
  bookmark: Bookmark;
  onDelete: (id: string) => Promise<void>;
  onTagClick: (tag: string) => void;
  onToggleFavorite: (id: string, isFavorite: boolean) => Promise<void>;
  onMove: (bookmarkIds: string[]) => void;
  onTag: (bookmarkIds: string[]) => void;
  onCategory: (bookmarkIds: string[]) => void;
}

const BookmarkCard: React.FC<BookmarkCardProps> = ({ 
  bookmark, 
  onDelete, 
  onTagClick, 
  onToggleFavorite,
  onMove,
  onTag,
  onCategory
}) => {
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const summaryColor = useColorModeValue('gray.700', 'gray.200');
  const linkColor = useColorModeValue('blue.600', 'blue.300');
  const dateColor = useColorModeValue('gray.500', 'gray.400');
  const tagHoverBg = useColorModeValue('blue.100', 'blue.700');
  const starColor = bookmark.isFavorite ? 'yellow.400' : 'gray.300';

  const handleDelete = async () => {
    try {
      await onDelete(bookmark._id);
    } catch (error) {
      toast({
        title: 'Error deleting bookmark',
        description: error instanceof Error ? error.message : 'Failed to delete bookmark',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleToggleFavorite = async () => {
    try {
      await onToggleFavorite(bookmark._id, !bookmark.isFavorite);
    } catch (error) {
      toast({
        title: 'Error updating favorite status',
        description: error instanceof Error ? error.message : 'Failed to update favorite status',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const isError = bookmark.aiSummary?.toLowerCase().includes('failed') ||
                 bookmark.aiSummary?.toLowerCase().includes('error');

  return (
    <Box
      p={5}
      shadow="md"
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="lg"
      bg={bgColor}
      position="relative"
      _hover={{ shadow: 'lg' }}
      transition="all 0.2s"
    >
      <VStack align="stretch" spacing={3}>
        <HStack justify="space-between" align="flex-start">
          <Heading size="md" noOfLines={2}>
            {bookmark.title || bookmark.url}
          </Heading>
          <HStack>
            <IconButton
              aria-label={bookmark.isFavorite ? "Remove from favorites" : "Add to favorites"}
              icon={<FaStar />}
              size="sm"
              colorScheme={bookmark.isFavorite ? "yellow" : "gray"}
              variant="ghost"
              onClick={handleToggleFavorite}
              color={starColor}
            />
            <Menu>
              <MenuButton
                as={IconButton}
                aria-label="Options"
                icon={<FaEllipsisV />}
                variant="ghost"
                size="sm"
              />
              <MenuList>
                <MenuItem
                  icon={<FaFolderOpen />}
                  onClick={() => onMove([bookmark._id])}
                >
                  Move
                </MenuItem>
                <MenuItem
                  icon={<FaTag />}
                  onClick={() => onTag([bookmark._id])}
                >
                  Edit Tags
                </MenuItem>
                <MenuItem
                  icon={<FaBookmark />}
                  onClick={() => onCategory([bookmark._id])}
                >
                  Change Category
                </MenuItem>
                <MenuItem
                  icon={<DeleteIcon />}
                  onClick={handleDelete}
                >
                  Delete
                </MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        </HStack>

        <Link
          href={bookmark.url}
          isExternal
          color={linkColor}
          fontSize="sm"
          noOfLines={1}
          display="flex"
          alignItems="center"
        >
          {bookmark.url}
          <ExternalLinkIcon mx="2px" />
        </Link>

        {bookmark.description && (
          <Text color={textColor} fontSize="sm" noOfLines={2}>
            {bookmark.description}
          </Text>
        )}

        {bookmark.warning && (
          <Alert status="warning" size="sm" variant="left-accent">
            <AlertIcon />
            {bookmark.warning}
          </Alert>
        )}

        {isError ? (
          <Alert status="error" size="sm" variant="left-accent">
            <AlertIcon />
            {bookmark.aiSummary}
          </Alert>
        ) : (
          bookmark.aiSummary && (
            <Text color={summaryColor} fontSize="sm" noOfLines={3}>
              <Text as="span" fontWeight="semibold">AI Summary: </Text>
              {bookmark.aiSummary}
            </Text>
          )
        )}

        {bookmark.tags && bookmark.tags.length > 0 && (
          <Box>
            <HStack spacing={2} flexWrap="wrap">
              {bookmark.tags.map((tag, index) => (
                <Tag
                  key={`${tag}-${index}`}
                  size="sm"
                  colorScheme="blue"
                  variant="subtle"
                  cursor="pointer"
                  _hover={{ bg: tagHoverBg }}
                  onClick={() => onTagClick(tag)}
                >
                  {tag}
                </Tag>
              ))}
            </HStack>
          </Box>
        )}

        <Text color={dateColor} fontSize="xs">
          Added {new Date(bookmark.createdAt).toLocaleDateString()}
        </Text>
      </VStack>
    </Box>
  );
};

export default BookmarkCard;
