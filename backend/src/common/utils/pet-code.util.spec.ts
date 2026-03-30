import { generatePetCode } from './pet-code.util';

describe('generatePetCode', () => {
  it('should return a 6-character string', () => {
    const code = generatePetCode();
    expect(code).toHaveLength(6);
  });

  it('should only contain allowed characters (no I, O, 0, 1)', () => {
    const allowed = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    for (let i = 0; i < 50; i++) {
      const code = generatePetCode();
      for (const char of code) {
        expect(allowed).toContain(char);
      }
    }
  });

  it('should not contain ambiguous characters', () => {
    for (let i = 0; i < 100; i++) {
      const code = generatePetCode();
      expect(code).not.toMatch(/[IO01]/);
    }
  });

  it('should generate different codes on successive calls', () => {
    const codes = new Set<string>();
    for (let i = 0; i < 20; i++) {
      codes.add(generatePetCode());
    }
    // With 6-char codes from 28 charset, collision in 20 is extremely unlikely
    expect(codes.size).toBeGreaterThan(15);
  });
});
