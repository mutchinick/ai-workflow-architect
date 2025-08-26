// Filename: app/page.tsx
// This single file creates a complete Next.js page to visualize your AI workflow.
// "use client" is required for App Router components that use React hooks.
"use client";

import { useState, useEffect, useRef, FormEvent, KeyboardEvent } from "react";
import type { NextPage } from "next";
// To render Markdown, you'll need to install react-markdown and its GFM plugin.
// Run: npm install react-markdown remark-gfm
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// --- Helper Components ---

// A simple loading spinner component
const Spinner = () => (
  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
);

// Chevron icon for the collapsible header
const ChevronIcon = ({ isCollapsed }: { isCollapsed: boolean }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={`h-5 w-5 transition-transform duration-300 ${
      isCollapsed ? "rotate-0" : "rotate-90"
    }`}
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
      clipRule="evenodd"
    />
  </svg>
);

// Component to render a single step in the response evolution
const ChatStep = ({
  step,
  index,
  totalSteps,
  isCollapsed,
  onToggleCollapse,
}: {
  step: any;
  index: number;
  totalSteps: number;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}) => {
  const isLastStep = index === totalSteps - 1;
  const stepColor = isLastStep
    ? "border-blue-500 bg-blue-50"
    : "border-gray-200 bg-white";
  const textColor = isLastStep ? "text-blue-700" : "text-gray-500";

  let llmResultContent = step.llmResult || "*Processing...*";
  const isJson =
    llmResultContent.trim().startsWith("[") &&
    llmResultContent.trim().endsWith("]");

  if (isJson) {
    llmResultContent = "```json\n" + llmResultContent + "\n```";
  }

  // This safer regex finds any sequence of zero or more newlines followed by a code fence
  // and replaces it with exactly two newlines, ensuring proper spacing without affecting other text.
  const formattedContent = llmResultContent.replace(/\n*```/g, "\n```");

  return (
    <div
      className={`border-l-4 ${stepColor} rounded-r-lg mb-4 transition-all duration-500 overflow-hidden`}
    >
      {/* The header is now a button to toggle the collapse state */}
      <button
        onClick={onToggleCollapse}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div>
          <div className="font-semibold text-gray-900">
            {step.assistant?.name || `Assistant ${index + 1}`}
          </div>
          <div className={`text-xs ${textColor}`}>
            {step.assistant?.role} ({step.assistant?.phaseName})
          </div>
        </div>
        <ChevronIcon isCollapsed={isCollapsed} />
      </button>

      {/* The content is conditionally rendered based on the isCollapsed state */}
      {!isCollapsed && (
        <div className="px-4 pb-4">
          <div
            className="text-gray-800 border-t pt-4 break-words
                       [&_h1]:text-xl [&_h1]:font-bold [&_h1]:my-4
                       [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:my-3
                       [&_h3]:text-base [&_h3]:font-semibold [&_h3]:my-2
                       [&_p]:my-2
                       [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-5
                       [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-5
                       /* Style for code blocks */
                       [&_pre]:bg-slate-900 [&_pre]:text-slate-200 [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:text-xs [&_pre]:whitespace-pre-wrap [&_pre]:border [&_pre]:border-slate-700
                       /* Default style for all code (inline) */
                       [&_code]:bg-gray-200 [&_code]:text-gray-800 [&_code]:px-1.5 [&_code]:py-1 [&_code]:rounded-md [&_code]:text-sm [&_code]:font-mono
                       /* Reset inline styles for code inside a block */
                       [&_pre_code]:bg-transparent [&_pre_code]:text-inherit [&_pre_code]:p-0 [&_pre_code]:rounded-none
                       [&_a]:text-blue-600 [&_a]:hover:underline"
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {formattedContent}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Main Page Component ---

const WorkflowVisualizerPage: NextPage = () => {
  const [question, setQuestion] = useState<string>("");
  const [workflowId, setWorkflowId] = useState<string | null>(null);
  const [steps, setSteps] = useState<any[]>([]);
  const [collapsedSteps, setCollapsedSteps] = useState<Record<string, boolean>>(
    {}
  );
  const [manualToggles, setManualToggles] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPolling, setIsPolling] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [question]);

  useEffect(() => {
    if (steps.length > 0) {
      const lastCompletedIndex = steps
        .map((step) => step.stepStatus)
        .lastIndexOf("completed");

      setCollapsedSteps((prev) => {
        const newCollapsedState = { ...prev };
        steps.forEach((step, index) => {
          if (!manualToggles.has(step.stepId)) {
            if (lastCompletedIndex !== -1) {
              const shouldBeExpanded =
                index === lastCompletedIndex ||
                index === lastCompletedIndex + 1;
              newCollapsedState[step.stepId] = !shouldBeExpanded;
            } else {
              newCollapsedState[step.stepId] = index > 0;
            }
          }
        });
        return newCollapsedState;
      });
    }
  }, [steps, manualToggles]);

  useEffect(() => {
    if (isPolling && workflowId) {
      pollingIntervalRef.current = setInterval(async () => {
        try {
          const apiBaseUrl =
            process.env.NEXT_PUBLIC_WORKFLOW_SERVICE_API_BASE_URL;
          if (!apiBaseUrl) {
            throw new Error(
              "NEXT_PUBLIC_WORKFLOW_SERVICE_API_BASE_URL is not defined in your .env.local file."
            );
          }

          const response = await fetch(
            `${apiBaseUrl}/api/v1/workflow-service/getLatestWorkflow`,
            {
              method: "POST",
              mode: "cors",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ workflowId: workflowId }),
            }
          );

          if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
          }

          const data = await response.json();
          const workflowSteps = data.steps || [];
          setSteps(workflowSteps);

          if (workflowSteps.length > 0) {
            const lastStep = workflowSteps[workflowSteps.length - 1];
            if (
              lastStep &&
              (lastStep.stepStatus === "completed" ||
                lastStep.stepStatus === "failed")
            ) {
              setIsPolling(false);
              setIsLoading(false);
              if (lastStep.stepStatus === "failed") {
                setError("The workflow failed to complete.");
              }
            }
          }
        } catch (err) {
          console.error(err);
          setError(
            err instanceof Error
              ? err.message
              : "An unknown error occurred during polling."
          );
          setIsPolling(false);
          setIsLoading(false);
        }
      }, 10000);
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [isPolling, workflowId]);

  const handleToggleCollapse = (stepId: string) => {
    setManualToggles((prev) => new Set(prev).add(stepId));
    setCollapsedSteps((prev) => ({
      ...prev,
      [stepId]: !prev[stepId],
    }));
  };

  const handleSubmit = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!question.trim()) return;

    setSteps([]);
    setCollapsedSteps({});
    setManualToggles(new Set());
    setError(null);
    setIsLoading(true);
    setWorkflowId(null);
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_WORKFLOW_SERVICE_API_BASE_URL;
      if (!apiBaseUrl) {
        throw new Error(
          "NEXT_PUBLIC_WORKFLOW_SERVICE_API_BASE_URL is not defined in your .env.local file."
        );
      }

      const response = await fetch(
        `${apiBaseUrl}/api/v1/workflow-service/sendQuery`,
        {
          method: "POST",
          mode: "cors",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: question }),
        }
      );

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      const data = await response.json();
      setWorkflowId(data.workflowId);
      setIsPolling(true);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred."
      );
      setIsLoading(false);
    }
  };

  const handleTextareaKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen font-sans flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
          AI Workflow Visualizer
        </h1>
        <p className="text-center text-gray-500 mb-8">
          Ask a question to see the step-by-step evolution of the AI's response.
        </p>

        {/* Input Form */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row items-center gap-4 mb-8"
        >
          <textarea
            ref={textareaRef}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleTextareaKeyDown}
            placeholder="Ask your question here..."
            className="flex-grow w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition resize-none overflow-hidden"
            disabled={isLoading}
            rows={1}
          />
          <button
            type="submit"
            className="w-full sm:w-auto bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Spinner /> Working...
              </>
            ) : (
              "Ask"
            )}
          </button>
        </form>

        {/* Results Area */}
        <div className="space-y-4">
          {error && (
            <div
              className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg"
              role="alert"
            >
              <p className="font-bold">Error</p>
              <p>{error}</p>
            </div>
          )}

          {steps.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">
                Response Evolution
              </h2>
              {steps.map((step, index) => (
                <ChatStep
                  key={step.stepId || index}
                  step={step}
                  index={index}
                  totalSteps={steps.length}
                  isCollapsed={!!collapsedSteps[step.stepId]}
                  onToggleCollapse={() => handleToggleCollapse(step.stepId)}
                />
              ))}
            </div>
          )}

          {isLoading && steps.length === 0 && (
            <div className="text-center text-gray-500 p-8">
              <p>Starting the workflow...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkflowVisualizerPage;
