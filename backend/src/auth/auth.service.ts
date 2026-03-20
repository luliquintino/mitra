import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as argon2 from 'argon2';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.usuario.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('E-mail já cadastrado.');
    }

    const senhaHash = await argon2.hash(dto.senha);

    const usuario = await this.prisma.usuario.create({
      data: {
        nome: dto.nome,
        email: dto.email,
        senhaHash,
        telefone: dto.telefone,
        tipoUsuario: dto.tipoUsuario || 'TUTOR',
      },
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
        tipoUsuario: true,
        criadoEm: true,
      },
    });

    // Se é prestador ou ambos, criar perfil profissional
    if (
      (dto.tipoUsuario === 'PRESTADOR' || dto.tipoUsuario === 'AMBOS') &&
      dto.dadosProfissionais
    ) {
      await this.prisma.perfilPrestador.create({
        data: {
          usuarioId: usuario.id,
          tipoPrestador: dto.dadosProfissionais.tipoPrestador,
          nomeEmpresa: dto.dadosProfissionais.nomeEmpresa,
          cnpj: dto.dadosProfissionais.cnpj,
          telefoneProfissional: dto.dadosProfissionais.telefoneProfissional,
          endereco: dto.dadosProfissionais.endereco,
          registroProfissional: dto.dadosProfissionais.registroProfissional,
          descricao: dto.dadosProfissionais.descricao,
          website: dto.dadosProfissionais.website,
        },
      });
    }

    const tokens = await this.generateTokens(usuario.id, usuario.email, usuario.tipoUsuario);
    await this.updateRefreshToken(usuario.id, tokens.refreshToken);

    return { usuario, ...tokens };
  }

  async login(dto: LoginDto) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { email: dto.email },
    });

    if (!usuario) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    const senhaValida = await argon2.verify(usuario.senhaHash, dto.senha);
    if (!senhaValida) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    if (!usuario.ativo) {
      throw new UnauthorizedException(
        'Conta inativa. Entre em contato com o suporte.',
      );
    }

    const tokens = await this.generateTokens(usuario.id, usuario.email, usuario.tipoUsuario);
    await this.updateRefreshToken(usuario.id, tokens.refreshToken);

    return {
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        telefone: usuario.telefone,
        avatarUrl: usuario.avatarUrl,
        tipoUsuario: usuario.tipoUsuario,
      },
      ...tokens,
    };
  }

  async logout(userId: string) {
    await this.prisma.usuario.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
    return { message: 'Logout realizado com sucesso.' };
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: userId },
    });

    if (!usuario || !usuario.refreshToken) {
      throw new UnauthorizedException('Acesso negado.');
    }

    const tokenValido = await argon2.verify(usuario.refreshToken, refreshToken);
    if (!tokenValido) {
      throw new UnauthorizedException('Acesso negado.');
    }

    const tokens = await this.generateTokens(usuario.id, usuario.email, usuario.tipoUsuario);
    await this.updateRefreshToken(usuario.id, tokens.refreshToken);
    return tokens;
  }

  async getMe(userId: string) {
    return this.prisma.usuario.findUnique({
      where: { id: userId },
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
  }

  private async generateTokens(userId: string, email: string, tipoUsuario?: string) {
    const payload = { sub: userId, email, tipoUsuario: tipoUsuario || 'TUTOR' };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRATION || '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d',
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async updateRefreshToken(userId: string, refreshToken: string) {
    const hash = await argon2.hash(refreshToken);
    await this.prisma.usuario.update({
      where: { id: userId },
      data: { refreshToken: hash },
    });
  }
}
