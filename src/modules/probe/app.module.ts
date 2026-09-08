import { Module } from '@nestjs/common'
import { ProbeController } from './app.controller.js'
import { LivenessService, ReadinessService } from './services/index.js'

@Module({
  controllers: [ProbeController],
  providers: [LivenessService, ReadinessService],
})
export class ProbeModule {}
