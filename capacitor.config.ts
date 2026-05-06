import type { CapacitorConfig } from '@capacitor/cli';
import { KeyboardResize, KeyboardStyle } from '@capacitor/keyboard';

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
    Keyboard: {
      resize: KeyboardResize.Native,
      style: KeyboardStyle.Default,
      resizeOnFullScreen: true,
    },
  },
};

export default config;
