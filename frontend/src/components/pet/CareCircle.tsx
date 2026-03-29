'use client';

/**
 * CareCircle (F6)
 * SVG orbital visualization: center = pet, 3 orbits (tutores → prestadores → visitantes)
 * Avatars positioned with polar coordinates along the orbits.
 */

import { useMemo } from 'react';
import { PetUsuario } from '@/types';
import { getInitials, cn } from '@/lib/utils';

interface CareCircleProps {
  petNome: string;
  petEmoji: string;
  tutores: PetUsuario[];
  className?: string;
}

const ORBIT_RADII = [70, 110, 145];
const AVATAR_RADIUS = 18;

const ROLE_COLORS: Record<string, { bg: string; text: string; ring: string }> = {
  TUTOR_PRINCIPAL: { bg: '#7C3AED', text: '#fff', ring: 'rgba(124, 58, 237, 0.15)' },
  TUTOR_EMERGENCIA: { bg: '#a78bfa', text: '#fff', ring: 'rgba(167, 139, 250, 0.15)' },
  VETERINARIO: { bg: '#0ea5e9', text: '#fff', ring: 'rgba(14, 165, 233, 0.15)' },
  ADESTRADOR: { bg: '#f59e0b', text: '#fff', ring: 'rgba(245, 158, 11, 0.15)' },
  PASSEADOR: { bg: '#10b981', text: '#fff', ring: 'rgba(16, 185, 129, 0.15)' },
  PET_SITTER: { bg: '#10b981', text: '#fff', ring: 'rgba(16, 185, 129, 0.15)' },
  DAY_CARE: { bg: '#10b981', text: '#fff', ring: 'rgba(16, 185, 129, 0.15)' },
  HOTEL: { bg: '#10b981', text: '#fff', ring: 'rgba(16, 185, 129, 0.15)' },
  CRECHE: { bg: '#10b981', text: '#fff', ring: 'rgba(16, 185, 129, 0.15)' },
  CUIDADOR: { bg: '#10b981', text: '#fff', ring: 'rgba(16, 185, 129, 0.15)' },
  FAMILIAR: { bg: '#ec4899', text: '#fff', ring: 'rgba(236, 72, 153, 0.15)' },
  AMIGO: { bg: '#ec4899', text: '#fff', ring: 'rgba(236, 72, 153, 0.15)' },
  OUTRO: { bg: '#94a3b8', text: '#fff', ring: 'rgba(148, 163, 184, 0.15)' },
};

const TUTOR_ROLES = new Set(['TUTOR_PRINCIPAL', 'TUTOR_EMERGENCIA']);
const PRESTADOR_ROLES = new Set([
  'VETERINARIO', 'ADESTRADOR', 'PASSEADOR', 'PET_SITTER',
  'DAY_CARE', 'HOTEL', 'CRECHE', 'CUIDADOR',
]);

function getOrbitIndex(role: string): number {
  if (TUTOR_ROLES.has(role)) return 0;
  if (PRESTADOR_ROLES.has(role)) return 1;
  return 2; // FAMILIAR, AMIGO, OUTRO = visitantes orbit
}

export function CareCircle({ petNome, petEmoji, tutores, className }: CareCircleProps) {
  const SIZE = 320;
  const CX = SIZE / 2;
  const CY = SIZE / 2;

  // Group by orbit
  const orbits = useMemo(() => {
    const grouped: PetUsuario[][] = [[], [], []];
    tutores.forEach((t) => {
      const idx = getOrbitIndex(t.role);
      grouped[idx].push(t);
    });
    return grouped;
  }, [tutores]);

  // Calculate positions
  const avatars = useMemo(() => {
    const result: { pu: PetUsuario; x: number; y: number; orbitIdx: number }[] = [];
    orbits.forEach((group, orbitIdx) => {
      const radius = ORBIT_RADII[orbitIdx];
      const startAngle = -Math.PI / 2; // top
      group.forEach((pu, i) => {
        const angle = startAngle + (2 * Math.PI * i) / Math.max(group.length, 1);
        result.push({
          pu,
          x: CX + radius * Math.cos(angle),
          y: CY + radius * Math.sin(angle),
          orbitIdx,
        });
      });
    });
    return result;
  }, [orbits]);

  // Only show orbits that have members
  const activeOrbits = orbits.map((g, i) => g.length > 0 ? i : -1).filter((i) => i >= 0);

  return (
    <div className={cn('flex justify-center', className)}>
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="overflow-visible">
        {/* Orbit rings */}
        {activeOrbits.map((idx) => (
          <circle
            key={`orbit-${idx}`}
            cx={CX}
            cy={CY}
            r={ORBIT_RADII[idx]}
            fill="none"
            stroke={idx === 0 ? 'rgba(124, 58, 237, 0.1)' : idx === 1 ? 'rgba(14, 165, 233, 0.1)' : 'rgba(236, 72, 153, 0.1)'}
            strokeWidth={1}
            strokeDasharray="4 4"
          />
        ))}

        {/* Center: Pet */}
        <circle cx={CX} cy={CY} r={28} fill="rgba(124, 58, 237, 0.08)" />
        <circle cx={CX} cy={CY} r={22} fill="white" stroke="rgba(124, 58, 237, 0.2)" strokeWidth={2} />
        <text x={CX} y={CY + 1} textAnchor="middle" dominantBaseline="central" fontSize={20}>
          {petEmoji}
        </text>
        <text
          x={CX}
          y={CY + 38}
          textAnchor="middle"
          fontSize={11}
          fontWeight={700}
          fill="#1e293b"
          fontFamily="Satoshi, sans-serif"
        >
          {petNome}
        </text>

        {/* Avatars */}
        {avatars.map(({ pu, x, y }) => {
          const colors = ROLE_COLORS[pu.role] || ROLE_COLORS.OUTRO;
          const initials = getInitials(pu.usuario.nome);
          return (
            <g key={pu.id}>
              {/* Active indicator glow */}
              {pu.ativo && (
                <circle cx={x} cy={y} r={AVATAR_RADIUS + 4} fill={colors.ring} />
              )}
              {/* Avatar circle */}
              <circle cx={x} cy={y} r={AVATAR_RADIUS} fill={colors.bg} />
              <text
                x={x}
                y={y + 1}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={11}
                fontWeight={700}
                fill={colors.text}
                fontFamily="Satoshi, sans-serif"
              >
                {initials}
              </text>
              {/* Active dot */}
              {pu.ativo && (
                <circle cx={x + AVATAR_RADIUS - 3} cy={y - AVATAR_RADIUS + 3} r={4} fill="#22c55e" stroke="white" strokeWidth={1.5} />
              )}
              {/* Name label */}
              <text
                x={x}
                y={y + AVATAR_RADIUS + 12}
                textAnchor="middle"
                fontSize={9}
                fill="#64748b"
                fontFamily="Inter, sans-serif"
              >
                {pu.usuario.nome.split(' ')[0]}
              </text>
            </g>
          );
        })}

        {/* Legend */}
        {[
          { label: 'Tutores', color: '#7C3AED', y: SIZE - 10 },
          { label: 'Prestadores', color: '#0ea5e9', y: SIZE - 10 },
          { label: 'Outros', color: '#ec4899', y: SIZE - 10 },
        ].filter((_, i) => activeOrbits.includes(i)).map((item, i) => (
          <g key={item.label}>
            <circle cx={40 + i * 100} cy={item.y} r={4} fill={item.color} />
            <text
              x={48 + i * 100}
              y={item.y + 1}
              fontSize={9}
              fill="#94a3b8"
              dominantBaseline="central"
              fontFamily="Inter, sans-serif"
            >
              {item.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
