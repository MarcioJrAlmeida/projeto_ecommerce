import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString() @MaxLength(150)
  name: string;

  @IsEmail() @MaxLength(150)
  email: string;

  @IsOptional() @IsString() @MaxLength(20)
  phone?: string;

  @IsOptional() @IsString() @MaxLength(255)
  address?: string; // linha livre

  @IsString() @MinLength(6) @MaxLength(72)
  password: string;
}
