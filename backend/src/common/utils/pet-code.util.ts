// Charset sem caracteres ambíguos: sem I, O, 0, 1
const CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/**
 * Gera um código único de 6 caracteres para o pet.
 * Usa charset sem I/O/0/1 para evitar confusão visual.
 */
export function generatePetCode(): string {
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += CHARSET[Math.floor(Math.random() * CHARSET.length)];
  }
  return code;
}
