import React, { createContext, useContext, useState, useEffect } from 'react';
import { folderAPI } from '../services/api';
import { Folder } from '../types';

interface FolderContextType {
  folders: Folder[];
  selectedFolder: string | null;
  loading: boolean;
  error: string | null;
  setSelectedFolder: (folderId: string | null) => void;
  createFolder: (data: Partial<Folder>) => Promise<void>;
  updateFolder: (id: string, data: Partial<Folder>) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
  refreshFolders: () => Promise<void>;
}

const FolderContext = createContext<FolderContextType | undefined>(undefined);

export const FolderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshFolders = async () => {
    try {
      setLoading(true);
      const response = await folderAPI.getFolders();
      setFolders(response);
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

  useEffect(() => {
    refreshFolders();
  }, []);

  const value = {
    folders,
    selectedFolder,
    loading,
    error,
    setSelectedFolder,
    createFolder,
    updateFolder,
    deleteFolder,
    refreshFolders,
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
