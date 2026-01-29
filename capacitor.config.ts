import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.classabc.app',
  appName: 'ClassABC',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    // In development, use local server. In production, load from the same host
    url: process.env.NODE_ENV === 'development'
      ? 'http://localhost:5173'
      : undefined, // Load from the same host as the deployed site
    cleartext: true,
    androidScheme: 'https'
  },
  android: {
    buildOptions: {
      signingType: 'apksigner'
    }
  },
  plugins: {
    CapacitorHttp: {},
    CapacitorPreferences: {}
  }
};

export default config;
