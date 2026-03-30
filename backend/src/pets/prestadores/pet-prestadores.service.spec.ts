import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PetPrestadoresService } from './pet-prestadores.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { ResendProvider } from '../../notifications/resend.provider';

describe('PetPrestadoresService', () => {
  let service: PetPrestadoresService;

  const mockPrisma = {
    pet: { findUnique: jest.fn() },
    usuario: { findUnique: jest.fn() },
    petPrestador: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    perfilPrestador: { findUnique: jest.fn() },
  };

  const mockNotificacaoService = {
    create: jest.fn(),
  };

  const mockResendProvider = {
    sendNotificationEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PetPrestadoresService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: NotificationsService, useValue: mockNotificacaoService },
        { provide: ResendProvider, useValue: mockResendProvider },
      ],
    }).compile();

    service = module.get<PetPrestadoresService>(PetPrestadoresService);

    jest.clearAllMocks();
  });

  // --- invitePrestador ---
  describe('invitePrestador', () => {
    const petId = 'pet-1';
    const tutorId = 'usr-tutor';
    const data = { email: 'vet@test.com', permissoes: ['VISUALIZAR'] };

    const mockPet = {
      id: petId,
      nome: 'Luna',
      petUsuarios: [{ usuarioId: tutorId, role: 'TUTOR_PRINCIPAL' }],
    };

    const mockPrestadorUser = {
      id: 'usr-vet',
      email: 'vet@test.com',
      perfilPrestador: { id: 'pf-1' },
    };

    it('should create invitation and send notifications', async () => {
      mockPrisma.pet.findUnique.mockResolvedValue(mockPet);
      mockPrisma.usuario.findUnique
        .mockResolvedValueOnce(mockPrestadorUser) // find by email
        .mockResolvedValueOnce({ nome: 'Tutor', email: 'tutor@test.com' }); // tutor lookup
      mockPrisma.petPrestador.findUnique.mockResolvedValue(null); // no duplicate
      const created = { id: 'pp-1', petId, prestadorId: 'pf-1', prestador: { usuario: { id: 'usr-vet', nome: 'Vet' } }, pet: { id: petId, nome: 'Luna' } };
      mockPrisma.petPrestador.create.mockResolvedValue(created);
      mockNotificacaoService.create.mockResolvedValue({});
      mockResendProvider.sendNotificationEmail.mockResolvedValue({});

      const result = await service.invitePrestador(petId, tutorId, data);

      expect(result).toEqual(created);
      expect(mockPrisma.petPrestador.create).toHaveBeenCalled();
      expect(mockNotificacaoService.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException when pet does not exist', async () => {
      mockPrisma.pet.findUnique.mockResolvedValue(null);

      await expect(service.invitePrestador(petId, tutorId, data)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user is not tutor', async () => {
      mockPrisma.pet.findUnique.mockResolvedValue({
        id: petId,
        nome: 'Luna',
        petUsuarios: [{ usuarioId: tutorId, role: 'VISITANTE' }],
      });

      await expect(service.invitePrestador(petId, tutorId, data)).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException when prestador email not found', async () => {
      mockPrisma.pet.findUnique.mockResolvedValue(mockPet);
      mockPrisma.usuario.findUnique.mockResolvedValue(null);

      await expect(service.invitePrestador(petId, tutorId, data)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when user has no prestador profile', async () => {
      mockPrisma.pet.findUnique.mockResolvedValue(mockPet);
      mockPrisma.usuario.findUnique.mockResolvedValue({ id: 'usr-vet', email: 'vet@test.com', perfilPrestador: null });

      await expect(service.invitePrestador(petId, tutorId, data)).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException when already invited', async () => {
      mockPrisma.pet.findUnique.mockResolvedValue(mockPet);
      mockPrisma.usuario.findUnique.mockResolvedValue(mockPrestadorUser);
      mockPrisma.petPrestador.findUnique.mockResolvedValue({ id: 'pp-existing' });

      await expect(service.invitePrestador(petId, tutorId, data)).rejects.toThrow(ConflictException);
    });
  });

  // --- acceptInvite ---
  describe('acceptInvite', () => {
    const petPrestadorId = 'pp-1';
    const prestadorId = 'pf-1';

    const mockInvite = {
      id: petPrestadorId,
      petId: 'pet-1',
      prestadorId,
      aceito: false,
      dataFim: null,
      convidadoPor: 'usr-tutor',
      prestador: { id: prestadorId, usuario: { id: 'usr-vet', nome: 'Vet' } },
      pet: { id: 'pet-1', nome: 'Luna' },
    };

    it('should accept invite and notify tutor', async () => {
      mockPrisma.petPrestador.findUnique.mockResolvedValue(mockInvite);
      const updated = { ...mockInvite, aceito: true, dataAceite: new Date() };
      mockPrisma.petPrestador.update.mockResolvedValue(updated);
      mockPrisma.usuario.findUnique.mockResolvedValue({ nome: 'Tutor', email: 'tutor@test.com' });
      mockNotificacaoService.create.mockResolvedValue({});
      mockResendProvider.sendNotificationEmail.mockResolvedValue({});

      const result = await service.acceptInvite(petPrestadorId, prestadorId);

      expect(result.aceito).toBe(true);
      expect(mockPrisma.petPrestador.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: petPrestadorId }, data: { aceito: true, dataAceite: expect.any(Date) } }),
      );
    });

    it('should throw NotFoundException when invite not found', async () => {
      mockPrisma.petPrestador.findUnique.mockResolvedValue(null);

      await expect(service.acceptInvite(petPrestadorId, prestadorId)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when prestadorId does not match', async () => {
      mockPrisma.petPrestador.findUnique.mockResolvedValue({ ...mockInvite, prestador: { id: 'other-pf', usuario: { id: 'x', nome: 'X' } } });

      await expect(service.acceptInvite(petPrestadorId, prestadorId)).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException when already accepted', async () => {
      mockPrisma.petPrestador.findUnique.mockResolvedValue({ ...mockInvite, aceito: true });

      await expect(service.acceptInvite(petPrestadorId, prestadorId)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when expired', async () => {
      mockPrisma.petPrestador.findUnique.mockResolvedValue({
        ...mockInvite,
        dataFim: new Date('2020-01-01'),
      });

      await expect(service.acceptInvite(petPrestadorId, prestadorId)).rejects.toThrow(BadRequestException);
    });
  });

  // --- rejectInvite ---
  describe('rejectInvite', () => {
    it('should set statusVinculo to RECUSADO', async () => {
      const invite = { id: 'pp-1', prestadorId: 'pf-1' };
      mockPrisma.petPrestador.findUnique.mockResolvedValue(invite);
      mockPrisma.petPrestador.update.mockResolvedValue({});

      const result = await service.rejectInvite('pp-1', 'pf-1');

      expect(result).toEqual({ message: 'Convite recusado com sucesso.' });
      expect(mockPrisma.petPrestador.update).toHaveBeenCalledWith({
        where: { id: 'pp-1' },
        data: { statusVinculo: 'RECUSADO' },
      });
    });

    it('should throw NotFoundException when invite not found', async () => {
      mockPrisma.petPrestador.findUnique.mockResolvedValue(null);

      await expect(service.rejectInvite('pp-1', 'pf-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when prestadorId mismatch', async () => {
      mockPrisma.petPrestador.findUnique.mockResolvedValue({ id: 'pp-1', prestadorId: 'other' });

      await expect(service.rejectInvite('pp-1', 'pf-1')).rejects.toThrow(ForbiddenException);
    });
  });

  // --- revokeAccess ---
  describe('revokeAccess', () => {
    const petId = 'pet-1';
    const prestadorId = 'pf-1';
    const tutorId = 'usr-tutor';

    it('should set statusVinculo to BLOQUEADO and notify', async () => {
      mockPrisma.pet.findUnique.mockResolvedValue({
        id: petId,
        petUsuarios: [{ usuarioId: tutorId, role: 'TUTOR_PRINCIPAL' }],
      });
      mockPrisma.petPrestador.findUnique.mockResolvedValue({ id: 'pp-1' });
      const revoked = {
        id: 'pp-1',
        petId,
        prestadorId,
        statusVinculo: 'BLOQUEADO',
        prestador: { usuario: { id: 'usr-vet', nome: 'Vet', email: 'vet@test.com' } },
        pet: { id: petId, nome: 'Luna' },
      };
      mockPrisma.petPrestador.update.mockResolvedValue(revoked);
      mockPrisma.usuario.findUnique.mockResolvedValue({ nome: 'Tutor' });
      mockNotificacaoService.create.mockResolvedValue({});
      mockResendProvider.sendNotificationEmail.mockResolvedValue({});

      const result = await service.revokeAccess(petId, prestadorId, tutorId);

      expect(result.statusVinculo).toBe('BLOQUEADO');
      expect(mockNotificacaoService.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException when pet not found', async () => {
      mockPrisma.pet.findUnique.mockResolvedValue(null);

      await expect(service.revokeAccess(petId, prestadorId, tutorId)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when not tutor', async () => {
      mockPrisma.pet.findUnique.mockResolvedValue({
        id: petId,
        petUsuarios: [{ usuarioId: tutorId, role: 'VISITANTE' }],
      });

      await expect(service.revokeAccess(petId, prestadorId, tutorId)).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException when vinculo not found', async () => {
      mockPrisma.pet.findUnique.mockResolvedValue({
        id: petId,
        petUsuarios: [{ usuarioId: tutorId, role: 'TUTOR_PRINCIPAL' }],
      });
      mockPrisma.petPrestador.findUnique.mockResolvedValue(null);

      await expect(service.revokeAccess(petId, prestadorId, tutorId)).rejects.toThrow(NotFoundException);
    });
  });

  // --- listPrestadores ---
  describe('listPrestadores', () => {
    it('should return prestadores for a pet with default ATIVO status', async () => {
      const mockList = [{ id: 'pp-1', prestador: { usuario: { nome: 'Vet' } } }];
      mockPrisma.petPrestador.findMany.mockResolvedValue(mockList);

      const result = await service.listPrestadores('pet-1');

      expect(result).toEqual(mockList);
      expect(mockPrisma.petPrestador.findMany).toHaveBeenCalledWith({
        where: { petId: 'pet-1', statusVinculo: 'ATIVO' },
        include: expect.any(Object),
      });
    });
  });

  // --- listPetsByPrestador ---
  describe('listPetsByPrestador', () => {
    it('should return mapped pets with permissoes', async () => {
      const mockData = [
        {
          id: 'pp-1',
          permissoes: ['VISUALIZAR'],
          pet: { id: 'pet-1', nome: 'Luna', especie: 'CACHORRO', raca: 'Golden', fotoUrl: null, dataNascimento: new Date() },
        },
      ];
      mockPrisma.petPrestador.findMany.mockResolvedValue(mockData);

      const result = await service.listPetsByPrestador('pf-1');

      expect(result[0]).toHaveProperty('permissoes', ['VISUALIZAR']);
      expect(result[0]).toHaveProperty('petPrestadorId', 'pp-1');
      expect(result[0]).toHaveProperty('nome', 'Luna');
    });
  });

  // --- hasPermission ---
  describe('hasPermission', () => {
    it('should return true when vinculo active, accepted, and permission present', async () => {
      mockPrisma.petPrestador.findUnique.mockResolvedValue({
        statusVinculo: 'ATIVO',
        aceito: true,
        dataFim: null,
        permissoes: ['VISUALIZAR', 'REGISTRAR_SERVICO'],
      });

      expect(await service.hasPermission('pet-1', 'pf-1', 'VISUALIZAR')).toBe(true);
    });

    it('should return false when vinculo not found', async () => {
      mockPrisma.petPrestador.findUnique.mockResolvedValue(null);

      expect(await service.hasPermission('pet-1', 'pf-1', 'VISUALIZAR')).toBe(false);
    });

    it('should return false when status is not ATIVO', async () => {
      mockPrisma.petPrestador.findUnique.mockResolvedValue({
        statusVinculo: 'BLOQUEADO',
        aceito: true,
        dataFim: null,
        permissoes: ['VISUALIZAR'],
      });

      expect(await service.hasPermission('pet-1', 'pf-1', 'VISUALIZAR')).toBe(false);
    });

    it('should return false when not accepted', async () => {
      mockPrisma.petPrestador.findUnique.mockResolvedValue({
        statusVinculo: 'ATIVO',
        aceito: false,
        dataFim: null,
        permissoes: ['VISUALIZAR'],
      });

      expect(await service.hasPermission('pet-1', 'pf-1', 'VISUALIZAR')).toBe(false);
    });

    it('should return false when expired', async () => {
      mockPrisma.petPrestador.findUnique.mockResolvedValue({
        statusVinculo: 'ATIVO',
        aceito: true,
        dataFim: new Date('2020-01-01'),
        permissoes: ['VISUALIZAR'],
      });

      expect(await service.hasPermission('pet-1', 'pf-1', 'VISUALIZAR')).toBe(false);
    });

    it('should return false when permission not in array', async () => {
      mockPrisma.petPrestador.findUnique.mockResolvedValue({
        statusVinculo: 'ATIVO',
        aceito: true,
        dataFim: null,
        permissoes: ['REGISTRAR_SERVICO'],
      });

      expect(await service.hasPermission('pet-1', 'pf-1', 'VISUALIZAR')).toBe(false);
    });
  });
});
