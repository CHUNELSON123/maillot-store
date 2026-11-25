import { IsEmail, IsIn, IsOptional, IsString, IsUUID, Length, Matches } from 'class-validator';

export class NotchCheckoutDto {
  @IsUUID() orderId!: string;
  @IsOptional() @IsString() @Length(64, 128) guestAccessToken?: string;
  @IsOptional() @IsEmail() email?: string;
}

export class MobileMoneyCheckoutDto extends NotchCheckoutDto {
  @IsIn(['mtn', 'orange']) method!: 'mtn' | 'orange';
  @IsString() @Matches(/^\+?237[0-9]{9}$/) phone!: string;
}
