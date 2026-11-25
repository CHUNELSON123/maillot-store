import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsInt, IsOptional, IsString, Length, Min, ValidateNested } from 'class-validator';

export class InventoryImportRowDto {
  @IsString()
  @Length(1, 80)
  sku!: string;

  @IsInt()
  @Min(0)
  quantity!: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  minStock?: number;
}

export class ImportInventoryDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(1000)
  @ValidateNested({ each: true })
  @Type(() => InventoryImportRowDto)
  rows!: InventoryImportRowDto[];
}
