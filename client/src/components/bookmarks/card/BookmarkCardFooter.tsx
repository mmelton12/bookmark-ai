import React from 'react';
import {
  Box,
  Text,
  Tag,
  HStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { Bookmark } from '../../../types';

interface BookmarkCardFooterProps {
  bookmark: Bookmark;
  onTagClick: (tag: string) => void;
}

const BookmarkCardFooter: React.FC<BookmarkCardFooterProps> = ({
  bookmark,
  onTagClick,
}) => {
  const dateColor = useColorModeValue('gray.500', 'gray.400');
  const tagHoverBg = useColorModeValue('blue.100', 'blue.700');

  return (
    <>
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
    </>
  );
};

export default BookmarkCardFooter;
