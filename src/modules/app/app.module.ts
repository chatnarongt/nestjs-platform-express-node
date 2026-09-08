import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ProbeModule } from '../probe/app.module.js'

@Module({
  imports: [ConfigModule.forRoot(), ProbeModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
