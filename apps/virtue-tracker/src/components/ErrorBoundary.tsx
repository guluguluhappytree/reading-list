import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("App error:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            minHeight: "100dvh",
            padding: "32px 24px",
            background: "#ffffff",
            color: "#37352f",
            fontFamily: '-apple-system, "PingFang SC", sans-serif',
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            gap: 16,
          }}
        >
          <div style={{ fontSize: "2rem" }}>⚠️</div>
          <h1 style={{ fontSize: "1.125rem", color: "#37352f", fontWeight: 600 }}>页面加载出错</h1>
          <p style={{ fontSize: "0.875rem", color: "#787774", lineHeight: 1.6 }}>
            {this.state.error.message}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: 8,
              padding: "10px 20px",
              background: "#37352f",
              color: "#ffffff",
              border: "none",
              borderRadius: 6,
              fontSize: "0.875rem",
              fontWeight: 500,
            }}
          >
            重新加载
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
