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
  Input,
  VStack,
  HStack,
  Tag,
  TagLabel,
  TagCloseButton,
  useToast,
} from '@chakra-ui/react';
import { bookmarkAPI } from '../../services/api';

interface TagDialogProps {
  isOpen: boolean;
  onClose: () => void;
  bookmarkIds: string[];
  onComplete: () => void;
}

const TagDialog: React.FC<TagDialogProps> = ({ isOpen, onClose, bookmarkIds, onComplete }) => {
  const [tags, setTags] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const fetchTags = async () => {
      if (bookmarkIds.length === 1) {
        try {
          const response = await bookmarkAPI.getBookmarks(undefined, 1, 1);
          const bookmark = response.data.find(b => b._id === bookmarkIds[0]);
          if (bookmark) {
            setTags(bookmark.tags || []);
          }
        } catch (error) {
          console.error('Failed to fetch bookmark tags:', error);
        }
      } else {
        setTags([]);
      }
    };

    if (isOpen) {
      fetchTags();
    }
  }, [isOpen, bookmarkIds]);

  const handleAddTag = () => {
    if (inputValue.trim() && !tags.includes(inputValue.trim())) {
      setTags([...tags, inputValue.trim()]);
      setInputValue('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await bookmarkAPI.bulkUpdate(bookmarkIds, {
        action: 'tag',
        data: {
          tags: tags
        }
      });
      
      toast({
        title: 'Tags updated successfully',
        status: 'success',
        duration: 3000,
      });
      
      onComplete();
      onClose();
    } catch (error) {
      toast({
        title: 'Failed to update tags',
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
        <ModalHeader>Edit Tags</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <HStack>
              <Input
                placeholder="Add tag"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <Button onClick={handleAddTag}>Add</Button>
            </HStack>
            <HStack spacing={2} flexWrap="wrap">
              {tags.map((tag, index) => (
                <Tag
                  key={index}
                  size="md"
                  borderRadius="full"
                  variant="solid"
                  colorScheme="blue"
                >
                  <TagLabel>{tag}</TagLabel>
                  <TagCloseButton onClick={() => handleRemoveTag(tag)} />
                </Tag>
              ))}
            </HStack>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleSave}
            isLoading={isLoading}
          >
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default TagDialog;
