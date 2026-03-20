import {
  Controller,
  Put,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Put('profile')
  @ApiOperation({ summary: 'Atualizar perfil' })
  updateProfile(
    @CurrentUser('sub') userId: string,
    @Body() body: { nome?: string; telefone?: string },
  ) {
    return this.usersService.updateProfile(userId, body);
  }

  @Post('feedback')
  @ApiOperation({ summary: 'Enviar feedback' })
  feedback(
    @CurrentUser('sub') userId: string,
    @Body() body: { tipo: string; mensagem: string },
  ) {
    return this.usersService.submitFeedback(userId, body);
  }
}
