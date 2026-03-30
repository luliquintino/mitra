import { Test, TestingModule } from '@nestjs/testing';
import { GovernanceController } from './governance.controller';
import { GovernanceService } from './governance.service';

describe('GovernanceController', () => {
  let controller: GovernanceController;
  let service: Record<string, jest.Mock>;

  const petId = 'pet-test-1';
  const userId = 'usr-test-1';

  beforeEach(async () => {
    service = {
      getTutores: jest.fn().mockResolvedValue([]),
      adicionarTutor: jest.fn().mockResolvedValue({ mensagem: 'ok' }),
      arquivarPet: jest.fn().mockResolvedValue({ mensagem: 'ok' }),
      reativarPet: jest.fn().mockResolvedValue({ mensagem: 'ok' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [GovernanceController],
      providers: [{ provide: GovernanceService, useValue: service }],
    }).compile();

    controller = module.get<GovernanceController>(GovernanceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getTutores', () => {
    it('should delegate to service.getTutores', async () => {
      await controller.getTutores(petId, userId);
      expect(service.getTutores).toHaveBeenCalledWith(petId, userId);
    });
  });

  describe('adicionarTutor', () => {
    it('should delegate to service.adicionarTutor', async () => {
      const body = { email: 'novo@mitra.com', role: 'TUTOR_PRINCIPAL' };
      await controller.adicionarTutor(petId, userId, body);
      expect(service.adicionarTutor).toHaveBeenCalledWith(petId, userId, body.email, body.role);
    });
  });

  describe('arquivar', () => {
    it('should delegate to service.arquivarPet', async () => {
      const body = { justificativa: 'Motivo' };
      await controller.arquivar(petId, userId, body);
      expect(service.arquivarPet).toHaveBeenCalledWith(petId, userId, 'Motivo');
    });
  });

  describe('reativar', () => {
    it('should delegate to service.reativarPet', async () => {
      const body = { justificativa: 'Retorno' };
      await controller.reativar(petId, userId, body);
      expect(service.reativarPet).toHaveBeenCalledWith(petId, userId, 'Retorno');
    });
  });
});
