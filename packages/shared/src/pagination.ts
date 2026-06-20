import { z } from 'zod'

/** Query params for any paginated listing endpoint. */
export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
})
export type PaginationQuery = z.infer<typeof PaginationQuerySchema>

/** Envelope returned by paginated endpoints. */
export interface Paginated<T> {
  data: T[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}

/** Builds a Zod schema for a paginated envelope around a given item schema. */
export const paginatedSchema = <T extends z.ZodTypeAny>(item: T) =>
  z.object({
    data: z.array(item),
    page: z.number().int(),
    pageSize: z.number().int(),
    total: z.number().int(),
    totalPages: z.number().int(),
  })
