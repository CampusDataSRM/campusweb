import React, { useState } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import ErrorBoundary from "./index";

const ProblematicChild = ({ shouldThrow = false, message = "Test error" }) => {
  if (shouldThrow) {
    throw new Error(message);
  }
  return <div data-testid="working-child">Child loaded normally</div>;
};

const ResettableDashboardSection = () => {
  const [shouldThrow, setShouldThrow] = useState(true);

  return (
    <div>
      <button
        data-testid="fix-data-btn"
        onClick={() => setShouldThrow(false)}
      >
        Fix Data
      </button>
      <ErrorBoundary sectionName="Resettable Section">
        <ProblematicChild shouldThrow={shouldThrow} />
      </ErrorBoundary>
    </div>
  );
};

const SimulatedDashboard = () => (
  <div data-testid="dashboard">
    <ErrorBoundary sectionName="Timetable">
      <ProblematicChild shouldThrow={true} message="Timetable crashed" />
    </ErrorBoundary>
    <ErrorBoundary sectionName="Stats">
      <ProblematicChild shouldThrow={false} />
    </ErrorBoundary>
    <ErrorBoundary sectionName="Event Carousel">
      <div data-testid="carousel-widget">Carousel works</div>
    </ErrorBoundary>
  </div>
);

describe("ErrorBoundary", () => {
  let consoleErrorSpy;

  beforeEach(() => {
    // Silence React/console error output for expected error boundary catches
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it("renders children normally when no error occurs", () => {
    render(
      <ErrorBoundary>
        <ProblematicChild shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByTestId("working-child")).toBeInTheDocument();
    expect(screen.getByText("Child loaded normally")).toBeInTheDocument();
    expect(screen.queryByTestId("error-boundary-fallback")).not.toBeInTheDocument();
  });

  it("catches rendering errors and displays the default fallback UI", () => {
    render(
      <ErrorBoundary sectionName="Timetable">
        <ProblematicChild shouldThrow={true} message="API malformed data" />
      </ErrorBoundary>
    );

    expect(screen.getByTestId("error-boundary-fallback")).toBeInTheDocument();
    expect(
      screen.getByText("Failed to load this section. Try refreshing.")
    ).toBeInTheDocument();
    expect(screen.getByText("Section: Timetable")).toBeInTheDocument();
    expect(screen.queryByTestId("working-child")).not.toBeInTheDocument();
  });

  it("logs errors to console.error when a child component throws", () => {
    render(
      <ErrorBoundary sectionName="Stats">
        <ProblematicChild shouldThrow={true} message="Stats error" />
      </ErrorBoundary>
    );

    expect(consoleErrorSpy).toHaveBeenCalled();
    const errorMessageCall = consoleErrorSpy.mock.calls.some((call) =>
      typeof call[0] === "string" && call[0].includes("[ErrorBoundary: Stats]")
    );
    expect(errorMessageCall).toBe(true);
  });

  it("invokes the onError callback when a child throws", () => {
    const onErrorMock = vi.fn();

    render(
      <ErrorBoundary onError={onErrorMock}>
        <ProblematicChild shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(onErrorMock).toHaveBeenCalledTimes(1);
    expect(onErrorMock).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String),
      })
    );
  });

  it("supports custom fallback element as a prop", () => {
    render(
      <ErrorBoundary fallback={<div data-testid="custom-fallback">Custom Error View</div>}>
        <ProblematicChild shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByTestId("custom-fallback")).toBeInTheDocument();
    expect(screen.getByText("Custom Error View")).toBeInTheDocument();
    expect(screen.queryByTestId("error-boundary-fallback")).not.toBeInTheDocument();
  });

  it("supports custom fallback function receiving error and resetErrorBoundary", () => {
    const fallbackFn = ({ error, resetErrorBoundary }) => (
      <div>
        <span data-testid="custom-fn-error">{error.message}</span>
        <button data-testid="custom-fn-retry" onClick={resetErrorBoundary}>
          Custom Retry
        </button>
      </div>
    );

    render(
      <ErrorBoundary fallback={fallbackFn}>
        <ProblematicChild shouldThrow={true} message="Function fallback error" />
      </ErrorBoundary>
    );

    expect(screen.getByTestId("custom-fn-error")).toHaveTextContent(
      "Function fallback error"
    );
    expect(screen.getByTestId("custom-fn-retry")).toBeInTheDocument();
  });

  it("allows retrying via the retry button after fixing underlying data", () => {
    render(<ResettableDashboardSection />);

    // Initially child throws -> Fallback is rendered
    expect(
      screen.getByText("Failed to load this section. Try refreshing.")
    ).toBeInTheDocument();

    // User fixes the data source in state
    fireEvent.click(screen.getByTestId("fix-data-btn"));

    // Click Retry on the fallback UI
    fireEvent.click(screen.getByText("Retry"));

    // Now working child should render normally
    expect(screen.getByTestId("working-child")).toBeInTheDocument();
    expect(screen.getByText("Child loaded normally")).toBeInTheDocument();
  });

  it("automatically resets error boundary when resetKeys change", () => {
    const TestWithKeys = ({ resetKey, shouldThrow }) => (
      <ErrorBoundary resetKeys={[resetKey]}>
        <ProblematicChild shouldThrow={shouldThrow} />
      </ErrorBoundary>
    );

    const { rerender } = render(<TestWithKeys resetKey="key1" shouldThrow={true} />);

    expect(
      screen.getByText("Failed to load this section. Try refreshing.")
    ).toBeInTheDocument();

    // Rerender with new key and fixed child prop
    rerender(<TestWithKeys resetKey="key2" shouldThrow={false} />);

    expect(screen.getByTestId("working-child")).toBeInTheDocument();
    expect(
      screen.queryByText("Failed to load this section. Try refreshing.")
    ).not.toBeInTheDocument();
  });

  it("isolates errors so other dashboard widgets continue rendering normally when one fails", () => {
    render(<SimulatedDashboard />);

    // The failing widget (Timetable) renders the fallback UI
    expect(screen.getByText("Section: Timetable")).toBeInTheDocument();
    expect(
      screen.getByText("Failed to load this section. Try refreshing.")
    ).toBeInTheDocument();

    // The other widgets (Stats and Event Carousel) continue rendering normally!
    expect(screen.getByTestId("working-child")).toBeInTheDocument();
    expect(screen.getByText("Child loaded normally")).toBeInTheDocument();
    expect(screen.getByTestId("carousel-widget")).toBeInTheDocument();
    expect(screen.getByText("Carousel works")).toBeInTheDocument();
  });
});
