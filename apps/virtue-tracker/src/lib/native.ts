import { Capacitor } from "@capacitor/core";

export const isNative = Capacitor.isNativePlatform();
export const platform = Capacitor.getPlatform();

export async function initNativeShell() {
  if (!isNative) return;

  const { App: CapApp } = await import("@capacitor/app");
  const { StatusBar, Style } = await import("@capacitor/status-bar");
  const { SplashScreen } = await import("@capacitor/splash-screen");

  document.documentElement.classList.add("native-app", `platform-${platform}`);

  try {
    await StatusBar.setStyle({ style: Style.Light });
    if (platform === "android") {
      await StatusBar.setBackgroundColor({ color: "#ffffff" });
    }
  } catch {
    // ignore
  }

  try {
    await SplashScreen.hide();
  } catch {
    // ignore
  }

  if (platform === "android") {
    CapApp.addListener("backButton", ({ canGoBack }) => {
      if (canGoBack) {
        window.history.back();
      } else {
        CapApp.exitApp();
      }
    });
  }
}
