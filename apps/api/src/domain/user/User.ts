import { type Role, type UserDto } from '@vm/shared'

interface UserProps {
  id: string
  name: string
  email: string
  role: Role
  passwordHash: string
  createdAt: string
}

/**
 * User identity. The password hash stays inside the aggregate and is never part
 * of the DTO; credential verification is performed by a `PasswordHasher` port.
 */
export class User {
  private constructor(private readonly props: UserProps) {}

  static rehydrate(props: UserProps): User {
    return new User(props)
  }

  get id(): string {
    return this.props.id
  }

  get passwordHash(): string {
    return this.props.passwordHash
  }

  /** The subset of identity encoded into a JWT (no timestamps). */
  get claims(): Pick<UserDto, 'name' | 'email' | 'role'> & { sub: string } {
    return {
      sub: this.props.id,
      name: this.props.name,
      email: this.props.email,
      role: this.props.role,
    }
  }

  toDto(): UserDto {
    return {
      id: this.props.id,
      name: this.props.name,
      email: this.props.email,
      role: this.props.role,
      createdAt: this.props.createdAt,
    }
  }
}
