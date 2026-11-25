import { Promotion } from '../types/cms.types';

type ProductTarget = { id: string; brandId: string | null; categoryId: string; price: number };

export function getProductPromotion(product: ProductTarget, promotions: Promotion[]) {
  let best: { promotion: Promotion; discountedPrice: number; discountPercentage: number } | null = null;
  for (const promotion of promotions) {
    const applies = promotion.targetType === 'ALL'
      || (promotion.targetType === 'PRODUCT' && promotion.targetIds.includes(product.id))
      || (promotion.targetType === 'BRAND' && product.brandId !== null && promotion.targetIds.includes(product.brandId))
      || (promotion.targetType === 'CATEGORY' && promotion.targetIds.includes(product.categoryId));
    if (!applies || !Number.isFinite(promotion.discountValue) || promotion.discountValue <= 0) continue;
    const percentage = promotion.discountType.toUpperCase() === 'PERCENTAGE' || promotion.discountType.toUpperCase() === 'PERCENT';
    const discountedPrice = Math.max(0, Math.round((percentage
      ? product.price * (1 - Math.min(100, promotion.discountValue) / 100)
      : product.price - promotion.discountValue) * 100) / 100);
    if (!best || discountedPrice < best.discountedPrice) {
      best = {
        promotion,
        discountedPrice,
        discountPercentage: product.price > 0 ? Math.round((1 - discountedPrice / product.price) * 100) : 0,
      };
    }
  }
  return best;
}

export function promotionAppliesToProduct(product: Pick<ProductTarget, 'id' | 'brandId' | 'categoryId'>, promotion: Promotion) {
  return promotion.targetType === 'ALL'
    || (promotion.targetType === 'PRODUCT' && promotion.targetIds.includes(product.id))
    || (promotion.targetType === 'BRAND' && product.brandId !== null && promotion.targetIds.includes(product.brandId))
    || (promotion.targetType === 'CATEGORY' && promotion.targetIds.includes(product.categoryId));
}
