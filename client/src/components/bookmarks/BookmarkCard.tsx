import React from 'react';
import {
  Box,
  VStack,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { Bookmark } from '../../types';
import BookmarkCardHeader from './card/BookmarkCardHeader';
import BookmarkCardContent from './card/BookmarkCardContent';
import BookmarkCardFooter from './card/BookmarkCardFooter';

interface BookmarkCardProps {
  bookmark: Bookmark;
  onDelete: (id: string) => Promise<void>;
  onTagClick: (tag: string) => void;
  onToggleFavorite: (id: string, isFavorite: boolean) => Promise<void>;
  onMove: (bookmarkIds: string[]) => void;
  onTag: (bookmarkIds: string[]) => void;
  onCategory: (bookmarkIds: string[]) => void;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
}

const BookmarkCard: React.FC<BookmarkCardProps> = ({
  bookmark,
  onDelete,
  onTagClick,
  onToggleFavorite,
  onMove,
  onTag,
  onCategory,
  isSelected,
  onSelect
}) => {
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

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

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('bookmarkId', bookmark._id);
    e.dataTransfer.effectAllowed = 'move';
  };

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
      draggable="true"
      onDragStart={handleDragStart}
      cursor="grab"
      _active={{ cursor: 'grabbing' }}
    >
      <VStack align="stretch" spacing={3}>
        <BookmarkCardHeader
          bookmark={bookmark}
          onToggleFavorite={handleToggleFavorite}
          onDelete={handleDelete}
          onMove={onMove}
          onTag={onTag}
          onCategory={onCategory}
          isSelected={isSelected}
          onSelect={onSelect}
        />
        <BookmarkCardContent bookmark={bookmark} />
        <BookmarkCardFooter
          bookmark={bookmark}
          onTagClick={onTagClick}
        />
      </VStack>
    </Box>
  );
};

export default BookmarkCard;
