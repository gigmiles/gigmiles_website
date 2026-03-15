import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.gigmiles.app',
  appName: 'GigMiles',
  webDir: 'out',
  server: {
    androidScheme: 'https'
  }
};

export default config;
