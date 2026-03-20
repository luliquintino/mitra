import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { PetPrestadoresService } from './pet-prestadores.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ConvidarPrestadorDto } from './dto/convidar-prestador.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Pets - Prestadores')
@ApiBearerAuth()
@Controller('api/pets/:petId/prestadores')
@UseGuards(JwtAuthGuard)
export class PetPrestadoresController {
  constructor(private petPrestadoresService: PetPrestadoresService) {}

  @Post('convidar')
  @HttpCode(201)
  async invitePrestador(
    @Param('petId') petId: string,
    @CurrentUser() user: any,
    @Body() data: ConvidarPrestadorDto,
  ) {
    return this.petPrestadoresService.invitePrestador(petId, user.id, data);
  }

  @Get()
  async listPrestadores(
    @Param('petId') petId: string,
  ) {
    return this.petPrestadoresService.listPrestadores(petId);
  }

  @Put('/:petPrestadorId/aceitar')
  @HttpCode(200)
  async acceptInvite(
    @Param('petId') petId: string,
    @Param('petPrestadorId') petPrestadorId: string,
    @CurrentUser() user: any,
  ) {
    return this.petPrestadoresService.acceptInvite(
      petPrestadorId,
      user.id,
    );
  }

  @Put('/:petPrestadorId/recusar')
  @HttpCode(200)
  async rejectInvite(
    @Param('petId') petId: string,
    @Param('petPrestadorId') petPrestadorId: string,
    @CurrentUser() user: any,
  ) {
    return this.petPrestadoresService.rejectInvite(
      petPrestadorId,
      user.id,
    );
  }

  @Delete('/:prestadorId')
  @HttpCode(200)
  async revokeAccess(
    @Param('petId') petId: string,
    @Param('prestadorId') prestadorId: string,
    @CurrentUser() user: any,
  ) {
    return this.petPrestadoresService.revokeAccess(
      petId,
      prestadorId,
      user.id,
    );
  }
}

@ApiTags('Prestadores')
@ApiBearerAuth()
@Controller('api/prestadores/pets')
@UseGuards(JwtAuthGuard)
export class PrestadorPetsController {
  constructor(
    private petPrestadoresService: PetPrestadoresService,
    private prisma: PrismaService,
  ) {}

  @Get()
  async listMyPets(@CurrentUser() user: any) {
    // Get prestador profile ID from usuario
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: user.id },
      include: { perfilPrestador: true },
    });

    if (!usuario?.perfilPrestador) {
      return [];
    }

    return this.petPrestadoresService.listPetsByPrestador(
      usuario.perfilPrestador.id,
    );
  }
}
