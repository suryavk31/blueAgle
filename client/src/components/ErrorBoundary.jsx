import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, info) {
        // In production, send to your error monitoring service (Sentry, etc.)
        console.error('ErrorBoundary caught an error:', error, info.componentStack);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#f9fafb',
                    padding: '2rem',
                    textAlign: 'center',
                    fontFamily: 'Outfit, sans-serif',
                }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚠️</div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1f2937', marginBottom: '0.5rem' }}>
                        Something went wrong
                    </h1>
                    <p style={{ color: '#6b7280', marginBottom: '2rem', maxWidth: '400px' }}>
                        An unexpected error occurred. Please try refreshing the page or return to the home page.
                    </p>
                    <button
                        onClick={this.handleReset}
                        style={{
                            background: '#ff3269',
                            color: 'white',
                            border: 'none',
                            padding: '0.75rem 2rem',
                            borderRadius: '0.75rem',
                            fontWeight: 600,
                            fontSize: '1rem',
                            cursor: 'pointer',
                        }}
                    >
                        Return to Home
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
