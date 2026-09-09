import { readFileSync } from 'node:fs'
import path from 'node:path'
import { DynamicModule, Module } from '@nestjs/common'
import dotenv from 'dotenv'
import { MssqlModule } from '../mssql/mssql.module.js'
import { PostgresModule } from '../postgres/postgres.module.js'

@Module({})
export class BenchModule {
  static register(): DynamicModule {
    const imports: DynamicModule['imports'] = []

    const envFileInRoot = path.resolve(process.cwd(), '.env')
    const envConfig = dotenv.parse(readFileSync(envFileInRoot))

    if (envConfig.DATABASE === 'mssql') {
      imports.push(MssqlModule)
    }

    if (envConfig.DATABASE === 'postgres') {
      imports.push(PostgresModule)
    }

    return {
      module: BenchModule,
      imports,
    }
  }
}
