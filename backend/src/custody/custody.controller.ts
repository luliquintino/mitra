import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CustodyService } from './custody.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('custody')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('pets/:petId/custody')
export class CustodyController {
  constructor(private custodyService: CustodyService) {}

  @Get('guardas')
  @ApiOperation({ summary: 'Listar guardas do pet' })
  getGuardas(
    @Param('petId') petId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.custodyService.getGuardas(petId, userId);
  }

  @Get('solicitacoes')
  @ApiOperation({ summary: 'Listar solicitações do pet' })
  getSolicitacoes(
    @Param('petId') petId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.custodyService.getSolicitacoes(petId, userId);
  }

  @Post('solicitacoes')
  @ApiOperation({ summary: 'Criar solicitação de alteração de guarda' })
  criarSolicitacao(
    @Param('petId') petId: string,
    @CurrentUser('sub') userId: string,
    @Body() data: any,
  ) {
    return this.custodyService.criarSolicitacao(petId, userId, data);
  }

  @Post('solicitacoes/:id/responder')
  @ApiOperation({ summary: 'Responder solicitação' })
  responderSolicitacao(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @Body() body: { aprovada: boolean; mensagem?: string },
  ) {
    return this.custodyService.responderSolicitacao(
      id,
      userId,
      body.aprovada,
      body.mensagem,
    );
  }

  // ─── GuardaTemporaria ───────────────────────────────────────────────────────

  @Get('temporarias')
  @ApiOperation({ summary: 'Listar guardas temporárias do pet' })
  getGuardasTemporarias(
    @Param('petId') petId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.custodyService.getGuardasTemporarias(petId, userId);
  }

  @Post('temporarias')
  @ApiOperation({ summary: 'Criar guarda temporária manual' })
  criarGuardaTemporaria(
    @Param('petId') petId: string,
    @CurrentUser('sub') userId: string,
    @Body() data: any,
  ) {
    return this.custodyService.criarGuardaTemporariaManual(petId, userId, data);
  }

  @Patch('temporarias/:id/confirmar')
  @ApiOperation({ summary: 'Confirmar guarda temporária' })
  confirmarGuarda(
    @Param('petId') petId: string,
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.custodyService.confirmarGuarda(petId, id, userId);
  }

  @Patch('temporarias/:id/cancelar')
  @ApiOperation({ summary: 'Cancelar guarda temporária' })
  cancelarGuarda(
    @Param('petId') petId: string,
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.custodyService.cancelarGuarda(petId, id, userId);
  }

  // ─── Expiradas ─────────────────────────────────────────────────────────────

  @Post('verificar-expiradas')
  @ApiOperation({ summary: 'Verificar e expirar solicitações vencidas' })
  verificarExpiradas() {
    return this.custodyService.verificarSolicitacoesExpiradas();
  }
}
