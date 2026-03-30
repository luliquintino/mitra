import { Test, TestingModule } from '@nestjs/testing';
import { PetsController } from './pets.controller';
import { PetsService } from './pets.service';
import { createMockPet } from '../../test/test-utils';

describe('PetsController', () => {
  let controller: PetsController;
  let service: Record<string, jest.Mock>;

  const mockPet = createMockPet();
  const userId = 'usr-test-1';

  beforeEach(async () => {
    service = {
      findAllByUser: jest.fn(),
      findOne: jest.fn(),
      findByCodigo: jest.fn(),
      vincularByCodigo: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      getDashboard: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PetsController],
      providers: [{ provide: PetsService, useValue: service }],
    }).compile();

    controller = module.get<PetsController>(PetsController);
  });

  describe('findAll', () => {
    it('should delegate to petsService.findAllByUser', async () => {
      service.findAllByUser.mockResolvedValue([mockPet]);
      const result = await controller.findAll(userId);
      expect(service.findAllByUser).toHaveBeenCalledWith(userId);
      expect(result).toEqual([mockPet]);
    });
  });

  describe('findOne', () => {
    it('should delegate to petsService.findOne', async () => {
      service.findOne.mockResolvedValue(mockPet);
      const result = await controller.findOne(mockPet.id, userId);
      expect(service.findOne).toHaveBeenCalledWith(mockPet.id, userId);
      expect(result).toEqual(mockPet);
    });
  });

  describe('findByCodigo', () => {
    it('should delegate to petsService.findByCodigo', async () => {
      service.findByCodigo.mockResolvedValue({ id: mockPet.id, nome: mockPet.nome });
      const result = await controller.findByCodigo('MITRA-ABC123');
      expect(service.findByCodigo).toHaveBeenCalledWith('MITRA-ABC123');
      expect(result).toHaveProperty('id', mockPet.id);
    });
  });

  describe('vincularByCodigo', () => {
    it('should delegate to petsService.vincularByCodigo with dto.role', async () => {
      const expected = { petId: mockPet.id, message: 'Vinculado com sucesso' };
      service.vincularByCodigo.mockResolvedValue(expected);

      const result = await controller.vincularByCodigo(
        'MITRA-ABC123',
        { role: 'TUTOR_PRINCIPAL' } as any,
        userId,
      );

      expect(service.vincularByCodigo).toHaveBeenCalledWith('MITRA-ABC123', userId, 'TUTOR_PRINCIPAL');
      expect(result).toEqual(expected);
    });
  });

  describe('create', () => {
    it('should delegate to petsService.create', async () => {
      const dto = { nome: 'Luna', especie: 'CACHORRO' };
      service.create.mockResolvedValue(mockPet);

      const result = await controller.create(userId, dto as any);

      expect(service.create).toHaveBeenCalledWith(userId, dto);
      expect(result).toEqual(mockPet);
    });
  });

  describe('update', () => {
    it('should delegate to petsService.update', async () => {
      const dto = { nome: 'Luna Updated' };
      service.update.mockResolvedValue({ ...mockPet, nome: 'Luna Updated' });

      const result = await controller.update(mockPet.id, userId, dto as any);

      expect(service.update).toHaveBeenCalledWith(mockPet.id, userId, dto);
      expect(result.nome).toBe('Luna Updated');
    });
  });

  describe('getDashboard', () => {
    it('should delegate to petsService.getDashboard', async () => {
      const dashboard = { pet: mockPet, alertas: {}, hoje: {}, atividadeRecente: [] };
      service.getDashboard.mockResolvedValue(dashboard);

      const result = await controller.getDashboard(mockPet.id, userId);

      expect(service.getDashboard).toHaveBeenCalledWith(mockPet.id, userId);
      expect(result).toEqual(dashboard);
    });
  });
});
