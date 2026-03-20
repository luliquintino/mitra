import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'ana@mitra.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Mitra@2024' })
  @IsString()
  senha: string;
}
