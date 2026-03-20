import {
  IsString,
  IsEmail,
  IsOptional,
  IsArray,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConvidarVisitanteDto {
  @ApiProperty({ example: 'visitante@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Familiar', required: false })
  @IsOptional()
  @IsString()
  relacao?: string;

  @ApiProperty({
    example: ['DADOS_BASICOS', 'STATUS_SAUDE', 'HISTORICO_VACINACAO'],
    required: false,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  permissoes?: string[];

  @ApiProperty({ example: '2026-12-31', required: false })
  @IsOptional()
  @IsString()
  dataValidade?: string;
}
