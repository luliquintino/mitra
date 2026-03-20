import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRegistroDto } from './dto/create-registro.dto';

// Mapeamento de tipo de registro para EventoTipo no schema Prisma
const EVENTO_TIPO_MAP: Record<string, string> = {
  VISITA: 'VISITA_REGISTRADA',
  ALIMENTACAO: 'ALIMENTACAO_REGISTRADA',
  CHECK_IN: 'CHECK_IN_REGISTRADO',
  CHECK_OUT: 'CHECK_OUT_REGISTRADO',
  SESSAO: 'SESSAO_REGISTRADA',
  PROGRESSO: 'PROGRESSO_REGISTRADO',
  OBSERVACAO: 'OBSERVACAO_REGISTRADA',
};

const TIPOS_REGISTRO = Object.values(EVENTO_TIPO_MAP);

@Injectable()
export class RegistrosService {
  constructor(private prisma: PrismaService) {}

  /**
   * Verifica que o usuário tem acesso ao pet como prestador OU tutor.
   * Tutores também podem criar observações genéricas.
   */
  private async checkAcesso(petId: string, userId: string) {
    // Verificar se é tutor do pet
    const petUsuario = await this.prisma.petUsuario.findFirst({
      where: { petId, usuarioId: userId, ativo: true },
    });
    if (petUsuario) return { tipo: 'TUTOR', acesso: petUsuario };

    // Verificar se é prestador ativo do pet
    const prestador = await this.prisma.perfilPrestador.findUnique({
      where: { usuarioId: userId },
    });
    if (!prestador) {
      throw new ForbiddenException('Acesso negado a este pet.');
    }

    const petPrestador = await this.prisma.petPrestador.findFirst({
      where: {
        petId,
        prestadorId: prestador.id,
        aceito: true,
        statusVinculo: 'ATIVO',
      },
    });

    if (!petPrestador) {
      throw new ForbiddenException(
        'Você não tem acesso ativo a este pet como prestador.',
      );
    }

    return { tipo: 'PRESTADOR', acesso: petPrestador };
  }

  async create(petId: string, userId: string, dto: CreateRegistroDto) {
    // Verificar acesso
    await this.checkAcesso(petId, userId);

    // Verificar que o pet existe
    const pet = await this.prisma.pet.findUnique({ where: { id: petId } });
    if (!pet) throw new NotFoundException('Pet não encontrado.');

    const eventoTipo = EVENTO_TIPO_MAP[dto.tipo];

    return this.prisma.evento.create({
      data: {
        petId,
        tipo: eventoTipo as any,
        titulo: dto.titulo,
        descricao: dto.descricao,
        dados: dto.dados,
        autorId: userId,
      },
    });
  }

  async listMeus(petId: string, userId: string) {
    await this.checkAcesso(petId, userId);

    return this.prisma.evento.findMany({
      where: {
        petId,
        autorId: userId,
        tipo: { in: TIPOS_REGISTRO as any[] },
      },
      orderBy: { criadoEm: 'desc' },
      take: 20,
    });
  }
}
