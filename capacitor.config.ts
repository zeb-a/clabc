import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.klasiz.fun',
  appName: 'Klasiz.fun',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    // In development, use local Vite server
    // In production, connect to Railway deployment
    url: process.env.NODE_ENV === 'development'
      ? 'http://localhost:5173'
      : 'https://klasiz.fun',
    cleartext: true,
    androidScheme: 'https'
  },
  android: {
    buildOptions: {
      signingType: 'apksigner'
    },
    // Enable immersive splash screen (no status bar)
    splashImmersive: true,
    // Use full screen for splash
    splashFullScreen: true,
    // Allow content to go under status bar
    allowMixedContent: true
  },
  ios: {
    // Disable bounce scrolling on iOS
    scrollEnabled: false,
    // Enable safe area layout
    backgroundColor: '#ffffff',
    // Configure content to respect safe areas
    contentInset: 'automatic',
    // Enable swipe back gesture for navigation
    allowsBackForwardNavigationGestures: true
  },
  plugins: {
    StatusBar: {
      style: 'DEFAULT',
      overlaysWebView: true
    },
    CapacitorHttp: {},
    CapacitorPreferences: {}
  }
};

export default config;
