import { Module } from '@nestjs/common';
import { CompromissosController } from './compromissos.controller';
import { CompromissosService } from './compromissos.service';
import { PetsModule } from '../pets/pets.module';

@Module({
  imports: [PetsModule],
  controllers: [CompromissosController],
  providers: [CompromissosService],
  exports: [CompromissosService],
})
export class CompromissosModule {}
