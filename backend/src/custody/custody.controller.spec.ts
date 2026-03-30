import { Test, TestingModule } from '@nestjs/testing';
import { CustodyController } from './custody.controller';
import { CustodyService } from './custody.service';

describe('CustodyController', () => {
  let controller: CustodyController;
  let service: Record<string, jest.Mock>;

  const petId = 'pet-test-1';
  const userId = 'usr-test-1';

  beforeEach(async () => {
    service = {
      getGuardas: jest.fn().mockResolvedValue([]),
      getSolicitacoes: jest.fn().mockResolvedValue([]),
      criarSolicitacao: jest.fn().mockResolvedValue({ mensagem: 'ok' }),
      responderSolicitacao: jest.fn().mockResolvedValue({ mensagem: 'ok' }),
      getGuardasTemporarias: jest.fn().mockResolvedValue([]),
      criarGuardaTemporariaManual: jest.fn().mockResolvedValue({ id: 'gt-1' }),
      confirmarGuarda: jest.fn().mockResolvedValue({ status: 'CONFIRMADA' }),
      cancelarGuarda: jest.fn().mockResolvedValue({ status: 'CANCELADA' }),
      verificarSolicitacoesExpiradas: jest.fn().mockResolvedValue({ expiradas: 0 }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustodyController],
      providers: [{ provide: CustodyService, useValue: service }],
    }).compile();

    controller = module.get<CustodyController>(CustodyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getGuardas', () => {
    it('should delegate to service.getGuardas', async () => {
      await controller.getGuardas(petId, userId);
      expect(service.getGuardas).toHaveBeenCalledWith(petId, userId);
    });
  });

  describe('getSolicitacoes', () => {
    it('should delegate to service.getSolicitacoes', async () => {
      await controller.getSolicitacoes(petId, userId);
      expect(service.getSolicitacoes).toHaveBeenCalledWith(petId, userId);
    });
  });

  describe('criarSolicitacao', () => {
    it('should delegate to service.criarSolicitacao', async () => {
      const body = { destinatarioId: 'usr-2', justificativa: 'motivo' };
      await controller.criarSolicitacao(petId, userId, body);
      expect(service.criarSolicitacao).toHaveBeenCalledWith(petId, userId, body);
    });
  });

  describe('responderSolicitacao', () => {
    it('should delegate to service.responderSolicitacao', async () => {
      const body = { aprovada: true, mensagem: 'Ok' };
      await controller.responderSolicitacao('sol-1', userId, body);
      expect(service.responderSolicitacao).toHaveBeenCalledWith('sol-1', userId, true, 'Ok');
    });
  });

  describe('getGuardasTemporarias', () => {
    it('should delegate to service.getGuardasTemporarias', async () => {
      await controller.getGuardasTemporarias(petId, userId);
      expect(service.getGuardasTemporarias).toHaveBeenCalledWith(petId, userId);
    });
  });

  describe('criarGuardaTemporaria', () => {
    it('should delegate to service.criarGuardaTemporariaManual', async () => {
      const body = { responsavelId: 'usr-2', dataInicio: '2026-04-01', dataFim: '2026-04-02' };
      await controller.criarGuardaTemporaria(petId, userId, body);
      expect(service.criarGuardaTemporariaManual).toHaveBeenCalledWith(petId, userId, body);
    });
  });

  describe('confirmarGuarda', () => {
    it('should delegate to service.confirmarGuarda', async () => {
      await controller.confirmarGuarda(petId, 'gt-1', userId);
      expect(service.confirmarGuarda).toHaveBeenCalledWith(petId, 'gt-1', userId);
    });
  });

  describe('cancelarGuarda', () => {
    it('should delegate to service.cancelarGuarda', async () => {
      await controller.cancelarGuarda(petId, 'gt-1', userId);
      expect(service.cancelarGuarda).toHaveBeenCalledWith(petId, 'gt-1', userId);
    });
  });

  describe('verificarExpiradas', () => {
    it('should delegate to service.verificarSolicitacoesExpiradas', async () => {
      await controller.verificarExpiradas();
      expect(service.verificarSolicitacoesExpiradas).toHaveBeenCalled();
    });
  });
});
