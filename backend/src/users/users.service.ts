import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.usuario.findUnique({ where: { email } });
  }

  async updateProfile(
    userId: string,
    data: { nome?: string; telefone?: string },
  ) {
    return this.prisma.usuario.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
        avatarUrl: true,
      },
    });
  }

  async submitFeedback(
    userId: string,
    data: { tipo: string; mensagem: string },
  ) {
    const feedback = await this.prisma.feedback.create({
      data: { usuarioId: userId, ...data },
    });
    return { feedback, mensagem: 'Feedback enviado com sucesso. Obrigado!' };
  }
}
