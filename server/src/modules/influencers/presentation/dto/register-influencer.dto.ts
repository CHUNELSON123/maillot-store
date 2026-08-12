import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterInfluencerDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password!: string;
}
