'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import { petsApi } from '@/lib/api';
import { Pet } from '@/types';

const ESPECIES = [
  { value: 'CACHORRO', label: 'Cachorro', emoji: '🐕' },
  { value: 'GATO',     label: 'Gato',     emoji: '🐈' },
  { value: 'CAVALO',   label: 'Cavalo',   emoji: '🐴' },
  { value: 'PEIXE',    label: 'Peixe',    emoji: '🐟' },
  { value: 'PASSARO',  label: 'Pássaro',  emoji: '🦜' },
  { value: 'ROEDOR',   label: 'Roedor',   emoji: '🐹' },
  { value: 'COELHO',   label: 'Coelho',   emoji: '🐰' },
  { value: 'REPTIL',   label: 'Réptil',   emoji: '🦎' },
  { value: 'FURAO',    label: 'Furão',    emoji: '🦡' },
  { value: 'OUTRO',    label: 'Outro',    emoji: '🐾' },
];

const ESPECIES_COM_MICROCHIP = ['CACHORRO', 'GATO', 'CAVALO'];

const RACAS: Record<string, string[]> = {
  CACHORRO: [
    'Golden Retriever', 'Labrador Retriever', 'Poodle', 'Bulldog Inglês',
    'Beagle', 'Pastor Alemão', 'Rottweiler', 'Shih Tzu', 'Yorkshire Terrier',
    'Maltês', 'Dachshund', 'Boxer', 'Pinscher', 'Husky Siberiano',
    'Border Collie', 'Cocker Spaniel', 'Dálmata', 'Pitbull', 'SRD',
  ],
  GATO: [
    'Ragdoll', 'Siamês', 'Persa', 'Maine Coon', 'Bengal', 'Angorá Turco',
    'Sphynx', 'British Shorthair', 'Birmanês', 'Scottish Fold', 'Abissínio', 'SRD',
  ],
  CAVALO: [
    'Quarto de Milha', 'Árabe', 'Puro Sangue Inglês', 'Appaloosa',
    'Paint Horse', 'Lusitano', 'Mangalarga Marchador', 'Crioulo', 'Haflinger',
  ],
  PEIXE: [
    'Betta', 'Koi', 'Tetra Néon', 'Acará Disco', 'Goldfish',
    'Barbo', 'Guppy', 'Molinésia', 'Acará Bandeira', 'Platy',
  ],
  PASSARO: [
    'Calopsita', 'Periquito Australiano', 'Agapornis', 'Canário',
    'Papagaio', 'Arara', 'Cacatua', 'Diamante Mandarim', 'Pintassilgo',
  ],
  ROEDOR: [
    'Hamster Sírio', 'Hamster Anão', 'Porquinho da Índia',
    'Gerbil', 'Chinchila', 'Esquilo', 'Rato Doméstico',
  ],
  COELHO: [
    'Anão Holandês', 'Angorá', 'Mini Rex', 'Lionhead', 'Holland Lop', 'New Zealand',
  ],
  REPTIL: [
    'Iguana Verde', 'Gecko Leopardo', 'Dragão Barbudo',
    'Cobra do Milho', 'Jabuti', 'Tartaruga da Terra',
  ],
  FURAO: ['Furão Europeu'],
  OUTRO: [],
};

export default function NovoPetPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    nome: '',
    especie: 'CACHORRO',
    raca: '',
    genero: '',
    dataNascimento: '',
    cor: '',
    peso: '',
    microchip: '',
    observacoes: '',
    fotoUrl: '',
  });
  const [racaManual, setRacaManual] = useState('');
  const [tipoGuarda, setTipoGuarda] = useState<'CONJUNTA' | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdPet, setCreatedPet] = useState<Pet | null>(null);
  const [copied, setCopied] = useState(false);

  const racasDisponiveis = RACAS[form.especie] ?? [];
  const racaSelecionada = form.raca;
  const isOutraRaca = racaSelecionada === '__OUTRA__';

  const handleEspecieChange = (especie: string) => {
    setForm((f) => ({
      ...f,
      especie,
      raca: '',
      microchip: ESPECIES_COM_MICROCHIP.includes(especie) ? f.microchip : ''
    }));
    setRacaManual('');
  };

  const handleRacaChange = (value: string) => {
    setForm((f) => ({ ...f, raca: value }));
    if (value !== '__OUTRA__') setRacaManual('');
  };

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setForm((f) => ({ ...f, fotoUrl: ev.target?.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleCopy = () => {
    if (createdPet?.codigoPet) {
      navigator.clipboard.writeText(createdPet.codigoPet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await petsApi.create({
        ...form,
        raca: isOutraRaca ? (racaManual || undefined) : (form.raca || undefined),
        peso: form.peso ? parseFloat(form.peso) : undefined,
        genero: form.genero || undefined,
        dataNascimento: form.dataNascimento || undefined,
        tipoGuarda: tipoGuarda || undefined,
      });
      setCreatedPet(data);
    } catch (err: any) {
      setError(
        err?.response?.data?.message || 'Erro ao criar pet. Tente novamente.',
      );
    } finally {
      setLoading(false);
    }
  };

  // ─── Tela de Sucesso ──────────────────────────────────────────────────────────
  if (createdPet) {
    return (
      <ProtectedLayout>
        <div className="max-w-md mx-auto animate-fade-in text-center space-y-6 py-8">
          <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center text-4xl mx-auto">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20,6 9,17 4,12" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-texto">{createdPet.nome} cadastrado!</h1>
            <p className="text-sm text-texto-soft mt-1">
              Seu pet foi adicionado com sucesso. Você é o tutor principal.
            </p>
          </div>

          {createdPet.codigoPet && (
            <div className="pt-card space-y-3 text-left">
              <p className="text-sm font-semibold text-texto">Código do pet</p>
              <div className="bg-white rounded-xl px-6 py-4 flex items-center justify-center gap-3">
                <span className="text-3xl font-mono font-bold text-texto tracking-[0.3em]">
                  {createdPet.codigoPet}
                </span>
                <button
                  onClick={handleCopy}
                  className="p-2 rounded-lg hover:bg-creme-dark transition-colors text-texto-soft hover:text-texto"
                  title="Copiar código"
                >
                  {copied ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20,6 9,17 4,12" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                  )}
                </button>
              </div>
              <p className="text-xs text-texto-soft">
                {tipoGuarda === 'CONJUNTA'
                  ? `Envie este código ao outro tutor principal e aos prestadores de serviço para que possam se vincular ao perfil de ${createdPet.nome}.`
                  : `Compartilhe este código com prestadores, familiares e amigos para que possam se vincular ao perfil de ${createdPet.nome}.`}
              </p>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={() => router.push(`/pets/${createdPet.id}`)}
              className="pt-btn w-full"
            >
              Ir para o perfil do pet
            </button>
            <button
              onClick={() => router.push('/home')}
              className="pt-btn-secondary w-full"
            >
              Voltar ao início
            </button>
          </div>
        </div>
      </ProtectedLayout>
    );
  }

  // ─── Formulário ───────────────────────────────────────────────────────────────
  return (
    <ProtectedLayout>
      <div className="max-w-md mx-auto animate-fade-in">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.back()}
            className="w-8 h-8 rounded-lg bg-creme-dark hover:bg-white flex items-center justify-center transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15,18 9,12 15,6" /></svg>
          </button>
          <h1 className="text-xl font-semibold text-texto">Adicionar pet</h1>
        </div>

        {/* Badge tutor principal */}
        <div className="flex items-center gap-2 bg-coral-light rounded-xl px-4 py-3 mb-4">
          <span className="text-sm">👤</span>
          <p className="text-xs text-coral font-medium">
            Você será registrado como tutor principal deste pet
          </p>
        </div>

        <div className="pt-card">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Foto do pet */}
            <div className="flex flex-col items-center gap-2 pb-2">
              <div className="w-24 h-24 rounded-full bg-creme-dark overflow-hidden flex items-center justify-center ring-4 ring-coral-light">
                {form.fotoUrl ? (
                  <img
                    src={form.fotoUrl}
                    alt="Foto do pet"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl">📷</span>
                )}
              </div>
              <label className="cursor-pointer text-xs font-medium text-coral hover:text-coral/80 transition-colors">
                {form.fotoUrl ? 'Trocar foto' : 'Adicionar foto'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFotoChange}
                />
              </label>
            </div>

            <div>
              <label className="pt-label">Nome do pet *</label>
              <input
                type="text"
                className="pt-input"
                placeholder="Luna, Mochi..."
                value={form.nome}
                onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="pt-label">Espécie *</label>
                <select
                  className="pt-input"
                  value={form.especie}
                  onChange={(e) => handleEspecieChange(e.target.value)}
                >
                  {ESPECIES.map((e) => (
                    <option key={e.value} value={e.value}>
                      {e.emoji} {e.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="pt-label">Gênero</label>
                <select
                  className="pt-input"
                  value={form.genero}
                  onChange={(e) => setForm((f) => ({ ...f, genero: e.target.value }))}
                >
                  <option value="">Não informado</option>
                  <option value="MACHO">Macho</option>
                  <option value="FEMEA">Fêmea</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="pt-label">Raça</label>
              {racasDisponiveis.length > 0 ? (
                <select
                  className="pt-input"
                  value={racaSelecionada}
                  onChange={(e) => handleRacaChange(e.target.value)}
                >
                  <option value="">Selecione a raça</option>
                  {racasDisponiveis.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                  <option value="__OUTRA__">Outra raça...</option>
                </select>
              ) : (
                <input
                  type="text"
                  className="pt-input"
                  placeholder="Informe a raça"
                  value={form.raca}
                  onChange={(e) => setForm((f) => ({ ...f, raca: e.target.value }))}
                />
              )}
              {isOutraRaca && (
                <input
                  type="text"
                  className="pt-input"
                  placeholder="Digite o nome da raça..."
                  value={racaManual}
                  onChange={(e) => setRacaManual(e.target.value)}
                  autoFocus
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="pt-label">Data de nascimento</label>
                <input
                  type="date"
                  className="pt-input"
                  value={form.dataNascimento}
                  onChange={(e) => setForm((f) => ({ ...f, dataNascimento: e.target.value }))}
                />
              </div>
              <div>
                <label className="pt-label">Peso (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  className="pt-input"
                  placeholder="28.5"
                  value={form.peso}
                  onChange={(e) => setForm((f) => ({ ...f, peso: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label className="pt-label">Cor</label>
              <input
                type="text"
                className="pt-input"
                placeholder="Dourada, Preto e branco..."
                value={form.cor}
                onChange={(e) => setForm((f) => ({ ...f, cor: e.target.value }))}
              />
            </div>

            {ESPECIES_COM_MICROCHIP.includes(form.especie) && (
              <div>
                <label className="pt-label">Microchip</label>
                <input
                  type="text"
                  className="pt-input"
                  placeholder="985113002345678"
                  value={form.microchip}
                  onChange={(e) => setForm((f) => ({ ...f, microchip: e.target.value }))}
                />
              </div>
            )}

            <div>
              <label className="pt-label">Observações</label>
              <textarea
                className="pt-input resize-none"
                rows={3}
                placeholder="Informações adicionais..."
                value={form.observacoes}
                onChange={(e) => setForm((f) => ({ ...f, observacoes: e.target.value }))}
              />
            </div>

            {/* Guarda compartilhada */}
            <div className="bg-white rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-base">👥</span>
                <label className="text-sm font-medium text-texto">
                  Esse pet tem mais de um dono principal?
                </label>
              </div>
              <p className="text-xs text-texto-soft">
                Se mais de uma pessoa é tutora principal deste pet, ative a guarda compartilhada.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setTipoGuarda('CONJUNTA')}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    tipoGuarda === 'CONJUNTA'
                      ? 'bg-coral-light text-coral'
                      : 'bg-creme-dark text-texto-soft hover:bg-white'
                  }`}
                >
                  Sim, compartilhada
                </button>
                <button
                  type="button"
                  onClick={() => setTipoGuarda('')}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    tipoGuarda === ''
                      ? 'bg-creme-dark text-texto'
                      : 'bg-white text-texto-soft hover:bg-creme-dark'
                  }`}
                >
                  Não, sou o único
                </button>
              </div>
              {tipoGuarda === 'CONJUNTA' && (
                <div className="bg-coral-light/50 rounded-lg p-3 text-xs text-coral">
                  Após criar o pet, você receberá um código para compartilhar com o outro tutor.
                  Ele poderá usar esse código para se vincular como tutor principal.
                </div>
              )}
            </div>

            {error && (
              <div className="bg-erro-light rounded-xl px-4 py-3">
                <p className="text-sm text-erro">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="pt-btn w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Salvando...
                </>
              ) : (
                'Adicionar pet'
              )}
            </button>
          </form>
        </div>
      </div>
    </ProtectedLayout>
  );
}
