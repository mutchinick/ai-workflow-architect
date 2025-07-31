import z from 'zod'

export const agentSchema = z.object({
  name: z.string().trim().min(1),
  role: z.string().trim().min(1),
  directive: z.string().trim().min(1),
  system: z.string().trim().min(1),
  prompt: z.string().trim().min(1),
  phaseName: z.string().trim().min(1),
})

export type Agent = z.infer<typeof agentSchema>
