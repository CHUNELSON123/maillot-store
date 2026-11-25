import {
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @IsUUID()
  categoryId!: string;

  @IsOptional()
  @IsUUID()
  brandId?: string;

  @IsString()
  @Length(2, 200)
  name!: string;

  @IsOptional()
  @IsString()
  @Length(0, 1000)
  description?: string;

  @IsOptional()
  @IsString()
  @Length(1, 30)
  season?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  edition?: string;

  @IsNumber()
  @Min(0)
  price!: number;

  @IsString()
  @Length(1, 50)
  status!: string;
}
