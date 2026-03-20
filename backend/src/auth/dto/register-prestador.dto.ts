import {
  IsString,
  IsEmail,
  IsEnum,
  IsOptional,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum TipoPrestadorEnum {
  VETERINARIO = 'VETERINARIO',
  PET_SITTER = 'PET_SITTER',
  DAY_CARE = 'DAY_CARE',
  ADESTRADOR = 'ADESTRADOR',
  BANHO_TOSA = 'BANHO_TOSA',
  CUIDADOR_EVENTUAL = 'CUIDADOR_EVENTUAL',
  OUTRO = 'OUTRO',
}

export class RegisterPrestadorDto {
  @ApiProperty({ example: 'Ana Veterinária' })
  @IsString()
  nome: string;

  @ApiProperty({ example: 'ana.vet@mitra.com' })
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

  @ApiProperty({ enum: TipoPrestadorEnum })
  @IsEnum(TipoPrestadorEnum)
  tipoPrestador: string;

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
