import { Injectable, OnModuleDestroy } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Pool, PoolConfig } from 'pg'

@Injectable()
export class PostgresService implements OnModuleDestroy {
  private pool: Pool

  constructor(private readonly configService: ConfigService) {
    const database = this.configService.get<string>('DATABASE')
    if (database !== 'postgres') {
      return
    }

    const host = this.configService.get<string>('DATABASE_HOST')
    if (!host) {
      throw new Error('DATABASE_HOST is not defined')
    }

    const dbConfig: PoolConfig = {
      host,
      port: +(this.configService.get<string>('DATABASE_PORT') || '5432'),
      user: this.configService.get<string>('DATABASE_USER'),
      password: this.configService.get<string>('DATABASE_PASSWORD'),
      database: this.configService.get<string>('DATABASE_NAME'),
      min: +(this.configService.get<string>('DATABASE_MIN_POOL_SIZE') || '0'),
      max: +(this.configService.get<string>('DATABASE_MAX_POOL_SIZE') || '10'),
    }

    this.pool = new Pool(dbConfig)
  }

  async onModuleDestroy() {
    await this.pool?.end()
  }

  query(text: string, values?: unknown[]) {
    if (!this.pool) {
      throw new Error('Database connection is not initialized')
    }
    return this.pool.query(text, values)
  }
}
