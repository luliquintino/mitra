import { Module } from '@nestjs/common';
import { PrestadoresService } from './prestadores.service';
import { PrestadoresController } from './prestadores.controller';
import { PetPrestadoresService } from '../pets/prestadores/pet-prestadores.service';
import {
  PetPrestadoresController,
  PrestadorPetsController,
} from '../pets/prestadores/pet-prestadores.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [
    PrestadoresController,
    PetPrestadoresController,
    PrestadorPetsController,
  ],
  providers: [PrestadoresService, PetPrestadoresService],
  exports: [PrestadoresService, PetPrestadoresService],
})
export class PrestadoresModule {}
