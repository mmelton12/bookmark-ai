import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  RadioGroup,
  Radio,
  Stack,
  useToast,
} from '@chakra-ui/react';
import { bookmarkAPI } from '../../services/api';

interface CategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  bookmarkIds: string[];
  onComplete: () => void;
}

const CategoryDialog: React.FC<CategoryDialogProps> = ({
  isOpen,
  onClose,
  bookmarkIds,
  onComplete,
}) => {
  const [selectedCategory, setSelectedCategory] = React.useState<'Article' | 'Video' | 'Research'>('Article');
  const [isLoading, setIsLoading] = React.useState(false);
  const toast = useToast();

  const handleSave = async () => {
    if (bookmarkIds.length === 0) {
      onClose();
      return;
    }

    setIsLoading(true);
    try {
      await bookmarkAPI.bulkUpdate(bookmarkIds, {
        action: 'updateCategory',
        category: selectedCategory,
      });
      
      toast({
        title: `Category updated for ${bookmarkIds.length} bookmark${bookmarkIds.length > 1 ? 's' : ''}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onComplete();
      onClose();
    } catch (error) {
      toast({
        title: 'Error updating category',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value as 'Article' | 'Video' | 'Research');
  };

  // Reset selected category when dialog opens
  React.useEffect(() => {
    if (isOpen) {
      setSelectedCategory('Article');
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Change Category</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <RadioGroup value={selectedCategory} onChange={handleCategoryChange}>
            <Stack spacing={4}>
              <Radio value="Article">Article</Radio>
              <Radio value="Video">Video</Radio>
              <Radio value="Research">Research</Radio>
            </Stack>
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
          >
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CategoryDialog;
