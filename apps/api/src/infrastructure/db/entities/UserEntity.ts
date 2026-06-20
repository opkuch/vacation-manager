import { EntitySchema } from 'typeorm'
import { type Role } from '@vm/shared'

/** Row shape for the `users` table. */
export interface UserRow {
  id: string
  name: string
  email: string
  passwordHash: string
  role: Role
  createdAt: Date
}

// EntitySchema (not decorators) keeps entities plain objects, avoiding the
// reflect-metadata / esbuild pitfalls that decorator entities suffer under
// bundling.
export const UserSchema = new EntitySchema<UserRow>({
  name: 'User',
  tableName: 'users',
  columns: {
    id: { type: 'uuid', primary: true },
    name: { type: 'varchar' },
    email: { type: 'varchar', unique: true },
    passwordHash: { name: 'password_hash', type: 'varchar' },
    role: { type: 'varchar' },
    createdAt: { name: 'created_at', type: 'timestamptz' },
  },
})
