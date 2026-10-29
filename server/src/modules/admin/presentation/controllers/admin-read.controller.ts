import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { GetAdminRecordsUseCase } from '../../application/use-cases/get-admin-records.use-case';
import { AdminListQueryDto } from '../dto/admin-list-query.dto';
import { CreateAdminRoleDto, CreateAdminUserDto, UpdateAdminRoleDto, UpdateAdminSettingDto, UpdateAdminUserDto } from '../dto/admin-access.dto';
import { CreateAdminUserUseCase } from '../../application/use-cases/create-admin-user.use-case';

interface AdminRequest { user: { id: string } }

@Controller({ path: 'admin', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Administrator', 'Staff')
export class AdminReadController {
  constructor(private readonly records: GetAdminRecordsUseCase, private readonly createAdminUser: CreateAdminUserUseCase) {}

  @Get('orders') orders(@Query() query: AdminListQueryDto) { return this.records.orders(query); }
  @Get('payments') payments(@Query() query: AdminListQueryDto) { return this.records.payments(query); }
  @Get('deliveries') deliveries(@Query() query: AdminListQueryDto) { return this.records.deliveries(query); }
  @Get('customers') customers(@Query() query: AdminListQueryDto) { return this.records.customers(query); }
  @Get('customers/:id') customer(@Param('id') id: string) { return this.records.customer(id); }
  @Get('users') @Roles('Administrator') users(@Query() query: AdminListQueryDto) { return this.records.users(query); }
  @Get('inventory') inventory(@Query() query: AdminListQueryDto) { return this.records.inventory(query); }
  @Get('audit-logs') @Roles('Administrator') auditLogs(@Query() query: AdminListQueryDto) { return this.records.auditLogs(query); }
  @Get('settings') @Roles('Administrator') settings() { return this.records.settings(); }
  @Get('roles') @Roles('Administrator') roles() { return this.records.roles(); }
  @Get('permissions') @Roles('Administrator') permissions() { return this.records.permissions(); }
  @Patch('users/:id') @Roles('Administrator') updateUser(@Param('id') id: string, @Body() dto: UpdateAdminUserDto, @Req() request: AdminRequest) { return this.records.updateUser(id, dto, request.user.id); }
  @Post('users') @Roles('Administrator') createUser(@Body() dto: CreateAdminUserDto, @Req() request: AdminRequest) { return this.createAdminUser.execute(dto, request.user.id); }
  @Post('roles') @Roles('Administrator') createRole(@Body() dto: CreateAdminRoleDto, @Req() request: AdminRequest) { return this.records.createRole(dto, request.user.id); }
  @Patch('roles/:id') @Roles('Administrator') updateRole(@Param('id') id: string, @Body() dto: UpdateAdminRoleDto, @Req() request: AdminRequest) { return this.records.updateRole(id, dto, request.user.id); }
  @Patch('settings/:key') @Roles('Administrator') updateSetting(@Param('key') key: string, @Body() dto: UpdateAdminSettingDto, @Req() request: AdminRequest) { return this.records.upsertSetting(key, dto.value, dto.description, request.user.id); }
}
