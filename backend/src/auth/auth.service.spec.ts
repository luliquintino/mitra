import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { createMockUser, mockTokens } from '../../test/test-utils';
import * as argon2 from 'argon2';

jest.mock('argon2');

const mockArgon2 = argon2 as jest.Mocked<typeof argon2>;

describe('AuthService', () => {
  let service: AuthService;
  let prisma: Record<string, any>;
  let jwtService: Record<string, any>;

  beforeEach(async () => {
    prisma = {
      usuario: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      perfilPrestador: {
        create: jest.fn(),
      },
    };

    jwtService = {
      signAsync: jest
        .fn()
        .mockResolvedValueOnce(mockTokens.accessToken)
        .mockResolvedValueOnce(mockTokens.refreshToken),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    mockArgon2.hash.mockResolvedValue('hashed-value' as never);
    mockArgon2.verify.mockResolvedValue(true as never);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Helper to reset jwtService.signAsync mock for multiple calls within a single test
  function resetTokenMocks() {
    jwtService.signAsync
      .mockReset()
      .mockResolvedValueOnce(mockTokens.accessToken)
      .mockResolvedValueOnce(mockTokens.refreshToken);
  }

  describe('register', () => {
    const registerDto = {
      nome: 'Test User',
      email: 'test@mitra.com',
      senha: 'Password123!',
      telefone: '11999990000',
      tipoUsuario: 'TUTOR',
    } as unknown as RegisterDto;

    it('should register a TUTOR successfully', async () => {
      prisma.usuario.findUnique.mockResolvedValue(null);
      const createdUser = {
        id: 'usr-1',
        nome: registerDto.nome,
        email: registerDto.email,
        telefone: registerDto.telefone,
        tipoUsuario: 'TUTOR',
        criadoEm: new Date(),
      };
      prisma.usuario.create.mockResolvedValue(createdUser);

      const result = await service.register(registerDto);

      expect(prisma.usuario.findUnique).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
      expect(mockArgon2.hash).toHaveBeenCalledWith(registerDto.senha);
      expect(prisma.usuario.create).toHaveBeenCalled();
      expect(prisma.perfilPrestador.create).not.toHaveBeenCalled();
      expect(result).toEqual({
        usuario: createdUser,
        accessToken: mockTokens.accessToken,
        refreshToken: mockTokens.refreshToken,
      });
    });

    it('should register a PRESTADOR and create PerfilPrestador', async () => {
      const prestadorDto = {
        ...registerDto,
        tipoUsuario: 'PRESTADOR',
        dadosProfissionais: {
          tipoPrestador: 'VETERINARIO',
          nomeEmpresa: 'Pet Clinic',
          cnpj: '12345678000100',
          telefoneProfissional: '11988880000',
          endereco: 'Rua Exemplo, 123',
          registroProfissional: 'CRMV-12345',
          descricao: 'Veterinario especialista',
          website: 'https://petclinic.com',
        },
      } as unknown as RegisterDto;
      prisma.usuario.findUnique.mockResolvedValue(null);
      const createdUser = {
        id: 'usr-2',
        nome: prestadorDto.nome,
        email: prestadorDto.email,
        telefone: prestadorDto.telefone,
        tipoUsuario: 'PRESTADOR',
        criadoEm: new Date(),
      };
      prisma.usuario.create.mockResolvedValue(createdUser);
      prisma.perfilPrestador.create.mockResolvedValue({});

      const result = await service.register(prestadorDto);

      expect(prisma.perfilPrestador.create).toHaveBeenCalledWith({
        data: {
          usuarioId: createdUser.id,
          tipoPrestador: prestadorDto.dadosProfissionais.tipoPrestador,
          nomeEmpresa: prestadorDto.dadosProfissionais.nomeEmpresa,
          cnpj: prestadorDto.dadosProfissionais.cnpj,
          telefoneProfissional: prestadorDto.dadosProfissionais.telefoneProfissional,
          endereco: prestadorDto.dadosProfissionais.endereco,
          registroProfissional: prestadorDto.dadosProfissionais.registroProfissional,
          descricao: prestadorDto.dadosProfissionais.descricao,
          website: prestadorDto.dadosProfissionais.website,
        },
      });
      expect(result.usuario).toEqual(createdUser);
      expect(result.accessToken).toBeDefined();
    });

    it('should throw ConflictException if email already exists', async () => {
      prisma.usuario.findUnique.mockResolvedValue(createMockUser());

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
      expect(prisma.usuario.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const loginDto = { email: 'test@mitra.com', senha: 'Password123!' };

    it('should login successfully', async () => {
      const user = createMockUser();
      prisma.usuario.findUnique.mockResolvedValue(user);

      const result = await service.login(loginDto);

      expect(mockArgon2.verify).toHaveBeenCalledWith(user.senhaHash, loginDto.senha);
      expect(result.usuario.id).toEqual(user.id);
      expect(result.accessToken).toEqual(mockTokens.accessToken);
      expect(result.refreshToken).toEqual(mockTokens.refreshToken);
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      prisma.usuario.findUnique.mockResolvedValue(createMockUser());
      mockArgon2.verify.mockResolvedValue(false as never);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for nonexistent email', async () => {
      prisma.usuario.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for inactive user', async () => {
      prisma.usuario.findUnique.mockResolvedValue(
        createMockUser({ ativo: false }),
      );

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('logout', () => {
    it('should clear the refresh token', async () => {
      prisma.usuario.update.mockResolvedValue({});

      const result = await service.logout('usr-test-1');

      expect(prisma.usuario.update).toHaveBeenCalledWith({
        where: { id: 'usr-test-1' },
        data: { refreshToken: null },
      });
      expect(result).toEqual({ message: 'Logout realizado com sucesso.' });
    });
  });

  describe('refreshTokens', () => {
    it('should return new tokens on valid refresh', async () => {
      const user = createMockUser({ refreshToken: 'hashed-refresh-token' });
      prisma.usuario.findUnique.mockResolvedValue(user);

      const result = await service.refreshTokens('usr-test-1', 'valid-refresh-token');

      expect(mockArgon2.verify).toHaveBeenCalledWith(
        user.refreshToken,
        'valid-refresh-token',
      );
      expect(result.accessToken).toEqual(mockTokens.accessToken);
      expect(result.refreshToken).toEqual(mockTokens.refreshToken);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      prisma.usuario.findUnique.mockResolvedValue(null);

      await expect(
        service.refreshTokens('usr-nonexistent', 'token'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if refresh token is invalid', async () => {
      const user = createMockUser({ refreshToken: 'hashed-refresh-token' });
      prisma.usuario.findUnique.mockResolvedValue(user);
      mockArgon2.verify.mockResolvedValue(false as never);

      await expect(
        service.refreshTokens('usr-test-1', 'bad-token'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getMe', () => {
    it('should return user data', async () => {
      const userData = {
        id: 'usr-test-1',
        nome: 'Test User',
        email: 'test@mitra.com',
        telefone: '11999990000',
        avatarUrl: null,
        tipoUsuario: 'TUTOR',
        criadoEm: new Date(),
      };
      prisma.usuario.findUnique.mockResolvedValue(userData);

      const result = await service.getMe('usr-test-1');

      expect(prisma.usuario.findUnique).toHaveBeenCalledWith({
        where: { id: 'usr-test-1' },
        select: {
          id: true,
          nome: true,
          email: true,
          telefone: true,
          avatarUrl: true,
          tipoUsuario: true,
          criadoEm: true,
        },
      });
      expect(result).toEqual(userData);
    });
  });
});
