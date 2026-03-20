import type {
  Usuario,
  Pet,
  PetUsuario,
  Vacina,
  Medicamento,
  Sintoma,
  PlanoSaude,
  Guarda,
  Solicitacao,
  Evento,
  Notificacao,
  DashboardData,
  Compromisso,
  VisitantePet,
} from '@/types';

// ─── Usuários ────────────────────────────────────
export const mockUsuarios: Usuario[] = [
  {
    id: 'usr-ana',
    nome: 'Ana Souza',
    email: 'ana@mitra.com',
    telefone: '11999990001',
    criadoEm: '2025-06-01T10:00:00Z',
    tipoConta: 'TUTOR',
    bio: 'Tutora da Luna e da Mochi. Apaixonada por animais.',
  },
  {
    id: 'usr-carlos',
    nome: 'Carlos Lima',
    email: 'carlos@mitra.com',
    telefone: '11999990002',
    criadoEm: '2025-06-01T10:00:00Z',
    tipoConta: 'TUTOR',
    bio: 'Co-tutor da Luna. Trabalho em home office e cuido dela durante a semana.',
  },
  {
    id: 'usr-beatriz',
    nome: 'Beatriz Melo',
    email: 'beatriz@mitra.com',
    telefone: '11999990003',
    criadoEm: '2025-06-15T10:00:00Z',
    tipoConta: 'VISITANTE',
    bio: 'Amiga da família, contato de emergência.',
  },
  {
    id: 'usr-joao',
    nome: 'João Ferreira',
    email: 'joao@mitra.com',
    telefone: '11999990004',
    criadoEm: '2025-07-01T10:00:00Z',
    tipoConta: 'PRESTADOR',
    tipoUsuario: 'PRESTADOR',
    profissao: 'ADESTRADOR',
    bio: 'Adestrador certificado com 8 anos de experiência.',
    descricaoServicos: 'Adestramento básico, avançado e correção de comportamento.',
    areaAtuacao: 'São Paulo - SP (Zona Sul e Centro)',
    site: 'instagram.com/joaoferreira.adestrador',
  },
  {
    id: 'usr-pedro',
    nome: 'Pedro Santos',
    email: 'pedro@mitra.com',
    telefone: '11999990005',
    criadoEm: '2025-07-15T10:00:00Z',
    tipoConta: 'PRESTADOR',
    tipoUsuario: 'PRESTADOR',
    profissao: 'PASSEADOR',
    bio: 'Passeador profissional, atendo na região da Vila Mariana.',
    descricaoServicos: 'Passeios individuais e em grupo, visitas domiciliares.',
    areaAtuacao: 'Vila Mariana, Moema, Paraíso - SP',
    site: 'instagram.com/pedropetwalker',
  },
];

// ─── PetUsuarios ─────────────────────────────────
export const mockPetUsuariosLuna: PetUsuario[] = [
  {
    id: 'pu-1',
    petId: 'pet-luna',
    usuarioId: 'usr-ana',
    role: 'TUTOR_PRINCIPAL',
    ativo: true,
    adicionadoEm: '2025-06-01T10:00:00Z',
    apresentacao: 'A Luna chegou na minha vida num dia chuvoso de março e desde então não consigo imaginar as manhãs sem ela. Acordamos juntas, corremos no parque e ela sempre me lembra que o mundo é melhor com um rabinho abanando.',
    usuario: { id: 'usr-ana', nome: 'Ana Souza', email: 'ana@mitra.com', avatarUrl: undefined },
  },
  {
    id: 'pu-2',
    petId: 'pet-luna',
    usuarioId: 'usr-carlos',
    role: 'TUTOR_PRINCIPAL',
    ativo: true,
    adicionadoEm: '2025-06-05T10:00:00Z',
    apresentacao: 'Para mim, a Luna representa calma e presença. Trabalho em home office e ela dorme aos meus pés o dia inteiro — me lembra de fazer pausas e sair para respirar. É impossível ficar estressado com ela por perto.',
    usuario: { id: 'usr-carlos', nome: 'Carlos Lima', email: 'carlos@mitra.com', avatarUrl: undefined },
  },
  {
    id: 'pu-5',
    petId: 'pet-luna',
    usuarioId: 'usr-joao',
    role: 'ADESTRADOR',
    ativo: true,
    adicionadoEm: '2025-07-10T10:00:00Z',
    usuario: { id: 'usr-joao', nome: 'João Ferreira', email: 'joao@mitra.com', avatarUrl: undefined },
  },
  {
    id: 'pu-6',
    petId: 'pet-luna',
    usuarioId: 'usr-pedro',
    role: 'PASSEADOR',
    ativo: true,
    adicionadoEm: '2025-08-01T10:00:00Z',
    usuario: { id: 'usr-pedro', nome: 'Pedro Santos', email: 'pedro@mitra.com', avatarUrl: undefined },
  },
];

export const mockPetUsuariosMochi: PetUsuario[] = [
  {
    id: 'pu-3',
    petId: 'pet-mochi',
    usuarioId: 'usr-ana',
    role: 'TUTOR_PRINCIPAL',
    ativo: true,
    adicionadoEm: '2025-10-01T10:00:00Z',
    usuario: { id: 'usr-ana', nome: 'Ana Souza', email: 'ana@mitra.com', avatarUrl: undefined },
  },
  {
    id: 'pu-4',
    petId: 'pet-mochi',
    usuarioId: 'usr-beatriz',
    role: 'TUTOR_EMERGENCIA',
    ativo: true,
    adicionadoEm: '2025-10-10T10:00:00Z',
    usuario: { id: 'usr-beatriz', nome: 'Beatriz Melo', email: 'beatriz@mitra.com', avatarUrl: undefined },
  },
];

// ─── Vacinas ──────────────────────────────────────
export const mockVacinasLuna: Vacina[] = [
  {
    id: 'vac-1',
    petId: 'pet-luna',
    nome: 'V10 (Déctupla)',
    dataAplicacao: '2025-04-10T10:00:00Z',
    proximaDose: '2026-04-10T10:00:00Z',
    veterinario: 'Dr. Roberto Silva',
    clinica: 'Clínica VetCare',
    lote: 'VX2024-001',
    criadoEm: '2025-04-10T10:00:00Z',
  },
  {
    id: 'vac-2',
    petId: 'pet-luna',
    nome: 'Antirrábica',
    dataAplicacao: '2025-08-20T10:00:00Z',
    proximaDose: '2026-08-20T10:00:00Z',
    veterinario: 'Dr. Roberto Silva',
    clinica: 'Clínica VetCare',
    criadoEm: '2025-08-20T10:00:00Z',
  },
  {
    id: 'vac-3',
    petId: 'pet-luna',
    nome: 'Gripe (Bordetella)',
    dataAplicacao: '2025-11-15T10:00:00Z',
    proximaDose: '2026-05-15T10:00:00Z',
    veterinario: 'Dra. Camila Torres',
    clinica: 'PetMed Center',
    criadoEm: '2025-11-15T10:00:00Z',
  },
];

// ─── Medicamentos ─────────────────────────────────
export const mockMedicamentosLuna: Medicamento[] = [
  {
    id: 'med-1',
    petId: 'pet-luna',
    nome: 'Bravecto',
    dosagem: '1 comprimido',
    frequencia: 'A cada 3 meses',
    dataInicio: '2026-01-28T10:00:00Z',
    dataFim: '2026-04-28T10:00:00Z',
    horarios: ['08:00'],
    veterinario: 'Dr. Roberto Silva',
    motivo: 'Prevenção de pulgas e carrapatos',
    status: 'ATIVO',
    criadoEm: '2026-01-28T10:00:00Z',
    administracoes: [
      {
        id: 'adm-1',
        medicamentoId: 'med-1',
        administradoEm: '2026-01-28T08:00:00Z',
        administradoPor: 'Ana Souza',
        observacoes: 'Administrado com ração',
      },
    ],
  },
  {
    id: 'med-2',
    petId: 'pet-luna',
    nome: 'Apoquel',
    dosagem: '16mg — 1/2 comprimido',
    frequencia: 'Uma vez ao dia',
    dataInicio: '2025-12-01T10:00:00Z',
    dataFim: '2026-01-01T10:00:00Z',
    horarios: ['12:00'],
    motivo: 'Controle de coceira — dermatite',
    status: 'CONCLUIDO',
    criadoEm: '2025-12-01T10:00:00Z',
    administracoes: [],
  },
];

// ─── Sintomas ─────────────────────────────────────
export const mockSintomasLuna: Sintoma[] = [
  {
    id: 'sin-1',
    petId: 'pet-luna',
    descricao: 'Coceira excessiva nas patas traseiras',
    dataInicio: '2026-02-23T10:00:00Z',
    intensidade: 2,
    observacoes: 'Pode ser reação ao capim do parque',
    criadoEm: '2026-02-23T10:00:00Z',
  },
];

// ─── Plano de Saúde ───────────────────────────────
export const mockPlanoSaudeLuna: PlanoSaude = {
  id: 'plano-1',
  petId: 'pet-luna',
  operadora: 'PetPrev',
  numeroCartao: '0001-2345-6789',
  plano: 'Premium',
  dataVigencia: '2025-06-01T00:00:00Z',
  dataExpiracao: '2026-06-01T00:00:00Z',
  coberturas: ['Consultas', 'Exames', 'Cirurgias', 'Emergência'],
};

// ─── Compromissos ─────────────────────────────────
export const mockCompromissosLuna: Compromisso[] = [
  {
    id: 'comp-1',
    petId: 'pet-luna',
    titulo: 'Passeio',
    tipo: 'PASSEIO',
    responsavelId: 'usr-pedro',
    responsavelNome: 'Pedro Santos',
    recorrencia: 'SEMANAL',
    diasSemana: [3, 5], // Quarta e Sexta
    horarioInicio: '09:00',
    horarioFim: '11:00',
    dataInicio: '2026-01-07',
    ativo: true,
    criadoEm: '2025-12-20T10:00:00Z',
  },
  {
    id: 'comp-2',
    petId: 'pet-luna',
    titulo: 'Adestramento',
    tipo: 'ADESTRAMENTO',
    responsavelId: 'usr-joao',
    responsavelNome: 'João Ferreira',
    recorrencia: 'SEMANAL',
    diasSemana: [2], // Terça
    horarioInicio: '10:00',
    horarioFim: '11:00',
    dataInicio: '2026-01-06',
    ativo: true,
    criadoEm: '2025-12-20T10:00:00Z',
  },
];

// ─── Guardas ─────────────────────────────────────
export const mockGuardasLuna: Guarda[] = [
  {
    id: 'grd-1',
    petId: 'pet-luna',
    tutorId: 'usr-ana',
    dataInicio: '2026-02-24T00:00:00Z',
    dataFim: '2026-03-07T00:00:00Z',
    ativa: true,
    observacoes: 'Semana atual com Ana',
  },
  {
    id: 'grd-2',
    petId: 'pet-luna',
    tutorId: 'usr-carlos',
    dataInicio: '2026-03-07T00:00:00Z',
    ativa: false,
    observacoes: 'Próxima semana com Carlos',
  },
];

// ─── Solicitações ─────────────────────────────────
export const mockSolicitacoesLuna: Solicitacao[] = [
  {
    id: 'sol-1',
    petId: 'pet-luna',
    solicitanteId: 'usr-ana',
    destinatarioId: 'usr-carlos',
    tipo: 'ALTERACAO_GUARDA',
    status: 'PENDENTE',
    justificativa: 'Preciso viajar semana que vem, Carlos pode ficar com a Luna?',
    expiradoEm: '2026-03-02T10:00:00Z',
    criadoEm: '2026-02-28T10:00:00Z',
    solicitante: { id: 'usr-ana', nome: 'Ana Souza', email: 'ana@mitra.com', avatarUrl: undefined },
    destinatario: { id: 'usr-carlos', nome: 'Carlos Lima', email: 'carlos@mitra.com', avatarUrl: undefined },
  },
  {
    id: 'sol-2',
    petId: 'pet-luna',
    solicitanteId: 'usr-carlos',
    destinatarioId: 'usr-ana',
    tipo: 'ALTERACAO_GUARDA',
    status: 'APROVADA',
    justificativa: 'Férias em janeiro — Ana fica com a Luna.',
    expiradoEm: '2026-01-10T10:00:00Z',
    respondidoEm: '2026-01-08T14:00:00Z',
    criadoEm: '2026-01-08T09:00:00Z',
    solicitante: { id: 'usr-carlos', nome: 'Carlos Lima', email: 'carlos@mitra.com', avatarUrl: undefined },
    destinatario: { id: 'usr-ana', nome: 'Ana Souza', email: 'ana@mitra.com', avatarUrl: undefined },
  },
];

// ─── Eventos ─────────────────────────────────────
export const mockEventosLuna: Evento[] = [
  {
    id: 'evt-prestador-2',
    petId: 'pet-luna',
    tipo: 'SESSAO_REGISTRADA',
    titulo: 'Sessão de adestramento — sentar, deitar e ficar',
    descricao: 'Luna praticou os comandos básicos. Excelente evolução!',
    autorId: 'usr-joao',
    criadoEm: '2026-03-08T11:00:00Z',
  },
  {
    id: 'evt-prestador-1',
    petId: 'pet-luna',
    tipo: 'VISITA_REGISTRADA',
    titulo: 'Passeio realizado no Parque Ibirapuera',
    descricao: 'Duração: 45 minutos. Luna se socializou com outros cães.',
    autorId: 'usr-pedro',
    criadoEm: '2026-03-07T09:30:00Z',
  },
  {
    id: 'evt-10',
    petId: 'pet-luna',
    tipo: 'SOLICITACAO_CRIADA',
    titulo: 'Solicitação de alteração de guarda criada',
    descricao: 'Ana Souza solicitou alteração de guarda. Aguardando confirmação. Expira em 48h.',
    autorId: 'usr-ana',
    criadoEm: '2026-02-28T10:00:00Z',
  },
  {
    id: 'evt-9',
    petId: 'pet-luna',
    tipo: 'MEDICAMENTO_ADMINISTRADO',
    titulo: 'Bravecto administrado',
    descricao: 'Dose administrada por Ana Souza às 08:00.',
    autorId: 'usr-ana',
    criadoEm: '2026-01-28T08:00:00Z',
  },
  {
    id: 'evt-8',
    petId: 'pet-luna',
    tipo: 'SOLICITACAO_APROVADA',
    titulo: 'Solicitação de alteração de guarda aprovada',
    descricao: 'Ana Souza aprovou a solicitação de Carlos Lima.',
    autorId: 'usr-ana',
    criadoEm: '2026-01-08T14:00:00Z',
  },
  {
    id: 'evt-7',
    petId: 'pet-luna',
    tipo: 'VACINA_REGISTRADA',
    titulo: 'Vacina registrada: Gripe (Bordetella)',
    descricao: 'Aplicada em 15/11/2025 pela Dra. Camila Torres.',
    autorId: 'usr-carlos',
    criadoEm: '2025-11-15T10:00:00Z',
  },
  {
    id: 'evt-6',
    petId: 'pet-luna',
    tipo: 'VACINA_REGISTRADA',
    titulo: 'Vacina registrada: Antirrábica',
    descricao: 'Aplicada em 20/08/2025 pelo Dr. Roberto Silva na Clínica VetCare.',
    autorId: 'usr-carlos',
    criadoEm: '2025-08-20T10:00:00Z',
  },
  {
    id: 'evt-5',
    petId: 'pet-luna',
    tipo: 'PLANO_SAUDE_ATUALIZADO',
    titulo: 'Plano de saúde registrado',
    descricao: 'Plano PetPrev Premium ativado.',
    autorId: 'usr-ana',
    criadoEm: '2025-06-05T10:00:00Z',
  },
  {
    id: 'evt-4',
    petId: 'pet-luna',
    tipo: 'TUTOR_ADICIONADO',
    titulo: 'Tutor adicionado: Carlos Lima',
    descricao: 'Carlos Lima foi vinculado como tutor principal de Luna.',
    autorId: 'usr-ana',
    criadoEm: '2025-06-05T10:00:00Z',
  },
  {
    id: 'evt-3',
    petId: 'pet-luna',
    tipo: 'VACINA_REGISTRADA',
    titulo: 'Vacina registrada: V10 (Déctupla)',
    descricao: 'Aplicada em 10/04/2025 pelo Dr. Roberto Silva na Clínica VetCare.',
    autorId: 'usr-ana',
    criadoEm: '2025-04-10T10:00:00Z',
  },
  {
    id: 'evt-1',
    petId: 'pet-luna',
    tipo: 'PET_CRIADO',
    titulo: 'Luna cadastrada no MITRA',
    descricao: 'Pet adicionado ao sistema por Ana Souza.',
    autorId: 'usr-ana',
    criadoEm: '2025-06-01T10:00:00Z',
  },
];

// ─── Pets ─────────────────────────────────────────
export const mockPets: Pet[] = [
  {
    id: 'pet-luna',
    codigoPet: 'LUN4XK',
    nome: 'Luna',
    especie: 'CACHORRO',
    raca: 'Golden Retriever',
    genero: 'FEMEA',
    dataNascimento: '2021-03-15T00:00:00Z',
    cor: 'Dourada',
    peso: 28.5,
    altura: 55,
    microchip: '985113002345678',
    fotoUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=200&h=200&fit=crop&auto=format',
    brincadeiraFavorita: 'Cabo de guerra',
    petiscoFavorito: 'Bifinho de frango',
    airTagUrl: 'https://findmy.apple.com/',
    status: 'ATIVO',
    criadoEm: '2025-06-01T10:00:00Z',
    meuRole: 'TUTOR_PRINCIPAL',
    tipoGuarda: 'SEPARADA',
    guardaAtual: mockGuardasLuna[0],
    proximaVacina: mockVacinasLuna[2],
    medicamentosAtivos: 1,
    petUsuarios: mockPetUsuariosLuna,
  },
  {
    id: 'pet-mochi',
    codigoPet: 'MCH7YP',
    nome: 'Mochi',
    especie: 'GATO',
    raca: 'Ragdoll',
    genero: 'MACHO',
    dataNascimento: '2022-07-20T00:00:00Z',
    cor: 'Cinza e branco',
    peso: 5.2,
    altura: 28,
    fotoUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200&h=200&fit=crop&auto=format',
    brincadeiraFavorita: 'Bola de papel',
    petiscoFavorito: 'Petisco de atum',
    status: 'ATIVO',
    criadoEm: '2025-10-01T10:00:00Z',
    meuRole: 'TUTOR_PRINCIPAL',
    guardaAtual: null,
    proximaVacina: null,
    medicamentosAtivos: 0,
    petUsuarios: mockPetUsuariosMochi,
  },
];

// ─── VisitantePets (Beatriz acompanha Mochi) ─────

export const mockVisitantePets: VisitantePet[] = [
  {
    id: 'pet-mochi',
    nome: 'Mochi',
    especie: 'GATO',
    raca: 'Ragdoll',
    fotoUrl: mockPets[1].fotoUrl,
    dataNascimento: mockPets[1].dataNascimento,
    permissoesVisualizacao: [
      'DADOS_BASICOS',
      'STATUS_SAUDE',
      'HISTORICO_VACINACAO',
      'TIMELINE_ATUALIZACOES',
    ],
    relacao: 'Amiga da família',
    petVisitanteId: 'pv-1',
  },
];

// ─── Dashboard Luna ───────────────────────────────
export const mockDashboardLuna: DashboardData = {
  pet: mockPets[0],
  alertas: {
    vacinaVencendo: true,
    solicitacoesPendentes: 1,
  },
  hoje: {
    proximaVacina: mockVacinasLuna[2],
    proximoMedicamento: mockMedicamentosLuna[0],
    guardaAtual: mockGuardasLuna[0],
  },
  atividadeRecente: mockEventosLuna.slice(0, 5),
};

// ─── Dashboard Mochi ──────────────────────────────
export const mockDashboardMochi: DashboardData = {
  pet: mockPets[1],
  alertas: {
    vacinaVencendo: false,
    solicitacoesPendentes: 0,
  },
  hoje: {
    proximaVacina: null,
    proximoMedicamento: null,
    guardaAtual: null,
  },
  atividadeRecente: [
    {
      id: 'evt-mochi-1',
      petId: 'pet-mochi',
      tipo: 'PET_CRIADO',
      titulo: 'Mochi cadastrado no MITRA',
      descricao: 'Pet adicionado ao sistema por Ana Souza.',
      autorId: 'usr-ana',
      criadoEm: '2025-10-01T10:00:00Z',
    },
  ],
};

// ─── Notificações ─────────────────────────────────
export const mockNotificacoes: Notificacao[] = [
  {
    id: 'not-1',
    usuarioId: 'usr-ana',
    tipo: 'SOLICITACAO_RECEBIDA',
    titulo: 'Nova solicitação de alteração de guarda',
    mensagem: 'Carlos Lima solicitou alteração de guarda de Luna. Você tem 48h para responder.',
    lida: false,
    deepLink: '/pets/pet-luna/guarda',
    criadoEm: '2026-02-28T10:00:00Z',
  },
  {
    id: 'not-2',
    usuarioId: 'usr-ana',
    tipo: 'VACINA_LEMBRETE',
    titulo: 'Vacina vencendo em breve',
    mensagem: 'A vacina Gripe (Bordetella) de Luna tem dose prevista para 15/05/2026.',
    lida: false,
    deepLink: '/pets/pet-luna/saude',
    criadoEm: '2026-02-27T08:00:00Z',
  },
];
