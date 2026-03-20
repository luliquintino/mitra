import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { ResendProvider } from '../../notifications/resend.provider';

@Injectable()
export class PetVisitantesService {
  constructor(
    private prisma: PrismaService,
    private notificacaoService: NotificationsService,
    private resendProvider: ResendProvider,
  ) {}

  /**
   * Convidar um visitante para acompanhar um pet
   */
  async inviteVisitante(petId: string, tutorId: string, data: any) {
    // Verify pet exists and user is tutor
    const pet = await this.prisma.pet.findUnique({
      where: { id: petId },
      include: {
        petUsuarios: {
          where: { usuarioId: tutorId },
        },
      },
    });

    if (!pet) {
      throw new NotFoundException('Pet não encontrado.');
    }

    const isTutor = pet.petUsuarios?.some((pu) =>
      ['TUTOR_PRINCIPAL', 'TUTOR_EMERGENCIA'].includes(pu.role),
    );

    if (!isTutor) {
      throw new ForbiddenException('Apenas tutores podem convidar visitantes.');
    }

    // Check if visitante exists
    const visitante = await this.prisma.usuario.findUnique({
      where: { email: data.email },
    });

    if (!visitante) {
      throw new NotFoundException(
        'Usuário não encontrado. O visitante precisa ter uma conta na Mitra.',
      );
    }

    // Cannot invite yourself
    if (visitante.id === tutorId) {
      throw new BadRequestException('Você não pode se convidar como visitante.');
    }

    // Check if already invited (active or pending)
    const existing = await this.prisma.petVisitante.findUnique({
      where: {
        petId_visitanteId: {
          petId,
          visitanteId: visitante.id,
        },
      },
    });

    if (existing && existing.statusVinculo === 'ATIVO') {
      throw new ConflictException('Visitante já foi convidado para este pet.');
    }

    // If previously revoked/rejected, delete old record and re-invite
    if (existing) {
      await this.prisma.petVisitante.delete({
        where: { id: existing.id },
      });
    }

    // Create invitation
    const permissoes = data.permissoes || ['DADOS_BASICOS', 'STATUS_SAUDE'];

    let dataFim: Date | undefined;
    if (data.dataValidade) {
      dataFim = new Date(data.dataValidade);
    }

    const invite = await this.prisma.petVisitante.create({
      data: {
        petId,
        visitanteId: visitante.id,
        permissoesVisualizacao: permissoes as any,
        convidadoPor: tutorId,
        relacao: data.relacao,
        dataFim,
      },
      include: {
        visitante: {
          select: { id: true, nome: true, email: true, avatarUrl: true },
        },
        pet: { select: { id: true, nome: true } },
      },
    });

    // Notify visitante
    try {
      const tutor = await this.prisma.usuario.findUnique({
        where: { id: tutorId },
        select: { nome: true },
      });

      if (tutor) {
        await this.notificacaoService.create({
          usuarioId: visitante.id,
          tipo: 'CONVITE_VISITANTE',
          titulo: `Convite para acompanhar ${pet.nome}`,
          mensagem: `${tutor.nome} convidou você para acompanhar ${pet.nome}`,
          deepLink: '/visitante/convites',
          dados: { petId, visitanteId: visitante.id },
        });

        await this.resendProvider.sendNotificationEmail(
          visitante.email,
          `Convite para acompanhar ${pet.nome}`,
          `${tutor.nome} convidou você para acompanhar ${pet.nome}`,
          `${process.env.FRONTEND_URL}/visitante/convites`,
        );
      }
    } catch (error) {
      console.error('[PET-VISITANTES] Failed to send notification:', error);
    }

    return invite;
  }

  /**
   * Aceitar convite para acompanhar um pet
   */
  async acceptInvite(petVisitanteId: string, visitanteId: string) {
    const invite = await this.prisma.petVisitante.findUnique({
      where: { id: petVisitanteId },
      include: {
        visitante: {
          select: { id: true, nome: true },
        },
        pet: { select: { id: true, nome: true } },
      },
    });

    if (!invite) {
      throw new NotFoundException('Convite não encontrado.');
    }

    if (invite.visitanteId !== visitanteId) {
      throw new ForbiddenException('Você não pode aceitar este convite.');
    }

    if (invite.aceito) {
      throw new BadRequestException('Convite já foi aceito.');
    }

    if (invite.statusVinculo !== 'ATIVO') {
      throw new BadRequestException('Convite não está mais ativo.');
    }

    // Check if expired
    if (invite.dataFim && new Date(invite.dataFim) < new Date()) {
      throw new BadRequestException('Convite expirou.');
    }

    const updated = await this.prisma.petVisitante.update({
      where: { id: petVisitanteId },
      data: {
        aceito: true,
        dataAceite: new Date(),
      },
      include: {
        visitante: {
          select: { id: true, nome: true },
        },
        pet: { select: { id: true, nome: true } },
      },
    });

    // Notify tutor who invited
    try {
      const tutor = await this.prisma.usuario.findUnique({
        where: { id: invite.convidadoPor },
        select: { nome: true, email: true },
      });

      if (tutor) {
        await this.notificacaoService.create({
          usuarioId: invite.convidadoPor,
          tipo: 'VISITANTE_ACEITO_CONVITE',
          titulo: `${updated.visitante.nome} aceitou convite`,
          mensagem: `${updated.visitante.nome} aceitou acompanhar ${updated.pet.nome}`,
          deepLink: `/pets/${updated.petId}/visitantes`,
          dados: { petId: updated.petId, visitanteId: updated.visitanteId },
        });

        if (tutor.email) {
          await this.resendProvider.sendNotificationEmail(
            tutor.email,
            `${updated.visitante.nome} aceitou convite`,
            `${updated.visitante.nome} aceitou acompanhar ${updated.pet.nome}`,
            `${process.env.FRONTEND_URL}/pets/${updated.petId}/visitantes`,
          );
        }
      }
    } catch (error) {
      console.error('[PET-VISITANTES] Failed to send notification:', error);
    }

    return updated;
  }

  /**
   * Rejeitar convite
   */
  async rejectInvite(petVisitanteId: string, visitanteId: string) {
    const invite = await this.prisma.petVisitante.findUnique({
      where: { id: petVisitanteId },
    });

    if (!invite) {
      throw new NotFoundException('Convite não encontrado.');
    }

    if (invite.visitanteId !== visitanteId) {
      throw new ForbiddenException('Você não pode recusar este convite.');
    }

    await this.prisma.petVisitante.update({
      where: { id: petVisitanteId },
      data: {
        statusVinculo: 'RECUSADO',
      },
    });

    return { message: 'Convite recusado com sucesso.' };
  }

  /**
   * Revogar acesso de visitante (tutor remove)
   */
  async revokeAccess(petId: string, visitanteId: string, tutorId: string) {
    const pet = await this.prisma.pet.findUnique({
      where: { id: petId },
      include: {
        petUsuarios: {
          where: { usuarioId: tutorId },
        },
      },
    });

    if (!pet) {
      throw new NotFoundException('Pet não encontrado.');
    }

    const isTutor = pet.petUsuarios?.some((pu) =>
      ['TUTOR_PRINCIPAL', 'TUTOR_EMERGENCIA'].includes(pu.role),
    );

    if (!isTutor) {
      throw new ForbiddenException('Apenas tutores podem revogar acesso.');
    }

    const vinculo = await this.prisma.petVisitante.findUnique({
      where: {
        petId_visitanteId: {
          petId,
          visitanteId,
        },
      },
    });

    if (!vinculo) {
      throw new NotFoundException('Vínculo não encontrado.');
    }

    const revoked = await this.prisma.petVisitante.update({
      where: { id: vinculo.id },
      data: {
        statusVinculo: 'BLOQUEADO',
      },
      include: {
        visitante: {
          select: { id: true, nome: true, email: true },
        },
        pet: { select: { id: true, nome: true } },
      },
    });

    // Notify visitante
    try {
      const tutor = await this.prisma.usuario.findUnique({
        where: { id: tutorId },
        select: { nome: true },
      });

      if (tutor && revoked.visitante) {
        await this.notificacaoService.create({
          usuarioId: revoked.visitanteId,
          tipo: 'ACESSO_REMOVIDO_VISITANTE',
          titulo: `Acesso removido para ${revoked.pet.nome}`,
          mensagem: `${tutor.nome} removeu seu acesso de acompanhamento de ${revoked.pet.nome}`,
          dados: { petId: revoked.petId, visitanteId: revoked.visitanteId },
        });

        if (revoked.visitante.email) {
          await this.resendProvider.sendNotificationEmail(
            revoked.visitante.email,
            `Acesso removido para ${revoked.pet.nome}`,
            `${tutor.nome} removeu seu acesso de acompanhamento de ${revoked.pet.nome}`,
          );
        }
      }
    } catch (error) {
      console.error('[PET-VISITANTES] Failed to send notification:', error);
    }

    return revoked;
  }

  /**
   * Visitante sai voluntariamente de um pet
   */
  async selfRevoke(petId: string, visitanteId: string) {
    const vinculo = await this.prisma.petVisitante.findUnique({
      where: {
        petId_visitanteId: {
          petId,
          visitanteId,
        },
      },
    });

    if (!vinculo) {
      throw new NotFoundException('Vínculo não encontrado.');
    }

    if (vinculo.visitanteId !== visitanteId) {
      throw new ForbiddenException('Ação não permitida.');
    }

    await this.prisma.petVisitante.update({
      where: { id: vinculo.id },
      data: {
        statusVinculo: 'SAIU',
      },
    });

    return { message: 'Você saiu do acompanhamento deste pet.' };
  }

  /**
   * Listar visitantes de um pet
   */
  async listVisitantes(petId: string) {
    return this.prisma.petVisitante.findMany({
      where: {
        petId,
        statusVinculo: 'ATIVO',
      },
      include: {
        visitante: {
          select: {
            id: true,
            nome: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  /**
   * Listar pets que um visitante acompanha (aceitos)
   */
  async listPetsByVisitante(visitanteId: string) {
    const petVisitantes = await this.prisma.petVisitante.findMany({
      where: {
        visitanteId,
        statusVinculo: 'ATIVO',
        aceito: true,
      },
      include: {
        pet: {
          select: {
            id: true,
            nome: true,
            especie: true,
            raca: true,
            fotoUrl: true,
            dataNascimento: true,
          },
        },
      },
    });

    return petVisitantes.map((pv) => ({
      ...pv.pet,
      permissoesVisualizacao: pv.permissoesVisualizacao,
      relacao: pv.relacao,
      petVisitanteId: pv.id,
    }));
  }

  /**
   * Convites pendentes do visitante
   */
  async getPendingInvites(visitanteId: string) {
    return this.prisma.petVisitante.findMany({
      where: {
        visitanteId,
        aceito: false,
        statusVinculo: 'ATIVO',
      },
      include: {
        pet: {
          select: {
            id: true,
            nome: true,
            especie: true,
            raca: true,
            fotoUrl: true,
          },
        },
      },
    });
  }

  /**
   * Verificar se visitante tem permissão específica
   */
  async hasPermission(
    petId: string,
    visitanteId: string,
    permission: string,
  ): Promise<boolean> {
    const vinculo = await this.prisma.petVisitante.findUnique({
      where: {
        petId_visitanteId: {
          petId,
          visitanteId,
        },
      },
    });

    if (!vinculo || vinculo.statusVinculo !== 'ATIVO' || !vinculo.aceito) {
      return false;
    }

    if (vinculo.dataFim && new Date(vinculo.dataFim) < new Date()) {
      return false;
    }

    return (vinculo.permissoesVisualizacao as string[]).includes(permission);
  }

  /**
   * Editar permissões de um visitante (tutor only)
   */
  async updatePermissions(
    petId: string,
    visitanteId: string,
    tutorId: string,
    permissoes: string[],
  ) {
    const pet = await this.prisma.pet.findUnique({
      where: { id: petId },
      include: {
        petUsuarios: {
          where: { usuarioId: tutorId },
        },
      },
    });

    if (!pet) {
      throw new NotFoundException('Pet não encontrado.');
    }

    const isTutor = pet.petUsuarios?.some((pu) =>
      ['TUTOR_PRINCIPAL', 'TUTOR_EMERGENCIA'].includes(pu.role),
    );

    if (!isTutor) {
      throw new ForbiddenException('Apenas tutores podem editar permissões.');
    }

    const vinculo = await this.prisma.petVisitante.findUnique({
      where: {
        petId_visitanteId: {
          petId,
          visitanteId,
        },
      },
    });

    if (!vinculo) {
      throw new NotFoundException('Vínculo não encontrado.');
    }

    return this.prisma.petVisitante.update({
      where: { id: vinculo.id },
      data: {
        permissoesVisualizacao: permissoes as any,
      },
      include: {
        visitante: {
          select: { id: true, nome: true, email: true, avatarUrl: true },
        },
      },
    });
  }
}
