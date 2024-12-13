import React, { useState, useCallback, useEffect } from 'react';
import {
  Grid,
  GridItem,
  Box,
  VStack,
  HStack,
  Button,
  useColorModeValue,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Tabs,
  TabList,
  Tab,
  Text,
  Tag,
  TagLabel,
  TagCloseButton,
} from '@chakra-ui/react';
import { FaPlus } from 'react-icons/fa';
import { useFolder } from '../../contexts/FolderContext';
import FolderManager from '../folders/FolderManager';
import BookmarkList from './BookmarkList';
import MoveDialog from './MoveDialog';
import TagDialog from './TagDialog';
import CategoryDialog from './CategoryDialog';

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

const BookmarkManager: React.FC = () => {
  const { refreshFolders, refreshTotalBookmarks } = useFolder();
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'Article' | 'Video' | 'Research' | null>(null);
  const [selectedBookmarkIds, setSelectedBookmarkIds] = useState<string[]>([]);
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false);
  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const { isOpen: isFolderDrawerOpen, onOpen: onFolderDrawerOpen, onClose: onFolderDrawerClose } = useDisclosure();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Listen for bookmark creation events
  useEffect(() => {
    const handleBookmarkCreated = () => {
      setRefreshTrigger(prev => prev + 1);
      refreshFolders();
      refreshTotalBookmarks();
    };

    window.addEventListener('bookmarkCreated', handleBookmarkCreated);
    return () => {
      window.removeEventListener('bookmarkCreated', handleBookmarkCreated);
    };
  }, [refreshFolders, refreshTotalBookmarks]);

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
    refreshFolders();
    refreshTotalBookmarks();
  }, [refreshFolders, refreshTotalBookmarks]);

  const handleTagClick = useCallback((tag: string) => {
    setSelectedTag(prevTag => prevTag === tag ? null : tag);
  }, []);

  // Export the folder drawer open function to make it accessible from the header
  React.useEffect(() => {
    (window as any).openFolderDrawer = onFolderDrawerOpen;
  }, [onFolderDrawerOpen]);

  return (
    <Box display="flex" height="100%" pt="73px">
      <Box
        width="300px"
        display={{ base: 'none', md: 'block' }}
        position="fixed"
        left={0}
        top="73px"
        bottom={0}
        overflowY="auto"
        borderRight="1px"
        borderColor="gray.200"
        bg={useColorModeValue('white', 'gray.800')}
        className="folder-list"
      >
        <FolderManager />
      </Box>

      <Box
        flex={1}
        ml={{ base: 0, md: '300px' }}
        p={4}
        pt={6}
        className="bookmark-list"
      >
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
            selectedTag={selectedTag}
            selectedCategory={selectedCategory}
            onTagClick={handleTagClick}
            key={refreshTrigger} // Force refresh when trigger changes
          />
        </VStack>
      </Box>

      <FolderDrawer 
        isOpen={isFolderDrawerOpen} 
        onClose={onFolderDrawerClose}
      />

      <MoveDialog
        isOpen={isMoveDialogOpen}
        onClose={() => setIsMoveDialogOpen(false)}
        bookmarkIds={selectedBookmarkIds}
        onComplete={handleOperationComplete}
      />

      <TagDialog
        isOpen={isTagDialogOpen}
        onClose={() => setIsTagDialogOpen(false)}
        bookmarkIds={selectedBookmarkIds}
        onComplete={handleOperationComplete}
      />

      <CategoryDialog
        isOpen={isCategoryDialogOpen}
        onClose={() => setIsCategoryDialogOpen(false)}
        bookmarkIds={selectedBookmarkIds}
        onComplete={handleOperationComplete}
      />
    </Box>
  );
};

export default BookmarkManager;
