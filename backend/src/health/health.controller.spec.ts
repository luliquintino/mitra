import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import {
  createMockVacina,
  createMockMedicamento,
  createMockSintoma,
} from '../../test/test-utils';

describe('HealthController', () => {
  let controller: HealthController;
  let service: Record<string, jest.Mock>;

  const petId = 'pet-test-1';
  const userId = 'usr-test-1';

  beforeEach(async () => {
    service = {
      getVacinas: jest.fn(),
      createVacina: jest.fn(),
      getMedicamentos: jest.fn(),
      createMedicamento: jest.fn(),
      registrarAdministracao: jest.fn(),
      getSintomas: jest.fn(),
      createSintoma: jest.fn(),
      getPlanoSaude: jest.fn(),
      upsertPlanoSaude: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [{ provide: HealthService, useValue: service }],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  describe('getVacinas', () => {
    it('should delegate to healthService.getVacinas', async () => {
      const vacinas = [createMockVacina()];
      service.getVacinas.mockResolvedValue(vacinas);

      const result = await controller.getVacinas(petId, userId);

      expect(service.getVacinas).toHaveBeenCalledWith(petId, userId);
      expect(result).toEqual(vacinas);
    });
  });

  describe('createVacina', () => {
    it('should delegate to healthService.createVacina', async () => {
      const data = { nome: 'V10', dataAplicacao: '2025-06-01' };
      const expected = { vacina: createMockVacina(), mensagem: 'ok' };
      service.createVacina.mockResolvedValue(expected);

      const result = await controller.createVacina(petId, userId, data);

      expect(service.createVacina).toHaveBeenCalledWith(petId, userId, data);
      expect(result).toEqual(expected);
    });
  });

  describe('getMedicamentos', () => {
    it('should delegate to healthService.getMedicamentos', async () => {
      const meds = [createMockMedicamento()];
      service.getMedicamentos.mockResolvedValue(meds);

      const result = await controller.getMedicamentos(petId, userId);

      expect(service.getMedicamentos).toHaveBeenCalledWith(petId, userId);
      expect(result).toEqual(meds);
    });
  });

  describe('createMedicamento', () => {
    it('should delegate to healthService.createMedicamento', async () => {
      const data = { nome: 'Bravecto', dosagem: '1 comp', frequencia: '3m', dataInicio: '2025-06-01' };
      const expected = { medicamento: createMockMedicamento(), mensagem: 'ok' };
      service.createMedicamento.mockResolvedValue(expected);

      const result = await controller.createMedicamento(petId, userId, data);

      expect(service.createMedicamento).toHaveBeenCalledWith(petId, userId, data);
      expect(result).toEqual(expected);
    });
  });

  describe('administrar', () => {
    it('should delegate to healthService.registrarAdministracao', async () => {
      const medId = 'med-test-1';
      const data = { observacoes: 'Dose matinal' };
      const expected = { administracao: { id: 'adm-1' }, mensagem: 'ok' };
      service.registrarAdministracao.mockResolvedValue(expected);

      const result = await controller.administrar(medId, userId, data);

      expect(service.registrarAdministracao).toHaveBeenCalledWith(medId, userId, data);
      expect(result).toEqual(expected);
    });
  });

  describe('getSintomas', () => {
    it('should delegate to healthService.getSintomas', async () => {
      const sintomas = [createMockSintoma()];
      service.getSintomas.mockResolvedValue(sintomas);

      const result = await controller.getSintomas(petId, userId);

      expect(service.getSintomas).toHaveBeenCalledWith(petId, userId);
      expect(result).toEqual(sintomas);
    });
  });

  describe('createSintoma', () => {
    it('should delegate to healthService.createSintoma', async () => {
      const data = { descricao: 'Coceira', dataInicio: '2025-06-01', intensidade: 3 };
      const expected = { sintoma: createMockSintoma(), mensagem: 'ok' };
      service.createSintoma.mockResolvedValue(expected);

      const result = await controller.createSintoma(petId, userId, data);

      expect(service.createSintoma).toHaveBeenCalledWith(petId, userId, data);
      expect(result).toEqual(expected);
    });
  });

  describe('getPlano', () => {
    it('should delegate to healthService.getPlanoSaude', async () => {
      const plano = { id: 'ps-1', operadora: 'PetSaude' };
      service.getPlanoSaude.mockResolvedValue(plano);

      const result = await controller.getPlano(petId, userId);

      expect(service.getPlanoSaude).toHaveBeenCalledWith(petId, userId);
      expect(result).toEqual(plano);
    });
  });

  describe('upsertPlano', () => {
    it('should delegate to healthService.upsertPlanoSaude', async () => {
      const data = { operadora: 'PetSaude', numeroCartao: '12345' };
      const expected = { plano: { id: 'ps-1' }, mensagem: 'ok' };
      service.upsertPlanoSaude.mockResolvedValue(expected);

      const result = await controller.upsertPlano(petId, userId, data);

      expect(service.upsertPlanoSaude).toHaveBeenCalledWith(petId, userId, data);
      expect(result).toEqual(expected);
    });
  });
});
