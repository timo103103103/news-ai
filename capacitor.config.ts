import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.neverisai.app',
  appName: 'NexVeris AI',
  webDir: 'dist',
  server: {
    url: 'https://www.nexverisai.com',
    cleartext: false
  }
};

export default config;
