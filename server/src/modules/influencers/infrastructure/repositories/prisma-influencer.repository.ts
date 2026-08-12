import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { InfluencerEntity } from '../../domain/entities/influencer.entity';
import { ReferralEntity } from '../../domain/entities/referral.entity';
import {
  CreateInfluencerData,
  CreateReferralData,
  InfluencerRepository,
  UpdateInfluencerData,
  RegisterInfluencerData,
} from '../../domain/repositories/influencer.repository';

@Injectable()
export class PrismaInfluencerRepository implements InfluencerRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateInfluencerData): Promise<InfluencerEntity> {
    const user = await this.prisma.user.findFirst({
      where: {
        id: data.userId,
        deleted_at: null,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existingInfluencer = await this.prisma.influencer.findFirst({
      where: {
        user_id: data.userId,
        deleted_at: null,
      },
    });

    if (existingInfluencer) {
      throw new ConflictException('User is already an influencer');
    }

    const existingCode = await this.prisma.influencer.findFirst({
      where: {
        referral_code: data.referralCode,
      },
    });

    if (existingCode) {
      throw new ConflictException('Referral code already exists');
    }

    const influencer = await this.prisma.influencer.create({
      data: {
        user_id: data.userId,
        referral_code: data.referralCode,
        status: data.status,
        commission_rate: data.commissionRate,
        customer_discount_rate: data.customerDiscountRate ?? 0,
      },
    });

    return this.toInfluencerEntity(influencer);
  }

  async findById(influencerId: string): Promise<InfluencerEntity | null> {
    const influencer = await this.prisma.influencer.findFirst({
      where: {
        id: influencerId,
        deleted_at: null,
      },
    });

    if (!influencer) {
      return null;
    }

    return this.toInfluencerEntity(influencer);
  }

  async findByUserId(userId: string): Promise<InfluencerEntity | null> {
    const influencer = await this.prisma.influencer.findFirst({
      where: {
        user_id: userId,
        deleted_at: null,
      },
    });

    if (!influencer) {
      return null;
    }

    return this.toInfluencerEntity(influencer);
  }

  async findByReferralCode(
    referralCode: string,
  ): Promise<InfluencerEntity | null> {
    const influencer = await this.prisma.influencer.findFirst({
      where: {
        referral_code: referralCode,
        deleted_at: null,
      },
    });

    if (!influencer) {
      return null;
    }

    return this.toInfluencerEntity(influencer);
  }

  async findAll(): Promise<InfluencerEntity[]> {
    const influencers = await this.prisma.influencer.findMany({
      where: {
        deleted_at: null,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return influencers.map((influencer) => this.toInfluencerEntity(influencer));
  }

  async update(
    influencerId: string,
    data: UpdateInfluencerData,
  ): Promise<InfluencerEntity> {
    const existingInfluencer = await this.prisma.influencer.findFirst({
      where: {
        id: influencerId,
        deleted_at: null,
      },
    });

    if (!existingInfluencer) {
      throw new NotFoundException('Influencer not found');
    }

    if (data.referralCode !== undefined) {
      const existingCode = await this.prisma.influencer.findFirst({
        where: {
          referral_code: data.referralCode,
          id: {
            not: influencerId,
          },
        },
      });

      if (existingCode) {
        throw new ConflictException('Referral code already exists');
      }
    }

    const influencer = await this.prisma.influencer.update({
      where: {
        id: influencerId,
      },
      data: {
        ...(data.commissionRate !== undefined && {
          commission_rate: data.commissionRate,
        }),
        ...(data.customerDiscountRate !== undefined && {
          customer_discount_rate: data.customerDiscountRate,
        }),
        ...(data.referralCode !== undefined && {
          referral_code: data.referralCode,
        }),
      },
    });

    return this.toInfluencerEntity(influencer);
  }

  async createReferral(data: CreateReferralData): Promise<ReferralEntity> {
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

    if (influencer.referral_code !== data.referralCode) {
      throw new ConflictException(
        'Referral code does not belong to influencer',
      );
    }

    if (data.orderId !== undefined) {
      const order = await this.prisma.order.findFirst({
        where: {
          id: data.orderId,
          deleted_at: null,
        },
      });

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      const existingReferral = await this.prisma.referral.findFirst({
        where: {
          order_id: data.orderId,
          deleted_at: null,
        },
      });

      if (existingReferral) {
        throw new ConflictException('Order already has a referral');
      }
    }

    const referral = await this.prisma.referral.create({
      data: {
        influencer_id: data.influencerId,
        order_id: data.orderId,
        referral_code: data.referralCode,
        status: data.status,
      },
    });

    return this.toReferralEntity(referral);
  }

  async findReferralsByInfluencer(
    influencerId: string,
  ): Promise<ReferralEntity[]> {
    const influencer = await this.prisma.influencer.findFirst({
      where: {
        id: influencerId,
        deleted_at: null,
      },
    });

    if (!influencer) {
      throw new NotFoundException('Influencer not found');
    }

    const referrals = await this.prisma.referral.findMany({
      where: {
        influencer_id: influencerId,
        deleted_at: null,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return referrals.map((referral) => this.toReferralEntity(referral));
  }

  async findReferralByCode(
    referralCode: string,
  ): Promise<ReferralEntity | null> {
    const referral = await this.prisma.referral.findFirst({
      where: {
        referral_code: referralCode,
        deleted_at: null,
      },
    });

    if (!referral) {
      return null;
    }

    return this.toReferralEntity(referral);
  }

  async register(data: RegisterInfluencerData): Promise<InfluencerEntity> {
    const existingUser = await this.prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    const influencerRole = await this.prisma.role.findUnique({
      where: {
        name: 'Influencer',
      },
    });

    if (!influencerRole) {
      throw new NotFoundException('Influencer role not found');
    }

    const existingReferralCode = await this.prisma.influencer.findFirst({
      where: {
        referral_code: data.referralCode,
      },
    });

    if (existingReferralCode) {
      throw new ConflictException('Referral code already exists');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          password: data.passwordHash,
          role_id: influencerRole.id,
        },
      });

      const influencer = await tx.influencer.create({
        data: {
          user_id: user.id,
          referral_code: data.referralCode,
          status: data.status,
          commission_rate: data.commissionRate,
          customer_discount_rate: data.customerDiscountRate ?? 0,
        },
      });

      return influencer;
    });

    return this.toInfluencerEntity(result);
  }

  async referralCodeExists(referralCode: string): Promise<boolean> {
    const influencer = await this.prisma.influencer.findUnique({
      where: {
        referral_code: referralCode,
      },
      select: {
        id: true,
      },
    });

    return influencer !== null;
  }

  private toInfluencerEntity(influencer: {
    id: string;
    user_id: string;
    referral_code: string;
    status: string;
    commission_rate: unknown;
    customer_discount_rate: unknown;
    created_at: Date;
    updated_at: Date;
  }): InfluencerEntity {
    return new InfluencerEntity(
      influencer.id,
      influencer.user_id,
      influencer.referral_code,
      influencer.status,
      Number(influencer.commission_rate),
      Number(influencer.customer_discount_rate),
      influencer.created_at,
      influencer.updated_at,
    );
  }

  private toReferralEntity(referral: {
    id: string;
    influencer_id: string;
    order_id: string | null;
    referral_code: string;
    status: string;
    created_at: Date;
    updated_at: Date;
  }): ReferralEntity {
    return new ReferralEntity(
      referral.id,
      referral.influencer_id,
      referral.order_id,
      referral.referral_code,
      referral.status,
      referral.created_at,
      referral.updated_at,
    );
  }
}
