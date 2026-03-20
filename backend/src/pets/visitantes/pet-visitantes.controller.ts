import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { PetVisitantesService } from './pet-visitantes.service';
import { ConvidarVisitanteDto } from './dto/convidar-visitante.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

/**
 * Controller tutor-facing: gerencia visitantes de um pet
 */
@ApiTags('Pets - Visitantes')
@ApiBearerAuth()
@Controller('pets/:petId/visitantes')
@UseGuards(JwtAuthGuard)
export class PetVisitantesController {
  constructor(private petVisitantesService: PetVisitantesService) {}

  @Post('convidar')
  @HttpCode(201)
  async inviteVisitante(
    @Param('petId') petId: string,
    @CurrentUser() user: any,
    @Body() data: ConvidarVisitanteDto,
  ) {
    return this.petVisitantesService.inviteVisitante(petId, user.sub, data);
  }

  @Get()
  async listVisitantes(@Param('petId') petId: string) {
    return this.petVisitantesService.listVisitantes(petId);
  }

  @Delete(':visitanteId')
  @HttpCode(200)
  async revokeAccess(
    @Param('petId') petId: string,
    @Param('visitanteId') visitanteId: string,
    @CurrentUser() user: any,
  ) {
    return this.petVisitantesService.revokeAccess(petId, visitanteId, user.sub);
  }

  @Patch(':visitanteId/permissoes')
  async updatePermissions(
    @Param('petId') petId: string,
    @Param('visitanteId') visitanteId: string,
    @CurrentUser() user: any,
    @Body() body: { permissoes: string[] },
  ) {
    return this.petVisitantesService.updatePermissions(
      petId,
      visitanteId,
      user.sub,
      body.permissoes,
    );
  }
}

/**
 * Controller visitor-facing: visitante gerencia seus convites e pets
 */
@ApiTags('Visitantes')
@ApiBearerAuth()
@Controller('visitantes')
@UseGuards(JwtAuthGuard)
export class VisitantePetsController {
  constructor(private petVisitantesService: PetVisitantesService) {}

  @Get('pets')
  async listMyPets(@CurrentUser() user: any) {
    return this.petVisitantesService.listPetsByVisitante(user.sub);
  }

  @Get('convites')
  async listPendingInvites(@CurrentUser() user: any) {
    return this.petVisitantesService.getPendingInvites(user.sub);
  }

  @Put('convites/:id/aceitar')
  @HttpCode(200)
  async acceptInvite(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.petVisitantesService.acceptInvite(id, user.sub);
  }

  @Put('convites/:id/recusar')
  @HttpCode(200)
  async rejectInvite(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.petVisitantesService.rejectInvite(id, user.sub);
  }

  @Delete('pets/:petId/sair')
  @HttpCode(200)
  async selfRevoke(
    @Param('petId') petId: string,
    @CurrentUser() user: any,
  ) {
    return this.petVisitantesService.selfRevoke(petId, user.sub);
  }
}
