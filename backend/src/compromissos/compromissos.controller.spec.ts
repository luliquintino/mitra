import { Test, TestingModule } from '@nestjs/testing';
import { CompromissosController } from './compromissos.controller';
import { CompromissosService } from './compromissos.service';
import { createMockCompromisso } from '../../test/test-utils';

describe('CompromissosController', () => {
  let controller: CompromissosController;

  const mockService = {
    list: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompromissosController],
      providers: [
        { provide: CompromissosService, useValue: mockService },
      ],
    }).compile();

    controller = module.get<CompromissosController>(CompromissosController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('list', () => {
    it('should delegate to service.list with petId and userId', async () => {
      const compromissos = [createMockCompromisso()];
      mockService.list.mockResolvedValue(compromissos);

      const result = await controller.list('pet-1', 'usr-1');

      expect(result).toEqual(compromissos);
      expect(mockService.list).toHaveBeenCalledWith('pet-1', 'usr-1');
    });
  });

  describe('create', () => {
    it('should delegate to service.create with petId, userId, and dto', async () => {
      const created = createMockCompromisso();
      mockService.create.mockResolvedValue(created);
      const dto = {
        titulo: 'Passeio',
        tipo: 'PASSEIO',
        recorrencia: 'UNICO',
        dataInicio: '2026-07-01',
      };

      const result = await controller.create('pet-1', 'usr-1', dto as any);

      expect(result).toEqual(created);
      expect(mockService.create).toHaveBeenCalledWith('pet-1', 'usr-1', dto);
    });
  });

  describe('update', () => {
    it('should delegate to service.update with petId, id, userId, and dto', async () => {
      const updated = createMockCompromisso({ titulo: 'Updated' });
      mockService.update.mockResolvedValue(updated);
      const dto = { titulo: 'Updated' };

      const result = await controller.update('pet-1', 'comp-1', 'usr-1', dto as any);

      expect(result).toEqual(updated);
      expect(mockService.update).toHaveBeenCalledWith('pet-1', 'comp-1', 'usr-1', dto);
    });
  });

  describe('remove', () => {
    it('should delegate to service.remove with petId, id, and userId', async () => {
      mockService.remove.mockResolvedValue({ mensagem: 'Compromisso desativado.' });

      const result = await controller.remove('pet-1', 'comp-1', 'usr-1');

      expect(result).toEqual({ mensagem: 'Compromisso desativado.' });
      expect(mockService.remove).toHaveBeenCalledWith('pet-1', 'comp-1', 'usr-1');
    });
  });
});
