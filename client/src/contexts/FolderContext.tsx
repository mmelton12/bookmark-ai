import React, { createContext, useContext, useState, useEffect } from 'react';
import { folderAPI, bookmarkAPI } from '../services/api';
import { Folder } from '../types';

interface FolderContextType {
  folders: Folder[];
  selectedFolder: string | null | 'favorites';
  loading: boolean;
  error: string | null;
  totalBookmarks: number;
  totalFavorites: number;
  setSelectedFolder: (folderId: string | null | 'favorites') => void;
  createFolder: (data: Partial<Folder>) => Promise<void>;
  updateFolder: (id: string, data: Partial<Folder>) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
  refreshFolders: () => Promise<void>;
  refreshTotalBookmarks: () => Promise<void>;
  moveBookmarkToFolder: (bookmarkId: string, folderId: string) => Promise<void>;
}

const FolderContext = createContext<FolderContextType | undefined>(undefined);

export const FolderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null | 'favorites'>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalBookmarks, setTotalBookmarks] = useState(0);
  const [totalFavorites, setTotalFavorites] = useState(0);

  const refreshTotalBookmarks = async () => {
    try {
      const stats = await bookmarkAPI.getStats();
      setTotalBookmarks(stats.totalBookmarks);
      // Get total favorites count
      const favoritesResponse = await bookmarkAPI.search({ favorite: true });
      setTotalFavorites(favoritesResponse.total);
    } catch (err) {
      console.error('Error fetching bookmark stats:', err);
    }
  };

  const refreshFolders = async () => {
    try {
      setLoading(true);
      const [foldersResponse, stats, favoritesResponse] = await Promise.all([
        folderAPI.getFolders(),
        bookmarkAPI.getStats(),
        bookmarkAPI.search({ favorite: true })
      ]);
      setFolders(foldersResponse);
      setTotalBookmarks(stats.totalBookmarks);
      setTotalFavorites(favoritesResponse.total);
      setError(null);
    } catch (err) {
      setError('Failed to fetch folders');
      console.error('Error fetching folders:', err);
    } finally {
      setLoading(false);
    }
  };

  const createFolder = async (data: Partial<Folder>) => {
    try {
      await folderAPI.createFolder(data);
      await refreshFolders();
    } catch (err) {
      setError('Failed to create folder');
      throw err;
    }
  };

  const updateFolder = async (id: string, data: Partial<Folder>) => {
    try {
      await folderAPI.updateFolder(id, data);
      await refreshFolders();
    } catch (err) {
      setError('Failed to update folder');
      throw err;
    }
  };

  const deleteFolder = async (id: string) => {
    try {
      await folderAPI.deleteFolder(id);
      await refreshFolders();
      if (selectedFolder === id) {
        setSelectedFolder(null);
      }
    } catch (err) {
      setError('Failed to delete folder');
      throw err;
    }
  };

  const moveBookmarkToFolder = async (bookmarkId: string, folderId: string) => {
    try {
      await bookmarkAPI.updateBookmark(bookmarkId, { folder: folderId });
      await refreshFolders();
    } catch (err) {
      setError('Failed to move bookmark');
      throw err;
    }
  };

  useEffect(() => {
    refreshFolders();
  }, []);

  const value = {
    folders,
    selectedFolder,
    loading,
    error,
    totalBookmarks,
    totalFavorites,
    setSelectedFolder,
    createFolder,
    updateFolder,
    deleteFolder,
    refreshFolders,
    refreshTotalBookmarks,
    moveBookmarkToFolder,
  };

  return <FolderContext.Provider value={value}>{children}</FolderContext.Provider>;
};

export const useFolder = () => {
  const context = useContext(FolderContext);
  if (context === undefined) {
    throw new Error('useFolder must be used within a FolderProvider');
  }
  return context;
};
