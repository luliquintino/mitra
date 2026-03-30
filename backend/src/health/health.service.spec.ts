import { Test, TestingModule } from '@nestjs/testing';
import { HealthService } from './health.service';
import { PrismaService } from '../prisma/prisma.service';
import { PetsService } from '../pets/pets.service';
import {
  createMockVacina,
  createMockMedicamento,
  createMockSintoma,
  createMockPetUsuario,
} from '../../test/test-utils';

describe('HealthService', () => {
  let service: HealthService;
  let prisma: Record<string, any>;
  let petsService: Record<string, jest.Mock>;

  const petId = 'pet-test-1';
  const userId = 'usr-test-1';
  const mockAccess = createMockPetUsuario();

  beforeEach(async () => {
    prisma = {
      vacina: {
        findMany: jest.fn(),
        create: jest.fn(),
      },
      medicamento: {
        findMany: jest.fn(),
        create: jest.fn(),
        findUnique: jest.fn(),
      },
      administracaoMed: {
        create: jest.fn(),
      },
      sintoma: {
        findMany: jest.fn(),
        create: jest.fn(),
      },
      planoSaude: {
        findUnique: jest.fn(),
        upsert: jest.fn(),
      },
      evento: {
        create: jest.fn(),
      },
      usuario: {
        findUnique: jest.fn(),
      },
    };

    petsService = {
      checkAccess: jest.fn().mockResolvedValue(mockAccess),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        { provide: PrismaService, useValue: prisma },
        { provide: PetsService, useValue: petsService },
      ],
    }).compile();

    service = module.get<HealthService>(HealthService);
  });

  describe('getVacinas', () => {
    it('should check access then return vacinas', async () => {
      const vacinas = [createMockVacina()];
      prisma.vacina.findMany.mockResolvedValue(vacinas);

      const result = await service.getVacinas(petId, userId);

      expect(petsService.checkAccess).toHaveBeenCalledWith(petId, userId);
      expect(result).toEqual(vacinas);
      expect(prisma.vacina.findMany).toHaveBeenCalledWith({
        where: { petId },
        orderBy: { dataAplicacao: 'desc' },
      });
    });
  });

  describe('createVacina', () => {
    it('should check access, create vacina and evento, return result', async () => {
      const vacina = createMockVacina();
      prisma.vacina.create.mockResolvedValue(vacina);
      prisma.evento.create.mockResolvedValue({});

      const data = {
        nome: 'V10',
        dataAplicacao: '2025-06-01',
        veterinario: 'Dr. Carlos',
      };
      const result = await service.createVacina(petId, userId, data);

      expect(petsService.checkAccess).toHaveBeenCalledWith(petId, userId);
      expect(prisma.vacina.create).toHaveBeenCalled();
      expect(prisma.evento.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            petId,
            tipo: 'VACINA_REGISTRADA',
            autorId: userId,
          }),
        }),
      );
      expect(result.vacina).toEqual(vacina);
      expect(result.mensagem).toContain('V10');
    });
  });

  describe('getMedicamentos', () => {
    it('should check access then return medicamentos with administracoes', async () => {
      const meds = [createMockMedicamento()];
      prisma.medicamento.findMany.mockResolvedValue(meds);

      const result = await service.getMedicamentos(petId, userId);

      expect(petsService.checkAccess).toHaveBeenCalledWith(petId, userId);
      expect(result).toEqual(meds);
      expect(prisma.medicamento.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { petId },
          include: expect.objectContaining({
            administracoes: expect.any(Object),
          }),
        }),
      );
    });
  });

  describe('createMedicamento', () => {
    it('should check access, create medicamento and evento', async () => {
      const med = createMockMedicamento();
      prisma.medicamento.create.mockResolvedValue(med);
      prisma.evento.create.mockResolvedValue({});

      const data = {
        nome: 'Bravecto',
        dosagem: '1 comprimido',
        frequencia: 'A cada 3 meses',
        dataInicio: '2025-06-01',
      };
      const result = await service.createMedicamento(petId, userId, data);

      expect(petsService.checkAccess).toHaveBeenCalledWith(petId, userId);
      expect(prisma.medicamento.create).toHaveBeenCalled();
      expect(prisma.evento.create).toHaveBeenCalled();
      expect(result.medicamento).toEqual(med);
      expect(result.mensagem).toContain('Bravecto');
    });
  });

  describe('registrarAdministracao', () => {
    it('should find medicamento, check access, create administracao and evento', async () => {
      const med = createMockMedicamento();
      prisma.medicamento.findUnique.mockResolvedValue(med);
      prisma.usuario.findUnique.mockResolvedValue({ nome: 'Test User' });
      prisma.administracaoMed.create.mockResolvedValue({ id: 'adm-1' });
      prisma.evento.create.mockResolvedValue({});

      const result = await service.registrarAdministracao(med.id, userId, {
        observacoes: 'Dose matinal',
      });

      expect(prisma.medicamento.findUnique).toHaveBeenCalledWith({ where: { id: med.id } });
      expect(petsService.checkAccess).toHaveBeenCalledWith(med.petId, userId);
      expect(prisma.administracaoMed.create).toHaveBeenCalled();
      expect(prisma.evento.create).toHaveBeenCalled();
      expect(result.administracao).toEqual({ id: 'adm-1' });
      expect(result.mensagem).toContain(med.nome);
    });

    it('should throw when medicamento not found', async () => {
      prisma.medicamento.findUnique.mockResolvedValue(null);

      await expect(
        service.registrarAdministracao('invalid-id', userId, {}),
      ).rejects.toThrow('Medicamento não encontrado.');
    });
  });

  describe('getSintomas', () => {
    it('should check access then return sintomas', async () => {
      const sintomas = [createMockSintoma()];
      prisma.sintoma.findMany.mockResolvedValue(sintomas);

      const result = await service.getSintomas(petId, userId);

      expect(petsService.checkAccess).toHaveBeenCalledWith(petId, userId);
      expect(result).toEqual(sintomas);
    });
  });

  describe('createSintoma', () => {
    it('should check access, create sintoma and evento', async () => {
      const sintoma = createMockSintoma();
      prisma.sintoma.create.mockResolvedValue(sintoma);
      prisma.evento.create.mockResolvedValue({});

      const data = {
        descricao: 'Coceira nas patas',
        dataInicio: '2025-06-01',
        intensidade: 3,
      };
      const result = await service.createSintoma(petId, userId, data);

      expect(petsService.checkAccess).toHaveBeenCalledWith(petId, userId);
      expect(prisma.sintoma.create).toHaveBeenCalled();
      expect(prisma.evento.create).toHaveBeenCalled();
      expect(result.sintoma).toEqual(sintoma);
      expect(result.mensagem).toContain('Sintoma registrado');
    });
  });

  describe('getPlanoSaude', () => {
    it('should check access then return plano de saude', async () => {
      const plano = { id: 'ps-1', petId, operadora: 'PetSaude' };
      prisma.planoSaude.findUnique.mockResolvedValue(plano);

      const result = await service.getPlanoSaude(petId, userId);

      expect(petsService.checkAccess).toHaveBeenCalledWith(petId, userId);
      expect(result).toEqual(plano);
      expect(prisma.planoSaude.findUnique).toHaveBeenCalledWith({ where: { petId } });
    });

    it('should return null when no plano exists', async () => {
      prisma.planoSaude.findUnique.mockResolvedValue(null);

      const result = await service.getPlanoSaude(petId, userId);

      expect(result).toBeNull();
    });
  });

  describe('upsertPlanoSaude', () => {
    it('should check access, upsert plano and create evento', async () => {
      const plano = { id: 'ps-1', petId, operadora: 'PetSaude' };
      prisma.planoSaude.upsert.mockResolvedValue(plano);
      prisma.evento.create.mockResolvedValue({});

      const data = {
        operadora: 'PetSaude',
        numeroCartao: '12345',
        plano: 'Premium',
      };
      const result = await service.upsertPlanoSaude(petId, userId, data);

      expect(petsService.checkAccess).toHaveBeenCalledWith(petId, userId);
      expect(prisma.planoSaude.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { petId },
        }),
      );
      expect(prisma.evento.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            tipo: 'PLANO_SAUDE_ATUALIZADO',
          }),
        }),
      );
      expect(result.plano).toEqual(plano);
      expect(result.mensagem).toContain('sucesso');
    });
  });
});
