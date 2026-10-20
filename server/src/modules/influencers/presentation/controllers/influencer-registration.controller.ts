import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { OptionalJwtAuthGuard } from '../../../../common/guards/optional-jwt-auth.guard';

import { RegisterInfluencerUseCase } from '../../application/use-cases/register-influencer.use-case';
import { RegisterInfluencerDto } from '../dto/register-influencer.dto';

@Controller({
  path: 'influencers',
  version: '1',
})
export class InfluencerRegistrationController {
  constructor(
    private readonly registerInfluencerUseCase: RegisterInfluencerUseCase,
  ) {}

  @Post('register')
  @UseGuards(OptionalJwtAuthGuard)
  register(@Body() dto: RegisterInfluencerDto, @Req() request: Request) {
    const existingUserId = (request as Request & { user?: { id: string } | null }).user?.id;
    return this.registerInfluencerUseCase.execute({
      existingUserId,
      email: dto.email,
      password: dto.password,
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone,
      country: dto.country,
      dateOfBirth: new Date(dto.dateOfBirth),
      gender: dto.gender,
      city: dto.city,
      occupation: dto.occupation ?? '',
      bio: dto.bio,
      applicationNote: dto.applicationNote ?? '',
      instagramUrl: dto.instagramUrl,
      tiktokUrl: dto.tiktokUrl,
      youtubeUrl: dto.youtubeUrl,
      facebookUrl: dto.facebookUrl,
      xUrl: dto.xUrl,
      termsAcceptedAt: new Date(),
    });
  }
}
