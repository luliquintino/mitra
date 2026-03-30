import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { RegistrosService } from './registros.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('RegistrosService', () => {
  let service: RegistrosService;

  const mockPrisma = {
    petUsuario: { findFirst: jest.fn() },
    perfilPrestador: { findUnique: jest.fn() },
    petPrestador: { findFirst: jest.fn() },
    pet: { findUnique: jest.fn() },
    evento: { create: jest.fn(), findMany: jest.fn() },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegistrosService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<RegistrosService>(RegistrosService);

    jest.clearAllMocks();
  });

  // --- create ---
  describe('create', () => {
    const petId = 'pet-1';
    const userId = 'usr-1';
    const dto = { tipo: 'VISITA', titulo: 'Consulta', descricao: 'Checkup', dados: null } as any;

    it('should create evento when user is tutor', async () => {
      mockPrisma.petUsuario.findFirst.mockResolvedValue({ id: 'pu-1', petId, usuarioId: userId, ativo: true });
      mockPrisma.pet.findUnique.mockResolvedValue({ id: petId, nome: 'Luna' });
      const created = { id: 'evt-1', petId, tipo: 'VISITA_REGISTRADA', titulo: 'Consulta', autorId: userId };
      mockPrisma.evento.create.mockResolvedValue(created);

      const result = await service.create(petId, userId, dto);

      expect(result).toEqual(created);
      expect(mockPrisma.evento.create).toHaveBeenCalledWith({
        data: {
          petId,
          tipo: 'VISITA_REGISTRADA',
          titulo: dto.titulo,
          descricao: dto.descricao,
          dados: dto.dados,
          autorId: userId,
        },
      });
    });

    it('should create evento when user is prestador with active access', async () => {
      mockPrisma.petUsuario.findFirst.mockResolvedValue(null); // not tutor
      mockPrisma.perfilPrestador.findUnique.mockResolvedValue({ id: 'pf-1', usuarioId: userId });
      mockPrisma.petPrestador.findFirst.mockResolvedValue({ id: 'pp-1', aceito: true, statusVinculo: 'ATIVO' });
      mockPrisma.pet.findUnique.mockResolvedValue({ id: petId });
      mockPrisma.evento.create.mockResolvedValue({ id: 'evt-1' });

      const result = await service.create(petId, userId, dto);

      expect(result).toEqual({ id: 'evt-1' });
    });

    it('should throw ForbiddenException when user has no access', async () => {
      mockPrisma.petUsuario.findFirst.mockResolvedValue(null);
      mockPrisma.perfilPrestador.findUnique.mockResolvedValue(null);

      await expect(service.create(petId, userId, dto)).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException when prestador has no active pet access', async () => {
      mockPrisma.petUsuario.findFirst.mockResolvedValue(null);
      mockPrisma.perfilPrestador.findUnique.mockResolvedValue({ id: 'pf-1' });
      mockPrisma.petPrestador.findFirst.mockResolvedValue(null);

      await expect(service.create(petId, userId, dto)).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException when pet does not exist', async () => {
      mockPrisma.petUsuario.findFirst.mockResolvedValue({ id: 'pu-1' }); // is tutor
      mockPrisma.pet.findUnique.mockResolvedValue(null);

      await expect(service.create(petId, userId, dto)).rejects.toThrow(NotFoundException);
    });
  });

  // --- listMeus ---
  describe('listMeus', () => {
    const petId = 'pet-1';
    const userId = 'usr-1';

    it('should return eventos by autorId when user has access', async () => {
      mockPrisma.petUsuario.findFirst.mockResolvedValue({ id: 'pu-1' });
      const eventos = [{ id: 'evt-1', tipo: 'VISITA_REGISTRADA', autorId: userId }];
      mockPrisma.evento.findMany.mockResolvedValue(eventos);

      const result = await service.listMeus(petId, userId);

      expect(result).toEqual(eventos);
      expect(mockPrisma.evento.findMany).toHaveBeenCalledWith({
        where: {
          petId,
          autorId: userId,
          tipo: { in: expect.any(Array) },
        },
        orderBy: { criadoEm: 'desc' },
        take: 20,
      });
    });

    it('should throw ForbiddenException when user has no access', async () => {
      mockPrisma.petUsuario.findFirst.mockResolvedValue(null);
      mockPrisma.perfilPrestador.findUnique.mockResolvedValue(null);

      await expect(service.listMeus(petId, userId)).rejects.toThrow(ForbiddenException);
    });
  });
});
