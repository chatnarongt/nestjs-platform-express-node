import { Module } from '@nestjs/common'
import { MssqlModule } from '../mssql/mssql.module.js'
import { BenchController } from './bench.controller.js'

@Module({
  imports: [MssqlModule],
  controllers: [BenchController],
  providers: [],
})
export class BenchModule {}
