import {
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Min,
} from 'class-validator';

export class CreateInventoryMovementDto {
  @IsUUID()
  variantId!: string;

  @IsInt()
  @Min(1)
  quantity!: number;

  @IsString()
  @Length(1, 30)
  movementType!: string;

  @IsOptional()
  @IsString()
  @Length(0, 255)
  reference?: string;
}
