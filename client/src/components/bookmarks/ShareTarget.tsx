import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@chakra-ui/react';
import { bookmarkAPI } from '../../services/api';

const ShareTarget: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    const handleSharedContent = async () => {
      try {
        // Get URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const sharedUrl = urlParams.get('url') || urlParams.get('text');

        if (!sharedUrl) {
          throw new Error('No URL was shared');
        }

        // Create bookmark from shared URL
        await bookmarkAPI.create(sharedUrl);

        toast({
          title: 'Bookmark Added',
          description: 'The shared URL has been added to your bookmarks',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });

        // Redirect to bookmarks page
        navigate('/bookmarks');
      } catch (error) {
        console.error('Error processing shared content:', error);
        toast({
          title: 'Error',
          description: 'Failed to add the shared URL to your bookmarks',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        navigate('/bookmarks');
      }
    };

    handleSharedContent();
  }, [navigate, toast]);

  return null; // This component doesn't render anything
};

export default ShareTarget;
