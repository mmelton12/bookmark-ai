import React, { useState, useEffect } from 'react';
import Joyride, { CallBackProps, TooltipRenderProps, Step, EVENTS } from 'react-joyride';
import { useAuth } from '../../contexts/AuthContext';
import { useFolder } from '../../contexts/FolderContext';
import { useBreakpointValue, useTheme } from '@chakra-ui/react';

const TourGuide: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { totalBookmarks } = useFolder();
  const theme = useTheme();
  const isMobile = useBreakpointValue({ base: true, md: false });
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  // Only show tour for new users with zero bookmarks
  useEffect(() => {
    const shouldShowTour = Boolean(
      user && 
      user.hasCompletedTour === false && 
      totalBookmarks === 0
    );
    
    console.log('Tour conditions:', {
      hasUser: !!user,
      hasCompletedTour: user?.hasCompletedTour,
      totalBookmarks,
      shouldShowTour
    });

    setRun(shouldShowTour);
  }, [user, user?.hasCompletedTour, totalBookmarks]);

  // Listen for bookmark creation event
  useEffect(() => {
    const handleBookmarkCreated = () => {
      // Force advance to next step after bookmark is created
      setStepIndex(1);
      // Re-enable the tour if it was paused
      setRun(true);
    };

    window.addEventListener('bookmarkCreated', handleBookmarkCreated);
    return () => {
      window.removeEventListener('bookmarkCreated', handleBookmarkCreated);
    };
  }, []);

  const steps: Step[] = [
    {
      target: '.add-bookmark',
      content: "Let's start by adding your first bookmark! Click here to paste a URL, and our AI will automatically generate summaries and suggest tags.",
      placement: isMobile ? 'top' : 'bottom',
      disableBeacon: true,
      disableOverlayClose: true,
      disableOverlay: true, // First step needs overlay disabled to interact with add bookmark
      spotlightClicks: true,
    },
    {
      target: '.bookmark-list',
      content: "Great! Let's look at your first bookmark. Each bookmark card contains several features to help you organize and understand your saved content.",
      placement: isMobile ? 'bottom' : 'right',
      disableOverlayClose: true,
    },
    {
      target: 'a[href]',
      content: "The URL link allows you to quickly visit the bookmarked page. It opens in a new tab so you won't lose your place.",
      placement: 'bottom',
      disableOverlayClose: true,
    },
    {
      target: '.chakra-badge',
      content: "Each bookmark is automatically categorized as an Article, Video, or Research paper to help you find specific types of content.",
      placement: 'bottom',
      disableOverlayClose: true,
    },
    {
      target: '.chakra-text',
      content: "Our AI automatically generates a concise summary of the content, helping you quickly recall why you saved it.",
      placement: 'bottom',
      disableOverlayClose: true,
    },
    {
      target: '.chakra-tag',
      content: "AI-suggested tags help organize your bookmarks. Click any tag to filter your bookmarks and find related content.",
      placement: 'bottom',
      disableOverlayClose: true,
    },
    {
      target: '.folder-list',
      content: 'Create folders to organize your bookmarks by topic, project, or any way you like.',
      placement: isMobile ? 'bottom' : 'left',
      disableOverlayClose: true,
    },
    {
      target: '.search-bar',
      content: 'Quickly find any bookmark using keywords, tags, or categories.',
      placement: 'bottom',
      disableOverlayClose: true,
    },
    {
      target: '.chat-bot',
      content: 'Ask our AI assistant questions about your bookmarks, get recommendations, or analyze your saved content.',
      placement: isMobile ? 'top' : 'left',
      disableOverlayClose: true,
    },
    {
      target: '.account-settings',
      content: 'Access your account settings, API keys, and preferences here.',
      placement: 'bottom',
      disableOverlayClose: true,
    }
  ];

  const handleJoyrideCallback = async (data: CallBackProps) => {
    const { status, type } = data;

    if (status === 'finished' || status === 'skipped') {
      setRun(false);
      try {
        await updateProfile({ hasCompletedTour: true });
      } catch (error) {
        console.error('Failed to update tour status:', error);
      }
    } else if (type === EVENTS.STEP_AFTER) {
      // Always advance to next step unless bookmark creation event will handle it
      if (stepIndex !== 0) {
        setStepIndex(prev => prev + 1);
      }
    }
  };

  const styles = {
    options: {
      zIndex: 100000,
      primaryColor: theme.colors.blue[500],
      overlayColor: 'rgba(0, 0, 0, 0.75)',
      textColor: '#FFFFFF',
      backgroundColor: theme.colors.blue[500],
      arrowColor: theme.colors.blue[500],
    },
    buttonNext: {
      backgroundColor: theme.colors.blue[500],
      color: '#FFFFFF',
      fontSize: '16px',
      padding: '12px 24px',
      borderRadius: '8px',
      fontWeight: 'bold',
      zIndex: 100001,
    },
    buttonBack: {
      color: '#FFFFFF',
      fontSize: '16px',
      padding: '12px 24px',
      borderRadius: '8px',
      fontWeight: 'bold',
      marginRight: '8px',
      zIndex: 100001,
    },
    buttonSkip: {
      color: '#FFFFFF',
      fontSize: '16px',
      padding: '12px 24px',
      borderRadius: '8px',
      fontWeight: 'bold',
      zIndex: 100001,
    },
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      zIndex: 99999,
    },
    spotlight: {
      backgroundColor: 'transparent',
    },
    tooltip: {
      padding: '20px',
      fontSize: '15px',
      maxWidth: '400px',
    }
  };

  // Don't render if conditions aren't met
  if (!user || user.hasCompletedTour || totalBookmarks > 0) {
    return null;
  }

  return (
    <Joyride
      steps={steps}
      run={run}
      stepIndex={stepIndex}
      continuous
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      styles={styles}
      floaterProps={{
        disableAnimation: true,
      }}
      tooltipComponent={({ step, ...props }: TooltipRenderProps) => (
        <div
          style={{
            maxWidth: isMobile ? '300px' : '400px',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: theme.shadows.lg,
            backgroundColor: theme.colors.blue[500],
            color: '#FFFFFF',
            zIndex: 100000,
          }}
          {...props}
        >
          {step.content}
        </div>
      )}
    />
  );
};

export default TourGuide;
