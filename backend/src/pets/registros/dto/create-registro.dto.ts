import { IsString, IsIn, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRegistroDto {
  @ApiProperty({
    enum: ['VISITA', 'ALIMENTACAO', 'CHECK_IN', 'CHECK_OUT', 'SESSAO', 'PROGRESSO', 'OBSERVACAO'],
    example: 'VISITA',
  })
  @IsIn(['VISITA', 'ALIMENTACAO', 'CHECK_IN', 'CHECK_OUT', 'SESSAO', 'PROGRESSO', 'OBSERVACAO'])
  tipo: string;

  @ApiProperty({ example: 'Passeio realizado no parque' })
  @IsString()
  titulo: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiProperty({ required: false, type: Object })
  @IsOptional()
  dados?: Record<string, unknown>;
}
