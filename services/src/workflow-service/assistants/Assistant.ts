import z from 'zod'

export const assistantSchema = z.object({
  name: z.string().trim().min(1),
  role: z.string().trim().min(1),
  directive: z.string().trim().min(1),
  system: z.string().trim().min(1),
  prompt: z.string().trim().min(1),
  phaseName: z.string().trim().min(1),
})

export type Assistant = z.infer<typeof assistantSchema>
