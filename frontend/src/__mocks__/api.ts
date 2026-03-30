/**
 * Mock of all API modules for frontend tests.
 * Import this in test files: jest.mock('@/lib/api')
 */

export const authApi = {
  login: jest.fn(),
  register: jest.fn(),
  logout: jest.fn(),
  me: jest.fn(),
};

export const petsApi = {
  list: jest.fn(),
  get: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  getDashboard: jest.fn(),
  findByCodigo: jest.fn(),
  vincularByCodigo: jest.fn(),
};

export const healthApi = {
  listVacinas: jest.fn(),
  createVacina: jest.fn(),
  listMedicamentos: jest.fn(),
  createMedicamento: jest.fn(),
  administrarMedicamento: jest.fn(),
  listSintomas: jest.fn(),
  createSintoma: jest.fn(),
  getPlanoSaude: jest.fn(),
  upsertPlanoSaude: jest.fn(),
  getMuralPosts: jest.fn(),
  createMuralPost: jest.fn(),
  addReaction: jest.fn(),
  removeReaction: jest.fn(),
};

export const custodyApi = {
  getGuardas: jest.fn(),
  getSolicitacoes: jest.fn(),
  criarSolicitacao: jest.fn(),
  responderSolicitacao: jest.fn(),
  getTemporarias: jest.fn(),
  criarTemporaria: jest.fn(),
  confirmarTemporaria: jest.fn(),
  cancelarTemporaria: jest.fn(),
};

export const compromissosApi = {
  list: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

export const governanceApi = {
  getTutores: jest.fn(),
  adicionarTutor: jest.fn(),
  getSolicitacoes: jest.fn(),
  responderSolicitacao: jest.fn(),
  arquivarPet: jest.fn(),
  reativarPet: jest.fn(),
};

export const eventsApi = {
  getHistorico: jest.fn(),
  historicoByPet: jest.fn(),
  getAccessLogs: jest.fn(),
};

export const notificationsApi = {
  list: jest.fn(),
  count: jest.fn(),
  markAsRead: jest.fn(),
  markAllAsRead: jest.fn(),
};

export const usersApi = {
  updateProfile: jest.fn(),
  changeAccountType: jest.fn(),
  submitFeedback: jest.fn(),
};

export const registrosApi = {
  create: jest.fn(),
  listMeus: jest.fn(),
};

export const prestadoresApi = {
  listPets: jest.fn(),
  getPet: jest.fn(),
  getPermissoesSaude: jest.fn(),
};

export const visitantesApi = {
  listPets: jest.fn(),
  listConvites: jest.fn(),
  aceitarConvite: jest.fn(),
  recusarConvite: jest.fn(),
};

export const checkInApi = {
  getActiveSession: jest.fn(),
  checkIn: jest.fn(),
  checkOut: jest.fn(),
};

export const petPrestadoresApi = {
  convidar: jest.fn(),
  list: jest.fn(),
  aceitar: jest.fn(),
  recusar: jest.fn(),
  revogar: jest.fn(),
};

export const petVisitantesApi = {
  convidar: jest.fn(),
  list: jest.fn(),
  revogar: jest.fn(),
  updatePermissoes: jest.fn(),
};
