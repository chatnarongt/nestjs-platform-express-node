import { Controller, Get, Res } from '@nestjs/common'
import type { Response } from 'express'

@Controller('bench')
export class BenchController {
  @Get('plaintext')
  plaintext(@Res() res: Response) {
    res.send('Hello, World!')
  }

  @Get('json')
  json(@Res() res: Response) {
    res.json({ message: 'Hello, World!' })
  }
}
