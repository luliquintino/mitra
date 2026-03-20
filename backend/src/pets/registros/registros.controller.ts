import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RegistrosService } from './registros.service';
import { CreateRegistroDto } from './dto/create-registro.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('registros')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('pets/:petId/registros')
export class RegistrosController {
  constructor(private registrosService: RegistrosService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar ação de prestador ou observação' })
  create(
    @Param('petId') petId: string,
    @Body() dto: CreateRegistroDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.registrosService.create(petId, userId, dto);
  }

  @Get('meus')
  @ApiOperation({ summary: 'Listar meus registros neste pet' })
  listMeus(
    @Param('petId') petId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.registrosService.listMeus(petId, userId);
  }
}
