import type { CapacitorConfig } from '@capacitor/cli';
import { KeyboardResize, KeyboardStyle } from '@capacitor/keyboard';

const config: CapacitorConfig = {
  appId: 'io.cyna.app',
  appName: 'Cyna',
  webDir: 'www/browser',
  plugins: {
    SplashScreen: {
      // Hide programmatically from AppComponent once Angular is ready, so
      // we don't get the white flash between the native auto-hide timeout
      // and Angular's first paint. launchShowDuration acts as a safety
      // ceiling in case AppComponent.ngOnInit never runs.
      launchShowDuration: 3000,
      backgroundColor: '#4f39f6',
      showSpinner: false,
      launchAutoHide: false,
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
