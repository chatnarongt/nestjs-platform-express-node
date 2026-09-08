import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { BenchModule } from '../bench/bench.module.js'
import { ProbeModule } from '../probe/app.module.js'

@Module({
  imports: [ConfigModule.forRoot(), ProbeModule, BenchModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
