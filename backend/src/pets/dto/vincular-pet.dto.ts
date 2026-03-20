import { IsString, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VincularPetDto {
  @ApiProperty({
    enum: ['TUTOR_PRINCIPAL', 'TUTOR_EMERGENCIA', 'FAMILIAR', 'AMIGO', 'OUTRO'],
    example: 'FAMILIAR',
  })
  @IsString()
  @IsIn(['TUTOR_PRINCIPAL', 'TUTOR_EMERGENCIA', 'FAMILIAR', 'AMIGO', 'OUTRO'])
  role: string;
}
