import React from "react";
import { render, screen } from "@testing-library/react";
import { ErrorBoundary } from "../error-boundary";

function ThrowError() {
  throw new Error("Test error");
}

describe("ErrorBoundary", () => {
  it("renders children when no error", () => {
    render(
      <ErrorBoundary>
        <div>Test</div>
      </ErrorBoundary>,
    );
    expect(screen.getByText("Test")).toBeInTheDocument();
  });

  it("catches errors and renders fallback", () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>,
    );
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });
});
