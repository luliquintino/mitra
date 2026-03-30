import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PetsService } from './pets.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  createMockUser,
  createMockPet,
  createMockPetUsuario,
  createMockVacina,
  createMockMedicamento,
} from '../../test/test-utils';

jest.mock('../common/utils/pet-code.util', () => ({
  generatePetCode: jest.fn(() => 'MITRA-TEST01'),
}));

describe('PetsService', () => {
  let service: PetsService;
  let prisma: Record<string, any>;

  const mockUser = createMockUser();
  const mockPet = createMockPet();
  const mockPetUsuario = createMockPetUsuario();

  beforeEach(async () => {
    prisma = {
      petUsuario: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      pet: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      evento: {
        create: jest.fn(),
        findMany: jest.fn(),
      },
      vacina: {
        findMany: jest.fn(),
      },
      medicamento: {
        findMany: jest.fn(),
      },
      guarda: {
        findFirst: jest.fn(),
      },
      solicitacao: {
        count: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PetsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<PetsService>(PetsService);
  });

  describe('findAllByUser', () => {
    it('should return pets with meuRole, guardaAtual, proximaVacina, medicamentosAtivos', async () => {
      const vacina = createMockVacina();
      const med = createMockMedicamento();
      prisma.petUsuario.findMany.mockResolvedValue([
        {
          ...mockPetUsuario,
          role: 'TUTOR_PRINCIPAL',
          pet: {
            ...mockPet,
            vacinas: [vacina],
            medicamentos: [med],
            guardas: [{ id: 'g1', ativa: true }],
            petUsuarios: [],
          },
        },
      ]);

      const result = await service.findAllByUser(mockUser.id);

      expect(result).toHaveLength(1);
      expect(result[0].meuRole).toBe('TUTOR_PRINCIPAL');
      expect(result[0].guardaAtual).toEqual({ id: 'g1', ativa: true });
      expect(result[0].proximaVacina).toEqual(vacina);
      expect(result[0].medicamentosAtivos).toBe(1);
      expect(prisma.petUsuario.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { usuarioId: mockUser.id, ativo: true },
        }),
      );
    });

    it('should return empty array when user has no pets', async () => {
      prisma.petUsuario.findMany.mockResolvedValue([]);
      const result = await service.findAllByUser(mockUser.id);
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return pet with meuRole after checking access', async () => {
      prisma.petUsuario.findFirst.mockResolvedValue(mockPetUsuario);
      prisma.pet.findUnique.mockResolvedValue(mockPet);

      const result = await service.findOne(mockPet.id, mockUser.id);

      expect(result.meuRole).toBe('TUTOR_PRINCIPAL');
      expect(result.nome).toBe(mockPet.nome);
    });

    it('should throw ForbiddenException when user has no access', async () => {
      prisma.petUsuario.findFirst.mockResolvedValue(null);

      await expect(service.findOne(mockPet.id, 'no-access-user')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('create', () => {
    it('should generate unique code, create pet, petUsuario and evento', async () => {
      prisma.pet.findUnique.mockResolvedValue(null); // code is unique
      prisma.pet.create.mockResolvedValue(mockPet);
      prisma.evento.create.mockResolvedValue({});

      const dto = {
        nome: 'Luna',
        especie: 'CACHORRO',
        raca: 'Golden Retriever',
        genero: 'FEMEA',
      };
      const result = await service.create(mockUser.id, dto as any);

      expect(result).toEqual(mockPet);
      expect(prisma.pet.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            nome: 'Luna',
            codigoPet: 'MITRA-TEST01',
            petUsuarios: {
              create: { usuarioId: mockUser.id, role: 'TUTOR_PRINCIPAL' },
            },
          }),
        }),
      );
      expect(prisma.evento.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            petId: mockPet.id,
            tipo: 'PET_CRIADO',
            autorId: mockUser.id,
          }),
        }),
      );
    });

    it('should retry code generation on collision', async () => {
      prisma.pet.findUnique
        .mockResolvedValueOnce({ id: 'existing' }) // first collision
        .mockResolvedValueOnce(null); // second is unique
      prisma.pet.create.mockResolvedValue(mockPet);
      prisma.evento.create.mockResolvedValue({});

      await service.create(mockUser.id, { nome: 'Luna', especie: 'CACHORRO' } as any);

      expect(prisma.pet.findUnique).toHaveBeenCalledTimes(2);
    });
  });

  describe('findByCodigo', () => {
    it('should return pet summary when found', async () => {
      prisma.pet.findUnique.mockResolvedValue({
        ...mockPet,
        petUsuarios: [mockPetUsuario],
      });

      const result = await service.findByCodigo('mitra-abc123');

      expect(result.id).toBe(mockPet.id);
      expect(result.codigoPet).toBe(mockPet.codigoPet);
      expect(result.tutorPrincipalCount).toBe(1);
      expect(result.maxTutorPrincipal).toBe(2);
      expect(prisma.pet.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { codigoPet: 'MITRA-ABC123' },
        }),
      );
    });

    it('should throw NotFoundException when pet not found', async () => {
      prisma.pet.findUnique.mockResolvedValue(null);

      await expect(service.findByCodigo('INVALID')).rejects.toThrow(NotFoundException);
    });
  });

  describe('vincularByCodigo', () => {
    beforeEach(() => {
      // Mock findByCodigo chain
      prisma.pet.findUnique.mockResolvedValue({
        ...mockPet,
        tipoGuarda: 'CONJUNTA',
        petUsuarios: [mockPetUsuario],
      });
    });

    it('should link user as TUTOR_PRINCIPAL for CONJUNTA guarda', async () => {
      prisma.petUsuario.findUnique.mockResolvedValue(null); // no existing link
      prisma.petUsuario.create.mockResolvedValue({});
      prisma.evento.create.mockResolvedValue({});

      const result = await service.vincularByCodigo(
        mockPet.codigoPet,
        'usr-test-2',
        'TUTOR_PRINCIPAL',
      );

      expect(result.petId).toBe(mockPet.id);
      expect(result.message).toBe('Vinculado com sucesso');
      expect(prisma.petUsuario.create).toHaveBeenCalled();
      expect(prisma.evento.create).toHaveBeenCalled();
    });

    it('should throw ForbiddenException when guarda is not CONJUNTA for TUTOR_PRINCIPAL', async () => {
      prisma.pet.findUnique.mockResolvedValue({
        ...mockPet,
        tipoGuarda: 'INDIVIDUAL',
        petUsuarios: [mockPetUsuario],
      });

      await expect(
        service.vincularByCodigo(mockPet.codigoPet, 'usr-test-2', 'TUTOR_PRINCIPAL'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ConflictException when max tutors reached', async () => {
      prisma.pet.findUnique.mockResolvedValue({
        ...mockPet,
        tipoGuarda: 'CONJUNTA',
        petUsuarios: [mockPetUsuario, createMockPetUsuario({ id: 'pu-2', usuarioId: 'usr-test-2' })],
      });

      await expect(
        service.vincularByCodigo(mockPet.codigoPet, 'usr-test-3', 'TUTOR_PRINCIPAL'),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException when user already linked', async () => {
      prisma.petUsuario.findUnique.mockResolvedValue(mockPetUsuario);

      await expect(
        service.vincularByCodigo(mockPet.codigoPet, mockUser.id, 'TUTOR_PRINCIPAL'),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('should check access then update pet', async () => {
      prisma.petUsuario.findFirst.mockResolvedValue(mockPetUsuario);
      prisma.pet.update.mockResolvedValue({ ...mockPet, nome: 'Luna Updated' });

      const result = await service.update(mockPet.id, mockUser.id, { nome: 'Luna Updated' } as any);

      expect(result.nome).toBe('Luna Updated');
      expect(prisma.pet.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: mockPet.id },
        }),
      );
    });

    it('should throw ForbiddenException when no access', async () => {
      prisma.petUsuario.findFirst.mockResolvedValue(null);

      await expect(
        service.update(mockPet.id, 'no-access', { nome: 'X' } as any),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getDashboard', () => {
    it('should return dashboard with alertas, hoje, atividadeRecente', async () => {
      prisma.petUsuario.findFirst.mockResolvedValue(mockPetUsuario);
      prisma.pet.findUnique.mockResolvedValue(mockPet);
      prisma.vacina.findMany.mockResolvedValue([createMockVacina()]);
      prisma.medicamento.findMany.mockResolvedValue([createMockMedicamento()]);
      prisma.guarda.findFirst.mockResolvedValue({ id: 'g1', ativa: true });
      prisma.solicitacao.count.mockResolvedValue(2);
      prisma.evento.findMany.mockResolvedValue([]);

      const result = await service.getDashboard(mockPet.id, mockUser.id);

      expect(result.pet).toEqual(mockPet);
      expect(result.alertas.vacinaVencendo).toBe(true);
      expect(result.alertas.solicitacoesPendentes).toBe(2);
      expect(result.hoje.guardaAtual).toEqual({ id: 'g1', ativa: true });
      expect(result.atividadeRecente).toEqual([]);
    });

    it('should throw ForbiddenException when no access', async () => {
      prisma.petUsuario.findFirst.mockResolvedValue(null);

      await expect(
        service.getDashboard(mockPet.id, 'no-access'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('checkAccess', () => {
    it('should return access record when user has access', async () => {
      prisma.petUsuario.findFirst.mockResolvedValue(mockPetUsuario);

      const result = await service.checkAccess(mockPet.id, mockUser.id);

      expect(result).toEqual(mockPetUsuario);
      expect(prisma.petUsuario.findFirst).toHaveBeenCalledWith({
        where: { petId: mockPet.id, usuarioId: mockUser.id, ativo: true },
      });
    });

    it('should throw ForbiddenException when no access', async () => {
      prisma.petUsuario.findFirst.mockResolvedValue(null);

      await expect(
        service.checkAccess(mockPet.id, 'stranger'),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
