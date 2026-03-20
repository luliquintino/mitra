import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  IsIn,
  ValidateIf,
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

const ESPECIES_COM_MICROCHIP = ['CACHORRO', 'GATO', 'CAVALO'];

function IsMicrochipValid(validationOptions?: ValidationOptions) {
  return function (target: any, propertyName: string) {
    registerDecorator({
      name: 'isMicrochipValid',
      target: target.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (!value) return true;
          const obj = args.object as CreatePetDto;
          return ESPECIES_COM_MICROCHIP.includes(obj.especie);
        },
        defaultMessage(args: ValidationArguments) {
          const obj = args.object as CreatePetDto;
          return `Microchip não é permitido para a espécie ${obj.especie}`;
        },
      },
    });
  };
}

export class CreatePetDto {
  @ApiProperty({ example: 'Luna' })
  @IsString()
  nome: string;

  @ApiProperty({ enum: ['CACHORRO', 'GATO', 'CAVALO', 'PEIXE', 'PASSARO', 'ROEDOR', 'COELHO', 'REPTIL', 'FURAO', 'OUTRO'] })
  @IsEnum(['CACHORRO', 'GATO', 'CAVALO', 'PEIXE', 'PASSARO', 'ROEDOR', 'COELHO', 'REPTIL', 'FURAO', 'OUTRO'])
  especie: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  raca?: string;

  @ApiProperty({ enum: ['MACHO', 'FEMEA'], required: false })
  @IsOptional()
  @IsEnum(['MACHO', 'FEMEA'])
  genero?: string;

  @ApiProperty({ required: false, example: '2021-03-15' })
  @IsOptional()
  @IsString()
  dataNascimento?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  cor?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  peso?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @IsMicrochipValid()
  microchip?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  observacoes?: string;

  @ApiProperty({ enum: ['CONJUNTA', 'SEPARADA'], required: false })
  @IsOptional()
  @IsIn(['CONJUNTA', 'SEPARADA'])
  tipoGuarda?: 'CONJUNTA' | 'SEPARADA';
}
