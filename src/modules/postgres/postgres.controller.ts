import { Controller, Get, NotFoundException, Query } from '@nestjs/common'
import { PostgresService } from './postgres.service.js'

@Controller('bench')
export class PostgresController {
  constructor(private readonly db: PostgresService) {}

  /**
   * Reads a single record from the "world" table based on the provided ID.
   *
   * GET /bench/read-one?id=1
   */
  @Get('read-one')
  async readOne(@Query('id') id: string) {
    const result = await this.db.query('SELECT * FROM world WHERE id = $1', [id])

    if (!result.rows[0]) {
      throw new NotFoundException()
    }

    return result.rows[0]
  }

  /**
   * Reads multiple records from the "world" table based on the provided limit and offset.
   *
   * GET /bench/read-many?limit=10&offset=0
   */
  @Get('read-many')
  async readMany(@Query('limit') limit: string, @Query('offset') offset: string) {
    const result = await this.db.query('SELECT * FROM world ORDER BY id LIMIT $1 OFFSET $2', [
      limit,
      offset,
    ])

    if (!result.rows.length) {
      throw new NotFoundException()
    }

    return result.rows
  }

  /**
   * Creates a single record in the "world" table based on the provided random number.
   *
   * GET /bench/create-one?randomNumber=42
   */
  @Get('create-one')
  async createOne(@Query('randomNumber') randomNumber: string) {
    await this.db.query('INSERT INTO world (random_number) VALUES ($1)', [randomNumber])
  }

  /**
   * Creates multiple records in the "world" table based on the provided array of random numbers.
   *
   * GET /bench/create-many?randomNumber=42&randomNumber=43...
   */
  @Get('create-many')
  async createMany(@Query('randomNumber') randomNumbers: string[]) {
    const query = `
      INSERT INTO world (random_number) VALUES
      ${randomNumbers.map((_, index) => `($${index + 1})`).join(', ')}
    `

    await this.db.query(query, randomNumbers)
  }

  /**
   * Updates a single record in the "world" table based on the provided JSON string containing "id" and "randomNumber" properties.
   * Throws a NotFoundException if the record does not exist.
   *
   * GET /bench/update-one?record={"id":1,"randomNumber":42}
   */
  @Get('update-one')
  async updateOne(@Query('record') record: string) {
    const { id, randomNumber } = JSON.parse(record)
    const result = await this.db.query('UPDATE world SET random_number = $1 WHERE id = $2', [
      randomNumber,
      id,
    ])

    if (result.rowCount === 0) {
      throw new NotFoundException()
    }
  }

  /**
   * Updates multiple records in the "world" table based on the provided array of records.
   * Each record should be a JSON string containing "id" and "randomNumber" properties.
   * Throws a NotFoundException if no records are updated.
   *
   * GET /bench/update-many?record={"id":1,"randomNumber":42}&record={"id":2,"randomNumber":43}...
   */
  @Get('update-many')
  async updateMany(@Query('record') records: string[]) {
    const data = records.map((record) => JSON.parse(record))
    const query = `
      UPDATE world SET random_number = CASE id
      ${data.map((_, index) => `WHEN $${index * 2 + 1} THEN $${index * 2 + 2}`).join(' ')}
      END
      WHERE id IN (${data.map((_, index) => `$${index * 2 + 1}`).join(', ')})
    `
    const values = data.flatMap(({ id, randomNumber }) => [id, randomNumber])

    const result = await this.db.query(query, values)

    if (result.rowCount === 0) {
      throw new NotFoundException()
    }
  }

  /**
   * Deletes a single record from the "world" table based on the provided ID.
   * Throws a NotFoundException if the record does not exist.
   *
   * GET /bench/delete-one?id=1
   */
  @Get('delete-one')
  async deleteOne(@Query('id') id: string) {
    const result = await this.db.query('DELETE FROM world WHERE id = $1', [id])

    if (result.rowCount === 0) {
      throw new NotFoundException()
    }
  }

  /**
   * Deletes multiple records from the "world" table based on the provided array of IDs.
   * Throws a NotFoundException if no records are deleted.
   *
   * GET /bench/delete-many?id=1&id=2&id=3...
   */
  @Get('delete-many')
  async deleteMany(@Query('id') ids: string[]) {
    const query = `
      DELETE FROM world
      WHERE id IN (${ids.map((_, index) => `$${index + 1}`).join(', ')})
    `

    const result = await this.db.query(query, ids)

    if (result.rowCount === 0) {
      throw new NotFoundException()
    }
  }
}
