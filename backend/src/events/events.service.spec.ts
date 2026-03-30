import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from './events.service';
import { PrismaService } from '../prisma/prisma.service';
import { PetsService } from '../pets/pets.service';
import { createMockEvento } from '../../test/test-utils';

describe('EventsService', () => {
  let service: EventsService;
  let prisma: Record<string, any>;
  let petsService: { checkAccess: jest.Mock };

  const userId = 'usr-test-1';
  const petId = 'pet-test-1';

  beforeEach(async () => {
    prisma = {
      evento: { findMany: jest.fn() },
    };

    petsService = { checkAccess: jest.fn().mockResolvedValue({ role: 'TUTOR_PRINCIPAL' }) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        { provide: PrismaService, useValue: prisma },
        { provide: PetsService, useValue: petsService },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
  });

  describe('getHistorico', () => {
    it('should check access and return eventos with grouping', async () => {
      const eventos = [
        createMockEvento({ criadoEm: new Date('2025-06-15T12:00:00') }),
        createMockEvento({ id: 'evt-2', criadoEm: new Date('2025-06-20T12:00:00') }),
        createMockEvento({ id: 'evt-3', criadoEm: new Date('2025-07-15T12:00:00') }),
      ];
      prisma.evento.findMany.mockResolvedValue(eventos);

      const result = await service.getHistorico(petId, userId);

      expect(petsService.checkAccess).toHaveBeenCalledWith(petId, userId);
      expect(prisma.evento.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { petId },
          orderBy: { criadoEm: 'desc' },
        }),
      );
      expect(result.eventos).toEqual(eventos);
      expect(result.total).toBe(3);
      expect(result.grouped).toBeDefined();
      // Two June events should be in the same group
      const groupKeys = Object.keys(result.grouped);
      expect(groupKeys.length).toBeGreaterThanOrEqual(2);
    });

    it('should return empty when no eventos', async () => {
      prisma.evento.findMany.mockResolvedValue([]);

      const result = await service.getHistorico(petId, userId);

      expect(result.eventos).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.grouped).toEqual({});
    });
  });
});
