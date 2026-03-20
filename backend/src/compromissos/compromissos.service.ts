import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PetsService } from '../pets/pets.service';
import { CreateCompromissoDto, UpdateCompromissoDto } from './compromissos.dto';
import { addDays, addWeeks, setHours, setMinutes, startOfDay } from 'date-fns';

@Injectable()
export class CompromissosService {
  constructor(
    private prisma: PrismaService,
    private petsService: PetsService,
  ) {}

  async list(petId: string, userId: string) {
    await this.petsService.checkAccess(petId, userId);
    return this.prisma.compromisso.findMany({
      where: { petId, ativo: true },
      include: {
        petPrestador: {
          include: {
            prestador: {
              include: {
                usuario: {
                  select: { id: true, nome: true, email: true, avatarUrl: true },
                },
              },
            },
          },
        },
      },
      orderBy: { criadoEm: 'desc' },
    });
  }

  async create(petId: string, userId: string, dto: CreateCompromissoDto) {
    await this.petsService.checkAccess(petId, userId);

    const compromisso = await this.prisma.compromisso.create({
      data: {
        petId,
        titulo: dto.titulo,
        tipo: dto.tipo as any,
        responsavelId: dto.responsavelId,
        petPrestadorId: dto.petPrestadorId,
        recorrencia: dto.recorrencia as any,
        diasSemana: dto.diasSemana || [],
        horarioInicio: dto.horarioInicio,
        horarioFim: dto.horarioFim,
        dataInicio: new Date(dto.dataInicio),
        dataFim: dto.dataFim ? new Date(dto.dataFim) : null,
        geraGuarda: dto.geraGuarda || false,
        criadoPor: userId,
      },
    });

    await this.prisma.evento.create({
      data: {
        petId,
        tipo: 'COMPROMISSO_CRIADO',
        titulo: `Compromisso criado: ${dto.titulo}`,
        descricao: `Novo compromisso de ${dto.tipo.toLowerCase()} registrado.`,
        autorId: userId,
      },
    });

    if (dto.geraGuarda) {
      await this.gerarGuardasTemporarias(compromisso);
    }

    return compromisso;
  }

  async update(petId: string, compromissoId: string, userId: string, dto: UpdateCompromissoDto) {
    await this.petsService.checkAccess(petId, userId);

    const existing = await this.prisma.compromisso.findFirst({
      where: { id: compromissoId, petId },
    });
    if (!existing) throw new BadRequestException('Compromisso não encontrado.');

    const wasGeraGuarda = existing.geraGuarda;

    const updated = await this.prisma.compromisso.update({
      where: { id: compromissoId },
      data: {
        titulo: dto.titulo,
        geraGuarda: dto.geraGuarda,
        ativo: dto.ativo,
        horarioInicio: dto.horarioInicio,
        horarioFim: dto.horarioFim,
        diasSemana: dto.diasSemana,
      },
    });

    // If geraGuarda was turned on, generate future guardas
    if (dto.geraGuarda === true && !wasGeraGuarda) {
      await this.gerarGuardasTemporarias(updated);
    }

    // If geraGuarda was turned off, cancel future scheduled guardas
    if (dto.geraGuarda === false && wasGeraGuarda) {
      await this.cancelarGuardasFuturas(compromissoId);
    }

    // If compromisso was deactivated, also cancel future guardas
    if (dto.ativo === false) {
      await this.cancelarGuardasFuturas(compromissoId);
    }

    return updated;
  }

  async remove(petId: string, compromissoId: string, userId: string) {
    await this.petsService.checkAccess(petId, userId);

    const existing = await this.prisma.compromisso.findFirst({
      where: { id: compromissoId, petId },
    });
    if (!existing) throw new BadRequestException('Compromisso não encontrado.');

    await this.prisma.compromisso.update({
      where: { id: compromissoId },
      data: { ativo: false },
    });

    await this.cancelarGuardasFuturas(compromissoId);

    return { mensagem: 'Compromisso desativado.' };
  }

  // Generate GuardaTemporaria records for the next 4 weeks
  private async gerarGuardasTemporarias(compromisso: any) {
    const ocorrencias = this.calcularOcorrencias(compromisso, 4);

    for (const { dataInicio, dataFim } of ocorrencias) {
      await this.prisma.guardaTemporaria.create({
        data: {
          petId: compromisso.petId,
          tipo: compromisso.petPrestadorId ? 'PRESTADOR' : 'PESSOA',
          responsavelId: compromisso.petPrestadorId ? null : compromisso.responsavelId,
          petPrestadorId: compromisso.petPrestadorId,
          compromissoId: compromisso.id,
          dataInicio,
          dataFim,
          status: 'AGENDADA',
        },
      });
    }
  }

  private async cancelarGuardasFuturas(compromissoId: string) {
    await this.prisma.guardaTemporaria.updateMany({
      where: {
        compromissoId,
        status: 'AGENDADA',
        dataInicio: { gt: new Date() },
      },
      data: { status: 'CANCELADA' },
    });
  }

  private calcularOcorrencias(compromisso: any, semanas: number) {
    const ocorrencias: { dataInicio: Date; dataFim: Date }[] = [];
    const now = new Date();
    const inicio = new Date(compromisso.dataInicio);
    const fim = compromisso.dataFim ? new Date(compromisso.dataFim) : null;

    const [hInicio, mInicio] = (compromisso.horarioInicio || '08:00').split(':').map(Number);
    const [hFim, mFim] = (compromisso.horarioFim || '18:00').split(':').map(Number);

    if (compromisso.recorrencia === 'UNICO') {
      const di = setMinutes(setHours(startOfDay(inicio), hInicio), mInicio);
      const df = setMinutes(setHours(startOfDay(inicio), hFim), mFim);
      if (di > now) {
        ocorrencias.push({ dataInicio: di, dataFim: df });
      }
      return ocorrencias;
    }

    // For recurring: iterate day by day for next N weeks
    const limitDate = fim && fim < addWeeks(now, semanas) ? fim : addWeeks(now, semanas);

    let current = now > inicio ? startOfDay(now) : startOfDay(inicio);
    while (current <= limitDate) {
      const dayOfWeek = current.getDay(); // 0=Sun...6=Sat

      let matches = false;
      if (compromisso.recorrencia === 'DIARIO') {
        matches = true;
      } else if (compromisso.recorrencia === 'SEMANAL' && compromisso.diasSemana?.includes(dayOfWeek)) {
        matches = true;
      } else if (compromisso.recorrencia === 'QUINZENAL' && compromisso.diasSemana?.includes(dayOfWeek)) {
        const weeksDiff = Math.floor((current.getTime() - startOfDay(inicio).getTime()) / (7 * 24 * 60 * 60 * 1000));
        matches = weeksDiff % 2 === 0;
      } else if (compromisso.recorrencia === 'MENSAL') {
        matches = current.getDate() === inicio.getDate();
      }

      if (matches) {
        const di = setMinutes(setHours(new Date(current), hInicio), mInicio);
        const df = setMinutes(setHours(new Date(current), hFim), mFim);
        if (di > now) {
          ocorrencias.push({ dataInicio: di, dataFim: df });
        }
      }

      current = addDays(current, 1);
    }

    return ocorrencias;
  }
}
