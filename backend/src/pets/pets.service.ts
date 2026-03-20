import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { generatePetCode } from '../common/utils/pet-code.util';

@Injectable()
export class PetsService {
  constructor(private prisma: PrismaService) {}

  async findAllByUser(userId: string) {
    const petUsuarios = await this.prisma.petUsuario.findMany({
      where: { usuarioId: userId, ativo: true },
      include: {
        pet: {
          include: {
            vacinas: { orderBy: { dataAplicacao: 'desc' }, take: 1 },
            medicamentos: { where: { status: 'ATIVO' }, take: 3 },
            guardas: { where: { ativa: true }, take: 1 },
            petUsuarios: {
              where: { ativo: true },
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
        },
      },
      orderBy: { adicionadoEm: 'desc' },
    });

    return petUsuarios.map((pu) => ({
      ...pu.pet,
      meuRole: pu.role,
      guardaAtual: pu.pet.guardas[0] || null,
      proximaVacina: pu.pet.vacinas[0] || null,
      medicamentosAtivos: pu.pet.medicamentos.length,
    }));
  }

  async findOne(petId: string, userId: string) {
    await this.checkAccess(petId, userId);

    const [pet, petUsuario] = await Promise.all([
      this.prisma.pet.findUnique({
        where: { id: petId },
        include: {
          petUsuarios: {
            where: { ativo: true },
            include: {
              usuario: {
                select: {
                  id: true,
                  nome: true,
                  email: true,
                  avatarUrl: true,
                  telefone: true,
                },
              },
            },
          },
          vacinas: { orderBy: { dataAplicacao: 'desc' } },
          medicamentos: {
            orderBy: { dataInicio: 'desc' },
            include: {
              administracoes: {
                orderBy: { administradoEm: 'desc' },
                take: 3,
              },
            },
          },
          sintomas: { orderBy: { dataInicio: 'desc' } },
          planoSaude: true,
          guardas: { orderBy: { dataInicio: 'desc' }, take: 5 },
        },
      }),
      this.prisma.petUsuario.findFirst({
        where: { petId, usuarioId: userId, ativo: true },
        select: { role: true },
      }),
    ]);

    return { ...pet, meuRole: petUsuario?.role ?? null };
  }

  async create(userId: string, dto: CreatePetDto) {
    // Gerar código único com retry por colisão
    let codigoPet: string;
    let codeUnique = false;
    while (!codeUnique) {
      codigoPet = generatePetCode();
      const exists = await this.prisma.pet.findUnique({ where: { codigoPet } });
      if (!exists) codeUnique = true;
    }

    const pet = await this.prisma.pet.create({
      data: {
        nome: dto.nome,
        especie: dto.especie as any,
        raca: dto.raca,
        genero: dto.genero as any,
        dataNascimento: dto.dataNascimento
          ? new Date(dto.dataNascimento)
          : undefined,
        cor: dto.cor,
        peso: dto.peso,
        microchip: dto.microchip,
        observacoes: dto.observacoes,
        codigoPet,
        tipoGuarda: dto.tipoGuarda as any,
        petUsuarios: {
          create: { usuarioId: userId, role: 'TUTOR_PRINCIPAL' },
        },
      },
    });

    await this.prisma.evento.create({
      data: {
        petId: pet.id,
        tipo: 'PET_CRIADO',
        titulo: `${pet.nome} cadastrado no MITRA`,
        descricao: 'Pet adicionado ao sistema.',
        autorId: userId,
      },
    });

    return pet;
  }

  async findByCodigo(codigo: string) {
    const pet = await this.prisma.pet.findUnique({
      where: { codigoPet: codigo.toUpperCase() },
      include: {
        petUsuarios: {
          where: { role: 'TUTOR_PRINCIPAL', ativo: true },
        },
      },
    });

    if (!pet) {
      throw new NotFoundException('Pet não encontrado');
    }

    return {
      id: pet.id,
      codigoPet: pet.codigoPet,
      nome: pet.nome,
      especie: pet.especie,
      raca: pet.raca,
      fotoUrl: pet.fotoUrl,
      tipoGuarda: pet.tipoGuarda,
      tutorPrincipalCount: pet.petUsuarios.length,
      maxTutorPrincipal: 2,
    };
  }

  async vincularByCodigo(codigo: string, userId: string, role: string) {
    const resumo = await this.findByCodigo(codigo);

    if (role === 'TUTOR_PRINCIPAL') {
      if (resumo.tipoGuarda !== 'CONJUNTA') {
        throw new ForbiddenException(
          'Este pet não tem guarda compartilhada. Apenas tutores atuais podem convidar.',
        );
      }
      if (resumo.tutorPrincipalCount >= 2) {
        throw new ConflictException('Este pet já tem 2 tutores principais.');
      }
    }

    const existing = await this.prisma.petUsuario.findUnique({
      where: { petId_usuarioId: { petId: resumo.id, usuarioId: userId } },
    });

    if (existing) {
      throw new ConflictException('Você já está vinculado a este pet.');
    }

    await this.prisma.petUsuario.create({
      data: { petId: resumo.id, usuarioId: userId, role: role as any },
    });

    await this.prisma.evento.create({
      data: {
        petId: resumo.id,
        tipo: 'TUTOR_ADICIONADO',
        titulo: `Novo vínculo criado via código`,
        descricao: `Usuário vinculado como ${role}.`,
        autorId: userId,
      },
    });

    return { petId: resumo.id, message: 'Vinculado com sucesso' };
  }

  async update(petId: string, userId: string, dto: UpdatePetDto) {
    await this.checkAccess(petId, userId);

    return this.prisma.pet.update({
      where: { id: petId },
      data: {
        nome: dto.nome,
        especie: dto.especie as any,
        raca: dto.raca,
        genero: dto.genero as any,
        dataNascimento: dto.dataNascimento
          ? new Date(dto.dataNascimento)
          : undefined,
        cor: dto.cor,
        peso: dto.peso,
        microchip: dto.microchip,
        observacoes: dto.observacoes,
      },
    });
  }

  async getDashboard(petId: string, userId: string) {
    await this.checkAccess(petId, userId);

    const hoje = new Date();
    const em7Dias = new Date();
    em7Dias.setDate(hoje.getDate() + 7);

    const [
      pet,
      vacinas,
      medicamentosAtivos,
      guardaAtual,
      solicitacoesPendentes,
      eventoRecentes,
    ] = await Promise.all([
      this.prisma.pet.findUnique({ where: { id: petId } }),
      this.prisma.vacina.findMany({
        where: { petId, proximaDose: { lte: em7Dias, gte: hoje } },
        orderBy: { proximaDose: 'asc' },
        take: 1,
      }),
      this.prisma.medicamento.findMany({
        where: { petId, status: 'ATIVO' },
        orderBy: { dataInicio: 'desc' },
        take: 3,
      }),
      this.prisma.guarda.findFirst({
        where: { petId, ativa: true },
      }),
      this.prisma.solicitacao.count({
        where: { petId, status: 'PENDENTE' },
      }),
      this.prisma.evento.findMany({
        where: { petId },
        orderBy: { criadoEm: 'desc' },
        take: 5,
      }),
    ]);

    return {
      pet,
      alertas: {
        vacinaVencendo: vacinas.length > 0,
        solicitacoesPendentes,
      },
      hoje: {
        proximaVacina: vacinas[0] || null,
        proximoMedicamento: medicamentosAtivos[0] || null,
        guardaAtual,
      },
      atividadeRecente: eventoRecentes,
    };
  }

  async checkAccess(petId: string, userId: string) {
    const acesso = await this.prisma.petUsuario.findFirst({
      where: { petId, usuarioId: userId, ativo: true },
    });

    if (!acesso) {
      throw new ForbiddenException('Você não tem acesso a este pet.');
    }

    return acesso;
  }
}
