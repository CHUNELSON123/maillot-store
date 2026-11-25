import { NotFoundException } from '@nestjs/common';
import { DeleteProductUseCase } from './delete-product.use-case';

describe('DeleteProductUseCase', () => {
  it('soft-deletes an existing product, preserving historical records', async () => {
    const repository = { findById: jest.fn().mockResolvedValue({ id: 'product-1' }), softDelete: jest.fn().mockResolvedValue(undefined) };
    const result = await new DeleteProductUseCase(repository as never).execute('product-1');
    expect(repository.softDelete).toHaveBeenCalledWith('product-1');
    expect(result.message).toBe('Product deleted successfully');
  });
  it('does not delete a product that is not found', async () => {
    const repository = { findById: jest.fn().mockResolvedValue(null), softDelete: jest.fn() };
    await expect(new DeleteProductUseCase(repository as never).execute('missing')).rejects.toBeInstanceOf(NotFoundException);
    expect(repository.softDelete).not.toHaveBeenCalled();
  });
});
