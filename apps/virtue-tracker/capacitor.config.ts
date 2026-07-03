import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.virtuetracker.app",
  appName: "美德训练",
  webDir: "dist",
  server: {
    androidScheme: "https",
  },
  ios: {
    contentInset: "automatic",
    backgroundColor: "#ffffff",
  },
  android: {
    backgroundColor: "#ffffff",
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 1500,
      backgroundColor: "#ffffff",
      androidSplashResourceName: "splash",
      showSpinner: false,
    },
    StatusBar: {
      style: "LIGHT",
      backgroundColor: "#ffffff",
    },
  },
};

export default config;
