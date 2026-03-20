import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PetsService } from '../pets/pets.service';
import { addDays } from 'date-fns';

@Injectable()
export class CustodyService {
  constructor(
    private prisma: PrismaService,
    private petsService: PetsService,
  ) {}

  async getGuardas(petId: string, userId: string) {
    await this.petsService.checkAccess(petId, userId);
    return this.prisma.guarda.findMany({
      where: { petId },
      orderBy: { dataInicio: 'desc' },
    });
  }

  async getSolicitacoes(petId: string, userId: string) {
    await this.petsService.checkAccess(petId, userId);
    return this.prisma.solicitacao.findMany({
      where: { petId },
      include: {
        solicitante: {
          select: { id: true, nome: true, email: true, avatarUrl: true },
        },
        destinatario: {
          select: { id: true, nome: true, email: true, avatarUrl: true },
        },
      },
      orderBy: { criadoEm: 'desc' },
    });
  }

  async criarSolicitacao(petId: string, userId: string, data: any) {
    await this.petsService.checkAccess(petId, userId);

    const solicitante = await this.prisma.usuario.findUnique({
      where: { id: userId },
      select: { nome: true },
    });

    const expiradoEm = addDays(new Date(), 2);

    const solicitacao = await this.prisma.solicitacao.create({
      data: {
        petId,
        solicitanteId: userId,
        destinatarioId: data.destinatarioId,
        tipo: data.tipo || 'ALTERACAO_GUARDA',
        justificativa: data.justificativa,
        dados: data.dados,
        expiradoEm,
      },
      include: {
        solicitante: { select: { id: true, nome: true, email: true } },
        destinatario: { select: { id: true, nome: true, email: true } },
      },
    });

    await this.prisma.evento.create({
      data: {
        petId,
        tipo: 'SOLICITACAO_CRIADA',
        titulo: 'Solicitação de alteração de guarda criada',
        descricao: `${solicitante?.nome} solicitou alteração de guarda. Aguardando confirmação. Expira em 48h.`,
        autorId: userId,
      },
    });

    if (data.destinatarioId) {
      await this.prisma.notificacao.create({
        data: {
          usuarioId: data.destinatarioId,
          tipo: 'SOLICITACAO_RECEBIDA',
          titulo: 'Nova solicitação de alteração de guarda',
          mensagem: `${solicitante?.nome} solicitou alteração de guarda. Você tem 48h para responder.`,
          deepLink: `/pets/${petId}/guarda`,
          dados: { solicitacaoId: solicitacao.id },
        },
      });
    }

    return {
      solicitacao,
      mensagem:
        'Solicitação enviada. O outro tutor tem 48h para responder.',
    };
  }

  async responderSolicitacao(
    solicitacaoId: string,
    userId: string,
    aprovada: boolean,
    mensagem?: string,
  ) {
    const solicitacao = await this.prisma.solicitacao.findUnique({
      where: { id: solicitacaoId },
      include: { solicitante: { select: { id: true, nome: true } } },
    });

    if (!solicitacao)
      throw new BadRequestException('Solicitação não encontrada.');
    if (solicitacao.destinatarioId !== userId)
      throw new BadRequestException(
        'Você não é o destinatário desta solicitação.',
      );
    if (solicitacao.status !== 'PENDENTE')
      throw new BadRequestException('Esta solicitação já foi respondida.');
    if (new Date() > solicitacao.expiradoEm)
      throw new BadRequestException('Esta solicitação expirou.');

    const novoStatus = aprovada ? 'APROVADA' : 'RECUSADA';

    await this.prisma.solicitacao.update({
      where: { id: solicitacaoId },
      data: {
        status: novoStatus,
        respondidoEm: new Date(),
        respostaMensagem: mensagem,
      },
    });

    const usuario = await this.prisma.usuario.findUnique({
      where: { id: userId },
      select: { nome: true },
    });

    await this.prisma.evento.create({
      data: {
        petId: solicitacao.petId,
        tipo: aprovada ? 'SOLICITACAO_APROVADA' : 'SOLICITACAO_RECUSADA',
        titulo: `Solicitação ${aprovada ? 'aprovada' : 'recusada'}`,
        descricao: `${usuario?.nome} ${aprovada ? 'aprovou' : 'recusou'} a solicitação de ${solicitacao.solicitante.nome}.`,
        autorId: userId,
      },
    });

    await this.prisma.notificacao.create({
      data: {
        usuarioId: solicitacao.solicitanteId,
        tipo: aprovada ? 'SOLICITACAO_APROVADA' : 'SOLICITACAO_RECEBIDA',
        titulo: `Solicitação ${aprovada ? 'aprovada' : 'recusada'}`,
        mensagem: `${usuario?.nome} ${aprovada ? 'aprovou' : 'recusou'} sua solicitação de alteração de guarda.`,
        deepLink: `/pets/${solicitacao.petId}/guarda`,
      },
    });

    const resposta = aprovada ? 'aprovada' : 'recusada';
    return {
      mensagem: `Solicitação ${resposta} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}. O solicitante foi notificado.`,
    };
  }

  // ─── GuardaTemporaria ───────────────────────────────────────────────────────

  async getGuardasTemporarias(petId: string, userId: string) {
    await this.petsService.checkAccess(petId, userId);
    return this.prisma.guardaTemporaria.findMany({
      where: { petId },
      include: {
        responsavel: {
          select: { id: true, nome: true, email: true, avatarUrl: true },
        },
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
        compromisso: {
          select: { id: true, titulo: true, tipo: true, recorrencia: true },
        },
      },
      orderBy: { dataInicio: 'asc' },
    });
  }

  async criarGuardaTemporariaManual(petId: string, userId: string, data: any) {
    await this.petsService.checkAccess(petId, userId);

    const guarda = await this.prisma.guardaTemporaria.create({
      data: {
        petId,
        tipo: data.petPrestadorId ? 'PRESTADOR' : 'PESSOA',
        responsavelId: data.petPrestadorId ? null : data.responsavelId,
        petPrestadorId: data.petPrestadorId,
        dataInicio: new Date(data.dataInicio),
        dataFim: new Date(data.dataFim),
        observacoes: data.observacoes,
        status: 'AGENDADA',
      },
      include: {
        responsavel: {
          select: { id: true, nome: true, email: true, avatarUrl: true },
        },
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
    });

    await this.prisma.evento.create({
      data: {
        petId,
        tipo: 'GUARDA_TEMPORARIA_CRIADA',
        titulo: 'Guarda temporária agendada',
        descricao: `Guarda temporária criada manualmente.`,
        autorId: userId,
      },
    });

    return guarda;
  }

  async confirmarGuarda(petId: string, guardaId: string, userId: string) {
    await this.petsService.checkAccess(petId, userId);

    const guarda = await this.prisma.guardaTemporaria.findFirst({
      where: { id: guardaId, petId },
    });
    if (!guarda) throw new BadRequestException('Guarda temporária não encontrada.');
    if (guarda.status !== 'AGENDADA') throw new BadRequestException('Esta guarda não pode ser confirmada.');

    const updated = await this.prisma.guardaTemporaria.update({
      where: { id: guardaId },
      data: { status: 'CONFIRMADA', confirmadoEm: new Date() },
    });

    await this.prisma.evento.create({
      data: {
        petId,
        tipo: 'GUARDA_TEMPORARIA_CONFIRMADA',
        titulo: 'Guarda temporária confirmada',
        descricao: 'A ida foi confirmada pelo tutor.',
        autorId: userId,
      },
    });

    return updated;
  }

  async cancelarGuarda(petId: string, guardaId: string, userId: string) {
    await this.petsService.checkAccess(petId, userId);

    const guarda = await this.prisma.guardaTemporaria.findFirst({
      where: { id: guardaId, petId },
    });
    if (!guarda) throw new BadRequestException('Guarda temporária não encontrada.');
    if (!['AGENDADA', 'CONFIRMADA'].includes(guarda.status)) {
      throw new BadRequestException('Esta guarda não pode ser cancelada.');
    }

    const updated = await this.prisma.guardaTemporaria.update({
      where: { id: guardaId },
      data: { status: 'CANCELADA' },
    });

    await this.prisma.evento.create({
      data: {
        petId,
        tipo: 'GUARDA_TEMPORARIA_CANCELADA',
        titulo: 'Guarda temporária cancelada',
        descricao: 'A guarda temporária foi cancelada pelo tutor.',
        autorId: userId,
      },
    });

    return updated;
  }

  // ─── Solicitações Expiradas ────────────────────────────────────────────────

  async verificarSolicitacoesExpiradas() {
    const expiradas = await this.prisma.solicitacao.findMany({
      where: { status: 'PENDENTE', expiradoEm: { lt: new Date() } },
    });

    for (const sol of expiradas) {
      await this.prisma.solicitacao.update({
        where: { id: sol.id },
        data: { status: 'EXPIRADA' },
      });

      await this.prisma.evento.create({
        data: {
          petId: sol.petId,
          tipo: 'SOLICITACAO_EXPIRADA',
          titulo: 'Solicitação expirada',
          descricao:
            'A solicitação expirou sem resposta após 48h. Uma nova solicitação pode ser criada.',
          autorId: sol.solicitanteId,
        },
      });
    }

    return { expiradas: expiradas.length };
  }
}
