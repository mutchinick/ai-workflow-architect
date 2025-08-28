// Filename: __tests__/page.test.tsx
// This file contains unit tests for the main workflow visualizer page.

import React from "react";
// Import 'act' to handle asynchronous state updates correctly
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import WorkflowVisualizerPage from "../app/page"; // Adjust the import path as needed

// Mock the global fetch function to simulate API calls
global.fetch = jest.fn();

// Define the polling interval constant used in the component, so the test has access to it.
const POLLING_INTERVAL_MS = 10000;

// Helper function to mock a successful fetch response
const mockFetchSuccess = (data: unknown) => {
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve(data),
  });
};

// Helper function to mock a failed fetch response
const mockFetchFailure = (statusText: string) => {
  return Promise.resolve({
    ok: false,
    statusText,
  });
};

describe("WorkflowVisualizerPage", () => {
  beforeEach(() => {
    // Reset mocks before each test
    (global.fetch as jest.Mock).mockClear();
    // Use fake timers to control setInterval
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // Test 1: Initial Render
  test("renders the initial UI correctly", () => {
    render(<WorkflowVisualizerPage />);
    expect(screen.getByText("AI Workflow Visualizer")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Ask your question here...")
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ask" })).toBeInTheDocument();
  });

  // Test 2: Form Submission and Workflow Start
  test("submits a question and starts the polling process", async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      mockFetchSuccess({ workflowId: "test-workflow-123" })
    );

    render(<WorkflowVisualizerPage />);

    const textarea = screen.getByPlaceholderText("Ask your question here...");
    const askButton = screen.getByRole("button", { name: "Ask" });

    // Using act to ensure state updates from user interaction are processed
    await act(async () => {
      fireEvent.change(textarea, { target: { value: "What are unit tests?" } });
      fireEvent.click(askButton);
    });

    expect(await screen.findByText("Working...")).toBeInTheDocument();

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/workflow-service/sendQuery"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ query: "What are unit tests?" }),
        })
      );
    });

    expect(screen.getByText("Starting the workflow...")).toBeInTheDocument();
  });

  // Test 3: Polling and Displaying Steps (Refactored)
  test("polls for results and displays the steps as they arrive", async () => {
    const fetchMock = global.fetch as jest.Mock;

    // Mock the initial call to start the workflow
    fetchMock.mockImplementationOnce(() =>
      mockFetchSuccess({ workflowId: "test-workflow-123" })
    );

    render(<WorkflowVisualizerPage />);

    // Start the workflow
    await act(async () => {
      fireEvent.change(
        screen.getByPlaceholderText("Ask your question here..."),
        { target: { value: "Test question" } }
      );
      fireEvent.click(screen.getByRole("button", { name: "Ask" }));
    });

    // Mock the first polling response
    const firstPollResponse = {
      steps: [
        {
          stepId: "step-1",
          stepStatus: "completed",
          assistant: { name: "Assistant 1" },
          llmResult: "This is the first step.",
        },
        {
          stepId: "step-2",
          stepStatus: "pending",
          assistant: { name: "Assistant 2" },
          llmResult: "",
        },
      ],
    };
    fetchMock.mockImplementationOnce(() => mockFetchSuccess(firstPollResponse));

    // Advance timers to trigger the first poll and wait for the result
    await act(async () => {
      jest.advanceTimersByTime(POLLING_INTERVAL_MS);
    });

    expect(await screen.findByText("Assistant 1")).toBeInTheDocument();
    expect(screen.getByText("This is the first step.")).toBeInTheDocument();

    // Mock the second (and final) polling response
    const finalPollResponse = {
      steps: [
        {
          stepId: "step-1",
          stepStatus: "completed",
          assistant: { name: "Assistant 1" },
          llmResult: "This is the first step.",
        },
        {
          stepId: "step-2",
          stepStatus: "completed",
          assistant: { name: "Assistant 2" },
          llmResult: "This is the second and final step.",
        },
      ],
    };
    fetchMock.mockImplementationOnce(() => mockFetchSuccess(finalPollResponse));

    // Advance timers for the second poll
    await act(async () => {
      jest.advanceTimersByTime(POLLING_INTERVAL_MS);
    });

    expect(
      await screen.findByText("This is the second and final step.")
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ask" })).toBeInTheDocument();
  });

  // Test 4: Error Handling
  test("displays an error message if the initial API call fails", async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      mockFetchFailure("Internal Server Error")
    );

    render(<WorkflowVisualizerPage />);

    fireEvent.change(screen.getByPlaceholderText("Ask your question here..."), {
      target: { value: "This will fail" },
    });

    // Wrap the submission in act()
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Ask" }));
    });

    expect(await screen.findByText("Error")).toBeInTheDocument();
    expect(
      screen.getByText("API Error: Internal Server Error")
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ask" })).not.toBeDisabled();
  });
});
