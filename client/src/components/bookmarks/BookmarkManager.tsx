import React, { useState, useCallback, useEffect } from 'react';
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
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  RadioGroup,
  Radio,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
} from '@chakra-ui/react';
import { useFolder } from '../../contexts/FolderContext';
import FolderManager from '../folders/FolderManager';
import BookmarkList from './BookmarkList';
import { bookmarkAPI } from '../../services/api';
import { useSearch } from '../../contexts/SearchContext';

// Add FolderDrawer component
const FolderDrawer: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  return (
    <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="full">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>Folders</DrawerHeader>
        <DrawerBody>
          <FolderManager />
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};

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

interface CategoryOperationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  bookmarkIds: string[];
  onComplete: () => void;
}

const CategoryOperationDialog: React.FC<CategoryOperationDialogProps> = ({
  isOpen,
  onClose,
  bookmarkIds,
  onComplete,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'Article' | 'Video' | 'Research'>('Article');
  const toast = useToast();

  React.useEffect(() => {
    if (isOpen && bookmarkIds.length === 1) {
      // If editing a single bookmark, fetch its current category
      bookmarkAPI.getBookmarks().then((response) => {
        const bookmark = response.data.find(b => b._id === bookmarkIds[0]);
        if (bookmark) {
          setSelectedCategory(bookmark.category);
        }
      });
    }
  }, [isOpen, bookmarkIds]);

  const handleSubmit = async () => {
    try {
      await Promise.all(
        bookmarkIds.map(id =>
          bookmarkAPI.updateBookmark(id, { category: selectedCategory })
        )
      );
      toast({
        title: 'Category updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onComplete();
      onClose();
    } catch (error) {
      console.error('Failed to update category:', error);
      toast({
        title: 'Failed to update category',
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
        <ModalHeader>Edit Category</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <RadioGroup value={selectedCategory} onChange={(value: 'Article' | 'Video' | 'Research') => setSelectedCategory(value)}>
            <VStack align="start" spacing={4}>
              <Radio value="Article">Article</Radio>
              <Radio value="Video">Video</Radio>
              <Radio value="Research">Research</Radio>
            </VStack>
          </RadioGroup>
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
  const { folders, refreshFolders } = useFolder();
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const toast = useToast();

  const handleSubmit = async () => {
    try {
      await Promise.all(
        bookmarkIds.map(id =>
          bookmarkAPI.updateBookmark(id, { folder: selectedFolder })
        )
      );
      await refreshFolders(); // Refresh folders to update counts
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
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'Article' | 'Video' | 'Research' | null>(null);
  const { searchQuery } = useSearch();
  const toast = useToast();
  const { isOpen: isFolderDrawerOpen, onOpen: onFolderDrawerOpen, onClose: onFolderDrawerClose } = useDisclosure();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Listen for bookmark creation events
  useEffect(() => {
    const handleBookmarkCreated = () => {
      setRefreshTrigger(prev => prev + 1);
    };

    window.addEventListener('bookmarkCreated', handleBookmarkCreated);
    return () => {
      window.removeEventListener('bookmarkCreated', handleBookmarkCreated);
    };
  }, []);

  const handleTagOperation = useCallback((bookmarkIds: string[]) => {
    setSelectedBookmarkIds(bookmarkIds);
    setIsTagDialogOpen(true);
  }, []);

  const handleMoveOperation = useCallback((bookmarkIds: string[]) => {
    setSelectedBookmarkIds(bookmarkIds);
    setIsMoveDialogOpen(true);
  }, []);

  const handleCategoryOperation = useCallback((bookmarkIds: string[]) => {
    setSelectedBookmarkIds(bookmarkIds);
    setIsCategoryDialogOpen(true);
  }, []);

  const handleOperationComplete = useCallback(() => {
    setSelectedBookmarkIds([]);
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const handleTagClick = useCallback((tag: string) => {
    setSelectedTag(prevTag => prevTag === tag ? null : tag);
  }, []);

  // Export the folder drawer open function to make it accessible from the header
  React.useEffect(() => {
    (window as any).openFolderDrawer = onFolderDrawerOpen;
  }, [onFolderDrawerOpen]);

  return (
    <Grid
      templateColumns={{ base: "1fr", md: "300px 1fr" }}
      gap={4}
      height="100%"
    >
      <GridItem display={{ base: 'none', md: 'block' }}>
        <VStack spacing={4} align="stretch">
          <FolderManager />
        </VStack>
      </GridItem>
      <GridItem>
        <VStack spacing={4} align="stretch">
          <Tabs variant="soft-rounded" colorScheme="blue" mb={4}>
            <TabList>
              <Tab onClick={() => setSelectedCategory(null)}>All</Tab>
              <Tab onClick={() => setSelectedCategory('Article')}>Articles</Tab>
              <Tab onClick={() => setSelectedCategory('Video')}>Videos</Tab>
              <Tab onClick={() => setSelectedCategory('Research')}>Research</Tab>
            </TabList>
          </Tabs>

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
            onCategory={handleCategoryOperation}
            searchQuery={searchQuery}
            selectedTag={selectedTag}
            selectedCategory={selectedCategory}
            onTagClick={handleTagClick}
            key={refreshTrigger} // Force refresh when trigger changes
          />
        </VStack>
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

      <CategoryOperationDialog
        isOpen={isCategoryDialogOpen}
        onClose={() => setIsCategoryDialogOpen(false)}
        bookmarkIds={selectedBookmarkIds}
        onComplete={handleOperationComplete}
      />

      <FolderDrawer 
        isOpen={isFolderDrawerOpen} 
        onClose={onFolderDrawerClose}
      />
    </Grid>
  );
};

export default BookmarkManager;
