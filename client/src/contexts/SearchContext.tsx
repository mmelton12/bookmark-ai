import React, { createContext, useContext, useState, useCallback } from 'react';
import { debounce } from 'lodash';

interface SearchContextType {
  searchQuery: string;
  selectedTags: string[];
  setSearchQuery: (query: string) => void;
  setSelectedTags: (tags: string[]) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [searchQuery, setSearchQueryState] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Debounced search query setter
  const setSearchQuery = useCallback(
    debounce((query: string) => {
      setSearchQueryState(query);
    }, 300),
    []
  );

  const value = {
    searchQuery,
    selectedTags,
    setSearchQuery,
    setSelectedTags,
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};
