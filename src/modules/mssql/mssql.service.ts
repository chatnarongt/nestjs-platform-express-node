import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import sql, { ConnectionPool, config as MssqlConfig } from 'mssql'

@Injectable()
export class MssqlService implements OnModuleInit, OnModuleDestroy {
  private readonly config: MssqlConfig
  private pool: ConnectionPool

  constructor(private readonly configService: ConfigService) {
    const database = this.configService.get<string>('DATABASE')
    if (database !== 'mssql') {
      return
    }

    const server = this.configService.get<string>('DATABASE_HOST')
    if (!server) {
      throw new Error('DATABASE_HOST is not defined')
    }

    const dbConfig: MssqlConfig = {
      server,
      port: this.configService.get<number>('DATABASE_PORT'),
      user: this.configService.get<string>('DATABASE_USER'),
      password: this.configService.get<string>('DATABASE_PASSWORD'),
      database: this.configService.get<string>('DATABASE_NAME'),
      options: {
        encrypt: true,
        enableArithAbort: true,
        trustServerCertificate: true,
      },
    }

    this.config = dbConfig
  }

  async onModuleInit() {
    const database = this.configService.get<string>('DATABASE')
    if (database !== 'mssql') {
      return
    }

    this.pool = await sql.connect(this.config)
  }

  async onModuleDestroy() {
    const database = this.configService.get<string>('DATABASE')
    if (database !== 'mssql') {
      return
    }

    await this.pool.close()
  }

  request() {
    if (!this.pool) {
      throw new Error('Database connection is not initialized')
    }
    return this.pool.request()
  }
}
