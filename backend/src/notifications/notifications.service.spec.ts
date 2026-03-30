import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { createMockNotificacao } from '../../test/test-utils';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let prisma: PrismaService;

  const mockPrisma = {
    notificacao: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a notification with all fields', async () => {
      const notif = createMockNotificacao();
      mockPrisma.notificacao.create.mockResolvedValue(notif);

      const data = {
        usuarioId: 'usr-test-1',
        tipo: 'GERAL' as any,
        titulo: 'Test Notification',
        mensagem: 'Test message',
        deepLink: '/pets/1',
        dados: { petId: 'pet-1' },
      };

      const result = await service.create(data);

      expect(result).toEqual(notif);
      expect(mockPrisma.notificacao.create).toHaveBeenCalledWith({
        data: {
          usuarioId: data.usuarioId,
          tipo: data.tipo,
          titulo: data.titulo,
          mensagem: data.mensagem,
          deepLink: data.deepLink,
          dados: data.dados,
        },
      });
    });

    it('should create a notification without optional fields', async () => {
      const notif = createMockNotificacao();
      mockPrisma.notificacao.create.mockResolvedValue(notif);

      const data = {
        usuarioId: 'usr-test-1',
        tipo: 'GERAL' as any,
        titulo: 'Test',
        mensagem: 'Msg',
      };

      await service.create(data);

      expect(mockPrisma.notificacao.create).toHaveBeenCalledWith({
        data: {
          usuarioId: 'usr-test-1',
          tipo: 'GERAL',
          titulo: 'Test',
          mensagem: 'Msg',
          deepLink: undefined,
          dados: undefined,
        },
      });
    });
  });

  describe('getAll', () => {
    it('should return notifications ordered by criadoEm desc, limited to 30', async () => {
      const notifs = [createMockNotificacao(), createMockNotificacao({ id: 'notif-2' })];
      mockPrisma.notificacao.findMany.mockResolvedValue(notifs);

      const result = await service.getAll('usr-test-1');

      expect(result).toEqual(notifs);
      expect(mockPrisma.notificacao.findMany).toHaveBeenCalledWith({
        where: { usuarioId: 'usr-test-1' },
        orderBy: { criadoEm: 'desc' },
        take: 30,
      });
    });

    it('should return empty array when user has no notifications', async () => {
      mockPrisma.notificacao.findMany.mockResolvedValue([]);

      const result = await service.getAll('usr-no-notifs');

      expect(result).toEqual([]);
    });
  });

  describe('marcarLida', () => {
    it('should mark a notification as read with current timestamp', async () => {
      const updated = createMockNotificacao({ lida: true, lidaEm: new Date() });
      mockPrisma.notificacao.update.mockResolvedValue(updated);

      const result = await service.marcarLida('notif-test-1', 'usr-test-1');

      expect(result).toEqual(updated);
      expect(mockPrisma.notificacao.update).toHaveBeenCalledWith({
        where: { id: 'notif-test-1' },
        data: {
          lida: true,
          lidaEm: expect.any(Date),
        },
      });
    });
  });

  describe('marcarTodasLidas', () => {
    it('should mark all unread notifications as read and return success message', async () => {
      mockPrisma.notificacao.updateMany.mockResolvedValue({ count: 5 });

      const result = await service.marcarTodasLidas('usr-test-1');

      expect(result).toEqual({ mensagem: 'Todas as notificações marcadas como lidas.' });
      expect(mockPrisma.notificacao.updateMany).toHaveBeenCalledWith({
        where: { usuarioId: 'usr-test-1', lida: false },
        data: {
          lida: true,
          lidaEm: expect.any(Date),
        },
      });
    });

    it('should succeed even when there are no unread notifications', async () => {
      mockPrisma.notificacao.updateMany.mockResolvedValue({ count: 0 });

      const result = await service.marcarTodasLidas('usr-test-1');

      expect(result).toEqual({ mensagem: 'Todas as notificações marcadas como lidas.' });
    });
  });

  describe('countNaoLidas', () => {
    it('should return count of unread notifications', async () => {
      mockPrisma.notificacao.count.mockResolvedValue(7);

      const result = await service.countNaoLidas('usr-test-1');

      expect(result).toEqual({ count: 7 });
      expect(mockPrisma.notificacao.count).toHaveBeenCalledWith({
        where: { usuarioId: 'usr-test-1', lida: false },
      });
    });

    it('should return zero when all notifications are read', async () => {
      mockPrisma.notificacao.count.mockResolvedValue(0);

      const result = await service.countNaoLidas('usr-test-1');

      expect(result).toEqual({ count: 0 });
    });
  });
});
