import { PrismaClient, PetSpecies, PetGender, EventoTipo, MedicamentoStatus } from '@prisma/client';
import * as argon2 from 'argon2';
import { addDays, subDays, subMonths } from 'date-fns';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed MITRA...');

  // Limpar dados existentes
  await prisma.auditLog.deleteMany();
  await prisma.notificacao.deleteMany();
  await prisma.feedback.deleteMany();
  await prisma.evento.deleteMany();
  await prisma.solicitacao.deleteMany();
  await prisma.guarda.deleteMany();
  await prisma.administracaoMed.deleteMany();
  await prisma.medicamento.deleteMany();
  await prisma.vacina.deleteMany();
  await prisma.sintoma.deleteMany();
  await prisma.planoSaude.deleteMany();
  await prisma.petUsuario.deleteMany();
  await prisma.pet.deleteMany();
  await prisma.usuario.deleteMany();

  // Criar usuários
  const senha = await argon2.hash('Mitra@2024');

  const ana = await prisma.usuario.create({
    data: {
      nome: 'Ana Souza',
      email: 'ana@mitra.com',
      senhaHash: senha,
      telefone: '11999990001',
    },
  });

  const carlos = await prisma.usuario.create({
    data: {
      nome: 'Carlos Lima',
      email: 'carlos@mitra.com',
      senhaHash: senha,
      telefone: '11999990002',
    },
  });

  const beatriz = await prisma.usuario.create({
    data: {
      nome: 'Beatriz Melo',
      email: 'beatriz@mitra.com',
      senhaHash: senha,
      telefone: '11999990003',
    },
  });

  console.log('✅ Usuários criados');

  // Criar pet LUNA
  const luna = await prisma.pet.create({
    data: {
      nome: 'Luna',
      especie: PetSpecies.CACHORRO,
      raca: 'Golden Retriever',
      genero: PetGender.FEMEA,
      dataNascimento: new Date('2021-03-15'),
      cor: 'Dourada',
      peso: 28.5,
      microchip: '985113002345678',
      codigoPet: 'LUN4XK',
      tipoGuarda: 'CONJUNTA',
    },
  });

  // Criar pet MOCHI
  const mochi = await prisma.pet.create({
    data: {
      nome: 'Mochi',
      especie: PetSpecies.GATO,
      raca: 'Ragdoll',
      genero: PetGender.MACHO,
      dataNascimento: new Date('2022-07-20'),
      cor: 'Cinza e branco',
      peso: 5.2,
      codigoPet: 'MCH7YP',
      tipoGuarda: 'SEPARADA',
    },
  });

  console.log('✅ Pets criados');

  // Vincular tutores
  await prisma.petUsuario.createMany({
    data: [
      { petId: luna.id, usuarioId: ana.id, role: 'TUTOR_PRINCIPAL' },
      { petId: luna.id, usuarioId: carlos.id, role: 'TUTOR_PRINCIPAL' },
      { petId: mochi.id, usuarioId: ana.id, role: 'TUTOR_PRINCIPAL' },
      { petId: mochi.id, usuarioId: beatriz.id, role: 'TUTOR_EMERGENCIA' },
    ],
  });

  console.log('✅ Tutores vinculados');

  // Vacinas da LUNA
  await prisma.vacina.createMany({
    data: [
      {
        petId: luna.id,
        nome: 'V10 (Déctupla)',
        dataAplicacao: subMonths(new Date(), 10),
        proximaDose: addDays(new Date(), 60),
        veterinario: 'Dr. Roberto Silva',
        clinica: 'Clínica VetCare',
        lote: 'VX2024-001',
      },
      {
        petId: luna.id,
        nome: 'Antirrábica',
        dataAplicacao: subMonths(new Date(), 6),
        proximaDose: addDays(new Date(), 180),
        veterinario: 'Dr. Roberto Silva',
        clinica: 'Clínica VetCare',
      },
      {
        petId: luna.id,
        nome: 'Gripe (Bordetella)',
        dataAplicacao: subMonths(new Date(), 3),
        proximaDose: addDays(new Date(), 90),
        veterinario: 'Dra. Camila Torres',
        clinica: 'PetMed Center',
      },
    ],
  });

  // Medicamentos da LUNA
  const medicamento1 = await prisma.medicamento.create({
    data: {
      petId: luna.id,
      nome: 'Bravecto',
      dosagem: '1 comprimido',
      frequencia: 'A cada 3 meses',
      dataInicio: subMonths(new Date(), 1),
      dataFim: addDays(new Date(), 60),
      horarios: ['08:00'],
      veterinario: 'Dr. Roberto Silva',
      motivo: 'Prevenção de pulgas e carrapatos',
      status: MedicamentoStatus.ATIVO,
    },
  });

  await prisma.administracaoMed.create({
    data: {
      medicamentoId: medicamento1.id,
      administradoEm: subMonths(new Date(), 1),
      administradoPor: ana.nome,
      observacoes: 'Administrado com ração',
    },
  });

  // Plano de saúde LUNA
  await prisma.planoSaude.create({
    data: {
      petId: luna.id,
      operadora: 'PetPrev',
      numeroCartao: '0001-2345-6789',
      plano: 'Premium',
      dataVigencia: subMonths(new Date(), 8),
      dataExpiracao: addDays(new Date(), 120),
      coberturas: ['Consultas', 'Exames', 'Cirurgias', 'Emergência'],
    },
  });

  // Guarda da LUNA
  await prisma.guarda.createMany({
    data: [
      {
        petId: luna.id,
        tutorId: ana.id,
        dataInicio: new Date(),
        dataFim: addDays(new Date(), 7),
        ativa: true,
        observacoes: 'Semana atual com Ana',
      },
      {
        petId: luna.id,
        tutorId: carlos.id,
        dataInicio: addDays(new Date(), 7),
        ativa: false,
        observacoes: 'Próxima semana com Carlos',
      },
    ],
  });

  // Sintomas
  await prisma.sintoma.create({
    data: {
      petId: luna.id,
      descricao: 'Coceira excessiva nas patas traseiras',
      dataInicio: subDays(new Date(), 5),
      intensidade: 2,
      observacoes: 'Pode ser reação ao capim do parque',
    },
  });

  console.log('✅ Dados de saúde criados');

  // Solicitação de alteração de guarda (pendente)
  const expiradoEm = addDays(new Date(), 2);
  await prisma.solicitacao.create({
    data: {
      petId: luna.id,
      solicitanteId: ana.id,
      destinatarioId: carlos.id,
      tipo: 'ALTERACAO_GUARDA',
      status: 'PENDENTE',
      justificativa: 'Preciso viajar semana que vem, Carlos pode ficar com a Luna?',
      expiradoEm,
      dados: {
        dataInicio: addDays(new Date(), 7).toISOString(),
        dataFim: addDays(new Date(), 14).toISOString(),
        tutorReceptor: carlos.id,
      },
    },
  });

  console.log('✅ Solicitações criadas');

  // Eventos históricos da LUNA
  const eventos = [
    {
      petId: luna.id,
      tipo: EventoTipo.PET_CRIADO,
      titulo: 'Pet cadastrado no MITRA',
      descricao: 'Luna foi adicionada ao sistema.',
      autorId: ana.id,
      criadoEm: subMonths(new Date(), 8),
    },
    {
      petId: luna.id,
      tipo: EventoTipo.TUTOR_ADICIONADO,
      titulo: 'Tutor adicionado: Carlos Lima',
      descricao: 'Carlos Lima foi vinculado como tutor principal de Luna.',
      autorId: ana.id,
      criadoEm: subMonths(new Date(), 7),
    },
    {
      petId: luna.id,
      tipo: EventoTipo.PLANO_SAUDE_ATUALIZADO,
      titulo: 'Plano de saúde registrado',
      descricao: 'Plano PetPrev Premium ativado.',
      autorId: ana.id,
      criadoEm: subMonths(new Date(), 8),
    },
    {
      petId: luna.id,
      tipo: EventoTipo.VACINA_REGISTRADA,
      titulo: 'Vacina registrada: V10 (Déctupla)',
      descricao: 'Aplicada pelo Dr. Roberto Silva na Clínica VetCare.',
      autorId: ana.id,
      criadoEm: subMonths(new Date(), 10),
    },
    {
      petId: luna.id,
      tipo: EventoTipo.VACINA_REGISTRADA,
      titulo: 'Vacina registrada: Antirrábica',
      descricao: 'Aplicada pelo Dr. Roberto Silva na Clínica VetCare.',
      autorId: carlos.id,
      criadoEm: subMonths(new Date(), 6),
    },
    {
      petId: luna.id,
      tipo: EventoTipo.MEDICAMENTO_ADMINISTRADO,
      titulo: 'Bravecto administrado',
      descricao: 'Dose administrada por Ana Souza às 08h00.',
      autorId: ana.id,
      criadoEm: subMonths(new Date(), 1),
    },
    {
      petId: luna.id,
      tipo: EventoTipo.SOLICITACAO_CRIADA,
      titulo: 'Solicitação de alteração de guarda criada',
      descricao: 'Ana solicitou alteração de guarda para Carlos. Aguardando confirmação.',
      autorId: ana.id,
      criadoEm: new Date(),
    },
  ];

  for (const evento of eventos) {
    await prisma.evento.create({ data: evento });
  }

  // Notificações
  await prisma.notificacao.create({
    data: {
      usuarioId: carlos.id,
      tipo: 'SOLICITACAO_RECEBIDA',
      titulo: 'Nova solicitação de alteração de guarda',
      mensagem: 'Ana Souza solicitou alteração de guarda de Luna. Expira em 48h.',
      deepLink: '/pets/' + luna.id + '/guarda',
      dados: { solicitacaoId: 'mock-id', petNome: 'Luna' },
    },
  });

  console.log('✅ Eventos e notificações criados');

  // Vacinas do MOCHI
  await prisma.vacina.create({
    data: {
      petId: mochi.id,
      nome: 'V4 (Quádrupla Felina)',
      dataAplicacao: subMonths(new Date(), 4),
      proximaDose: addDays(new Date(), 30),
      veterinario: 'Dra. Camila Torres',
      clinica: 'PetMed Center',
    },
  });

  // Eventos do MOCHI
  await prisma.evento.create({
    data: {
      petId: mochi.id,
      tipo: EventoTipo.PET_CRIADO,
      titulo: 'Mochi cadastrado no MITRA',
      descricao: 'Mochi foi adicionado ao sistema por Ana Souza.',
      autorId: ana.id,
      criadoEm: subMonths(new Date(), 4),
    },
  });

  console.log('✅ Seed concluído com sucesso! 🐾');
  console.log('');
  console.log('📧 Usuários para login:');
  console.log('   ana@mitra.com     | senha: Mitra@2024');
  console.log('   carlos@mitra.com  | senha: Mitra@2024');
  console.log('   beatriz@mitra.com | senha: Mitra@2024');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
