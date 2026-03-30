/**
 * Shared test utilities and factories for backend tests.
 */

export function createMockUser(overrides: Record<string, any> = {}) {
  return {
    id: 'usr-test-1',
    nome: 'Test User',
    email: 'test@mitra.com',
    senhaHash: '$argon2id$v=19$m=65536,t=3,p=4$hash',
    telefone: '11999990000',
    tipoUsuario: 'TUTOR',
    avatarUrl: null,
    ativo: true,
    refreshToken: null,
    criadoEm: new Date('2025-01-01'),
    atualizadoEm: new Date('2025-01-01'),
    ...overrides,
  };
}

export function createMockPet(overrides: Record<string, any> = {}) {
  return {
    id: 'pet-test-1',
    codigoPet: 'MITRA-ABC123',
    nome: 'Luna',
    especie: 'CACHORRO',
    raca: 'Golden Retriever',
    genero: 'FEMEA',
    dataNascimento: new Date('2021-03-14'),
    cor: 'Dourada',
    peso: 28.5,
    microchip: '985113002345678',
    fotoUrl: null,
    status: 'ATIVO',
    observacoes: null,
    tipoGuarda: null,
    criadoEm: new Date('2025-01-01'),
    atualizadoEm: new Date('2025-01-01'),
    ...overrides,
  };
}

export function createMockPetUsuario(overrides: Record<string, any> = {}) {
  return {
    id: 'pu-test-1',
    petId: 'pet-test-1',
    usuarioId: 'usr-test-1',
    role: 'TUTOR_PRINCIPAL',
    ativo: true,
    adicionadoEm: new Date('2025-01-01'),
    ...overrides,
  };
}

export function createMockVacina(overrides: Record<string, any> = {}) {
  return {
    id: 'vac-test-1',
    petId: 'pet-test-1',
    nome: 'V10',
    dataAplicacao: new Date('2025-06-01'),
    proximaDose: new Date('2026-06-01'),
    veterinario: 'Dr. Carlos',
    clinica: 'Pet Clinic',
    lote: 'LOT123',
    observacoes: null,
    criadoEm: new Date('2025-06-01'),
    registradoPorId: 'usr-test-1',
    ...overrides,
  };
}

export function createMockMedicamento(overrides: Record<string, any> = {}) {
  return {
    id: 'med-test-1',
    petId: 'pet-test-1',
    nome: 'Bravecto',
    dosagem: '1 comprimido',
    frequencia: 'A cada 3 meses',
    dataInicio: new Date('2025-06-01'),
    dataFim: null,
    horarios: null,
    veterinario: 'Dr. Carlos',
    motivo: 'Antipulgas',
    observacoes: null,
    status: 'ATIVO',
    criadoEm: new Date('2025-06-01'),
    registradoPorId: 'usr-test-1',
    ...overrides,
  };
}

export function createMockSintoma(overrides: Record<string, any> = {}) {
  return {
    id: 'sin-test-1',
    petId: 'pet-test-1',
    descricao: 'Coceira nas patas',
    dataInicio: new Date('2025-06-01'),
    intensidade: 3,
    observacoes: null,
    ativo: true,
    criadoEm: new Date('2025-06-01'),
    registradoPorId: 'usr-test-1',
    ...overrides,
  };
}

export function createMockNotificacao(overrides: Record<string, any> = {}) {
  return {
    id: 'notif-test-1',
    usuarioId: 'usr-test-1',
    tipo: 'GERAL',
    titulo: 'Test Notification',
    mensagem: 'Test message',
    lida: false,
    lidaEm: null,
    dados: null,
    criadoEm: new Date('2025-06-01'),
    ...overrides,
  };
}

export function createMockEvento(overrides: Record<string, any> = {}) {
  return {
    id: 'evt-test-1',
    petId: 'pet-test-1',
    tipo: 'PET_CRIADO',
    descricao: 'Pet criado',
    dados: null,
    autorId: 'usr-test-1',
    criadoEm: new Date('2025-01-01'),
    ...overrides,
  };
}

export function createMockSolicitacao(overrides: Record<string, any> = {}) {
  return {
    id: 'sol-test-1',
    petId: 'pet-test-1',
    tipo: 'ALTERACAO_GUARDA',
    status: 'PENDENTE',
    solicitanteId: 'usr-test-1',
    destinatarioId: 'usr-test-2',
    mensagem: 'Solicitacao de teste',
    resposta: null,
    expiraEm: new Date(Date.now() + 48 * 60 * 60 * 1000),
    criadoEm: new Date(),
    respondidoEm: null,
    ...overrides,
  };
}

export function createMockCompromisso(overrides: Record<string, any> = {}) {
  return {
    id: 'comp-test-1',
    petId: 'pet-test-1',
    titulo: 'Passeio',
    tipo: 'PASSEIO',
    dataInicio: new Date('2025-07-01T09:00:00Z'),
    dataFim: new Date('2025-07-01T10:00:00Z'),
    responsavelId: 'usr-test-1',
    observacoes: null,
    recorrencia: null,
    diasSemana: null,
    ativo: true,
    criadoEm: new Date('2025-06-01'),
    ...overrides,
  };
}

export const mockTokens = {
  accessToken: 'mock.access.token',
  refreshToken: 'mock.refresh.token',
};
