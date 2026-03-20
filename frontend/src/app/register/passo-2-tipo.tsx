'use client';

import { useState } from 'react';

interface Passo2TipoProps {
  onContinue: (tipoUsuario: string) => void;
  onBack: () => void;
}

export function Passo2Tipo({ onContinue, onBack }: Passo2TipoProps) {
  const [selected, setSelected] = useState('');

  const opcoes = [
    {
      id: 'TUTOR',
      label: 'Sou tutor',
      descricao: 'Tenho pet(s) e quero gerenciá-los',
      emoji: '❤️',
      selectedBg: 'bg-coral-light',
      selectedBorder: 'border-2 border-coral',
    },
    {
      id: 'PRESTADOR',
      label: 'Sou prestador de serviços',
      descricao: 'Veterinário, pet sitter, adestrador, etc',
      emoji: '🩺',
      selectedBg: 'bg-azul-light',
      selectedBorder: 'border-2 border-azul',
    },
    {
      id: 'AMBOS',
      label: 'Ambos',
      descricao: 'Tenho pets e também presto serviços',
      emoji: '🤝',
      selectedBg: 'bg-menta-light',
      selectedBorder: 'border-2 border-menta',
    },
  ];

  const handleContinue = () => {
    if (selected) {
      onContinue(selected);
    }
  };

  return (
    <div>
      <div className="space-y-3 mb-8">
        {opcoes.map((opcao) => {
          const isSelected = selected === opcao.id;
          return (
            <button
              key={opcao.id}
              onClick={() => setSelected(opcao.id)}
              className={`w-full rounded-2xl p-4 transition-all text-left active:scale-[0.95] cursor-pointer ${
                isSelected
                  ? `${opcao.selectedBorder} ${opcao.selectedBg}`
                  : 'bg-white border-2 border-transparent hover:bg-creme-dark'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-[3rem] leading-none flex-shrink-0">{opcao.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-texto">{opcao.label}</p>
                  <p className="text-sm text-texto-soft">{opcao.descricao}</p>
                </div>
                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-menta text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">
                    ✓
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="pt-btn-secondary flex-1"
        >
          Voltar
        </button>
        <button
          onClick={handleContinue}
          disabled={!selected}
          className="pt-btn flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}
