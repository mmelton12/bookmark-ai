import React from 'react';
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
} from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';
import { FaEllipsisV, FaFolderOpen, FaTag, FaBookmark } from 'react-icons/fa';

interface BookmarkCardMenuProps {
  bookmarkId: string;
  onDelete: (id: string) => Promise<void>;
  onMove: (bookmarkIds: string[]) => void;
  onTag: (bookmarkIds: string[]) => void;
  onCategory: (bookmarkIds: string[]) => void;
}

const BookmarkCardMenu: React.FC<BookmarkCardMenuProps> = ({
  bookmarkId,
  onDelete,
  onMove,
  onTag,
  onCategory
}) => {
  return (
    <Menu>
      <MenuButton
        as={IconButton}
        aria-label="Options"
        icon={<FaEllipsisV />}
        variant="ghost"
        size="sm"
      />
      <MenuList>
        <MenuItem
          icon={<FaFolderOpen />}
          onClick={() => onMove([bookmarkId])}
        >
          Move
        </MenuItem>
        <MenuItem
          icon={<FaTag />}
          onClick={() => onTag([bookmarkId])}
        >
          Edit Tags
        </MenuItem>
        <MenuItem
          icon={<FaBookmark />}
          onClick={() => onCategory([bookmarkId])}
        >
          Change Category
        </MenuItem>
        <MenuItem
          icon={<DeleteIcon />}
          onClick={() => onDelete(bookmarkId)}
        >
          Delete
        </MenuItem>
      </MenuList>
    </Menu>
  );
};

export default BookmarkCardMenu;
