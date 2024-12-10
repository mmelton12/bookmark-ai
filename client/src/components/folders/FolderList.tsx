import React from 'react';
import {
  Box,
  List,
  ListItem,
  Text,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Icon,
  Spinner,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaFolder, FaEllipsisV, FaEdit, FaTrash } from 'react-icons/fa';
import { useFolder } from '../../contexts/FolderContext';

interface Folder {
  _id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  parent: string | null;
  subfolders: Folder[];
}

interface FolderItemProps {
  folder: Folder;
  level: number;
  onEdit: (folder: Folder) => void;
  onDelete: (folderId: string) => void;
}

const FolderItem: React.FC<FolderItemProps> = ({ folder, level, onEdit, onDelete }) => {
  const { selectedFolder, setSelectedFolder } = useFolder();
  const bgColor = useColorModeValue('gray.50', 'gray.700');
  const selectedBgColor = useColorModeValue('blue.50', 'blue.900');

  return (
    <ListItem
      px={4}
      py={2}
      pl={`${level * 24 + 16}px`}
      bg={selectedFolder === folder._id ? selectedBgColor : 'transparent'}
      _hover={{ bg: bgColor }}
      cursor="pointer"
      display="flex"
      alignItems="center"
      onClick={() => setSelectedFolder(folder._id)}
    >
      <Icon
        as={FaFolder}
        color={folder.color || 'gray.500'}
        mr={2}
      />
      <Box flex={1}>
        <Text fontWeight="medium">{folder.name}</Text>
        {folder.description && (
          <Text fontSize="sm" color="gray.500">
            {folder.description}
          </Text>
        )}
      </Box>
      <Menu>
        <MenuButton
          as={IconButton}
          icon={<FaEllipsisV />}
          variant="ghost"
          size="sm"
          onClick={(e) => e.stopPropagation()}
        />
        <MenuList>
          <MenuItem
            icon={<FaEdit />}
            onClick={(e) => {
              e.stopPropagation();
              onEdit(folder);
            }}
          >
            Edit
          </MenuItem>
          <MenuItem
            icon={<FaTrash />}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(folder._id);
            }}
          >
            Delete
          </MenuItem>
        </MenuList>
      </Menu>
    </ListItem>
  );
};

const renderFolderTree = (
  folders: Folder[],
  level: number,
  onEdit: (folder: Folder) => void,
  onDelete: (folderId: string) => void
) => {
  return folders.map((folder) => (
    <React.Fragment key={folder._id}>
      <FolderItem
        folder={folder}
        level={level}
        onEdit={onEdit}
        onDelete={onDelete}
      />
      {folder.subfolders && folder.subfolders.length > 0 && (
        renderFolderTree(folder.subfolders, level + 1, onEdit, onDelete)
      )}
    </React.Fragment>
  ));
};

interface FolderListProps {
  onEdit: (folder: Folder) => void;
  onDelete: (folderId: string) => void;
}

const FolderList: React.FC<FolderListProps> = ({ onEdit, onDelete }) => {
  const { folders, loading, error } = useFolder();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={4}>
        <Spinner />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4}>
        <Text color="red.500">{error}</Text>
      </Box>
    );
  }

  if (!folders.length) {
    return (
      <Box p={4}>
        <Text color="gray.500">No folders yet</Text>
      </Box>
    );
  }

  return (
    <List spacing={1}>
      {renderFolderTree(folders, 0, onEdit, onDelete)}
    </List>
  );
};

export default FolderList;
