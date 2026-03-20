import { IsString, IsOptional, IsEnum, IsArray, IsBoolean, IsDateString } from 'class-validator';

export class CreateCompromissoDto {
  @IsString()
  titulo: string;

  @IsEnum(['PASSEIO', 'CONSULTA', 'BANHO', 'ADESTRAMENTO', 'CRECHE', 'HOSPEDAGEM', 'OUTRO'])
  tipo: string;

  @IsOptional()
  @IsString()
  responsavelId?: string;

  @IsOptional()
  @IsString()
  petPrestadorId?: string;

  @IsEnum(['UNICO', 'DIARIO', 'SEMANAL', 'QUINZENAL', 'MENSAL'])
  recorrencia: string;

  @IsOptional()
  @IsArray()
  diasSemana?: number[];

  @IsOptional()
  @IsString()
  horarioInicio?: string;

  @IsOptional()
  @IsString()
  horarioFim?: string;

  @IsDateString()
  dataInicio: string;

  @IsOptional()
  @IsDateString()
  dataFim?: string;

  @IsOptional()
  @IsBoolean()
  geraGuarda?: boolean;
}

export class UpdateCompromissoDto {
  @IsOptional()
  @IsString()
  titulo?: string;

  @IsOptional()
  @IsBoolean()
  geraGuarda?: boolean;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;

  @IsOptional()
  @IsString()
  horarioInicio?: string;

  @IsOptional()
  @IsString()
  horarioFim?: string;

  @IsOptional()
  @IsArray()
  diasSemana?: number[];
}
