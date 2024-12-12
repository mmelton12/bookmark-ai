import React from 'react';
import {
  Text,
  Link,
  Alert,
  AlertIcon,
  useColorModeValue,
  Badge,
  Box,
} from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { Bookmark } from '../../../types';

interface BookmarkCardContentProps {
  bookmark: Bookmark;
}

const BookmarkCardContent: React.FC<BookmarkCardContentProps> = ({ bookmark }) => {
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const summaryColor = useColorModeValue('gray.700', 'gray.200');
  const linkColor = useColorModeValue('blue.600', 'blue.300');

  const isError = bookmark.aiSummary?.toLowerCase().includes('failed') ||
                 bookmark.aiSummary?.toLowerCase().includes('error');

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Article':
        return 'blue';
      case 'Video':
        return 'red';
      case 'Research':
        return 'green';
      default:
        return 'gray';
    }
  };

  return (
    <>
      <Box display="flex" alignItems="center" mb={2}>
        <Link
          href={bookmark.url}
          isExternal
          color={linkColor}
          fontSize="sm"
          noOfLines={1}
          display="flex"
          alignItems="center"
          flex="1"
        >
          {bookmark.url}
          <ExternalLinkIcon mx="2px" />
        </Link>
        <Badge colorScheme={getCategoryColor(bookmark.category)} ml={2}>
          {bookmark.category}
        </Badge>
      </Box>

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
    </>
  );
};

export default BookmarkCardContent;
