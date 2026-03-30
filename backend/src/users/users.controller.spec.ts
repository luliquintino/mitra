import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;

  const mockService = {
    updateProfile: jest.fn(),
    submitFeedback: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: mockService },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('updateProfile', () => {
    it('should delegate to service.updateProfile with userId and body', async () => {
      const updated = {
        id: 'usr-1',
        nome: 'Novo Nome',
        email: 'test@mitra.com',
        telefone: '11999990000',
        avatarUrl: null,
      };
      mockService.updateProfile.mockResolvedValue(updated);

      const result = await controller.updateProfile('usr-1', {
        nome: 'Novo Nome',
        telefone: '11999990000',
      });

      expect(result).toEqual(updated);
      expect(mockService.updateProfile).toHaveBeenCalledWith('usr-1', {
        nome: 'Novo Nome',
        telefone: '11999990000',
      });
    });
  });

  describe('feedback', () => {
    it('should delegate to service.submitFeedback with userId and body', async () => {
      const response = {
        feedback: { id: 'fb-1' },
        mensagem: 'Feedback enviado com sucesso. Obrigado!',
      };
      mockService.submitFeedback.mockResolvedValue(response);

      const result = await controller.feedback('usr-1', {
        tipo: 'BUG',
        mensagem: 'Encontrei um problema',
      });

      expect(result).toEqual(response);
      expect(mockService.submitFeedback).toHaveBeenCalledWith('usr-1', {
        tipo: 'BUG',
        mensagem: 'Encontrei um problema',
      });
    });
  });
});
