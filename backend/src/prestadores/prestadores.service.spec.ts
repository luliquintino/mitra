import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PrestadoresService } from './prestadores.service';
import { PrismaService } from '../prisma/prisma.service';

describe('PrestadoresService', () => {
  let service: PrestadoresService;
  let prisma: PrismaService;

  const mockPrisma = {
    perfilPrestador: {
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrestadoresService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<PrestadoresService>(PrestadoresService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('findProfile', () => {
    const usuarioId = 'usr-1';
    const mockPerfil = {
      id: 'prest-1',
      usuarioId,
      tipoPrestador: 'VETERINARIO',
      usuario: { id: usuarioId, nome: 'Dr. Ana', email: 'ana@test.com', telefone: null, avatarUrl: null },
    };

    it('should return the prestador profile with usuario data', async () => {
      mockPrisma.perfilPrestador.findUnique.mockResolvedValue(mockPerfil);

      const result = await service.findProfile(usuarioId);

      expect(result).toEqual(mockPerfil);
      expect(mockPrisma.perfilPrestador.findUnique).toHaveBeenCalledWith({
        where: { usuarioId },
        include: {
          usuario: {
            select: { id: true, nome: true, email: true, telefone: true, avatarUrl: true },
          },
        },
      });
    });

    it('should throw NotFoundException when profile does not exist', async () => {
      mockPrisma.perfilPrestador.findUnique.mockResolvedValue(null);

      await expect(service.findProfile(usuarioId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateProfile', () => {
    const usuarioId = 'usr-1';
    const updateData = {
      tipoPrestador: 'VETERINARIO',
      nomeEmpresa: 'Vet Clinic',
      cnpj: '12345678000100',
      telefoneProfissional: '11999990000',
      endereco: 'Rua X',
      registroProfissional: 'CRMV-12345',
      descricao: 'Especialista',
      website: 'https://vet.com',
    };

    it('should update and return the profile', async () => {
      const mockUpdated = { id: 'prest-1', usuarioId, ...updateData, usuario: { id: usuarioId, nome: 'Dr. Ana', email: 'ana@test.com' } };
      mockPrisma.perfilPrestador.update.mockResolvedValue(mockUpdated);

      const result = await service.updateProfile(usuarioId, updateData);

      expect(result).toEqual(mockUpdated);
      expect(mockPrisma.perfilPrestador.update).toHaveBeenCalledWith({
        where: { usuarioId },
        data: {
          tipoPrestador: updateData.tipoPrestador,
          nomeEmpresa: updateData.nomeEmpresa,
          cnpj: updateData.cnpj,
          telefoneProfissional: updateData.telefoneProfissional,
          endereco: updateData.endereco,
          registroProfissional: updateData.registroProfissional,
          descricao: updateData.descricao,
          website: updateData.website,
        },
        include: {
          usuario: {
            select: { id: true, nome: true, email: true },
          },
        },
      });
    });
  });

  describe('listPrestadores', () => {
    const mockList = [
      { id: 'prest-1', tipoPrestador: 'VETERINARIO', ativo: true, usuario: { id: 'usr-1', nome: 'Dr. Ana', email: 'ana@test.com', telefone: null, avatarUrl: null } },
    ];

    it('should list all active prestadores without filter', async () => {
      mockPrisma.perfilPrestador.findMany.mockResolvedValue(mockList);

      const result = await service.listPrestadores();

      expect(result).toEqual(mockList);
      expect(mockPrisma.perfilPrestador.findMany).toHaveBeenCalledWith({
        where: { ativo: true },
        include: {
          usuario: {
            select: { id: true, nome: true, email: true, telefone: true, avatarUrl: true },
          },
        },
        orderBy: { criadoEm: 'desc' },
      });
    });

    it('should filter by tipoPrestador when provided', async () => {
      mockPrisma.perfilPrestador.findMany.mockResolvedValue(mockList);

      await service.listPrestadores({ tipoPrestador: 'VETERINARIO' });

      expect(mockPrisma.perfilPrestador.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { ativo: true, tipoPrestador: 'VETERINARIO' },
        }),
      );
    });

    it('should not add tipoPrestador filter when not provided', async () => {
      mockPrisma.perfilPrestador.findMany.mockResolvedValue([]);

      await service.listPrestadores({});

      expect(mockPrisma.perfilPrestador.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { ativo: true },
        }),
      );
    });
  });
});
