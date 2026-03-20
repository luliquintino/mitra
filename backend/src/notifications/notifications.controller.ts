import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar notificações' })
  getAll(@CurrentUser('sub') userId: string) {
    return this.notificationsService.getAll(userId);
  }

  @Get('count')
  @ApiOperation({ summary: 'Contar notificações não lidas' })
  count(@CurrentUser('sub') userId: string) {
    return this.notificationsService.countNaoLidas(userId);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Marcar notificação como lida' })
  marcarLida(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.notificationsService.marcarLida(id, userId);
  }

  @Post('read-all')
  @ApiOperation({ summary: 'Marcar todas como lidas' })
  marcarTodasLidas(@CurrentUser('sub') userId: string) {
    return this.notificationsService.marcarTodasLidas(userId);
  }
}
