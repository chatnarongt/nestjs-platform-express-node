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
}
