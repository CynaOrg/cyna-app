import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.cyna.app',
  appName: 'Cyna',
  webDir: 'www/browser',
  plugins: {
    SplashScreen: {
      // Long enough for AuthStore.tryRestoreSession() to settle, short
      // enough to feel snappy. Background matches the brand primary so the
      // status bar transition into the app is invisible.
      launchShowDuration: 2000,
      backgroundColor: '#4f39f6',
      showSpinner: false,
      launchAutoHide: true,
    },
    StatusBar: {
      style: 'DEFAULT',
    },
  },
};

export default config;
