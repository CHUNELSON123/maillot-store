import { IsEmail, IsString, Length, MaxLength } from 'class-validator';

export class AdminAuthDto {
  @IsEmail() @MaxLength(254) email!: string;
  @IsString() @Length(8, 200) password!: string;
}
