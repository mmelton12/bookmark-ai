import React, { useState } from 'react';
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
} from '@chakra-ui/react';
import { useFolder } from '../../contexts/FolderContext';
import FolderManager from '../folders/FolderManager';
import BookmarkList from './BookmarkList';
import { bookmarkAPI } from '../../services/api';

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

  React.useEffect(() => {
    if (isOpen) {
      // Fetch available tags
      bookmarkAPI.getTags().then((response) => {
        setAvailableTags(response.map(tag => tag.name));
      });
    }
  }, [isOpen]);

  const handleAddTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
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
      onComplete();
      onClose();
    } catch (error) {
      console.error('Failed to update tags:', error);
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
            <Box>
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

  const handleSubmit = async () => {
    try {
      await Promise.all(
        bookmarkIds.map(id =>
          bookmarkAPI.updateBookmark(id, { folder: selectedFolder })
        )
      );
      onComplete();
      onClose();
    } catch (error) {
      console.error('Failed to move bookmarks:', error);
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

  const handleTagOperation = (bookmarkIds: string[]) => {
    setSelectedBookmarkIds(bookmarkIds);
    setIsTagDialogOpen(true);
  };

  const handleMoveOperation = (bookmarkIds: string[]) => {
    setSelectedBookmarkIds(bookmarkIds);
    setIsMoveDialogOpen(true);
  };

  const handleOperationComplete = () => {
    setSelectedBookmarkIds([]);
  };

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
        <BookmarkList
          onTag={handleTagOperation}
          onMove={handleMoveOperation}
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
