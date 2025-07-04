import { z } from 'zod'

const schema = z.object({
  query: z.string().min(1),
})

export type UserQueryReceivedEventData = z.infer<typeof schema>

const parseValidatedData = (data: unknown): UserQueryReceivedEventData => {
  return schema.parse(data)
}

export const UserQueryReceivedEvent = {
  parseValidatedData,
  schema,
} as const
