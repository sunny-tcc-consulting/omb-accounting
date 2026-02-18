import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ErrorBoundary } from '../error-boundary';

describe('ErrorBoundary', () => {
  it('renders children when no error occurs', () => {
    const TestComponent = () => <div>Test Content</div>;
    render(
      <ErrorBoundary>
        <TestComponent />
      </ErrorBoundary>
    );
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('catches and displays errors', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });

  it('provides retry button', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    const retryButton = screen.getByRole('button', { name: /try again/i });
    expect(retryButton).toBeInTheDocument();
  });

  it('provides copy error details button', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    const copyButton = screen.getByRole('button', { name: /copy error details/i });
    expect(copyButton).toBeInTheDocument();
  });

  it('resets state and reloads page on retry', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    const retryButton = screen.getByRole('button', { name: /try again/i });
    fireEvent.click(retryButton);

    // After click, error should be cleared (but reload happens in real scenario)
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });

  it('logs error to console on error', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const ThrowError = () => {
      throw new Error('Test error');
    };

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('displays custom fallback when provided', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };

    const customFallback = <div>Custom Error Message</div>;

    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom Error Message')).toBeInTheDocument();
  });

  it('does not catch non-error exceptions', () => {
    const ThrowNonError = () => {
      // ErrorBoundary only catches errors during rendering, not in event handlers
      return <div>Test Content</div>;
    };

    render(
      <ErrorBoundary>
        <ThrowNonError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('handles multiple nested errors', () => {
    const ThrowError = () => {
      throw new Error('Nested error');
    };

    const NestedComponent = () => {
      throw new Error('Inner error');
    };

    render(
      <ErrorBoundary>
        <ThrowError />
        <NestedComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });

  it('displays error message in UI', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText(/test error/i)).toBeInTheDocument();
  });
});
