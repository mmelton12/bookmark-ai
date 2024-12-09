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
  Center
} from '@chakra-ui/react';
import { Bookmark } from '../../types';
import { bookmarkAPI } from '../../services/api';
import BookmarkCard from './BookmarkCard';

const BookmarkList: React.FC = () => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newBookmarkUrl, setNewBookmarkUrl] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const fetchBookmarks = useCallback(async (pageNum: number = 1) => {
    try {
      setIsLoading(true);
      const response = await bookmarkAPI.getAll({ page: pageNum });
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
      // Initialize empty array on error
      if (pageNum === 1) {
        setBookmarks([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

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
      // Refresh the first page to show the new bookmark
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
      // Refresh the first page after deletion
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

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  return (
    <VStack spacing={4} align="stretch" w="full" maxW="container.lg" mx="auto" p={4}>
      <Heading size="lg">Your Bookmarks</Heading>
      <Button colorScheme="blue" onClick={onOpen} isDisabled={isLoading}>
        Add New Bookmark
      </Button>

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
          No bookmarks yet. Add your first bookmark!
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
