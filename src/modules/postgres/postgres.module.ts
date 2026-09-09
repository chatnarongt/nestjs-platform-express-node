import { Module } from '@nestjs/common'
import { PostgresController } from './postgres.controller.js'
import { PostgresService } from './postgres.service.js'

@Module({
  imports: [],
  controllers: [PostgresController],
  providers: [PostgresService],
  exports: [PostgresService],
})
export class PostgresModule {}
