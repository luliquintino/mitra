import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { GovernanceService } from './governance.service';
import { PrismaService } from '../prisma/prisma.service';
import { PetsService } from '../pets/pets.service';
import { createMockUser, createMockPetUsuario } from '../../test/test-utils';

describe('GovernanceService', () => {
  let service: GovernanceService;
  let prisma: Record<string, any>;
  let petsService: { checkAccess: jest.Mock };

  const userId = 'usr-test-1';
  const petId = 'pet-test-1';

  beforeEach(async () => {
    prisma = {
      petUsuario: { findMany: jest.fn(), findFirst: jest.fn(), count: jest.fn(), create: jest.fn() },
      usuario: { findUnique: jest.fn() },
      evento: { create: jest.fn() },
      solicitacao: { create: jest.fn() },
      pet: { update: jest.fn() },
    };

    petsService = { checkAccess: jest.fn().mockResolvedValue({ role: 'TUTOR_PRINCIPAL' }) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GovernanceService,
        { provide: PrismaService, useValue: prisma },
        { provide: PetsService, useValue: petsService },
      ],
    }).compile();

    service = module.get<GovernanceService>(GovernanceService);
  });

  // ─── getTutores ───────────────────────────────────────────────────────────

  describe('getTutores', () => {
    it('should check access and return active tutores', async () => {
      const tutores = [createMockPetUsuario()];
      prisma.petUsuario.findMany.mockResolvedValue(tutores);

      const result = await service.getTutores(petId, userId);

      expect(petsService.checkAccess).toHaveBeenCalledWith(petId, userId);
      expect(prisma.petUsuario.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { petId, ativo: true } }),
      );
      expect(result).toEqual(tutores);
    });
  });

  // ─── adicionarTutor ──────────────────────────────────────────────────────

  describe('adicionarTutor', () => {
    const email = 'novo@mitra.com';
    const novoTutor = createMockUser({ id: 'usr-new', email, nome: 'Novo Tutor' });

    it('should add a TUTOR_PRINCIPAL successfully', async () => {
      prisma.usuario.findUnique.mockResolvedValue(novoTutor);
      prisma.petUsuario.findFirst.mockResolvedValue(null);
      prisma.petUsuario.count.mockResolvedValue(1);
      const vinculo = { id: 'pu-new', usuario: novoTutor };
      prisma.petUsuario.create.mockResolvedValue(vinculo);
      prisma.evento.create.mockResolvedValue({});

      const result = await service.adicionarTutor(petId, userId, email, 'TUTOR_PRINCIPAL');

      expect(prisma.petUsuario.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ petId, usuarioId: novoTutor.id, role: 'TUTOR_PRINCIPAL' }),
        }),
      );
      expect(result.mensagem).toContain('Novo Tutor');
    });

    it('should throw when email not found', async () => {
      prisma.usuario.findUnique.mockResolvedValue(null);

      await expect(
        service.adicionarTutor(petId, userId, 'unknown@mitra.com', 'TUTOR_PRINCIPAL'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw when tutor already linked', async () => {
      prisma.usuario.findUnique.mockResolvedValue(novoTutor);
      prisma.petUsuario.findFirst.mockResolvedValue(createMockPetUsuario());

      await expect(
        service.adicionarTutor(petId, userId, email, 'TUTOR_PRINCIPAL'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw when max TUTOR_PRINCIPAL (2) reached', async () => {
      prisma.usuario.findUnique.mockResolvedValue(novoTutor);
      prisma.petUsuario.findFirst.mockResolvedValue(null);
      prisma.petUsuario.count.mockResolvedValue(2);

      await expect(
        service.adicionarTutor(petId, userId, email, 'TUTOR_PRINCIPAL'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw when max TUTOR_EMERGENCIA (2) reached', async () => {
      prisma.usuario.findUnique.mockResolvedValue(novoTutor);
      prisma.petUsuario.findFirst.mockResolvedValue(null);
      prisma.petUsuario.count.mockResolvedValue(2);

      await expect(
        service.adicionarTutor(petId, userId, email, 'TUTOR_EMERGENCIA'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ─── arquivarPet ──────────────────────────────────────────────────────────

  describe('arquivarPet', () => {
    it('should archive directly when only one TUTOR_PRINCIPAL', async () => {
      prisma.petUsuario.findMany.mockResolvedValue([
        createMockPetUsuario({ usuarioId: userId }),
      ]);
      prisma.pet.update.mockResolvedValue({});
      prisma.evento.create.mockResolvedValue({});

      const result = await service.arquivarPet(petId, userId, 'Motivo');

      expect(prisma.pet.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { status: 'ARQUIVADO' } }),
      );
      expect(result.mensagem).toContain('arquivado');
    });

    it('should create solicitacao when two TUTOR_PRINCIPAL exist', async () => {
      prisma.petUsuario.findMany.mockResolvedValue([
        createMockPetUsuario({ usuarioId: userId }),
        createMockPetUsuario({ id: 'pu-2', usuarioId: 'usr-test-2' }),
      ]);
      prisma.solicitacao.create.mockResolvedValue({});

      const result = await service.arquivarPet(petId, userId, 'Motivo');

      expect(prisma.solicitacao.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            tipo: 'ARQUIVAR_PET',
            destinatarioId: 'usr-test-2',
          }),
        }),
      );
      expect(prisma.pet.update).not.toHaveBeenCalled();
      expect(result.mensagem).toContain('Solicitação');
    });

    it('should throw when user is not TUTOR_PRINCIPAL', async () => {
      petsService.checkAccess.mockResolvedValue({ role: 'TUTOR_EMERGENCIA' });

      await expect(
        service.arquivarPet(petId, userId, 'Motivo'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // ─── reativarPet ──────────────────────────────────────────────────────────

  describe('reativarPet', () => {
    it('should reactivate the pet successfully', async () => {
      prisma.pet.update.mockResolvedValue({});
      prisma.evento.create.mockResolvedValue({});

      const result = await service.reativarPet(petId, userId, 'Retorno');

      expect(prisma.pet.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { status: 'ATIVO' } }),
      );
      expect(prisma.evento.create).toHaveBeenCalled();
      expect(result.mensagem).toContain('reativado');
    });

    it('should throw when user is not TUTOR_PRINCIPAL', async () => {
      petsService.checkAccess.mockResolvedValue({ role: 'TUTOR_EMERGENCIA' });

      await expect(
        service.reativarPet(petId, userId, 'Retorno'),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
