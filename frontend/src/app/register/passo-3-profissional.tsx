'use client';

import { useState } from 'react';

interface Passo3ProfissionalProps {
  onContinue: (dadosProfissionais: any) => void;
  onBack: () => void;
  tipoUsuario: string;
}

export function Passo3Profissional({
  onContinue,
  onBack,
  tipoUsuario,
}: Passo3ProfissionalProps) {
  const [form, setForm] = useState({
    tipoPrestador: '',
    nomeEmpresa: '',
    cnpj: '',
    telefoneProfissional: '',
    endereco: '',
    registroProfissional: '',
    descricao: '',
    website: '',
  });

  const [error, setError] = useState('');

  const tiposServiço = [
    { valor: 'VETERINARIO', label: '🩺 Veterinário' },
    { valor: 'PET_SITTER', label: '🚶 Pet Sitter' },
    { valor: 'DAY_CARE', label: '🏠 Day Care' },
    { valor: 'ADESTRADOR', label: '🎾 Adestrador' },
    { valor: 'BANHO_TOSA', label: '🛁 Banho e Tosa' },
    { valor: 'CUIDADOR_EVENTUAL', label: '🤝 Cuidador Eventual' },
    { valor: 'OUTRO', label: '✨ Outro' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (
      !form.tipoPrestador ||
      !form.telefoneProfissional ||
      !form.endereco ||
      !form.descricao
    ) {
      setError('Preencha todos os campos obrigatórios');
      return;
    }

    onContinue(form);
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Section 1: Tipo de serviço */}
        <div>
          <label className="pt-label">Tipo de serviço *</label>
          <select
            className="pt-select"
            value={form.tipoPrestador}
            onChange={(e) =>
              setForm((f) => ({ ...f, tipoPrestador: e.target.value }))
            }
          >
            <option value="">Selecione</option>
            {tiposServiço.map((tipo) => (
              <option key={tipo.valor} value={tipo.valor}>
                {tipo.label}
              </option>
            ))}
          </select>
        </div>

        <div className="h-4" />

        {/* Section 2: Empresa */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="pt-label">Nome da empresa</label>
            <input
              type="text"
              className="pt-input"
              placeholder="Opcional"
              value={form.nomeEmpresa}
              onChange={(e) =>
                setForm((f) => ({ ...f, nomeEmpresa: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="pt-label">CNPJ</label>
            <input
              type="text"
              className="pt-input"
              placeholder="Opcional"
              value={form.cnpj}
              onChange={(e) => setForm((f) => ({ ...f, cnpj: e.target.value }))}
            />
          </div>
        </div>

        <div className="h-4" />

        {/* Section 3: Contato e local */}
        <div>
          <label className="pt-label">Telefone profissional *</label>
          <input
            type="tel"
            className="pt-input"
            placeholder="11 99999-9999"
            value={form.telefoneProfissional}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                telefoneProfissional: e.target.value,
              }))
            }
            required
          />
        </div>

        <div>
          <label className="pt-label">Endereço *</label>
          <input
            type="text"
            className="pt-input"
            placeholder="Rua, número, cidade, estado"
            value={form.endereco}
            onChange={(e) =>
              setForm((f) => ({ ...f, endereco: e.target.value }))
            }
            required
          />
        </div>

        <div className="h-4" />

        {/* Section 4: Sobre você */}
        <div>
          <label className="pt-label">Registro profissional</label>
          <input
            type="text"
            className="pt-input"
            placeholder="Ex: CRMV 123456"
            value={form.registroProfissional}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                registroProfissional: e.target.value,
              }))
            }
          />
        </div>

        <div>
          <label className="pt-label">Descrição do serviço *</label>
          <textarea
            className="pt-input resize-none"
            rows={3}
            placeholder="Descreva seu serviço, especialidades, etc"
            value={form.descricao}
            onChange={(e) =>
              setForm((f) => ({ ...f, descricao: e.target.value }))
            }
            required
          />
        </div>

        <div>
          <label className="pt-label">Site</label>
          <input
            type="url"
            className="pt-input"
            placeholder="https://..."
            value={form.website}
            onChange={(e) =>
              setForm((f) => ({ ...f, website: e.target.value }))
            }
          />
        </div>

        {error && (
          <div className="bg-erro/10 text-erro rounded-2xl px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onBack}
            className="pt-btn-secondary flex-1"
          >
            Voltar
          </button>
          <button
            type="submit"
            className="pt-btn flex-1"
          >
            Continuar
          </button>
        </div>
      </form>
    </div>
  );
}
