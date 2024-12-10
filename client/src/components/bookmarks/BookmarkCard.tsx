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
} from '@chakra-ui/react';
import { DeleteIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { Bookmark } from '../../types';

interface BookmarkCardProps {
  bookmark: Bookmark;
  onDelete: (id: string) => Promise<void>;
  onTagClick: (tag: string) => void;
}

const BookmarkCard: React.FC<BookmarkCardProps> = ({ bookmark, onDelete, onTagClick }) => {
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const summaryColor = useColorModeValue('gray.700', 'gray.200');
  const linkColor = useColorModeValue('blue.600', 'blue.300');
  const dateColor = useColorModeValue('gray.500', 'gray.400');
  const tagHoverBg = useColorModeValue('blue.100', 'blue.700');

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
          <IconButton
            aria-label="Delete bookmark"
            icon={<DeleteIcon />}
            size="sm"
            colorScheme="red"
            variant="ghost"
            onClick={handleDelete}
          />
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
