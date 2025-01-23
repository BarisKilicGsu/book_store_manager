import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Health Check')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  @ApiTags('Health Check')
  @ApiOkResponse({ description: 'Returns health status' })
  healthCheck(): Promise<string> {
    return this.appService.healthCheck();
  }
}
