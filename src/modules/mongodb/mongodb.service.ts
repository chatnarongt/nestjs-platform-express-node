import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Collection, MongoClient } from 'mongodb'

type World = {
  id: number
  random_number: number
}

type Counter = {
  _id: 'world'
  seq: number
}

@Injectable()
export class MongodbService implements OnModuleInit, OnModuleDestroy {
  private readonly client: MongoClient
  private worlds: Collection<World>
  private counters: Collection<Counter>

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('DATABASE_HOST')
    if (!host) {
      throw new Error('DATABASE_HOST is not defined')
    }

    const username = this.configService.get<string>('DATABASE_USER')
    const password = this.configService.get<string>('DATABASE_PASSWORD')

    this.client = new MongoClient(
      `mongodb://${host}:${this.configService.get<string>('DATABASE_PORT') || '27017'}`,
      {
        auth: username ? { username, password } : undefined,
        authSource: username ? 'admin' : undefined,
        minPoolSize: +(this.configService.get<string>('DATABASE_MIN_POOL_SIZE') || '0'),
        maxPoolSize: +(this.configService.get<string>('DATABASE_MAX_POOL_SIZE') || '10'),
      },
    )
  }

  async onModuleInit() {
    await this.client.connect()

    const database = this.client.db(this.configService.get<string>('DATABASE_NAME') || 'benchmark')
    this.worlds = database.collection<World>('world')
    this.counters = database.collection<Counter>('counters')
  }

  async onModuleDestroy() {
    await this.client.close()
  }

  async findOne(id: number) {
    const world = await this.worlds.findOne({ id }, { projection: { _id: 0 } })
    return world && { id: world.id, random_number: world.random_number }
  }

  async findMany(limit: number, offset: number) {
    const worlds = await this.worlds
      .find({}, { projection: { _id: 0 } })
      .sort({ id: 1 })
      .skip(offset)
      .limit(limit)
      .toArray()

    return worlds.map(({ id, random_number }) => ({ id, random_number }))
  }

  async createOne(randomNumber: number) {
    const id = await this.nextId()
    await this.worlds.insertOne({ id, random_number: randomNumber })
  }

  async createMany(randomNumbers: number[]) {
    const firstId = await this.nextId(randomNumbers.length)
    await this.worlds.insertMany(
      randomNumbers.map((randomNumber, index) => ({
        id: firstId + index,
        random_number: randomNumber,
      })),
    )
  }

  updateOne(id: number, randomNumber: number) {
    return this.worlds.updateOne({ id }, { $set: { random_number: randomNumber } })
  }

  updateMany(records: Array<{ id: number; randomNumber: number }>) {
    return this.worlds.bulkWrite(
      records.map(({ id, randomNumber }) => ({
        updateOne: { filter: { id }, update: { $set: { random_number: randomNumber } } },
      })),
    )
  }

  deleteOne(id: number) {
    return this.worlds.deleteOne({ id })
  }

  deleteMany(ids: number[]) {
    return this.worlds.deleteMany({ id: { $in: ids } })
  }

  private async nextId(count = 1) {
    const counter = await this.counters.findOneAndUpdate(
      { _id: 'world' },
      { $inc: { seq: count } },
      { returnDocument: 'after', upsert: true, includeResultMetadata: false },
    )

    if (!counter) {
      throw new Error('World counter is not initialized')
    }

    return counter.seq - count + 1
  }
}
