import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrestadoresService {
  constructor(private prisma: PrismaService) {}

  async findProfile(usuarioId: string) {
    const perfil = await this.prisma.perfilPrestador.findUnique({
      where: { usuarioId },
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

    if (!perfil) {
      throw new NotFoundException('Perfil de prestador não encontrado.');
    }

    return perfil;
  }

  async updateProfile(usuarioId: string, data: any) {
    const perfil = await this.prisma.perfilPrestador.update({
      where: { usuarioId },
      data: {
        tipoPrestador: data.tipoPrestador,
        nomeEmpresa: data.nomeEmpresa,
        cnpj: data.cnpj,
        telefoneProfissional: data.telefoneProfissional,
        endereco: data.endereco,
        registroProfissional: data.registroProfissional,
        descricao: data.descricao,
        website: data.website,
      },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
    });

    return perfil;
  }

  async listPrestadores(filtro?: { tipoPrestador?: string; cidade?: string }) {
    const where: any = { ativo: true };

    if (filtro?.tipoPrestador) {
      where.tipoPrestador = filtro.tipoPrestador;
    }

    const prestadores = await this.prisma.perfilPrestador.findMany({
      where,
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
      orderBy: { criadoEm: 'desc' },
    });

    return prestadores;
  }
}
