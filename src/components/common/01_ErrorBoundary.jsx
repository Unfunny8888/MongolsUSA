import { Component } from 'react';
import { AlertCircle, Home, RefreshCw } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
      errorHistory: [],
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error, errorInfo) {
    // Update state
    this.setState((prevState) => {
      const newHistory = [...prevState.errorHistory, { error, time: new Date() }];
      return {
        errorInfo,
        errorCount: prevState.errorCount + 1,
        errorHistory: newHistory.slice(-10), // Keep last 10 errors
      };
    });

    // Log to console
    console.error('🚨 Error caught by boundary:', error);
    console.error('📋 Component Stack:', errorInfo.componentStack);

    // Optional: Send to monitoring service
    if (window.__MONITORING__) {
      window.__MONITORING__.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack,
            errorCount: this.state.errorCount + 1,
          },
        },
      });
    }

    // Optional: Send to Sentry
    if (window.__SENTRY__) {
      window.__SENTRY__.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack,
          },
        },
      });
    }

    // Log to server (optional)
    if (import.meta.env.PROD) {
      fetch('/api/logs/error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: error.toString(),
          stack: errorInfo.componentStack,
          timestamp: new Date().toISOString(),
          url: window.location.href,
          userAgent: navigator.userAgent,
        }),
      }).catch(() => {
        // Silently fail if logging endpoint is down
      });
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    // Optional: Reload page
    // window.location.href = '/';
  };

  handleReload = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      const isDevelopment = import.meta.env.DEV;

      return (
        <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            {/* Error Icon */}
            <div className="flex justify-center mb-6">
              <div className="bg-red-100 p-4 rounded-full">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
            </div>

            {/* Error Title */}
            <h1 className="text-2xl font-bold text-center text-slate-900 mb-2">
              Oops! Something Went Wrong
            </h1>

            {/* Error Description */}
            <p className="text-center text-slate-600 mb-6">
              We're sorry for the inconvenience. Our team has been notified and we're working on a fix.
            </p>

            {/* Error Details (Development Only) */}
            {isDevelopment && this.state.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 max-h-48 overflow-auto font-mono text-xs">
                <div className="mb-3">
                  <p className="font-semibold text-red-900 mb-2">Error Message:</p>
                  <p className="text-red-800 break-words whitespace-pre-wrap">
                    {this.state.error.toString()}
                  </p>
                </div>

                {this.state.errorInfo && (
                  <details className="mt-3">
                    <summary className="cursor-pointer font-semibold text-red-900 mb-2">
                      Stack Trace
                    </summary>
                    <pre className="mt-2 whitespace-pre-wrap break-words text-red-700 bg-white p-2 rounded border border-red-100 overflow-auto max-h-40">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}

                <div className="mt-3 pt-3 border-t border-red-200">
                  <p className="text-red-900">
                    <strong>Error Count:</strong> {this.state.errorCount}
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={this.handleReset}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 active:bg-blue-800 transition duration-200 shadow-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
              <button
                onClick={this.handleReload}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 active:bg-slate-100 transition duration-200"
              >
                <Home className="w-4 h-4" />
                Go Home
              </button>
            </div>

            {/* Warning for multiple errors */}
            {this.state.errorCount > 3 && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-amber-800 text-sm font-medium">
                  ⚠️ Multiple errors detected. Please refresh the page or contact support if the problem persists.
                </p>
              </div>
            )}

            {/* Development Footer */}
            {isDevelopment && (
              <div className="mt-6 p-3 bg-slate-100 rounded-lg">
                <p className="text-xs text-slate-600 font-mono">
                  Development Mode • Error Boundary Active
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
