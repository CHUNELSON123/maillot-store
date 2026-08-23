import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { CommissionEntity } from '../../domain/entities/commission.entity';
import {
  CommissionRepository,
  CreateCommissionData,
} from '../../domain/repositories/commission.repository';

@Injectable()
export class PrismaCommissionRepository implements CommissionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateCommissionData): Promise<CommissionEntity> {
    const influencer = await this.prisma.influencer.findFirst({
      where: {
        id: data.influencerId,
        deleted_at: null,
      },
    });

    if (!influencer) {
      throw new NotFoundException('Influencer not found');
    }

    if (influencer.status !== 'ACTIVE') {
      throw new ConflictException('Influencer is not active');
    }

    if (data.referralId) {
      const referral = await this.prisma.referral.findFirst({
        where: {
          id: data.referralId,
          deleted_at: null,
        },
      });

      if (!referral) {
        throw new NotFoundException('Referral not found');
      }

      if (referral.influencer_id !== data.influencerId) {
        throw new ConflictException('Referral does not belong to influencer');
      }

      const existingCommission = await this.prisma.commission.findFirst({
        where: {
          referral_id: data.referralId,
          deleted_at: null,
        },
      });

      if (existingCommission) {
        throw new ConflictException(
          'Commission already exists for this referral',
        );
      }
    }

    const commission = await this.prisma.commission.create({
      data: {
        influencer_id: data.influencerId,
        referral_id: data.referralId,
        amount: data.amount,
        status: data.status,
      },
    });

    return this.toEntity(commission);
  }

  async findById(commissionId: string): Promise<CommissionEntity | null> {
    const commission = await this.prisma.commission.findFirst({
      where: {
        id: commissionId,
        deleted_at: null,
      },
    });

    if (!commission) {
      return null;
    }

    return this.toEntity(commission);
  }

  async findByInfluencer(influencerId: string): Promise<CommissionEntity[]> {
    const commissions = await this.prisma.commission.findMany({
      where: {
        influencer_id: influencerId,
        deleted_at: null,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return commissions.map((commission) => this.toEntity(commission));
  }

  async findByReferral(referralId: string): Promise<CommissionEntity | null> {
    const commission = await this.prisma.commission.findFirst({
      where: {
        referral_id: referralId,
        deleted_at: null,
      },
    });

    if (!commission) {
      return null;
    }

    return this.toEntity(commission);
  }

  async updateStatus(
    commissionId: string,
    status: string,
  ): Promise<CommissionEntity> {
    const existingCommission = await this.prisma.commission.findFirst({
      where: {
        id: commissionId,
        deleted_at: null,
      },
    });

    if (!existingCommission) {
      throw new NotFoundException('Commission not found');
    }

    const commission = await this.prisma.commission.update({
      where: {
        id: commissionId,
      },
      data: {
        status,
      },
    });

    return this.toEntity(commission);
  }

  private toEntity(commission: {
    id: string;
    influencer_id: string;
    referral_id: string | null;
    amount: unknown;
    status: string;
    created_at: Date;
    updated_at: Date;
  }): CommissionEntity {
    return new CommissionEntity(
      commission.id,
      commission.influencer_id,
      commission.referral_id,
      Number(commission.amount),
      commission.status,
      commission.created_at,
      commission.updated_at,
    );
  }
}
