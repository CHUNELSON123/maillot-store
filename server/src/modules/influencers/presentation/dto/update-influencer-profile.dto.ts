import { IsEmail, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class UpdateInfluencerProfileDto {
  @IsEmail() @IsOptional() email?: string;
  @IsString() @IsOptional() @MaxLength(80) firstName?: string;
  @IsString() @IsOptional() @MaxLength(80) lastName?: string;
  @IsString() @IsOptional() @MaxLength(32) phone?: string;
  @IsString() @IsOptional() @MaxLength(80) country?: string;
  @IsString() @IsOptional() @MaxLength(80) city?: string;
  @IsString() @IsOptional() @MaxLength(120) occupation?: string;
  @IsString() @IsOptional() @MaxLength(2000) bio?: string;
  @IsString() @IsOptional() @MaxLength(2000) applicationNote?: string;
  @IsUrl({ require_protocol: true }) @IsOptional() instagramUrl?: string;
  @IsUrl({ require_protocol: true }) @IsOptional() tiktokUrl?: string;
  @IsUrl({ require_protocol: true }) @IsOptional() youtubeUrl?: string;
  @IsUrl({ require_protocol: true }) @IsOptional() facebookUrl?: string;
  @IsUrl({ require_protocol: true }) @IsOptional() xUrl?: string;
}
