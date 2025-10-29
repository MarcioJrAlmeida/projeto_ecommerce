import { IsBoolean, IsInt, IsNotEmpty, IsNumberString, IsOptional, IsPositive, IsString, MaxLength, IsUrl } from 'class-validator';

export class CreateProductDto {
  @IsString() @IsNotEmpty() @MaxLength(180)
  name: string;

  @IsOptional() @IsString()
  description?: string;

  @IsNumberString()
  price: string;

  @IsInt() @IsPositive()
  stock: number;

  @IsOptional() @IsBoolean()
  active?: boolean = true;

  @IsOptional() @IsUrl()
  imageUrl?: string;

  @IsInt()
  categoryId: number;
}

export class UpdateProductDto {
  @IsOptional() @IsString() @MaxLength(180)
  name?: string;

  @IsOptional() @IsString()
  description?: string;

  @IsOptional() @IsNumberString()
  price?: string;

  @IsOptional() @IsInt()
  stock?: number;

  @IsOptional() @IsBoolean()
  active?: boolean;

  @IsOptional() @IsUrl()
  imageUrl?: string;

  @IsOptional() @IsInt()
  categoryId?: number;
}
