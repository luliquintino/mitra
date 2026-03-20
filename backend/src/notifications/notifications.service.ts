import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Notificacao, NotificacaoTipo } from '@prisma/client';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    usuarioId: string;
    tipo: NotificacaoTipo;
    titulo: string;
    mensagem: string;
    deepLink?: string;
    dados?: Record<string, any>;
  }): Promise<Notificacao> {
    return this.prisma.notificacao.create({
      data: {
        usuarioId: data.usuarioId,
        tipo: data.tipo,
        titulo: data.titulo,
        mensagem: data.mensagem,
        deepLink: data.deepLink,
        dados: data.dados,
      },
    });
  }

  async getAll(userId: string) {
    return this.prisma.notificacao.findMany({
      where: { usuarioId: userId },
      orderBy: { criadoEm: 'desc' },
      take: 30,
    });
  }

  async marcarLida(notificacaoId: string, userId: string) {
    return this.prisma.notificacao.update({
      where: { id: notificacaoId },
      data: {
        lida: true,
        lidaEm: new Date(),
      },
    });
  }

  async marcarTodasLidas(userId: string) {
    await this.prisma.notificacao.updateMany({
      where: { usuarioId: userId, lida: false },
      data: {
        lida: true,
        lidaEm: new Date(),
      },
    });
    return { mensagem: 'Todas as notificações marcadas como lidas.' };
  }

  async countNaoLidas(userId: string) {
    const count = await this.prisma.notificacao.count({
      where: { usuarioId: userId, lida: false },
    });
    return { count };
  }
}
