import React from 'react';
import {
  Card,
  CardBody,
  VStack,
  Heading,
  Text,
  Button,
  Badge,
  List,
  ListItem,
  ListIcon,
  useColorModeValue,
  Box,
} from '@chakra-ui/react';
import { CheckCircleIcon, NotAllowedIcon } from '@chakra-ui/icons';

interface SubscriptionCardProps {
  subscription: {
    status: 'free' | 'premium';
    currentPeriodEnd?: Date;
    cancelAtPeriodEnd?: boolean;
  };
  usageStats: {
    bookmarksCount: number;
    aiInteractionsCount: number;
  };
  onUpgradeClick: () => void;
  onManageSubscriptionClick: () => void;
}

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  subscription,
  usageStats,
  onUpgradeClick,
  onManageSubscriptionClick,
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const isPremium = subscription.status === 'premium';

  const features = {
    free: [
      { text: 'Up to 100 bookmarks', included: true },
      { text: '100 AI interactions per month', included: true },
      { text: 'Basic search functionality', included: true },
      { text: 'System AI key (OpenAI)', included: true },
      { text: 'Custom API keys', included: false },
      { text: 'Choice of AI models', included: false },
      { text: 'Unlimited bookmarks', included: false },
      { text: 'Unlimited AI interactions', included: false },
    ],
    premium: [
      { text: 'Unlimited bookmarks', included: true },
      { text: 'Unlimited AI interactions', included: true },
      { text: 'Advanced search functionality', included: true },
      { text: 'Custom API keys', included: true },
      { text: 'Choice of AI models', included: true },
      { text: 'Priority support', included: true },
    ],
  };

  return (
    <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
      <CardBody>
        <VStack spacing={6} align="start">
          <Box w="100%" display="flex" justifyContent="space-between" alignItems="center">
            <Heading size="md">Subscription</Heading>
            <Badge
              colorScheme={isPremium ? 'green' : 'gray'}
              fontSize="0.8em"
              p={2}
              borderRadius="md"
            >
              {isPremium ? 'Premium' : 'Free Tier'}
            </Badge>
          </Box>

          {isPremium ? (
            <>
              <Text>
                Your premium subscription is{' '}
                {subscription.cancelAtPeriodEnd ? 'ending' : 'active'} until{' '}
                {subscription.currentPeriodEnd
                  ? new Date(subscription.currentPeriodEnd).toLocaleDateString()
                  : 'N/A'}
              </Text>
              <List spacing={3}>
                {features.premium.map((feature, index) => (
                  <ListItem key={index} display="flex" alignItems="center">
                    <ListIcon as={CheckCircleIcon} color="green.500" />
                    {feature.text}
                  </ListItem>
                ))}
              </List>
              <Button
                colorScheme="blue"
                variant="outline"
                onClick={onManageSubscriptionClick}
              >
                Manage Subscription
              </Button>
            </>
          ) : (
            <>
              <VStack align="start" spacing={4} width="100%">
                <Text>
                  Current Usage:
                  <List spacing={2} mt={2}>
                    <ListItem>
                      Bookmarks: {usageStats.bookmarksCount}/100
                    </ListItem>
                    <ListItem>
                      AI Interactions: {usageStats.aiInteractionsCount}/100
                    </ListItem>
                  </List>
                </Text>
                <List spacing={3}>
                  {features.free.map((feature, index) => (
                    <ListItem key={index} display="flex" alignItems="center">
                      <ListIcon
                        as={feature.included ? CheckCircleIcon : NotAllowedIcon}
                        color={feature.included ? 'green.500' : 'red.500'}
                      />
                      {feature.text}
                    </ListItem>
                  ))}
                </List>
              </VStack>
              <Button
                colorScheme="blue"
                onClick={onUpgradeClick}
                size="lg"
                width="full"
              >
                Upgrade to Premium
              </Button>
            </>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
};

export default SubscriptionCard;
