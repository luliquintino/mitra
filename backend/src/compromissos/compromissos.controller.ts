import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CompromissosService } from './compromissos.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateCompromissoDto, UpdateCompromissoDto } from './compromissos.dto';

@ApiTags('compromissos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('pets/:petId/compromissos')
export class CompromissosController {
  constructor(private compromissosService: CompromissosService) {}

  @Get()
  @ApiOperation({ summary: 'Listar compromissos do pet' })
  list(
    @Param('petId') petId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.compromissosService.list(petId, userId);
  }

  @Post()
  @ApiOperation({ summary: 'Criar compromisso' })
  create(
    @Param('petId') petId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateCompromissoDto,
  ) {
    return this.compromissosService.create(petId, userId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar compromisso' })
  update(
    @Param('petId') petId: string,
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateCompromissoDto,
  ) {
    return this.compromissosService.update(petId, id, userId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desativar compromisso' })
  remove(
    @Param('petId') petId: string,
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.compromissosService.remove(petId, id, userId);
  }
}
