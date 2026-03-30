import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { createMockUser } from '../../test/test-utils';

describe('UsersService', () => {
  let service: UsersService;

  const mockPrisma = {
    usuario: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    feedback: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByEmail', () => {
    it('should return a user when found', async () => {
      const user = createMockUser();
      mockPrisma.usuario.findUnique.mockResolvedValue(user);

      const result = await service.findByEmail('test@mitra.com');

      expect(result).toEqual(user);
      expect(mockPrisma.usuario.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@mitra.com' },
      });
    });

    it('should return null when user not found', async () => {
      mockPrisma.usuario.findUnique.mockResolvedValue(null);

      const result = await service.findByEmail('unknown@mitra.com');

      expect(result).toBeNull();
    });
  });

  describe('updateProfile', () => {
    it('should update user profile and return selected fields', async () => {
      const updated = {
        id: 'usr-test-1',
        nome: 'Novo Nome',
        email: 'test@mitra.com',
        telefone: '11999991111',
        avatarUrl: null,
      };
      mockPrisma.usuario.update.mockResolvedValue(updated);

      const result = await service.updateProfile('usr-test-1', {
        nome: 'Novo Nome',
        telefone: '11999991111',
      });

      expect(result).toEqual(updated);
      expect(mockPrisma.usuario.update).toHaveBeenCalledWith({
        where: { id: 'usr-test-1' },
        data: { nome: 'Novo Nome', telefone: '11999991111' },
        select: {
          id: true,
          nome: true,
          email: true,
          telefone: true,
          avatarUrl: true,
        },
      });
    });

    it('should allow partial updates (nome only)', async () => {
      const updated = {
        id: 'usr-test-1',
        nome: 'Apenas Nome',
        email: 'test@mitra.com',
        telefone: '11999990000',
        avatarUrl: null,
      };
      mockPrisma.usuario.update.mockResolvedValue(updated);

      await service.updateProfile('usr-test-1', { nome: 'Apenas Nome' });

      expect(mockPrisma.usuario.update).toHaveBeenCalledWith({
        where: { id: 'usr-test-1' },
        data: { nome: 'Apenas Nome' },
        select: expect.any(Object),
      });
    });
  });

  describe('submitFeedback', () => {
    it('should create feedback and return success message', async () => {
      const feedback = {
        id: 'fb-1',
        usuarioId: 'usr-test-1',
        tipo: 'SUGESTAO',
        mensagem: 'Adorei o app!',
        criadoEm: new Date(),
      };
      mockPrisma.feedback.create.mockResolvedValue(feedback);

      const result = await service.submitFeedback('usr-test-1', {
        tipo: 'SUGESTAO',
        mensagem: 'Adorei o app!',
      });

      expect(result).toEqual({
        feedback,
        mensagem: 'Feedback enviado com sucesso. Obrigado!',
      });
      expect(mockPrisma.feedback.create).toHaveBeenCalledWith({
        data: {
          usuarioId: 'usr-test-1',
          tipo: 'SUGESTAO',
          mensagem: 'Adorei o app!',
        },
      });
    });
  });
});
