import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { MssqlService } from './mssql.service.js'

@Module({
  imports: [
    ConfigModule.forFeature(() => ({
      DATABASE: process.env.DATABASE,
      DATABASE_HOST: process.env.DATABASE_HOST,
      DATABASE_PORT: parseInt(process.env.DATABASE_PORT || '1433', 10),
      DATABASE_USER: process.env.DATABASE_USER,
      DATABASE_PASSWORD: process.env.DATABASE_PASSWORD,
      DATABASE_NAME: process.env.DATABASE_NAME,
    })),
  ],
  controllers: [],
  providers: [MssqlService],
  exports: [MssqlService],
})
export class MssqlModule {}
