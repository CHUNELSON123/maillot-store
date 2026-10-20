import { IsDateString, IsEmail, IsNotEmpty, IsString, IsUrl, IsIn, IsBoolean, Equals, IsOptional, MaxLength, MinLength } from 'class-validator';

export class RegisterInfluencerDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsOptional()
  @MinLength(8)
  password?: string;


  @IsString() @IsNotEmpty() @MaxLength(80) firstName!: string;
  @IsString() @IsNotEmpty() @MaxLength(80) lastName!: string;
  @IsString() @IsNotEmpty() @MaxLength(32) phone!: string;
  @IsString() @IsNotEmpty() @MaxLength(80) country!: string;
  @IsDateString() dateOfBirth!: string;
  @IsIn(['FEMALE', 'MALE', 'NON_BINARY', 'PREFER_NOT_TO_SAY']) gender!: string;
  @IsString() @IsNotEmpty() @MaxLength(80) city!: string;
  @IsString() @IsOptional() @MaxLength(120) occupation?: string;
  @IsString() @IsNotEmpty() @MaxLength(2000) bio!: string;
  @IsString() @IsOptional() @MaxLength(2000) applicationNote?: string;
  @IsUrl({ require_protocol: true }) @IsOptional() instagramUrl?: string;
  @IsUrl({ require_protocol: true }) @IsOptional() tiktokUrl?: string;
  @IsUrl({ require_protocol: true }) @IsOptional() youtubeUrl?: string;
  @IsUrl({ require_protocol: true }) @IsOptional() facebookUrl?: string;
  @IsUrl({ require_protocol: true }) @IsOptional() xUrl?: string;
  @IsBoolean() @Equals(true) termsAccepted!: boolean;
}
