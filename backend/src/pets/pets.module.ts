import { Module } from '@nestjs/common';
import { PetsController } from './pets.controller';
import { PetsService } from './pets.service';
import { RegistrosController } from './registros/registros.controller';
import { RegistrosService } from './registros/registros.service';

@Module({
  controllers: [PetsController, RegistrosController],
  providers: [PetsService, RegistrosService],
  exports: [PetsService],
})
export class PetsModule {}
