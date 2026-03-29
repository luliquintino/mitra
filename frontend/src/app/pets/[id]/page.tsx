'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  petsApi,
  healthApi,
  custodyApi,
  compromissosApi,
  governanceApi,
  eventsApi,
  checkInApi,
} from '@/lib/api';
import {
  DashboardData,
  Vacina,
  Medicamento,
  Guarda,
  Compromisso,
  Pet,
  PetUsuario,
} from '@/types';
import { formatRelative, eventoIcon, cn, daysUntilBirthday, petAgeYears, mitraMilestones } from '@/lib/utils';
import { getPersonality, getHumor, isInactive } from '@/lib/pet-personality';
import { generateTutorSmartCards, SmartCard } from '@/lib/smart-cards';
import { computeAchievements, Achievement, CATEGORY_LABELS } from '@/lib/achievements';
import { MuralPost } from '@/types';
import { CalendarMonth } from '@/components/CalendarMonth';
import { RegisterEventModal } from '@/components/RegisterEventModal';
import {
  AlertCircle,
  Calendar,
  Clock,
  Plus,
  Pill,
  Syringe,
  Activity,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Home,
  ClipboardList,
  PawPrint,
  Archive,
  Sparkles,
  Stethoscope,
  Heart,
  FileText,
  Users,
  Shield,
  Eye,
} from 'lucide-react';

// ─── Helpers ────────────────────────────────────────────────────────────────

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

function todayStr(): string {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function formatDateLabel(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const weekday = date.toLocaleDateString('pt-BR', { weekday: 'long' });
  return `${pad(d)}/${pad(m)}/${y} (${weekday})`;
}

// ─── Alert type ─────────────────────────────────────────────────────────────

type AlertItem = {
  icon: string;
  label: string;
  detail: string;
  color: string;
  bgColor: string;
  borderColor: string;
  IconComponent: React.ElementType;
};

// ─── Event tipo → Lucide icon mapping ───────────────────────────────────────

function eventLucideIcon(tipo: string) {
  const map: Record<string, React.ElementType> = {
    PET_CRIADO: PawPrint,
    PET_ARQUIVADO: Archive,
    PET_REATIVADO: Sparkles,
    VACINA_REGISTRADA: Syringe,
    VACINA_ATUALIZADA: Syringe,
    MEDICAMENTO_ADMINISTRADO: Pill,
    SINTOMA_REGISTRADO: Stethoscope,
    CONSULTA_VETERINARIA: Stethoscope,
    SAUDE_GERAL: Heart,
    COMPROMISSO_CRIADO: Calendar,
    COMPROMISSO_ATUALIZADO: Calendar,
    DOCUMENTO_ADICIONADO: FileText,
    TUTOR_ADICIONADO: Users,
    GUARDA_TRANSFERIDA: Shield,
    PERMISSAO_ATUALIZADA: Eye,
  };
  return map[tipo] || Activity;
}

function eventIconColor(tipo: string): string {
  if (tipo?.includes('VACINA')) return 'text-rose bg-rose/10';
  if (tipo?.includes('MEDICAMENTO') || tipo?.includes('SINTOMA')) return 'text-teal bg-teal/10';
  if (tipo?.includes('COMPROMISSO')) return 'text-amber bg-amber/10';
  if (tipo?.includes('GUARDA') || tipo?.includes('TUTOR')) return 'text-primary bg-primary/10';
  return 'text-info bg-info/10';
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function PetHomePage() {
  const params = useParams();
  const petId = params?.id as string;
  const { user } = useAuth();

  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [pet, setPet] = useState<Pet | null>(null);
  const [tutores, setTutores] = useState<PetUsuario[]>([]);
  const [vacinas, setVacinas] = useState<Vacina[]>([]);
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [compromissos, setCompromissos] = useState<Compromisso[]>([]);
  const [eventos, setEventos] = useState<any[]>([]);
  const [muralPosts, setMuralPosts] = useState<MuralPost[]>([]);
  const [activeCheckIn, setActiveCheckIn] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Calendar state
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string>(todayStr());

  // FAB / RegisterEventModal
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // Calendar collapsed state
  const [calendarOpen, setCalendarOpen] = useState(false);

  // ─── Data loading ──────────────────────────────────────────────────────────

  const loadData = useCallback(async () => {
    try {
      const [petRes, dashRes, tutRes, vacsRes, medsRes, compRes, evRes, muralRes] =
        await Promise.all([
          petsApi.get(petId),
          petsApi.dashboard(petId),
          governanceApi.tutores(petId),
          healthApi.vacinas(petId),
          healthApi.medicamentos(petId),
          compromissosApi.list(petId),
          eventsApi.historico(petId).catch(() => ({ data: { eventos: [] } })),
          healthApi.getMuralPosts(petId).catch(() => ({ data: [] })),
        ]);

      setPet(petRes.data as Pet);
      setDashboard(dashRes.data as DashboardData);
      setTutores((tutRes.data as unknown as PetUsuario[]) || []);
      setVacinas((vacsRes.data as Vacina[]) || []);
      setMedicamentos((medsRes.data as Medicamento[]) || []);
      setCompromissos((compRes.data as Compromisso[]) || []);

      // eventsApi.historico returns { eventos, grouped, total } or array
      const evData = evRes.data;
      setEventos(
        Array.isArray(evData)
          ? evData
          : (evData as any)?.eventos || dashRes.data?.atividadeRecente || []
      );
      setMuralPosts(Array.isArray(muralRes.data) ? muralRes.data : []);

      // F11: Check active check-in session
      checkInApi.getActive(petId).then((data: any) => {
        setActiveCheckIn(data?.data || data || null);
      }).catch(() => {});
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  }, [petId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ─── Computed data ─────────────────────────────────────────────────────────

  const vacinasVencendo = useMemo(() => {
    const nowMs = Date.now();
    return vacinas.filter((v) => {
      if (!v.proximaDose) return false;
      const prox = new Date(v.proximaDose);
      const diff = (prox.getTime() - nowMs) / (1000 * 60 * 60 * 24);
      return diff <= 30 && diff >= 0;
    });
  }, [vacinas]);

  const medProximaDose = useMemo(() => {
    return medicamentos.filter((m) => m.status === 'ATIVO');
  }, [medicamentos]);

  const solicitacoesPendentes = dashboard?.alertas?.solicitacoesPendentes || 0;

  const vacinasEmDia = useMemo(() => {
    return vacinas.filter((v) => {
      if (!v.proximaDose) return true;
      return new Date(v.proximaDose).getTime() > Date.now();
    }).length;
  }, [vacinas]);

  const medicamentosAtivos = useMemo(() => {
    return medicamentos.filter((m) => m.status === 'ATIVO').length;
  }, [medicamentos]);

  const guardaAtual = useMemo(() => {
    const tutor = tutores.find((t) => t.ativo);
    return tutor?.usuario?.nome || 'Tutor principal';
  }, [tutores]);

  const proximoCompromisso = useMemo(() => {
    const nowMs = Date.now();
    const futuros = compromissos
      .filter((c) => c.dataInicio && new Date(c.dataInicio).getTime() >= nowMs)
      .sort(
        (a, b) =>
          new Date(a.dataInicio!).getTime() - new Date(b.dataInicio!).getTime()
      );
    return futuros[0] || null;
  }, [compromissos]);

  const calendarEvents = useMemo(() => {
    const events: { date: string; color: string; label: string }[] = [];
    vacinas.forEach((v) => {
      if (v.proximaDose) {
        events.push({
          date: v.proximaDose.split('T')[0],
          color: 'bg-rosa',
          label: `💉 ${v.nome}`,
        });
      }
    });
    compromissos.forEach((c) => {
      if (c.dataInicio) {
        events.push({
          date: c.dataInicio.split('T')[0],
          color: 'bg-coral',
          label: `📅 ${c.titulo}`,
        });
      }
    });
    eventos.forEach((ev) => {
      if (ev.criadoEm) {
        events.push({
          date: ev.criadoEm.split('T')[0],
          color: 'bg-azul',
          label: `${ev.titulo || ev.descricao || ev.tipo}`,
        });
      }
    });
    return events;
  }, [vacinas, compromissos, eventos]);

  const selectedEvents = useMemo(() => {
    return calendarEvents.filter((e) => e.date === selectedDate);
  }, [calendarEvents, selectedDate]);

  // ─── Alerts as unified list ────────────────────────────────────────────────

  const alerts = useMemo(() => {
    const items: AlertItem[] = [];
    if (vacinasVencendo.length > 0) {
      items.push({
        icon: '💉',
        label: vacinasVencendo.length === 1 ? 'Vacina vencendo' : `${vacinasVencendo.length} vacinas vencendo`,
        detail: vacinasVencendo.map((v) => v.nome).join(', '),
        color: 'text-rose',
        bgColor: 'bg-rose/5',
        borderColor: 'border-rose',
        IconComponent: Syringe,
      });
    }
    if (solicitacoesPendentes > 0) {
      items.push({
        icon: '📋',
        label: `${solicitacoesPendentes} solicitaç${solicitacoesPendentes === 1 ? 'ão' : 'ões'}`,
        detail: 'Aguardando aprovação',
        color: 'text-amber',
        bgColor: 'bg-amber/5',
        borderColor: 'border-amber',
        IconComponent: ClipboardList,
      });
    }
    if (medProximaDose.length > 0) {
      items.push({
        icon: '💊',
        label: `${medProximaDose.length} medicamento${medProximaDose.length > 1 ? 's' : ''} ativo${medProximaDose.length > 1 ? 's' : ''}`,
        detail: medProximaDose.slice(0, 2).map((m) => m.nome).join(', '),
        color: 'text-teal',
        bgColor: 'bg-teal/5',
        borderColor: 'border-teal',
        IconComponent: Pill,
      });
    }
    return items;
  }, [vacinasVencendo, solicitacoesPendentes, medProximaDose]);

  // Today's events count for calendar badge
  const todayEventCount = useMemo(() => {
    return calendarEvents.filter((e) => e.date === todayStr()).length;
  }, [calendarEvents]);

  // Smart cards from engine (F4)
  const smartCards = useMemo(() => {
    if (!pet) return [];
    return generateTutorSmartCards({
      pet,
      vacinas,
      medicamentos,
      sintomas: [],
      eventos,
      compromissos,
      solicitacoes: [],
      tutores,
      guardas: [],
      planoSaude: null,
    });
  }, [pet, vacinas, medicamentos, eventos, compromissos, tutores]);

  // ─── Personality ──────────────────────────────────────────────────────────

  const personality = useMemo(() => {
    if (!pet) return null;
    return getPersonality({ pet, vacinas, medicamentos, eventos });
  }, [pet, vacinas, medicamentos, eventos]);

  const inactivityHumor = useMemo(() => {
    if (!pet || !isInactive(eventos, 3)) return null;
    return getHumor(pet.nome, pet.especie, 'INATIVIDADE');
  }, [pet, eventos]);

  const birthdayDays = useMemo(() => {
    if (!pet?.dataNascimento) return null;
    return daysUntilBirthday(pet.dataNascimento);
  }, [pet]);

  const nextAge = useMemo(() => {
    if (!pet?.dataNascimento) return null;
    return (petAgeYears(pet.dataNascimento) ?? 0) + 1;
  }, [pet]);

  const milestones = useMemo(() => {
    if (!pet) return [];
    return mitraMilestones(pet.criadoEm);
  }, [pet]);

  // F7: Achievements
  const achievements = useMemo(() => {
    if (!pet) return [];
    return computeAchievements({ pet, vacinas, medicamentos, eventos, tutores, muralPosts });
  }, [pet, vacinas, medicamentos, eventos, tutores, muralPosts]);

  // ── Loading ──
  if (loading) {
    return (
      <div className="space-y-4">
        {/* Alert skeleton */}
        <div className="h-14 mg-skeleton rounded-2xl" />
        {/* Stats skeleton */}
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 mg-skeleton rounded-2xl" />
          ))}
        </div>
        {/* Calendar skeleton */}
        <div className="h-12 mg-skeleton rounded-2xl" />
        {/* Activity skeleton */}
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 mg-skeleton rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!pet) return null;

  return (
    <div className="space-y-5 pb-24">
      {/* ─────────────────────────────────────────────────────────────────────
          F11: Active check-in banner
      ───────────────────────────────────────────────────────────────────── */}
      {activeCheckIn && (
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-4 text-white">
          <div className="flex items-center gap-2 mb-1">
            <span>📍</span>
            <p className="font-headline font-bold text-sm">Sessão ativa</p>
          </div>
          <p className="text-sm text-white/80 font-body">
            {activeCheckIn.prestadorNome} iniciou {activeCheckIn.tipo?.toLowerCase() || 'atendimento'} às{' '}
            {new Date(activeCheckIn.inicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────
          0. PERSONALIDADE — archetype card
      ───────────────────────────────────────────────────────────────────── */}
      {personality && (
        <div className="mg-card !p-0 overflow-hidden">
          <div className="relative px-5 py-4">
            {/* Gradient accent */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/3 to-transparent pointer-events-none" />
            <div className="relative flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center text-2xl shrink-0">
                {personality.emoji}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-headline font-bold text-sm text-primary">
                  {personality.title}
                </p>
                <p className="text-xs font-body text-texto-soft mt-0.5">
                  {inactivityHumor ? inactivityHumor.message : personality.phrase}
                </p>
              </div>
              <Sparkles className="text-primary/30 shrink-0" size={20} />
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────
          0b. ANIVERSÁRIO + MARCOS
      ───────────────────────────────────────────────────────────────────── */}
      {birthdayDays !== null && birthdayDays <= 30 && (
        <div className={cn(
          'mg-card-solid rounded-2xl px-4 py-3 flex items-center gap-3',
          birthdayDays === 0
            ? 'bg-gradient-to-r from-amber/10 via-primary/5 to-rose/10 border border-amber/20'
            : 'border border-primary/10',
        )}>
          <span className="text-2xl">{birthdayDays === 0 ? '🎉' : '🎂'}</span>
          <div className="flex-1 min-w-0">
            <p className="font-headline font-bold text-sm text-texto">
              {birthdayDays === 0
                ? `${pet.nome} faz ${nextAge} ano${(nextAge ?? 0) > 1 ? 's' : ''} hoje!`
                : `${pet.nome} faz ${nextAge} ano${(nextAge ?? 0) > 1 ? 's' : ''} em ${birthdayDays} dia${birthdayDays > 1 ? 's' : ''}`}
            </p>
            {birthdayDays === 0 && (
              <p className="text-xs font-body text-texto-soft">Parabéns! 🥳</p>
            )}
          </div>
        </div>
      )}

      {milestones.some((m) => m.achieved) && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1">
          {milestones.map((m) => (
            <div
              key={m.id}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-headline whitespace-nowrap shrink-0 transition-all',
                m.achieved
                  ? 'bg-primary/10 text-primary font-bold'
                  : 'bg-surface-muted/50 text-texto-muted'
              )}
            >
              <span>{m.emoji}</span>
              <span>{m.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────
          1. ALERTAS — glass cards with colored left border
      ───────────────────────────────────────────────────────────────────── */}
      {alerts.length > 0 && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1">
          {alerts.map((alert, i) => {
            const Icon = alert.IconComponent;
            return (
              <div
                key={i}
                className={cn(
                  'mg-card-solid flex items-center gap-2.5 px-4 py-2.5 rounded-2xl shrink-0 transition-all border-l-4',
                  alert.borderColor,
                )}
              >
                <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', alert.bgColor)}>
                  <Icon className={alert.color} size={16} />
                </div>
                <div className="min-w-0">
                  <p className={cn('font-headline font-bold text-xs', alert.color)}>
                    {alert.label}
                  </p>
                  <p className="text-[10px] font-body text-texto-soft truncate max-w-[140px]">
                    {alert.detail}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────
          2. RESUMO RAPIDO — 4 glass stat cards with Lucide icons
      ───────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-2">
        {/* Vacinas */}
        <button
          onClick={() => window.location.href = `/pets/${petId}/saude`}
          className="group mg-card-solid rounded-2xl p-3 transition-all text-center"
        >
          <div className="w-9 h-9 rounded-xl bg-rose/10 flex items-center justify-center mx-auto mb-1.5 group-hover:scale-110 transition-transform">
            <Syringe className="text-rose" size={18} />
          </div>
          <p className="font-headline font-bold text-lg text-texto leading-none">
            {vacinasEmDia}
          </p>
          <p className="text-[10px] font-body text-texto-soft mt-0.5">
            vacinas
          </p>
        </button>

        {/* Medicamentos */}
        <button
          onClick={() => window.location.href = `/pets/${petId}/saude`}
          className="group mg-card-solid rounded-2xl p-3 transition-all text-center"
        >
          <div className="w-9 h-9 rounded-xl bg-teal/10 flex items-center justify-center mx-auto mb-1.5 group-hover:scale-110 transition-transform">
            <Pill className="text-teal" size={18} />
          </div>
          <p className="font-headline font-bold text-lg text-texto leading-none">
            {medicamentosAtivos}
          </p>
          <p className="text-[10px] font-body text-texto-soft mt-0.5">
            {medicamentosAtivos === 1 ? 'remédio' : 'remédios'}
          </p>
        </button>

        {/* Guarda */}
        <button
          onClick={() => window.location.href = `/pets/${petId}/guarda`}
          className="group mg-card-solid rounded-2xl p-3 transition-all text-center"
        >
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-1.5 group-hover:scale-110 transition-transform">
            <Home className="text-primary" size={18} />
          </div>
          <p className="font-headline font-bold text-xs text-texto leading-tight truncate px-1">
            {guardaAtual.split(' ')[0]}
          </p>
          <p className="text-[10px] font-body text-texto-soft mt-0.5">
            guarda
          </p>
        </button>

        {/* Proximo */}
        <button
          onClick={() => window.location.href = `/pets/${petId}/saude`}
          className="group mg-card-solid rounded-2xl p-3 transition-all text-center"
        >
          <div className="w-9 h-9 rounded-xl bg-amber/10 flex items-center justify-center mx-auto mb-1.5 group-hover:scale-110 transition-transform">
            <Calendar className="text-amber" size={18} />
          </div>
          {proximoCompromisso ? (
            <>
              <p className="font-headline font-bold text-xs text-texto leading-tight truncate px-1">
                {proximoCompromisso.dataInicio
                  ? new Date(proximoCompromisso.dataInicio).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
                  : ''}
              </p>
              <p className="text-[10px] font-body text-texto-soft mt-0.5 truncate">
                próximo
              </p>
            </>
          ) : (
            <>
              <p className="font-headline font-bold text-xs text-texto-soft leading-tight">—</p>
              <p className="text-[10px] font-body text-texto-soft mt-0.5">próximo</p>
            </>
          )}
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────
          2b. SMART CARDS — lembretes inteligentes (F4)
      ───────────────────────────────────────────────────────────────────── */}
      {smartCards.filter((c) => c.priority === 'reminder' || c.priority === 'suggestion').length > 0 && (
        <div className="space-y-2">
          {smartCards
            .filter((c) => c.priority === 'reminder' || c.priority === 'suggestion')
            .slice(0, 3)
            .map((card) => (
              <div
                key={card.id}
                className={cn(
                  'mg-card-solid flex items-center gap-3 px-4 py-3 rounded-2xl transition-all',
                  card.priority === 'reminder' ? 'border-l-4 border-amber/50' : 'border-l-4 border-primary/30',
                )}
              >
                <span className="text-lg shrink-0">{card.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-headline font-semibold text-xs text-texto">
                    {card.title}
                  </p>
                  {card.description && (
                    <p className="text-[10px] font-body text-texto-soft mt-0.5">
                      {card.description}
                    </p>
                  )}
                </div>
                {card.action && (
                  <a
                    href={card.action.href}
                    className="text-[10px] font-headline font-bold text-primary whitespace-nowrap"
                  >
                    {card.action.label}
                  </a>
                )}
              </div>
            ))}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────
          2c. CONQUISTAS (F7)
      ───────────────────────────────────────────────────────────────────── */}
      {achievements.length > 0 && (
        <div>
          <h3 className="font-headline font-bold text-sm text-texto mb-3 flex items-center gap-2">
            <span>🏆</span> Conquistas
            <span className="text-texto-soft font-normal text-xs">
              {achievements.filter((a) => a.earned).length}/{achievements.length}
            </span>
          </h3>
          <div className="grid grid-cols-4 gap-2">
            {achievements.map((badge) => (
              <div
                key={badge.id}
                className={cn(
                  'mg-card-solid rounded-2xl p-2.5 text-center transition-all',
                  badge.earned ? 'opacity-100' : 'opacity-40 grayscale',
                )}
              >
                <span className="text-xl block mb-1">{badge.emoji}</span>
                <p className="font-headline font-bold text-[10px] text-texto leading-tight truncate">
                  {badge.title}
                </p>
                {!badge.earned && badge.total > 1 && (
                  <div className="mt-1.5">
                    <div className="h-1 bg-surface-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary/50 rounded-full transition-all"
                        style={{ width: `${(badge.progress / badge.total) * 100}%` }}
                      />
                    </div>
                    <p className="text-[8px] text-texto-muted mt-0.5">
                      {badge.progress}/{badge.total}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────
          3. CALENDARIO — collapsible mg-card
      ───────────────────────────────────────────────────────────────────── */}
      <div className="mg-card !p-0 overflow-hidden">
        {/* Calendar toggle header */}
        <button
          onClick={() => setCalendarOpen(!calendarOpen)}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-surface-muted/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Calendar className="text-primary" size={20} />
            </div>
            <div className="text-left">
              <p className="font-headline font-bold text-sm text-texto">
                Calendário
              </p>
              <p className="text-xs font-body text-texto-soft">
                {todayEventCount > 0
                  ? `${todayEventCount} evento${todayEventCount > 1 ? 's' : ''} hoje`
                  : 'Nenhum evento hoje'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {todayEventCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
                {todayEventCount}
              </span>
            )}
            {calendarOpen ? (
              <ChevronUp className="text-texto-soft transition-transform duration-300" size={18} />
            ) : (
              <ChevronDown className="text-texto-soft transition-transform duration-300" size={18} />
            )}
          </div>
        </button>

        {/* Calendar body — collapsible */}
        <div
          className={cn(
            'transition-all duration-300 ease-in-out overflow-hidden',
            calendarOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0',
          )}
        >
          <div className="px-2 pb-2">
            <CalendarMonth
              month={month}
              year={year}
              events={calendarEvents}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              onChangeMonth={(m, y) => {
                setMonth(m);
                setYear(y);
              }}
            />
          </div>

          {/* Events for selected date */}
          <div className="px-5 pb-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-px flex-1 bg-surface-muted" />
              <span className="text-[10px] font-headline font-bold text-texto-soft uppercase tracking-wider whitespace-nowrap">
                {formatDateLabel(selectedDate)}
              </span>
              <div className="h-px flex-1 bg-surface-muted" />
            </div>

            {selectedEvents.length === 0 ? (
              <p className="text-xs text-texto-soft text-center py-3 font-body">
                Nenhum evento nesta data
              </p>
            ) : (
              <div className="space-y-1.5">
                {selectedEvents.map((ev, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 py-2 px-3 rounded-xl bg-surface-muted/40"
                  >
                    <span className={cn('w-2 h-2 rounded-full shrink-0', ev.color)} />
                    <span className="text-xs font-body text-texto">{ev.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────
          4. ATIVIDADE RECENTE
      ───────────────────────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-headline font-bold text-sm text-texto">
            Atividade recente
          </h3>
          {eventos.length > 5 && (
            <a
              href={`/pets/${petId}/historico`}
              className="text-xs font-headline font-semibold text-primary hover:opacity-70 transition-opacity flex items-center gap-1"
            >
              Ver tudo
              <ChevronRight size={14} />
            </a>
          )}
        </div>

        {eventos.length === 0 ? (
          <div className="mg-card text-center py-8">
            <ClipboardList className="mx-auto text-texto-soft mb-2" size={28} />
            <p className="text-sm font-body text-texto-soft">
              {pet ? getHumor(pet.nome, pet.especie, 'EMPTY_STATE').message : 'Nenhuma atividade registrada'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {eventos.slice(0, 5).map((ev: any, i: number) => {
              const IconComp = eventLucideIcon(ev.tipo);
              const iconColorClasses = eventIconColor(ev.tipo);
              const [textClass, bgClass] = iconColorClasses.split(' ');
              return (
                <div
                  key={ev.id}
                  className="mg-card-solid flex items-center gap-3 px-4 py-3 rounded-2xl transition-all"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0', bgClass)}>
                    <IconComp className={textClass} size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-headline font-semibold text-xs text-texto truncate">
                      {ev.descricao || ev.titulo || ev.tipo}
                    </p>
                    <p className="text-[10px] font-body text-texto-soft">
                      {formatRelative(ev.criadoEm)}
                    </p>
                  </div>
                  <ChevronRight className="text-texto-muted shrink-0" size={16} />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────────────
          5. FAB BUTTON — violet gradient with Plus icon
      ───────────────────────────────────────────────────────────────────── */}
      <button
        onClick={() => setShowRegisterModal(true)}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-br from-primary to-primary-dark text-white w-14 h-14 rounded-full shadow-lg hover:shadow-glow-primary hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center"
        aria-label="Registrar evento"
      >
        <Plus size={24} strokeWidth={2.5} />
      </button>

      {/* RegisterEventModal */}
      <RegisterEventModal
        open={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        petId={petId}
        pet={pet}
        onSuccess={() => {
          setShowRegisterModal(false);
          setLoading(true);
          loadData();
        }}
      />
    </div>
  );
}
