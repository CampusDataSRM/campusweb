"use client";

import React from "react";

/**
 * Reusable ErrorBoundary component to catch JavaScript runtime errors in child
 * component trees, log those errors, and display a fallback UI instead of crashing
 * the entire application.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error, errorInfo) {
    const sectionLabel = this.props.sectionName
      ? `[ErrorBoundary: ${this.props.sectionName}]`
      : "[ErrorBoundary]";

    // Log the caught error to the console for monitoring/debugging
    console.error(`${sectionLabel} Uncaught error:`, error, errorInfo);

    // Call optional onError handler (for Sentry, PostHog, or custom analytics)
    if (typeof this.props.onError === "function") {
      this.props.onError(error, errorInfo);
    }
  }

  componentDidUpdate(prevProps) {
    if (this.state.hasError && this.props.resetKeys) {
      if (
        !prevProps.resetKeys ||
        !this.props.resetKeys.every((key, idx) =>
          Object.is(key, prevProps.resetKeys[idx])
        )
      ) {
        this.resetErrorBoundary();
      }
    }
  }

  resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: null,
    });

    if (typeof this.props.onReset === "function") {
      this.props.onReset();
    }
  };

  render() {
    const { hasError, error } = this.state;
    const { children, fallback, sectionName } = this.props;

    if (hasError) {
      if (typeof fallback === "function") {
        return fallback({
          error,
          resetErrorBoundary: this.resetErrorBoundary,
        });
      }

      if (fallback !== undefined && fallback !== null) {
        return fallback;
      }

      // Default user-friendly fallback UI
      return (
        <div
          data-testid="error-boundary-fallback"
          className="theme_box_bg p-6 my-4 flex flex-col items-center justify-center text-center border border-theme_red/30 rounded-xl"
        >
          <div className="flex items-center gap-2 mb-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-theme_red shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span className="text-base font-semibold text-white">
              Failed to load this section. Try refreshing.
            </span>
          </div>
          {sectionName && (
            <p className="text-xs text-theme_text_normal mb-2 opacity-80">
              Section: {sectionName}
            </p>
          )}
          <button
            type="button"
            onClick={this.resetErrorBoundary}
            className="mt-2 bg-gradient-to-br from-theme_primary/90 to-theme_secondary/90 hover:opacity-90 transition-opacity py-1.5 px-4 rounded-md text-theme_text_normal text-sm font-semibold flex items-center gap-1.5 shadow"
          >
            <span>Retry</span>
          </button>
        </div>
      );
    }

    return children;
  }
}

export default ErrorBoundary;
