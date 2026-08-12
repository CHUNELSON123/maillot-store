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

  @IsUUID()
  brandId!: string;

  @IsString()
  @Length(2, 200)
  name!: string;

  @IsOptional()
  @IsString()
  @Length(0, 1000)
  description?: string;

  @IsNumber()
  @Min(0)
  price!: number;

  @IsString()
  @Length(1, 50)
  status!: string;
}
