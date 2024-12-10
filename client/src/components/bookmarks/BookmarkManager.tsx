import React, { useState, useCallback } from 'react';
import {
  Grid,
  GridItem,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Box,
  useColorModeValue,
  VStack,
  HStack,
  Tag,
  TagLabel,
  TagCloseButton,
  useToast,
  Text,
} from '@chakra-ui/react';
import { useFolder } from '../../contexts/FolderContext';
import FolderManager from '../folders/FolderManager';
import BookmarkList from './BookmarkList';
import { bookmarkAPI } from '../../services/api';
import { useSearch } from '../../contexts/SearchContext';

interface TagOperationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  bookmarkIds: string[];
  onComplete: () => void;
}

interface MoveOperationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  bookmarkIds: string[];
  onComplete: () => void;
}

const TagOperationDialog: React.FC<TagOperationDialogProps> = ({
  isOpen,
  onClose,
  bookmarkIds,
  onComplete,
}) => {
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const toast = useToast();

  React.useEffect(() => {
    if (isOpen) {
      // Fetch available tags
      bookmarkAPI.getTags().then((response) => {
        setAvailableTags(response.map(tag => tag.name));
      });

      // If editing a single bookmark, fetch its current tags
      if (bookmarkIds.length === 1) {
        bookmarkAPI.getBookmarks().then((response) => {
          const bookmark = response.data.find(b => b._id === bookmarkIds[0]);
          if (bookmark) {
            setTags(bookmark.tags);
          }
        });
      }
    } else {
      // Reset state when dialog closes
      setTags([]);
      setNewTag('');
    }
  }, [isOpen, bookmarkIds]);

  const handleAddTag = () => {
    if (newTag && !tags.includes(newTag)) {
      const normalizedTag = newTag.toLowerCase().trim();
      if (normalizedTag !== 'other') {
        setTags([...tags, normalizedTag]);
      }
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async () => {
    try {
      await Promise.all(
        bookmarkIds.map(id =>
          bookmarkAPI.updateBookmark(id, { tags })
        )
      );
      toast({
        title: 'Tags updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onComplete();
      onClose();
    } catch (error) {
      console.error('Failed to update tags:', error);
      toast({
        title: 'Failed to update tags',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Tags</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>Add Tags</FormLabel>
              <HStack>
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Enter a tag"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />
                <Button onClick={handleAddTag}>Add</Button>
              </HStack>
            </FormControl>
            {availableTags.length > 0 && (
              <Box w="100%">
                <FormLabel>Available Tags:</FormLabel>
                <Box display="flex" flexWrap="wrap" gap={2}>
                  {availableTags
                    .filter(tag => tag.toLowerCase() !== 'other')
                    .map((tag) => (
                      <Tag
                        key={tag}
                        size="sm"
                        variant={tags.includes(tag) ? "solid" : "subtle"}
                        colorScheme="blue"
                        cursor="pointer"
                        onClick={() => {
                          if (tags.includes(tag)) {
                            handleRemoveTag(tag);
                          } else {
                            setTags([...tags, tag]);
                          }
                        }}
                      >
                        {tag}
                      </Tag>
                    ))}
                </Box>
              </Box>
            )}
            <Box w="100%">
              <FormLabel>Selected Tags:</FormLabel>
              <Box display="flex" flexWrap="wrap" gap={2}>
                {tags.map((tag) => (
                  <Tag
                    key={tag}
                    size="md"
                    borderRadius="full"
                    variant="solid"
                    colorScheme="blue"
                    m={1}
                  >
                    <TagLabel>{tag}</TagLabel>
                    <TagCloseButton onClick={() => handleRemoveTag(tag)} />
                  </Tag>
                ))}
              </Box>
            </Box>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button colorScheme="blue" onClick={handleSubmit}>
            Save Changes
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

const MoveOperationDialog: React.FC<MoveOperationDialogProps> = ({
  isOpen,
  onClose,
  bookmarkIds,
  onComplete,
}) => {
  const { folders } = useFolder();
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const toast = useToast();

  const handleSubmit = async () => {
    try {
      await Promise.all(
        bookmarkIds.map(id =>
          bookmarkAPI.updateBookmark(id, { folder: selectedFolder })
        )
      );
      toast({
        title: 'Bookmarks moved successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onComplete();
      onClose();
    } catch (error) {
      console.error('Failed to move bookmarks:', error);
      toast({
        title: 'Failed to move bookmarks',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Move Bookmarks</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl>
            <FormLabel>Destination Folder</FormLabel>
            <Select
              value={selectedFolder || ''}
              onChange={(e) => setSelectedFolder(e.target.value || null)}
            >
              <option value="">Root (No Folder)</option>
              {folders.map((folder) => (
                <option key={folder._id} value={folder._id}>
                  {folder.name}
                </option>
              ))}
            </Select>
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button colorScheme="blue" onClick={handleSubmit}>
            Move
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

const BookmarkManager: React.FC = () => {
  const [selectedBookmarkIds, setSelectedBookmarkIds] = useState<string[]>([]);
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false);
  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const { searchQuery } = useSearch();
  const toast = useToast();

  const handleTagOperation = useCallback((bookmarkIds: string[]) => {
    setSelectedBookmarkIds(bookmarkIds);
    setIsTagDialogOpen(true);
  }, []);

  const handleMoveOperation = useCallback((bookmarkIds: string[]) => {
    setSelectedBookmarkIds(bookmarkIds);
    setIsMoveDialogOpen(true);
  }, []);

  const handleOperationComplete = useCallback(() => {
    setSelectedBookmarkIds([]);
  }, []);

  const handleTagClick = useCallback((tag: string) => {
    setSelectedTag(prevTag => prevTag === tag ? null : tag);
  }, []);

  return (
    <Grid
      templateColumns="300px 1fr"
      gap={4}
      height="100%"
    >
      <GridItem>
        <FolderManager />
      </GridItem>
      <GridItem>
        {selectedTag && (
          <Box mb={4}>
            <Text mb={2}>Selected Tag:</Text>
            <Tag
              size="md"
              variant="solid"
              colorScheme="blue"
              cursor="pointer"
              onClick={() => setSelectedTag(null)}
            >
              <TagLabel>{selectedTag}</TagLabel>
              <TagCloseButton />
            </Tag>
          </Box>
        )}
        <BookmarkList
          onTag={handleTagOperation}
          onMove={handleMoveOperation}
          searchQuery={searchQuery}
          selectedTag={selectedTag}
          onTagClick={handleTagClick}
        />
      </GridItem>

      <TagOperationDialog
        isOpen={isTagDialogOpen}
        onClose={() => setIsTagDialogOpen(false)}
        bookmarkIds={selectedBookmarkIds}
        onComplete={handleOperationComplete}
      />

      <MoveOperationDialog
        isOpen={isMoveDialogOpen}
        onClose={() => setIsMoveDialogOpen(false)}
        bookmarkIds={selectedBookmarkIds}
        onComplete={handleOperationComplete}
      />
    </Grid>
  );
};

export default BookmarkManager;
