import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ionic.ASL',
  appName: 'ASL Interpreter',
  webDir: 'www',
  bundledWebRuntime: false,
  server: {
    cleartext: true  // Allows HTTP
    
  },
  android: {
    allowMixedContent: true
  }
};

export default config;

