/* eslint-disable react/no-unescaped-entities */
"use client";

import type { NextPage } from "next";
import { FormEvent, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ClipboardDocumentIcon, ClipboardDocumentCheckIcon } from "@heroicons/react/24/outline";

// ==============================================
// Type Definitions
// ==============================================
interface Assistant {
  name: string;
  role: string;
  system: string;
  prompt: string;
  phaseName: string;
}

interface Step {
  stepId: string;
  stepStatus: "pending" | "completed";
  llmResult?: string;
  assistant?: Assistant;
}

// ==============================================
// Constants
// ==============================================
const POLLING_INTERVAL_MS = 10000;

// ==============================================
// API Helper Functions
// ==============================================
const apiBaseUrl = process.env.NEXT_PUBLIC_WORKFLOW_SERVICE_API_BASE_URL;

/**
 * Starts a new workflow.
 * @param query The query to send to the workflow.
 * @returns The ID of the newly created workflow.
 */
async function startWorkflow(query: string): Promise<{ workflowId: string; query: string }> {
  if (!apiBaseUrl) {
    throw new Error("NEXT_PUBLIC_WORKFLOW_SERVICE_API_BASE_URL is not defined in your .env.local file.");
  }
  const response = await fetch(`${apiBaseUrl}/api/v1/workflow-service/sendQuery`, {
    method: "POST",
    mode: "cors",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Fetches the latest steps of a workflow.
 * @param workflowId The ID of the workflow to fetch.
 * @returns The steps of the workflow and its status.
 */
async function fetchWorkflowSteps(workflowId: string): Promise<{ steps?: Step[]; workflowStatus?: string }> {
  if (!apiBaseUrl) {
    throw new Error("NEXT_PUBLIC_WORKFLOW_SERVICE_API_BASE_URL is not defined in your .env.local file.");
  }
  const response = await fetch(`${apiBaseUrl}/api/v1/workflow-service/getLatestWorkflow`, {
    method: "POST",
    mode: "cors",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ workflowId }),
  });
  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }
  return response.json();
}

// ==============================================
// Helper Components
// ==============================================

/**
 * Spinner component displays a simple loading spinner.
 * @returns The rendered Spinner component.
 */
const Spinner = () => <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-gray-900"></div>;

/**
 * ChevronIcon component displays a chevron that rotates based on the isCollapsed prop.
 * @param isCollapsed Whether the chevron is in a collapsed state.
 * @returns The rendered ChevronIcon component.
 */
const ChevronIcon = ({ isCollapsed }: { isCollapsed: boolean }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={`h-5 w-5 transition-transform duration-300 ${isCollapsed ? "rotate-0" : "rotate-90"}`}
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

/**
 * ChatStep component displays a single step in the chat workflow.
 * @param step The step data to display.
 * @param index The index of the step in the workflow.
 * @param totalSteps The total number of steps in the workflow.
 * @param isCollapsed Whether the step is collapsed or expanded.
 * @returns The rendered ChatStep component.
 */
const ChatStep = ({
  step,
  index,
  totalSteps,
  isCollapsed,
  onToggleCollapse,
  showPrompts,
}: {
  step: Step;
  index: number;
  totalSteps: number;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  showPrompts: boolean;
}) => {
  const isLastStep = index === totalSteps - 1;
  const stepColor = isLastStep ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white";
  const textColor = isLastStep ? "text-blue-700" : "text-gray-500";

  let llmResultContent = step.llmResult || "*Processing...*";
  const isJson = llmResultContent.trim().startsWith("[") && llmResultContent.trim().endsWith("]");

  if (isJson) {
    llmResultContent = "```json\n" + llmResultContent + "\n```";
  }

  const formattedContent = llmResultContent.replace(/\n*```/g, "\n```");

  return (
    <div className={`border-l-4 ${stepColor} mb-4 overflow-hidden rounded-r-lg transition-all duration-500`}>
      <button
        onClick={onToggleCollapse}
        className="flex w-full items-center justify-between p-4 text-left"
      >
        <div>
          <div className="font-semibold text-gray-900">{step.assistant?.name || `Assistant ${index + 1}`}</div>
          <div className={`text-xs ${textColor}`}>
            {step.assistant?.role} ({step.assistant?.phaseName})
          </div>
          {showPrompts && step.assistant && (
            <>
              <div className={`mt-2 mr-2 mb-2 p-2 text-sm outline outline-1 outline-gray-300`}>
                <span className="font-bold">System: </span>
                {step.assistant?.system}
              </div>
              <div className={`mt-2 mr-2 mb-2 p-2 text-sm outline outline-1 outline-gray-300`}>
                <span className="font-bold">Prompt: </span>
                {step.assistant?.prompt}
              </div>
            </>
          )}
        </div>
        <ChevronIcon isCollapsed={isCollapsed} />
      </button>
      {!isCollapsed && (
        <div className="px-4 pb-4">
          <div className="border-t pt-4 break-words text-gray-800 [&_a]:text-blue-600 [&_a]:hover:underline [&_code]:rounded-md [&_code]:bg-gray-200 [&_code]:px-1.5 [&_code]:py-1 [&_code]:font-mono [&_code]:text-sm [&_code]:text-gray-800 [&_h1]:my-4 [&_h1]:text-xl [&_h1]:font-bold [&_h2]:my-3 [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:my-2 [&_h3]:text-base [&_h3]:font-semibold [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-2 [&_pre]:rounded-lg [&_pre]:border [&_pre]:border-slate-700 [&_pre]:bg-slate-900 [&_pre]:p-4 [&_pre]:text-xs [&_pre]:whitespace-pre-wrap [&_pre]:text-slate-200 [&_pre_code]:rounded-none [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-inherit [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-5">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{formattedContent}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * CompareSolutions component displays a side-by-side comparison of two solutions.
 * @param solutionA The first solution to compare.
 * @param solutionB The last solution to compare.
 * @returns The rendered CompareSolutions component.
 */
const CompareSolutions = ({
  question,
  solutionA,
  solutionB,
  isCollapsed,
}: {
  question: string;
  solutionA: string;
  solutionB: string;
  isCollapsed: boolean;
}) => {
  const [copied, setCopied] = useState(false);

  // Check if the component is collapsed; if so, render nothing
  if (isCollapsed) return null;

  // When workflow not finished, show a placeholder
  if (!solutionA || !solutionB)
    return (
      <div className="mb-[32px] rounded-lg bg-gray-50 p-[32px] outline outline-1 outline-gray-300">
        <h2 className="text-md font-semibold text-gray-700">
          Compare Solutions Prompt will be available once the workflow completes.
        </h2>
      </div>
    );

  // When workflow finished, show the full prompt with solutions
  const fullPrompt = `
Compare the following two solutions.

Evaluate them as if you were grading a consultant's response.
  
Focus on:

1. Completeness - does the solution address the question fully?
2. Clarity & explanations - does it teach, not just tell?
3. Accuracy & correctness - are claims and steps factually sound?
4. Practicality & applicability - can a learner realistically follow it?
5. Structure & readability - is it organized and free of contradictions?
6. Depth & insight - does it offer reasoning, context, or best practices?

Relative grading:
- Best solution should usually land between 75-95.
- Worst solution should usually land between 10-30.

Do not provide your solution to the answer, just the evaluation.

Finish with a short TL;DR starting with the relative numerical grades and explaining why one is better in this question's context.

This is the original question or task they were solving for along with the two solutions to compare.

---

Question: ${question}

---

This is Solution A: ${solutionA}

---

This is Solution B: ${solutionB}

`.trim();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(fullPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mb-[32px] rounded-lg bg-gray-50 p-[32px] outline outline-1 outline-gray-300">
      <h2 className="text-md mb-2 font-semibold text-gray-700">Compare Solutions Prompt</h2>
      <p className="mb-3 text-sm text-gray-600">
        Copy this prompt as is then paste it into your LLM of choice to compare the first vs last solution.
      </p>
      <div className="relative">
        <textarea
          readOnly
          value={fullPrompt}
          className="h-48 w-full rounded-lg border border-gray-300 bg-white p-3 font-mono text-sm text-gray-800"
        />
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 rounded-md bg-gray-200 p-2 hover:bg-gray-300"
          title="Copy to clipboard"
        >
          {copied ? (
            <ClipboardDocumentCheckIcon className="h-5 w-5 cursor-pointer text-green-600" />
          ) : (
            <ClipboardDocumentIcon className="h-5 w-5 cursor-pointer text-gray-600" />
          )}
        </button>
      </div>
    </div>
  );
};

// ==============================================
// Main Page Component
// ==============================================

/**
 * The main page component for the AI Workflow Visualizer.
 * @returns The main page component for the AI Workflow Visualizer.
 */
const WorkflowVisualizerPage: NextPage = () => {
  const [liveUserInput, setLiveUserInput] = useState("");
  const [sentUserQuestion, setSentUserQuestion] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [workflowId, setWorkflowId] = useState<string | null>(null);
  const [steps, setSteps] = useState<Step[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [collapsedSteps, setCollapsedSteps] = useState<Record<string, boolean>>({});
  const [manualToggles, setManualToggles] = useState<Set<string>>(new Set());

  const [showPrompts, setShowPrompts] = useState(false);
  const [showCompareSolutions, setShowCompareSolutions] = useState(false);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [liveUserInput]);

  useEffect(() => {
    if (steps.length > 0) {
      const lastCompletedIndex = steps.map((step) => step.stepStatus).lastIndexOf("completed");
      setCollapsedSteps((prev) => {
        const newCollapsedState = { ...prev };
        steps.forEach((step, index) => {
          if (!manualToggles.has(step.stepId)) {
            if (lastCompletedIndex !== -1) {
              const shouldBeExpanded = index === lastCompletedIndex || index === lastCompletedIndex + 1;
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
    if (isPolling && !isPaused && workflowId) {
      pollingIntervalRef.current = setInterval(async () => {
        try {
          const data = await fetchWorkflowSteps(workflowId);
          const workflowSteps = data.steps || [];
          setSteps(workflowSteps);

          if (workflowSteps.length > 0) {
            const lastStep = workflowSteps[workflowSteps.length - 1];
            if (lastStep && lastStep.stepStatus === "completed") {
              setIsPolling(false);
              setIsLoading(false);
            }
          }
        } catch (err) {
          console.error(err);
          setError(err instanceof Error ? err.message : "An unknown error occurred during polling.");
          setIsPolling(false);
          setIsLoading(false);
        }
      }, POLLING_INTERVAL_MS);
    }
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [isPolling, isPaused, workflowId]);

  const handleToggleCollapse = (stepId: string) => {
    setManualToggles((prev) => new Set(prev).add(stepId));
    setCollapsedSteps((prev) => ({ ...prev, [stepId]: !prev[stepId] }));
  };

  const resetForNewSubmission = () => {
    setSteps([]);
    setCollapsedSteps({});
    setManualToggles(new Set());
    setError(null);
    setIsLoading(false);
    setIsPolling(false);
    setIsPaused(false);
    setWorkflowId(null);
    setSentUserQuestion(null);
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
  };

  const handleSubmit = async (e?: FormEvent) => {
    e?.preventDefault();

    const question = liveUserInput.trim();
    if (!question || isLoading) return;

    resetForNewSubmission();
    setIsLoading(true);
    setSentUserQuestion(question);

    try {
      const data = await startWorkflow(question);
      setWorkflowId(data.workflowId);
      setIsPolling(true);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    resetForNewSubmission();
    setLiveUserInput("");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4 font-sans">
      <div className="w-full max-w-5xl rounded-xl bg-white p-8 shadow-lg">
        <h1 className="mb-2 text-center text-3xl font-bold text-gray-800">AI Workflow Visualizer</h1>
        <p className="mb-8 text-center text-gray-500">
          Ask a question to see the step-by-step evolution of the AI's response.
        </p>
        <form
          onSubmit={handleSubmit}
          className="mb-8"
        >
          <div className="flex flex-col rounded-lg border border-gray-300 shadow-sm transition-shadow">
            <textarea
              ref={textareaRef}
              value={liveUserInput}
              onChange={(e) => setLiveUserInput(e.target.value)}
              placeholder="Ask your question here..."
              className="h-24 max-h-96 w-full resize-none overflow-hidden overflow-y-auto border-none bg-transparent p-3 focus:outline-none"
              disabled={isLoading}
              rows={1}
            />
            <div className="flex items-center justify-end gap-2 rounded-b-lg border-t border-gray-200 bg-gray-50 p-2">
              {isPolling && isPaused && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="rounded-lg bg-red-500 px-4 py-2 font-semibold text-white transition hover:bg-red-600"
                >
                  Cancel
                </button>
              )}
              {isPolling && (
                <button
                  type="button"
                  onClick={() => setIsPaused(!isPaused)}
                  className="rounded-lg bg-gray-200 px-4 py-2 font-semibold text-gray-700 transition hover:bg-gray-300"
                >
                  {isPaused ? "Resume Polling" : "Pause Polling"}
                </button>
              )}
              <button
                type="submit"
                className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                disabled={isLoading}
              >
                {isLoading ? (
                  isPaused ? (
                    "Paused"
                  ) : (
                    <>
                      <Spinner /> Working...
                    </>
                  )
                ) : (
                  "Ask"
                )}
              </button>
            </div>
          </div>
        </form>
        <div className="space-y-4">
          {error && (
            <div
              className="rounded-r-lg border-l-4 border-red-500 bg-red-100 p-4 text-red-700"
              role="alert"
            >
              <p className="font-bold">Error</p>
              <p>{error}</p>
            </div>
          )}
          {steps.length > 0 && (
            <div className="rounded-lg bg-gray-50 p-4">
              <h2 className="mb-4 text-xl font-semibold text-gray-700">Response Evolution</h2>
              <div className="mr-2 mb-5 flex justify-start gap-4">
                <label className="inline-flex cursor-pointer items-center rounded-lg p-3 text-gray-600 outline outline-1 outline-gray-300">
                  <input
                    type="checkbox"
                    checked={showPrompts}
                    onChange={() => setShowPrompts(!showPrompts)}
                    className="mr-2"
                  />
                  Show Assistants Workflow Prompts
                </label>
                <label className="inline-flex cursor-pointer items-center rounded-lg p-3 text-gray-600 outline outline-1 outline-gray-300">
                  <input
                    type="checkbox"
                    checked={showCompareSolutions}
                    onChange={() => setShowCompareSolutions(!showCompareSolutions)}
                    className="mr-2"
                  />
                  Show Compare Solutions Prompt
                </label>
              </div>
              <CompareSolutions
                isCollapsed={!showCompareSolutions}
                question={sentUserQuestion || ""}
                solutionA={steps[1]?.llmResult || ""}
                solutionB={steps[steps.length - 1]?.llmResult || ""}
              />
              {steps.map((step, index) => (
                <ChatStep
                  key={step.stepId || index}
                  step={step}
                  index={index}
                  totalSteps={steps.length}
                  isCollapsed={!!collapsedSteps[step.stepId]}
                  onToggleCollapse={() => handleToggleCollapse(step.stepId)}
                  showPrompts={showPrompts}
                />
              ))}
            </div>
          )}
          {isLoading && steps.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <p>Starting the workflow...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkflowVisualizerPage;
