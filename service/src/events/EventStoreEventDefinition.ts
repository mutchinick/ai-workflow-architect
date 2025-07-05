import { z } from 'zod'

export interface EventStoreEventDefinition<T extends z.ZodTypeAny> {
  schema: T
  generateIdempotencyKey: (data: z.infer<T>) => string
}
