import {
  IsArray,
  IsDateString,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class CreatePurchaseItemDto {
  @IsUUID()
  variantId!: string;

  @IsNumber()
  @IsPositive()
  quantity!: number;

  @IsNumber()
  @IsPositive()
  unitCost!: number;
}

export class CreatePurchaseDto {
  @IsUUID()
  supplierId!: string;

  @IsString()
  purchaseNumber!: string;

  @IsOptional()
  @IsDateString()
  purchaseDate?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseItemDto)
  items!: CreatePurchaseItemDto[];
}
