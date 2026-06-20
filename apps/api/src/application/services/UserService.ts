import { ErrorCode, type UserDto } from '@vm/shared'
import { DomainError } from '../../domain/errors/DomainError'
import { type UserRepository } from '../ports/UserRepository'

export class UserService {
  constructor(private readonly users: UserRepository) {}

  async getById(userId: string): Promise<UserDto> {
    const user = await this.users.findById(userId)
    if (!user) {
      throw new DomainError(ErrorCode.NOT_FOUND, 'User not found')
    }
    return user.toDto()
  }
}
