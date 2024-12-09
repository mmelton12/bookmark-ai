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
} from '@chakra-ui/react';
import { DeleteIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { Bookmark } from '../../types';

interface BookmarkCardProps {
  bookmark: Bookmark;
  onDelete: (id: string) => Promise<void>;
}

const BookmarkCard: React.FC<BookmarkCardProps> = ({ bookmark, onDelete }) => {
  const toast = useToast();

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
      borderRadius="lg"
      bg="white"
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
          color="blue.600"
          fontSize="sm"
          noOfLines={1}
          display="flex"
          alignItems="center"
        >
          {bookmark.url}
          <ExternalLinkIcon mx="2px" />
        </Link>

        {bookmark.description && (
          <Text color="gray.600" fontSize="sm" noOfLines={2}>
            {bookmark.description}
          </Text>
        )}

        {bookmark.warning && (
          <Alert status="warning" size="sm">
            <AlertIcon />
            {bookmark.warning}
          </Alert>
        )}

        {isError ? (
          <Alert status="error" size="sm">
            <AlertIcon />
            {bookmark.aiSummary}
          </Alert>
        ) : (
          bookmark.aiSummary && (
            <Text color="gray.700" fontSize="sm" noOfLines={3}>
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
                  _hover={{ bg: 'blue.100' }}
                >
                  {tag}
                </Tag>
              ))}
            </HStack>
          </Box>
        )}

        <Text color="gray.500" fontSize="xs">
          Added {new Date(bookmark.createdAt).toLocaleDateString()}
        </Text>
      </VStack>
    </Box>
  );
};

export default BookmarkCard;
