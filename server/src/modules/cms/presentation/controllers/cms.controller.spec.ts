import { GUARDS_METADATA } from '@nestjs/common/constants';
import { ROLES_KEY } from '../../../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { CmsController } from './cms.controller';

describe('CmsController public reads and management access', () => {
  it('exposes only active banners and promotions through public reads', () => {
    const getBannersUseCase = { execute: jest.fn().mockReturnValue([]) };
    const getPromotionsUseCase = { execute: jest.fn().mockReturnValue([]) };
    const controller = new CmsController(
      {} as never,
      getBannersUseCase as never,
      {} as never,
      {} as never,
      {} as never,
      getPromotionsUseCase as never,
      {} as never,
      {} as never,
    );

    controller.getPublicBanners();
    controller.getPublicPromotions();

    expect(getBannersUseCase.execute).toHaveBeenCalledWith(true);
    expect(getPromotionsUseCase.execute).toHaveBeenCalledWith(true);
  });

  it('keeps existing CMS reads and writes authenticated and role-restricted', () => {
    const publicReadGuards = Reflect.getMetadata(
      GUARDS_METADATA,
      CmsController.prototype.getPublicBanners,
    );
    expect(publicReadGuards).toBeUndefined();

    for (const handler of [
      CmsController.prototype.getBanners,
      CmsController.prototype.getPromotions,
      CmsController.prototype.createBanner,
      CmsController.prototype.updateBanner,
      CmsController.prototype.deleteBanner,
      CmsController.prototype.createPromotion,
      CmsController.prototype.updatePromotion,
      CmsController.prototype.deletePromotion,
    ]) {
      expect(Reflect.getMetadata(GUARDS_METADATA, handler)).toEqual([
        JwtAuthGuard,
        RolesGuard,
      ]);
    }

    expect(
      Reflect.getMetadata(ROLES_KEY, CmsController.prototype.createBanner),
    ).toEqual(['Administrator', 'Staff']);
    expect(
      Reflect.getMetadata(ROLES_KEY, CmsController.prototype.getBanners),
    ).toEqual(['Administrator', 'Staff', 'Customer']);
  });
});
