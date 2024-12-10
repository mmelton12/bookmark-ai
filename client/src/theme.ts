import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

const config: ThemeConfig = {
  initialColorMode: 'system',
  useSystemColorMode: true,
};

const colors = {
  brand: {
    50: '#E6F6FF',
    100: '#BAE3FF',
    200: '#7CC4FA',
    300: '#47A3F3',
    400: '#2186EB',
    500: '#0967D2',
    600: '#0552B5',
    700: '#03449E',
    800: '#01337D',
    900: '#002159',
  },
};

const components = {
  Button: {
    baseStyle: {
      fontWeight: 'semibold',
      borderRadius: 'lg',
    },
    defaultProps: {
      colorScheme: 'brand',
      size: 'md',
    },
  },
  Card: {
    baseStyle: (props: { colorMode: string }) => ({
      p: '6',
      bg: props.colorMode === 'dark' ? 'gray.800' : 'white',
      rounded: 'lg',
      boxShadow: 'base',
      width: '100%',
    }),
  },
  Input: {
    defaultProps: {
      focusBorderColor: 'brand.500',
    },
  },
};

const theme = extendTheme({
  config,
  colors,
  components,
  styles: {
    global: (props: { colorMode: string }) => ({
      body: {
        bg: props.colorMode === 'dark' ? 'gray.900' : 'gray.50',
        color: props.colorMode === 'dark' ? 'white' : 'gray.900',
      },
    }),
  },
  fonts: {
    heading: `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif`,
    body: `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif`,
  },
  semanticTokens: {
    colors: {
      'chakra-body-bg': { _light: 'gray.50', _dark: 'gray.900' },
      'chakra-body-text': { _light: 'gray.900', _dark: 'white' },
      'chakra-border-color': { _light: 'gray.200', _dark: 'gray.700' },
      'card-bg': { _light: 'white', _dark: 'gray.800' },
    },
  },
});

export default theme;
