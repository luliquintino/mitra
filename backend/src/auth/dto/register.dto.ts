import { IsEmail, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

enum TipoUsuario {
  TUTOR = 'TUTOR',
  PRESTADOR = 'PRESTADOR',
  AMBOS = 'AMBOS',
}

enum TipoPrestador {
  VETERINARIO = 'VETERINARIO',
  PET_SITTER = 'PET_SITTER',
  DAY_CARE = 'DAY_CARE',
  ADESTRADOR = 'ADESTRADOR',
  BANHO_TOSA = 'BANHO_TOSA',
  CUIDADOR_EVENTUAL = 'CUIDADOR_EVENTUAL',
  OUTRO = 'OUTRO',
}

export class DadosProfissionaisDto {
  @ApiProperty({ example: 'VETERINARIO', enum: TipoPrestador })
  @IsEnum(TipoPrestador)
  tipoPrestador: TipoPrestador;

  @ApiProperty({ example: 'Clínica Veterinária Ana', required: false })
  @IsOptional()
  @IsString()
  nomeEmpresa?: string;

  @ApiProperty({ example: '12345678901234', required: false })
  @IsOptional()
  @IsString()
  cnpj?: string;

  @ApiProperty({ example: '11988881234' })
  @IsString()
  telefoneProfissional: string;

  @ApiProperty({ example: 'Rua das Flores, 123, São Paulo, SP' })
  @IsString()
  endereco: string;

  @ApiProperty({ example: 'CRMV 123456', required: false })
  @IsOptional()
  @IsString()
  registroProfissional?: string;

  @ApiProperty({ example: 'Consultório especializado em animais pequenos' })
  @IsString()
  descricao: string;

  @ApiProperty({ example: 'https://clinicaveterinariaana.com.br', required: false })
  @IsOptional()
  @IsString()
  website?: string;
}

export class RegisterDto {
  @ApiProperty({ example: 'Ana Souza' })
  @IsString()
  nome: string;

  @ApiProperty({ example: 'ana@mitra.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Mitra@2024', minLength: 8 })
  @IsString()
  @MinLength(8)
  senha: string;

  @ApiProperty({ example: '11999990001', required: false })
  @IsOptional()
  @IsString()
  telefone?: string;

  @ApiProperty({ example: 'TUTOR', enum: TipoUsuario, required: false })
  @IsOptional()
  @IsEnum(TipoUsuario)
  tipoUsuario?: TipoUsuario;

  @ApiProperty({ type: DadosProfissionaisDto, required: false })
  @IsOptional()
  @Type(() => DadosProfissionaisDto)
  dadosProfissionais?: DadosProfissionaisDto;
}
