import React, { useState } from 'react';
import {
  Box,
  Button,
  Heading,
  VStack,
  useColorModeValue,
  Icon,
} from '@chakra-ui/react';
import { FaPlus } from 'react-icons/fa';
import FolderList from './FolderList';
import FolderOperations from './FolderOperations';
import { useFolder } from '../../contexts/FolderContext';

interface Folder {
  _id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  parent: string | null;
}

const FolderManager: React.FC = () => {
  const { error, deleteFolder } = useFolder();
  const [isOperationsOpen, setIsOperationsOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleCreateClick = () => {
    setEditingFolder(null);
    setIsOperationsOpen(true);
  };

  const handleEditFolder = (folder: Folder) => {
    setEditingFolder(folder);
    setIsOperationsOpen(true);
  };

  const handleDeleteFolder = async (folderId: string) => {
    if (window.confirm('Are you sure you want to delete this folder?')) {
      try {
        await deleteFolder(folderId);
      } catch (error) {
        console.error('Failed to delete folder:', error);
      }
    }
  };

  const handleClose = () => {
    setIsOperationsOpen(false);
    setEditingFolder(null);
  };

  return (
    <VStack
      height="100%"
      spacing={4}
      align="stretch"
      p={4}
      className="folder-list"
    >
      <Box
        bg={bgColor}
        p={4}
        borderRadius="md"
        borderWidth="1px"
        borderColor={borderColor}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Heading size="md">Folders</Heading>
          <Button
            colorScheme="blue"
            leftIcon={<Icon as={FaPlus} />}
            onClick={handleCreateClick}
            size="sm"
          >
            New Folder
          </Button>
        </Box>
      </Box>

      <Box
        flex="1"
        overflow="auto"
        bg={bgColor}
        borderRadius="md"
        borderWidth="1px"
        borderColor={borderColor}
      >
        <FolderList
          onEdit={handleEditFolder}
          onDelete={handleDeleteFolder}
        />
      </Box>

      <FolderOperations
        isOpen={isOperationsOpen}
        onClose={handleClose}
        editingFolder={editingFolder}
      />
    </VStack>
  );
};

export default FolderManager;
