import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PetsService } from '../pets/pets.service';

@Injectable()
export class EventsService {
  constructor(
    private prisma: PrismaService,
    private petsService: PetsService,
  ) {}

  async getHistorico(petId: string, userId: string) {
    await this.petsService.checkAccess(petId, userId);

    const eventos = await this.prisma.evento.findMany({
      where: { petId },
      orderBy: { criadoEm: 'desc' },
    });

    // Agrupar por mês/ano
    const grouped: Record<string, typeof eventos> = {};
    for (const evento of eventos) {
      const key = new Date(evento.criadoEm).toLocaleDateString('pt-BR', {
        month: 'long',
        year: 'numeric',
      });
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(evento);
    }

    return { eventos, grouped, total: eventos.length };
  }
}
