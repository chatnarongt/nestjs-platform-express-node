import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './modules/app/index.js'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  const configService = app.get(ConfigService)

  const port = configService.get<number>('PORT') ?? 3000

  await app.listen(port)
}
await bootstrap()
