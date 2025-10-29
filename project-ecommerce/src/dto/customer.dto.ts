import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCustomerDto {
  @IsString() @MaxLength(150)
  name: string;

  @IsEmail() @MaxLength(150)
  email: string;

  @IsOptional() @IsString() @MaxLength(20)
  phone?: string;
}

export class UpdateCustomerDto {
  @IsOptional() @IsString() @MaxLength(150)
  name?: string;

  @IsOptional() @IsEmail() @MaxLength(150)
  email?: string;

  @IsOptional() @IsString() @MaxLength(20)
  phone?: string;
}
