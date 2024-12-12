import React, { useState, useEffect } from 'react';
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
  Badge,
  useToast,
} from '@chakra-ui/react';
import { FaFolder, FaEllipsisV, FaEdit, FaTrash, FaBookmark, FaStar } from 'react-icons/fa';
import { useFolder } from '../../contexts/FolderContext';

interface Folder {
  _id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  parent: string | null;
  subfolders: Folder[];
  bookmarkCount: number;
}

interface FolderItemProps {
  folder: Folder;
  level: number;
  onEdit: (folder: Folder) => void;
  onDelete: (folderId: string) => void;
}

const FolderItem: React.FC<FolderItemProps> = ({ folder, level, onEdit, onDelete }) => {
  const { selectedFolder, setSelectedFolder, moveBookmarkToFolder } = useFolder();
  const bgColor = useColorModeValue('gray.50', 'gray.700');
  const selectedBgColor = useColorModeValue('blue.50', 'blue.900');
  const dropTargetBg = useColorModeValue('blue.100', 'blue.800');
  const dropTargetBorder = useColorModeValue('blue.500', 'blue.300');
  const toast = useToast();
  const [isDropTarget, setIsDropTarget] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDropTarget) {
      setIsDropTarget(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDropTarget(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDropTarget(false);
    
    const bookmarkId = e.dataTransfer.getData('bookmarkId');
    if (!bookmarkId) return;
    
    try {
      await moveBookmarkToFolder(bookmarkId, folder._id);
      toast({
        title: 'Bookmark moved',
        description: `Successfully moved to ${folder.name}`,
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error moving bookmark',
        description: error instanceof Error ? error.message : 'Failed to move bookmark',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <ListItem
      px={4}
      py={2}
      pl={`${level * 24 + 16}px`}
      bg={isDropTarget ? dropTargetBg : selectedFolder === folder._id ? selectedBgColor : 'transparent'}
      _hover={{ bg: bgColor }}
      cursor="pointer"
      display="flex"
      alignItems="center"
      onClick={() => setSelectedFolder(folder._id)}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      transition="all 0.2s"
      border="2px solid transparent"
      borderColor={isDropTarget ? dropTargetBorder : 'transparent'}
      borderRadius="md"
      transform={isDropTarget ? 'scale(1.02)' : 'scale(1)'}
      position="relative"
      zIndex={isDropTarget ? 2 : 1}
    >
      <Icon
        as={FaFolder}
        color={folder.color || 'gray.500'}
        mr={2}
        transform={isDropTarget ? 'scale(1.1)' : 'scale(1)'}
        transition="transform 0.2s"
      />
      <Box flex={1}>
        <Box display="flex" alignItems="center">
          <Text fontWeight="medium">{folder.name}</Text>
          <Badge ml={2} colorScheme="blue" variant="subtle">
            {folder.bookmarkCount || 0}
          </Badge>
        </Box>
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

const AllBookmarksItem: React.FC = () => {
  const { selectedFolder, setSelectedFolder, totalBookmarks } = useFolder();
  const bgColor = useColorModeValue('gray.50', 'gray.700');
  const selectedBgColor = useColorModeValue('blue.50', 'blue.900');

  return (
    <ListItem
      px={4}
      py={2}
      pl={4}
      bg={selectedFolder === null ? selectedBgColor : 'transparent'}
      _hover={{ bg: bgColor }}
      cursor="pointer"
      display="flex"
      alignItems="center"
      onClick={() => setSelectedFolder(null)}
      borderBottomWidth="1px"
      borderBottomColor={useColorModeValue('gray.200', 'gray.700')}
      mb={2}
    >
      <Icon
        as={FaBookmark}
        color="blue.500"
        mr={2}
      />
      <Box flex={1}>
        <Box display="flex" alignItems="center">
          <Text fontWeight="bold">All Bookmarks</Text>
          <Badge ml={2} colorScheme="blue" variant="subtle">
            {totalBookmarks}
          </Badge>
        </Box>
      </Box>
    </ListItem>
  );
};

const FavoritesItem: React.FC = () => {
  const { selectedFolder, setSelectedFolder, totalFavorites } = useFolder();
  const bgColor = useColorModeValue('gray.50', 'gray.700');
  const selectedBgColor = useColorModeValue('blue.50', 'blue.900');

  return (
    <ListItem
      px={4}
      py={2}
      pl={4}
      bg={selectedFolder === 'favorites' ? selectedBgColor : 'transparent'}
      _hover={{ bg: bgColor }}
      cursor="pointer"
      display="flex"
      alignItems="center"
      onClick={() => setSelectedFolder('favorites')}
      borderBottomWidth="1px"
      borderBottomColor={useColorModeValue('gray.200', 'gray.700')}
      mb={2}
    >
      <Icon
        as={FaStar}
        color="yellow.400"
        mr={2}
      />
      <Box flex={1}>
        <Box display="flex" alignItems="center">
          <Text fontWeight="bold">Favorites</Text>
          <Badge ml={2} colorScheme="blue" variant="subtle">
            {totalFavorites}
          </Badge>
        </Box>
      </Box>
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
  const [isDraggingBookmark, setIsDraggingBookmark] = useState(false);
  const borderColor = useColorModeValue('blue.200', 'blue.600');

  useEffect(() => {
    const handleDragStart = () => setIsDraggingBookmark(true);
    const handleDragEnd = () => setIsDraggingBookmark(false);

    document.addEventListener('bookmarkDragStart', handleDragStart);
    document.addEventListener('bookmarkDragEnd', handleDragEnd);

    return () => {
      document.removeEventListener('bookmarkDragStart', handleDragStart);
      document.removeEventListener('bookmarkDragEnd', handleDragEnd);
    };
  }, []);

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

  return (
    <Box
      border="2px dashed transparent"
      borderColor={isDraggingBookmark ? borderColor : 'transparent'}
      borderRadius="lg"
      transition="all 0.2s"
      p={2}
    >
      <List spacing={1}>
        <AllBookmarksItem />
        <FavoritesItem />
        {folders.length === 0 ? (
          <Box p={4}>
            <Text color="gray.500">No folders yet</Text>
          </Box>
        ) : (
          renderFolderTree(folders, 0, onEdit, onDelete)
        )}
      </List>
    </Box>
  );
};

export default FolderList;
