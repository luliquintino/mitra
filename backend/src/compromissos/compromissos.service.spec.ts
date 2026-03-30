import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { CompromissosService } from './compromissos.service';
import { PrismaService } from '../prisma/prisma.service';
import { PetsService } from '../pets/pets.service';
import { createMockCompromisso } from '../../test/test-utils';

describe('CompromissosService', () => {
  let service: CompromissosService;

  const mockPrisma = {
    compromisso: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    evento: {
      create: jest.fn(),
    },
    guardaTemporaria: {
      create: jest.fn(),
      updateMany: jest.fn(),
    },
  };

  const mockPetsService = {
    checkAccess: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompromissosService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: PetsService, useValue: mockPetsService },
      ],
    }).compile();

    service = module.get<CompromissosService>(CompromissosService);
    jest.clearAllMocks();
    mockPetsService.checkAccess.mockResolvedValue(true);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('list', () => {
    it('should check access and return compromissos for the pet', async () => {
      const compromissos = [createMockCompromisso()];
      mockPrisma.compromisso.findMany.mockResolvedValue(compromissos);

      const result = await service.list('pet-test-1', 'usr-test-1');

      expect(mockPetsService.checkAccess).toHaveBeenCalledWith('pet-test-1', 'usr-test-1');
      expect(result).toEqual(compromissos);
      expect(mockPrisma.compromisso.findMany).toHaveBeenCalledWith({
        where: { petId: 'pet-test-1', ativo: true },
        include: expect.objectContaining({
          petPrestador: expect.any(Object),
        }),
        orderBy: { criadoEm: 'desc' },
      });
    });

    it('should throw when user has no access', async () => {
      mockPetsService.checkAccess.mockRejectedValue(new Error('Sem acesso'));

      await expect(service.list('pet-test-1', 'usr-no-access')).rejects.toThrow('Sem acesso');
    });
  });

  describe('create', () => {
    const dto = {
      titulo: 'Passeio diario',
      tipo: 'PASSEIO',
      recorrencia: 'UNICO',
      dataInicio: '2026-07-01',
      horarioInicio: '09:00',
      horarioFim: '10:00',
      geraGuarda: false,
    };

    it('should check access, create compromisso and evento', async () => {
      const created = createMockCompromisso();
      mockPrisma.compromisso.create.mockResolvedValue(created);
      mockPrisma.evento.create.mockResolvedValue({});

      const result = await service.create('pet-test-1', 'usr-test-1', dto);

      expect(mockPetsService.checkAccess).toHaveBeenCalledWith('pet-test-1', 'usr-test-1');
      expect(mockPrisma.compromisso.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          petId: 'pet-test-1',
          titulo: 'Passeio diario',
          tipo: 'PASSEIO',
          criadoPor: 'usr-test-1',
        }),
      });
      expect(mockPrisma.evento.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          petId: 'pet-test-1',
          tipo: 'COMPROMISSO_CRIADO',
          autorId: 'usr-test-1',
        }),
      });
      expect(result).toEqual(created);
    });

    it('should generate guardas temporarias when geraGuarda is true', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 2);
      const dtoWithGuarda = {
        ...dto,
        dataInicio: futureDate.toISOString().split('T')[0],
        geraGuarda: true,
        recorrencia: 'UNICO',
      };

      const created = createMockCompromisso({
        geraGuarda: true,
        recorrencia: 'UNICO',
        dataInicio: futureDate,
        dataFim: null,
        horarioInicio: '09:00',
        horarioFim: '10:00',
        petPrestadorId: null,
        responsavelId: 'usr-test-1',
      });
      mockPrisma.compromisso.create.mockResolvedValue(created);
      mockPrisma.evento.create.mockResolvedValue({});
      mockPrisma.guardaTemporaria.create.mockResolvedValue({});

      await service.create('pet-test-1', 'usr-test-1', dtoWithGuarda);

      expect(mockPrisma.guardaTemporaria.create).toHaveBeenCalled();
    });

    it('should NOT generate guardas temporarias when geraGuarda is false', async () => {
      const created = createMockCompromisso({ geraGuarda: false });
      mockPrisma.compromisso.create.mockResolvedValue(created);
      mockPrisma.evento.create.mockResolvedValue({});

      await service.create('pet-test-1', 'usr-test-1', dto);

      expect(mockPrisma.guardaTemporaria.create).not.toHaveBeenCalled();
    });

    it('should use default empty array for diasSemana when not provided', async () => {
      const created = createMockCompromisso();
      mockPrisma.compromisso.create.mockResolvedValue(created);
      mockPrisma.evento.create.mockResolvedValue({});

      await service.create('pet-test-1', 'usr-test-1', dto);

      expect(mockPrisma.compromisso.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          diasSemana: [],
        }),
      });
    });
  });

  describe('update', () => {
    it('should check access, find existing, and update', async () => {
      const existing = createMockCompromisso({ geraGuarda: false });
      const updated = createMockCompromisso({ titulo: 'Updated' });
      mockPrisma.compromisso.findFirst.mockResolvedValue(existing);
      mockPrisma.compromisso.update.mockResolvedValue(updated);

      const result = await service.update('pet-test-1', 'comp-test-1', 'usr-test-1', {
        titulo: 'Updated',
      });

      expect(mockPetsService.checkAccess).toHaveBeenCalledWith('pet-test-1', 'usr-test-1');
      expect(mockPrisma.compromisso.findFirst).toHaveBeenCalledWith({
        where: { id: 'comp-test-1', petId: 'pet-test-1' },
      });
      expect(result).toEqual(updated);
    });

    it('should throw BadRequestException when compromisso not found', async () => {
      mockPrisma.compromisso.findFirst.mockResolvedValue(null);

      await expect(
        service.update('pet-test-1', 'nonexistent', 'usr-test-1', { titulo: 'X' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should generate guardas when geraGuarda turns on', async () => {
      const existing = createMockCompromisso({ geraGuarda: false });
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 2);
      const updated = createMockCompromisso({
        geraGuarda: true,
        recorrencia: 'UNICO',
        dataInicio: futureDate,
        dataFim: null,
        horarioInicio: '09:00',
        horarioFim: '10:00',
        petPrestadorId: null,
        responsavelId: 'usr-test-1',
      });
      mockPrisma.compromisso.findFirst.mockResolvedValue(existing);
      mockPrisma.compromisso.update.mockResolvedValue(updated);
      mockPrisma.guardaTemporaria.create.mockResolvedValue({});

      await service.update('pet-test-1', 'comp-test-1', 'usr-test-1', {
        geraGuarda: true,
      });

      expect(mockPrisma.guardaTemporaria.create).toHaveBeenCalled();
    });

    it('should cancel future guardas when geraGuarda turns off', async () => {
      const existing = createMockCompromisso({ geraGuarda: true });
      const updated = createMockCompromisso({ geraGuarda: false });
      mockPrisma.compromisso.findFirst.mockResolvedValue(existing);
      mockPrisma.compromisso.update.mockResolvedValue(updated);
      mockPrisma.guardaTemporaria.updateMany.mockResolvedValue({ count: 2 });

      await service.update('pet-test-1', 'comp-test-1', 'usr-test-1', {
        geraGuarda: false,
      });

      expect(mockPrisma.guardaTemporaria.updateMany).toHaveBeenCalledWith({
        where: {
          compromissoId: 'comp-test-1',
          status: 'AGENDADA',
          dataInicio: { gt: expect.any(Date) },
        },
        data: { status: 'CANCELADA' },
      });
    });

    it('should cancel future guardas when compromisso is deactivated', async () => {
      const existing = createMockCompromisso({ geraGuarda: false });
      const updated = createMockCompromisso({ ativo: false });
      mockPrisma.compromisso.findFirst.mockResolvedValue(existing);
      mockPrisma.compromisso.update.mockResolvedValue(updated);
      mockPrisma.guardaTemporaria.updateMany.mockResolvedValue({ count: 0 });

      await service.update('pet-test-1', 'comp-test-1', 'usr-test-1', {
        ativo: false,
      });

      expect(mockPrisma.guardaTemporaria.updateMany).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should check access, soft delete, and cancel future guardas', async () => {
      const existing = createMockCompromisso();
      mockPrisma.compromisso.findFirst.mockResolvedValue(existing);
      mockPrisma.compromisso.update.mockResolvedValue({ ...existing, ativo: false });
      mockPrisma.guardaTemporaria.updateMany.mockResolvedValue({ count: 1 });

      const result = await service.remove('pet-test-1', 'comp-test-1', 'usr-test-1');

      expect(mockPetsService.checkAccess).toHaveBeenCalledWith('pet-test-1', 'usr-test-1');
      expect(mockPrisma.compromisso.update).toHaveBeenCalledWith({
        where: { id: 'comp-test-1' },
        data: { ativo: false },
      });
      expect(mockPrisma.guardaTemporaria.updateMany).toHaveBeenCalledWith({
        where: {
          compromissoId: 'comp-test-1',
          status: 'AGENDADA',
          dataInicio: { gt: expect.any(Date) },
        },
        data: { status: 'CANCELADA' },
      });
      expect(result).toEqual({ mensagem: 'Compromisso desativado.' });
    });

    it('should throw BadRequestException when compromisso not found', async () => {
      mockPrisma.compromisso.findFirst.mockResolvedValue(null);

      await expect(
        service.remove('pet-test-1', 'nonexistent', 'usr-test-1'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
