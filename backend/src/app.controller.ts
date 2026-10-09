import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { DataSource } from 'typeorm';
import { Public } from './auth/public.decorator.js';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly dataSource: DataSource) {}

  @Public()
  @SkipThrottle()
  @Get('health')
  @ApiOperation({ summary: 'Liveness check used by Docker' })
  @ApiOkResponse({ schema: { example: { status: 'ok', database: 'up' } } })
  async health() {
    await this.dataSource.query('SELECT 1');
    return { status: 'ok', database: 'up' };
  }
}
