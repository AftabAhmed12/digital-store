import { Component } from "react";

// Catches render errors and shows them on screen instead of a blank page,
// so issues are visible instead of silent white screens in production.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-ink container-px">
          <div className="w-full max-w-md bg-surface border border-border rounded-xl p-8 text-center">
            <h1 className="font-display font-700 text-lg mb-3">Something went wrong</h1>
            <pre className="text-xs text-red-400 bg-ink border border-border rounded-lg p-4 mb-4 text-left overflow-auto whitespace-pre-wrap break-words">
              {String(this.state.error?.message || this.state.error)}
            </pre>
            <button
              onClick={() => this.setState({ error: null })}
              className="bg-gold text-ink font-semibold px-4 py-2 rounded-lg text-sm hover:brightness-110"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}