import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { EventsService } from './events.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('events')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('pets/:petId/events')
export class EventsController {
  constructor(private eventsService: EventsService) {}

  @Get('historico')
  @ApiOperation({ summary: 'Linha do tempo do pet' })
  getHistorico(
    @Param('petId') petId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.eventsService.getHistorico(petId, userId);
  }
}
