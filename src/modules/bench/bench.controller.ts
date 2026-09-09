import { Controller, Get, NotFoundException, Query } from '@nestjs/common'
import sql from 'mssql'
import { MssqlService } from '../mssql/mssql.service.js'

@Controller('bench')
export class BenchController {
  constructor(private readonly db: MssqlService) {}

  @Get('read-one')
  async readOne(@Query('id') id: string) {
    const result = await this.db
      .request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM world WHERE id = @id')

    if (!result.recordset[0]) {
      throw new NotFoundException()
    }

    return result.recordset[0]
  }

  @Get('read-many')
  async readMany(@Query('limit') limit: string, @Query('offset') offset: string) {
    const result = await this.db
      .request()
      .input('limit', sql.Int, limit)
      .input('offset', sql.Int, offset)
      .query('SELECT * FROM world ORDER BY id OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY')

    if (!result.recordset.length) {
      throw new NotFoundException()
    }

    return result.recordset
  }

  @Get('create-one')
  async createOne(@Query('randomNumber') randomNumber: string) {
    await this.db
      .request()
      .input('randomNumber', sql.Int, randomNumber)
      .query('INSERT INTO world (random_number) VALUES (@randomNumber)')
  }

  @Get('create-many')
  async createMany(@Query('randomNumber') randomNumbers: string[]) {
    const query = `
      INSERT INTO world (random_number) VALUES
      ${randomNumbers.map((_, index) => `(@randomNumber${index})`).join(', ')}
    `
    const request = this.db.request()

    randomNumbers.forEach((randomNumber, index) => {
      request.input(`randomNumber${index}`, sql.Int, randomNumber)
    })

    await request.query(query)
  }

  @Get('update-one')
  async updateOne(@Query('record') record: string) {
    const { id, randomNumber } = JSON.parse(record)
    const result = await this.db
      .request()
      .input('id', sql.Int, id)
      .input('randomNumber', sql.Int, randomNumber)
      .query('UPDATE world SET random_number = @randomNumber WHERE id = @id')

    if (result.rowsAffected[0] === 0) {
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
      ${data.map((_, index) => `WHEN @id${index} THEN @randomNumber${index}`).join(' ')}
      END
      WHERE id IN (${data.map((_, index) => `@id${index}`).join(', ')})
    `
    const request = this.db.request()

    data.forEach(({ id, randomNumber }, index) => {
      request.input(`id${index}`, sql.Int, id)
      request.input(`randomNumber${index}`, sql.Int, randomNumber)
    })

    const result = await request.query(query)

    if (result.rowsAffected[0] === 0) {
      throw new NotFoundException()
    }
  }
}
