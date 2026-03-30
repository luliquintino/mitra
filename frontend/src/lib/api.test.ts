/**
 * Tests for the real api module (not the mock).
 * We mock axios itself to test how the api module configures it.
 */

import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

// Mock config before importing api
jest.mock('@/lib/config', () => ({
  apiConfig: {
    baseUrl: 'http://localhost:3000/api/v1',
    requestTimeout: 4000,
  },
  featureConfig: {
    enableMockFallback: false,
  },
  notificationConfig: {
    pollingInterval: 30000,
    toastDuration: 5000,
  },
}));

// Mock the mock-api module to avoid import errors
jest.mock('./mock-api', () => ({
  mockAuth: {},
  mockPetsApi: {},
  mockHealthApi: {},
  mockCustodyApi: {},
  mockEventsApi: {},
  mockGovernanceApi: {},
  mockNotificationsApi: {},
  mockUsersApi: {},
  mockCompromissosApi: {},
  mockRegistrosApi: {},
  mockPrestadoresApi: {},
  mockVisitantesApi: {},
  mockAccessLogsApi: {},
  mockCheckInApi: {},
}));

// Capture interceptors during axios.create
const requestInterceptors: Array<(config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig> = [];
const responseInterceptors: Array<{ fulfilled: (res: any) => any; rejected: (err: any) => any }> = [];

const mockAxiosInstance = {
  interceptors: {
    request: {
      use: jest.fn((fn: any) => {
        requestInterceptors.push(fn);
      }),
    },
    response: {
      use: jest.fn((fulfilled: any, rejected: any) => {
        responseInterceptors.push({ fulfilled, rejected });
      }),
    },
  },
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
};

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    create: jest.fn(() => mockAxiosInstance),
    post: jest.fn(),
  },
}));

describe('api module', () => {
  // We need to import after mocks are set up
  let api: any;
  let authApi: any;
  let petsApi: any;
  let healthApi: any;
  let notificationsApi: any;
  let usersApi: any;
  let custodyApi: any;
  let governanceApi: any;
  let eventsApi: any;
  let compromissosApi: any;
  let prestadoresApi: any;
  let visitantesApi: any;
  let registrosApi: any;
  let accessLogsApi: any;
  let checkInApi: any;

  beforeAll(async () => {
    const mod = await import('./api');
    api = mod.api;
    authApi = mod.authApi;
    petsApi = mod.petsApi;
    healthApi = mod.healthApi;
    notificationsApi = mod.notificationsApi;
    usersApi = mod.usersApi;
    custodyApi = mod.custodyApi;
    governanceApi = mod.governanceApi;
    eventsApi = mod.eventsApi;
    compromissosApi = mod.compromissosApi;
    prestadoresApi = mod.prestadoresApi;
    visitantesApi = mod.visitantesApi;
    registrosApi = mod.registrosApi;
    accessLogsApi = mod.accessLogsApi;
    checkInApi = mod.checkInApi;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  // ─── Axios instance configuration ───────────────────────────────────────────

  it('exports api instance and all API modules', () => {
    expect(api).toBeDefined();
    expect(authApi).toBeDefined();
    expect(petsApi).toBeDefined();
    expect(healthApi).toBeDefined();
    expect(notificationsApi).toBeDefined();
    expect(usersApi).toBeDefined();
  });

  // ─── Request interceptor: token ──────────────────────────────────────────────

  it('adds Authorization header from localStorage token', () => {
    expect(requestInterceptors.length).toBeGreaterThan(0);

    localStorage.setItem('mitra_access_token', 'my-jwt-token');

    const config = {
      headers: {} as any,
    } as InternalAxiosRequestConfig;

    const result = requestInterceptors[0](config);

    expect(result.headers.Authorization).toBe('Bearer my-jwt-token');
  });

  it('does not add Authorization header when no token', () => {
    const config = {
      headers: {} as any,
    } as InternalAxiosRequestConfig;

    const result = requestInterceptors[0](config);

    expect(result.headers.Authorization).toBeUndefined();
  });

  // ─── API module exports ──────────────────────────────────────────────────────

  it('authApi exports expected functions', () => {
    expect(authApi).toBeDefined();
    expect(typeof authApi.login).toBe('function');
    expect(typeof authApi.register).toBe('function');
    expect(typeof authApi.logout).toBe('function');
    expect(typeof authApi.me).toBe('function');
  });

  it('petsApi exports expected functions', () => {
    expect(petsApi).toBeDefined();
    expect(typeof petsApi.list).toBe('function');
    expect(typeof petsApi.get).toBe('function');
    expect(typeof petsApi.create).toBe('function');
    expect(typeof petsApi.update).toBe('function');
    expect(typeof petsApi.dashboard).toBe('function');
    expect(typeof petsApi.findByCodigo).toBe('function');
    expect(typeof petsApi.vincularByCodigo).toBe('function');
  });

  it('healthApi exports expected functions', () => {
    expect(healthApi).toBeDefined();
    expect(typeof healthApi.vacinas).toBe('function');
    expect(typeof healthApi.createVacina).toBe('function');
    expect(typeof healthApi.medicamentos).toBe('function');
    expect(typeof healthApi.createMedicamento).toBe('function');
    expect(typeof healthApi.sintomas).toBe('function');
    expect(typeof healthApi.createSintoma).toBe('function');
    expect(typeof healthApi.planoSaude).toBe('function');
    expect(typeof healthApi.getMuralPosts).toBe('function');
    expect(typeof healthApi.createMuralPost).toBe('function');
  });

  it('notificationsApi exports expected functions', () => {
    expect(notificationsApi).toBeDefined();
    expect(typeof notificationsApi.list).toBe('function');
    expect(typeof notificationsApi.count).toBe('function');
    expect(typeof notificationsApi.read).toBe('function');
    expect(typeof notificationsApi.readAll).toBe('function');
  });

  it('usersApi exports expected functions', () => {
    expect(usersApi).toBeDefined();
    expect(typeof usersApi.updateProfile).toBe('function');
    expect(typeof usersApi.feedback).toBe('function');
  });

  it('custodyApi exports expected functions', () => {
    expect(custodyApi).toBeDefined();
    expect(typeof custodyApi.guardas).toBe('function');
    expect(typeof custodyApi.solicitacoes).toBe('function');
    expect(typeof custodyApi.criar).toBe('function');
    expect(typeof custodyApi.responder).toBe('function');
    expect(typeof custodyApi.temporarias).toBe('function');
  });

  it('governanceApi exports expected functions', () => {
    expect(governanceApi).toBeDefined();
    expect(typeof governanceApi.tutores).toBe('function');
    expect(typeof governanceApi.adicionarTutor).toBe('function');
    expect(typeof governanceApi.arquivar).toBe('function');
  });

  it('eventsApi exports expected functions', () => {
    expect(eventsApi).toBeDefined();
    expect(typeof eventsApi.historico).toBe('function');
  });

  it('compromissosApi exports expected functions', () => {
    expect(compromissosApi).toBeDefined();
    expect(typeof compromissosApi.list).toBe('function');
    expect(typeof compromissosApi.create).toBe('function');
    expect(typeof compromissosApi.update).toBe('function');
    expect(typeof compromissosApi.remove).toBe('function');
  });

  it('prestadoresApi exports expected functions', () => {
    expect(prestadoresApi).toBeDefined();
    expect(typeof prestadoresApi.listPets).toBe('function');
    expect(typeof prestadoresApi.getPet).toBe('function');
  });

  it('visitantesApi exports expected functions', () => {
    expect(visitantesApi).toBeDefined();
    expect(typeof visitantesApi.listPets).toBe('function');
    expect(typeof visitantesApi.listConvites).toBe('function');
    expect(typeof visitantesApi.acceptInvite).toBe('function');
    expect(typeof visitantesApi.rejectInvite).toBe('function');
  });

  it('registrosApi exports expected functions', () => {
    expect(registrosApi).toBeDefined();
    expect(typeof registrosApi.create).toBe('function');
    expect(typeof registrosApi.listMeus).toBe('function');
  });

  it('accessLogsApi exports expected functions', () => {
    expect(accessLogsApi).toBeDefined();
    expect(typeof accessLogsApi.list).toBe('function');
  });

  it('checkInApi exports expected functions', () => {
    expect(checkInApi).toBeDefined();
    expect(typeof checkInApi.list).toBe('function');
    expect(typeof checkInApi.checkIn).toBe('function');
    expect(typeof checkInApi.checkOut).toBe('function');
    expect(typeof checkInApi.getActive).toBe('function');
  });
});
