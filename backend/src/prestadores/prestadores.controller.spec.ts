import { Test, TestingModule } from '@nestjs/testing';
import { PrestadoresController } from './prestadores.controller';
import { PrestadoresService } from './prestadores.service';

describe('PrestadoresController', () => {
  let controller: PrestadoresController;
  let service: PrestadoresService;

  const mockService = {
    findProfile: jest.fn(),
    updateProfile: jest.fn(),
    listPrestadores: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PrestadoresController],
      providers: [
        { provide: PrestadoresService, useValue: mockService },
      ],
    }).compile();

    controller = module.get<PrestadoresController>(PrestadoresController);
    service = module.get<PrestadoresService>(PrestadoresService);

    jest.clearAllMocks();
  });

  describe('getMyProfile', () => {
    it('should delegate to service.findProfile with user.id', async () => {
      const user = { id: 'usr-1' };
      const expected = { id: 'prest-1', usuarioId: 'usr-1' };
      mockService.findProfile.mockResolvedValue(expected);

      const result = await controller.getMyProfile(user);

      expect(result).toEqual(expected);
      expect(mockService.findProfile).toHaveBeenCalledWith('usr-1');
    });
  });

  describe('updateMyProfile', () => {
    it('should delegate to service.updateProfile with user.id and data', async () => {
      const user = { id: 'usr-1' };
      const data = { tipoPrestador: 'VETERINARIO' };
      const expected = { id: 'prest-1', ...data };
      mockService.updateProfile.mockResolvedValue(expected);

      const result = await controller.updateMyProfile(user, data);

      expect(result).toEqual(expected);
      expect(mockService.updateProfile).toHaveBeenCalledWith('usr-1', data);
    });
  });

  describe('listPrestadores', () => {
    it('should delegate to service.listPrestadores with no args', async () => {
      const user = { id: 'usr-1' };
      const expected = [{ id: 'prest-1' }];
      mockService.listPrestadores.mockResolvedValue(expected);

      const result = await controller.listPrestadores(user);

      expect(result).toEqual(expected);
      expect(mockService.listPrestadores).toHaveBeenCalledWith();
    });
  });

  describe('getPrestador', () => {
    it('should delegate to service.findProfile with param id', async () => {
      const expected = { id: 'prest-1', usuarioId: 'usr-2' };
      mockService.findProfile.mockResolvedValue(expected);

      const result = await controller.getPrestador('usr-2');

      expect(result).toEqual(expected);
      expect(mockService.findProfile).toHaveBeenCalledWith('usr-2');
    });
  });
});
