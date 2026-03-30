import { computeAchievements, CATEGORY_LABELS } from './achievements';

const basePet = {
  id: 'pet-1',
  nome: 'Luna',
  especie: 'CACHORRO',
  criadoEm: '2020-01-01T00:00:00.000Z',
} as any;

const makeInput = (overrides: Record<string, any> = {}) => ({
  pet: basePet,
  vacinas: [],
  medicamentos: [],
  eventos: [],
  tutores: [],
  muralPosts: [],
  ...overrides,
});

describe('computeAchievements', () => {
  it('should return 12 achievements', () => {
    const result = computeAchievements(makeInput());
    expect(result.length).toBe(12);
  });

  it('should have correct structure for each achievement', () => {
    const result = computeAchievements(makeInput());
    for (const a of result) {
      expect(a).toHaveProperty('id');
      expect(a).toHaveProperty('emoji');
      expect(a).toHaveProperty('title');
      expect(a).toHaveProperty('category');
      expect(a).toHaveProperty('earned');
      expect(a).toHaveProperty('progress');
      expect(a).toHaveProperty('total');
    }
  });

  it('should earn first-vaccine with 1+ vacinas', () => {
    const result = computeAchievements(
      makeInput({ vacinas: [{ id: 'v1' }] }),
    );
    const badge = result.find((a) => a.id === 'first-vaccine');
    expect(badge?.earned).toBe(true);
    expect(badge?.progress).toBe(1);
  });

  it('should not earn vaccine-champion with <5 vacinas', () => {
    const result = computeAchievements(
      makeInput({ vacinas: [{ id: 'v1' }, { id: 'v2' }] }),
    );
    const badge = result.find((a) => a.id === 'vaccine-champion');
    expect(badge?.earned).toBe(false);
    expect(badge?.progress).toBe(2);
  });

  it('should earn vaccine-champion with 5+ vacinas', () => {
    const vacinas = Array.from({ length: 5 }, (_, i) => ({ id: `v${i}` }));
    const result = computeAchievements(makeInput({ vacinas }));
    const badge = result.find((a) => a.id === 'vaccine-champion');
    expect(badge?.earned).toBe(true);
  });

  it('should earn health-warrior with medicamentos', () => {
    const result = computeAchievements(
      makeInput({ medicamentos: [{ id: 'm1' }] }),
    );
    const badge = result.find((a) => a.id === 'health-warrior');
    expect(badge?.earned).toBe(true);
  });

  it('should earn first-friend with 2+ tutores', () => {
    const result = computeAchievements(
      makeInput({ tutores: [{ id: 't1' }, { id: 't2' }] }),
    );
    const badge = result.find((a) => a.id === 'first-friend');
    expect(badge?.earned).toBe(true);
  });

  it('should earn first-post with user mural posts', () => {
    const result = computeAchievements(
      makeInput({ muralPosts: [{ id: 'p1', tipo: 'TEXTO' }] }),
    );
    const badge = result.find((a) => a.id === 'first-post');
    expect(badge?.earned).toBe(true);
  });

  it('should not count AUTO_EVENT posts for first-post', () => {
    const result = computeAchievements(
      makeInput({ muralPosts: [{ id: 'p1', tipo: 'AUTO_EVENT' }] }),
    );
    const badge = result.find((a) => a.id === 'first-post');
    expect(badge?.earned).toBe(false);
  });

  it('should earn mitra-veteran for pet created >100 days ago', () => {
    const result = computeAchievements(makeInput());
    const badge = result.find((a) => a.id === 'mitra-veteran');
    expect(badge?.earned).toBe(true); // pet created in 2020
  });

  it('should not earn mitra-veteran for recent pet', () => {
    const recentPet = { ...basePet, criadoEm: new Date().toISOString() };
    const result = computeAchievements(makeInput({ pet: recentPet }));
    const badge = result.find((a) => a.id === 'mitra-veteran');
    expect(badge?.earned).toBe(false);
  });
});

describe('CATEGORY_LABELS', () => {
  it('should have all 4 categories', () => {
    expect(Object.keys(CATEGORY_LABELS)).toHaveLength(4);
    expect(CATEGORY_LABELS.SAUDE).toBeDefined();
    expect(CATEGORY_LABELS.CUIDADO).toBeDefined();
    expect(CATEGORY_LABELS.COMUNIDADE).toBeDefined();
    expect(CATEGORY_LABELS.REGISTRO).toBeDefined();
  });
});
