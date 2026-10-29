import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { InfluencerEntity, InfluencerProfileData } from '../../domain/entities/influencer.entity';
import { ReferralEntity } from '../../domain/entities/referral.entity';
import {
  CreateInfluencerData,
  CreateReferralData,
  InfluencerRepository,
  UpdateInfluencerData,
  RegisterInfluencerData,
  UpdateInfluencerProfileData,
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

  async findProfileByUserId(userId: string): Promise<InfluencerEntity | null> {
    const influencer = await this.prisma.influencer.findFirst({
      where: { user_id: userId, deleted_at: null },
      include: { user: { select: { email: true } } },
    });

    if (!influencer) return null;

    return this.toInfluencerEntity(influencer, {
      email: influencer.user.email,
      firstName: influencer.first_name,
      lastName: influencer.last_name,
      phone: influencer.phone,
      country: influencer.country,
      dateOfBirth: influencer.date_of_birth,
      gender: influencer.gender,
      city: influencer.city,
      occupation: influencer.occupation,
      bio: influencer.bio,
      applicationNote: influencer.application_note,
      instagramUrl: influencer.instagram_url,
      tiktokUrl: influencer.tiktok_url,
      youtubeUrl: influencer.youtube_url,
      facebookUrl: influencer.facebook_url,
      xUrl: influencer.x_url,
      profilePictureUrl: influencer.profile_picture_url,
      termsAcceptedAt: influencer.terms_accepted_at,
    });
  }

  async updateProfileByUserId(
    userId: string,
    data: UpdateInfluencerProfileData,
  ): Promise<InfluencerEntity> {
    const existing = await this.prisma.influencer.findFirst({
      where: { user_id: userId, deleted_at: null },
    });
    if (!existing) throw new NotFoundException('Influencer not found');

    const updated = await this.prisma.$transaction(async (tx) => {
      if (data.email !== undefined) {
        await tx.user.update({ where: { id: userId }, data: { email: data.email } });
      }
      return tx.influencer.update({
        where: { id: existing.id },
        data: {
          ...(data.firstName !== undefined && { first_name: data.firstName }),
          ...(data.lastName !== undefined && { last_name: data.lastName }),
          ...(data.phone !== undefined && { phone: data.phone }),
          ...(data.country !== undefined && { country: data.country }),
          ...(data.city !== undefined && { city: data.city }),
          ...(data.occupation !== undefined && { occupation: data.occupation }),
          ...(data.bio !== undefined && { bio: data.bio }),
          ...(data.applicationNote !== undefined && { application_note: data.applicationNote }),
          ...(data.instagramUrl !== undefined && { instagram_url: data.instagramUrl }),
          ...(data.tiktokUrl !== undefined && { tiktok_url: data.tiktokUrl }),
          ...(data.youtubeUrl !== undefined && { youtube_url: data.youtubeUrl }),
          ...(data.facebookUrl !== undefined && { facebook_url: data.facebookUrl }),
          ...(data.xUrl !== undefined && { x_url: data.xUrl }),
          ...(data.profilePictureUrl !== undefined && { profile_picture_url: data.profilePictureUrl }),
        },
        include: { user: { select: { email: true } } },
      });
    });
    return this.toInfluencerEntity(updated, { email: updated.user.email });
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
      include: { user: { select: { email: true } } },
    });

    return influencers.map((influencer) => this.toInfluencerEntity(influencer, {
      email: influencer.user.email,
      firstName: influencer.first_name,
      lastName: influencer.last_name,
      phone: influencer.phone,
      country: influencer.country,
      city: influencer.city,
      occupation: influencer.occupation,
      instagramUrl: influencer.instagram_url,
      tiktokUrl: influencer.tiktok_url,
      youtubeUrl: influencer.youtube_url,
      facebookUrl: influencer.facebook_url,
      xUrl: influencer.x_url,
    }));
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
        ...(data.status !== undefined && { status: data.status }),
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
      include: {
        order: {
          include: {
            customer: { select: { id: true } },
            items: { include: { variant: { include: { product: { select: { name: true } } } } } },
          },
        },
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
    const existingEmailUser = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existingEmailUser && existingEmailUser.id !== data.userId) {
      throw new ConflictException('Email is already registered to another account');
    }
    const existingUser = data.userId
      ? await this.prisma.user.findFirst({
          where: { id: data.userId, deleted_at: null },
          include: { role: true, influencer: true },
        })
      : null;
    if (data.userId && !existingUser) throw new NotFoundException('Authenticated user not found');
    if (existingUser && existingUser.role.name !== 'Customer' && existingUser.role.name !== 'Influencer') {
      throw new ConflictException('Only customer accounts can apply to the influencer program');
    }
    if (existingUser?.influencer) throw new ConflictException('An influencer application already exists for this account');
    if (!data.userId && !data.passwordHash) throw new ConflictException('Password is required for a new account');

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
      const user = existingUser
        ? await tx.user.update({
            where: { id: existingUser.id },
            data: { email: data.email, role_id: influencerRole.id },
          })
        : await tx.user.create({
            data: {
              email: data.email,
              password: data.passwordHash!,
              role_id: influencerRole.id,
            },
          });

      if (existingUser) {
        await tx.customer.updateMany({
          where: { user_id: existingUser.id, deleted_at: null },
          data: { first_name: data.firstName, last_name: data.lastName, phone: data.phone },
        });
      } else {
        await tx.customer.create({
          data: {
            user_id: user.id,
            first_name: data.firstName,
            last_name: data.lastName,
            phone: data.phone,
          },
        });
      }

      const influencer = await tx.influencer.create({
        data: {
          user_id: user.id,
          referral_code: data.referralCode,
          status: data.status,
          commission_rate: data.commissionRate,
          customer_discount_rate: data.customerDiscountRate ?? 0,
          first_name: data.firstName,
          last_name: data.lastName,
          phone: data.phone,
          country: data.country,
          date_of_birth: data.dateOfBirth,
          gender: data.gender,
          city: data.city,
          occupation: data.occupation,
          bio: data.bio,
          application_note: data.applicationNote,
          instagram_url: data.instagramUrl ?? null,
          tiktok_url: data.tiktokUrl ?? null,
          youtube_url: data.youtubeUrl ?? null,
          facebook_url: data.facebookUrl ?? null,
          x_url: data.xUrl ?? null,
          terms_accepted_at: data.termsAcceptedAt,
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

  async createReferralClick(referralCode: string, tokenHash: string): Promise<void> {
    const influencer = await this.prisma.influencer.findFirst({
      where: { referral_code: referralCode, status: 'ACTIVE', deleted_at: null },
      select: { id: true },
    });
    if (!influencer) throw new NotFoundException('Active referral code not found');
    await this.prisma.referral.create({
      data: { influencer_id: influencer.id, referral_code: referralCode, status: 'CLICKED', attribution_token_hash: tokenHash },
    });
  }

  async approve(influencerId: string): Promise<InfluencerEntity> {
    const existingInfluencer = await this.prisma.influencer.findFirst({
      where: {
        id: influencerId,
        deleted_at: null,
      },
    });

    if (!existingInfluencer) {
      throw new NotFoundException('Influencer not found');
    }

    if (existingInfluencer.status === 'ACTIVE') {
      throw new ConflictException('Influencer is already active');
    }

    if (existingInfluencer.status !== 'PENDING') {
      throw new ConflictException('Only pending influencers can be approved');
    }

    const influencer = await this.prisma.influencer.update({
      where: {
        id: influencerId,
      },
      data: {
        status: 'ACTIVE',
      },
    });

    return this.toInfluencerEntity(influencer);
  }

  async findReferralById(referralId: string): Promise<ReferralEntity | null> {
    const referral = await this.prisma.referral.findFirst({
      where: {
        id: referralId,
        deleted_at: null,
      },
    });

    if (!referral) {
      return null;
    }

    return this.toReferralEntity(referral);
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
  }, profile: InfluencerProfileData = {}): InfluencerEntity {
    return new InfluencerEntity(
      influencer.id,
      influencer.user_id,
      influencer.referral_code,
      influencer.status,
      Number(influencer.commission_rate),
      Number(influencer.customer_discount_rate),
      influencer.created_at,
      influencer.updated_at,
      profile,
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
    order?: {
      order_number: string;
      status: string;
      total_amount: unknown;
      guest_name: string | null;
      customer: { id: string } | null;
      items: { variant: { product: { name: string } } }[];
    } | null;
  }): ReferralEntity {
    return new ReferralEntity(
      referral.id,
      referral.influencer_id,
      referral.order_id,
      referral.referral_code,
      referral.status,
      referral.created_at,
      referral.updated_at,
      referral.order?.order_number ?? null,
      referral.order?.status ?? null,
      referral.order ? Number(referral.order.total_amount) : null,
      referral.order?.guest_name ? 'Guest' : referral.order?.customer ? 'Customer' : null,
      referral.order?.items.map((item) => item.variant.product.name) ?? [],
    );
  }
}
