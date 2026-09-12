import { Module } from '@nestjs/common'
import { MongodbController } from './mongodb.controller.js'
import { MongodbService } from './mongodb.service.js'

@Module({
  controllers: [MongodbController],
  providers: [MongodbService],
  exports: [MongodbService],
})
export class MongodbModule {}
