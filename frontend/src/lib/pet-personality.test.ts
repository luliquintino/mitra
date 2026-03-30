import { getPersonality, getHumor, isInactive } from './pet-personality';

const basePet = {
  id: 'pet-1',
  nome: 'Luna',
  especie: 'CACHORRO',
  dataNascimento: '2023-01-01',
  criadoEm: '2023-01-01T00:00:00.000Z',
} as any;

const makeInput = (overrides: Record<string, any> = {}) => ({
  pet: basePet,
  vacinas: [],
  medicamentos: [],
  eventos: [],
  ...overrides,
});

describe('getPersonality', () => {
  it('should return archetype, emoji, title, and phrase', () => {
    const result = getPersonality(makeInput());
    expect(result).toHaveProperty('archetype');
    expect(result).toHaveProperty('emoji');
    expect(result).toHaveProperty('title');
    expect(result).toHaveProperty('phrase');
    expect(typeof result.title).toBe('string');
    expect(typeof result.phrase).toBe('string');
  });

  it('should favor SENHOR_SAUDE with many health events and vaccines', () => {
    const vacinas = Array.from({ length: 5 }, (_, i) => ({
      id: `v${i}`,
      proximaDose: new Date(Date.now() + 86400000 * 30).toISOString(),
    }));
    const eventos = Array.from({ length: 5 }, (_, i) => ({
      id: `e${i}`,
      tipo: 'VACINA_REGISTRADA',
      criadoEm: new Date().toISOString(),
    }));
    const result = getPersonality(
      makeInput({ vacinas, eventos, pet: { ...basePet, dataNascimento: '2015-01-01' } }),
    );
    expect(result.archetype).toBe('SENHOR_SAUDE');
  });

  it('should favor PREGUICOSO_REAL for fish with few events', () => {
    const fishPet = { ...basePet, especie: 'PEIXE' };
    const result = getPersonality(makeInput({ pet: fishPet }));
    expect(result.archetype).toBe('PREGUICOSO_REAL');
  });

  it('should use species-specific titles when available', () => {
    const result = getPersonality(makeInput());
    // For CACHORRO, title should be a non-empty string
    expect(result.title.length).toBeGreaterThan(0);
  });
});

describe('getHumor', () => {
  it('should return emoji and message', () => {
    const result = getHumor('Luna', 'CACHORRO', 'EMPTY_STATE');
    expect(result).toHaveProperty('emoji');
    expect(result).toHaveProperty('message');
  });

  it('should replace {nome} with pet name', () => {
    const result = getHumor('Luna', 'CACHORRO', 'EMPTY_STATE');
    expect(result.message).toContain('Luna');
    expect(result.message).not.toContain('{nome}');
  });

  it('should use species-specific humor for GATO', () => {
    const result = getHumor('Mimi', 'GATO', 'POST_VACINA');
    expect(result.message).toContain('Mimi');
  });

  it('should use default humor for unknown species', () => {
    const result = getHumor('Rex', 'DESCONHECIDO', 'EMPTY_STATE');
    expect(result.message).toContain('Rex');
  });

  it('should return correct emoji for each context', () => {
    expect(getHumor('X', 'CACHORRO', 'POST_VACINA').emoji).toBe('🛡️');
    expect(getHumor('X', 'CACHORRO', 'ANIVERSARIO').emoji).toBe('🎂');
    expect(getHumor('X', 'CACHORRO', 'INATIVIDADE').emoji).toBe('🥺');
  });
});

describe('isInactive', () => {
  it('should return true for empty eventos', () => {
    expect(isInactive([])).toBe(true);
  });

  it('should return true when last event is older than threshold', () => {
    const old = new Date();
    old.setDate(old.getDate() - 10);
    const eventos = [{ id: 'e1', criadoEm: old.toISOString() }] as any[];
    expect(isInactive(eventos, 7)).toBe(true);
  });

  it('should return false when last event is recent', () => {
    const recent = new Date();
    recent.setDate(recent.getDate() - 1);
    const eventos = [{ id: 'e1', criadoEm: recent.toISOString() }] as any[];
    expect(isInactive(eventos, 7)).toBe(false);
  });

  it('should use custom threshold', () => {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const eventos = [{ id: 'e1', criadoEm: threeDaysAgo.toISOString() }] as any[];
    expect(isInactive(eventos, 2)).toBe(true);
    expect(isInactive(eventos, 5)).toBe(false);
  });
});
