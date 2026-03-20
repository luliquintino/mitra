'use client';

import { useState } from 'react';
import { BottomSheet } from '@/components/BottomSheet';
import { healthApi, registrosApi } from '@/lib/api';
import { Pet } from '@/types';

// ─── Types ──────────────────────────────────────────────────────────────────────

type EventType = 'vacina' | 'consulta' | 'banho' | 'medicacao' | 'sintoma' | 'observacao';

interface RegisterEventModalProps {
  open: boolean;
  onClose: () => void;
  petId: string;
  pet: Pet;
  onSuccess?: () => void;
}

interface EventOption {
  type: EventType;
  icon: string;
  label: string;
  category: 'health' | 'social' | 'general';
}

const EVENT_OPTIONS: EventOption[] = [
  { type: 'vacina', icon: '\u{1F489}', label: 'Vacina', category: 'health' },
  { type: 'consulta', icon: '\u{1F3E5}', label: 'Consulta', category: 'health' },
  { type: 'banho', icon: '\u{1F6C1}', label: 'Banho', category: 'social' },
  { type: 'medicacao', icon: '\u{1F48A}', label: 'Medica\u00E7\u00E3o', category: 'health' },
  { type: 'sintoma', icon: '\u{1FA7A}', label: 'Sintoma', category: 'health' },
  { type: 'observacao', icon: '\u{1F4DD}', label: 'Observa\u00E7\u00E3o', category: 'general' },
];

const EVENT_LABELS: Record<EventType, string> = {
  vacina: 'vacina',
  consulta: 'consulta',
  banho: 'banho',
  medicacao: 'medica\u00E7\u00E3o',
  sintoma: 'sintoma',
  observacao: 'observa\u00E7\u00E3o',
};

const CATEGORY_BG: Record<string, string> = {
  health: 'bg-azul-light text-azul',
  social: 'bg-rosa-light text-rosa',
  general: 'bg-coral-light text-coral',
};

// ─── Component ──────────────────────────────────────────────────────────────────

export function RegisterEventModal({ open, onClose, petId, onSuccess }: RegisterEventModalProps) {
  const [step, setStep] = useState<'pick' | 'form'>('pick');
  const [eventType, setEventType] = useState<EventType | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // ─── Form state per type ──────────────────────────────────────────────────────

  // Vacina
  const [vacinaNome, setVacinaNome] = useState('');
  const [vacinaData, setVacinaData] = useState('');
  const [vacinaProxima, setVacinaProxima] = useState('');
  const [vacinaVet, setVacinaVet] = useState('');
  const [vacinaClinica, setVacinaClinica] = useState('');

  // Consulta
  const [consultaDescricao, setConsultaDescricao] = useState('');
  const [consultaData, setConsultaData] = useState('');

  // Banho
  const [banhoData, setBanhoData] = useState('');
  const [banhoObs, setBanhoObs] = useState('');

  // Medicacao
  const [medNome, setMedNome] = useState('');
  const [medDosagem, setMedDosagem] = useState('');
  const [medFrequencia, setMedFrequencia] = useState('');
  const [medDataInicio, setMedDataInicio] = useState('');
  const [medMotivo, setMedMotivo] = useState('');

  // Sintoma
  const [sintomaDescricao, setSintomaDescricao] = useState('');
  const [sintomaDataInicio, setSintomaDataInicio] = useState('');
  const [sintomaIntensidade, setSintomaIntensidade] = useState<number | ''>('');

  // Observacao
  const [obsTitulo, setObsTitulo] = useState('');
  const [obsDescricao, setObsDescricao] = useState('');

  // ─── Helpers ──────────────────────────────────────────────────────────────────

  function resetAllForms() {
    setVacinaNome(''); setVacinaData(''); setVacinaProxima(''); setVacinaVet(''); setVacinaClinica('');
    setConsultaDescricao(''); setConsultaData('');
    setBanhoData(''); setBanhoObs('');
    setMedNome(''); setMedDosagem(''); setMedFrequencia(''); setMedDataInicio(''); setMedMotivo('');
    setSintomaDescricao(''); setSintomaDataInicio(''); setSintomaIntensidade('');
    setObsTitulo(''); setObsDescricao('');
  }

  function handleClose() {
    setStep('pick');
    setEventType(null);
    setSuccess(false);
    resetAllForms();
    onClose();
  }

  function handleBack() {
    setStep('pick');
    setEventType(null);
  }

  function selectType(type: EventType) {
    setEventType(type);
    setStep('form');
  }

  function todayISO() {
    return new Date().toISOString().split('T')[0];
  }

  // ─── Submit ───────────────────────────────────────────────────────────────────

  async function handleSubmit() {
    if (!eventType) return;
    setLoading(true);

    try {
      switch (eventType) {
        case 'vacina':
          await healthApi.createVacina(petId, {
            nome: vacinaNome,
            dataAplicacao: vacinaData || todayISO(),
            proximaDose: vacinaProxima || undefined,
            veterinario: vacinaVet || undefined,
            clinica: vacinaClinica || undefined,
          });
          break;

        case 'consulta':
          await registrosApi.create(petId, {
            tipo: 'OBSERVACAO',
            titulo: 'Consulta veterin\u00E1ria',
            descricao: consultaDescricao || undefined,
          });
          break;

        case 'banho':
          await registrosApi.create(petId, {
            tipo: 'OBSERVACAO',
            titulo: 'Banho',
            descricao: banhoObs || `Banho realizado em ${banhoData || todayISO()}`,
          });
          break;

        case 'medicacao':
          await healthApi.createMedicamento(petId, {
            nome: medNome,
            dosagem: medDosagem,
            frequencia: medFrequencia,
            dataInicio: medDataInicio || todayISO(),
            motivo: medMotivo || undefined,
            status: 'ATIVO',
            horarios: [],
          });
          break;

        case 'sintoma':
          await healthApi.createSintoma(petId, {
            descricao: sintomaDescricao,
            dataInicio: sintomaDataInicio || todayISO(),
            intensidade: sintomaIntensidade !== '' ? Number(sintomaIntensidade) : undefined,
          });
          break;

        case 'observacao':
          await registrosApi.create(petId, {
            tipo: 'OBSERVACAO',
            titulo: obsTitulo,
            descricao: obsDescricao || undefined,
          });
          break;
      }

      // Success feedback
      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        handleClose();
      }, 1500);
    } catch (err) {
      console.error('Erro ao registrar evento:', err);
      setLoading(false);
    }
  }

  // ─── Validation (minimal required fields) ─────────────────────────────────────

  function isFormValid(): boolean {
    switch (eventType) {
      case 'vacina': return vacinaNome.trim().length > 0;
      case 'consulta': return true; // descricao is optional
      case 'banho': return true; // all optional
      case 'medicacao': return medNome.trim().length > 0 && medDosagem.trim().length > 0 && medFrequencia.trim().length > 0;
      case 'sintoma': return sintomaDescricao.trim().length > 0;
      case 'observacao': return obsTitulo.trim().length > 0;
      default: return false;
    }
  }

  // ─── Title ────────────────────────────────────────────────────────────────────

  const title = step === 'pick'
    ? 'Registrar evento'
    : `Registrar ${EVENT_LABELS[eventType!]}`;

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <BottomSheet open={open} onClose={handleClose} title={title}>
      {/* Success overlay */}
      {success && (
        <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-coral-light flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-white-container" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-lg font-headline font-semibold text-texto">Registrado!</p>
        </div>
      )}

      {/* Step 1: Pick event type */}
      {!success && step === 'pick' && (
        <div>
          <p className="text-sm text-texto-soft mb-4">Qual evento registrar?</p>
          <div className="grid grid-cols-3 gap-3">
            {EVENT_OPTIONS.map((opt) => (
              <button
                key={opt.type}
                onClick={() => selectType(opt.type)}
                className={`flex flex-col items-center gap-1.5 p-4 rounded-2xl transition-all active:scale-[0.9] hover:scale-[1.02] ${CATEGORY_BG[opt.category]}`}
              >
                <span className="text-2xl">{opt.icon}</span>
                <span className="text-sm font-headline font-medium">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Type-specific form */}
      {!success && step === 'form' && eventType && (
        <div>
          {/* Back button */}
          <button
            onClick={handleBack}
            className="flex items-center gap-1 text-sm text-texto-soft hover:text-texto mb-4 -mt-1 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Voltar
          </button>

          <div className="space-y-4">
            {eventType === 'vacina' && <VacinaForm
              nome={vacinaNome} setNome={setVacinaNome}
              data={vacinaData} setData={setVacinaData}
              proxima={vacinaProxima} setProxima={setVacinaProxima}
              vet={vacinaVet} setVet={setVacinaVet}
              clinica={vacinaClinica} setClinica={setVacinaClinica}
            />}

            {eventType === 'consulta' && <ConsultaForm
              descricao={consultaDescricao} setDescricao={setConsultaDescricao}
              data={consultaData} setData={setConsultaData}
            />}

            {eventType === 'banho' && <BanhoForm
              data={banhoData} setData={setBanhoData}
              obs={banhoObs} setObs={setBanhoObs}
            />}

            {eventType === 'medicacao' && <MedicacaoForm
              nome={medNome} setNome={setMedNome}
              dosagem={medDosagem} setDosagem={setMedDosagem}
              frequencia={medFrequencia} setFrequencia={setMedFrequencia}
              dataInicio={medDataInicio} setDataInicio={setMedDataInicio}
              motivo={medMotivo} setMotivo={setMedMotivo}
            />}

            {eventType === 'sintoma' && <SintomaForm
              descricao={sintomaDescricao} setDescricao={setSintomaDescricao}
              dataInicio={sintomaDataInicio} setDataInicio={setSintomaDataInicio}
              intensidade={sintomaIntensidade} setIntensidade={setSintomaIntensidade}
            />}

            {eventType === 'observacao' && <ObservacaoForm
              titulo={obsTitulo} setTitulo={setObsTitulo}
              descricao={obsDescricao} setDescricao={setObsDescricao}
            />}

            {/* Action buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleBack}
                className="pt-btn-secondary flex-1"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || !isFormValid()}
                className="pt-btn flex-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Salvando...
                  </>
                ) : (
                  'Salvar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </BottomSheet>
  );
}

// ─── Sub-forms ──────────────────────────────────────────────────────────────────

function VacinaForm({ nome, setNome, data, setData, proxima, setProxima, vet, setVet, clinica, setClinica }: {
  nome: string; setNome: (v: string) => void;
  data: string; setData: (v: string) => void;
  proxima: string; setProxima: (v: string) => void;
  vet: string; setVet: (v: string) => void;
  clinica: string; setClinica: (v: string) => void;
}) {
  return (
    <>
      <div>
        <label className="pt-label">Nome da vacina *</label>
        <input type="text" className="pt-input" placeholder="Ex: V10, Antirr\u00E1bica..." value={nome} onChange={(e) => setNome(e.target.value)} />
      </div>
      <div>
        <label className="pt-label">Data de aplica\u00E7\u00E3o</label>
        <input type="date" className="pt-input" value={data} onChange={(e) => setData(e.target.value)} />
      </div>
      <div>
        <label className="pt-label">Pr\u00F3xima dose</label>
        <input type="date" className="pt-input" value={proxima} onChange={(e) => setProxima(e.target.value)} />
      </div>
      <div>
        <label className="pt-label">Veterin\u00E1rio</label>
        <input type="text" className="pt-input" placeholder="Nome do veterin\u00E1rio" value={vet} onChange={(e) => setVet(e.target.value)} />
      </div>
      <div>
        <label className="pt-label">Cl\u00EDnica</label>
        <input type="text" className="pt-input" placeholder="Nome da cl\u00EDnica" value={clinica} onChange={(e) => setClinica(e.target.value)} />
      </div>
    </>
  );
}

function ConsultaForm({ descricao, setDescricao, data, setData }: {
  descricao: string; setDescricao: (v: string) => void;
  data: string; setData: (v: string) => void;
}) {
  return (
    <>
      <div>
        <label className="pt-label">Data da consulta</label>
        <input type="date" className="pt-input" value={data} onChange={(e) => setData(e.target.value)} />
      </div>
      <div>
        <label className="pt-label">Descri\u00E7\u00E3o</label>
        <textarea className="pt-input min-h-[100px] resize-none" placeholder="Motivo, diagn\u00F3stico, receita..." value={descricao} onChange={(e) => setDescricao(e.target.value)} />
      </div>
    </>
  );
}

function BanhoForm({ data, setData, obs, setObs }: {
  data: string; setData: (v: string) => void;
  obs: string; setObs: (v: string) => void;
}) {
  return (
    <>
      <div>
        <label className="pt-label">Data do banho</label>
        <input type="date" className="pt-input" value={data} onChange={(e) => setData(e.target.value)} />
      </div>
      <div>
        <label className="pt-label">Observa\u00E7\u00F5es</label>
        <textarea className="pt-input min-h-[80px] resize-none" placeholder="Tosa, produtos utilizados..." value={obs} onChange={(e) => setObs(e.target.value)} />
      </div>
    </>
  );
}

function MedicacaoForm({ nome, setNome, dosagem, setDosagem, frequencia, setFrequencia, dataInicio, setDataInicio, motivo, setMotivo }: {
  nome: string; setNome: (v: string) => void;
  dosagem: string; setDosagem: (v: string) => void;
  frequencia: string; setFrequencia: (v: string) => void;
  dataInicio: string; setDataInicio: (v: string) => void;
  motivo: string; setMotivo: (v: string) => void;
}) {
  return (
    <>
      <div>
        <label className="pt-label">Nome do medicamento *</label>
        <input type="text" className="pt-input" placeholder="Ex: Doxiciclina, Meloxicam..." value={nome} onChange={(e) => setNome(e.target.value)} />
      </div>
      <div>
        <label className="pt-label">Dosagem *</label>
        <input type="text" className="pt-input" placeholder="Ex: 100mg, 1 comprimido..." value={dosagem} onChange={(e) => setDosagem(e.target.value)} />
      </div>
      <div>
        <label className="pt-label">Frequ\u00EAncia *</label>
        <input type="text" className="pt-input" placeholder="Ex: 2x ao dia, a cada 12h..." value={frequencia} onChange={(e) => setFrequencia(e.target.value)} />
      </div>
      <div>
        <label className="pt-label">Data de in\u00EDcio</label>
        <input type="date" className="pt-input" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
      </div>
      <div>
        <label className="pt-label">Motivo</label>
        <input type="text" className="pt-input" placeholder="Motivo da medica\u00E7\u00E3o" value={motivo} onChange={(e) => setMotivo(e.target.value)} />
      </div>
    </>
  );
}

function SintomaForm({ descricao, setDescricao, dataInicio, setDataInicio, intensidade, setIntensidade }: {
  descricao: string; setDescricao: (v: string) => void;
  dataInicio: string; setDataInicio: (v: string) => void;
  intensidade: number | ''; setIntensidade: (v: number | '') => void;
}) {
  return (
    <>
      <div>
        <label className="pt-label">Descri\u00E7\u00E3o do sintoma *</label>
        <input type="text" className="pt-input" placeholder="Ex: Vomitando, coando, mancando..." value={descricao} onChange={(e) => setDescricao(e.target.value)} />
      </div>
      <div>
        <label className="pt-label">Data de in\u00EDcio</label>
        <input type="date" className="pt-input" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
      </div>
      <div>
        <label className="pt-label">Intensidade (1-5)</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setIntensidade(intensidade === n ? '' : n)}
              className={`w-10 h-10 rounded-full text-sm font-headline font-bold transition-all active:scale-[0.9] ${
                intensidade === n
                  ? 'bg-coral-light text-coral'
                  : 'bg-creme-dark text-texto-soft hover:bg-creme-dark'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

function ObservacaoForm({ titulo, setTitulo, descricao, setDescricao }: {
  titulo: string; setTitulo: (v: string) => void;
  descricao: string; setDescricao: (v: string) => void;
}) {
  return (
    <>
      <div>
        <label className="pt-label">T\u00EDtulo *</label>
        <input type="text" className="pt-input" placeholder="Ex: Nota sobre comportamento..." value={titulo} onChange={(e) => setTitulo(e.target.value)} />
      </div>
      <div>
        <label className="pt-label">Descri\u00E7\u00E3o</label>
        <textarea className="pt-input min-h-[100px] resize-none" placeholder="Detalhes da observa\u00E7\u00E3o..." value={descricao} onChange={(e) => setDescricao(e.target.value)} />
      </div>
    </>
  );
}
