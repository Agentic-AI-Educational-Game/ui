import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.app',
  appName: 'edtech-game',
  webDir: 'dist',
  server :{
    hostname: 'localhost',
    "iosScheme": "https",
		"androidScheme": "https"
  }
};


export default config;
