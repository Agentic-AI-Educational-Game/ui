import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.app', // Make sure this is your actual app ID
  appName: 'edtech-game',
  webDir: 'dist',
  
  // This server block is for local development with a physical device
  server: {
    // We remove the hostname, allowing Capacitor to default correctly
    // This simplifies the configuration. The key is the scheme.
    
    // --- THIS IS THE CRUCIAL FIX ---
    // Change the scheme from "https" to "http" for Android
    androidScheme: 'http', 
    
    // You can keep the iOS one as https if you're not developing for it,
    // or change it to http as well for consistency.
    iosScheme: 'https'
  }
};

export default config;