import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  IconButton,
  Checkbox,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  Tag,
  Spinner,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  FaEllipsisV,
  FaFolderOpen,
  FaTag,
  FaTrash,
  FaStar,
  FaRegStar,
  FaBookmark,
} from 'react-icons/fa';
import { useFolder } from '../../contexts/FolderContext';
import { bookmarkAPI } from '../../services/api';
import { Bookmark } from '../../types';

interface BookmarkListProps {
  onMove: (bookmarkIds: string[]) => void;
  onTag: (bookmarkIds: string[]) => void;
  onCategory: (bookmarkIds: string[]) => void;
  searchQuery?: string;
  selectedTag?: string | null;
  selectedCategory?: 'Article' | 'Video' | 'Research' | null;
  onTagClick?: (tag: string) => void;
}

const BookmarkList: React.FC<BookmarkListProps> = ({ 
  onMove, 
  onTag,
  onCategory,
  searchQuery = '', 
  selectedTag = null,
  selectedCategory = undefined,
  onTagClick
}) => {
  const { selectedFolder, refreshFolders } = useFolder();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBookmarks, setSelectedBookmarks] = useState<string[]>([]);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const fetchBookmarks = useCallback(async () => {
    try {
      setLoading(true);
      let response;
      
      if (searchQuery || selectedTag || selectedCategory) {
        // Use search endpoint when there's a search query, selected tag, or category
        response = await bookmarkAPI.search({
          query: searchQuery,
          tags: selectedTag ? [selectedTag] : [],
          folderId: selectedFolder,
          category: selectedCategory
        });
      } else {
        // Use regular getBookmarks endpoint when no search/filter is active
        response = await bookmarkAPI.getBookmarks(selectedFolder);
      }
      
      setBookmarks(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch bookmarks');
      console.error('Error fetching bookmarks:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedFolder, searchQuery, selectedTag, selectedCategory]);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

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
        await fetchBookmarks();
        await refreshFolders(); // Refresh folder counts after deletion
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
        await fetchBookmarks();
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const getCategoryColor = (category: 'Article' | 'Video' | 'Research'): string => {
    switch (category) {
      case 'Article':
        return 'purple';
      case 'Video':
        return 'red';
      case 'Research':
        return 'green';
      default:
        return 'gray';
    }
  };

  if (loading) {
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
    <VStack spacing={4} align="stretch">
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

      <VStack spacing={2} align="stretch">
        {bookmarks.map((bookmark) => (
          <Box
            key={bookmark._id}
            p={4}
            borderWidth="1px"
            borderRadius="md"
            bg={bgColor}
            borderColor={borderColor}
          >
            <HStack align="flex-start">
              <Checkbox
                isChecked={selectedBookmarks.includes(bookmark._id)}
                onChange={() => handleCheckboxChange(bookmark._id)}
                mt={1}
              />
              <Box flex={1}>
                <HStack justify="space-between" mb={2}>
                  <Text fontWeight="bold" fontSize="lg">
                    <a href={bookmark.url} target="_blank" rel="noopener noreferrer">
                      {bookmark.title}
                    </a>
                  </Text>
                  <HStack>
                    <IconButton
                      aria-label={bookmark.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                      icon={bookmark.isFavorite ? <FaStar /> : <FaRegStar />}
                      color={bookmark.isFavorite ? 'yellow.400' : 'gray.400'}
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleFavorite(bookmark._id)}
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
                          icon={<FaTrash />}
                          onClick={async () => {
                            if (window.confirm('Are you sure you want to delete this bookmark?')) {
                              try {
                                await bookmarkAPI.delete(bookmark._id);
                                await fetchBookmarks();
                                await refreshFolders(); // Refresh folder counts after deletion
                              } catch (error) {
                                console.error('Failed to delete bookmark:', error);
                              }
                            }
                          }}
                        >
                          Delete
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  </HStack>
                </HStack>
                <Text color="blue.500" mb={2}>
                  <a href={bookmark.url} target="_blank" rel="noopener noreferrer">
                    {bookmark.url}
                  </a>
                </Text>
                <Text mb={3}>{bookmark.aiSummary || bookmark.description}</Text>
                <HStack spacing={2} wrap="wrap">
                  {bookmark.category && (
                    <Tag 
                      size="sm" 
                      colorScheme={getCategoryColor(bookmark.category)}
                      variant="solid"
                      mr={2}
                    >
                      {bookmark.category}
                    </Tag>
                  )}
                  {bookmark.tags.map((tag) => (
                    <Tag 
                      key={tag} 
                      size="sm" 
                      cursor="pointer"
                      colorScheme="blue"
                      variant="subtle"
                      onClick={() => onTagClick?.(tag)}
                    >
                      {tag}
                    </Tag>
                  ))}
                </HStack>
              </Box>
            </HStack>
          </Box>
        ))}
      </VStack>
    </VStack>
  );
};

export default BookmarkList;
