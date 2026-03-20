import {
  IsString,
  IsEmail,
  IsOptional,
  IsArray,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

enum PermissaoPrestadorEnum {
  VISUALIZAR = 'VISUALIZAR',
  REGISTRAR_SERVICO = 'REGISTRAR_SERVICO',
  REGISTRAR_VACINA = 'REGISTRAR_VACINA',
  ANEXAR_DOCUMENTO = 'ANEXAR_DOCUMENTO',
  REGISTRAR_OBSERVACOES = 'REGISTRAR_OBSERVACOES',
  EDITAR_SAUDE = 'EDITAR_SAUDE',
}

export class ConvidarPrestadorDto {
  @ApiProperty({ example: 'prestador@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'VETERINARIO', required: false })
  @IsOptional()
  @IsString()
  tipoPrestador?: string;

  @ApiProperty({
    example: ['VISUALIZAR', 'REGISTRAR_VACINA'],
    required: false,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  permissoes?: string[];

  @ApiProperty({ example: '2026-06-03', required: false })
  @IsOptional()
  @IsString()
  dataValidade?: string;

  @ApiProperty({
    example: 'Consultório autorizado. Veterinária especialista.',
    required: false,
  })
  @IsOptional()
  @IsString()
  mensagem?: string;
}
