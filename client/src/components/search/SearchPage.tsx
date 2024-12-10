import React, { useState, useEffect } from 'react';
import {
  VStack,
  Input,
  InputGroup,
  InputLeftElement,
  Box,
  Text,
  Tag,
  TagLabel,
  Wrap,
  WrapItem,
  Heading,
  Container,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  InputRightElement,
  IconButton,
  useColorModeValue,
  Spinner,
  useToast,
} from '@chakra-ui/react';
import { SearchIcon, CloseIcon } from '@chakra-ui/icons';
import { useSearch } from '../../contexts/SearchContext';
import BookmarkList from '../bookmarks/BookmarkList';
import { bookmarkAPI } from '../../services/api';

interface TagCount {
  name: string;
  count: number;
}

const SearchPage: React.FC = () => {
  const { searchQuery, setSearchQuery, selectedTags, setSelectedTags } = useSearch();
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [tagFilter, setTagFilter] = useState('');
  const [availableTags, setAvailableTags] = useState<TagCount[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  
  useEffect(() => {
    const fetchTags = async () => {
      try {
        setIsLoading(true);
        const tags = await bookmarkAPI.getTags();
        setAvailableTags(tags);
      } catch (error) {
        toast({
          title: 'Error fetching tags',
          description: error instanceof Error ? error.message : 'An error occurred',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTags();
  }, [toast]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearchQuery(value);
    setSearchQuery(value);
  };

  const clearSearch = () => {
    setLocalSearchQuery('');
    setSearchQuery('');
  };

  const handleTagSelect = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
  };

  const filteredTags = availableTags
    .filter(tag => !selectedTags.includes(tag.name))
    .filter(tag => tag.name.toLowerCase().includes(tagFilter.toLowerCase()));

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        <Box bg={bgColor} p={6} borderRadius="lg" boxShadow="sm" borderWidth="1px" borderColor={borderColor}>
          <VStack spacing={4}>
            <Heading size="md">Search Bookmarks</Heading>
            <InputGroup size="lg">
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.300" />
              </InputLeftElement>
              <Input
                placeholder="Search bookmarks..."
                value={localSearchQuery}
                onChange={handleSearchChange}
                borderRadius="full"
              />
              {localSearchQuery && (
                <InputRightElement>
                  <IconButton
                    aria-label="Clear search"
                    icon={<CloseIcon />}
                    size="sm"
                    variant="ghost"
                    onClick={clearSearch}
                  />
                </InputRightElement>
              )}
            </InputGroup>
          </VStack>
        </Box>

        <Box bg={bgColor} p={6} borderRadius="lg" boxShadow="sm" borderWidth="1px" borderColor={borderColor}>
          <Tabs variant="soft-rounded" colorScheme="blue">
            <TabList>
              <Tab>Selected Tags ({selectedTags.length})</Tab>
              <Tab>All Tags ({availableTags.length})</Tab>
            </TabList>
            
            <TabPanels>
              <TabPanel>
                <Wrap spacing={2}>
                  {selectedTags.map(tag => (
                    <WrapItem key={tag}>
                      <Tag size="lg" colorScheme="blue" borderRadius="full">
                        <TagLabel>{tag}</TagLabel>
                        <IconButton
                          aria-label="Remove tag"
                          icon={<CloseIcon />}
                          size="xs"
                          ml={1}
                          variant="ghost"
                          onClick={() => handleTagRemove(tag)}
                        />
                      </Tag>
                    </WrapItem>
                  ))}
                  {selectedTags.length === 0 && (
                    <Text color="gray.500">No tags selected</Text>
                  )}
                </Wrap>
              </TabPanel>
              
              <TabPanel>
                <VStack spacing={4} align="stretch">
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <SearchIcon color="gray.300" />
                    </InputLeftElement>
                    <Input
                      placeholder="Filter tags..."
                      value={tagFilter}
                      onChange={(e) => setTagFilter(e.target.value)}
                      borderRadius="full"
                    />
                  </InputGroup>
                  
                  {isLoading ? (
                    <Box textAlign="center" py={4}>
                      <Spinner size="lg" />
                    </Box>
                  ) : (
                    <Wrap spacing={2}>
                      {filteredTags.map(({ name, count }) => (
                        <WrapItem key={name}>
                          <Tag
                            size="md"
                            variant="subtle"
                            colorScheme="gray"
                            borderRadius="full"
                            cursor="pointer"
                            onClick={() => handleTagSelect(name)}
                            _hover={{ bg: 'gray.100' }}
                          >
                            <TagLabel>{name} ({count})</TagLabel>
                          </Tag>
                        </WrapItem>
                      ))}
                      {filteredTags.length === 0 && !isLoading && (
                        <Text color="gray.500">
                          {tagFilter ? 'No matching tags found' : 'No available tags'}
                        </Text>
                      )}
                    </Wrap>
                  )}
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>

        <BookmarkList />
      </VStack>
    </Container>
  );
};

export default SearchPage;
