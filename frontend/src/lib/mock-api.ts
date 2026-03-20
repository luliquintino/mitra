/**
 * MITRA Mock API
 * Simula todos os endpoints do backend para rodar sem servidor.
 * Ativado automaticamente quando o backend não está disponível.
 */

import {
  mockUsuarios,
  mockPets,
  mockVacinasLuna,
  mockMedicamentosLuna,
  mockSintomasLuna,
  mockPlanoSaudeLuna,
  mockGuardasLuna,
  mockSolicitacoesLuna,
  mockEventosLuna,
  mockDashboardLuna,
  mockDashboardMochi,
  mockPetUsuariosLuna,
  mockPetUsuariosMochi,
  mockNotificacoes,
  mockCompromissosLuna,
  mockVisitantePets,
} from './mock-data';

import type {
  Vacina,
  Medicamento,
  Sintoma,
  PlanoSaude,
  Solicitacao,
  PetUsuario,
  Evento,
  Pet,
  Compromisso,
  VisitantePet,
} from '@/types';

// ─── State local (simula DB em memória) ──────────────────────────────────────

let _user = mockUsuarios[0];
let _pets = [...mockPets];
let _vacinas: Record<string, Vacina[]> = {
  'pet-luna': [...mockVacinasLuna],
  'pet-mochi': [],
};
let _medicamentos: Record<string, Medicamento[]> = {
  'pet-luna': [...mockMedicamentosLuna],
  'pet-mochi': [],
};
let _sintomas: Record<string, Sintoma[]> = {
  'pet-luna': [...mockSintomasLuna],
  'pet-mochi': [],
};
let _planos: Record<string, PlanoSaude | null> = {
  'pet-luna': { ...mockPlanoSaudeLuna },
  'pet-mochi': null,
};
let _solicitacoes: Record<string, Solicitacao[]> = {
  'pet-luna': [...mockSolicitacoesLuna],
  'pet-mochi': [],
};
let _eventos: Record<string, Evento[]> = {
  'pet-luna': [...mockEventosLuna],
  'pet-mochi': [
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
let _tutores: Record<string, PetUsuario[]> = {
  'pet-luna': [...mockPetUsuariosLuna],
  'pet-mochi': [...mockPetUsuariosMochi],
};
let _notifications = [...mockNotificacoes];
let _compromissos: Record<string, Compromisso[]> = {
  'pet-luna': [...mockCompromissosLuna],
  'pet-mochi': [],
};

let _guardasTemporarias: Record<string, any[]> = {};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function uuid() {
  return 'mock-' + Math.random().toString(36).slice(2, 10);
}

function delay<T>(data: T, ms = 350): Promise<T> {
  return new Promise((res) => setTimeout(() => res(data), ms));
}

function generateMockPetCode(): string {
  const CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += CHARSET[Math.floor(Math.random() * CHARSET.length)];
  }
  return code;
}

function addEvento(petId: string, tipo: string, titulo: string, descricao?: string) {
  const evt: Evento = {
    id: uuid(),
    petId,
    tipo,
    titulo,
    descricao,
    autorId: _user.id,
    criadoEm: new Date().toISOString(),
  };
  if (!_eventos[petId]) _eventos[petId] = [];
  _eventos[petId].unshift(evt);
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const mockAuth = {
  login: async (email: string, _senha: string) => {
    const usuario = mockUsuarios.find((u) => u.email === email) || mockUsuarios[0];
    _user = usuario;
    return delay({
      usuario,
      accessToken: 'mock_access_token_' + usuario.id,
      refreshToken: 'mock_refresh_token_' + usuario.id,
    });
  },

  register: async (data: { nome: string; email: string; senha: string; telefone?: string; tipoUsuario?: string; dadosProfissionais?: Record<string, unknown> }) => {
    const novoUsuario = {
      id: uuid(),
      nome: data.nome,
      email: data.email,
      telefone: data.telefone,
      tipoUsuario: (data.tipoUsuario as 'TUTOR' | 'PRESTADOR' | 'AMBOS') || 'TUTOR',
      criadoEm: new Date().toISOString(),
    };
    _user = novoUsuario;
    // Criar pet demo para novo usuário
    const novoPet: Pet = {
      id: uuid(),
      nome: 'Meu pet',
      especie: 'CACHORRO',
      status: 'ATIVO',
      criadoEm: new Date().toISOString(),
      meuRole: 'TUTOR_PRINCIPAL',
      medicamentosAtivos: 0,
      guardaAtual: null,
      proximaVacina: null,
      petUsuarios: [],
    };
    _pets = [novoPet];
    return delay({
      usuario: novoUsuario,
      accessToken: 'mock_access_token_new',
      refreshToken: 'mock_refresh_token_new',
    });
  },

  me: async () => {
    // After a page reload the module resets _user to Ana. Recover the real
    // user by decoding the token (format: 'mock_access_token_<userId>').
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('mitra_access_token');
      if (token?.startsWith('mock_access_token_')) {
        const userId = token.replace('mock_access_token_', '');
        const found = mockUsuarios.find((u) => u.id === userId);
        if (found) _user = found;
      }
    }
    return delay(_user);
  },

  logout: async () => delay({ message: 'Logout realizado com sucesso.' }),
};

// ─── Pets ─────────────────────────────────────────────────────────────────────

export const mockPetsApi = {
  list: async () => {
    const userId = _user.id;
    // Return only pets where the current user is linked (any role)
    const userPets = _pets.filter((pet) =>
      (_tutores[pet.id] || []).some((pu) => pu.usuarioId === userId && pu.ativo),
    );
    return delay(
      userPets.map((pet) => {
        const myVinculo = (_tutores[pet.id] || []).find((pu) => pu.usuarioId === userId);
        const tutoresPrincipais = (_tutores[pet.id] || []).filter((pu) =>
          ['TUTOR_PRINCIPAL', 'TUTOR_EMERGENCIA'].includes(pu.role),
        );
        return {
          ...pet,
          meuRole: myVinculo?.role ?? pet.meuRole,
          petUsuarios: _tutores[pet.id] || [],
          medicamentosAtivos: (_medicamentos[pet.id] || []).filter(
            (m) => m.status === 'ATIVO',
          ).length,
          proximaVacina: (_vacinas[pet.id] || [])[0] ?? null,
          // Pass tutor count for the home card avatar stack
          _tutoresPrincipaisCount: tutoresPrincipais.length,
        };
      }),
    );
  },

  get: async (id: string) => {
    const pet = _pets.find((p) => p.id === id);
    if (!pet) throw new Error('Pet não encontrado');
    const myVinculo = (_tutores[id] || []).find((pu) => pu.usuarioId === _user.id);
    return delay({
      ...pet,
      meuRole: myVinculo?.role ?? pet.meuRole,
      petUsuarios: _tutores[id] || [],
      vacinas: _vacinas[id] || [],
      medicamentos: _medicamentos[id] || [],
      sintomas: _sintomas[id] || [],
      planoSaude: _planos[id] || null,
      guardas: id === 'pet-luna' ? mockGuardasLuna : [],
    });
  },

  dashboard: async (id: string) => {
    if (id === 'pet-luna') return delay(mockDashboardLuna);
    if (id === 'pet-mochi') return delay(mockDashboardMochi);
    // Pet recém-criado: dashboard vazio
    return delay({
      alertas: [],
      hoje: {
        proximoMedicamento: null,
        proximaVacina: null,
        guardaAtual: null,
      },
      atividadeRecente: _eventos[id]?.slice(0, 5) || [],
    });
  },

  create: async (data: any) => {
    const novo: Pet = {
      id: uuid(),
      codigoPet: generateMockPetCode(),
      nome: data.nome,
      especie: data.especie,
      raca: data.raca,
      genero: data.genero,
      dataNascimento: data.dataNascimento,
      cor: data.cor,
      peso: data.peso ? parseFloat(data.peso) : undefined,
      microchip: data.microchip,
      fotoUrl: data.fotoUrl || undefined,
      status: 'ATIVO',
      observacoes: data.observacoes,
      tipoGuarda: data.tipoGuarda || undefined,
      criadoEm: new Date().toISOString(),
      meuRole: 'TUTOR_PRINCIPAL',
      medicamentosAtivos: 0,
      guardaAtual: null,
      proximaVacina: null,
      petUsuarios: [
        {
          id: uuid(),
          petId: 'novo-pet',
          usuarioId: _user.id,
          role: 'TUTOR_PRINCIPAL',
          ativo: true,
          adicionadoEm: new Date().toISOString(),
          usuario: { id: _user.id, nome: _user.nome, email: _user.email, avatarUrl: undefined },
        },
      ],
    };
    _pets = [novo, ..._pets];
    _vacinas[novo.id] = [];
    _medicamentos[novo.id] = [];
    _sintomas[novo.id] = [];
    _eventos[novo.id] = [];
    _tutores[novo.id] = novo.petUsuarios!;
    _planos[novo.id] = null;
    _solicitacoes[novo.id] = [];
    addEvento(novo.id, 'PET_CRIADO', `${novo.nome} cadastrado no MITRA`, 'Pet adicionado ao sistema.');
    return delay(novo);
  },

  update: async (id: string, data: any) => {
    _pets = _pets.map((p) => (p.id === id ? { ...p, ...data } : p));
    return delay(_pets.find((p) => p.id === id));
  },

  findByCodigo: async (codigo: string) => {
    const pet = _pets.find((p) => p.codigoPet?.toUpperCase() === codigo.toUpperCase());
    if (!pet) throw Object.assign(new Error(), { response: { data: { message: 'Pet não encontrado com este código.' } } });
    const tutorCount = (_tutores[pet.id] || []).filter((pu) => pu.role === 'TUTOR_PRINCIPAL').length;
    return delay({
      id: pet.id,
      codigoPet: pet.codigoPet!,
      nome: pet.nome,
      especie: pet.especie,
      raca: pet.raca,
      fotoUrl: pet.fotoUrl,
      tipoGuarda: pet.tipoGuarda,
      tutorPrincipalCount: tutorCount,
      maxTutorPrincipal: 2,
    });
  },

  vincularByCodigo: async (codigo: string, role: string) => {
    const pet = _pets.find((p) => p.codigoPet?.toUpperCase() === codigo.toUpperCase());
    if (!pet) throw Object.assign(new Error(), { response: { data: { message: 'Pet não encontrado com este código.' } } });

    const jaVinculado = (_tutores[pet.id] || []).some((pu) => pu.usuarioId === _user.id);
    if (jaVinculado) throw Object.assign(new Error(), { response: { data: { message: 'Você já está vinculado a este pet.' } } });

    if (role === 'TUTOR_PRINCIPAL') {
      const tutorCount = (_tutores[pet.id] || []).filter((pu) => pu.role === 'TUTOR_PRINCIPAL').length;
      if (tutorCount >= 2) throw Object.assign(new Error(), { response: { data: { message: 'Este pet já possui 2 tutores principais.' } } });
      if (pet.tipoGuarda !== 'CONJUNTA') throw Object.assign(new Error(), { response: { data: { message: 'Este pet não tem guarda compartilhada.' } } });
    }

    const vinculo: PetUsuario = {
      id: uuid(),
      petId: pet.id,
      usuarioId: _user.id,
      role: role as any,
      ativo: true,
      adicionadoEm: new Date().toISOString(),
      usuario: { id: _user.id, nome: _user.nome, email: _user.email, avatarUrl: undefined },
    };
    if (!_tutores[pet.id]) _tutores[pet.id] = [];
    _tutores[pet.id].push(vinculo);
    addEvento(pet.id, 'TUTOR_ADICIONADO', `${_user.nome} vinculado via código`, `Vinculado como ${role}.`);
    return delay({ vinculo, petId: pet.id, mensagem: `Vinculado a ${pet.nome} com sucesso.` });
  },
};

// ─── Health ───────────────────────────────────────────────────────────────────

export const mockHealthApi = {
  vacinas: async (petId: string) => delay(_vacinas[petId] || []),

  createVacina: async (petId: string, data: any) => {
    const nova: Vacina = {
      id: uuid(),
      petId,
      nome: data.nome,
      dataAplicacao: data.dataAplicacao,
      proximaDose: data.proximaDose,
      veterinario: data.veterinario,
      crmv: data.crmv,
      clinica: data.clinica,
      lote: data.lote,
      observacoes: data.observacoes,
      criadoEm: new Date().toISOString(),
    };
    if (!_vacinas[petId]) _vacinas[petId] = [];
    _vacinas[petId].unshift(nova);
    addEvento(petId, 'VACINA_REGISTRADA', `Vacina registrada: ${nova.nome}`, `Aplicada em ${new Date(nova.dataAplicacao).toLocaleDateString('pt-BR')}.`);
    const dataFormatada = new Date(nova.dataAplicacao).toLocaleDateString('pt-BR');
    return delay({ vacina: nova, mensagem: `Vacina "${nova.nome}" registrada em ${dataFormatada} e notificada ao outro tutor.` });
  },

  medicamentos: async (petId: string) => delay(_medicamentos[petId] || []),

  createMedicamento: async (petId: string, data: any) => {
    const novo: Medicamento = {
      id: uuid(),
      petId,
      nome: data.nome,
      dosagem: data.dosagem,
      frequencia: data.frequencia,
      dataInicio: data.dataInicio,
      horarios: data.horarios || [],
      veterinario: data.veterinario,
      motivo: data.motivo,
      status: 'ATIVO',
      criadoEm: new Date().toISOString(),
    };
    if (!_medicamentos[petId]) _medicamentos[petId] = [];
    _medicamentos[petId].unshift(novo);
    addEvento(petId, 'MEDICAMENTO_ADMINISTRADO', `Medicamento iniciado: ${novo.nome}`, `${novo.dosagem} — ${novo.frequencia}.`);
    const now = new Date();
    const hora = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return delay({ medicamento: novo, mensagem: `Medicamento "${novo.nome}" registrado às ${hora} e notificado ao outro tutor.` });
  },

  administrar: async (petId: string, medId: string, _data?: any) => {
    const med = (_medicamentos[petId] || []).find((m) => m.id === medId);
    const nome = med?.nome || 'Medicamento';
    const now = new Date();
    const hora = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    addEvento(petId, 'MEDICAMENTO_ADMINISTRADO', `${nome} administrado`, `Dose administrada por ${_user.nome} às ${hora}.`);
    return delay({ mensagem: `${nome} administrado às ${hora} e notificado ao outro tutor.` });
  },

  sintomas: async (petId: string) => delay(_sintomas[petId] || []),

  createSintoma: async (petId: string, data: any) => {
    const novo: Sintoma = {
      id: uuid(),
      petId,
      descricao: data.descricao,
      dataInicio: data.dataInicio,
      intensidade: data.intensidade,
      observacoes: data.observacoes,
      evidencias: data.evidencias?.length ? data.evidencias : undefined,
      criadoEm: new Date().toISOString(),
    };
    if (!_sintomas[petId]) _sintomas[petId] = [];
    _sintomas[petId].unshift(novo);
    addEvento(petId, 'SINTOMA_REGISTRADO', 'Sintoma registrado', novo.descricao);
    return delay({ sintoma: novo, mensagem: 'Sintoma registrado e notificado ao outro tutor.' });
  },

  planoSaude: async (petId: string) => delay(_planos[petId]),

  upsertPlano: async (petId: string, data: any) => {
    const plano: PlanoSaude = {
      id: _planos[petId]?.id || uuid(),
      petId,
      operadora: data.operadora,
      numeroCartao: data.numeroCartao,
      plano: data.plano,
      dataVigencia: data.dataVigencia,
      dataExpiracao: data.dataExpiracao,
      coberturas: data.coberturas || [],
      observacoes: data.observacoes,
    };
    _planos[petId] = plano;
    addEvento(petId, 'PLANO_SAUDE_ATUALIZADO', 'Plano de saúde atualizado', `Operadora: ${plano.operadora}`);
    return delay({ plano, mensagem: 'Plano de saúde atualizado com sucesso.' });
  },
};

// ─── Custody ──────────────────────────────────────────────────────────────────

export const mockCustodyApi = {
  guardas: async (petId: string) => delay(petId === 'pet-luna' ? mockGuardasLuna : []),

  solicitacoes: async (petId: string) => delay(_solicitacoes[petId] || []),

  criar: async (petId: string, data: any) => {
    const nova: Solicitacao = {
      id: uuid(),
      petId,
      solicitanteId: _user.id,
      destinatarioId: data.destinatarioId,
      tipo: data.tipo || 'ALTERACAO_GUARDA',
      status: 'PENDENTE',
      justificativa: data.justificativa,
      expiradoEm: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      criadoEm: new Date().toISOString(),
      solicitante: { id: _user.id, nome: _user.nome, email: _user.email, avatarUrl: undefined },
      destinatario: (() => {
        if (!data.destinatarioId) return undefined;
        const dest = mockUsuarios.find((u) => u.id === data.destinatarioId);
        return dest ? { id: dest.id, nome: dest.nome, email: dest.email, avatarUrl: undefined } : undefined;
      })(),
    };
    if (!_solicitacoes[petId]) _solicitacoes[petId] = [];
    _solicitacoes[petId].unshift(nova);
    addEvento(petId, 'SOLICITACAO_CRIADA', 'Solicitação de alteração de guarda criada', `${_user.nome} solicitou alteração de guarda. Aguardando confirmação. Expira em 48h.`);
    return delay({ solicitacao: nova, mensagem: 'Solicitação enviada. O outro tutor tem 48h para responder.' });
  },

  responder: async (petId: string, solId: string, tipo: 'APROVAR' | 'RECUSAR' | 'SUGERIR', mensagem?: string) => {
    const novoStatus = tipo === 'APROVAR' ? 'APROVADA' : tipo === 'SUGERIR' ? 'SUGESTAO' : 'RECUSADA';
    _solicitacoes[petId] = (_solicitacoes[petId] || []).map((s) =>
      s.id === solId ? { ...s, status: novoStatus, respostaMensagem: mensagem, respondidoEm: new Date().toISOString() } : s,
    );
    const evtTipo = tipo === 'APROVAR' ? 'SOLICITACAO_APROVADA' : tipo === 'SUGERIR' ? 'SOLICITACAO_CRIADA' : 'SOLICITACAO_RECUSADA';
    const evtTitulo = tipo === 'APROVAR' ? 'Solicitação aprovada' : tipo === 'SUGERIR' ? 'Sugestão enviada' : 'Solicitação recusada';
    addEvento(petId, evtTipo, evtTitulo, mensagem || `${_user.nome} respondeu à solicitação.`);
    const hora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const msgMap = { APROVAR: `Solicitação aprovada às ${hora}. O solicitante foi notificado.`, RECUSAR: `Solicitação recusada às ${hora}. O solicitante foi notificado.`, SUGERIR: `Sugestão enviada às ${hora}. O solicitante foi notificado.` };
    return delay({ mensagem: msgMap[tipo] });
  },

  temporarias: async (petId: string) => delay(_guardasTemporarias[petId] || []),

  criarTemporaria: async (petId: string, data: any) => {
    const nova = {
      id: uuid(),
      petId,
      tipo: data.petPrestadorId ? 'PRESTADOR' as const : 'PESSOA' as const,
      responsavelId: data.responsavelId,
      petPrestadorId: data.petPrestadorId,
      dataInicio: data.dataInicio,
      dataFim: data.dataFim,
      status: 'AGENDADA' as const,
      observacoes: data.observacoes,
      criadoEm: new Date().toISOString(),
    };
    if (!_guardasTemporarias[petId]) _guardasTemporarias[petId] = [];
    _guardasTemporarias[petId].unshift(nova);
    return delay(nova);
  },

  confirmarTemporaria: async (petId: string, id: string) => {
    _guardasTemporarias[petId] = (_guardasTemporarias[petId] || []).map((g) =>
      g.id === id ? { ...g, status: 'CONFIRMADA' as const, confirmadoEm: new Date().toISOString() } : g,
    );
    return delay({ mensagem: 'Guarda confirmada.' });
  },

  cancelarTemporaria: async (petId: string, id: string) => {
    _guardasTemporarias[petId] = (_guardasTemporarias[petId] || []).map((g) =>
      g.id === id ? { ...g, status: 'CANCELADA' as const } : g,
    );
    return delay({ mensagem: 'Guarda cancelada.' });
  },
};

// ─── Events ───────────────────────────────────────────────────────────────────

export const mockEventsApi = {
  historico: async (petId: string) => {
    const eventos = _eventos[petId] || [];
    const grouped: Record<string, Evento[]> = {};
    for (const evt of eventos) {
      const key = new Date(evt.criadoEm).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(evt);
    }
    return delay({ eventos, grouped, total: eventos.length });
  },
};

// ─── Governance ───────────────────────────────────────────────────────────────

export const mockGovernanceApi = {
  tutores: async (petId: string) => delay(_tutores[petId] || []),

  adicionarTutor: async (petId: string, email: string, role: string) => {
    const usuario = mockUsuarios.find((u) => u.email === email);
    if (!usuario) throw Object.assign(new Error(), { response: { data: { message: 'Usuário não encontrado com este e-mail.' } } });
    const jaExiste = (_tutores[petId] || []).some((pu) => pu.usuarioId === usuario.id);
    if (jaExiste) throw Object.assign(new Error(), { response: { data: { message: 'Este tutor já está vinculado ao pet.' } } });
    const vinculo: PetUsuario = {
      id: uuid(),
      petId,
      usuarioId: usuario.id,
      role: role as any,
      ativo: true,
      adicionadoEm: new Date().toISOString(),
      usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, avatarUrl: undefined },
    };
    if (!_tutores[petId]) _tutores[petId] = [];
    _tutores[petId].push(vinculo);
    const roleLabelMap: Record<string, string> = { TUTOR_PRINCIPAL: 'tutor principal', TUTOR_EMERGENCIA: 'tutor de emergência', ADESTRADOR: 'adestrador', PASSEADOR: 'passeador', VETERINARIO: 'veterinário', FAMILIAR: 'familiar', AMIGO: 'amigo', OUTRO: 'outro vínculo' };
    addEvento(petId, 'TUTOR_ADICIONADO', `Pessoa adicionada: ${usuario.nome}`, `${usuario.nome} foi vinculado como ${roleLabelMap[role] || role}.`);
    return delay({ vinculo, mensagem: `${usuario.nome} adicionado como tutor com sucesso.` });
  },

  updateApresentacao: async (petId: string, apresentacao: string) => {
    if (!_tutores[petId]) return delay(null);
    _tutores[petId] = _tutores[petId].map((pu) =>
      pu.usuarioId === _user.id ? { ...pu, apresentacao } : pu,
    );
    return delay({ apresentacao });
  },

  arquivar: async (petId: string, justificativa: string) => {
    _pets = _pets.map((p) => (p.id === petId ? { ...p, status: 'ARQUIVADO' } : p));
    addEvento(petId, 'PET_ARQUIVADO', 'Pet arquivado', justificativa);
    return delay({ mensagem: 'Pet arquivado com sucesso.' });
  },
};

// ─── Notifications ────────────────────────────────────────────────────────────

export const mockNotificationsApi = {
  list: async () => delay(_notifications),
  count: async () => delay({ count: _notifications.filter((n) => !n.lida).length }),
  read: async (id: string) => {
    _notifications = _notifications.map((n) => (n.id === id ? { ...n, lida: true } : n));
    return delay({});
  },
  readAll: async () => {
    _notifications = _notifications.map((n) => ({ ...n, lida: true }));
    return delay({ mensagem: 'Todas as notificações marcadas como lidas.' });
  },
};

// ─── Compromissos ─────────────────────────────────────────────────────────────

export const mockCompromissosApi = {
  list: async (petId: string) => delay(_compromissos[petId] || []),

  create: async (petId: string, data: any) => {
    const novo: Compromisso = {
      id: uuid(),
      petId,
      titulo: data.titulo,
      tipo: data.tipo,
      responsavelId: data.responsavelId,
      responsavelNome: data.responsavelNome,
      petPrestadorId: data.petPrestadorId,
      recorrencia: data.recorrencia,
      diasSemana: data.diasSemana,
      horarioInicio: data.horarioInicio,
      horarioFim: data.horarioFim,
      dataInicio: data.dataInicio,
      dataFim: data.dataFim,
      geraGuarda: data.geraGuarda || false,
      ativo: true,
      criadoEm: new Date().toISOString(),
    };
    if (!_compromissos[petId]) _compromissos[petId] = [];
    _compromissos[petId] = [novo, ..._compromissos[petId]];
    return delay(novo);
  },

  update: async (petId: string, id: string, data: any) => {
    _compromissos[petId] = (_compromissos[petId] || []).map((c) =>
      c.id === id ? { ...c, ...data } : c,
    );
    return delay(_compromissos[petId]?.find((c) => c.id === id));
  },

  remove: async (petId: string, id: string) => {
    _compromissos[petId] = (_compromissos[petId] || []).map((c) =>
      c.id === id ? { ...c, ativo: false } : c,
    );
    return delay({ mensagem: 'Compromisso desativado.' });
  },
};

// ─── Registros (Prestador / Visitante) ───────────────────────────────────────

const EVENTO_TIPO_MAP: Record<string, string> = {
  VISITA: 'VISITA_REGISTRADA',
  ALIMENTACAO: 'ALIMENTACAO_REGISTRADA',
  CHECK_IN: 'CHECK_IN_REGISTRADO',
  CHECK_OUT: 'CHECK_OUT_REGISTRADO',
  SESSAO: 'SESSAO_REGISTRADA',
  PROGRESSO: 'PROGRESSO_REGISTRADO',
  OBSERVACAO: 'OBSERVACAO_REGISTRADA',
};

const TIPOS_REGISTRO = Object.values(EVENTO_TIPO_MAP);

export const mockRegistrosApi = {
  create: async (petId: string, data: import('@/types').Registro): Promise<Evento> => {
    const eventoTipo = EVENTO_TIPO_MAP[data.tipo] || 'OBSERVACAO_REGISTRADA';
    const evento: Evento = {
      id: `evt-reg-${Date.now()}`,
      petId,
      tipo: eventoTipo,
      titulo: data.titulo,
      descricao: data.descricao,
      dados: data.dados,
      autorId: _user?.id,
      criadoEm: new Date().toISOString(),
    };
    if (!_eventos[petId]) _eventos[petId] = [];
    _eventos[petId] = [evento, ..._eventos[petId]];
    return delay(evento);
  },

  listMeus: async (petId: string): Promise<Evento[]> => {
    const todos = _eventos[petId] || [];
    const meus = todos.filter(
      (e) => TIPOS_REGISTRO.includes(e.tipo) && e.autorId === _user?.id,
    );
    return delay(meus.slice(0, 20));
  },
};

// ─── Prestadores ─────────────────────────────────────────────────────────────

const PRESTADOR_ROLES = [
  'ADESTRADOR', 'PASSEADOR', 'VETERINARIO', 'VETERINARIA',
  'PET_SITTER', 'HOTEL', 'DAY_CARE', 'CRECHE', 'CUIDADOR', 'OUTRO',
];

export const mockPrestadoresApi = {
  listPets: async () => {
    const allTutores = Object.values(_tutores).flat();
    const myLinks = allTutores.filter(
      (t) => t.usuarioId === _user?.id && PRESTADOR_ROLES.includes(t.role),
    );
    const result = myLinks
      .map((link) => {
        const pet = _pets.find((p) => p.id === link.petId);
        if (!pet) return null;
        return { ...pet, role: link.role, permissoes: ['VISUALIZAR', 'REGISTRAR_SERVICO'] };
      })
      .filter(Boolean);
    return delay(result);
  },

  getPet: async (petId: string) => {
    const pet = _pets.find((p) => p.id === petId);
    if (!pet) throw Object.assign(new Error('Pet não encontrado'), { response: { data: { message: 'Pet não encontrado' } } });
    const link = (_tutores[petId] || []).find((t) => t.usuarioId === _user?.id);
    if (!link) throw Object.assign(new Error('Sem acesso'), { response: { data: { message: 'Você não tem acesso a este pet.' } } });
    return delay({ ...pet, role: link.role, permissoes: ['VISUALIZAR', 'REGISTRAR_SERVICO'] });
  },
};

// ─── Visitantes ──────────────────────────────────────────────────────────────

export const mockVisitantesApi = {
  listPets: async (): Promise<VisitantePet[]> => {
    // Recover user from token on page reload (same as mockAuth.me)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('mitra_access_token');
      if (token?.startsWith('mock_access_token_')) {
        const userId = token.replace('mock_access_token_', '');
        const found = mockUsuarios.find((u) => u.id === userId);
        if (found) _user = found;
      }
    }
    if (_user?.tipoConta === 'VISITANTE' || _user?.id === 'usr-beatriz') {
      return delay([...mockVisitantePets]);
    }
    return delay([]);
  },

  listConvites: async () => delay([]),

  acceptInvite: async (id: string) => delay({ id, aceito: true }),

  rejectInvite: async (id: string) => delay({ id, recusado: true }),

  selfRevoke: async (petId: string) => {
    // Remove from mock list (no-op in memory since mockVisitantePets is a const)
    return delay({ petId, removido: true });
  },
};

// ─── Users ────────────────────────────────────────────────────────────────────

export const mockUsersApi = {
  updateProfile: async (data: Partial<import('@/types').Usuario>) => {
    _user = { ..._user, ...data };
    // Persist to mockUsuarios so me() returns updated data after page reload
    const idx = mockUsuarios.findIndex((u) => u.id === _user.id);
    if (idx >= 0) mockUsuarios[idx] = _user as typeof mockUsuarios[0];
    return delay(_user);
  },
  feedback: async (_tipo: string, _mensagem: string) =>
    delay({ mensagem: 'Feedback enviado com sucesso. Obrigado!' }),
};
