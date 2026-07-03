import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AccountButton, SyncProvider } from "lifestyle-sync";
import App from "./App";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { applyRemotePayload } from "./store";
import { STORAGE_KEY } from "./types";
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
        <SyncProvider appKey={STORAGE_KEY} onRemoteData={applyRemotePayload}>
          <AccountButton />
          <App />
        </SyncProvider>
      </ErrorBoundary>
    </StrictMode>,
  );
}

bootstrap();
