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
  RadioGroup,
  Radio,
  VStack,
  useToast,
} from '@chakra-ui/react';
import { bookmarkAPI } from '../../services/api';

interface CategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  bookmarkIds: string[];
  onComplete: () => void;
}

const CategoryDialog: React.FC<CategoryDialogProps> = ({ isOpen, onClose, bookmarkIds, onComplete }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const categories = ['Article', 'Video', 'Research'];

  useEffect(() => {
    const fetchCategory = async () => {
      if (bookmarkIds.length === 1) {
        try {
          const response = await bookmarkAPI.getBookmarks(undefined, 1, 1);
          const bookmark = response.data.find(b => b._id === bookmarkIds[0]);
          if (bookmark) {
            setSelectedCategory(bookmark.category || '');
          }
        } catch (error) {
          console.error('Failed to fetch bookmark category:', error);
        }
      } else {
        setSelectedCategory('');
      }
    };

    if (isOpen) {
      fetchCategory();
    }
  }, [isOpen, bookmarkIds]);

  const handleSave = async () => {
    if (!selectedCategory) return;

    setIsLoading(true);
    try {
      await bookmarkAPI.bulkUpdate(bookmarkIds, {
        action: 'category',
        data: {
          category: selectedCategory
        }
      });
      
      toast({
        title: 'Category updated successfully',
        status: 'success',
        duration: 3000,
      });
      
      onComplete();
      onClose();
    } catch (error) {
      toast({
        title: 'Failed to update category',
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
        <ModalHeader>Change Category</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <RadioGroup value={selectedCategory} onChange={setSelectedCategory}>
            <VStack align="start" spacing={4}>
              {categories.map((category) => (
                <Radio key={category} value={category}>
                  {category}
                </Radio>
              ))}
            </VStack>
          </RadioGroup>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleSave}
            isLoading={isLoading}
            isDisabled={!selectedCategory}
          >
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CategoryDialog;
