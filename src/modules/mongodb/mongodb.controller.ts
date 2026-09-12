import { BadRequestException, Controller, Get, NotFoundException, Query } from '@nestjs/common'
import { MongodbService } from './mongodb.service.js'

type WorldUpdate = {
  id: number
  randomNumber: number
}

function integer(value: unknown, name: string, minimum = Number.MIN_SAFE_INTEGER) {
  if (
    (typeof value !== 'string' && typeof value !== 'number') ||
    (typeof value === 'string' && value.trim() === '')
  ) {
    throw new BadRequestException(`${name} must be an integer`)
  }

  const number = Number(value)
  if (!Number.isSafeInteger(number) || number < minimum) {
    throw new BadRequestException(`${name} must be an integer`)
  }

  return number
}

function requiredValues(value: string | string[] | undefined, name: string) {
  const values = value === undefined ? [] : Array.isArray(value) ? value : [value]
  if (!values.length) {
    throw new BadRequestException(`${name} is required`)
  }

  return values
}

function parseRecord(value: string): WorldUpdate {
  try {
    const parsed: unknown = JSON.parse(value)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error()
    }

    const { id, randomNumber } = parsed as Record<string, unknown>
    return {
      id: integer(id, 'record.id', 1),
      randomNumber: integer(randomNumber, 'record.randomNumber'),
    }
  } catch (error) {
    if (error instanceof BadRequestException) {
      throw error
    }

    throw new BadRequestException('record must be valid JSON')
  }
}

@Controller('bench')
export class MongodbController {
  constructor(private readonly db: MongodbService) {}

  /**
   * GET /bench/read-one?id=1
   */
  @Get('read-one')
  async readOne(@Query('id') id: string) {
    const world = await this.db.findOne(integer(id, 'id', 1))
    if (!world) {
      throw new NotFoundException()
    }

    return world
  }

  /**
   * GET /bench/read-many?limit=10&offset=0
   */
  @Get('read-many')
  async readMany(@Query('limit') limit: string, @Query('offset') offset: string) {
    const worlds = await this.db.findMany(integer(limit, 'limit', 1), integer(offset, 'offset', 0))
    if (!worlds.length) {
      throw new NotFoundException()
    }

    return worlds
  }

  /**
   * GET /bench/create-one?randomNumber=42
   */
  @Get('create-one')
  async createOne(@Query('randomNumber') randomNumber: string) {
    await this.db.createOne(integer(randomNumber, 'randomNumber'))
  }

  /**
   * GET /bench/create-many?randomNumber=42&randomNumber=43
   */
  @Get('create-many')
  async createMany(@Query('randomNumber') randomNumbers: string | string[]) {
    await this.db.createMany(
      requiredValues(randomNumbers, 'randomNumber').map((value) => integer(value, 'randomNumber')),
    )
  }

  /**
   * GET /bench/update-one?record={"id":1,"randomNumber":42}
   */
  @Get('update-one')
  async updateOne(@Query('record') value: string) {
    const { id, randomNumber } = parseRecord(value)
    const result = await this.db.updateOne(id, randomNumber)
    if (!result.matchedCount) {
      throw new NotFoundException()
    }
  }

  /**
   * GET /bench/update-many?record={"id":1,"randomNumber":42}&record={"id":2,"randomNumber":43}
   */
  @Get('update-many')
  async updateMany(@Query('record') records: string | string[]) {
    const result = await this.db.updateMany(requiredValues(records, 'record').map(parseRecord))
    if (!result.matchedCount) {
      throw new NotFoundException()
    }
  }

  /**
   * GET /bench/delete-one?id=1
   */
  @Get('delete-one')
  async deleteOne(@Query('id') id: string) {
    const result = await this.db.deleteOne(integer(id, 'id', 1))
    if (!result.deletedCount) {
      throw new NotFoundException()
    }
  }

  /**
   * GET /bench/delete-many?id=1&id=2&id=3
   */
  @Get('delete-many')
  async deleteMany(@Query('id') ids: string | string[]) {
    const result = await this.db.deleteMany(
      requiredValues(ids, 'id').map((id) => integer(id, 'id', 1)),
    )
    if (!result.deletedCount) {
      throw new NotFoundException()
    }
  }
}
