import { EntitySchema } from 'typeorm'
import { type DateOnly, type VacationStatus } from '@vm/shared'
import { type UserRow } from './UserEntity'

/** Row shape for the `vacation_requests` table. */
export interface VacationRequestRow {
  id: string
  userId: string
  startDate: DateOnly
  endDate: DateOnly
  reason: string | null
  status: VacationStatus
  comments: string | null
  createdAt: Date
  updatedAt: Date
  user?: UserRow
}

export const VacationRequestSchema = new EntitySchema<VacationRequestRow>({
  name: 'VacationRequest',
  tableName: 'vacation_requests',
  columns: {
    id: { type: 'uuid', primary: true },
    userId: { name: 'user_id', type: 'uuid' },
    startDate: { name: 'start_date', type: 'date' },
    endDate: { name: 'end_date', type: 'date' },
    reason: { type: 'text', nullable: true },
    status: { type: 'varchar' },
    comments: { type: 'text', nullable: true },
    createdAt: { name: 'created_at', type: 'timestamptz' },
    updatedAt: { name: 'updated_at', type: 'timestamptz' },
  },
  relations: {
    user: {
      type: 'many-to-one',
      target: 'User',
      joinColumn: { name: 'user_id' },
    },
  },
  indices: [
    { name: 'idx_vacation_requests_user_dates', columns: ['userId', 'startDate', 'endDate'] },
    { name: 'idx_vacation_requests_status', columns: ['status'] },
  ],
})
