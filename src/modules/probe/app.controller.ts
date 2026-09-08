import { Controller, Get } from '@nestjs/common'
import { LivenessService, ReadinessService } from './services/index.js'

@Controller('probe')
export class ProbeController {
  constructor(
    private readonly livenessService: LivenessService,
    private readonly readinessService: ReadinessService,
  ) {}

  @Get('liveness')
  checkLiveness(): boolean {
    return this.livenessService.checkLiveness()
  }

  @Get('readiness')
  checkReadiness(): boolean {
    return this.readinessService.checkReadiness()
  }
}
