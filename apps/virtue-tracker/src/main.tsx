import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { ErrorBoundary } from "./components/ErrorBoundary";
import "./index.css";

async function bootstrap() {
  try {
    const { Capacitor } = await import("@capacitor/core");
    if (Capacitor.isNativePlatform()) {
      const { initNativeShell } = await import("./lib/native");
      await initNativeShell();
    }
  } catch {
    // 浏览器环境忽略
  }

  const root = document.getElementById("root");
  if (!root) return;

  createRoot(root).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  );
}

bootstrap();
