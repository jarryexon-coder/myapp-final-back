import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Update state to show fallback UI on next render.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can log the error to a service here.
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI.
      return <h1>Something went wrong in this section.</h1>;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
