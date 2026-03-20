import { Controller, Get, Put, Body, Param, UseGuards, HttpCode } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PrestadoresService } from './prestadores.service';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Prestadores')
@ApiBearerAuth()
@Controller('api/prestadores')
@UseGuards(JwtAuthGuard)
export class PrestadoresController {
  constructor(private prestadoresService: PrestadoresService) {}

  @Get('me')
  async getMyProfile(@CurrentUser() user: any) {
    return this.prestadoresService.findProfile(user.id);
  }

  @Put('me')
  @HttpCode(200)
  async updateMyProfile(@CurrentUser() user: any, @Body() data: any) {
    return this.prestadoresService.updateProfile(user.id, data);
  }

  @Get()
  async listPrestadores(@CurrentUser() user: any) {
    return this.prestadoresService.listPrestadores();
  }

  @Get(':id')
  async getPrestador(@Param('id') id: string) {
    // Find by usuarioId
    return this.prestadoresService.findProfile(id);
  }
}
