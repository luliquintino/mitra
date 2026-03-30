import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { CustodyService } from './custody.service';
import { PrismaService } from '../prisma/prisma.service';
import { PetsService } from '../pets/pets.service';
import {
  createMockUser,
  createMockSolicitacao,
} from '../../test/test-utils';

describe('CustodyService', () => {
  let service: CustodyService;
  let prisma: Record<string, any>;
  let petsService: { checkAccess: jest.Mock };

  const userId = 'usr-test-1';
  const petId = 'pet-test-1';

  beforeEach(async () => {
    prisma = {
      guarda: { findMany: jest.fn() },
      solicitacao: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
      evento: { create: jest.fn() },
      notificacao: { create: jest.fn() },
      usuario: { findUnique: jest.fn() },
      guardaTemporaria: { findMany: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn() },
    };

    petsService = { checkAccess: jest.fn().mockResolvedValue({ role: 'TUTOR_PRINCIPAL' }) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustodyService,
        { provide: PrismaService, useValue: prisma },
        { provide: PetsService, useValue: petsService },
      ],
    }).compile();

    service = module.get<CustodyService>(CustodyService);
  });

  // ─── getGuardas ────────────────────────────────────────────────────────────

  describe('getGuardas', () => {
    it('should check access and return guardas', async () => {
      const guardas = [{ id: 'g-1', petId }];
      prisma.guarda.findMany.mockResolvedValue(guardas);

      const result = await service.getGuardas(petId, userId);

      expect(petsService.checkAccess).toHaveBeenCalledWith(petId, userId);
      expect(prisma.guarda.findMany).toHaveBeenCalledWith({
        where: { petId },
        orderBy: { dataInicio: 'desc' },
      });
      expect(result).toEqual(guardas);
    });
  });

  // ─── getSolicitacoes ──────────────────────────────────────────────────────

  describe('getSolicitacoes', () => {
    it('should check access and return solicitacoes with relations', async () => {
      const solicitacoes = [createMockSolicitacao()];
      prisma.solicitacao.findMany.mockResolvedValue(solicitacoes);

      const result = await service.getSolicitacoes(petId, userId);

      expect(petsService.checkAccess).toHaveBeenCalledWith(petId, userId);
      expect(prisma.solicitacao.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { petId },
          include: expect.objectContaining({
            solicitante: expect.any(Object),
            destinatario: expect.any(Object),
          }),
        }),
      );
      expect(result).toEqual(solicitacoes);
    });
  });

  // ─── criarSolicitacao ─────────────────────────────────────────────────────

  describe('criarSolicitacao', () => {
    const data = {
      destinatarioId: 'usr-test-2',
      tipo: 'ALTERACAO_GUARDA',
      justificativa: 'Motivo teste',
      dados: null,
    };

    it('should create solicitacao, evento, notificacao, and return 48h message', async () => {
      const mockUser = createMockUser();
      prisma.usuario.findUnique.mockResolvedValue(mockUser);
      const createdSol = { id: 'sol-new', ...data, petId };
      prisma.solicitacao.create.mockResolvedValue(createdSol);
      prisma.evento.create.mockResolvedValue({});
      prisma.notificacao.create.mockResolvedValue({});

      const result = await service.criarSolicitacao(petId, userId, data);

      expect(petsService.checkAccess).toHaveBeenCalledWith(petId, userId);
      expect(prisma.solicitacao.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            petId,
            solicitanteId: userId,
            destinatarioId: data.destinatarioId,
          }),
        }),
      );
      expect(prisma.evento.create).toHaveBeenCalled();
      expect(prisma.notificacao.create).toHaveBeenCalled();
      expect(result.mensagem).toContain('48h');
    });

    it('should not create notificacao when destinatarioId is absent', async () => {
      prisma.usuario.findUnique.mockResolvedValue(createMockUser());
      prisma.solicitacao.create.mockResolvedValue({ id: 'sol-new' });
      prisma.evento.create.mockResolvedValue({});

      await service.criarSolicitacao(petId, userId, { justificativa: 'x' });

      expect(prisma.notificacao.create).not.toHaveBeenCalled();
    });
  });

  // ─── responderSolicitacao ─────────────────────────────────────────────────

  describe('responderSolicitacao', () => {
    const solicitacaoId = 'sol-test-1';
    const destinatarioId = 'usr-test-2';

    const makeSolicitacao = (overrides = {}) => ({
      id: solicitacaoId,
      petId,
      solicitanteId: userId,
      destinatarioId,
      status: 'PENDENTE',
      expiradoEm: new Date(Date.now() + 86400000),
      solicitante: { id: userId, nome: 'Test User' },
      ...overrides,
    });

    it('should approve solicitacao successfully', async () => {
      prisma.solicitacao.findUnique.mockResolvedValue(makeSolicitacao());
      prisma.solicitacao.update.mockResolvedValue({});
      prisma.usuario.findUnique.mockResolvedValue({ nome: 'Resp User' });
      prisma.evento.create.mockResolvedValue({});
      prisma.notificacao.create.mockResolvedValue({});

      const result = await service.responderSolicitacao(solicitacaoId, destinatarioId, true);

      expect(prisma.solicitacao.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'APROVADA' }),
        }),
      );
      expect(result.mensagem).toContain('aprovada');
    });

    it('should reject solicitacao successfully', async () => {
      prisma.solicitacao.findUnique.mockResolvedValue(makeSolicitacao());
      prisma.solicitacao.update.mockResolvedValue({});
      prisma.usuario.findUnique.mockResolvedValue({ nome: 'Resp User' });
      prisma.evento.create.mockResolvedValue({});
      prisma.notificacao.create.mockResolvedValue({});

      const result = await service.responderSolicitacao(solicitacaoId, destinatarioId, false, 'Discordo');

      expect(prisma.solicitacao.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'RECUSADA', respostaMensagem: 'Discordo' }),
        }),
      );
      expect(result.mensagem).toContain('recusada');
    });

    it('should throw when solicitacao not found', async () => {
      prisma.solicitacao.findUnique.mockResolvedValue(null);

      await expect(
        service.responderSolicitacao(solicitacaoId, destinatarioId, true),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw when user is not the destinatario', async () => {
      prisma.solicitacao.findUnique.mockResolvedValue(makeSolicitacao());

      await expect(
        service.responderSolicitacao(solicitacaoId, 'wrong-user', true),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw when solicitacao already responded', async () => {
      prisma.solicitacao.findUnique.mockResolvedValue(
        makeSolicitacao({ status: 'APROVADA' }),
      );

      await expect(
        service.responderSolicitacao(solicitacaoId, destinatarioId, true),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw when solicitacao is expired', async () => {
      prisma.solicitacao.findUnique.mockResolvedValue(
        makeSolicitacao({ expiradoEm: new Date(Date.now() - 86400000) }),
      );

      await expect(
        service.responderSolicitacao(solicitacaoId, destinatarioId, true),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ─── getGuardasTemporarias ────────────────────────────────────────────────

  describe('getGuardasTemporarias', () => {
    it('should check access and return guardas temporarias', async () => {
      const guardas = [{ id: 'gt-1', petId }];
      prisma.guardaTemporaria.findMany.mockResolvedValue(guardas);

      const result = await service.getGuardasTemporarias(petId, userId);

      expect(petsService.checkAccess).toHaveBeenCalledWith(petId, userId);
      expect(result).toEqual(guardas);
    });
  });

  // ─── criarGuardaTemporariaManual ──────────────────────────────────────────

  describe('criarGuardaTemporariaManual', () => {
    it('should create guarda temporaria of type PESSOA', async () => {
      const data = {
        responsavelId: 'usr-test-2',
        dataInicio: '2026-04-01T10:00:00Z',
        dataFim: '2026-04-02T10:00:00Z',
        observacoes: 'Viagem',
      };
      const created = { id: 'gt-new', ...data, petId, tipo: 'PESSOA', status: 'AGENDADA' };
      prisma.guardaTemporaria.create.mockResolvedValue(created);
      prisma.evento.create.mockResolvedValue({});

      const result = await service.criarGuardaTemporariaManual(petId, userId, data);

      expect(prisma.guardaTemporaria.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ petId, tipo: 'PESSOA', status: 'AGENDADA' }),
        }),
      );
      expect(prisma.evento.create).toHaveBeenCalled();
      expect(result).toEqual(created);
    });

    it('should create guarda temporaria of type PRESTADOR when petPrestadorId given', async () => {
      const data = {
        petPrestadorId: 'pp-1',
        dataInicio: '2026-04-01T10:00:00Z',
        dataFim: '2026-04-02T10:00:00Z',
      };
      prisma.guardaTemporaria.create.mockResolvedValue({ id: 'gt-new', tipo: 'PRESTADOR' });
      prisma.evento.create.mockResolvedValue({});

      await service.criarGuardaTemporariaManual(petId, userId, data);

      expect(prisma.guardaTemporaria.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ tipo: 'PRESTADOR', responsavelId: null }),
        }),
      );
    });
  });

  // ─── confirmarGuarda ──────────────────────────────────────────────────────

  describe('confirmarGuarda', () => {
    const guardaId = 'gt-1';

    it('should confirm an AGENDADA guarda', async () => {
      prisma.guardaTemporaria.findFirst.mockResolvedValue({ id: guardaId, petId, status: 'AGENDADA' });
      prisma.guardaTemporaria.update.mockResolvedValue({ id: guardaId, status: 'CONFIRMADA' });
      prisma.evento.create.mockResolvedValue({});

      const result = await service.confirmarGuarda(petId, guardaId, userId);

      expect(prisma.guardaTemporaria.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'CONFIRMADA' }),
        }),
      );
      expect(result.status).toBe('CONFIRMADA');
    });

    it('should throw when guarda not found', async () => {
      prisma.guardaTemporaria.findFirst.mockResolvedValue(null);

      await expect(
        service.confirmarGuarda(petId, guardaId, userId),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw when guarda is not AGENDADA', async () => {
      prisma.guardaTemporaria.findFirst.mockResolvedValue({ id: guardaId, petId, status: 'CONFIRMADA' });

      await expect(
        service.confirmarGuarda(petId, guardaId, userId),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ─── cancelarGuarda ───────────────────────────────────────────────────────

  describe('cancelarGuarda', () => {
    const guardaId = 'gt-1';

    it('should cancel an AGENDADA guarda', async () => {
      prisma.guardaTemporaria.findFirst.mockResolvedValue({ id: guardaId, petId, status: 'AGENDADA' });
      prisma.guardaTemporaria.update.mockResolvedValue({ id: guardaId, status: 'CANCELADA' });
      prisma.evento.create.mockResolvedValue({});

      const result = await service.cancelarGuarda(petId, guardaId, userId);

      expect(result.status).toBe('CANCELADA');
    });

    it('should cancel a CONFIRMADA guarda', async () => {
      prisma.guardaTemporaria.findFirst.mockResolvedValue({ id: guardaId, petId, status: 'CONFIRMADA' });
      prisma.guardaTemporaria.update.mockResolvedValue({ id: guardaId, status: 'CANCELADA' });
      prisma.evento.create.mockResolvedValue({});

      const result = await service.cancelarGuarda(petId, guardaId, userId);

      expect(result.status).toBe('CANCELADA');
    });

    it('should throw when guarda not found', async () => {
      prisma.guardaTemporaria.findFirst.mockResolvedValue(null);

      await expect(
        service.cancelarGuarda(petId, guardaId, userId),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw when guarda status cannot be cancelled', async () => {
      prisma.guardaTemporaria.findFirst.mockResolvedValue({ id: guardaId, petId, status: 'CANCELADA' });

      await expect(
        service.cancelarGuarda(petId, guardaId, userId),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ─── verificarSolicitacoesExpiradas ───────────────────────────────────────

  describe('verificarSolicitacoesExpiradas', () => {
    it('should update expired solicitacoes and create events', async () => {
      const expiradas = [
        { id: 'sol-1', petId, solicitanteId: userId },
        { id: 'sol-2', petId: 'pet-2', solicitanteId: 'usr-2' },
      ];
      prisma.solicitacao.findMany.mockResolvedValue(expiradas);
      prisma.solicitacao.update.mockResolvedValue({});
      prisma.evento.create.mockResolvedValue({});

      const result = await service.verificarSolicitacoesExpiradas();

      expect(prisma.solicitacao.update).toHaveBeenCalledTimes(2);
      expect(prisma.evento.create).toHaveBeenCalledTimes(2);
      expect(result).toEqual({ expiradas: 2 });
    });

    it('should return zero when no expired solicitacoes', async () => {
      prisma.solicitacao.findMany.mockResolvedValue([]);

      const result = await service.verificarSolicitacoesExpiradas();

      expect(prisma.solicitacao.update).not.toHaveBeenCalled();
      expect(result).toEqual({ expiradas: 0 });
    });
  });
});
