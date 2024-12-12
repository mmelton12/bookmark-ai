import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  Select,
  useToast,
  Text,
} from '@chakra-ui/react';
import { useFolder } from '../../contexts/FolderContext';
import { bookmarkAPI } from '../../services/api';

interface MoveDialogProps {
  isOpen: boolean;
  onClose: () => void;
  bookmarkIds: string[];
  onComplete: () => void;
}

const MoveDialog: React.FC<MoveDialogProps> = ({ isOpen, onClose, bookmarkIds, onComplete }) => {
  const { folders } = useFolder();
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const fetchFolder = async () => {
      if (bookmarkIds.length === 1) {
        try {
          const response = await bookmarkAPI.getBookmarks(undefined, 1, 1);
          const bookmark = response.data.find(b => b._id === bookmarkIds[0]);
          if (bookmark) {
            setSelectedFolder(bookmark.folder || null);
          }
        } catch (error) {
          console.error('Failed to fetch bookmark folder:', error);
        }
      } else {
        setSelectedFolder(null);
      }
    };

    if (isOpen) {
      fetchFolder();
    }
  }, [isOpen, bookmarkIds]);

  const handleMove = async () => {
    setIsLoading(true);
    try {
      await bookmarkAPI.bulkUpdate(bookmarkIds, {
        action: 'move',
        data: {
          folderId: selectedFolder
        }
      });
      
      toast({
        title: 'Bookmarks moved successfully',
        status: 'success',
        duration: 3000,
      });
      
      onComplete();
      onClose();
    } catch (error) {
      console.error('Move operation failed:', error);
      toast({
        title: 'Failed to move bookmarks',
        description: error instanceof Error ? error.message : 'An error occurred',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Move to Folder</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Select
            placeholder="Select folder"
            value={selectedFolder || ''}
            onChange={(e) => setSelectedFolder(e.target.value || null)}
          >
            <option value="">No Folder</option>
            {folders.map((folder) => (
              <option key={folder._id} value={folder._id}>
                {folder.name}
              </option>
            ))}
          </Select>
          {bookmarkIds.length > 1 && (
            <Text mt={2} fontSize="sm" color="gray.600">
              Moving {bookmarkIds.length} bookmarks
            </Text>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleMove}
            isLoading={isLoading}
          >
            Move
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default MoveDialog;
