import { IsString, Length } from 'class-validator';

export class CreateReferralClickDto {
  @IsString() @Length(3, 64) referralCode!: string;
}
