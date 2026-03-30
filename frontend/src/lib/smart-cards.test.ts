import {
  generateTutorSmartCards,
  generatePrestadorBriefing,
} from './smart-cards';

const basePet = {
  id: 'pet-1',
  nome: 'Luna',
  especie: 'CACHORRO',
  dataNascimento: '2020-01-01',
  criadoEm: '2020-01-01T00:00:00.000Z',
} as any;

const makeInput = (overrides: Record<string, any> = {}) => ({
  pet: basePet,
  vacinas: [],
  medicamentos: [],
  sintomas: [],
  eventos: [],
  compromissos: [],
  solicitacoes: [],
  tutores: [],
  guardas: [],
  planoSaude: null,
  ...overrides,
});

describe('generateTutorSmartCards', () => {
  it('should return an array of smart cards', () => {
    const result = generateTutorSmartCards(makeInput());
    expect(Array.isArray(result)).toBe(true);
  });

  it('should generate urgent card for overdue vaccine', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 5);
    const result = generateTutorSmartCards(
      makeInput({
        vacinas: [
          { id: 'v1', nome: 'V10', proximaDose: yesterday.toISOString() },
        ],
      }),
    );
    const urgent = result.find((c) => c.id === 'vac-overdue-v1');
    expect(urgent).toBeDefined();
    expect(urgent?.priority).toBe('urgent');
    expect(urgent?.title).toContain('V10');
  });

  it('should generate warning for vaccine expiring within 30 days', () => {
    const in15Days = new Date();
    in15Days.setDate(in15Days.getDate() + 15);
    const result = generateTutorSmartCards(
      makeInput({
        vacinas: [
          { id: 'v1', nome: 'V10', proximaDose: in15Days.toISOString() },
        ],
      }),
    );
    const warning = result.find((c) => c.id === 'vac-soon-v1');
    expect(warning).toBeDefined();
    expect(warning?.priority).toBe('warning');
  });

  it('should generate urgent card for pending solicitacao', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const result = generateTutorSmartCards(
      makeInput({
        solicitacoes: [
          {
            id: 's1',
            status: 'PENDENTE',
            tipo: 'ALTERACAO_GUARDA',
            expiradoEm: tomorrow.toISOString(),
            solicitante: { nome: 'Maria' },
          },
        ],
      }),
    );
    const urgent = result.find((c) => c.id === 'sol-s1');
    expect(urgent).toBeDefined();
    expect(urgent?.priority).toBe('urgent');
  });

  it('should generate warning for active sintoma', () => {
    const result = generateTutorSmartCards(
      makeInput({
        sintomas: [{ id: 'sin1', descricao: 'Coceira', intensidade: 3 }],
      }),
    );
    const warning = result.find((c) => c.id === 'sint-sin1');
    expect(warning).toBeDefined();
    expect(warning?.priority).toBe('warning');
  });

  it('should generate suggestion for few tutores', () => {
    const result = generateTutorSmartCards(makeInput({ tutores: [{ id: 't1' }] }));
    const suggestion = result.find((c) => c.id === 'suggest-invite');
    expect(suggestion).toBeDefined();
    expect(suggestion?.priority).toBe('suggestion');
  });

  it('should sort cards by priority (urgent first)', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 5);
    const in15Days = new Date();
    in15Days.setDate(in15Days.getDate() + 15);
    const result = generateTutorSmartCards(
      makeInput({
        vacinas: [
          { id: 'v1', nome: 'V10', proximaDose: yesterday.toISOString() },
          { id: 'v2', nome: 'Antirrábica', proximaDose: in15Days.toISOString() },
        ],
        tutores: [{ id: 't1' }],
      }),
    );
    // First card should be urgent
    expect(result[0]?.priority).toBe('urgent');
  });

  it('should generate warning for medication ending soon', () => {
    const in3Days = new Date();
    in3Days.setDate(in3Days.getDate() + 3);
    const result = generateTutorSmartCards(
      makeInput({
        medicamentos: [
          {
            id: 'm1',
            nome: 'Bravecto',
            status: 'ATIVO',
            dosagem: '1cp',
            frequencia: 'mensal',
            dataFim: in3Days.toISOString(),
          },
        ],
      }),
    );
    const warning = result.find((c) => c.id === 'med-ending-m1');
    expect(warning).toBeDefined();
    expect(warning?.priority).toBe('warning');
  });
});

describe('generatePrestadorBriefing', () => {
  it('should return array of briefing cards', () => {
    const result = generatePrestadorBriefing(
      basePet,
      [],
      [],
      [],
      [],
    );
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it('should show vaccines status', () => {
    const result = generatePrestadorBriefing(basePet, [], [], [], []);
    const vacCard = result.find((c) => c.id === 'briefing-vacinas');
    expect(vacCard).toBeDefined();
    expect(vacCard?.value).toContain('Nenhuma registrada');
  });

  it('should show vaccines up to date', () => {
    const future = new Date();
    future.setFullYear(future.getFullYear() + 1);
    const result = generatePrestadorBriefing(
      basePet,
      [{ id: 'v1', nome: 'V10', proximaDose: future.toISOString() } as any],
      [],
      [],
      [],
    );
    const vacCard = result.find((c) => c.id === 'briefing-vacinas');
    expect(vacCard?.status).toBe('ok');
    expect(vacCard?.value).toContain('em dia');
  });

  it('should show active medications as warnings', () => {
    const result = generatePrestadorBriefing(
      basePet,
      [],
      [{ id: 'm1', nome: 'Bravecto', status: 'ATIVO', dosagem: '1cp', frequencia: 'mensal' } as any],
      [],
      [],
    );
    const medCard = result.find((c) => c.id === 'briefing-med-m1');
    expect(medCard).toBeDefined();
    expect(medCard?.status).toBe('warning');
  });

  it('should show active symptoms', () => {
    const result = generatePrestadorBriefing(
      basePet,
      [],
      [],
      [{ id: 's1', descricao: 'Coceira', intensidade: 3 }],
      [],
    );
    const sintCard = result.find((c) => c.id === 'briefing-sint-s1');
    expect(sintCard).toBeDefined();
    expect(sintCard?.value).toContain('Coceira');
  });

  it('should show tutor principal info', () => {
    const result = generatePrestadorBriefing(
      basePet,
      [],
      [],
      [],
      [{ role: 'TUTOR_PRINCIPAL', usuario: { nome: 'Maria' } } as any],
    );
    const tutorCard = result.find((c) => c.id === 'briefing-tutor');
    expect(tutorCard).toBeDefined();
    expect(tutorCard?.value).toBe('Maria');
  });
});
