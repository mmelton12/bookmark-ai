import React, { useEffect, useState, useCallback } from 'react';
import {
  VStack,
  Heading,
  Button,
  useToast,
  Input,
  FormControl,
  FormLabel,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Text,
  Box,
  Spinner,
  Center,
  Tag,
  TagLabel,
  TagCloseButton,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { Bookmark } from '../../types';
import { bookmarkAPI } from '../../services/api';
import BookmarkCard from './BookmarkCard';
import { useSearch } from '../../contexts/SearchContext';

const BookmarkList: React.FC = () => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newBookmarkUrl, setNewBookmarkUrl] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const { searchQuery, selectedTags, setSelectedTags } = useSearch();

  // Extract unique tags from bookmarks
  useEffect(() => {
    const tags = new Set<string>();
    bookmarks.forEach(bookmark => {
      bookmark.tags.forEach(tag => tags.add(tag));
    });
    setAvailableTags(Array.from(tags));
  }, [bookmarks]);

  const fetchBookmarks = useCallback(async (pageNum: number = 1) => {
    try {
      setIsLoading(true);
      const response = await bookmarkAPI.search({
        query: searchQuery,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
        page: pageNum,
      });
      
      if (pageNum === 1) {
        setBookmarks(response.data);
      } else {
        setBookmarks(prev => [...prev, ...response.data]);
      }
      setHasMore(response.hasMore);
      setPage(pageNum);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to fetch bookmarks',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      if (pageNum === 1) {
        setBookmarks([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedTags, toast]);

  // Handle tag selection
  const handleTagSelect = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      const newTags = [...selectedTags, tag];
      setSelectedTags(newTags);
    }
  };

  // Handle tag removal
  const handleTagRemove = (tagToRemove: string) => {
    const newTags = selectedTags.filter(tag => tag !== tagToRemove);
    setSelectedTags(newTags);
  };

  const handleAddBookmark = async () => {
    if (!newBookmarkUrl.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a URL',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      setIsLoading(true);
      await bookmarkAPI.create(newBookmarkUrl);
      setNewBookmarkUrl('');
      onClose();
      await fetchBookmarks(1);
      toast({
        title: 'Success',
        description: 'Bookmark added successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add bookmark',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBookmark = async (id: string) => {
    try {
      await bookmarkAPI.delete(id);
      await fetchBookmarks(1);
      toast({
        title: 'Success',
        description: 'Bookmark deleted successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete bookmark',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const loadMore = () => {
    if (!isLoading && hasMore) {
      fetchBookmarks(page + 1);
    }
  };

  // Fetch bookmarks when search query or selected tags change
  useEffect(() => {
    fetchBookmarks(1);
  }, [fetchBookmarks, searchQuery, selectedTags]);

  return (
    <VStack spacing={4} align="stretch" w="full" maxW="container.lg" mx="auto" p={4}>
      <Heading size="lg">Your Bookmarks</Heading>
      <Button colorScheme="blue" onClick={onOpen} isDisabled={isLoading}>
        Add New Bookmark
      </Button>

      {/* Tag Filters */}
      <Box bg="white" p={4} borderRadius="md" shadow="sm">
        <VStack spacing={4}>
          {/* Selected Tags */}
          <Wrap spacing={2}>
            {selectedTags.map(tag => (
              <WrapItem key={tag}>
                <Tag size="md" colorScheme="blue" borderRadius="full">
                  <TagLabel>{tag}</TagLabel>
                  <TagCloseButton onClick={() => handleTagRemove(tag)} />
                </Tag>
              </WrapItem>
            ))}
          </Wrap>

          {/* Available Tags */}
          <Box w="full">
            <Text fontSize="sm" color="gray.600" mb={2}>
              Filter by tags:
            </Text>
            <Wrap spacing={2}>
              {availableTags
                .filter(tag => !selectedTags.includes(tag))
                .map(tag => (
                  <WrapItem key={tag}>
                    <Tag
                      size="md"
                      variant="outline"
                      colorScheme="gray"
                      borderRadius="full"
                      cursor="pointer"
                      onClick={() => handleTagSelect(tag)}
                    >
                      <TagLabel>{tag}</TagLabel>
                    </Tag>
                  </WrapItem>
                ))}
            </Wrap>
          </Box>
        </VStack>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New Bookmark</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl>
              <FormLabel>URL</FormLabel>
              <Input
                value={newBookmarkUrl}
                onChange={(e) => setNewBookmarkUrl(e.target.value)}
                placeholder="Enter URL"
              />
            </FormControl>
            <Button
              mt={4}
              colorScheme="blue"
              onClick={handleAddBookmark}
              isLoading={isLoading}
            >
              Add Bookmark
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>

      {isLoading && bookmarks.length === 0 ? (
        <Center py={8}>
          <Spinner size="xl" />
        </Center>
      ) : bookmarks.length === 0 ? (
        <Text textAlign="center" color="gray.500">
          No bookmarks found. Try adjusting your search or filters.
        </Text>
      ) : (
        <>
          {bookmarks.map((bookmark) => (
            <BookmarkCard
              key={bookmark._id}
              bookmark={bookmark}
              onDelete={handleDeleteBookmark}
            />
          ))}
          {hasMore && (
            <Box textAlign="center" py={4}>
              <Button
                onClick={loadMore}
                isLoading={isLoading}
                loadingText="Loading more..."
              >
                Load More
              </Button>
            </Box>
          )}
        </>
      )}
    </VStack>
  );
};

export default BookmarkList;
