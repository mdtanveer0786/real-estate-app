import React from 'react';
import { FiAlertTriangle } from 'react-icons/fi';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
        this.setState({ error, errorInfo });

        // You can log the error to an error reporting service here
        // Example: send to your analytics or error tracking service
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-[60vh] flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
                    <div className="text-center max-w-lg">
                        <FiAlertTriangle className="mx-auto text-6xl text-yellow-500 mb-4" />
                        <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            We're sorry for the inconvenience. Please try refreshing the page or contact support if the problem persists.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={() => window.location.reload()}
                                className="btn-primary"
                            >
                                Refresh Page
                            </button>
                            <button
                                onClick={() => window.location.href = '/'}
                                className="btn-secondary"
                            >
                                Go to Homepage
                            </button>
                        </div>
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <div className="mt-8 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-left overflow-auto max-h-96">
                                <p className="font-mono text-sm text-red-600 dark:text-red-400 whitespace-pre-wrap">
                                    {this.state.error.toString()}
                                </p>
                                {this.state.errorInfo && (
                                    <p className="font-mono text-xs text-red-500 dark:text-red-500 mt-2 whitespace-pre-wrap">
                                        {this.state.errorInfo.componentStack}
                                    </p>
                                )}
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