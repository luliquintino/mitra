import axios from 'axios';
import {
  mockAuth,
  mockPetsApi,
  mockHealthApi,
  mockCustodyApi,
  mockEventsApi,
  mockGovernanceApi,
  mockNotificationsApi,
  mockUsersApi,
  mockCompromissosApi,
  mockRegistrosApi,
  mockPrestadoresApi,
  mockVisitantesApi,
  mockAccessLogsApi,
  mockCheckInApi,
} from './mock-api';
import { apiConfig, featureConfig } from './config';

const API_URL = apiConfig.baseUrl;
const FORCE_MOCK = featureConfig.enableMockFallback;

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: apiConfig.requestTimeout,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('mitra_access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = localStorage.getItem('mitra_refresh_token');
        if (!refreshToken) throw new Error('No refresh token');
        const { data } = await axios.post(`${API_URL}/auth/refresh`, null, {
          headers: { Authorization: `Bearer ${refreshToken}` },
        });
        localStorage.setItem('mitra_access_token', data.accessToken);
        localStorage.setItem('mitra_refresh_token', data.refreshToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('mitra_access_token');
          localStorage.removeItem('mitra_refresh_token');
          localStorage.removeItem('mitra_user');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  },
);

// ─── Fallback automático para mock quando backend está offline ───────────────

async function tryReal<T>(
  realFn: () => Promise<{ data: T }>,
  mockFn: () => Promise<T>,
): Promise<{ data: T }> {
  if (FORCE_MOCK) return { data: await mockFn() };
  try {
    return await realFn();
  } catch (err: any) {
    const status = err?.response?.status;
    const isNetworkError =
      err?.code === 'ERR_NETWORK' ||
      err?.code === 'ECONNREFUSED' ||
      err?.code === 'ERR_CONNECTION_REFUSED' ||
      err?.message?.includes('Network Error') ||
      err?.message?.includes('timeout') ||
      err?.message?.includes('ECONNREFUSED') ||
      !err?.response;
    // Also fallback when backend is unreachable (404 from wrong server, 502, 503)
    const isBackendUnavailable = status === 404 || status === 502 || status === 503;
    if (isNetworkError || isBackendUnavailable) return { data: await mockFn() };
    throw err;
  }
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authApi = {
  login: (email: string, senha: string) =>
    tryReal(
      () => api.post('/auth/login', { email, senha }),
      () => mockAuth.login(email, senha),
    ),
  register: (data: { nome: string; email: string; senha: string; telefone?: string; tipoUsuario?: string; dadosProfissionais?: Record<string, unknown> }) =>
    tryReal(
      () => api.post('/auth/register', data),
      () => mockAuth.register(data),
    ),
  logout: () =>
    tryReal(
      () => api.post('/auth/logout'),
      () => mockAuth.logout(),
    ),
  me: () =>
    tryReal(
      () => api.get('/auth/me'),
      () => mockAuth.me(),
    ),
};

// ─── Pets ─────────────────────────────────────────────────────────────────────

export const petsApi = {
  list: () =>
    tryReal(
      () => api.get('/pets'),
      () => mockPetsApi.list(),
    ),
  get: (id: string) =>
    tryReal(
      () => api.get(`/pets/${id}`),
      () => mockPetsApi.get(id),
    ),
  dashboard: (id: string) =>
    tryReal(
      () => api.get(`/pets/${id}/dashboard`),
      () => mockPetsApi.dashboard(id),
    ),
  create: (data: any) =>
    tryReal(
      () => api.post('/pets', data),
      () => mockPetsApi.create(data),
    ),
  update: (id: string, data: any) =>
    tryReal(
      () => api.put(`/pets/${id}`, data),
      () => mockPetsApi.update(id, data),
    ),
  findByCodigo: (codigo: string) =>
    tryReal(
      () => api.get(`/pets/codigo/${codigo}`),
      () => mockPetsApi.findByCodigo(codigo),
    ),
  vincularByCodigo: (codigo: string, role: string) =>
    tryReal(
      () => api.post(`/pets/codigo/${codigo}/vincular`, { role }),
      () => mockPetsApi.vincularByCodigo(codigo, role),
    ),
  invitePrestador: (petId: string, email: string, permissoes?: string[]) =>
    api.post(`/pets/${petId}/prestadores/convidar`, { email, permissoes }),
  listPrestadores: (petId: string) =>
    api.get(`/pets/${petId}/prestadores`),
  revokePrestador: (petId: string, prestadorId: string) =>
    api.delete(`/pets/${petId}/prestadores/${prestadorId}`),
  // Visitantes
  inviteVisitante: (petId: string, data: { email: string; relacao?: string; permissoes?: string[]; dataValidade?: string }) =>
    api.post(`/pets/${petId}/visitantes/convidar`, data),
  listVisitantes: (petId: string) =>
    api.get(`/pets/${petId}/visitantes`),
  revokeVisitante: (petId: string, visitanteId: string) =>
    api.delete(`/pets/${petId}/visitantes/${visitanteId}`),
  updateVisitantePermissions: (petId: string, visitanteId: string, permissoes: string[]) =>
    api.patch(`/pets/${petId}/visitantes/${visitanteId}/permissoes`, { permissoes }),
  // Prestador permissions
  getPrestadorPermissoes: (petId: string, userId: string) =>
    tryReal(
      () => api.get(`/pets/${petId}/prestadores/${userId}/permissoes-saude`),
      () => mockPrestadoresApi.getPrestadorPermissoes(petId, userId),
    ),
  updatePrestadorPermissoes: (petId: string, userId: string, permissoes: string[]) =>
    tryReal(
      () => api.patch(`/pets/${petId}/prestadores/${userId}/permissoes-saude`, { permissoes }),
      () => mockPrestadoresApi.updatePrestadorPermissoes(petId, userId, permissoes),
    ),
};

// ─── Health ───────────────────────────────────────────────────────────────────

export const healthApi = {
  vacinas: (petId: string) =>
    tryReal(
      () => api.get(`/pets/${petId}/health/vacinas`),
      () => mockHealthApi.vacinas(petId),
    ),
  createVacina: (petId: string, data: any) =>
    tryReal(
      () => api.post(`/pets/${petId}/health/vacinas`, data),
      () => mockHealthApi.createVacina(petId, data),
    ),
  medicamentos: (petId: string) =>
    tryReal(
      () => api.get(`/pets/${petId}/health/medicamentos`),
      () => mockHealthApi.medicamentos(petId),
    ),
  createMedicamento: (petId: string, data: any) =>
    tryReal(
      () => api.post(`/pets/${petId}/health/medicamentos`, data),
      () => mockHealthApi.createMedicamento(petId, data),
    ),
  administrar: (petId: string, medId: string, data?: any) =>
    tryReal(
      () => api.post(`/pets/${petId}/health/medicamentos/${medId}/administrar`, data || {}),
      () => mockHealthApi.administrar(petId, medId, data),
    ),
  sintomas: (petId: string) =>
    tryReal(
      () => api.get(`/pets/${petId}/health/sintomas`),
      () => mockHealthApi.sintomas(petId),
    ),
  createSintoma: (petId: string, data: any) =>
    tryReal(
      () => api.post(`/pets/${petId}/health/sintomas`, data),
      () => mockHealthApi.createSintoma(petId, data),
    ),
  planoSaude: (petId: string) =>
    tryReal(
      () => api.get(`/pets/${petId}/health/plano-saude`),
      () => mockHealthApi.planoSaude(petId),
    ),
  upsertPlano: (petId: string, data: any) =>
    tryReal(
      () => api.put(`/pets/${petId}/health/plano-saude`, data),
      () => mockHealthApi.upsertPlano(petId, data),
    ),
  // ─── Carteira de Vacinacao ───────────────────────────
  recomendacoesVacina: (petId: string) =>
    tryReal(
      () => api.get(`/pets/${petId}/health/recomendacoes-vacina`),
      () => mockHealthApi.recomendacoesVacina(petId),
    ),
  recomendarVacina: (petId: string, data: { nomeVacina: string; nota?: string }) =>
    tryReal(
      () => api.post(`/pets/${petId}/health/recomendacoes-vacina`, data),
      () => mockHealthApi.recomendarVacina(petId, data),
    ),
  removerRecomendacao: (petId: string, recId: string) =>
    tryReal(
      () => api.delete(`/pets/${petId}/health/recomendacoes-vacina/${recId}`),
      () => mockHealthApi.removerRecomendacao(petId, recId),
    ),
  agendamentosVacina: (petId: string) =>
    tryReal(
      () => api.get(`/pets/${petId}/health/agendamentos-vacina`),
      () => mockHealthApi.agendamentosVacina(petId),
    ),
  agendarVacina: (petId: string, data: { nomeVacina: string; dataAgendada: string }) =>
    tryReal(
      () => api.post(`/pets/${petId}/health/agendamentos-vacina`, data),
      () => mockHealthApi.agendarVacina(petId, data),
    ),
  confirmarAgendamento: (petId: string, agId: string) =>
    tryReal(
      () => api.patch(`/pets/${petId}/health/agendamentos-vacina/${agId}/confirmar`),
      () => mockHealthApi.confirmarAgendamento(petId, agId),
    ),
  cancelarAgendamento: (petId: string, agId: string) =>
    tryReal(
      () => api.patch(`/pets/${petId}/health/agendamentos-vacina/${agId}/cancelar`),
      () => mockHealthApi.cancelarAgendamento(petId, agId),
    ),
  lembrarTutorVacina: (petId: string, nomeVacina: string) =>
    tryReal(
      () => api.post(`/pets/${petId}/health/vacinas/lembrar`, { nomeVacina }),
      () => mockHealthApi.lembrarTutorVacina(petId, nomeVacina),
    ),

  // ─── Mural Posts ───────────────────────────────────
  getMuralPosts: (petId: string) =>
    tryReal(
      () => api.get(`/pets/${petId}/saude/mural`),
      () => mockHealthApi.getMuralPosts(petId),
    ),

  createMuralPost: (petId: string, data: { texto?: string; fotos: string[] }) =>
    tryReal(
      () => api.post(`/pets/${petId}/saude/mural`, data),
      () => mockHealthApi.createMuralPost(petId, data),
    ),

  addReaction: (petId: string, postId: string, emoji: string) =>
    tryReal(
      () => api.post(`/pets/${petId}/saude/mural/${postId}/reactions`, { emoji }),
      () => mockHealthApi.addReaction(petId, postId, emoji),
    ),
};

// ─── Custody ──────────────────────────────────────────────────────────────────

export const custodyApi = {
  guardas: (petId: string) =>
    tryReal(
      () => api.get(`/pets/${petId}/custody/guardas`),
      () => mockCustodyApi.guardas(petId),
    ),
  solicitacoes: (petId: string) =>
    tryReal(
      () => api.get(`/pets/${petId}/custody/solicitacoes`),
      () => mockCustodyApi.solicitacoes(petId),
    ),
  criar: (petId: string, data: any) =>
    tryReal(
      () => api.post(`/pets/${petId}/custody/solicitacoes`, data),
      () => mockCustodyApi.criar(petId, data),
    ),
  responder: (petId: string, id: string, tipo: 'APROVAR' | 'RECUSAR' | 'SUGERIR', mensagem?: string) =>
    tryReal(
      () => api.post(`/pets/${petId}/custody/solicitacoes/${id}/responder`, { aprovada: tipo === 'APROVAR', sugestao: tipo === 'SUGERIR' ? mensagem : undefined, mensagem }),
      () => mockCustodyApi.responder(petId, id, tipo, mensagem),
    ),
  temporarias: (petId: string) =>
    tryReal(
      () => api.get(`/pets/${petId}/custody/temporarias`),
      () => mockCustodyApi.temporarias(petId),
    ),
  criarTemporaria: (petId: string, data: any) =>
    tryReal(
      () => api.post(`/pets/${petId}/custody/temporarias`, data),
      () => mockCustodyApi.criarTemporaria(petId, data),
    ),
  confirmarTemporaria: (petId: string, id: string) =>
    tryReal(
      () => api.patch(`/pets/${petId}/custody/temporarias/${id}/confirmar`),
      () => mockCustodyApi.confirmarTemporaria(petId, id),
    ),
  cancelarTemporaria: (petId: string, id: string) =>
    tryReal(
      () => api.patch(`/pets/${petId}/custody/temporarias/${id}/cancelar`),
      () => mockCustodyApi.cancelarTemporaria(petId, id),
    ),
};

// ─── Events ───────────────────────────────────────────────────────────────────

export const eventsApi = {
  historico: (petId: string) =>
    tryReal(
      () => api.get(`/pets/${petId}/events/historico`),
      () => mockEventsApi.historico(petId),
    ),
};

// ─── Compromissos ─────────────────────────────────────────────────────────────

export const compromissosApi = {
  list: (petId: string) =>
    tryReal(
      () => api.get(`/pets/${petId}/compromissos`),
      () => mockCompromissosApi.list(petId),
    ),
  create: (petId: string, data: any) =>
    tryReal(
      () => api.post(`/pets/${petId}/compromissos`, data),
      () => mockCompromissosApi.create(petId, data),
    ),
  update: (petId: string, id: string, data: any) =>
    tryReal(
      () => api.patch(`/pets/${petId}/compromissos/${id}`, data),
      () => mockCompromissosApi.update(petId, id, data),
    ),
  remove: (petId: string, id: string) =>
    tryReal(
      () => api.delete(`/pets/${petId}/compromissos/${id}`),
      () => mockCompromissosApi.remove(petId, id),
    ),
};

// ─── Governance ───────────────────────────────────────────────────────────────

export const governanceApi = {
  tutores: (petId: string) =>
    tryReal(
      () => api.get(`/pets/${petId}/governance/tutores`),
      () => mockGovernanceApi.tutores(petId),
    ),
  adicionarTutor: (petId: string, email: string, role: string) =>
    tryReal(
      () => api.post(`/pets/${petId}/governance/tutores`, { email, role }),
      () => mockGovernanceApi.adicionarTutor(petId, email, role),
    ),
  removerTutor: (petId: string, tutorId: string) =>
    tryReal(
      () => api.delete(`/pets/${petId}/governance/tutores/${tutorId}`),
      () => Promise.resolve({ data: { mensagem: 'Mock: tutor removido' } }),
    ),
  arquivar: (petId: string, justificativa: string) =>
    tryReal(
      () => api.post(`/pets/${petId}/governance/arquivar`, { justificativa }),
      () => mockGovernanceApi.arquivar(petId, justificativa),
    ),
  updateApresentacao: (petId: string, apresentacao: string) =>
    tryReal(
      () => api.put(`/pets/${petId}/governance/apresentacao`, { apresentacao }),
      () => mockGovernanceApi.updateApresentacao(petId, apresentacao),
    ),
};

// ─── Notifications ────────────────────────────────────────────────────────────

export const notificationsApi = {
  list: () =>
    tryReal(
      () => api.get('/notifications'),
      () => mockNotificationsApi.list(),
    ),
  count: () =>
    tryReal(
      () => api.get('/notifications/count'),
      () => mockNotificationsApi.count(),
    ),
  read: (id: string) =>
    tryReal(
      () => api.patch(`/notifications/${id}/read`),
      () => mockNotificationsApi.read(id),
    ),
  readAll: () =>
    tryReal(
      () => api.post('/notifications/read-all'),
      () => mockNotificationsApi.readAll(),
    ),
};

// ─── Prestadores ──────────────────────────────────────────────────────────────

export const prestadoresApi = {
  listPets: () =>
    tryReal(
      () => api.get('/prestadores/pets'),
      () => mockPrestadoresApi.listPets(),
    ),
  getPet: (petId: string) =>
    tryReal(
      () => api.get(`/prestadores/pets/${petId}`),
      () => mockPrestadoresApi.getPet(petId),
    ),
  acceptInvite: (petPrestadorId: string) =>
    api.post(`/prestadores/convites/${petPrestadorId}/aceitar`),
  rejectInvite: (petPrestadorId: string) =>
    api.post(`/prestadores/convites/${petPrestadorId}/recusar`),
};

// ─── Visitantes ──────────────────────────────────────────────────────────────

export const visitantesApi = {
  listPets: () =>
    tryReal(
      () => api.get('/visitantes/pets'),
      () => mockVisitantesApi.listPets(),
    ),
  listConvites: () =>
    tryReal(
      () => api.get('/visitantes/convites'),
      () => mockVisitantesApi.listConvites(),
    ),
  acceptInvite: (id: string) =>
    tryReal(
      () => api.put(`/visitantes/convites/${id}/aceitar`),
      () => mockVisitantesApi.acceptInvite(id),
    ),
  rejectInvite: (id: string) =>
    tryReal(
      () => api.put(`/visitantes/convites/${id}/recusar`),
      () => mockVisitantesApi.rejectInvite(id),
    ),
  selfRevoke: (petId: string) =>
    tryReal(
      () => api.delete(`/visitantes/pets/${petId}/sair`),
      () => mockVisitantesApi.selfRevoke(petId),
    ),
};

// ─── Users ────────────────────────────────────────────────────────────────────

export const usersApi = {
  updateProfile: (data: Record<string, unknown>) =>
    tryReal(
      () => api.put('/users/profile', data),
      () => mockUsersApi.updateProfile(data as any),
    ),
  feedback: (tipo: string, mensagem: string) =>
    tryReal(
      () => api.post('/users/feedback', { tipo, mensagem }),
      () => mockUsersApi.feedback(tipo, mensagem),
    ),
};

// ─── Registros (Prestador / Visitante) ────────────────────────────────────────

export const registrosApi = {
  create: (petId: string, data: import('@/types').Registro) =>
    tryReal(
      () => api.post(`/pets/${petId}/registros`, data),
      () => mockRegistrosApi.create(petId, data),
    ),
  listMeus: (petId: string) =>
    tryReal(
      () => api.get(`/pets/${petId}/registros/meus`),
      () => mockRegistrosApi.listMeus(petId),
    ),
};

// ─── Access Logs (F10) ──────────────────────────────────────────────────────

export const accessLogsApi = {
  list: (petId: string) =>
    tryReal(
      () => api.get(`/pets/${petId}/access-logs`),
      () => mockAccessLogsApi.list(petId),
    ),
};

// ─── Check-in Sessions (F11) ────────────────────────────────────────────────

export const checkInApi = {
  list: (petId: string) =>
    tryReal(
      () => api.get(`/pets/${petId}/check-in`),
      () => mockCheckInApi.list(petId),
    ),
  checkIn: (petId: string) =>
    tryReal(
      () => api.post(`/pets/${petId}/check-in`),
      () => mockCheckInApi.checkIn(petId),
    ),
  checkOut: (petId: string, sessionId: string, observacoes?: string, fotos?: string[]) =>
    tryReal(
      () => api.put(`/pets/${petId}/check-in/${sessionId}/check-out`, { observacoes, fotos }),
      () => mockCheckInApi.checkOut(petId, sessionId, observacoes, fotos),
    ),
  getActive: (petId: string) =>
    tryReal(
      () => api.get(`/pets/${petId}/check-in/active`),
      () => mockCheckInApi.getActive(petId),
    ),
};
