import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.cyna.app',
  appName: 'Cyna',
  webDir: 'www/browser',
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1447E6',
      showSpinner: false,
      launchAutoHide: true,
    },
    StatusBar: {
      style: 'DEFAULT',
    },
  },
};

export default config;
