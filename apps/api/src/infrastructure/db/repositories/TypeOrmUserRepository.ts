import { type DataSource, type Repository } from 'typeorm'
import { type UserRepository } from '../../../application/ports/UserRepository'
import { User } from '../../../domain/user/User'
import { UserSchema, type UserRow } from '../entities/UserEntity'

export class TypeOrmUserRepository implements UserRepository {
  private readonly repo: Repository<UserRow>

  constructor(dataSource: DataSource) {
    this.repo = dataSource.getRepository(UserSchema)
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = await this.repo.findOne({ where: { email } })
    return row ? this.toDomain(row) : null
  }

  async findById(id: string): Promise<User | null> {
    const row = await this.repo.findOne({ where: { id } })
    return row ? this.toDomain(row) : null
  }

  private toDomain(row: UserRow): User {
    return User.rehydrate({
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role,
      passwordHash: row.passwordHash,
      createdAt: row.createdAt.toISOString(),
    })
  }
}
