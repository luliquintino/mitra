'use client';

import { useState } from 'react';
import { BottomSheet } from '@/components/BottomSheet';
import { healthApi } from '@/lib/api';
import { Vacina, Medicamento } from '@/types';
import { formatDate, cn } from '@/lib/utils';

// ─── Data Tables ─────────────────────────────────────────────────────────────

type MedInfo = { nome: string; dosagem: string; frequencia: string; motivos: string[] };

const MEDICAMENTOS_POR_ESPECIE: Record<string, MedInfo[]> = {
  CACHORRO: [
    { nome: 'Bravecto (Fluralaner)',        dosagem: '1 comprimido (por peso)',      frequencia: 'A cada 3 meses',    motivos: ['Prevencao de pulgas e carrapatos'] },
    { nome: 'Simparica (Sarolaner)',         dosagem: '1 comprimido (por peso)',      frequencia: 'Mensal',            motivos: ['Prevencao de pulgas e carrapatos'] },
    { nome: 'NexGard (Afoxolaner)',          dosagem: '1 comprimido (por peso)',      frequencia: 'Mensal',            motivos: ['Prevencao de pulgas e carrapatos'] },
    { nome: 'Milbemax (Milbemicina+Praz.)', dosagem: '1 comprimido (por peso)',      frequencia: 'A cada 3 meses',    motivos: ['Vermifugacao', 'Prevencao de vermes intestinais'] },
    { nome: 'Drontal Plus',                  dosagem: '1 comprimido por 10 kg',       frequencia: 'A cada 3 meses',    motivos: ['Vermifugacao'] },
    { nome: 'Heartgard (Ivermectina)',        dosagem: '1 comprimido (por peso)',      frequencia: 'Mensal',            motivos: ['Prevencao de dirofilariose', 'Controle de parasitas internos'] },
    { nome: 'Amoxicilina',                   dosagem: '10-20 mg/kg',                  frequencia: 'A cada 12 horas',   motivos: ['Infeccao bacteriana', 'Antibioticoterapia'] },
    { nome: 'Metronidazol',                  dosagem: '10-15 mg/kg',                  frequencia: 'A cada 12 horas',   motivos: ['Infeccao gastrointestinal', 'Giardiase'] },
    { nome: 'Prednisolona',                  dosagem: '1-2 mg/kg',                    frequencia: 'Uma vez ao dia',    motivos: ['Anti-inflamatorio', 'Tratamento de alergias'] },
    { nome: 'Omega 3',                       dosagem: '1 capsula',                    frequencia: 'Uma vez ao dia',    motivos: ['Suplementacao', 'Saude da pele e pelagem'] },
  ],
  GATO: [
    { nome: 'Revolution (Selamectina)',      dosagem: '1 pipeta (por peso)',          frequencia: 'Mensal',            motivos: ['Prevencao de pulgas', 'Controle de parasitas'] },
    { nome: 'Bravecto Plus',                 dosagem: '1 pipeta (por peso)',          frequencia: 'A cada 2 meses',    motivos: ['Prevencao de pulgas e carrapatos'] },
    { nome: 'Profender (Emodepsida+Praz.)', dosagem: '1 pipeta (por peso)',          frequencia: 'A cada 3 meses',    motivos: ['Vermifugacao'] },
    { nome: 'Milbemax Gato',                 dosagem: '1 comprimido (por peso)',      frequencia: 'A cada 3 meses',    motivos: ['Vermifugacao'] },
    { nome: 'Amoxicilina',                   dosagem: '10-20 mg/kg',                  frequencia: 'A cada 12 horas',   motivos: ['Infeccao bacteriana', 'Antibioticoterapia'] },
    { nome: 'Prednisolona',                  dosagem: '1-2 mg/kg',                    frequencia: 'Uma vez ao dia',    motivos: ['Anti-inflamatorio', 'Tratamento de alergias'] },
    { nome: 'Omega 3',                       dosagem: '1 capsula',                    frequencia: 'Uma vez ao dia',    motivos: ['Suplementacao', 'Saude da pele e pelagem'] },
  ],
  CAVALO: [
    { nome: 'Ivermectina (pasta)',           dosagem: '200 mcg/kg',                   frequencia: 'A cada 6-8 semanas', motivos: ['Controle de parasitas internos'] },
    { nome: 'Fenbendazol',                   dosagem: '5-10 mg/kg',                   frequencia: 'A cada 6-8 semanas', motivos: ['Vermifugacao'] },
    { nome: 'Fenilbutazona',                 dosagem: '2,2-4,4 mg/kg',               frequencia: 'A cada 12-24 horas', motivos: ['Anti-inflamatorio', 'Dor musculoesqueletica'] },
    { nome: 'Flunixin Meglumine',            dosagem: '1,1 mg/kg',                    frequencia: 'A cada 12 horas',   motivos: ['Anti-inflamatorio', 'Colica', 'Dor'] },
  ],
  PEIXE: [
    { nome: 'Sal de cozinha (NaCl)',         dosagem: '1-3 g/L de agua',              frequencia: 'Banho de 5-30 min', motivos: ['Tratamento de infeccoes externas', 'Estresse'] },
    { nome: 'Methylene Blue',                dosagem: '1-3 mg/L',                     frequencia: 'Por 3-5 dias',      motivos: ['Tratamento de fungos e bacterias'] },
  ],
  PASSARO: [
    { nome: 'Ivermectina (solucao)',          dosagem: '0,2 mg/kg',                   frequencia: 'A cada 30 dias',    motivos: ['Controle de parasitas externos'] },
    { nome: 'Espiramicina + Metronidazol',   dosagem: 'Conforme bula',                frequencia: 'Por 5-7 dias',      motivos: ['Tricomoniase', 'Infeccao bacteriana'] },
  ],
  ROEDOR: [
    { nome: 'Ivermectina',                   dosagem: '0,2-0,4 mg/kg',               frequencia: 'A cada 14 dias',    motivos: ['Controle de acaros e parasitas'] },
    { nome: 'Enrofloxacino',                 dosagem: '5-10 mg/kg',                   frequencia: 'A cada 12 horas',   motivos: ['Infeccao bacteriana', 'Antibioticoterapia'] },
  ],
  COELHO: [
    { nome: 'Ivermectina',                   dosagem: '0,2-0,4 mg/kg',               frequencia: 'A cada 14 dias',    motivos: ['Controle de parasitas'] },
    { nome: 'Meloxicam',                     dosagem: '0,3-0,6 mg/kg',               frequencia: 'Uma vez ao dia',    motivos: ['Anti-inflamatorio', 'Dor'] },
    { nome: 'Enrofloxacino',                 dosagem: '5-10 mg/kg',                   frequencia: 'A cada 12 horas',   motivos: ['Infeccao bacteriana', 'Antibioticoterapia'] },
  ],
  REPTIL: [
    { nome: 'Ivermectina (topica)',           dosagem: 'Conforme peso',               frequencia: 'A cada 14 dias',    motivos: ['Controle de parasitas externos'] },
    { nome: 'Metronidazol',                  dosagem: '20-50 mg/kg',                  frequencia: 'A cada 48 horas',   motivos: ['Parasitas intestinais', 'Infeccao por protozoarios'] },
  ],
  FURAO: [
    { nome: 'Ivermectina',                   dosagem: '0,2-0,4 mg/kg',               frequencia: 'A cada 14 dias',    motivos: ['Controle de parasitas'] },
    { nome: 'Prednisolona',                  dosagem: '1-2 mg/kg',                    frequencia: 'Uma vez ao dia',    motivos: ['Anti-inflamatorio', 'Insulinoma'] },
    { nome: 'Amoxicilina',                   dosagem: '10-20 mg/kg',                  frequencia: 'A cada 12 horas',   motivos: ['Infeccao bacteriana', 'Antibioticoterapia'] },
  ],
  OUTRO: [],
};

const VACINAS_POR_ESPECIE: Record<string, string[]> = {
  CACHORRO: [
    'V8 (Polivalente)', 'V10 (Polivalente)', 'Antirrabica',
    'Gripe Canina (Bordetella)', 'Leishmaniose', 'Giardia', 'Leptospirose',
  ],
  GATO: [
    'Triplice Felina (FPV/FHV/FCV)', 'Quadrupla Felina', 'Antirrabica',
    'Leucemia Felina (FeLV)', 'FIV/FeLV Combo',
  ],
  CAVALO: [
    'Influenza Equina', 'Tetano', 'Encefalomielite',
    'Raiva Equina', 'Herpesvirus Equino', 'Botulismo',
  ],
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
  if (num <= 2) return { label: 'Leve', className: 'bg-creme-dark text-texto-soft' };
  if (num <= 3) return { label: 'Moderado', className: 'bg-coral-light text-coral' };
  return { label: 'Grave', className: 'bg-erro-light text-erro' };
}

// ─── Props ───────────────────────────────────────────────────────────────────

interface SaudeSheetProps {
  open: boolean;
  onClose: () => void;
  petId: string;
  pet: { especie: string; [key: string]: any };
  vacinas: Vacina[];
  medicamentos: Medicamento[];
  sintomas: any[];
  onUpdate: () => void;
}

type SubTab = 'vacinas' | 'medicamentos' | 'sintomas';

// ─── Empty State ─────────────────────────────────────────────────────────────

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

// ─── Confirmation Banner ─────────────────────────────────────────────────────

function ConfirmationBanner({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="rounded-xl bg-creme-dark px-4 py-3 flex items-center gap-2 animate-fade-in">
      <span className="text-texto-soft text-sm">&#10003;</span>
      <span className="text-sm text-texto font-medium">{message}</span>
    </div>
  );
}

// ─── Vacinas Tab ─────────────────────────────────────────────────────────────

function VacinasTab({ petId, especie, vacinas: initialVacinas, onUpdate }: {
  petId: string; especie: string; vacinas: Vacina[]; onUpdate: () => void;
}) {
  const vacinasDisponiveis = VACINAS_POR_ESPECIE[especie] ?? [];
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    nome: '', dataAplicacao: '', proximaDose: '', veterinario: '', crmv: '', clinica: '',
  });
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
    setForm({ nome: '', dataAplicacao: '', proximaDose: '', veterinario: '', crmv: '', clinica: '' });
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
      });
      setConfirmation(data.mensagem || 'Vacina registrada com sucesso!');
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
          + Registrar vacina
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="pt-card space-y-3 bg-coral-light/30">
          <h3 className="font-semibold text-texto text-sm">Nova vacina</h3>
          <div className="space-y-2">
            <label className="pt-label">Nome da vacina *</label>
            {vacinasDisponiveis.length > 0 ? (
              <>
                <select
                  className="pt-input"
                  value={form.nome}
                  onChange={(e) => handleNomeChange(e.target.value)}
                  required={!isOutraVacina}
                >
                  <option value="">Selecione a vacina</option>
                  {vacinasDisponiveis.map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                  <option value="__OUTRA__">Outra vacina...</option>
                </select>
                {isOutraVacina && (
                  <input
                    className="pt-input"
                    placeholder="Nome da vacina..."
                    value={nomeManual}
                    onChange={(e) => setNomeManual(e.target.value)}
                    autoFocus
                    required
                  />
                )}
              </>
            ) : (
              <input
                className="pt-input"
                placeholder="V10, Antirrabica..."
                value={form.nome}
                onChange={(e) => setForm(f => ({ ...f, nome: e.target.value }))}
                required
              />
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
          <div>
            <label className="pt-label">Clinica</label>
            <input className="pt-input" placeholder="VetCare" value={form.clinica} onChange={(e) => setForm(f => ({ ...f, clinica: e.target.value }))} />
          </div>
          {saveError && <p className="text-xs text-erro">{saveError}</p>}
          <div className="flex gap-2 pt-1">
            <button type="submit" disabled={saving} className="pt-btn flex-1 text-sm">
              {saving ? 'Salvando...' : 'Registrar vacina'}
            </button>
            <button type="button" onClick={handleCancel} className="pt-btn-secondary text-sm px-4">
              Cancelar
            </button>
          </div>
        </form>
      )}

      {initialVacinas.length === 0 ? (
        <EmptyState
          icon="&#128137;"
          title="Nenhuma vacina registrada"
          description="Registre as vacinas do seu pet para manter o historico de imunizacao."
        />
      ) : (
        <div className="space-y-3">
          {initialVacinas.map((v) => (
            <div key={v.id} className="bg-white rounded-xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-creme-dark flex items-center justify-center text-base flex-shrink-0">&#128137;</div>
                  <div>
                    <p className="font-semibold text-texto text-sm">{v.nome}</p>
                    <p className="text-xs text-texto-soft mt-0.5">Aplicada em {formatDate(v.dataAplicacao)}</p>
                    {v.veterinario && (
                      <p className="text-xs text-texto-soft">
                        {v.veterinario}{v.crmv ? ` (CRMV ${v.crmv})` : ''}{v.clinica ? ` \u00B7 ${v.clinica}` : ''}
                      </p>
                    )}
                  </div>
                </div>
                {v.proximaDose && (
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-texto-soft">Proxima dose</p>
                    <p className="text-xs font-semibold text-coral mt-0.5">{formatDate(v.proximaDose)}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
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
      setConfirmation(data.mensagem || 'Medicamento registrado com sucesso!');
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
      setConfirmation(data.mensagem || 'Medicamento administrado!');
      onUpdate();
      setTimeout(() => setConfirmation(''), 4000);
    } catch {
      setConfirmation('Erro ao registrar administracao. Tente novamente.');
      setTimeout(() => setConfirmation(''), 4000);
    }
  };

  const ativos = initialMeds.filter((m) => m.status === 'ATIVO');
  const inativos = initialMeds.filter((m) => m.status !== 'ATIVO');

  return (
    <div className="space-y-4">
      <ConfirmationBanner message={confirmation} />

      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-texto">
          {initialMeds.length} {initialMeds.length === 1 ? 'medicamento' : 'medicamentos'}
        </p>
        <button onClick={() => setShowForm(!showForm)} className="pt-btn text-sm">+ Registrar</button>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="pt-card space-y-3 bg-coral-light/30">
          <h3 className="font-semibold text-texto text-sm">Novo medicamento</h3>

          {/* Nome */}
          <div className="space-y-2">
            <label className="pt-label">Nome *</label>
            {medsDisponiveis.length > 0 ? (
              <>
                <select
                  className="pt-input"
                  value={form.nome}
                  onChange={(e) => handleMedChange(e.target.value)}
                  required={!isOutroMed}
                >
                  <option value="">Selecione o medicamento</option>
                  {medsDisponiveis.map((m) => (
                    <option key={m.nome} value={m.nome}>{m.nome}</option>
                  ))}
                  <option value="__OUTRO__">Outro medicamento...</option>
                </select>
                {isOutroMed && (
                  <input
                    className="pt-input"
                    placeholder="Nome do medicamento..."
                    value={nomeManual}
                    onChange={(e) => setNomeManual(e.target.value)}
                    autoFocus
                    required
                  />
                )}
              </>
            ) : (
              <input className="pt-input" placeholder="Bravecto, Simparica..." value={form.nome} onChange={(e) => setForm(f => ({ ...f, nome: e.target.value }))} required />
            )}
          </div>

          {/* Dosagem e Frequencia */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="pt-label">
                Dosagem *
                {selectedMedInfo && <span className="ml-1 text-coral font-normal">(bula)</span>}
              </label>
              <input className="pt-input" placeholder="1 comprimido" value={form.dosagem} onChange={(e) => setForm(f => ({ ...f, dosagem: e.target.value }))} required />
            </div>
            <div>
              <label className="pt-label">
                Frequencia *
                {selectedMedInfo && <span className="ml-1 text-coral font-normal">(bula)</span>}
              </label>
              <input className="pt-input" placeholder="A cada 3 meses" value={form.frequencia} onChange={(e) => setForm(f => ({ ...f, frequencia: e.target.value }))} required />
            </div>
          </div>

          {/* Data inicio */}
          <div>
            <label className="pt-label">Data de inicio *</label>
            <input type="date" className="pt-input" value={form.dataInicio} onChange={(e) => setForm(f => ({ ...f, dataInicio: e.target.value }))} required />
          </div>

          {/* Motivo */}
          <div className="space-y-2">
            <label className="pt-label">Motivo</label>
            {motivosDisponiveis.length > 0 ? (
              <>
                <select
                  className="pt-input"
                  value={form.motivo}
                  onChange={(e) => { setForm(f => ({ ...f, motivo: e.target.value })); setMotivoManual(''); }}
                >
                  <option value="">Selecione o motivo</option>
                  {motivosDisponiveis.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                  <option value="__OUTRO__">Outro motivo...</option>
                </select>
                {isOutroMotivo && (
                  <input
                    className="pt-input"
                    placeholder="Descreva o motivo..."
                    value={motivoManual}
                    onChange={(e) => setMotivoManual(e.target.value)}
                    autoFocus
                  />
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

      {initialMeds.length === 0 ? (
        <EmptyState
          icon="&#128138;"
          title="Nenhum medicamento registrado"
          description="Registre os medicamentos em uso para acompanhar o tratamento."
        />
      ) : (
        <div className="space-y-3">
          {ativos.length > 0 && (
            <>
              <p className="text-xs text-texto-soft font-medium uppercase tracking-wider">Em uso</p>
              {ativos.map((m) => (
                <div key={m.id} className="bg-white rounded-xl p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-coral-light flex items-center justify-center text-base flex-shrink-0">&#128138;</div>
                      <div>
                        <p className="font-semibold text-texto text-sm">{m.nome}</p>
                        <p className="text-xs text-texto-soft mt-0.5">{m.dosagem} \u00B7 {m.frequencia}</p>
                        {m.motivo && <p className="text-xs text-texto-soft mt-0.5">{m.motivo}</p>}
                      </div>
                    </div>
                    <button onClick={() => handleAdministrar(m.id)} className="text-xs pt-btn-secondary py-1.5 px-3 flex-shrink-0">
                      Administrar
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
          {inativos.length > 0 && (
            <>
              <p className="text-xs text-texto-soft font-medium uppercase tracking-wider mt-2">Historico</p>
              {inativos.map((m) => (
                <div key={m.id} className="bg-white rounded-xl p-4 opacity-60">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-creme-dark flex items-center justify-center text-sm">&#128138;</div>
                    <div>
                      <p className="font-medium text-texto text-sm">{m.nome}</p>
                      <p className="text-xs text-texto-soft">{m.status === 'CONCLUIDO' ? 'Concluido' : 'Cancelado'} \u00B7 {formatDate(m.dataInicio)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Sintomas Tab ────────────────────────────────────────────────────────────

function SintomasTab({ petId, sintomas: initialSintomas, onUpdate }: {
  petId: string; sintomas: any[]; onUpdate: () => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ descricao: '', dataInicio: '', intensidade: '' });
  const [saving, setSaving] = useState(false);
  const [confirmation, setConfirmation] = useState('');
  const [saveError, setSaveError] = useState('');

  const handleCancel = () => {
    setShowForm(false);
    setForm({ descricao: '', dataInicio: '', intensidade: '' });
    setSaveError('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError('');
    try {
      // Map LEVE/MODERADO/GRAVE to numeric values for the API
      const intensidadeMap: Record<string, number> = { LEVE: 1, MODERADO: 3, GRAVE: 5 };
      const { data } = await healthApi.createSintoma(petId, {
        descricao: form.descricao,
        dataInicio: form.dataInicio,
        intensidade: form.intensidade ? intensidadeMap[form.intensidade] || undefined : undefined,
      });
      setConfirmation(data.mensagem || 'Sintoma registrado com sucesso!');
      handleCancel();
      onUpdate();
      setTimeout(() => setConfirmation(''), 4000);
    } catch (err: any) {
      setSaveError(err?.response?.data?.message || 'Erro ao registrar sintoma. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <ConfirmationBanner message={confirmation} />

      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-texto">
          {initialSintomas.length} {initialSintomas.length === 1 ? 'sintoma' : 'sintomas'}
        </p>
        <button onClick={() => setShowForm(!showForm)} className="pt-btn text-sm">+ Registrar sintoma</button>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="pt-card space-y-3 bg-coral-light/30">
          <h3 className="font-semibold text-texto text-sm">Novo sintoma</h3>
          <div>
            <label className="pt-label">Descricao *</label>
            <textarea
              className="pt-input resize-none"
              rows={2}
              placeholder="Descreva o sintoma..."
              value={form.descricao}
              onChange={(e) => setForm(f => ({ ...f, descricao: e.target.value }))}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="pt-label">Data de inicio *</label>
              <input type="date" className="pt-input" value={form.dataInicio} onChange={(e) => setForm(f => ({ ...f, dataInicio: e.target.value }))} required />
            </div>
            <div>
              <label className="pt-label">Intensidade</label>
              <select className="pt-input" value={form.intensidade} onChange={(e) => setForm(f => ({ ...f, intensidade: e.target.value }))}>
                <option value="">Selecione</option>
                {INTENSIDADE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
          {saveError && <p className="text-xs text-erro">{saveError}</p>}
          <div className="flex gap-2 pt-1">
            <button type="submit" disabled={saving} className="pt-btn flex-1 text-sm">{saving ? 'Salvando...' : 'Registrar sintoma'}</button>
            <button type="button" onClick={handleCancel} className="pt-btn-secondary text-sm px-4">Cancelar</button>
          </div>
        </form>
      )}

      {initialSintomas.length === 0 ? (
        <EmptyState
          icon="&#129658;"
          title="Nenhum sintoma registrado"
          description="Registre sintomas para manter o historico de saude do seu pet."
        />
      ) : (
        <div className="space-y-3">
          {initialSintomas.map((s) => {
            const badge = intensidadeBadge(s.intensidade);
            return (
              <div key={s.id} className="bg-white rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-erro-light flex items-center justify-center text-sm flex-shrink-0">&#129658;</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-texto">{s.descricao}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-xs text-texto-soft">Inicio: {formatDate(s.dataInicio)}</p>
                      {badge && (
                        <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', badge.className)}>
                          {badge.label}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── SaudeSheet ──────────────────────────────────────────────────────────────

const SUBTABS: { id: SubTab; label: string; icon: string }[] = [
  { id: 'vacinas', label: 'Vacinas', icon: '\uD83D\uDC89' },
  { id: 'medicamentos', label: 'Medicamentos', icon: '\uD83D\uDC8A' },
  { id: 'sintomas', label: 'Sintomas', icon: '\uD83E\uDE7A' },
];

export function SaudeSheet({ open, onClose, petId, pet, vacinas, medicamentos, sintomas, onUpdate }: SaudeSheetProps) {
  const [subTab, setSubTab] = useState<SubTab>('vacinas');

  return (
    <BottomSheet open={open} onClose={onClose} title="Saude">
      {/* Pill sub-tabs */}
      <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-none -mt-1 mb-2">
        {SUBTABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setSubTab(t.id)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all',
              subTab === t.id
                ? 'pt-tab-active'
                : 'pt-tab',
            )}
          >
            <span>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {subTab === 'vacinas' && (
        <VacinasTab petId={petId} especie={pet.especie} vacinas={vacinas} onUpdate={onUpdate} />
      )}
      {subTab === 'medicamentos' && (
        <MedicamentosTab petId={petId} especie={pet.especie} medicamentos={medicamentos} onUpdate={onUpdate} />
      )}
      {subTab === 'sintomas' && (
        <SintomasTab petId={petId} sintomas={sintomas} onUpdate={onUpdate} />
      )}
    </BottomSheet>
  );
}
