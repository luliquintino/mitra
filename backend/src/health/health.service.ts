import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PetsService } from '../pets/pets.service';

@Injectable()
export class HealthService {
  constructor(
    private prisma: PrismaService,
    private petsService: PetsService,
  ) {}

  async getVacinas(petId: string, userId: string) {
    await this.petsService.checkAccess(petId, userId);
    return this.prisma.vacina.findMany({
      where: { petId },
      orderBy: { dataAplicacao: 'desc' },
    });
  }

  async createVacina(petId: string, userId: string, data: any) {
    await this.petsService.checkAccess(petId, userId);

    const vacina = await this.prisma.vacina.create({
      data: {
        petId,
        nome: data.nome,
        dataAplicacao: new Date(data.dataAplicacao),
        proximaDose: data.proximaDose ? new Date(data.proximaDose) : undefined,
        veterinario: data.veterinario,
        clinica: data.clinica,
        lote: data.lote,
        observacoes: data.observacoes,
      },
    });

    await this.prisma.evento.create({
      data: {
        petId,
        tipo: 'VACINA_REGISTRADA',
        titulo: `Vacina registrada: ${vacina.nome}`,
        descricao: `Aplicada em ${new Date(vacina.dataAplicacao).toLocaleDateString('pt-BR')}${vacina.veterinario ? ' pelo ' + vacina.veterinario : ''}.`,
        autorId: userId,
      },
    });

    return {
      vacina,
      mensagem: `Vacina "${vacina.nome}" registrada em ${new Date(vacina.dataAplicacao).toLocaleDateString('pt-BR')} e notificada ao outro tutor.`,
    };
  }

  async getMedicamentos(petId: string, userId: string) {
    await this.petsService.checkAccess(petId, userId);
    return this.prisma.medicamento.findMany({
      where: { petId },
      orderBy: { dataInicio: 'desc' },
      include: {
        administracoes: {
          orderBy: { administradoEm: 'desc' },
          take: 3,
        },
      },
    });
  }

  async createMedicamento(petId: string, userId: string, data: any) {
    await this.petsService.checkAccess(petId, userId);

    const med = await this.prisma.medicamento.create({
      data: {
        petId,
        nome: data.nome,
        dosagem: data.dosagem,
        frequencia: data.frequencia,
        dataInicio: new Date(data.dataInicio),
        dataFim: data.dataFim ? new Date(data.dataFim) : undefined,
        horarios: data.horarios || [],
        veterinario: data.veterinario,
        motivo: data.motivo,
        observacoes: data.observacoes,
      },
    });

    await this.prisma.evento.create({
      data: {
        petId,
        tipo: 'MEDICAMENTO_ADMINISTRADO',
        titulo: `Medicamento iniciado: ${med.nome}`,
        descricao: `${med.dosagem} — ${med.frequencia}.`,
        autorId: userId,
      },
    });

    const now = new Date();
    return {
      medicamento: med,
      mensagem: `Medicamento "${med.nome}" registrado às ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} e notificado ao outro tutor.`,
    };
  }

  async registrarAdministracao(
    medId: string,
    userId: string,
    data: any,
  ) {
    const med = await this.prisma.medicamento.findUnique({
      where: { id: medId },
    });
    if (!med) throw new Error('Medicamento não encontrado.');

    await this.petsService.checkAccess(med.petId, userId);

    const usuario = await this.prisma.usuario.findUnique({
      where: { id: userId },
      select: { nome: true },
    });

    const admin = await this.prisma.administracaoMed.create({
      data: {
        medicamentoId: medId,
        administradoPor: usuario?.nome,
        observacoes: data.observacoes,
      },
    });

    const now = new Date();
    await this.prisma.evento.create({
      data: {
        petId: med.petId,
        tipo: 'MEDICAMENTO_ADMINISTRADO',
        titulo: `${med.nome} administrado`,
        descricao: `Dose administrada por ${usuario?.nome} às ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}.`,
        autorId: userId,
      },
    });

    return {
      administracao: admin,
      mensagem: `${med.nome} administrado às ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} e notificado ao outro tutor.`,
    };
  }

  async getSintomas(petId: string, userId: string) {
    await this.petsService.checkAccess(petId, userId);
    return this.prisma.sintoma.findMany({
      where: { petId },
      orderBy: { dataInicio: 'desc' },
    });
  }

  async createSintoma(petId: string, userId: string, data: any) {
    await this.petsService.checkAccess(petId, userId);

    const sintoma = await this.prisma.sintoma.create({
      data: {
        petId,
        descricao: data.descricao,
        dataInicio: new Date(data.dataInicio),
        intensidade: data.intensidade,
        observacoes: data.observacoes,
      },
    });

    await this.prisma.evento.create({
      data: {
        petId,
        tipo: 'SINTOMA_REGISTRADO',
        titulo: 'Sintoma registrado',
        descricao: sintoma.descricao,
        autorId: userId,
      },
    });

    return {
      sintoma,
      mensagem: 'Sintoma registrado e notificado ao outro tutor.',
    };
  }

  async getPlanoSaude(petId: string, userId: string) {
    await this.petsService.checkAccess(petId, userId);
    return this.prisma.planoSaude.findUnique({ where: { petId } });
  }

  async upsertPlanoSaude(petId: string, userId: string, data: any) {
    await this.petsService.checkAccess(petId, userId);

    const payload = {
      operadora: data.operadora,
      numeroCartao: data.numeroCartao,
      plano: data.plano,
      dataVigencia: data.dataVigencia ? new Date(data.dataVigencia) : undefined,
      dataExpiracao: data.dataExpiracao
        ? new Date(data.dataExpiracao)
        : undefined,
      coberturas: data.coberturas || [],
      observacoes: data.observacoes,
    };

    const plano = await this.prisma.planoSaude.upsert({
      where: { petId },
      create: { petId, ...payload },
      update: payload,
    });

    await this.prisma.evento.create({
      data: {
        petId,
        tipo: 'PLANO_SAUDE_ATUALIZADO',
        titulo: 'Plano de saúde atualizado',
        descricao: `Operadora: ${plano.operadora}`,
        autorId: userId,
      },
    });

    return { plano, mensagem: 'Plano de saúde atualizado com sucesso.' };
  }
}
