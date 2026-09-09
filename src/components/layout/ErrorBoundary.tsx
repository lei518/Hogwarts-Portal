import { Component, type ReactNode } from "react";
import { TriangleAlert } from "lucide-react";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

function ErrorFallback() {
  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-4">
      <Card className="max-w-md w-full px-8 py-10 text-center">
        <TriangleAlert size={32} className="text-parchment-dim/60 mx-auto mb-4" />
        <h1 className="text-2xl font-display text-gold-bright mb-3">Something's Gone a Bit Wrong</h1>
        <p className="text-parchment-dim text-sm mb-8">
          Even the sturdiest magic misfires occasionally. Try reloading the portal, or head back to somewhere
          familiar.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => window.location.reload()}>Reload</Button>
          <Button variant="secondary" onClick={() => (window.location.href = "/")}>
            Return Home
          </Button>
        </div>
      </Card>
    </div>
  );
}

// Production Hardening (Phase 6) - the one class component in this
// codebase. React's Error Boundary API (getDerivedStateFromError /
// componentDidCatch) has no hook equivalent as of React 19, so this is a
// deliberate, narrow exception to the project's otherwise all-functional-
// component convention. Mounted once, at the app root (see main.tsx) -
// outside the Router/Auth/Game providers, so it can recover even if one of
// those fails during render. Reload does a full page reload rather than
// resetting local state, since a caught render error means the tree below
// this boundary is in an unknown state.
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, errorInfo: unknown) {
    console.error("Unhandled error caught by ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}
