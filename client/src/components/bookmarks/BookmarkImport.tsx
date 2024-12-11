import React, { useRef, useState } from 'react';
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useToast,
  Progress,
  Text,
  VStack,
  Box,
} from '@chakra-ui/react';
import { parseBookmarkHTML } from '../../utils/bookmarkParser';
import { bookmarkAPI } from '../../services/api';

interface BookmarkImportProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const BookmarkImport: React.FC<BookmarkImportProps> = ({ isOpen, onClose, onComplete }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [totalBookmarks, setTotalBookmarks] = useState(0);
  const [importedCount, setImportedCount] = useState(0);
  const toast = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setImporting(true);
      const content = await file.text();
      const bookmarks = parseBookmarkHTML(content);
      setTotalBookmarks(bookmarks.length);
      
      // Import bookmarks in batches
      const batchSize = 5;
      let successCount = 0;

      for (let i = 0; i < bookmarks.length; i += batchSize) {
        const batch = bookmarks.slice(i, i + batchSize);
        const results = await Promise.allSettled(
          batch.map(bookmark =>
            bookmarkAPI.create(bookmark.url)
              .then(async (result) => {
                // Update the created bookmark with additional details
                if (bookmark.title || bookmark.folder) {
                  await bookmarkAPI.updateBookmark(result._id, {
                    title: bookmark.title,
                    folder: bookmark.folder || null,
                  });
                }
                return result;
              })
          )
        );

        // Count successful imports
        successCount += results.filter(r => r.status === 'fulfilled').length;
        
        const newProgress = Math.min(((i + batchSize) / bookmarks.length) * 100, 100);
        setProgress(newProgress);
        setImportedCount(successCount);
      }

      toast({
        title: 'Import Complete',
        description: `Successfully imported ${successCount} out of ${bookmarks.length} bookmarks`,
        status: successCount > 0 ? 'success' : 'warning',
        duration: 5000,
        isClosable: true,
      });
      
      onComplete();
      onClose();
    } catch (error) {
      console.error('Import failed:', error);
      toast({
        title: 'Import Failed',
        description: 'There was an error importing your bookmarks',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setImporting(false);
      setProgress(0);
      setTotalBookmarks(0);
      setImportedCount(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Import Bookmarks</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <Text>
              Import your bookmarks from Chrome, Firefox, or any other browser.
              Export your bookmarks as HTML from your browser and upload the file here.
            </Text>
            <Text fontSize="sm" color="gray.600">
              Instructions:
              <br />
              1. In Chrome: Bookmarks → Bookmark Manager → ⋮ → Export bookmarks
              <br />
              2. In Firefox: Bookmarks → Show All Bookmarks → Import and Backup → Export Bookmarks to HTML
            </Text>
            <input
              type="file"
              accept=".html"
              onChange={handleFileSelect}
              ref={fileInputRef}
              style={{ display: 'none' }}
            />
            <Button
              onClick={triggerFileInput}
              colorScheme="blue"
              isLoading={importing}
              loadingText="Importing..."
            >
              Select Bookmark File
            </Button>
            {importing && (
              <Box width="100%">
                <Progress value={progress} mb={2} />
                <Text textAlign="center">
                  Imported {importedCount} of {totalBookmarks} bookmarks
                </Text>
              </Box>
            )}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default BookmarkImport;
