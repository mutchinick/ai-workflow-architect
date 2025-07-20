export type FailureKind =
  | 'UnrecognizedError'
  | 'InvalidArgumentsError'
  | 'DuplicateEventError'
  | 'DuplicateWorkflowError'
  | 'WorkflowFileNotFoundError'
  | 'WorkflowFileCorruptedError'
  | 'BedrockInvokeTransientError'
  | 'BedrockInvokePermanentError'
