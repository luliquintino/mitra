import {
  Injectable,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PetsService } from '../pets/pets.service';
import { addDays } from 'date-fns';

@Injectable()
export class GovernanceService {
  constructor(
    private prisma: PrismaService,
    private petsService: PetsService,
  ) {}

  async getTutores(petId: string, userId: string) {
    await this.petsService.checkAccess(petId, userId);
    return this.prisma.petUsuario.findMany({
      where: { petId, ativo: true },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
            telefone: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async adicionarTutor(
    petId: string,
    userId: string,
    email: string,
    role: string,
  ) {
    await this.petsService.checkAccess(petId, userId);

    const novoTutor = await this.prisma.usuario.findUnique({
      where: { email },
    });
    if (!novoTutor)
      throw new BadRequestException(
        'Usuário não encontrado com este e-mail.',
      );

    const jaVinculado = await this.prisma.petUsuario.findFirst({
      where: { petId, usuarioId: novoTutor.id, ativo: true },
    });
    if (jaVinculado)
      throw new BadRequestException(
        'Este tutor já está vinculado ao pet.',
      );

    const tutoresPrincipais = await this.prisma.petUsuario.count({
      where: { petId, role: 'TUTOR_PRINCIPAL', ativo: true },
    });
    if (role === 'TUTOR_PRINCIPAL' && tutoresPrincipais >= 2) {
      throw new BadRequestException(
        'O pet já possui 2 tutores principais. Limite atingido.',
      );
    }

    const tutoresEmergencia = await this.prisma.petUsuario.count({
      where: { petId, role: 'TUTOR_EMERGENCIA', ativo: true },
    });
    if (role === 'TUTOR_EMERGENCIA' && tutoresEmergencia >= 2) {
      throw new BadRequestException(
        'O pet já possui 2 tutores de emergência. Limite atingido.',
      );
    }

    const vinculo = await this.prisma.petUsuario.create({
      data: { petId, usuarioId: novoTutor.id, role: role as any },
      include: {
        usuario: { select: { id: true, nome: true, email: true } },
      },
    });

    await this.prisma.evento.create({
      data: {
        petId,
        tipo: 'TUTOR_ADICIONADO',
        titulo: `Tutor adicionado: ${novoTutor.nome}`,
        descricao: `${novoTutor.nome} foi vinculado como ${role === 'TUTOR_PRINCIPAL' ? 'tutor principal' : 'tutor de emergência'}.`,
        autorId: userId,
      },
    });

    return {
      vinculo,
      mensagem: `${novoTutor.nome} adicionado como tutor com sucesso.`,
    };
  }

  async removerTutor(petId: string, userId: string, tutorId: string) {
    const acesso = await this.petsService.checkAccess(petId, userId);

    const isSelf = userId === tutorId;

    // Only TUTOR_PRINCIPAL can remove others; anyone can remove themselves
    if (!isSelf && acesso.role !== 'TUTOR_PRINCIPAL') {
      throw new ForbiddenException(
        'Apenas tutores principais podem remover outros tutores.',
      );
    }

    const vinculo = await this.prisma.petUsuario.findFirst({
      where: { petId, usuarioId: tutorId, ativo: true },
      include: { usuario: { select: { id: true, nome: true } } },
    });
    if (!vinculo) {
      throw new BadRequestException('Tutor não encontrado neste pet.');
    }

    // Cannot remove if they are the only active tutor
    const tutoresAtivos = await this.prisma.petUsuario.count({
      where: { petId, ativo: true },
    });
    if (tutoresAtivos <= 1) {
      throw new BadRequestException(
        'Não é possível desvincular o único tutor do pet. Adicione outro tutor antes.',
      );
    }

    await this.prisma.petUsuario.update({
      where: { id: vinculo.id },
      data: { ativo: false },
    });

    await this.prisma.evento.create({
      data: {
        petId,
        tipo: 'TUTOR_REMOVIDO',
        titulo: isSelf
          ? `${vinculo.usuario.nome} se desvinculou`
          : `Tutor removido: ${vinculo.usuario.nome}`,
        descricao: isSelf
          ? `${vinculo.usuario.nome} optou por se desvincular do pet.`
          : `${vinculo.usuario.nome} foi removido como tutor.`,
        autorId: userId,
      },
    });

    return {
      mensagem: isSelf
        ? 'Você foi desvinculado do pet com sucesso.'
        : `${vinculo.usuario.nome} foi removido com sucesso.`,
    };
  }

  async arquivarPet(
    petId: string,
    userId: string,
    justificativa: string,
  ) {
    const acesso = await this.petsService.checkAccess(petId, userId);
    if (acesso.role !== 'TUTOR_PRINCIPAL')
      throw new ForbiddenException(
        'Apenas tutores principais podem arquivar o pet.',
      );

    const tutoresPrincipais = await this.prisma.petUsuario.findMany({
      where: { petId, role: 'TUTOR_PRINCIPAL', ativo: true },
    });

    if (tutoresPrincipais.length > 1) {
      const outroTutor = tutoresPrincipais.find(
        (t) => t.usuarioId !== userId,
      );
      if (outroTutor) {
        await this.prisma.solicitacao.create({
          data: {
            petId,
            solicitanteId: userId,
            destinatarioId: outroTutor.usuarioId,
            tipo: 'ARQUIVAR_PET',
            justificativa,
            expiradoEm: addDays(new Date(), 2),
          },
        });
        return {
          mensagem:
            'Solicitação de arquivamento enviada ao outro tutor. Aguardando confirmação.',
        };
      }
    }

    await this.prisma.pet.update({
      where: { id: petId },
      data: { status: 'ARQUIVADO' },
    });
    await this.prisma.evento.create({
      data: {
        petId,
        tipo: 'PET_ARQUIVADO',
        titulo: 'Pet arquivado',
        descricao: justificativa,
        autorId: userId,
      },
    });

    return { mensagem: 'Pet arquivado com sucesso.' };
  }

  async reativarPet(
    petId: string,
    userId: string,
    justificativa: string,
  ) {
    const acesso = await this.petsService.checkAccess(petId, userId);
    if (acesso.role !== 'TUTOR_PRINCIPAL')
      throw new ForbiddenException(
        'Apenas tutores principais podem reativar o pet.',
      );

    await this.prisma.pet.update({
      where: { id: petId },
      data: { status: 'ATIVO' },
    });

    await this.prisma.evento.create({
      data: {
        petId,
        tipo: 'PET_REATIVADO',
        titulo: 'Pet reativado',
        descricao: justificativa,
        autorId: userId,
      },
    });

    return { mensagem: 'Pet reativado com sucesso.' };
  }
}
