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
export class PetPrestadoresService {
  constructor(
    private prisma: PrismaService,
    private notificacaoService: NotificationsService,
    private resendProvider: ResendProvider,
  ) {}

  /**
   * Convidar um prestador para atender um pet
   */
  async invitePrestador(petId: string, tutorId: string, data: any) {
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
      throw new ForbiddenException('Apenas tutores podem convidar prestadores.');
    }

    // Check if prestador exists
    const prestador = await this.prisma.usuario.findUnique({
      where: { email: data.email },
      include: { perfilPrestador: true },
    });

    if (!prestador) {
      throw new NotFoundException('Prestador não encontrado.');
    }

    if (!prestador.perfilPrestador) {
      throw new BadRequestException('Usuário não é um prestador de serviços.');
    }

    // Check if already invited
    const existing = await this.prisma.petPrestador.findUnique({
      where: {
        petId_prestadorId: {
          petId,
          prestadorId: prestador.perfilPrestador.id,
        },
      },
    });

    if (existing) {
      throw new ConflictException('Prestador já foi convidado para este pet.');
    }

    // Create invitation
    const permissoes = data.permissoes || ['VISUALIZAR', 'REGISTRAR_SERVICO'];

    // Set dataFim based on dataValidade if provided
    let dataFim: Date | undefined;
    if (data.dataValidade) {
      dataFim = new Date(data.dataValidade);
    }

    const invite = await this.prisma.petPrestador.create({
      data: {
        petId,
        prestadorId: prestador.perfilPrestador.id,
        permissoes: permissoes as any, // Cast to any due to enum array typing
        convidadoPor: tutorId,
        dataFim,
        observacoes: data.observacoes,
      },
      include: {
        prestador: {
          include: {
            usuario: {
              select: { id: true, nome: true, email: true, avatarUrl: true },
            },
          },
        },
        pet: { select: { id: true, nome: true } },
      },
    });

    // Create notification for prestador
    try {
      const tutor = await this.prisma.usuario.findUnique({
        where: { id: tutorId },
        select: { nome: true, email: true },
      });

      if (tutor && prestador.email) {
        await this.notificacaoService.create({
          usuarioId: prestador.id,
          tipo: 'CONVITE_PRESTADOR',
          titulo: `Novo convite para ${pet.nome}`,
          mensagem: `${tutor.nome} convida você para atender ${pet.nome}`,
          deepLink: '/prestador/pendencias',
          dados: { petId, prestadorId: prestador.perfilPrestador.id },
        });

        await this.resendProvider.sendNotificationEmail(
          prestador.email,
          `Novo convite para ${pet.nome}`,
          `${tutor.nome} convida você para atender ${pet.nome}`,
          `${process.env.FRONTEND_URL}/prestador/pendencias`,
        );
      }
    } catch (error) {
      // Log error but don't block invitation creation
      console.error('[PET-PRESTADORES] Failed to send notification:', error);
    }

    return invite;
  }

  /**
   * Aceitar convite para atender um pet
   */
  async acceptInvite(
    petPrestadorId: string,
    prestadorId: string,
  ) {
    const invite = await this.prisma.petPrestador.findUnique({
      where: { id: petPrestadorId },
      include: {
        prestador: {
          include: {
            usuario: { select: { id: true, nome: true } },
          },
        },
        pet: { select: { id: true, nome: true } },
      },
    });

    if (!invite) {
      throw new NotFoundException('Convite não encontrado.');
    }

    if (invite.prestador.id !== prestadorId) {
      throw new ForbiddenException('Você não pode aceitar este convite.');
    }

    if (invite.aceito) {
      throw new BadRequestException('Convite já foi aceito.');
    }

    // Check if expired
    if (invite.dataFim && new Date(invite.dataFim) < new Date()) {
      throw new BadRequestException('Convite expirou.');
    }

    const updated = await this.prisma.petPrestador.update({
      where: { id: petPrestadorId },
      data: {
        aceito: true,
        dataAceite: new Date(),
      },
      include: {
        prestador: {
          include: {
            usuario: { select: { id: true, nome: true } },
          },
        },
        pet: { select: { id: true, nome: true } },
      },
    });

    // Create notification for tutor
    try {
      const tutor = await this.prisma.usuario.findUnique({
        where: { id: invite.convidadoPor },
        select: { nome: true, email: true },
      });

      if (tutor) {
        await this.notificacaoService.create({
          usuarioId: invite.convidadoPor,
          tipo: 'PRESTADOR_ACEITO_CONVITE',
          titulo: `${updated.prestador.usuario.nome} aceitou convite`,
          mensagem: `${updated.prestador.usuario.nome} aceitou seu convite para atender ${updated.pet.nome}`,
          deepLink: `/pets/${updated.petId}/prestadores`,
          dados: { petId: updated.petId, prestadorId: updated.prestadorId },
        });

        if (tutor.email) {
          await this.resendProvider.sendNotificationEmail(
            tutor.email,
            `${updated.prestador.usuario.nome} aceitou convite`,
            `${updated.prestador.usuario.nome} aceitou seu convite para atender ${updated.pet.nome}`,
            `${process.env.FRONTEND_URL}/pets/${updated.petId}/prestadores`,
          );
        }
      }
    } catch (error) {
      // Log error but don't block acceptance
      console.error('[PET-PRESTADORES] Failed to send notification:', error);
    }

    return updated;
  }

  /**
   * Rejeitar convite
   */
  async rejectInvite(petPrestadorId: string, prestadorId: string) {
    const invite = await this.prisma.petPrestador.findUnique({
      where: { id: petPrestadorId },
    });

    if (!invite) {
      throw new NotFoundException('Convite não encontrado.');
    }

    if (invite.prestadorId !== prestadorId) {
      throw new ForbiddenException('Você não pode rejeitar este convite.');
    }

    // Soft delete by changing status
    await this.prisma.petPrestador.update({
      where: { id: petPrestadorId },
      data: {
        statusVinculo: 'RECUSADO',
      },
    });

    return { message: 'Convite recusado com sucesso.' };
  }

  /**
   * Revogar acesso do prestador a um pet (soft delete)
   */
  async revokeAccess(petId: string, prestadorId: string, tutorId: string) {
    // Verify tutor is owner
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

    const vinculo = await this.prisma.petPrestador.findUnique({
      where: {
        petId_prestadorId: {
          petId,
          prestadorId,
        },
      },
    });

    if (!vinculo) {
      throw new NotFoundException('Vínculo não encontrado.');
    }

    // Soft delete
    const revoked = await this.prisma.petPrestador.update({
      where: { id: vinculo.id },
      data: {
        statusVinculo: 'BLOQUEADO',
      },
      include: {
        prestador: {
          include: {
            usuario: { select: { id: true, nome: true, email: true } },
          },
        },
        pet: { select: { id: true, nome: true } },
      },
    });

    // Create notification for prestador about access revocation
    try {
      const tutor = await this.prisma.usuario.findUnique({
        where: { id: tutorId },
        select: { nome: true },
      });

      if (
        tutor &&
        revoked.prestador?.usuario?.email &&
        revoked.prestador?.usuario?.id
      ) {
        await this.notificacaoService.create({
          usuarioId: revoked.prestador.usuario.id,
          tipo: 'ACESSO_REMOVIDO_PRESTADOR',
          titulo: `Acesso removido para ${revoked.pet.nome}`,
          mensagem: `${tutor.nome} removeu seu acesso para atender ${revoked.pet.nome}`,
          dados: { petId: revoked.petId, prestadorId: revoked.prestadorId },
        });

        await this.resendProvider.sendNotificationEmail(
          revoked.prestador.usuario.email,
          `Acesso removido para ${revoked.pet.nome}`,
          `${tutor.nome} removeu seu acesso para atender ${revoked.pet.nome}`,
        );
      }
    } catch (error) {
      // Log error but don't block revocation
      console.error('[PET-PRESTADORES] Failed to send notification:', error);
    }

    return revoked;
  }

  /**
   * Listar prestadores de um pet
   */
  async listPrestadores(petId: string, statusVinculo: string = 'ATIVO') {
    const prestadores = await this.prisma.petPrestador.findMany({
      where: {
        petId,
        statusVinculo,
      },
      include: {
        prestador: {
          include: {
            usuario: {
              select: {
                id: true,
                nome: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    return prestadores;
  }

  /**
   * Listar pets que um prestador atende
   */
  async listPetsByPrestador(prestadorId: string) {
    const petPrestadores = await this.prisma.petPrestador.findMany({
      where: {
        prestadorId,
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

    return petPrestadores.map((pp) => ({
      ...pp.pet,
      permissoes: pp.permissoes,
      petPrestadorId: pp.id,
    }));
  }

  /**
   * Check if prestador has access to pet with specific permission
   */
  async hasPermission(
    petId: string,
    prestadorId: string,
    permission: string,
  ): Promise<boolean> {
    const vinculo = await this.prisma.petPrestador.findUnique({
      where: {
        petId_prestadorId: {
          petId,
          prestadorId,
        },
      },
    });

    if (!vinculo || vinculo.statusVinculo !== 'ATIVO' || !vinculo.aceito) {
      return false;
    }

    // Check if expired
    if (vinculo.dataFim && new Date(vinculo.dataFim) < new Date()) {
      return false;
    }

    // Check if permission is in the permissoes array
    return (vinculo.permissoes as string[]).includes(permission);
  }
}
