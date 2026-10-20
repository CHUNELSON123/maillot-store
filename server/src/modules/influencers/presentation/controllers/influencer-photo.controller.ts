import { BadRequestException, Controller, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { Request } from 'express';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { getUploadsDirectory } from '../../../../infrastructure/storage/uploads-directory';
import { UpdateInfluencerProfileUseCase } from '../../application/use-cases/update-influencer-profile.use-case';

interface AuthenticatedRequest extends Request { user: { id: string }; }

@Controller({ path: 'influencers/me', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Influencer')
export class InfluencerPhotoController {
  constructor(private readonly updateProfile: UpdateInfluencerProfileUseCase) {}

  @Post('photo')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: (_req, _file, callback) => {
        const directory = join(getUploadsDirectory(), 'influencers');
        mkdirSync(directory, { recursive: true });
        callback(null, directory);
      },
      filename: (_req, file, callback) => callback(null, `${randomUUID()}${({ 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' } as Record<string, string>)[file.mimetype] ?? '.img'}`),
    }),
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (_req, file, callback) => {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
        callback(new BadRequestException('Choose a JPG, PNG, or WebP image'), false);
        return;
      }
      callback(null, true);
    },
  }))
  upload(@Req() request: AuthenticatedRequest, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Profile image is required');
    return this.updateProfile.execute(request.user.id, {
      profilePictureUrl: `/uploads/influencers/${file.filename}`,
    });
  }
}
