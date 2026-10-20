import { IsString, Length } from 'class-validator';

export class GuestOrderConfirmationDto {
  @IsString()
  @Length(64, 128)
  guestAccessToken!: string;
}
