import { Module } from '@nestjs/common'
import { MssqlController } from './mssql.controller.js'
import { MssqlService } from './mssql.service.js'

@Module({
  imports: [],
  controllers: [MssqlController],
  providers: [MssqlService],
  exports: [MssqlService],
})
export class MssqlModule {}
