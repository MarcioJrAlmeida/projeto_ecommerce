import { Type } from 'class-transformer';
import { IsBooleanString, IsInt, IsOptional, IsPositive, IsString, Min } from 'class-validator';

export class ProductQueryDto {
  @IsOptional() 
  @IsString()
  search?: string;          // nome contém

  @Type(() => Number)
  @IsOptional() 
  @IsInt() 
  @IsPositive()
  categoryId?: number;

  @IsOptional() 
  @IsString()
  minPrice?: string;        // "100.00"

  @IsOptional() 
  @IsString()
  maxPrice?: string;

  @IsOptional() 
  @IsBooleanString()
  active?: string;          // "true" | "false"

  @Type(() => Number)
  @IsOptional() 
  @IsInt() 
  @Min(1)
  page?: number = 1;

  @Type(() => Number)
  @IsOptional() 
  @IsInt() 
  @Min(1)
  limit?: number = 10;

  // ex.: "price:asc", "name:desc"
  @IsOptional() 
  @IsString()
  sort?: string;
}
