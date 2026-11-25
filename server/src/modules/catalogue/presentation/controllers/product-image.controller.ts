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
import { storeImage } from '../../../../infrastructure/storage/cloudinary';
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
export class ProductImageController {
  constructor(
    private readonly addProductImageUseCase: AddProductImageUseCase,
    private readonly getProductImagesUseCase: GetProductImagesUseCase,
    private readonly deleteProductImageUseCase: DeleteProductImageUseCase,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrator', 'Staff')
  @UseInterceptors(
    FileInterceptor('image', {
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
      fileFilter: (_req, file, callback) => {
        if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.mimetype)) {
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
    if (!file && !dto.imageUrl) {
      throw new BadRequestException('Upload an image file or provide an image URL');
    }

    return this.addProductImageUseCase.execute({
      productId,
      imageUrl: await storeImage(file || dto.imageUrl!, 'products'),
      altText: dto.altText,
      isPrimary: dto.isPrimary === 'true',
    });
  }

  @Get()
  findAll(@Param('productId') productId: string) {
    return this.getProductImagesUseCase.execute(productId);
  }

  @Delete(':imageId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrator')
  remove(
    @Param('productId') productId: string,
    @Param('imageId') imageId: string,
  ) {
    return this.deleteProductImageUseCase.execute(productId, imageId);
  }
}
