import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { AddProductImageUseCase } from '../../application/use-cases/add-product-image.use-case';
import { GetProductImagesUseCase } from '../../application/use-cases/get-product-images.use-case';
import { DeleteProductImageUseCase } from '../../application/use-cases/delete-product-image.use-case';
import { AddProductImageDto } from '../dto/add-product-image.dto';

@Controller({
  path: 'products/:productId/images',
  version: '1',
})
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductImageController {
  constructor(
    private readonly addProductImageUseCase: AddProductImageUseCase,
    private readonly getProductImagesUseCase: GetProductImagesUseCase,
    private readonly deleteProductImageUseCase: DeleteProductImageUseCase,
  ) {}

  @Post()
  @Roles('Administrator', 'Staff')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/products',
        filename: (_req, file, callback) => {
          const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname)}`;
          callback(null, uniqueName);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
      fileFilter: (_req, file, callback) => {
        if (!file.mimetype.startsWith('image/')) {
          callback(
            new BadRequestException('Only image files are allowed'),
            false,
          );
          return;
        }

        callback(null, true);
      },
    }),
  )
  async create(
    @Param('productId') productId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: AddProductImageDto,
  ) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    return this.addProductImageUseCase.execute({
      productId,
      imageUrl: `/uploads/products/${file.filename}`,
      altText: dto.altText,
      isPrimary: dto.isPrimary === 'true',
    });
  }

  @Get()
  @Roles('Administrator', 'Staff', 'Customer', 'Influencer')
  findAll(@Param('productId') productId: string) {
    return this.getProductImagesUseCase.execute(productId);
  }

  @Delete(':imageId')
  @Roles('Administrator')
  remove(
    @Param('productId') productId: string,
    @Param('imageId') imageId: string,
  ) {
    return this.deleteProductImageUseCase.execute(productId, imageId);
  }
}
