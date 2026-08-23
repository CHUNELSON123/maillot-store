import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { SupplierEntity } from '../../domain/entities/supplier.entity';
import {
  CreateSupplierData,
  SupplierRepository,
  UpdateSupplierData,
} from '../../domain/repositories/supplier.repository';

@Injectable()
export class PrismaSupplierRepository implements SupplierRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateSupplierData): Promise<SupplierEntity> {
    const existingSupplier = await this.prisma.supplier.findFirst({
      where: {
        name: data.name.trim(),
        deleted_at: null,
      },
    });

    if (existingSupplier) {
      throw new ConflictException('Supplier already exists');
    }

    const supplier = await this.prisma.supplier.create({
      data: {
        name: data.name.trim(),
        phone: data.phone?.trim(),
        email: data.email?.trim(),
        address: data.address?.trim(),
      },
    });

    return this.toEntity(supplier);
  }

  async findById(supplierId: string): Promise<SupplierEntity | null> {
    const supplier = await this.prisma.supplier.findFirst({
      where: {
        id: supplierId,
        deleted_at: null,
      },
    });

    if (!supplier) {
      return null;
    }

    return this.toEntity(supplier);
  }

  async findAll(): Promise<SupplierEntity[]> {
    const suppliers = await this.prisma.supplier.findMany({
      where: {
        deleted_at: null,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return suppliers.map((supplier) => this.toEntity(supplier));
  }

  async update(
    supplierId: string,
    data: UpdateSupplierData,
  ): Promise<SupplierEntity> {
    const existingSupplier = await this.prisma.supplier.findFirst({
      where: {
        id: supplierId,
        deleted_at: null,
      },
    });

    if (!existingSupplier) {
      throw new NotFoundException('Supplier not found');
    }

    if (data.name !== undefined) {
      const duplicate = await this.prisma.supplier.findFirst({
        where: {
          name: data.name.trim(),
          id: {
            not: supplierId,
          },
          deleted_at: null,
        },
      });

      if (duplicate) {
        throw new ConflictException('Supplier already exists');
      }
    }

    const supplier = await this.prisma.supplier.update({
      where: {
        id: supplierId,
      },
      data: {
        ...(data.name !== undefined && {
          name: data.name.trim(),
        }),
        ...(data.phone !== undefined && {
          phone: data.phone.trim(),
        }),
        ...(data.email !== undefined && {
          email: data.email.trim(),
        }),
        ...(data.address !== undefined && {
          address: data.address.trim(),
        }),
      },
    });

    return this.toEntity(supplier);
  }

  private toEntity(supplier: {
    id: string;
    name: string;
    phone: string | null;
    email: string | null;
    address: string | null;
    created_at: Date;
    updated_at: Date;
  }): SupplierEntity {
    return new SupplierEntity(
      supplier.id,
      supplier.name,
      supplier.phone,
      supplier.email,
      supplier.address,
      supplier.created_at,
      supplier.updated_at,
    );
  }
}
