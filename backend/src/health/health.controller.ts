import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { HealthService } from './health.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('health')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('pets/:petId/health')
export class HealthController {
  constructor(private healthService: HealthService) {}

  @Get('vacinas')
  @ApiOperation({ summary: 'Listar vacinas do pet' })
  getVacinas(
    @Param('petId') petId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.healthService.getVacinas(petId, userId);
  }

  @Post('vacinas')
  @ApiOperation({ summary: 'Registrar vacina' })
  createVacina(
    @Param('petId') petId: string,
    @CurrentUser('sub') userId: string,
    @Body() data: any,
  ) {
    return this.healthService.createVacina(petId, userId, data);
  }

  @Get('medicamentos')
  @ApiOperation({ summary: 'Listar medicamentos do pet' })
  getMedicamentos(
    @Param('petId') petId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.healthService.getMedicamentos(petId, userId);
  }

  @Post('medicamentos')
  @ApiOperation({ summary: 'Registrar medicamento' })
  createMedicamento(
    @Param('petId') petId: string,
    @CurrentUser('sub') userId: string,
    @Body() data: any,
  ) {
    return this.healthService.createMedicamento(petId, userId, data);
  }

  @Post('medicamentos/:medId/administrar')
  @ApiOperation({ summary: 'Registrar administração de medicamento' })
  administrar(
    @Param('medId') medId: string,
    @CurrentUser('sub') userId: string,
    @Body() data: any,
  ) {
    return this.healthService.registrarAdministracao(medId, userId, data);
  }

  @Get('sintomas')
  @ApiOperation({ summary: 'Listar sintomas' })
  getSintomas(
    @Param('petId') petId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.healthService.getSintomas(petId, userId);
  }

  @Post('sintomas')
  @ApiOperation({ summary: 'Registrar sintoma' })
  createSintoma(
    @Param('petId') petId: string,
    @CurrentUser('sub') userId: string,
    @Body() data: any,
  ) {
    return this.healthService.createSintoma(petId, userId, data);
  }

  @Get('plano-saude')
  @ApiOperation({ summary: 'Buscar plano de saúde' })
  getPlano(
    @Param('petId') petId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.healthService.getPlanoSaude(petId, userId);
  }

  @Put('plano-saude')
  @ApiOperation({ summary: 'Atualizar plano de saúde' })
  upsertPlano(
    @Param('petId') petId: string,
    @CurrentUser('sub') userId: string,
    @Body() data: any,
  ) {
    return this.healthService.upsertPlanoSaude(petId, userId, data);
  }
}
