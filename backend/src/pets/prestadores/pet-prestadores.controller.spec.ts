import { Test, TestingModule } from '@nestjs/testing';
import { PetPrestadoresController, PrestadorPetsController } from './pet-prestadores.controller';
import { PetPrestadoresService } from './pet-prestadores.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('PetPrestadoresController', () => {
  let controller: PetPrestadoresController;

  const mockService = {
    invitePrestador: jest.fn(),
    listPrestadores: jest.fn(),
    acceptInvite: jest.fn(),
    rejectInvite: jest.fn(),
    revokeAccess: jest.fn(),
    listPetsByPrestador: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PetPrestadoresController],
      providers: [
        { provide: PetPrestadoresService, useValue: mockService },
      ],
    }).compile();

    controller = module.get<PetPrestadoresController>(PetPrestadoresController);

    jest.clearAllMocks();
  });

  describe('invitePrestador', () => {
    it('should delegate to service.invitePrestador', async () => {
      const data = { email: 'vet@test.com' };
      mockService.invitePrestador.mockResolvedValue({ id: 'pp-1' });

      const result = await controller.invitePrestador('pet-1', { id: 'usr-1' }, data as any);

      expect(result).toEqual({ id: 'pp-1' });
      expect(mockService.invitePrestador).toHaveBeenCalledWith('pet-1', 'usr-1', data);
    });
  });

  describe('listPrestadores', () => {
    it('should delegate to service.listPrestadores', async () => {
      mockService.listPrestadores.mockResolvedValue([]);

      const result = await controller.listPrestadores('pet-1');

      expect(result).toEqual([]);
      expect(mockService.listPrestadores).toHaveBeenCalledWith('pet-1');
    });
  });

  describe('acceptInvite', () => {
    it('should delegate to service.acceptInvite', async () => {
      mockService.acceptInvite.mockResolvedValue({ aceito: true });

      const result = await controller.acceptInvite('pet-1', 'pp-1', { id: 'usr-vet' });

      expect(result).toEqual({ aceito: true });
      expect(mockService.acceptInvite).toHaveBeenCalledWith('pp-1', 'usr-vet');
    });
  });

  describe('rejectInvite', () => {
    it('should delegate to service.rejectInvite', async () => {
      mockService.rejectInvite.mockResolvedValue({ message: 'Convite recusado com sucesso.' });

      const result = await controller.rejectInvite('pet-1', 'pp-1', { id: 'usr-vet' });

      expect(result).toEqual({ message: 'Convite recusado com sucesso.' });
      expect(mockService.rejectInvite).toHaveBeenCalledWith('pp-1', 'usr-vet');
    });
  });

  describe('revokeAccess', () => {
    it('should delegate to service.revokeAccess', async () => {
      mockService.revokeAccess.mockResolvedValue({ statusVinculo: 'BLOQUEADO' });

      const result = await controller.revokeAccess('pet-1', 'pf-1', { id: 'usr-tutor' });

      expect(result).toEqual({ statusVinculo: 'BLOQUEADO' });
      expect(mockService.revokeAccess).toHaveBeenCalledWith('pet-1', 'pf-1', 'usr-tutor');
    });
  });
});

describe('PrestadorPetsController', () => {
  let controller: PrestadorPetsController;

  const mockService = {
    listPetsByPrestador: jest.fn(),
  };

  const mockPrisma = {
    usuario: { findUnique: jest.fn() },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PrestadorPetsController],
      providers: [
        { provide: PetPrestadoresService, useValue: mockService },
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    controller = module.get<PrestadorPetsController>(PrestadorPetsController);

    jest.clearAllMocks();
  });

  describe('listMyPets', () => {
    it('should return pets when user has prestador profile', async () => {
      mockPrisma.usuario.findUnique.mockResolvedValue({
        id: 'usr-vet',
        perfilPrestador: { id: 'pf-1' },
      });
      mockService.listPetsByPrestador.mockResolvedValue([{ id: 'pet-1', nome: 'Luna' }]);

      const result = await controller.listMyPets({ id: 'usr-vet' });

      expect(result).toEqual([{ id: 'pet-1', nome: 'Luna' }]);
      expect(mockService.listPetsByPrestador).toHaveBeenCalledWith('pf-1');
    });

    it('should return empty array when user has no prestador profile', async () => {
      mockPrisma.usuario.findUnique.mockResolvedValue({
        id: 'usr-1',
        perfilPrestador: null,
      });

      const result = await controller.listMyPets({ id: 'usr-1' });

      expect(result).toEqual([]);
      expect(mockService.listPetsByPrestador).not.toHaveBeenCalled();
    });
  });
});
