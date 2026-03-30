import {
  cn,
  formatDate,
  formatRelative,
  formatDateTime,
  petAge,
  especieLabel,
  generoLabel,
  roleLabel,
  eventoIcon,
  solicitacaoStatusLabel,
  getInitials,
  daysUntilBirthday,
  petAgeYears,
  mitraMilestones,
} from './utils';

describe('cn', () => {
  it('should merge tailwind classes', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });

  it('should handle conditional classes', () => {
    expect(cn('base', false && 'hidden', 'visible')).toBe('base visible');
  });
});

describe('formatDate', () => {
  it('should format a date string', () => {
    expect(formatDate('2025-03-14')).toBe('14/03/2025');
  });

  it('should format a Date object', () => {
    expect(formatDate(new Date(2025, 2, 14))).toBe('14/03/2025');
  });

  it('should return — for null', () => {
    expect(formatDate(null)).toBe('—');
  });

  it('should return — for undefined', () => {
    expect(formatDate(undefined)).toBe('—');
  });

  it('should return — for invalid date string', () => {
    expect(formatDate('not-a-date')).toBe('—');
  });

  it('should accept custom format', () => {
    expect(formatDate('2025-03-14', 'yyyy')).toBe('2025');
  });
});

describe('formatRelative', () => {
  it('should return — for null', () => {
    expect(formatRelative(null)).toBe('—');
  });

  it('should return relative time for valid date', () => {
    const result = formatRelative(new Date());
    expect(typeof result).toBe('string');
    expect(result).not.toBe('—');
  });
});

describe('formatDateTime', () => {
  it('should format date with time', () => {
    const result = formatDateTime('2025-03-14T10:30:00');
    expect(result).toContain('14/03/2025');
    expect(result).toContain('10:30');
  });
});

describe('petAge', () => {
  it('should return age in years for old pets', () => {
    const threeYearsAgo = new Date();
    threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);
    const result = petAge(threeYearsAgo);
    expect(result).toContain('3 anos');
  });

  it('should return age in months for young pets', () => {
    const fiveMonthsAgo = new Date();
    fiveMonthsAgo.setMonth(fiveMonthsAgo.getMonth() - 5);
    const result = petAge(fiveMonthsAgo);
    expect(result).toContain('5 meses');
  });

  it('should return "Idade desconhecida" for null', () => {
    expect(petAge(null)).toBe('Idade desconhecida');
  });

  it('should handle string dates', () => {
    const result = petAge('2020-01-01');
    expect(result).toContain('ano');
  });
});

describe('especieLabel', () => {
  it('should return label for known species', () => {
    expect(especieLabel('CACHORRO')).toBe('Cachorro');
    expect(especieLabel('GATO')).toBe('Gato');
    expect(especieLabel('PASSARO')).toBe('Pássaro');
  });

  it('should return raw value for unknown species', () => {
    expect(especieLabel('DESCONHECIDO')).toBe('DESCONHECIDO');
  });
});

describe('generoLabel', () => {
  it('should return label for known genders', () => {
    expect(generoLabel('MACHO')).toBe('Macho');
    expect(generoLabel('FEMEA')).toBe('Fêmea');
  });

  it('should return — for null', () => {
    expect(generoLabel(null)).toBe('—');
  });
});

describe('roleLabel', () => {
  it('should return label for known roles', () => {
    expect(roleLabel('TUTOR_PRINCIPAL')).toBe('Tutor principal');
    expect(roleLabel('VETERINARIO')).toBe('Veterinário');
    expect(roleLabel('PASSEADOR')).toBe('Passeador');
  });

  it('should return raw value for unknown role', () => {
    expect(roleLabel('UNKNOWN')).toBe('UNKNOWN');
  });
});

describe('eventoIcon', () => {
  it('should return icon for known event types', () => {
    expect(eventoIcon('PET_CRIADO')).toBe('🐾');
    expect(eventoIcon('VACINA_REGISTRADA')).toBe('💉');
    expect(eventoIcon('MEDICAMENTO_ADMINISTRADO')).toBe('💊');
  });

  it('should return default icon for unknown types', () => {
    expect(eventoIcon('UNKNOWN')).toBe('📌');
  });
});

describe('solicitacaoStatusLabel', () => {
  it('should return label and color for known statuses', () => {
    expect(solicitacaoStatusLabel('PENDENTE')).toEqual({
      label: 'Pendente',
      color: 'amber',
    });
    expect(solicitacaoStatusLabel('APROVADA')).toEqual({
      label: 'Aprovada',
      color: 'green',
    });
  });

  it('should return raw value for unknown status', () => {
    const result = solicitacaoStatusLabel('CUSTOM');
    expect(result.label).toBe('CUSTOM');
  });
});

describe('getInitials', () => {
  it('should return first two initials', () => {
    expect(getInitials('Maria Silva')).toBe('MS');
  });

  it('should handle single name', () => {
    expect(getInitials('Maria')).toBe('M');
  });

  it('should handle three names', () => {
    expect(getInitials('Maria Silva Santos')).toBe('MS');
  });
});

describe('daysUntilBirthday', () => {
  it('should return null for null input', () => {
    expect(daysUntilBirthday(null)).toBeNull();
  });

  it('should return a number for valid date', () => {
    const result = daysUntilBirthday('2020-06-15');
    expect(typeof result).toBe('number');
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(366);
  });
});

describe('petAgeYears', () => {
  it('should return null for null input', () => {
    expect(petAgeYears(null)).toBeNull();
  });

  it('should return correct age in years', () => {
    const fiveYearsAgo = new Date();
    fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
    expect(petAgeYears(fiveYearsAgo.toISOString())).toBe(5);
  });
});

describe('mitraMilestones', () => {
  it('should return milestones array', () => {
    const result = mitraMilestones('2020-01-01T00:00:00.000Z');
    expect(result.length).toBe(5);
    expect(result[0]).toHaveProperty('id');
    expect(result[0]).toHaveProperty('achieved');
  });

  it('should mark old milestones as achieved', () => {
    const result = mitraMilestones('2020-01-01T00:00:00.000Z');
    // 2020 is >5 years ago, all should be achieved
    expect(result.every((m) => m.achieved)).toBe(true);
  });

  it('should return empty for invalid date', () => {
    expect(mitraMilestones('invalid')).toEqual([]);
  });
});
