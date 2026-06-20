import { type User } from '../../domain/user/User'

/** Persistence boundary for users (a driven port, implemented by infrastructure). */
export interface UserRepository {
  findByEmail(email: string): Promise<User | null>
  findById(id: string): Promise<User | null>
}
