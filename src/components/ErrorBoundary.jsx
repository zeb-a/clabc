import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '20px',
          background: '#fef2f2',
          color: '#991b1b'
        }}>
          <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>⚠️</h1>
          <h2 style={{ fontSize: '24px', marginBottom: '12px', fontWeight: '700' }}>
            Something went wrong
          </h2>
          <p style={{ fontSize: '16px', marginBottom: '24px', maxWidth: '500px', textAlign: 'center' }}>
            We're sorry, but an unexpected error occurred. Please try refreshing the page.
          </p>
          <button
            onClick={this.handleReset}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: '700',
              background: '#991b1b',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Try Again
          </button>
          {this.state.error && (
            <details style={{ marginTop: '32px', maxWidth: '600px' }}>
              <summary style={{ cursor: 'pointer', fontWeight: '600' }}>
                Error Details
              </summary>
              <pre style={{
                marginTop: '12px',
                padding: '16px',
                background: '#fff',
                borderRadius: '8px',
                fontSize: '12px',
                overflow: 'auto'
              }}>
                {this.state.error.toString()}
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
