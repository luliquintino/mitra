import { Module } from '@nestjs/common';
import { PetVisitantesService } from './pet-visitantes.service';
import {
  PetVisitantesController,
  VisitantePetsController,
} from './pet-visitantes.controller';
import { NotificationsModule } from '../../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [PetVisitantesController, VisitantePetsController],
  providers: [PetVisitantesService],
  exports: [PetVisitantesService],
})
export class VisitantesModule {}
