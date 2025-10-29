import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCategoryDto {
  @IsString() @IsNotEmpty() @MaxLength(150)
  name: string;

  @IsOptional() @IsString()
  description?: string;
}

export class UpdateCategoryDto {
  @IsOptional() @IsString() @MaxLength(150)
  name?: string;

  @IsOptional() @IsString()
  description?: string;
}
