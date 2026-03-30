import { Test, TestingModule } from '@nestjs/testing';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';

describe('EventsController', () => {
  let controller: EventsController;
  let service: Record<string, jest.Mock>;

  const petId = 'pet-test-1';
  const userId = 'usr-test-1';

  beforeEach(async () => {
    service = {
      getHistorico: jest.fn().mockResolvedValue({ eventos: [], grouped: {}, total: 0 }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventsController],
      providers: [{ provide: EventsService, useValue: service }],
    }).compile();

    controller = module.get<EventsController>(EventsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getHistorico', () => {
    it('should delegate to service.getHistorico', async () => {
      await controller.getHistorico(petId, userId);
      expect(service.getHistorico).toHaveBeenCalledWith(petId, userId);
    });

    it('should return the service result', async () => {
      const expected = { eventos: [{ id: 'e1' }], grouped: {}, total: 1 };
      service.getHistorico.mockResolvedValue(expected);

      const result = await controller.getHistorico(petId, userId);
      expect(result).toEqual(expected);
    });
  });
});
