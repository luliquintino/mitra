import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { GovernanceService } from './governance.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('governance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('pets/:petId/governance')
export class GovernanceController {
  constructor(private governanceService: GovernanceService) {}

  @Get('tutores')
  @ApiOperation({ summary: 'Listar tutores do pet' })
  getTutores(
    @Param('petId') petId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.governanceService.getTutores(petId, userId);
  }

  @Post('tutores')
  @ApiOperation({ summary: 'Adicionar tutor ao pet' })
  adicionarTutor(
    @Param('petId') petId: string,
    @CurrentUser('sub') userId: string,
    @Body() body: { email: string; role: string },
  ) {
    return this.governanceService.adicionarTutor(
      petId,
      userId,
      body.email,
      body.role,
    );
  }

  @Delete('tutores/:tutorId')
  @ApiOperation({ summary: 'Remover tutor do pet (ou se desvincular)' })
  removerTutor(
    @Param('petId') petId: string,
    @Param('tutorId') tutorId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.governanceService.removerTutor(petId, userId, tutorId);
  }

  @Post('arquivar')
  @ApiOperation({ summary: 'Solicitar arquivamento do pet' })
  arquivar(
    @Param('petId') petId: string,
    @CurrentUser('sub') userId: string,
    @Body() body: { justificativa: string },
  ) {
    return this.governanceService.arquivarPet(
      petId,
      userId,
      body.justificativa,
    );
  }

  @Post('reativar')
  @ApiOperation({ summary: 'Reativar pet arquivado' })
  reativar(
    @Param('petId') petId: string,
    @CurrentUser('sub') userId: string,
    @Body() body: { justificativa: string },
  ) {
    return this.governanceService.reativarPet(
      petId,
      userId,
      body.justificativa,
    );
  }
}
