import { IsBoolean, IsOptional, IsString, Length, MaxLength } from 'class-validator';

export class CreateAddressDto {
  @IsString() @MaxLength(120)
  street: string;

  @IsString() @MaxLength(20)
  number: string;

  @IsOptional() @IsString() @MaxLength(120)
  complement?: string;

  @IsString() @MaxLength(120)
  district: string;

  @IsString() @MaxLength(120)
  city: string;

  @IsString() @Length(2, 2)
  state: string;

  @IsString() @MaxLength(12)
  zipCode: string;

  @IsOptional() @IsBoolean()
  isDefault?: boolean = false;
}

export class UpdateAddressDto {
  @IsOptional() @IsString() @MaxLength(120)
  street?: string;

  @IsOptional() @IsString() @MaxLength(20)
  number?: string;

  @IsOptional() @IsString() @MaxLength(120)
  complement?: string;

  @IsOptional() @IsString() @MaxLength(120)
  district?: string;

  @IsOptional() @IsString() @MaxLength(120)
  city?: string;

  @IsOptional() @IsString() @Length(2, 2)
  state?: string;

  @IsOptional() @IsString() @MaxLength(12)
  zipCode?: string;

  @IsOptional() @IsBoolean()
  isDefault?: boolean;
}
