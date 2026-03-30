import { Test, TestingModule } from '@nestjs/testing';
import { RegistrosController } from './registros.controller';
import { RegistrosService } from './registros.service';

describe('RegistrosController', () => {
  let controller: RegistrosController;

  const mockService = {
    create: jest.fn(),
    listMeus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RegistrosController],
      providers: [
        { provide: RegistrosService, useValue: mockService },
      ],
    }).compile();

    controller = module.get<RegistrosController>(RegistrosController);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should delegate to service.create with petId, userId, and dto', async () => {
      const dto = { tipo: 'VISITA', titulo: 'Consulta', descricao: 'Checkup', dados: null } as any;
      const expected = { id: 'evt-1', petId: 'pet-1', tipo: 'VISITA_REGISTRADA' };
      mockService.create.mockResolvedValue(expected);

      const result = await controller.create('pet-1', dto, 'usr-1');

      expect(result).toEqual(expected);
      expect(mockService.create).toHaveBeenCalledWith('pet-1', 'usr-1', dto);
    });
  });

  describe('listMeus', () => {
    it('should delegate to service.listMeus with petId and userId', async () => {
      const expected = [{ id: 'evt-1' }];
      mockService.listMeus.mockResolvedValue(expected);

      const result = await controller.listMeus('pet-1', 'usr-1');

      expect(result).toEqual(expected);
      expect(mockService.listMeus).toHaveBeenCalledWith('pet-1', 'usr-1');
    });
  });
});
