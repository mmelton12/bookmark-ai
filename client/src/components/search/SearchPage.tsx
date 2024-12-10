import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  VStack,
  Box,
  Input,
  Button,
  Text,
  HStack,
  Tag,
  TagLabel,
  TagCloseButton,
  useToast,
} from '@chakra-ui/react';
import { bookmarkAPI } from '../../services/api';
import BookmarkList from '../bookmarks/BookmarkList';
import { useSearch } from '../../contexts/SearchContext';

const SearchPage: React.FC = () => {
  const toast = useToast();
  const { searchQuery, setSearchQuery } = useSearch();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<Array<{ name: string; count: number }>>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const tags = await bookmarkAPI.getTags();
      setAvailableTags(tags);
    } catch (error) {
      console.error('Failed to fetch tags:', error);
      toast({
        title: 'Error fetching tags',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleTagClick = useCallback((tagName: string) => {
    setSelectedTags(prev => {
      if (prev.includes(tagName)) {
        return prev.filter(tag => tag !== tagName);
      }
      return [...prev, tagName];
    });
  }, []);

  const handleTagRemove = useCallback((tagName: string) => {
    setSelectedTags(prev => prev.filter(tag => tag !== tagName));
  }, []);

  const handleSearch = () => {
    setIsLoading(true);
    try {
      // The actual search is handled by BookmarkList component
    } finally {
      setIsLoading(false);
    }
  };

  const handleMoveBookmarks = async (bookmarkIds: string[]) => {
    try {
      await bookmarkAPI.bulkUpdate(bookmarkIds, { action: 'move' });
      toast({
        title: 'Bookmarks moved successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error moving bookmarks:', error);
      toast({
        title: 'Error moving bookmarks',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleTagBookmarks = async (bookmarkIds: string[]) => {
    try {
      await bookmarkAPI.bulkUpdate(bookmarkIds, { action: 'tag' });
      toast({
        title: 'Bookmarks tagged successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      // Refresh available tags after tagging
      await fetchTags();
    } catch (error) {
      console.error('Error tagging bookmarks:', error);
      toast({
        title: 'Error tagging bookmarks',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        <Box>
          <Text fontSize="2xl" mb={4}>Search Bookmarks</Text>
          <VStack spacing={4}>
            <Input
              placeholder="Search bookmarks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="lg"
            />
            <Box w="100%">
              <Text mb={2}>Available Tags:</Text>
              <Box display="flex" flexWrap="wrap" gap={2}>
                {availableTags.map(({ name, count }) => (
                  <Tag
                    key={name}
                    size="md"
                    variant={selectedTags.includes(name) ? "solid" : "subtle"}
                    colorScheme="blue"
                    cursor="pointer"
                    onClick={() => handleTagClick(name)}
                  >
                    <TagLabel>{name} ({count})</TagLabel>
                  </Tag>
                ))}
              </Box>
            </Box>
            {selectedTags.length > 0 && (
              <Box w="100%">
                <Text mb={2}>Selected Tags:</Text>
                <HStack spacing={2} wrap="wrap">
                  {selectedTags.map(tag => (
                    <Tag
                      key={tag}
                      size="md"
                      variant="solid"
                      colorScheme="blue"
                    >
                      <TagLabel>{tag}</TagLabel>
                      <TagCloseButton onClick={() => handleTagRemove(tag)} />
                    </Tag>
                  ))}
                </HStack>
              </Box>
            )}
            <Button
              colorScheme="blue"
              onClick={handleSearch}
              isLoading={isLoading}
              w="100%"
            >
              Search
            </Button>
          </VStack>
        </Box>

        <BookmarkList
          onMove={handleMoveBookmarks}
          onTag={handleTagBookmarks}
          searchQuery={searchQuery}
          selectedTag={selectedTags.length === 1 ? selectedTags[0] : null}
          onTagClick={handleTagClick}
        />
      </VStack>
    </Container>
  );
};

export default SearchPage;
