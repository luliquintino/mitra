import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { mockTokens } from '../../test/test-utils';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: Record<string, jest.Mock>;

  beforeEach(async () => {
    authService = {
      register: jest.fn(),
      login: jest.fn(),
      logout: jest.fn(),
      refreshTokens: jest.fn(),
      getMe: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe('register', () => {
    it('should call authService.register with the dto', async () => {
      const dto = {
        nome: 'Test',
        email: 'test@mitra.com',
        senha: 'Pass123!',
        telefone: '11999990000',
      };
      const expected = { usuario: { id: 'usr-1' }, ...mockTokens };
      authService.register.mockResolvedValue(expected);

      const result = await controller.register(dto as any);

      expect(authService.register).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });
  });

  describe('login', () => {
    it('should call authService.login with the dto', async () => {
      const dto = { email: 'test@mitra.com', senha: 'Pass123!' };
      const expected = { usuario: { id: 'usr-1' }, ...mockTokens };
      authService.login.mockResolvedValue(expected);

      const result = await controller.login(dto as any);

      expect(authService.login).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });
  });

  describe('logout', () => {
    it('should call authService.logout with the userId', async () => {
      const expected = { message: 'Logout realizado com sucesso.' };
      authService.logout.mockResolvedValue(expected);

      const result = await controller.logout('usr-1');

      expect(authService.logout).toHaveBeenCalledWith('usr-1');
      expect(result).toEqual(expected);
    });
  });

  describe('refresh', () => {
    it('should call authService.refreshTokens with userId and token', async () => {
      const expected = { ...mockTokens };
      authService.refreshTokens.mockResolvedValue(expected);

      const result = await controller.refresh('usr-1', 'refresh-tok');

      expect(authService.refreshTokens).toHaveBeenCalledWith('usr-1', 'refresh-tok');
      expect(result).toEqual(expected);
    });
  });

  describe('me', () => {
    it('should call authService.getMe with the userId', async () => {
      const expected = { id: 'usr-1', nome: 'Test', email: 'test@mitra.com' };
      authService.getMe.mockResolvedValue(expected);

      const result = await controller.me('usr-1');

      expect(authService.getMe).toHaveBeenCalledWith('usr-1');
      expect(result).toEqual(expected);
    });
  });
});
