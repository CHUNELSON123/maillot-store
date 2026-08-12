import { IsString, Length } from 'class-validator';

export class UpdateOrderStatusDto {
  @IsString()
  @Length(1, 30)
  status!: string;
}
