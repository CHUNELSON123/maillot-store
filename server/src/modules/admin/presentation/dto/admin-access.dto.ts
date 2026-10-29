import { IsArray, IsBoolean, IsEmail, IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class UpdateAdminUserDto {
  @IsOptional() @IsUUID() roleId?: string;
  @IsOptional() @IsBoolean() active?: boolean;
}

export class CreateAdminUserDto {
  @IsEmail() email!: string;
  @IsString() @Length(8, 200) password!: string;
  @IsUUID() roleId!: string;
  @IsOptional() @IsString() firstName?: string;
  @IsOptional() @IsString() lastName?: string;
  @IsOptional() @IsString() phone?: string;
}

export class CreateAdminRoleDto {
  @IsString() @Length(2, 80) name!: string;
  @IsArray() @IsUUID('4', { each: true }) permissionIds!: string[];
}

export class UpdateAdminRoleDto {
  @IsOptional() @IsString() @Length(2, 80) name?: string;
  @IsOptional() @IsArray() @IsUUID('4', { each: true }) permissionIds?: string[];
}

export class UpdateAdminSettingDto {
  @IsString() value!: string;
  @IsOptional() @IsString() description?: string;
}
