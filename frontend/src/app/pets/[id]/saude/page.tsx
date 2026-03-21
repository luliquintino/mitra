'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { petsApi, healthApi, compromissosApi } from '@/lib/api';
import { Pet, Vacina, Medicamento, Sintoma, PlanoSaude, Compromisso, RecomendacaoVacina, AgendamentoVacina } from '@/types';
import { formatDate, cn } from '@/lib/utils';

// ─── Species-specific data ──────────────────────────────────────────────────

type MedInfo = { nome: string; dosagem: string; frequencia: string; motivos: string[] };

const MEDICAMENTOS_POR_ESPECIE: Record<string, MedInfo[]> = {
  CACHORRO: [
    { nome: 'Bravecto (Fluralaner)', dosagem: '1 comprimido (por peso)', frequencia: 'A cada 3 meses', motivos: ['Prevencao de pulgas e carrapatos'] },
    { nome: 'Simparica (Sarolaner)', dosagem: '1 comprimido (por peso)', frequencia: 'Mensal', motivos: ['Prevencao de pulgas e carrapatos'] },
    { nome: 'NexGard (Afoxolaner)', dosagem: '1 comprimido (por peso)', frequencia: 'Mensal', motivos: ['Prevencao de pulgas e carrapatos'] },
    { nome: 'Milbemax (Milbemicina+Praz.)', dosagem: '1 comprimido (por peso)', frequencia: 'A cada 3 meses', motivos: ['Vermifugacao', 'Prevencao de vermes intestinais'] },
    { nome: 'Drontal Plus', dosagem: '1 comprimido por 10 kg', frequencia: 'A cada 3 meses', motivos: ['Vermifugacao'] },
    { nome: 'Heartgard (Ivermectina)', dosagem: '1 comprimido (por peso)', frequencia: 'Mensal', motivos: ['Prevencao de dirofilariose', 'Controle de parasitas internos'] },
    { nome: 'Amoxicilina', dosagem: '10-20 mg/kg', frequencia: 'A cada 12 horas', motivos: ['Infeccao bacteriana', 'Antibioticoterapia'] },
    { nome: 'Metronidazol', dosagem: '10-15 mg/kg', frequencia: 'A cada 12 horas', motivos: ['Infeccao gastrointestinal', 'Giardiase'] },
    { nome: 'Prednisolona', dosagem: '1-2 mg/kg', frequencia: 'Uma vez ao dia', motivos: ['Anti-inflamatorio', 'Tratamento de alergias'] },
    { nome: 'Omega 3', dosagem: '1 capsula', frequencia: 'Uma vez ao dia', motivos: ['Suplementacao', 'Saude da pele e pelagem'] },
  ],
  GATO: [
    { nome: 'Revolution (Selamectina)', dosagem: '1 pipeta (por peso)', frequencia: 'Mensal', motivos: ['Prevencao de pulgas', 'Controle de parasitas'] },
    { nome: 'Bravecto Plus', dosagem: '1 pipeta (por peso)', frequencia: 'A cada 2 meses', motivos: ['Prevencao de pulgas e carrapatos'] },
    { nome: 'Profender (Emodepsida+Praz.)', dosagem: '1 pipeta (por peso)', frequencia: 'A cada 3 meses', motivos: ['Vermifugacao'] },
    { nome: 'Milbemax Gato', dosagem: '1 comprimido (por peso)', frequencia: 'A cada 3 meses', motivos: ['Vermifugacao'] },
    { nome: 'Amoxicilina', dosagem: '10-20 mg/kg', frequencia: 'A cada 12 horas', motivos: ['Infeccao bacteriana', 'Antibioticoterapia'] },
    { nome: 'Prednisolona', dosagem: '1-2 mg/kg', frequencia: 'Uma vez ao dia', motivos: ['Anti-inflamatorio', 'Tratamento de alergias'] },
    { nome: 'Omega 3', dosagem: '1 capsula', frequencia: 'Uma vez ao dia', motivos: ['Suplementacao', 'Saude da pele e pelagem'] },
  ],
  CAVALO: [
    { nome: 'Ivermectina (pasta)', dosagem: '200 mcg/kg', frequencia: 'A cada 6-8 semanas', motivos: ['Controle de parasitas internos'] },
    { nome: 'Fenbendazol', dosagem: '5-10 mg/kg', frequencia: 'A cada 6-8 semanas', motivos: ['Vermifugacao'] },
    { nome: 'Fenilbutazona', dosagem: '2,2-4,4 mg/kg', frequencia: 'A cada 12-24 horas', motivos: ['Anti-inflamatorio', 'Dor musculoesqueletica'] },
    { nome: 'Flunixin Meglumine', dosagem: '1,1 mg/kg', frequencia: 'A cada 12 horas', motivos: ['Anti-inflamatorio', 'Colica', 'Dor'] },
  ],
  PEIXE: [
    { nome: 'Sal de cozinha (NaCl)', dosagem: '1-3 g/L de agua', frequencia: 'Banho de 5-30 min', motivos: ['Tratamento de infeccoes externas', 'Estresse'] },
    { nome: 'Methylene Blue', dosagem: '1-3 mg/L', frequencia: 'Por 3-5 dias', motivos: ['Tratamento de fungos e bacterias'] },
  ],
  PASSARO: [
    { nome: 'Ivermectina (solucao)', dosagem: '0,2 mg/kg', frequencia: 'A cada 30 dias', motivos: ['Controle de parasitas externos'] },
    { nome: 'Espiramicina + Metronidazol', dosagem: 'Conforme bula', frequencia: 'Por 5-7 dias', motivos: ['Tricomoniase', 'Infeccao bacteriana'] },
  ],
  ROEDOR: [
    { nome: 'Ivermectina', dosagem: '0,2-0,4 mg/kg', frequencia: 'A cada 14 dias', motivos: ['Controle de acaros e parasitas'] },
    { nome: 'Enrofloxacino', dosagem: '5-10 mg/kg', frequencia: 'A cada 12 horas', motivos: ['Infeccao bacteriana', 'Antibioticoterapia'] },
  ],
  COELHO: [
    { nome: 'Ivermectina', dosagem: '0,2-0,4 mg/kg', frequencia: 'A cada 14 dias', motivos: ['Controle de parasitas'] },
    { nome: 'Meloxicam', dosagem: '0,3-0,6 mg/kg', frequencia: 'Uma vez ao dia', motivos: ['Anti-inflamatorio', 'Dor'] },
    { nome: 'Enrofloxacino', dosagem: '5-10 mg/kg', frequencia: 'A cada 12 horas', motivos: ['Infeccao bacteriana', 'Antibioticoterapia'] },
  ],
  REPTIL: [
    { nome: 'Ivermectina (topica)', dosagem: 'Conforme peso', frequencia: 'A cada 14 dias', motivos: ['Controle de parasitas externos'] },
    { nome: 'Metronidazol', dosagem: '20-50 mg/kg', frequencia: 'A cada 48 horas', motivos: ['Parasitas intestinais', 'Infeccao por protozoarios'] },
  ],
  FURAO: [
    { nome: 'Ivermectina', dosagem: '0,2-0,4 mg/kg', frequencia: 'A cada 14 dias', motivos: ['Controle de parasitas'] },
    { nome: 'Prednisolona', dosagem: '1-2 mg/kg', frequencia: 'Uma vez ao dia', motivos: ['Anti-inflamatorio', 'Insulinoma'] },
    { nome: 'Amoxicilina', dosagem: '10-20 mg/kg', frequencia: 'A cada 12 horas', motivos: ['Infeccao bacteriana', 'Antibioticoterapia'] },
  ],
  OUTRO: [],
};

const VACINAS_POR_ESPECIE: Record<string, string[]> = {
  CACHORRO: ['V8 (Polivalente)', 'V10 (Polivalente)', 'Antirrabica', 'Gripe Canina (Bordetella)', 'Leishmaniose', 'Giardia', 'Leptospirose'],
  GATO: ['Triplice Felina (FPV/FHV/FCV)', 'Quadrupla Felina', 'Antirrabica', 'Leucemia Felina (FeLV)', 'FIV/FeLV Combo'],
  CAVALO: ['Influenza Equina', 'Tetano', 'Encefalomielite', 'Raiva Equina', 'Herpesvirus Equino', 'Botulismo'],
  PEIXE: [],
  PASSARO: ['Doenca de Newcastle', 'Variola Aviaria', 'Marek'],
  ROEDOR: [],
  COELHO: ['Mixomatose', 'Doenca Hemorragica Viral (RHD)', 'RHD2'],
  REPTIL: [],
  FURAO: ['Antirrabica', 'Distemper (CDV)'],
  OUTRO: [],
};

// ─── Intensidade helpers ─────────────────────────────────────────────────────

const INTENSIDADE_OPTIONS = [
  { value: 'LEVE', label: 'Leve', num: 1 },
  { value: 'MODERADO', label: 'Moderado', num: 3 },
  { value: 'GRAVE', label: 'Grave', num: 5 },
] as const;

function intensidadeBadge(intensidade: number | string | undefined | null) {
  if (!intensidade) return null;
  const num = typeof intensidade === 'string' ? parseInt(intensidade) : intensidade;
  if (num <= 2) return { label: 'Leve', className: 'bg-green-100 text-green-700' };
  if (num <= 3) return { label: 'Moderado', className: 'bg-yellow-100 text-yellow-700' };
  return { label: 'Grave', className: 'bg-red-100 text-red-700' };
}

// ─── Vaccine alert helper ────────────────────────────────────────────────────

function vacinaAlertStatus(proximaDose: string | undefined): 'overdue' | 'soon' | 'ok' | null {
  if (!proximaDose) return null;
  const now = new Date();
  const proxDate = new Date(proximaDose);
  if (isNaN(proxDate.getTime())) return null;
  const diffDays = Math.ceil((proxDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'overdue';
  if (diffDays <= 14) return 'soon';
  return 'ok';
}

// ─── Shared UI helpers ───────────────────────────────────────────────────────

function EmptyState({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="pt-card text-center py-10 space-y-3">
      <div className="text-3xl">{icon}</div>
      <div>
        <p className="font-semibold text-texto text-sm">{title}</p>
        <p className="text-xs text-texto-soft mt-1 max-w-xs mx-auto">{description}</p>
      </div>
    </div>
  );
}

function ConfirmationBanner({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="rounded-xl bg-creme-dark px-4 py-3 flex items-center gap-2 animate-fade-in">
      <span className="text-texto-soft text-sm">&#10003;</span>
      <span className="text-sm text-texto font-medium">{message}</span>
    </div>
  );
}

// ─── Sub-tab types ───────────────────────────────────────────────────────────

type SubTab = 'carteira' | 'vacinas' | 'medicamentos' | 'sintomas' | 'plano' | 'consultas';

const SUBTABS: { id: SubTab; label: string; emoji?: string }[] = [
  { id: 'carteira', label: 'Carteira', emoji: '📋' },
  { id: 'vacinas', label: 'Vacinas' },
  { id: 'medicamentos', label: 'Medicamentos' },
  { id: 'sintomas', label: 'Sintomas' },
  { id: 'plano', label: 'Plano de Saude' },
  { id: 'consultas', label: 'Consultas' },
];

// ─── Vacinas Tab ─────────────────────────────────────────────────────────────

function VacinasTab({ petId, especie, vacinas: initialVacinas, onUpdate }: {
  petId: string; especie: string; vacinas: Vacina[]; onUpdate: () => void;
}) {
  const vacinasDisponiveis = VACINAS_POR_ESPECIE[especie] ?? [];
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nome: '', dataAplicacao: '', proximaDose: '', veterinario: '', crmv: '', clinica: '', lote: '' });
  const [nomeManual, setNomeManual] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmation, setConfirmation] = useState('');
  const [saveError, setSaveError] = useState('');

  const isOutraVacina = form.nome === '__OUTRA__';

  const handleNomeChange = (value: string) => {
    setForm(f => ({ ...f, nome: value }));
    if (value !== '__OUTRA__') setNomeManual('');
  };

  const handleCancel = () => {
    setShowForm(false);
    setForm({ nome: '', dataAplicacao: '', proximaDose: '', veterinario: '', crmv: '', clinica: '', lote: '' });
    setNomeManual('');
    setSaveError('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError('');
    try {
      const { data } = await healthApi.createVacina(petId, {
        ...form,
        nome: isOutraVacina ? nomeManual : form.nome,
        crmv: form.crmv || undefined,
        lote: form.lote || undefined,
      });
      setConfirmation((data as any).mensagem || 'Vacina registrada com sucesso!');
      handleCancel();
      onUpdate();
      setTimeout(() => setConfirmation(''), 4000);
    } catch (err: any) {
      setSaveError(err?.response?.data?.message || 'Erro ao registrar vacina. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <ConfirmationBanner message={confirmation} />

      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-texto">
          {initialVacinas.length} {initialVacinas.length === 1 ? 'vacina' : 'vacinas'}
        </p>
        <button onClick={() => setShowForm(!showForm)} className="pt-btn text-sm">
          + Vacina
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="pt-card space-y-3 bg-coral-light/30">
          <h3 className="font-headline font-semibold text-texto text-sm">Nova vacina</h3>
          <div className="space-y-2">
            <label className="pt-label">Nome da vacina *</label>
            {vacinasDisponiveis.length > 0 ? (
              <>
                <select className="pt-input" value={form.nome} onChange={(e) => handleNomeChange(e.target.value)} required={!isOutraVacina}>
                  <option value="">Selecione a vacina</option>
                  {vacinasDisponiveis.map((v) => <option key={v} value={v}>{v}</option>)}
                  <option value="__OUTRA__">Outra vacina...</option>
                </select>
                {isOutraVacina && (
                  <input className="pt-input" placeholder="Nome da vacina..." value={nomeManual} onChange={(e) => setNomeManual(e.target.value)} autoFocus required />
                )}
              </>
            ) : (
              <input className="pt-input" placeholder="V10, Antirrabica..." value={form.nome} onChange={(e) => setForm(f => ({ ...f, nome: e.target.value }))} required />
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="pt-label">Data de aplicacao *</label>
              <input type="date" className="pt-input" value={form.dataAplicacao} onChange={(e) => setForm(f => ({ ...f, dataAplicacao: e.target.value }))} required />
            </div>
            <div>
              <label className="pt-label">Proxima dose</label>
              <input type="date" className="pt-input" value={form.proximaDose} onChange={(e) => setForm(f => ({ ...f, proximaDose: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="pt-label">Veterinario</label>
              <input className="pt-input" placeholder="Dr. Silva" value={form.veterinario} onChange={(e) => setForm(f => ({ ...f, veterinario: e.target.value }))} />
            </div>
            <div>
              <label className="pt-label">CRMV</label>
              <input className="pt-input" placeholder="12345-SP" value={form.crmv} onChange={(e) => setForm(f => ({ ...f, crmv: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="pt-label">Lote</label>
              <input className="pt-input" placeholder="ABC123" value={form.lote} onChange={(e) => setForm(f => ({ ...f, lote: e.target.value }))} />
            </div>
            <div>
              <label className="pt-label">Clinica</label>
              <input className="pt-input" placeholder="VetCare" value={form.clinica} onChange={(e) => setForm(f => ({ ...f, clinica: e.target.value }))} />
            </div>
          </div>
          {saveError && <p className="text-xs text-erro">{saveError}</p>}
          <div className="flex gap-2 pt-1">
            <button type="submit" disabled={saving} className="pt-btn flex-1 text-sm">{saving ? 'Salvando...' : 'Registrar vacina'}</button>
            <button type="button" onClick={handleCancel} className="pt-btn-secondary text-sm px-4">Cancelar</button>
          </div>
        </form>
      )}

      {initialVacinas.length === 0 ? (
        <EmptyState icon="&#128137;" title="Nenhuma vacina registrada" description="Registre as vacinas do seu pet para manter o historico de imunizacao." />
      ) : (
        <div className="space-y-3">
          {initialVacinas.map((v) => {
            const alert = vacinaAlertStatus(v.proximaDose);
            return (
              <div key={v.id} className={cn(
                'bg-white rounded-2xl p-4',
                alert === 'overdue' && 'ring-2 ring-red-400',
                alert === 'soon' && 'ring-2 ring-yellow-400',
              )}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-rosa-light flex items-center justify-center text-base flex-shrink-0">&#128137;</div>
                    <div>
                      <p className="font-semibold text-texto text-sm">{v.nome}</p>
                      <p className="text-xs text-texto-soft mt-0.5">Aplicada em {formatDate(v.dataAplicacao)}</p>
                      {v.veterinario && (
                        <p className="text-xs text-texto-soft">
                          {v.veterinario}{v.crmv ? ` (CRMV ${v.crmv})` : ''}{(v as any).clinica ? ` \u00B7 ${(v as any).clinica}` : ''}
                        </p>
                      )}
                      {v.lote && <p className="text-xs text-texto-soft">Lote: {v.lote}</p>}
                    </div>
                  </div>
                  {v.proximaDose && (
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-texto-soft">Proxima dose</p>
                      <p className={cn(
                        'text-xs font-semibold mt-0.5',
                        alert === 'overdue' ? 'text-red-600' : alert === 'soon' ? 'text-yellow-600' : 'text-coral',
                      )}>
                        {formatDate(v.proximaDose)}
                      </p>
                      {alert === 'overdue' && <p className="text-[10px] text-red-500 font-medium mt-0.5">Vencida</p>}
                      {alert === 'soon' && <p className="text-[10px] text-yellow-600 font-medium mt-0.5">Em breve</p>}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Medicamentos Tab ────────────────────────────────────────────────────────

function MedicamentosTab({ petId, especie, medicamentos: initialMeds, onUpdate }: {
  petId: string; especie: string; medicamentos: Medicamento[]; onUpdate: () => void;
}) {
  const medsDisponiveis = MEDICAMENTOS_POR_ESPECIE[especie] ?? [];
  const [medFilter, setMedFilter] = useState<'ATIVO' | 'HISTORICO'>('ATIVO');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nome: '', dosagem: '', frequencia: '', dataInicio: '', motivo: '' });
  const [nomeManual, setNomeManual] = useState('');
  const [motivoManual, setMotivoManual] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmation, setConfirmation] = useState('');
  const [saveError, setSaveError] = useState('');

  const isOutroMed = form.nome === '__OUTRO__';
  const isOutroMotivo = form.motivo === '__OUTRO__';
  const selectedMedInfo = medsDisponiveis.find((m) => m.nome === form.nome);
  const motivosDisponiveis = selectedMedInfo?.motivos ?? [];

  const handleMedChange = (value: string) => {
    const info = medsDisponiveis.find((m) => m.nome === value);
    setForm(f => ({
      ...f,
      nome: value,
      dosagem: info ? info.dosagem : '',
      frequencia: info ? info.frequencia : '',
      motivo: '',
    }));
    setNomeManual('');
    setMotivoManual('');
  };

  const handleCancel = () => {
    setShowForm(false);
    setForm({ nome: '', dosagem: '', frequencia: '', dataInicio: '', motivo: '' });
    setNomeManual('');
    setMotivoManual('');
    setSaveError('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError('');
    try {
      const { data } = await healthApi.createMedicamento(petId, {
        ...form,
        nome: isOutroMed ? nomeManual : form.nome,
        motivo: isOutroMotivo ? (motivoManual || undefined) : (form.motivo || undefined),
      });
      setConfirmation((data as any).mensagem || 'Medicamento registrado com sucesso!');
      handleCancel();
      onUpdate();
      setTimeout(() => setConfirmation(''), 4000);
    } catch (err: any) {
      setSaveError(err?.response?.data?.message || 'Erro ao registrar medicamento. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleAdministrar = async (medId: string) => {
    try {
      const { data } = await healthApi.administrar(petId, medId);
      setConfirmation((data as any).mensagem || 'Medicamento administrado!');
      onUpdate();
      setTimeout(() => setConfirmation(''), 4000);
    } catch {
      setConfirmation('Erro ao registrar administracao. Tente novamente.');
      setTimeout(() => setConfirmation(''), 4000);
    }
  };

  const ativos = initialMeds.filter((m) => m.status === 'ATIVO');
  const inativos = initialMeds.filter((m) => m.status !== 'ATIVO');
  const displayList = medFilter === 'ATIVO' ? ativos : inativos;

  return (
    <div className="space-y-4">
      <ConfirmationBanner message={confirmation} />

      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-texto">
          {initialMeds.length} {initialMeds.length === 1 ? 'medicamento' : 'medicamentos'}
        </p>
        <button onClick={() => setShowForm(!showForm)} className="pt-btn text-sm">+ Medicamento</button>
      </div>

      {/* Active / Completed filter */}
      <div className="flex gap-2">
        <button
          onClick={() => setMedFilter('ATIVO')}
          className={cn(
            'px-4 py-1.5 rounded-xl text-xs font-medium transition-all',
            medFilter === 'ATIVO' ? 'bg-coral text-white' : 'bg-white text-texto-soft',
          )}
        >
          Ativos ({ativos.length})
        </button>
        <button
          onClick={() => setMedFilter('HISTORICO')}
          className={cn(
            'px-4 py-1.5 rounded-xl text-xs font-medium transition-all',
            medFilter === 'HISTORICO' ? 'bg-coral text-white' : 'bg-white text-texto-soft',
          )}
        >
          Concluidos ({inativos.length})
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="pt-card space-y-3 bg-coral-light/30">
          <h3 className="font-headline font-semibold text-texto text-sm">Novo medicamento</h3>
          <div className="space-y-2">
            <label className="pt-label">Nome *</label>
            {medsDisponiveis.length > 0 ? (
              <>
                <select className="pt-input" value={form.nome} onChange={(e) => handleMedChange(e.target.value)} required={!isOutroMed}>
                  <option value="">Selecione o medicamento</option>
                  {medsDisponiveis.map((m) => <option key={m.nome} value={m.nome}>{m.nome}</option>)}
                  <option value="__OUTRO__">Outro medicamento...</option>
                </select>
                {isOutroMed && (
                  <input className="pt-input" placeholder="Nome do medicamento..." value={nomeManual} onChange={(e) => setNomeManual(e.target.value)} autoFocus required />
                )}
              </>
            ) : (
              <input className="pt-input" placeholder="Bravecto, Simparica..." value={form.nome} onChange={(e) => setForm(f => ({ ...f, nome: e.target.value }))} required />
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="pt-label">Dosagem *{selectedMedInfo && <span className="ml-1 text-coral font-normal">(bula)</span>}</label>
              <input className="pt-input" placeholder="1 comprimido" value={form.dosagem} onChange={(e) => setForm(f => ({ ...f, dosagem: e.target.value }))} required />
            </div>
            <div>
              <label className="pt-label">Frequencia *{selectedMedInfo && <span className="ml-1 text-coral font-normal">(bula)</span>}</label>
              <input className="pt-input" placeholder="A cada 3 meses" value={form.frequencia} onChange={(e) => setForm(f => ({ ...f, frequencia: e.target.value }))} required />
            </div>
          </div>
          <div>
            <label className="pt-label">Data de inicio *</label>
            <input type="date" className="pt-input" value={form.dataInicio} onChange={(e) => setForm(f => ({ ...f, dataInicio: e.target.value }))} required />
          </div>
          <div className="space-y-2">
            <label className="pt-label">Motivo</label>
            {motivosDisponiveis.length > 0 ? (
              <>
                <select className="pt-input" value={form.motivo} onChange={(e) => { setForm(f => ({ ...f, motivo: e.target.value })); setMotivoManual(''); }}>
                  <option value="">Selecione o motivo</option>
                  {motivosDisponiveis.map((m) => <option key={m} value={m}>{m}</option>)}
                  <option value="__OUTRO__">Outro motivo...</option>
                </select>
                {isOutroMotivo && (
                  <input className="pt-input" placeholder="Descreva o motivo..." value={motivoManual} onChange={(e) => setMotivoManual(e.target.value)} autoFocus />
                )}
              </>
            ) : (
              <input className="pt-input" placeholder="Prevencao, tratamento..." value={form.motivo} onChange={(e) => setForm(f => ({ ...f, motivo: e.target.value }))} />
            )}
          </div>
          {saveError && <p className="text-xs text-erro">{saveError}</p>}
          <div className="flex gap-2 pt-1">
            <button type="submit" disabled={saving} className="pt-btn flex-1 text-sm">{saving ? 'Salvando...' : 'Registrar'}</button>
            <button type="button" onClick={handleCancel} className="pt-btn-secondary text-sm px-4">Cancelar</button>
          </div>
        </form>
      )}

      {displayList.length === 0 ? (
        <EmptyState
          icon="&#128138;"
          title={medFilter === 'ATIVO' ? 'Nenhum medicamento ativo' : 'Nenhum medicamento concluido'}
          description={medFilter === 'ATIVO' ? 'Registre os medicamentos em uso para acompanhar o tratamento.' : 'Medicamentos concluidos ou cancelados aparecem aqui.'}
        />
      ) : (
        <div className="space-y-3">
          {displayList.map((m) => (
            <div key={m.id} className={cn('bg-white rounded-2xl p-4', medFilter !== 'ATIVO' && 'opacity-60')}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0', medFilter === 'ATIVO' ? 'bg-azul-light' : 'bg-creme-dark')}>&#128138;</div>
                  <div>
                    <p className="font-semibold text-texto text-sm">{m.nome}</p>
                    <p className="text-xs text-texto-soft mt-0.5">{m.dosagem} &middot; {m.frequencia}</p>
                    {m.motivo && <p className="text-xs text-texto-soft mt-0.5">{m.motivo}</p>}
                    {medFilter !== 'ATIVO' && (
                      <p className="text-xs text-texto-soft mt-0.5">{m.status === 'CONCLUIDO' ? 'Concluido' : 'Cancelado'} &middot; {formatDate(m.dataInicio)}</p>
                    )}
                    <span className={cn(
                      'inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full font-medium',
                      m.status === 'ATIVO' ? 'bg-green-100 text-green-700' : m.status === 'CONCLUIDO' ? 'bg-gray-100 text-gray-600' : 'bg-red-100 text-red-600',
                    )}>
                      {m.status === 'ATIVO' ? 'Ativo' : m.status === 'CONCLUIDO' ? 'Concluido' : 'Cancelado'}
                    </span>
                  </div>
                </div>
                {m.status === 'ATIVO' && (
                  <button onClick={() => handleAdministrar(m.id)} className="text-xs pt-btn-secondary py-1.5 px-3 flex-shrink-0">
                    Administrar dose
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Sintomas Tab ────────────────────────────────────────────────────────────

function SintomasTab({ petId, sintomas: initialSintomas, onUpdate }: {
  petId: string; sintomas: Sintoma[]; onUpdate: () => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ descricao: '', dataInicio: '', dataFim: '', intensidade: '', observacoes: '' });
  const [fotos, setFotos] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [confirmation, setConfirmation] = useState('');
  const [saveError, setSaveError] = useState('');
  const [lightbox, setLightbox] = useState<string | null>(null);

  const handleCancel = () => {
    setShowForm(false);
    setForm({ descricao: '', dataInicio: '', dataFim: '', intensidade: '', observacoes: '' });
    setFotos([]);
    setSaveError('');
  };

  const handleFotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const maxFiles = 5;
    const maxSizeMB = 5;

    Array.from(files).forEach(file => {
      if (fotos.length >= maxFiles) return;
      if (file.size > maxSizeMB * 1024 * 1024) {
        setSaveError(`Arquivo ${file.name} excede ${maxSizeMB}MB.`);
        return;
      }
      if (!file.type.startsWith('image/')) {
        setSaveError(`Arquivo ${file.name} nao e uma imagem.`);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setFotos(prev => prev.length < maxFiles ? [...prev, reader.result as string] : prev);
        }
      };
      reader.readAsDataURL(file);
    });
    // Reset input so same file can be re-selected
    e.target.value = '';
  };

  const removeFoto = (index: number) => {
    setFotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError('');
    try {
      const intensidadeMap: Record<string, number> = { LEVE: 1, MODERADO: 3, GRAVE: 5 };
      const { data } = await healthApi.createSintoma(petId, {
        descricao: form.descricao,
        dataInicio: form.dataInicio,
        dataFim: form.dataFim || undefined,
        intensidade: form.intensidade ? intensidadeMap[form.intensidade] || undefined : undefined,
        observacoes: form.observacoes || undefined,
        evidencias: fotos.length > 0 ? fotos : undefined,
      });
      setConfirmation((data as any).mensagem || 'Sintoma registrado com sucesso!');
      handleCancel();
      onUpdate();
      setTimeout(() => setConfirmation(''), 4000);
    } catch (err: any) {
      setSaveError(err?.response?.data?.message || 'Erro ao registrar sintoma. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  // Separate open vs closed symptoms
  const abertos = initialSintomas.filter(s => !s.dataFim);
  const fechados = initialSintomas.filter(s => !!s.dataFim);

  return (
    <div className="space-y-4">
      <ConfirmationBanner message={confirmation} />

      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-texto">
          {initialSintomas.length} {initialSintomas.length === 1 ? 'sintoma' : 'sintomas'}
        </p>
        <button onClick={() => setShowForm(!showForm)} className="pt-btn text-sm">+ Sintoma</button>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="pt-card space-y-3 bg-coral-light/30">
          <h3 className="font-headline font-semibold text-texto text-sm">Novo sintoma</h3>
          <div>
            <label className="pt-label">Descricao *</label>
            <textarea className="pt-input resize-none" rows={2} placeholder="Descreva o sintoma..." value={form.descricao} onChange={(e) => setForm(f => ({ ...f, descricao: e.target.value }))} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="pt-label">Data de inicio *</label>
              <input type="date" className="pt-input" value={form.dataInicio} onChange={(e) => setForm(f => ({ ...f, dataInicio: e.target.value }))} required />
            </div>
            <div>
              <label className="pt-label">Data fim</label>
              <input type="date" className="pt-input" value={form.dataFim} onChange={(e) => setForm(f => ({ ...f, dataFim: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="pt-label">Intensidade</label>
            <select className="pt-input" value={form.intensidade} onChange={(e) => setForm(f => ({ ...f, intensidade: e.target.value }))}>
              <option value="">Selecione</option>
              {INTENSIDADE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
          <div>
            <label className="pt-label">Observacoes</label>
            <textarea className="pt-input resize-none" rows={2} placeholder="Observacoes adicionais..." value={form.observacoes} onChange={(e) => setForm(f => ({ ...f, observacoes: e.target.value }))} />
          </div>

          {/* Photo upload */}
          <div>
            <label className="pt-label">Fotos do sintoma</label>
            <p className="text-[11px] text-texto-soft mb-2">Anexe ate 5 fotos para ajudar a veterinaria a analisar. Max 5MB cada.</p>

            {/* Preview grid */}
            {fotos.length > 0 && (
              <div className="flex gap-2 flex-wrap mb-2">
                {fotos.map((src, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={src}
                      alt={`Foto ${idx + 1}`}
                      className="w-20 h-20 rounded-xl object-cover border-2 border-creme-dark cursor-pointer hover:border-coral transition-colors"
                      onClick={() => setLightbox(src)}
                    />
                    <button
                      type="button"
                      onClick={() => removeFoto(idx)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}

            {fotos.length < 5 && (
              <label className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-coral/30 bg-coral/[0.03] cursor-pointer hover:border-coral/50 hover:bg-coral/[0.06] transition-all">
                <span className="text-lg">📷</span>
                <span className="text-sm text-coral font-medium">{fotos.length === 0 ? 'Adicionar fotos' : `Adicionar mais (${fotos.length}/5)`}</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFotoUpload}
                />
              </label>
            )}
          </div>

          {saveError && <p className="text-xs text-erro">{saveError}</p>}
          <div className="flex gap-2 pt-1">
            <button type="submit" disabled={saving} className="pt-btn flex-1 text-sm">{saving ? 'Salvando...' : 'Registrar sintoma'}</button>
            <button type="button" onClick={handleCancel} className="pt-btn-secondary text-sm px-4">Cancelar</button>
          </div>
        </form>
      )}

      {initialSintomas.length === 0 ? (
        <EmptyState icon="&#129658;" title="Nenhum sintoma registrado" description="Registre sintomas para manter o historico de saude do seu pet." />
      ) : (
        <div className="space-y-3">
          {abertos.length > 0 && (
            <>
              <p className="text-xs text-texto-soft font-medium uppercase tracking-wider">Abertos</p>
              {abertos.map((s) => {
                const badge = intensidadeBadge(s.intensidade);
                return (
                  <div key={s.id} className="bg-white rounded-2xl p-4">
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        'w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0',
                        !s.intensidade ? 'bg-amarelo-light' :
                        (typeof s.intensidade === 'number' ? s.intensidade : parseInt(String(s.intensidade))) <= 2 ? 'bg-green-100' :
                        (typeof s.intensidade === 'number' ? s.intensidade : parseInt(String(s.intensidade))) <= 3 ? 'bg-yellow-100' : 'bg-red-100',
                      )}>&#129658;</div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-texto">{s.descricao}</p>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          <p className="text-xs text-texto-soft">Inicio: {formatDate(s.dataInicio)}</p>
                          {badge && (
                            <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', badge.className)}>
                              {badge.label}
                            </span>
                          )}
                        </div>
                        {s.observacoes && <p className="text-xs text-texto-soft mt-1">{s.observacoes}</p>}
                        {/* Evidencias / fotos */}
                        {s.evidencias && s.evidencias.length > 0 && (
                          <div className="flex gap-2 mt-2 flex-wrap">
                            {s.evidencias.map((src, idx) => (
                              <img
                                key={idx}
                                src={src}
                                alt={`Evidencia ${idx + 1}`}
                                className="w-16 h-16 rounded-lg object-cover border border-creme-dark cursor-pointer hover:border-coral hover:shadow-md transition-all"
                                onClick={() => setLightbox(src)}
                              />
                            ))}
                            <span className="text-[10px] text-texto-soft self-end pb-1">📷 {s.evidencias.length} foto{s.evidencias.length > 1 ? 's' : ''}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          )}
          {fechados.length > 0 && (
            <>
              <p className="text-xs text-texto-soft font-medium uppercase tracking-wider mt-2">Resolvidos</p>
              {fechados.map((s) => {
                const badge = intensidadeBadge(s.intensidade);
                return (
                  <div key={s.id} className="bg-white rounded-2xl p-4 opacity-60">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-creme-dark flex items-center justify-center text-sm flex-shrink-0">&#129658;</div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-texto">{s.descricao}</p>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          <p className="text-xs text-texto-soft">{formatDate(s.dataInicio)} &ndash; {formatDate(s.dataFim)}</p>
                          {badge && (
                            <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', badge.className)}>
                              {badge.label}
                            </span>
                          )}
                        </div>
                        {/* Evidencias / fotos */}
                        {s.evidencias && s.evidencias.length > 0 && (
                          <div className="flex gap-2 mt-2 flex-wrap">
                            {s.evidencias.map((src, idx) => (
                              <img
                                key={idx}
                                src={src}
                                alt={`Evidencia ${idx + 1}`}
                                className="w-14 h-14 rounded-lg object-cover border border-creme-dark cursor-pointer hover:border-coral transition-all"
                                onClick={() => setLightbox(src)}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setLightbox(null)}
        >
          <div className="relative max-w-lg max-h-[80vh]" onClick={e => e.stopPropagation()}>
            <img src={lightbox} alt="Evidencia ampliada" className="max-w-full max-h-[80vh] rounded-2xl object-contain shadow-2xl" />
            <button
              onClick={() => setLightbox(null)}
              className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white text-texto shadow-lg flex items-center justify-center text-sm font-bold hover:bg-creme transition-colors"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Plano de Saude Tab ──────────────────────────────────────────────────────

function PlanoSaudeTab({ petId, plano, onUpdate }: {
  petId: string; plano: PlanoSaude | null; onUpdate: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    operadora: '', numeroCartao: '', plano: '', dataVigencia: '', dataExpiracao: '', coberturas: '', observacoes: '',
  });
  const [saving, setSaving] = useState(false);
  const [confirmation, setConfirmation] = useState('');
  const [saveError, setSaveError] = useState('');

  const startEdit = () => {
    if (plano) {
      setForm({
        operadora: plano.operadora || '',
        numeroCartao: plano.numeroCartao || '',
        plano: plano.plano || '',
        dataVigencia: plano.dataVigencia ? plano.dataVigencia.split('T')[0] : '',
        dataExpiracao: plano.dataExpiracao ? plano.dataExpiracao.split('T')[0] : '',
        coberturas: (plano.coberturas || []).join(', '),
        observacoes: plano.observacoes || '',
      });
    } else {
      setForm({ operadora: '', numeroCartao: '', plano: '', dataVigencia: '', dataExpiracao: '', coberturas: '', observacoes: '' });
    }
    setEditing(true);
    setSaveError('');
  };

  const handleCancel = () => {
    setEditing(false);
    setSaveError('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError('');
    try {
      const { data } = await healthApi.upsertPlano(petId, {
        operadora: form.operadora,
        numeroCartao: form.numeroCartao || undefined,
        plano: form.plano || undefined,
        dataVigencia: form.dataVigencia || undefined,
        dataExpiracao: form.dataExpiracao || undefined,
        coberturas: form.coberturas ? form.coberturas.split(',').map(s => s.trim()).filter(Boolean) : [],
        observacoes: form.observacoes || undefined,
      });
      setConfirmation((data as any).mensagem || 'Plano de saude atualizado!');
      setEditing(false);
      onUpdate();
      setTimeout(() => setConfirmation(''), 4000);
    } catch (err: any) {
      setSaveError(err?.response?.data?.message || 'Erro ao salvar plano de saude.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <ConfirmationBanner message={confirmation} />

      {!editing ? (
        <>
          {plano ? (
            <div className="bg-white rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-menta/20 flex items-center justify-center text-lg">&#127973;</div>
                  <div>
                    <p className="font-headline font-semibold text-texto">{plano.operadora}</p>
                    {plano.plano && <p className="text-xs text-texto-soft">Plano: {plano.plano}</p>}
                  </div>
                </div>
                <button onClick={startEdit} className="pt-btn-secondary text-xs py-1.5 px-3">Editar</button>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {plano.numeroCartao && (
                  <div>
                    <p className="text-xs text-texto-soft">Numero do cartao</p>
                    <p className="font-medium text-texto">{plano.numeroCartao}</p>
                  </div>
                )}
                {plano.dataVigencia && (
                  <div>
                    <p className="text-xs text-texto-soft">Vigencia</p>
                    <p className="font-medium text-texto">{formatDate(plano.dataVigencia)}</p>
                  </div>
                )}
                {plano.dataExpiracao && (
                  <div>
                    <p className="text-xs text-texto-soft">Validade</p>
                    <p className="font-medium text-texto">{formatDate(plano.dataExpiracao)}</p>
                  </div>
                )}
              </div>
              {plano.coberturas && plano.coberturas.length > 0 && (
                <div>
                  <p className="text-xs text-texto-soft mb-1">Coberturas</p>
                  <div className="flex flex-wrap gap-1">
                    {plano.coberturas.map((c, i) => (
                      <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-menta/20 text-menta font-medium">{c}</span>
                    ))}
                  </div>
                </div>
              )}
              {plano.observacoes && (
                <div>
                  <p className="text-xs text-texto-soft">Observacoes</p>
                  <p className="text-sm text-texto">{plano.observacoes}</p>
                </div>
              )}
            </div>
          ) : (
            <EmptyState icon="&#127973;" title="Nenhum plano de saude cadastrado" description="Cadastre o plano de saude do seu pet." />
          )}
          {!plano && (
            <button onClick={startEdit} className="pt-btn w-full text-sm">+ Cadastrar plano de saude</button>
          )}
        </>
      ) : (
        <form onSubmit={handleSave} className="pt-card space-y-3 bg-coral-light/30">
          <h3 className="font-headline font-semibold text-texto text-sm">{plano ? 'Editar plano de saude' : 'Novo plano de saude'}</h3>
          <div>
            <label className="pt-label">Operadora *</label>
            <input className="pt-input" placeholder="Porto Seguro, SulAmerica..." value={form.operadora} onChange={(e) => setForm(f => ({ ...f, operadora: e.target.value }))} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="pt-label">Numero do cartao</label>
              <input className="pt-input" placeholder="1234-5678" value={form.numeroCartao} onChange={(e) => setForm(f => ({ ...f, numeroCartao: e.target.value }))} />
            </div>
            <div>
              <label className="pt-label">Nome do plano</label>
              <input className="pt-input" placeholder="Plano Gold..." value={form.plano} onChange={(e) => setForm(f => ({ ...f, plano: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="pt-label">Vigencia</label>
              <input type="date" className="pt-input" value={form.dataVigencia} onChange={(e) => setForm(f => ({ ...f, dataVigencia: e.target.value }))} />
            </div>
            <div>
              <label className="pt-label">Validade</label>
              <input type="date" className="pt-input" value={form.dataExpiracao} onChange={(e) => setForm(f => ({ ...f, dataExpiracao: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="pt-label">Coberturas (separadas por virgula)</label>
            <input className="pt-input" placeholder="Consultas, exames, cirurgias..." value={form.coberturas} onChange={(e) => setForm(f => ({ ...f, coberturas: e.target.value }))} />
          </div>
          <div>
            <label className="pt-label">Observacoes</label>
            <textarea className="pt-input resize-none" rows={2} placeholder="Observacoes adicionais..." value={form.observacoes} onChange={(e) => setForm(f => ({ ...f, observacoes: e.target.value }))} />
          </div>
          {saveError && <p className="text-xs text-erro">{saveError}</p>}
          <div className="flex gap-2 pt-1">
            <button type="submit" disabled={saving} className="pt-btn flex-1 text-sm">{saving ? 'Salvando...' : 'Salvar'}</button>
            <button type="button" onClick={handleCancel} className="pt-btn-secondary text-sm px-4">Cancelar</button>
          </div>
        </form>
      )}
    </div>
  );
}

// ─── Consultas Tab ───────────────────────────────────────────────────────────

function ConsultasTab({ compromissos }: { compromissos: Compromisso[] }) {
  const consultas = compromissos.filter(c => c.tipo === 'CONSULTA');
  const now = new Date();

  const upcoming = consultas.filter(c => {
    if (!c.dataInicio) return true;
    return new Date(c.dataInicio) >= now;
  });

  const past = consultas.filter(c => {
    if (!c.dataInicio) return false;
    return new Date(c.dataInicio) < now;
  });

  if (consultas.length === 0) {
    return (
      <EmptyState icon="&#127973;" title="Nenhuma consulta encontrada" description="Consultas agendadas na aba Agenda aparecem aqui automaticamente." />
    );
  }

  return (
    <div className="space-y-4">
      {upcoming.length > 0 && (
        <>
          <p className="text-xs text-texto-soft font-medium uppercase tracking-wider">Proximas consultas</p>
          <div className="space-y-3">
            {upcoming.map(c => (
              <div key={c.id} className="bg-white rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-azul-light flex items-center justify-center text-base flex-shrink-0">&#127973;</div>
                  <div className="flex-1">
                    <p className="font-semibold text-texto text-sm">{c.titulo}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      {c.dataInicio && <p className="text-xs text-texto-soft">{formatDate(c.dataInicio)}</p>}
                      {c.horarioInicio && <p className="text-xs text-texto-soft">&middot; {c.horarioInicio}{c.horarioFim ? ` - ${c.horarioFim}` : ''}</p>}
                    </div>
                    {c.responsavelNome && <p className="text-xs text-texto-soft mt-0.5">{c.responsavelNome}</p>}
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-azul-light text-azul font-medium flex-shrink-0">Agendada</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {past.length > 0 && (
        <>
          <p className="text-xs text-texto-soft font-medium uppercase tracking-wider mt-2">Consultas anteriores</p>
          <div className="space-y-3">
            {past.map(c => (
              <div key={c.id} className="bg-white rounded-2xl p-4 opacity-60">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-creme-dark flex items-center justify-center text-sm flex-shrink-0">&#127973;</div>
                  <div className="flex-1">
                    <p className="font-medium text-texto text-sm">{c.titulo}</p>
                    <p className="text-xs text-texto-soft mt-0.5">{formatDate(c.dataInicio)}{c.horarioInicio ? ` &middot; ${c.horarioInicio}` : ''}</p>
                    {c.responsavelNome && <p className="text-xs text-texto-soft">{c.responsavelNome}</p>}
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-creme-dark text-texto-soft font-medium flex-shrink-0">Realizada</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Carteira de Vacinacao Tab ───────────────────────────────────────────────

const BADGE_DEFS = [
  { id: 'primeira', icon: '🛡️', label: 'Primeira vacina', check: (applied: number) => applied >= 1 },
  { id: 'dia', icon: '💉', label: 'Dia em dia', check: (_a: number, _t: number, overdue: number) => overdue === 0 && _a > 0 },
  { id: 'total', icon: '🏆', label: 'Protecao total', check: (applied: number, total: number) => total > 0 && applied >= total },
  { id: 'vet', icon: '⭐', label: 'Vet de confianca', check: (_a: number, _t: number, _o: number, hasVet: boolean) => hasVet },
] as const;

function ProtectionRing({ percentage }: { percentage: number }) {
  const r = 44;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percentage / 100) * circ;
  const color = percentage < 40 ? '#F28B6E' : percentage < 70 ? '#E8C547' : '#7ECBA1';
  return (
    <svg width="100" height="100" viewBox="0 0 100 100" className="transform -rotate-90">
      <circle cx="50" cy="50" r={r} fill="none" stroke="#f0ebe4" strokeWidth="8" />
      <circle
        cx="50" cy="50" r={r} fill="none"
        stroke={color} strokeWidth="8" strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={offset}
        className="transition-all duration-1000 ease-out"
      />
    </svg>
  );
}

function CarteiraTab({ petId, pet, vacinas, especie, role, onUpdate }: {
  petId: string; pet: Pet | null; vacinas: Vacina[]; especie: string; role?: string; onUpdate: () => void;
}) {
  const [recomendacoes, setRecomendacoes] = useState<RecomendacaoVacina[]>([]);
  const [agendamentos, setAgendamentos] = useState<AgendamentoVacina[]>([]);
  const [loadingCarteira, setLoadingCarteira] = useState(true);
  const [confirmation, setConfirmation] = useState('');
  const [showRecForm, setShowRecForm] = useState(false);
  const [showAgForm, setShowAgForm] = useState(false);
  const [recForm, setRecForm] = useState({ nomeVacina: '', nota: '' });
  const [agForm, setAgForm] = useState({ nomeVacina: '', dataAgendada: '' });
  const [saving, setSaving] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const isVet = role === 'VETERINARIO' || role === 'VETERINARIA';

  const loadCarteira = useCallback(async () => {
    try {
      const [recRes, agRes] = await Promise.all([
        healthApi.recomendacoesVacina(petId).catch(() => ({ data: [] })),
        healthApi.agendamentosVacina(petId).catch(() => ({ data: [] })),
      ]);
      setRecomendacoes(Array.isArray(recRes.data) ? recRes.data : []);
      setAgendamentos(Array.isArray(agRes.data) ? agRes.data : []);
    } catch { /* silent */ } finally {
      setLoadingCarteira(false);
    }
  }, [petId]);

  useEffect(() => { loadCarteira(); }, [loadCarteira]);

  // ─── Compute protection ──────────────────────────────────────────────────
  const vacinasEspecie = VACINAS_POR_ESPECIE[especie] ?? [];
  const recNomes = recomendacoes.map(r => r.nomeVacina);
  const allRecommended = Array.from(new Set([...vacinasEspecie, ...recNomes]));

  // Normalize para comparacao (lowercase, sem acentos basico)
  const normalize = (s: string) => s.toLowerCase().replace(/[áàã]/g, 'a').replace(/[éê]/g, 'e').replace(/[íî]/g, 'i').replace(/[óõô]/g, 'o').replace(/[úû]/g, 'u').replace(/[ç]/g, 'c').replace(/[()]/, '').trim();

  const appliedNames = new Set(vacinas.map(v => normalize(v.nome)));
  const agendadoNames = new Set(
    agendamentos.filter(a => a.status === 'PENDENTE' || a.status === 'CONFIRMADA').map(a => normalize(a.nomeVacina))
  );

  // Vacinas aplicadas com protecao ativa (nao vencidas)
  const vacinasProtegidas = vacinas.filter(v => {
    if (!v.proximaDose) return true;
    return new Date(v.proximaDose) > new Date();
  });
  const protectedNames = new Set(vacinasProtegidas.map(v => normalize(v.nome)));

  const totalRecommended = allRecommended.length;
  const totalProtected = allRecommended.filter(name => protectedNames.has(normalize(name))).length;
  const percentage = totalRecommended > 0 ? Math.round((totalProtected / totalRecommended) * 100) : 0;

  const protectionLabel = percentage < 40 ? 'Protecao inicial' : percentage < 70 ? 'Bem protegido' : 'Imunizacao completa';
  const protectionEmoji = percentage < 40 ? '🛡️' : percentage < 70 ? '💪' : '🏆';

  // Overdue count
  const overdueCount = vacinas.filter(v => vacinaAlertStatus(v.proximaDose) === 'overdue').length;

  // Has vet linked
  const hasVet = (pet?.petUsuarios || []).some(pu => pu.role === 'VETERINARIO' || pu.role === 'VETERINARIA' as any);

  // Badges
  const badges = BADGE_DEFS.map(b => ({
    ...b,
    earned: b.check(vacinasProtegidas.length, totalRecommended, overdueCount, hasVet),
  }));

  // Categorize vaccines
  const appliedVacinas = vacinas.sort((a, b) => new Date(b.dataAplicacao).getTime() - new Date(a.dataAplicacao).getTime());

  const activeAgendamentos = agendamentos.filter(a => a.status === 'PENDENTE' || a.status === 'CONFIRMADA');

  const pendingVacinas = allRecommended.filter(name => {
    const n = normalize(name);
    return !appliedNames.has(n) && !agendadoNames.has(n);
  });

  // Next upcoming
  const nextVacina = [...vacinas]
    .filter(v => v.proximaDose && new Date(v.proximaDose) > new Date())
    .sort((a, b) => new Date(a.proximaDose!).getTime() - new Date(b.proximaDose!).getTime())[0];

  const nextAgendamento = activeAgendamentos
    .sort((a, b) => new Date(a.dataAgendada).getTime() - new Date(b.dataAgendada).getTime())[0];

  // Confetti trigger
  useEffect(() => {
    if (percentage === 100 && !showConfetti) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, [percentage, showConfetti]);

  // ─── Actions ─────────────────────────────────────────────────────────────
  const flash = (msg: string) => { setConfirmation(msg); setTimeout(() => setConfirmation(''), 4000); };

  const handleConfirmar = async (agId: string) => {
    try {
      await healthApi.confirmarAgendamento(petId, agId);
      flash('Agendamento confirmado!');
      loadCarteira();
    } catch { flash('Erro ao confirmar.'); }
  };

  const handleCancelar = async (agId: string) => {
    try {
      await healthApi.cancelarAgendamento(petId, agId);
      flash('Agendamento cancelado.');
      loadCarteira();
    } catch { flash('Erro ao cancelar.'); }
  };

  const handleLembrar = async (nomeVacina: string) => {
    try {
      const { data } = await healthApi.lembrarTutorVacina(petId, nomeVacina);
      flash((data as any).mensagem || 'Lembrete enviado!');
    } catch { flash('Erro ao enviar lembrete.'); }
  };

  const handleRecomendar = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await healthApi.recomendarVacina(petId, recForm);
      flash(`Vacina "${recForm.nomeVacina}" recomendada ao tutor!`);
      setShowRecForm(false);
      setRecForm({ nomeVacina: '', nota: '' });
      loadCarteira();
      onUpdate();
    } catch { flash('Erro ao recomendar.'); }
    finally { setSaving(false); }
  };

  const handleAgendar = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await healthApi.agendarVacina(petId, agForm);
      flash(`Vacina "${agForm.nomeVacina}" agendada!`);
      setShowAgForm(false);
      setAgForm({ nomeVacina: '', dataAgendada: '' });
      loadCarteira();
      onUpdate();
    } catch { flash('Erro ao agendar.'); }
    finally { setSaving(false); }
  };

  // ─── Render ──────────────────────────────────────────────────────────────

  if (loadingCarteira) {
    return (
      <div className="space-y-4">
        <div className="pt-card"><div className="h-32 pt-skeleton rounded-xl" /></div>
        <div className="flex gap-3">{[1,2,3,4].map(i => <div key={i} className="h-16 w-16 pt-skeleton rounded-xl" />)}</div>
        {[1,2,3].map(i => <div key={i} className="pt-card"><div className="h-20 pt-skeleton rounded-xl" /></div>)}
      </div>
    );
  }

  const vacinasDisponiveisForm = Array.from(new Set([...vacinasEspecie, ...pendingVacinas])).filter(Boolean);

  return (
    <div className="space-y-5">
      <ConfirmationBanner message={confirmation} />

      {/* Confetti */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-${Math.random() * 20}px`,
                animationDelay: `${Math.random() * 1}s`,
                animationDuration: `${1.5 + Math.random() * 2}s`,
                fontSize: `${12 + Math.random() * 16}px`,
              }}
            >
              {['🎉', '⭐', '🏆', '💉', '🛡️', '✨'][Math.floor(Math.random() * 6)]}
            </div>
          ))}
        </div>
      )}

      {/* ── Capa da Caderneta ──────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl p-5 relative overflow-hidden">
        {/* Dot grid background */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'radial-gradient(circle, #333 1px, transparent 1px)',
          backgroundSize: '16px 16px',
        }} />

        <div className="relative flex items-center gap-5">
          {/* Pet photo + ring */}
          <div className="relative flex-shrink-0">
            <ProtectionRing percentage={percentage} />
            <div className="absolute inset-0 flex items-center justify-center">
              {pet?.fotoUrl ? (
                <img src={pet.fotoUrl} alt={pet.nome} className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-creme flex items-center justify-center text-2xl border-2 border-white">
                  {pet?.especie === 'GATO' ? '🐱' : '🐶'}
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-headline font-bold text-texto text-lg truncate">{pet?.nome || 'Pet'}</h3>
              <span className="text-base">{protectionEmoji}</span>
            </div>
            <p className="text-sm text-texto-soft">{pet?.especie ? pet.especie.charAt(0) + pet.especie.slice(1).toLowerCase() : ''} {pet?.raca ? `\u00B7 ${pet.raca}` : ''}</p>

            <div className="mt-2 flex items-center gap-2">
              <span className={cn(
                'text-2xl font-headline font-bold',
                percentage < 40 ? 'text-coral' : percentage < 70 ? 'text-yellow-600' : 'text-menta',
              )}>{percentage}%</span>
              <span className="text-xs text-texto-soft">{protectionLabel}</span>
            </div>

            {/* Next upcoming */}
            {(nextVacina || nextAgendamento) && (
              <div className="mt-2 px-3 py-1.5 bg-creme rounded-lg inline-flex items-center gap-2">
                <span className="text-xs">📅</span>
                <span className="text-[11px] text-texto font-medium">
                  {nextAgendamento
                    ? `${nextAgendamento.nomeVacina} em ${formatDate(nextAgendamento.dataAgendada)}`
                    : nextVacina
                      ? `Proxima: ${nextVacina.nome} em ${formatDate(nextVacina.proximaDose!)}`
                      : ''
                  }
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Badges / Conquistas ────────────────────────────────────────────── */}
      <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
        {badges.map(b => (
          <div
            key={b.id}
            className={cn(
              'flex flex-col items-center gap-1.5 min-w-[72px] px-3 py-3 rounded-xl border transition-all',
              b.earned
                ? 'bg-white border-menta/30 shadow-sm'
                : 'bg-creme-dark/50 border-transparent opacity-40 grayscale',
            )}
          >
            <span className="text-2xl">{b.icon}</span>
            <span className="text-[10px] text-texto-soft font-medium text-center leading-tight">{b.label}</span>
          </div>
        ))}
      </div>

      {/* ── Vet Actions ────────────────────────────────────────────────────── */}
      {isVet && (
        <div className="flex gap-2">
          <button onClick={() => setShowRecForm(!showRecForm)} className="pt-btn text-sm flex-1">
            📋 Recomendar vacina
          </button>
          <button onClick={() => setShowAgForm(!showAgForm)} className="pt-btn-secondary text-sm flex-1">
            📅 Agendar vacina
          </button>
        </div>
      )}

      {/* Rec form */}
      {showRecForm && (
        <form onSubmit={handleRecomendar} className="pt-card space-y-3 bg-azul-light/30">
          <h3 className="font-headline font-semibold text-texto text-sm">Recomendar vacina</h3>
          <div>
            <label className="pt-label">Vacina *</label>
            <select className="pt-input" value={recForm.nomeVacina} onChange={e => setRecForm(f => ({ ...f, nomeVacina: e.target.value }))} required>
              <option value="">Selecione...</option>
              {vacinasDisponiveisForm.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="pt-label">Nota para o tutor</label>
            <input className="pt-input" placeholder="Ex: Recomendada por contato com outros caes..." value={recForm.nota} onChange={e => setRecForm(f => ({ ...f, nota: e.target.value }))} />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="pt-btn text-sm flex-1">{saving ? 'Enviando...' : 'Recomendar'}</button>
            <button type="button" onClick={() => setShowRecForm(false)} className="pt-btn-secondary text-sm px-4">Cancelar</button>
          </div>
        </form>
      )}

      {/* Ag form */}
      {showAgForm && (
        <form onSubmit={handleAgendar} className="pt-card space-y-3 bg-amarelo-light/30">
          <h3 className="font-headline font-semibold text-texto text-sm">Agendar vacina</h3>
          <div>
            <label className="pt-label">Vacina *</label>
            <select className="pt-input" value={agForm.nomeVacina} onChange={e => setAgForm(f => ({ ...f, nomeVacina: e.target.value }))} required>
              <option value="">Selecione...</option>
              {vacinasDisponiveisForm.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="pt-label">Data *</label>
            <input type="date" className="pt-input" value={agForm.dataAgendada} onChange={e => setAgForm(f => ({ ...f, dataAgendada: e.target.value }))} required />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="pt-btn text-sm flex-1">{saving ? 'Agendando...' : 'Agendar'}</button>
            <button type="button" onClick={() => setShowAgForm(false)} className="pt-btn-secondary text-sm px-4">Cancelar</button>
          </div>
        </form>
      )}

      {/* ── Aplicadas (selos carimbados) ───────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-menta/20 flex items-center justify-center text-xs">✅</div>
          <h3 className="font-headline font-semibold text-texto text-sm">Aplicadas</h3>
          <span className="text-xs text-texto-soft">({appliedVacinas.length})</span>
        </div>

        {appliedVacinas.length === 0 ? (
          <p className="text-xs text-texto-soft pl-8">Nenhuma vacina aplicada ainda.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {appliedVacinas.map((v, idx) => {
              const alert = vacinaAlertStatus(v.proximaDose);
              const rotation = idx % 3 === 0 ? 'rotate-[1deg]' : idx % 3 === 1 ? '-rotate-[1deg]' : 'rotate-[0.5deg]';
              return (
                <div key={v.id} className={cn(
                  'bg-white rounded-2xl p-4 border-2 transition-all hover:shadow-md',
                  rotation,
                  alert === 'overdue' ? 'border-red-300' : alert === 'soon' ? 'border-yellow-300' : 'border-menta/40',
                )}>
                  {/* Stamp header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold',
                        alert === 'overdue' ? 'bg-red-100 text-red-600' : alert === 'soon' ? 'bg-yellow-100 text-yellow-600' : 'bg-menta/20 text-menta',
                      )}>
                        {alert === 'overdue' ? '!' : alert === 'soon' ? '⏰' : '✓'}
                      </div>
                      <div>
                        <p className="font-semibold text-texto text-sm leading-tight">{v.nome}</p>
                        <p className="text-[11px] text-texto-soft">{formatDate(v.dataAplicacao)}</p>
                      </div>
                    </div>
                    {alert === 'overdue' && <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-medium">Vencida</span>}
                    {alert === 'soon' && <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-600 font-medium">Em breve</span>}
                  </div>

                  {/* Details */}
                  <div className="mt-2 pl-10 space-y-0.5">
                    {v.veterinario && <p className="text-[11px] text-texto-soft">🩺 {v.veterinario}{v.clinica ? ` \u00B7 ${v.clinica}` : ''}</p>}
                    {v.lote && <p className="text-[11px] text-texto-soft">📦 Lote {v.lote}</p>}
                    {v.proximaDose && (
                      <p className={cn('text-[11px] font-medium', alert === 'overdue' ? 'text-red-500' : alert === 'soon' ? 'text-yellow-600' : 'text-menta')}>
                        Proxima: {formatDate(v.proximaDose)}
                      </p>
                    )}
                  </div>

                  {/* Vet lembrar button */}
                  {isVet && (alert === 'overdue' || alert === 'soon') && (
                    <button onClick={() => handleLembrar(v.nome)} className="mt-2 ml-10 text-[11px] text-coral font-medium hover:underline">
                      🔔 Lembrar tutor
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Agendadas ──────────────────────────────────────────────────────── */}
      {activeAgendamentos.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-amarelo/20 flex items-center justify-center text-xs">📅</div>
            <h3 className="font-headline font-semibold text-texto text-sm">Agendadas</h3>
            <span className="text-xs text-texto-soft">({activeAgendamentos.length})</span>
          </div>

          <div className="space-y-3">
            {activeAgendamentos.map(ag => {
              const daysUntil = Math.ceil((new Date(ag.dataAgendada).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
              const isPast = daysUntil < 0;
              return (
                <div key={ag.id} className="bg-white rounded-2xl p-4 border-2 border-dashed border-amarelo/50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amarelo/20 flex items-center justify-center text-sm">📅</div>
                      <div>
                        <p className="font-semibold text-texto text-sm">{ag.nomeVacina}</p>
                        <p className="text-[11px] text-texto-soft">{formatDate(ag.dataAgendada)}</p>
                        {ag.veterinarioNome && <p className="text-[11px] text-texto-soft">🩺 {ag.veterinarioNome}</p>}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={cn(
                        'text-[10px] px-2 py-0.5 rounded-full font-medium',
                        ag.status === 'CONFIRMADA' ? 'bg-menta/20 text-menta' : 'bg-amarelo/20 text-yellow-700',
                      )}>
                        {ag.status === 'CONFIRMADA' ? 'Confirmada' : 'Aguardando'}
                      </span>
                      <p className={cn('text-[11px] font-medium mt-1', isPast ? 'text-red-500' : 'text-amarelo')}>
                        {isPast ? 'Atrasada' : `Em ${daysUntil} dia${daysUntil === 1 ? '' : 's'}`}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  {ag.status === 'PENDENTE' && (
                    <div className="flex gap-2 mt-3 pl-11">
                      <button onClick={() => handleConfirmar(ag.id)} className="pt-btn text-[11px] px-3 py-1.5">Confirmar</button>
                      <button onClick={() => handleCancelar(ag.id)} className="pt-btn-ghost text-[11px] px-3 py-1.5 text-red-500">Cancelar</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Pendentes (nao marcou) ─────────────────────────────────────────── */}
      {pendingVacinas.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-coral/20 flex items-center justify-center text-xs">⚠️</div>
            <h3 className="font-headline font-semibold text-texto text-sm">Pendentes</h3>
            <span className="text-xs text-texto-soft">({pendingVacinas.length})</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {pendingVacinas.map(name => {
              const rec = recomendacoes.find(r => r.nomeVacina === name);
              const isFromSpecies = vacinasEspecie.includes(name);
              return (
                <div key={name} className="bg-coral/[0.04] rounded-2xl p-4 border-2 border-dashed border-coral/30">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-coral/10 flex items-center justify-center text-sm">💉</div>
                      <div>
                        <p className="font-semibold text-texto text-sm">{name}</p>
                        {rec ? (
                          <p className="text-[11px] text-azul font-medium">📋 Recomendada por {rec.veterinarioNome}</p>
                        ) : isFromSpecies ? (
                          <p className="text-[11px] text-texto-soft">Recomendada para {especie.charAt(0) + especie.slice(1).toLowerCase()}</p>
                        ) : null}
                        {rec?.nota && <p className="text-[11px] text-texto-soft italic mt-0.5">&ldquo;{rec.nota}&rdquo;</p>}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-3 pl-11">
                    {isVet ? (
                      <>
                        <button
                          onClick={() => { setAgForm({ nomeVacina: name, dataAgendada: '' }); setShowAgForm(true); }}
                          className="pt-btn text-[11px] px-3 py-1.5"
                        >
                          📅 Agendar
                        </button>
                        <button onClick={() => handleLembrar(name)} className="pt-btn-ghost text-[11px] px-3 py-1.5">
                          🔔 Lembrar tutor
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => { setAgForm({ nomeVacina: name, dataAgendada: '' }); setShowAgForm(true); }}
                        className="pt-btn text-[11px] px-3 py-1.5"
                      >
                        📅 Agendar
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {appliedVacinas.length === 0 && activeAgendamentos.length === 0 && pendingVacinas.length === 0 && (
        <EmptyState icon="📋" title="Carteira vazia" description="Registre vacinas na aba Vacinas para preencher a carteira do seu pet." />
      )}
    </div>
  );
}

// ─── Main Saude Page ─────────────────────────────────────────────────────────

export default function SaudePage() {
  const params = useParams();
  const petId = params?.id as string;

  const [pet, setPet] = useState<Pet | null>(null);
  const [vacinas, setVacinas] = useState<Vacina[]>([]);
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [sintomas, setSintomas] = useState<Sintoma[]>([]);
  const [plano, setPlano] = useState<PlanoSaude | null>(null);
  const [compromissos, setCompromissos] = useState<Compromisso[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<SubTab>('carteira');

  // ─── Data loading ──────────────────────────────────────────────────────────

  const loadData = useCallback(async () => {
    try {
      const [petRes, vacRes, medRes, sintRes, planoRes, compRes] = await Promise.all([
        petsApi.get(petId).catch(() => ({ data: null })),
        healthApi.vacinas(petId).catch(() => ({ data: [] })),
        healthApi.medicamentos(petId).catch(() => ({ data: [] })),
        healthApi.sintomas(petId).catch(() => ({ data: [] })),
        healthApi.planoSaude(petId).catch(() => ({ data: null })),
        compromissosApi.list(petId).catch(() => ({ data: [] })),
      ]);

      setPet(petRes.data as Pet | null);
      setVacinas(Array.isArray(vacRes.data) ? vacRes.data : []);
      setMedicamentos(Array.isArray(medRes.data) ? medRes.data : []);
      setSintomas(Array.isArray(sintRes.data) ? sintRes.data : []);
      setPlano(planoRes.data as PlanoSaude | null);
      setCompromissos(Array.isArray(compRes.data) ? compRes.data : []);
    } catch (err) {
      console.error('Erro ao carregar dados de saude:', err);
    } finally {
      setLoading(false);
    }
  }, [petId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ─── Computed stats ────────────────────────────────────────────────────────

  const vacinasEmDia = vacinas.filter(v => {
    if (!v.proximaDose) return true;
    return new Date(v.proximaDose) > new Date();
  }).length;

  const medicamentosAtivos = medicamentos.filter(m => m.status === 'ATIVO').length;

  const sintomasAbertos = sintomas.filter(s => !s.dataFim).length;

  // ─── Loading skeleton ─────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="pt-card">
              <div className="h-16 pt-skeleton rounded-xl" />
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-9 w-24 pt-skeleton rounded-xl flex-shrink-0" />
          ))}
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="pt-card">
            <div className="space-y-2">
              <div className="h-4 pt-skeleton w-2/3" />
              <div className="h-3 pt-skeleton w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="font-headline text-xl font-bold text-texto">Saude</h1>
        <p className="text-sm text-texto-soft mt-0.5">Painel de saude de {pet?.nome || 'seu pet'}</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-rosa-light rounded-2xl p-4 text-center">
          <p className="text-2xl font-headline font-bold text-texto">{vacinasEmDia}</p>
          <p className="text-[11px] text-texto-soft mt-1 leading-tight">Vacinas em dia</p>
        </div>
        <div className="bg-azul-light rounded-2xl p-4 text-center">
          <p className="text-2xl font-headline font-bold text-texto">{medicamentosAtivos}</p>
          <p className="text-[11px] text-texto-soft mt-1 leading-tight">Medicamentos ativos</p>
        </div>
        <div className="bg-amarelo-light rounded-2xl p-4 text-center">
          <p className="text-2xl font-headline font-bold text-texto">{sintomasAbertos}</p>
          <p className="text-[11px] text-texto-soft mt-1 leading-tight">Sintomas abertos</p>
        </div>
      </div>

      {/* Sub-tab pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {SUBTABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex-shrink-0',
              activeTab === t.id
                ? 'bg-coral text-white shadow-sm'
                : 'bg-white text-texto-soft hover:bg-creme-dark',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'carteira' && (
          <CarteiraTab petId={petId} pet={pet} vacinas={vacinas} especie={pet?.especie || 'OUTRO'} role={pet?.meuRole} onUpdate={loadData} />
        )}
        {activeTab === 'vacinas' && (
          <VacinasTab petId={petId} especie={pet?.especie || 'OUTRO'} vacinas={vacinas} onUpdate={loadData} />
        )}
        {activeTab === 'medicamentos' && (
          <MedicamentosTab petId={petId} especie={pet?.especie || 'OUTRO'} medicamentos={medicamentos} onUpdate={loadData} />
        )}
        {activeTab === 'sintomas' && (
          <SintomasTab petId={petId} sintomas={sintomas} onUpdate={loadData} />
        )}
        {activeTab === 'plano' && (
          <PlanoSaudeTab petId={petId} plano={plano} onUpdate={loadData} />
        )}
        {activeTab === 'consultas' && (
          <ConsultasTab compromissos={compromissos} />
        )}
      </div>
    </div>
  );
}
