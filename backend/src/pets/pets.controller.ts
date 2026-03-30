import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PetsService } from './pets.service';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { VincularPetDto } from './dto/vincular-pet.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('pets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('pets')
export class PetsController {
  constructor(private petsService: PetsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os pets do usuário' })
  findAll(@CurrentUser('sub') userId: string) {
    return this.petsService.findAllByUser(userId);
  }

  // ⚠️ Rotas de código DEVEM vir ANTES da rota ':id' para evitar conflito de parâmetros
  @Get('codigo/:codigo')
  @ApiOperation({ summary: 'Buscar pet por código (público)' })
  findByCodigo(@Param('codigo') codigo: string) {
    return this.petsService.findByCodigo(codigo);
  }

  @Post('codigo/:codigo/vincular')
  @ApiOperation({ summary: 'Vincular ao pet via código' })
  vincularByCodigo(
    @Param('codigo') codigo: string,
    @Body() dto: VincularPetDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.petsService.vincularByCodigo(codigo, userId, dto.role);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar pet por ID' })
  findOne(
    @Param('id') petId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.petsService.findOne(petId, userId);
  }

  @Get(':id/dashboard')
  @ApiOperation({ summary: 'Dashboard individual do pet' })
  getDashboard(
    @Param('id') petId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.petsService.getDashboard(petId, userId);
  }

  @Post()
  @ApiOperation({ summary: 'Criar novo pet' })
  create(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreatePetDto,
  ) {
    return this.petsService.create(userId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar pet' })
  update(
    @Param('id') petId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdatePetDto,
  ) {
    return this.petsService.update(petId, userId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Apagar pet (apenas tutor principal)' })
  deletePet(
    @Param('id') petId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.petsService.deletePet(petId, userId);
  }
}
