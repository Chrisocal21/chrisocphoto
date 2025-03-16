import { extendTheme } from '@chakra-ui/theme-utils'

const theme = extendTheme({
  fonts: {
    heading: '-apple-system, SF Pro Display, system-ui, sans-serif',
    body: '-apple-system, SF Pro Text, system-ui, sans-serif',
  },
  colors: {
    ios: {
      50: 'rgba(255, 255, 255, 0.05)',
      100: 'rgba(255, 255, 255, 0.1)',
      200: 'rgba(255, 255, 255, 0.2)',
      800: 'rgba(0, 0, 0, 0.8)',
      900: 'rgba(0, 0, 0, 0.9)',
    },
    accent: {
      500: '#007AFF', // iOS blue
      600: '#0066D6',
    }
  },
  styles: {
    global: {
      body: {
        bg: 'ios.900',
        color: 'white',
      },
    },
  },
})

export default theme
