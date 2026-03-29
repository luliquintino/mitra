export interface Usuario {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  avatarUrl?: string;
  criadoEm: string;
  // Tipo de usuário no sistema
  tipoUsuario?: 'TUTOR' | 'PRESTADOR' | 'AMBOS';
  // Perfil enriquecido (deprecated, mantido para compatibilidade)
  tipoConta?: 'TUTOR' | 'PRESTADOR' | 'VISITANTE';
  bio?: string;
  // Campos de prestador de serviços
  profissao?: string;
  crmv?: string;
  descricaoServicos?: string;
  areaAtuacao?: string;
  site?: string;
}

export interface Pet {
  id: string;
  codigoPet?: string;
  nome: string;
  especie: 'CACHORRO' | 'GATO' | 'CAVALO' | 'PEIXE' | 'PASSARO' | 'ROEDOR' | 'COELHO' | 'REPTIL' | 'FURAO' | 'OUTRO';
  raca?: string;
  genero?: 'MACHO' | 'FEMEA';
  dataNascimento?: string;
  cor?: string;
  peso?: number;
  microchip?: string;
  fotoUrl?: string;
  status: 'ATIVO' | 'ARQUIVADO';
  observacoes?: string;
  // Personalidade & físico
  brincadeiraFavorita?: string;
  petiscoFavorito?: string;
  altura?: number; // em cm
  criadoEm: string;
  // Campos extras do findAll
  meuRole?: 'TUTOR_PRINCIPAL' | 'TUTOR_EMERGENCIA' | 'ADESTRADOR' | 'PASSEADOR' | 'VETERINARIO' | 'FAMILIAR' | 'AMIGO' | 'OUTRO';
  guardaAtual?: Guarda | null;
  proximaVacina?: Vacina | null;
  medicamentosAtivos?: number;
  petUsuarios?: PetUsuario[];
  // Guarda compartilhada
  tipoGuarda?: 'CONJUNTA' | 'SEPARADA';
  // Localização
  airTagUrl?: string;
}

export type PermissaoPrestadorSaude =
  | 'carteira' | 'vacinas' | 'medicamentos'
  | 'sintomas' | 'mural' | 'plano' | 'consultas';

export interface PetUsuario {
  id: string;
  petId: string;
  usuarioId: string;
  role: 'TUTOR_PRINCIPAL' | 'TUTOR_EMERGENCIA' | 'ADESTRADOR' | 'PASSEADOR' | 'VETERINARIO' | 'FAMILIAR' | 'AMIGO' | 'OUTRO';
  ativo: boolean;
  adicionadoEm: string;
  apresentacao?: string;
  permissoesSaude?: PermissaoPrestadorSaude[];
  usuario: Pick<Usuario, 'id' | 'nome' | 'email' | 'avatarUrl'>;
}

export interface Vacina {
  id: string;
  petId: string;
  nome: string;
  dataAplicacao: string;
  proximaDose?: string;
  veterinario?: string;
  crmv?: string;
  clinica?: string;
  lote?: string;
  observacoes?: string;
  criadoEm: string;
}

export interface Medicamento {
  id: string;
  petId: string;
  nome: string;
  dosagem: string;
  frequencia: string;
  dataInicio: string;
  dataFim?: string;
  horarios: string[];
  veterinario?: string;
  motivo?: string;
  status: 'ATIVO' | 'CONCLUIDO' | 'CANCELADO';
  observacoes?: string;
  criadoEm: string;
  administracoes?: AdministracaoMed[];
}

export interface AdministracaoMed {
  id: string;
  medicamentoId: string;
  administradoEm: string;
  administradoPor?: string;
  observacoes?: string;
}

export interface Sintoma {
  id: string;
  petId: string;
  descricao: string;
  dataInicio: string;
  dataFim?: string;
  intensidade?: number;
  observacoes?: string;
  evidencias?: string[];
  criadoEm: string;
}

export interface Compromisso {
  id: string;
  petId: string;
  titulo: string;
  tipo: 'PASSEIO' | 'CONSULTA' | 'BANHO' | 'ADESTRAMENTO' | 'CRECHE' | 'HOSPEDAGEM' | 'OUTRO';
  responsavelId?: string;
  responsavelNome?: string;
  petPrestadorId?: string;
  recorrencia: 'UNICO' | 'DIARIO' | 'SEMANAL' | 'QUINZENAL' | 'MENSAL';
  diasSemana?: number[]; // 0=Dom 1=Seg 2=Ter 3=Qua 4=Qui 5=Sex 6=Sáb
  horarioInicio?: string; // HH:mm
  horarioFim?: string;
  dataInicio: string;
  dataFim?: string;
  geraGuarda?: boolean;
  ativo: boolean;
  criadoPor?: string;
  criadoEm: string;
  // Populated
  petPrestador?: {
    id: string;
    prestador: {
      id: string;
      tipoPrestador: string;
      nomeEmpresa?: string;
      usuario: Pick<Usuario, 'id' | 'nome' | 'email' | 'avatarUrl'>;
    };
  };
}

export interface GuardaTemporaria {
  id: string;
  petId: string;
  tipo: 'PESSOA' | 'PRESTADOR';
  responsavelId?: string;
  petPrestadorId?: string;
  compromissoId?: string;
  dataInicio: string;
  dataFim: string;
  status: 'AGENDADA' | 'CONFIRMADA' | 'EM_ANDAMENTO' | 'CONCLUIDA' | 'CANCELADA';
  confirmadoEm?: string;
  observacoes?: string;
  criadoEm: string;
  // Populated
  responsavel?: Pick<Usuario, 'id' | 'nome' | 'email' | 'avatarUrl'>;
  petPrestador?: {
    id: string;
    prestador: {
      id: string;
      tipoPrestador: string;
      nomeEmpresa?: string;
      usuario: Pick<Usuario, 'id' | 'nome' | 'email' | 'avatarUrl'>;
    };
  };
  compromisso?: {
    id: string;
    titulo: string;
    tipo: string;
    recorrencia: string;
  };
}

export interface PlanoSaude {
  id: string;
  petId: string;
  operadora: string;
  numeroCartao?: string;
  plano?: string;
  dataVigencia?: string;
  dataExpiracao?: string;
  coberturas: string[];
  observacoes?: string;
}

export interface Guarda {
  id: string;
  petId: string;
  tutorId: string;
  dataInicio: string;
  dataFim?: string;
  ativa: boolean;
  observacoes?: string;
}

export interface Solicitacao {
  id: string;
  petId: string;
  solicitanteId: string;
  destinatarioId?: string;
  tipo: 'ALTERACAO_GUARDA' | 'ARQUIVAR_PET' | 'REATIVAR_PET' | 'REMOVER_TUTOR' | 'SAIDA_TUTOR';
  status: 'PENDENTE' | 'APROVADA' | 'RECUSADA' | 'EXPIRADA' | 'SUGESTAO';
  dados?: Record<string, unknown>;
  justificativa?: string;
  respostaMensagem?: string;
  expiradoEm: string;
  respondidoEm?: string;
  criadoEm: string;
  solicitante: Pick<Usuario, 'id' | 'nome' | 'email' | 'avatarUrl'>;
  destinatario?: Pick<Usuario, 'id' | 'nome' | 'email' | 'avatarUrl'>;
}

export interface Evento {
  id: string;
  petId: string;
  tipo: string;
  titulo: string;
  descricao?: string;
  dados?: Record<string, unknown>;
  autorId?: string;
  autorNome?: string;
  criadoEm: string;
}

export interface Notificacao {
  id: string;
  usuarioId: string;
  tipo: string;
  titulo: string;
  mensagem: string;
  lida: boolean;
  dados?: Record<string, unknown>;
  deepLink?: string;
  criadoEm: string;
}

export interface DashboardData {
  pet: Pet;
  alertas: {
    vacinaVencendo: boolean;
    solicitacoesPendentes: number;
  };
  hoje: {
    proximaVacina: Vacina | null;
    proximoMedicamento: Medicamento | null;
    guardaAtual: Guarda | null;
  };
  atividadeRecente: Evento[];
}

// Resumo retornado na busca por código do pet
export interface PetResumoCodigo {
  id: string;
  codigoPet: string;
  nome: string;
  especie: Pet['especie'];
  raca?: string;
  fotoUrl?: string;
  tipoGuarda?: 'CONJUNTA' | 'SEPARADA';
  tutorPrincipalCount: number;
  maxTutorPrincipal: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse extends AuthTokens {
  usuario: Usuario;
}

// ─── Visitantes ────────────────────────────────────────────────────────────────

export type PermissaoVisitante =
  | 'DADOS_BASICOS'
  | 'STATUS_SAUDE'
  | 'HISTORICO_VACINACAO'
  | 'MEDICAMENTOS'
  | 'AGENDA_CONSULTAS'
  | 'PRESTADORES_PET'
  | 'TIMELINE_ATUALIZACOES';

export interface PetVisitante {
  id: string;
  petId: string;
  visitanteId: string;
  permissoesVisualizacao: PermissaoVisitante[];
  statusVinculo: string;
  relacao?: string;
  convidadoPor: string;
  aceito: boolean;
  dataAceite?: string;
  dataFim?: string;
  criadoEm: string;
  visitante: Pick<Usuario, 'id' | 'nome' | 'email' | 'avatarUrl'>;
  pet?: Pick<Pet, 'id' | 'nome' | 'especie' | 'raca' | 'fotoUrl'>;
}

export interface VisitantePet {
  id: string;
  nome: string;
  especie: Pet['especie'];
  raca?: string;
  fotoUrl?: string;
  dataNascimento?: string;
  permissoesVisualizacao: PermissaoVisitante[];
  relacao?: string;
  petVisitanteId: string;
}

export interface ConvitePendente {
  id: string;
  petId: string;
  visitanteId: string;
  permissoesVisualizacao: PermissaoVisitante[];
  relacao?: string;
  convidadoPor: string;
  aceito: boolean;
  criadoEm: string;
  pet: Pick<Pet, 'id' | 'nome' | 'especie' | 'raca' | 'fotoUrl'>;
}

// ─────────────────────────────────────────────
// Registros de prestador / visitante
// ─────────────────────────────────────────────

export type TipoRegistro =
  | 'VISITA'
  | 'ALIMENTACAO'
  | 'CHECK_IN'
  | 'CHECK_OUT'
  | 'SESSAO'
  | 'PROGRESSO'
  | 'OBSERVACAO';

export interface Registro {
  tipo: TipoRegistro;
  titulo: string;
  descricao?: string;
  dados?: Record<string, unknown>;
}

// ─── Carteira de Vacinacao ─────────────────────────────────────────────────────

export interface RecomendacaoVacina {
  id: string;
  petId: string;
  nomeVacina: string;
  veterinarioId: string;
  veterinarioNome: string;
  nota?: string;
  criadoEm: string;
}

export interface AgendamentoVacina {
  id: string;
  petId: string;
  nomeVacina: string;
  dataAgendada: string;
  veterinarioId?: string;
  veterinarioNome?: string;
  status: 'PENDENTE' | 'CONFIRMADA' | 'REAGENDADA' | 'CANCELADA';
  criadoEm: string;
}

export interface MuralReaction {
  emoji: string;
  autorId: string;
  autorNome: string;
}

export type MuralPostType = 'TEXT' | 'PHOTO' | 'AUTO_EVENT';

export interface MuralPost {
  id: string;
  petId: string;
  autorId: string;
  autorNome: string;
  autorRole: string;
  tipo?: MuralPostType;
  texto?: string;
  fotos: string[];
  reactions?: MuralReaction[];
  criadoEm: string;
}

// F10: Access Log
export interface AccessLog {
  id: string;
  petId: string;
  usuarioId: string;
  usuarioNome: string;
  acao: string;
  criadoEm: string;
}

// F11: Check-in Session
export interface CheckInSession {
  id: string;
  petId: string;
  prestadorId: string;
  prestadorNome: string;
  tipo: string;
  inicio: string;
  fim?: string;
  duracao?: number; // minutos
  fotos?: string[];
  observacoes?: string;
}

// Novos EventoTipos suportados (complementam o tipo string em Evento)
// 'CONSULTA_REGISTRADA' | 'EXAME_ANEXADO'
// 'VISITA_REGISTRADA' | 'ALIMENTACAO_REGISTRADA'
// 'CHECK_IN_REGISTRADO' | 'CHECK_OUT_REGISTRADO'
// 'SESSAO_REGISTRADA' | 'PROGRESSO_REGISTRADO'
// 'OBSERVACAO_REGISTRADA'
