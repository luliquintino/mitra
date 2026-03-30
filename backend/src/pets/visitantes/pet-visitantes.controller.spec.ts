import { Test, TestingModule } from '@nestjs/testing';
import { PetVisitantesController, VisitantePetsController } from './pet-visitantes.controller';
import { PetVisitantesService } from './pet-visitantes.service';

describe('PetVisitantesController', () => {
  let controller: PetVisitantesController;

  const mockService = {
    inviteVisitante: jest.fn(),
    listVisitantes: jest.fn(),
    revokeAccess: jest.fn(),
    updatePermissions: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PetVisitantesController],
      providers: [
        { provide: PetVisitantesService, useValue: mockService },
      ],
    }).compile();

    controller = module.get<PetVisitantesController>(PetVisitantesController);

    jest.clearAllMocks();
  });

  describe('inviteVisitante', () => {
    it('should delegate to service.inviteVisitante with user.sub', async () => {
      const data = { email: 'visitor@test.com' };
      mockService.inviteVisitante.mockResolvedValue({ id: 'pv-1' });

      const result = await controller.inviteVisitante('pet-1', { sub: 'usr-tutor' }, data as any);

      expect(result).toEqual({ id: 'pv-1' });
      expect(mockService.inviteVisitante).toHaveBeenCalledWith('pet-1', 'usr-tutor', data);
    });
  });

  describe('listVisitantes', () => {
    it('should delegate to service.listVisitantes', async () => {
      mockService.listVisitantes.mockResolvedValue([]);

      const result = await controller.listVisitantes('pet-1');

      expect(result).toEqual([]);
      expect(mockService.listVisitantes).toHaveBeenCalledWith('pet-1');
    });
  });

  describe('revokeAccess', () => {
    it('should delegate to service.revokeAccess with user.sub', async () => {
      mockService.revokeAccess.mockResolvedValue({ statusVinculo: 'BLOQUEADO' });

      const result = await controller.revokeAccess('pet-1', 'usr-v', { sub: 'usr-tutor' });

      expect(result).toEqual({ statusVinculo: 'BLOQUEADO' });
      expect(mockService.revokeAccess).toHaveBeenCalledWith('pet-1', 'usr-v', 'usr-tutor');
    });
  });

  describe('updatePermissions', () => {
    it('should delegate to service.updatePermissions', async () => {
      const body = { permissoes: ['DADOS_BASICOS'] };
      mockService.updatePermissions.mockResolvedValue({ permissoesVisualizacao: body.permissoes });

      const result = await controller.updatePermissions('pet-1', 'usr-v', { sub: 'usr-tutor' }, body);

      expect(result).toEqual({ permissoesVisualizacao: body.permissoes });
      expect(mockService.updatePermissions).toHaveBeenCalledWith('pet-1', 'usr-v', 'usr-tutor', body.permissoes);
    });
  });
});

describe('VisitantePetsController', () => {
  let controller: VisitantePetsController;

  const mockService = {
    listPetsByVisitante: jest.fn(),
    getPendingInvites: jest.fn(),
    acceptInvite: jest.fn(),
    rejectInvite: jest.fn(),
    selfRevoke: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VisitantePetsController],
      providers: [
        { provide: PetVisitantesService, useValue: mockService },
      ],
    }).compile();

    controller = module.get<VisitantePetsController>(VisitantePetsController);

    jest.clearAllMocks();
  });

  describe('listMyPets', () => {
    it('should delegate to service.listPetsByVisitante with user.sub', async () => {
      mockService.listPetsByVisitante.mockResolvedValue([{ id: 'pet-1' }]);

      const result = await controller.listMyPets({ sub: 'usr-v' });

      expect(result).toEqual([{ id: 'pet-1' }]);
      expect(mockService.listPetsByVisitante).toHaveBeenCalledWith('usr-v');
    });
  });

  describe('listPendingInvites', () => {
    it('should delegate to service.getPendingInvites with user.sub', async () => {
      mockService.getPendingInvites.mockResolvedValue([{ id: 'pv-1' }]);

      const result = await controller.listPendingInvites({ sub: 'usr-v' });

      expect(result).toEqual([{ id: 'pv-1' }]);
      expect(mockService.getPendingInvites).toHaveBeenCalledWith('usr-v');
    });
  });

  describe('acceptInvite', () => {
    it('should delegate to service.acceptInvite', async () => {
      mockService.acceptInvite.mockResolvedValue({ aceito: true });

      const result = await controller.acceptInvite('pv-1', { sub: 'usr-v' });

      expect(result).toEqual({ aceito: true });
      expect(mockService.acceptInvite).toHaveBeenCalledWith('pv-1', 'usr-v');
    });
  });

  describe('rejectInvite', () => {
    it('should delegate to service.rejectInvite', async () => {
      mockService.rejectInvite.mockResolvedValue({ message: 'Convite recusado com sucesso.' });

      const result = await controller.rejectInvite('pv-1', { sub: 'usr-v' });

      expect(result).toEqual({ message: 'Convite recusado com sucesso.' });
      expect(mockService.rejectInvite).toHaveBeenCalledWith('pv-1', 'usr-v');
    });
  });

  describe('selfRevoke', () => {
    it('should delegate to service.selfRevoke', async () => {
      mockService.selfRevoke.mockResolvedValue({ message: 'Você saiu do acompanhamento deste pet.' });

      const result = await controller.selfRevoke('pet-1', { sub: 'usr-v' });

      expect(result).toEqual({ message: 'Você saiu do acompanhamento deste pet.' });
      expect(mockService.selfRevoke).toHaveBeenCalledWith('pet-1', 'usr-v');
    });
  });
});
