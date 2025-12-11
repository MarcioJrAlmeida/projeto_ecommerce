// src/users/dto/user.dto.ts
import { IsEmail, IsString, MinLength, IsOptional, IsIn } from 'class-validator';
import { UserRole } from '../entity/Users';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsIn(['admin', 'cliente'])
  role?: UserRole;
}

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @IsIn(['admin', 'cliente'])
  role?: UserRole;
}