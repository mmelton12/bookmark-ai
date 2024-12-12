import React from 'react';
import {
  HStack,
  Heading,
  IconButton,
} from '@chakra-ui/react';
import { FaStar } from 'react-icons/fa';
import { Bookmark } from '../../../types';
import BookmarkCardMenu from './BookmarkCardMenu';

interface BookmarkCardHeaderProps {
  bookmark: Bookmark;
  onToggleFavorite: (id: string, isFavorite: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onMove: (bookmarkIds: string[]) => void;
  onTag: (bookmarkIds: string[]) => void;
  onCategory: (bookmarkIds: string[]) => void;
}

const BookmarkCardHeader: React.FC<BookmarkCardHeaderProps> = ({
  bookmark,
  onToggleFavorite,
  onDelete,
  onMove,
  onTag,
  onCategory
}) => {
  const starColor = bookmark.isFavorite ? 'yellow.400' : 'gray.300';

  return (
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
          onClick={() => onToggleFavorite(bookmark._id, !bookmark.isFavorite)}
          color={starColor}
        />
        <BookmarkCardMenu
          bookmarkId={bookmark._id}
          onDelete={onDelete}
          onMove={onMove}
          onTag={onTag}
          onCategory={onCategory}
        />
      </HStack>
    </HStack>
  );
};

export default BookmarkCardHeader;
