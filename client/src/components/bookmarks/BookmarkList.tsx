import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Spinner,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  FaTrash,
  FaFolderOpen,
  FaTag,
  FaBookmark,
} from 'react-icons/fa';
import { useFolder } from '../../contexts/FolderContext';
import { bookmarkAPI } from '../../services/api';
import { Bookmark, PaginatedResponse } from '../../types';
import BookmarkCard from './BookmarkCard';

interface BookmarkListProps {
  onMove: (bookmarkIds: string[]) => void;
  onTag: (bookmarkIds: string[]) => void;
  onCategory: (bookmarkIds: string[]) => void;
  selectedTag?: string | null;
  selectedCategory?: 'Article' | 'Video' | 'Research' | null;
  onTagClick?: (tag: string) => void;
}

const BookmarkList: React.FC<BookmarkListProps> = ({ 
  onMove, 
  onTag,
  onCategory,
  selectedTag = null,
  selectedCategory = undefined,
  onTagClick
}) => {
  const { selectedFolder, refreshFolders, refreshTotalBookmarks } = useFolder();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBookmarks, setSelectedBookmarks] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchBookmarks = useCallback(async (pageNum: number) => {
    try {
      setLoadingMore(pageNum > 1);
      let response: PaginatedResponse<Bookmark>;
      
      const searchParams = {
        tags: selectedTag ? [selectedTag] : [],
        category: selectedCategory,
        favorite: selectedFolder === 'favorites' ? true : undefined,
        folderId: selectedFolder !== 'favorites' ? selectedFolder : undefined
      };

      response = await bookmarkAPI.search(searchParams, pageNum);
      
      if (pageNum === 1) {
        setBookmarks(response.data);
      } else {
        setBookmarks(prev => [...prev, ...response.data]);
      }
      setHasMore(response.hasMore);
      setError(null);
    } catch (err) {
      setError('Failed to fetch bookmarks');
      console.error('Error fetching bookmarks:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [selectedFolder, selectedTag, selectedCategory]);

  useEffect(() => {
    fetchBookmarks(1);
  }, [fetchBookmarks]);

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    setBookmarks([]);
  }, [selectedFolder, selectedTag, selectedCategory]);

  const handleCheckboxChange = (bookmarkId: string) => {
    setSelectedBookmarks(prev => {
      if (prev.includes(bookmarkId)) {
        return prev.filter(id => id !== bookmarkId);
      }
      return [...prev, bookmarkId];
    });
  };

  const handleBulkDelete = async () => {
    if (!selectedBookmarks.length) return;
    if (window.confirm('Are you sure you want to delete the selected bookmarks?')) {
      try {
        await Promise.all(selectedBookmarks.map(id => bookmarkAPI.delete(id)));
        setPage(1);
        await fetchBookmarks(1);
        await refreshFolders();
        await refreshTotalBookmarks();
        setSelectedBookmarks([]);
      } catch (error) {
        console.error('Failed to delete bookmarks:', error);
      }
    }
  };

  const handleToggleFavorite = async (bookmarkId: string) => {
    try {
      const bookmark = bookmarks.find(b => b._id === bookmarkId);
      if (bookmark) {
        await bookmarkAPI.updateBookmark(bookmarkId, {
          isFavorite: !bookmark.isFavorite,
        });
        setPage(1);
        await fetchBookmarks(1);
        await refreshTotalBookmarks();
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const handleDelete = async (bookmarkId: string) => {
    if (window.confirm('Are you sure you want to delete this bookmark?')) {
      try {
        await bookmarkAPI.delete(bookmarkId);
        setPage(1);
        await fetchBookmarks(1);
        await refreshFolders();
        await refreshTotalBookmarks();
      } catch (error) {
        console.error('Failed to delete bookmark:', error);
      }
    }
  };

  if (loading && page === 1) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={4}>
        <Spinner />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4}>
        <Text color="red.500">{error}</Text>
      </Box>
    );
  }

  if (!bookmarks.length) {
    return (
      <Box p={4}>
        <Text color="gray.500">No bookmarks found</Text>
      </Box>
    );
  }

  return (
    <VStack spacing={4} align="stretch" className="bookmark-list" pb={8}>
      {selectedBookmarks.length > 0 && (
        <HStack spacing={2} p={4}>
          <Button
            leftIcon={<FaTrash />}
            colorScheme="red"
            variant="outline"
            onClick={handleBulkDelete}
            size="sm"
          >
            Delete ({selectedBookmarks.length})
          </Button>
          <Button
            leftIcon={<FaFolderOpen />}
            colorScheme="blue"
            variant="outline"
            onClick={() => onMove(selectedBookmarks)}
            size="sm"
          >
            Move
          </Button>
          <Button
            leftIcon={<FaTag />}
            colorScheme="green"
            variant="outline"
            onClick={() => onTag(selectedBookmarks)}
            size="sm"
          >
            Tag
          </Button>
          <Button
            leftIcon={<FaBookmark />}
            colorScheme="purple"
            variant="outline"
            onClick={() => onCategory(selectedBookmarks)}
            size="sm"
          >
            Category
          </Button>
        </HStack>
      )}

      <VStack spacing={5} align="stretch">
        {bookmarks.map((bookmark) => (
          <Box key={bookmark._id}>
            <BookmarkCard
              bookmark={bookmark}
              onDelete={handleDelete}
              onTagClick={onTagClick || (() => {})}
              onToggleFavorite={handleToggleFavorite}
              onMove={onMove}
              onTag={onTag}
              onCategory={onCategory}
              isSelected={selectedBookmarks.includes(bookmark._id)}
              onSelect={handleCheckboxChange}
            />
          </Box>
        ))}
      </VStack>

      {hasMore && (
        <Box display="flex" justifyContent="center" p={4}>
          <Button
            isLoading={loadingMore}
            onClick={() => {
              setPage(prev => prev + 1);
              fetchBookmarks(page + 1);
            }}
          >
            Load More
          </Button>
        </Box>
      )}
    </VStack>
  );
};

export default BookmarkList;
