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
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Box,
  SimpleGrid,
  useColorModeValue,
} from '@chakra-ui/react';
import { useFolder } from '../../contexts/FolderContext';

interface Folder {
  _id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  parent: string | null;
}

interface FolderOperationsProps {
  isOpen: boolean;
  onClose: () => void;
  editingFolder: Folder | null;
}

interface FormData {
  name: string;
  description: string;
  color: string;
  icon: string;
  parent: string | null;
}

const defaultColors = [
  '#1976d2', // Blue
  '#388e3c', // Green
  '#d32f2f', // Red
  '#f57c00', // Orange
  '#7b1fa2', // Purple
  '#455a64', // Blue Grey
];

const defaultIcons = [
  'folder',
  'folder_special',
  'work',
  'cloud',
  'star',
  'favorite',
];

const FolderOperations: React.FC<FolderOperationsProps> = ({
  isOpen,
  onClose,
  editingFolder,
}) => {
  const { folders, createFolder, updateFolder } = useFolder();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    color: defaultColors[0],
    icon: defaultIcons[0],
    parent: null,
  });

  useEffect(() => {
    if (editingFolder) {
      setFormData({
        name: editingFolder.name,
        description: editingFolder.description,
        color: editingFolder.color,
        icon: editingFolder.icon,
        parent: editingFolder.parent,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        color: defaultColors[0],
        icon: defaultIcons[0],
        parent: null,
      });
    }
  }, [editingFolder]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingFolder) {
        await updateFolder(editingFolder._id, formData);
      } else {
        await createFolder(formData);
      }
      onClose();
    } catch (error) {
      console.error('Failed to save folder:', error);
    }
  };

  const handleChange = (
    field: keyof FormData,
    value: string | null
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader>
            {editingFolder ? 'Edit Folder' : 'Create New Folder'}
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <FormControl mb={4} isRequired>
              <FormLabel>Folder Name</FormLabel>
              <Input
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Enter folder name"
              />
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>Description</FormLabel>
              <Textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Enter folder description"
              />
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>Parent Folder</FormLabel>
              <Select
                value={formData.parent || ''}
                onChange={(e) => handleChange('parent', e.target.value || null)}
              >
                <option value="">None (Root Level)</option>
                {folders.map((folder) => (
                  <option
                    key={folder._id}
                    value={folder._id}
                    disabled={editingFolder?._id === folder._id}
                  >
                    {folder.name}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>Color</FormLabel>
              <SimpleGrid columns={6} spacing={2}>
                {defaultColors.map((color) => (
                  <Box
                    key={color}
                    w="100%"
                    h="30px"
                    bg={color}
                    borderRadius="md"
                    cursor="pointer"
                    border="2px solid"
                    borderColor={formData.color === color ? 'blue.500' : borderColor}
                    onClick={() => handleChange('color', color)}
                  />
                ))}
              </SimpleGrid>
            </FormControl>

            <FormControl>
              <FormLabel>Icon</FormLabel>
              <Select
                value={formData.icon}
                onChange={(e) => handleChange('icon', e.target.value)}
              >
                {defaultIcons.map((icon) => (
                  <option key={icon} value={icon}>
                    {icon}
                  </option>
                ))}
              </Select>
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" type="submit">
              {editingFolder ? 'Save Changes' : 'Create Folder'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default FolderOperations;
