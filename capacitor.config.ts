import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.cartooncooking.game',
  appName: 'Cartoon Cooking',
  webDir: 'dist',
  server: {
    cleartext: true,
    allowNavigation: ['*'],
  },
  android: {
    buildOptions: {
      releaseType: 'APK',
    },
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0A1118',
      showSpinner: false,
    },
    StatusBar: {
      backgroundColor: '#0A1118',
      style: 'DARK',
      overlaysWebView: true,
    },
  },
};

export default config;
