import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { createMockNotificacao } from '../../test/test-utils';

describe('NotificationsController', () => {
  let controller: NotificationsController;
  let service: NotificationsService;

  const mockService = {
    getAll: jest.fn(),
    countNaoLidas: jest.fn(),
    marcarLida: jest.fn(),
    marcarTodasLidas: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        { provide: NotificationsService, useValue: mockService },
      ],
    }).compile();

    controller = module.get<NotificationsController>(NotificationsController);
    service = module.get<NotificationsService>(NotificationsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAll', () => {
    it('should delegate to service.getAll with userId', async () => {
      const notifs = [createMockNotificacao()];
      mockService.getAll.mockResolvedValue(notifs);

      const result = await controller.getAll('usr-test-1');

      expect(result).toEqual(notifs);
      expect(mockService.getAll).toHaveBeenCalledWith('usr-test-1');
    });
  });

  describe('count', () => {
    it('should delegate to service.countNaoLidas with userId', async () => {
      mockService.countNaoLidas.mockResolvedValue({ count: 3 });

      const result = await controller.count('usr-test-1');

      expect(result).toEqual({ count: 3 });
      expect(mockService.countNaoLidas).toHaveBeenCalledWith('usr-test-1');
    });
  });

  describe('marcarLida', () => {
    it('should delegate to service.marcarLida with id and userId', async () => {
      const updated = createMockNotificacao({ lida: true });
      mockService.marcarLida.mockResolvedValue(updated);

      const result = await controller.marcarLida('notif-1', 'usr-test-1');

      expect(result).toEqual(updated);
      expect(mockService.marcarLida).toHaveBeenCalledWith('notif-1', 'usr-test-1');
    });
  });

  describe('marcarTodasLidas', () => {
    it('should delegate to service.marcarTodasLidas with userId', async () => {
      const msg = { mensagem: 'Todas as notificações marcadas como lidas.' };
      mockService.marcarTodasLidas.mockResolvedValue(msg);

      const result = await controller.marcarTodasLidas('usr-test-1');

      expect(result).toEqual(msg);
      expect(mockService.marcarTodasLidas).toHaveBeenCalledWith('usr-test-1');
    });
  });
});
