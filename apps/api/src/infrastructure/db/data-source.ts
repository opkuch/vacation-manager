import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { UserSchema } from './entities/UserEntity'
import { VacationRequestSchema } from './entities/VacationRequestEntity'
import { InitialSchema1718900000000 } from './migrations/1718900000000-InitialSchema'

/**
 * TypeORM DataSource driven entirely by `DATABASE_URL`. Schema changes go
 * through explicit migrations (`synchronize: false`).
 */
export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [UserSchema, VacationRequestSchema],
  migrations: [InitialSchema1718900000000],
  synchronize: false,
  logging: false,
})
