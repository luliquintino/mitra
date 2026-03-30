import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PetVisitantesService } from './pet-visitantes.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { ResendProvider } from '../../notifications/resend.provider';

describe('PetVisitantesService', () => {
  let service: PetVisitantesService;

  const mockPrisma = {
    pet: { findUnique: jest.fn() },
    usuario: { findUnique: jest.fn() },
    petVisitante: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
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
        PetVisitantesService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: NotificationsService, useValue: mockNotificacaoService },
        { provide: ResendProvider, useValue: mockResendProvider },
      ],
    }).compile();

    service = module.get<PetVisitantesService>(PetVisitantesService);

    jest.clearAllMocks();
  });

  // --- inviteVisitante ---
  describe('inviteVisitante', () => {
    const petId = 'pet-1';
    const tutorId = 'usr-tutor';
    const data = { email: 'visitor@test.com', permissoes: ['DADOS_BASICOS'], relacao: 'FAMILIAR' };

    const mockPet = {
      id: petId,
      nome: 'Luna',
      petUsuarios: [{ usuarioId: tutorId, role: 'TUTOR_PRINCIPAL' }],
    };

    const mockVisitante = { id: 'usr-visitor', email: 'visitor@test.com' };

    it('should create invitation and notify', async () => {
      mockPrisma.pet.findUnique.mockResolvedValue(mockPet);
      mockPrisma.usuario.findUnique
        .mockResolvedValueOnce(mockVisitante) // visitante lookup
        .mockResolvedValueOnce({ nome: 'Tutor' }); // tutor lookup for notification
      mockPrisma.petVisitante.findUnique.mockResolvedValue(null);
      const created = { id: 'pv-1', petId, visitanteId: 'usr-visitor', visitante: { id: 'usr-visitor', nome: 'Visitor' }, pet: { id: petId, nome: 'Luna' } };
      mockPrisma.petVisitante.create.mockResolvedValue(created);
      mockNotificacaoService.create.mockResolvedValue({});
      mockResendProvider.sendNotificationEmail.mockResolvedValue({});

      const result = await service.inviteVisitante(petId, tutorId, data);

      expect(result).toEqual(created);
      expect(mockPrisma.petVisitante.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException when pet not found', async () => {
      mockPrisma.pet.findUnique.mockResolvedValue(null);

      await expect(service.inviteVisitante(petId, tutorId, data)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user is not tutor', async () => {
      mockPrisma.pet.findUnique.mockResolvedValue({
        ...mockPet,
        petUsuarios: [{ usuarioId: tutorId, role: 'VISITANTE' }],
      });

      await expect(service.inviteVisitante(petId, tutorId, data)).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException when visitante user not found', async () => {
      mockPrisma.pet.findUnique.mockResolvedValue(mockPet);
      mockPrisma.usuario.findUnique.mockResolvedValue(null);

      await expect(service.inviteVisitante(petId, tutorId, data)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when self-invite', async () => {
      mockPrisma.pet.findUnique.mockResolvedValue(mockPet);
      mockPrisma.usuario.findUnique.mockResolvedValue({ id: tutorId, email: 'visitor@test.com' });

      await expect(service.inviteVisitante(petId, tutorId, data)).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException when already active invite exists', async () => {
      mockPrisma.pet.findUnique.mockResolvedValue(mockPet);
      mockPrisma.usuario.findUnique.mockResolvedValue(mockVisitante);
      mockPrisma.petVisitante.findUnique.mockResolvedValue({ id: 'pv-existing', statusVinculo: 'ATIVO' });

      await expect(service.inviteVisitante(petId, tutorId, data)).rejects.toThrow(ConflictException);
    });

    it('should delete old record and re-invite when previously revoked', async () => {
      mockPrisma.pet.findUnique.mockResolvedValue(mockPet);
      mockPrisma.usuario.findUnique
        .mockResolvedValueOnce(mockVisitante)
        .mockResolvedValueOnce({ nome: 'Tutor' });
      mockPrisma.petVisitante.findUnique.mockResolvedValue({ id: 'pv-old', statusVinculo: 'BLOQUEADO' });
      mockPrisma.petVisitante.delete.mockResolvedValue({});
      mockPrisma.petVisitante.create.mockResolvedValue({ id: 'pv-new' });

      const result = await service.inviteVisitante(petId, tutorId, data);

      expect(mockPrisma.petVisitante.delete).toHaveBeenCalledWith({ where: { id: 'pv-old' } });
      expect(result).toEqual({ id: 'pv-new' });
    });
  });

  // --- acceptInvite ---
  describe('acceptInvite', () => {
    const pvId = 'pv-1';
    const visitanteId = 'usr-visitor';

    const mockInvite = {
      id: pvId,
      petId: 'pet-1',
      visitanteId,
      aceito: false,
      statusVinculo: 'ATIVO',
      dataFim: null,
      convidadoPor: 'usr-tutor',
      visitante: { id: visitanteId, nome: 'Visitor' },
      pet: { id: 'pet-1', nome: 'Luna' },
    };

    it('should accept invite and notify tutor', async () => {
      mockPrisma.petVisitante.findUnique.mockResolvedValue(mockInvite);
      const updated = { ...mockInvite, aceito: true, dataAceite: new Date() };
      mockPrisma.petVisitante.update.mockResolvedValue(updated);
      mockPrisma.usuario.findUnique.mockResolvedValue({ nome: 'Tutor', email: 'tutor@test.com' });
      mockNotificacaoService.create.mockResolvedValue({});
      mockResendProvider.sendNotificationEmail.mockResolvedValue({});

      const result = await service.acceptInvite(pvId, visitanteId);

      expect(result.aceito).toBe(true);
    });

    it('should throw NotFoundException when invite not found', async () => {
      mockPrisma.petVisitante.findUnique.mockResolvedValue(null);

      await expect(service.acceptInvite(pvId, visitanteId)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when visitanteId mismatch', async () => {
      mockPrisma.petVisitante.findUnique.mockResolvedValue({ ...mockInvite, visitanteId: 'other' });

      await expect(service.acceptInvite(pvId, visitanteId)).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException when already accepted', async () => {
      mockPrisma.petVisitante.findUnique.mockResolvedValue({ ...mockInvite, aceito: true });

      await expect(service.acceptInvite(pvId, visitanteId)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when status not ATIVO', async () => {
      mockPrisma.petVisitante.findUnique.mockResolvedValue({ ...mockInvite, statusVinculo: 'RECUSADO' });

      await expect(service.acceptInvite(pvId, visitanteId)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when expired', async () => {
      mockPrisma.petVisitante.findUnique.mockResolvedValue({ ...mockInvite, dataFim: new Date('2020-01-01') });

      await expect(service.acceptInvite(pvId, visitanteId)).rejects.toThrow(BadRequestException);
    });
  });

  // --- rejectInvite ---
  describe('rejectInvite', () => {
    it('should set statusVinculo to RECUSADO', async () => {
      mockPrisma.petVisitante.findUnique.mockResolvedValue({ id: 'pv-1', visitanteId: 'usr-v' });
      mockPrisma.petVisitante.update.mockResolvedValue({});

      const result = await service.rejectInvite('pv-1', 'usr-v');

      expect(result).toEqual({ message: 'Convite recusado com sucesso.' });
      expect(mockPrisma.petVisitante.update).toHaveBeenCalledWith({
        where: { id: 'pv-1' },
        data: { statusVinculo: 'RECUSADO' },
      });
    });

    it('should throw NotFoundException when not found', async () => {
      mockPrisma.petVisitante.findUnique.mockResolvedValue(null);

      await expect(service.rejectInvite('pv-1', 'usr-v')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when visitanteId mismatch', async () => {
      mockPrisma.petVisitante.findUnique.mockResolvedValue({ id: 'pv-1', visitanteId: 'other' });

      await expect(service.rejectInvite('pv-1', 'usr-v')).rejects.toThrow(ForbiddenException);
    });
  });

  // --- revokeAccess ---
  describe('revokeAccess', () => {
    const petId = 'pet-1';
    const visitanteId = 'usr-visitor';
    const tutorId = 'usr-tutor';

    it('should set statusVinculo to BLOQUEADO and notify', async () => {
      mockPrisma.pet.findUnique.mockResolvedValue({
        id: petId,
        petUsuarios: [{ usuarioId: tutorId, role: 'TUTOR_PRINCIPAL' }],
      });
      mockPrisma.petVisitante.findUnique.mockResolvedValue({ id: 'pv-1' });
      const revoked = {
        id: 'pv-1',
        petId,
        visitanteId,
        statusVinculo: 'BLOQUEADO',
        visitante: { id: visitanteId, nome: 'Visitor', email: 'v@test.com' },
        pet: { id: petId, nome: 'Luna' },
      };
      mockPrisma.petVisitante.update.mockResolvedValue(revoked);
      mockPrisma.usuario.findUnique.mockResolvedValue({ nome: 'Tutor' });
      mockNotificacaoService.create.mockResolvedValue({});
      mockResendProvider.sendNotificationEmail.mockResolvedValue({});

      const result = await service.revokeAccess(petId, visitanteId, tutorId);

      expect(result.statusVinculo).toBe('BLOQUEADO');
      expect(mockNotificacaoService.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException when pet not found', async () => {
      mockPrisma.pet.findUnique.mockResolvedValue(null);

      await expect(service.revokeAccess(petId, visitanteId, tutorId)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when not tutor', async () => {
      mockPrisma.pet.findUnique.mockResolvedValue({
        id: petId,
        petUsuarios: [{ usuarioId: tutorId, role: 'VISITANTE' }],
      });

      await expect(service.revokeAccess(petId, visitanteId, tutorId)).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException when vinculo not found', async () => {
      mockPrisma.pet.findUnique.mockResolvedValue({
        id: petId,
        petUsuarios: [{ usuarioId: tutorId, role: 'TUTOR_PRINCIPAL' }],
      });
      mockPrisma.petVisitante.findUnique.mockResolvedValue(null);

      await expect(service.revokeAccess(petId, visitanteId, tutorId)).rejects.toThrow(NotFoundException);
    });
  });

  // --- selfRevoke ---
  describe('selfRevoke', () => {
    it('should set statusVinculo to SAIU', async () => {
      mockPrisma.petVisitante.findUnique.mockResolvedValue({ id: 'pv-1', visitanteId: 'usr-v' });
      mockPrisma.petVisitante.update.mockResolvedValue({});

      const result = await service.selfRevoke('pet-1', 'usr-v');

      expect(result).toEqual({ message: 'Você saiu do acompanhamento deste pet.' });
      expect(mockPrisma.petVisitante.update).toHaveBeenCalledWith({
        where: { id: 'pv-1' },
        data: { statusVinculo: 'SAIU' },
      });
    });

    it('should throw NotFoundException when vinculo not found', async () => {
      mockPrisma.petVisitante.findUnique.mockResolvedValue(null);

      await expect(service.selfRevoke('pet-1', 'usr-v')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when visitanteId mismatch', async () => {
      mockPrisma.petVisitante.findUnique.mockResolvedValue({ id: 'pv-1', visitanteId: 'other' });

      await expect(service.selfRevoke('pet-1', 'usr-v')).rejects.toThrow(ForbiddenException);
    });
  });

  // --- listVisitantes ---
  describe('listVisitantes', () => {
    it('should return active visitantes for a pet', async () => {
      const mockList = [{ id: 'pv-1', visitante: { nome: 'Visitor' } }];
      mockPrisma.petVisitante.findMany.mockResolvedValue(mockList);

      const result = await service.listVisitantes('pet-1');

      expect(result).toEqual(mockList);
      expect(mockPrisma.petVisitante.findMany).toHaveBeenCalledWith({
        where: { petId: 'pet-1', statusVinculo: 'ATIVO' },
        include: expect.any(Object),
      });
    });
  });

  // --- listPetsByVisitante ---
  describe('listPetsByVisitante', () => {
    it('should return mapped pets with permissoesVisualizacao', async () => {
      const mockData = [
        {
          id: 'pv-1',
          permissoesVisualizacao: ['DADOS_BASICOS'],
          relacao: 'FAMILIAR',
          pet: { id: 'pet-1', nome: 'Luna', especie: 'CACHORRO', raca: 'Golden', fotoUrl: null, dataNascimento: new Date() },
        },
      ];
      mockPrisma.petVisitante.findMany.mockResolvedValue(mockData);

      const result = await service.listPetsByVisitante('usr-v');

      expect(result[0]).toHaveProperty('permissoesVisualizacao', ['DADOS_BASICOS']);
      expect(result[0]).toHaveProperty('relacao', 'FAMILIAR');
      expect(result[0]).toHaveProperty('petVisitanteId', 'pv-1');
    });
  });

  // --- getPendingInvites ---
  describe('getPendingInvites', () => {
    it('should return pending invites', async () => {
      const mockData = [{ id: 'pv-1', aceito: false }];
      mockPrisma.petVisitante.findMany.mockResolvedValue(mockData);

      const result = await service.getPendingInvites('usr-v');

      expect(result).toEqual(mockData);
      expect(mockPrisma.petVisitante.findMany).toHaveBeenCalledWith({
        where: { visitanteId: 'usr-v', aceito: false, statusVinculo: 'ATIVO' },
        include: expect.any(Object),
      });
    });
  });

  // --- hasPermission ---
  describe('hasPermission', () => {
    it('should return true when active, accepted, and permission present', async () => {
      mockPrisma.petVisitante.findUnique.mockResolvedValue({
        statusVinculo: 'ATIVO',
        aceito: true,
        dataFim: null,
        permissoesVisualizacao: ['DADOS_BASICOS', 'STATUS_SAUDE'],
      });

      expect(await service.hasPermission('pet-1', 'usr-v', 'DADOS_BASICOS')).toBe(true);
    });

    it('should return false when not found', async () => {
      mockPrisma.petVisitante.findUnique.mockResolvedValue(null);

      expect(await service.hasPermission('pet-1', 'usr-v', 'DADOS_BASICOS')).toBe(false);
    });

    it('should return false when not ATIVO', async () => {
      mockPrisma.petVisitante.findUnique.mockResolvedValue({
        statusVinculo: 'BLOQUEADO',
        aceito: true,
        dataFim: null,
        permissoesVisualizacao: ['DADOS_BASICOS'],
      });

      expect(await service.hasPermission('pet-1', 'usr-v', 'DADOS_BASICOS')).toBe(false);
    });

    it('should return false when expired', async () => {
      mockPrisma.petVisitante.findUnique.mockResolvedValue({
        statusVinculo: 'ATIVO',
        aceito: true,
        dataFim: new Date('2020-01-01'),
        permissoesVisualizacao: ['DADOS_BASICOS'],
      });

      expect(await service.hasPermission('pet-1', 'usr-v', 'DADOS_BASICOS')).toBe(false);
    });

    it('should return false when permission not in array', async () => {
      mockPrisma.petVisitante.findUnique.mockResolvedValue({
        statusVinculo: 'ATIVO',
        aceito: true,
        dataFim: null,
        permissoesVisualizacao: ['STATUS_SAUDE'],
      });

      expect(await service.hasPermission('pet-1', 'usr-v', 'DADOS_BASICOS')).toBe(false);
    });
  });

  // --- updatePermissions ---
  describe('updatePermissions', () => {
    const petId = 'pet-1';
    const visitanteId = 'usr-v';
    const tutorId = 'usr-tutor';
    const permissoes = ['DADOS_BASICOS', 'HISTORICO_VACINACAO'];

    it('should update permissions when tutor', async () => {
      mockPrisma.pet.findUnique.mockResolvedValue({
        id: petId,
        petUsuarios: [{ usuarioId: tutorId, role: 'TUTOR_PRINCIPAL' }],
      });
      mockPrisma.petVisitante.findUnique.mockResolvedValue({ id: 'pv-1' });
      const updated = { id: 'pv-1', permissoesVisualizacao: permissoes, visitante: { id: visitanteId } };
      mockPrisma.petVisitante.update.mockResolvedValue(updated);

      const result = await service.updatePermissions(petId, visitanteId, tutorId, permissoes);

      expect(result).toEqual(updated);
    });

    it('should throw NotFoundException when pet not found', async () => {
      mockPrisma.pet.findUnique.mockResolvedValue(null);

      await expect(service.updatePermissions(petId, visitanteId, tutorId, permissoes)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when not tutor', async () => {
      mockPrisma.pet.findUnique.mockResolvedValue({
        id: petId,
        petUsuarios: [{ usuarioId: tutorId, role: 'VISITANTE' }],
      });

      await expect(service.updatePermissions(petId, visitanteId, tutorId, permissoes)).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException when vinculo not found', async () => {
      mockPrisma.pet.findUnique.mockResolvedValue({
        id: petId,
        petUsuarios: [{ usuarioId: tutorId, role: 'TUTOR_PRINCIPAL' }],
      });
      mockPrisma.petVisitante.findUnique.mockResolvedValue(null);

      await expect(service.updatePermissions(petId, visitanteId, tutorId, permissoes)).rejects.toThrow(NotFoundException);
    });
  });
});
