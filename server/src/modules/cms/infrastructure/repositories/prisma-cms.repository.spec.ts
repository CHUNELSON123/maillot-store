jest.mock('../../../../infrastructure/database/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));

import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { PrismaCmsRepository } from './prisma-cms.repository';

describe('PrismaCmsRepository.getPublicContent', () => {
  it('exposes the editable storefront text and preserves the directly edited contact address and hours', async () => {
    const findMany = jest.fn().mockResolvedValue([
      { key: 'cms.about.subtitle', value: 'About subtitle' },
      { key: 'cms.home.hero.tagline', value: 'Banner tagline' },
      { key: 'cms.contact.title', value: 'Contact heading' },
      { key: 'cms.contact.address', value: 'Updated address' },
      { key: 'cms.contact.address_line', value: 'Old street' },
      { key: 'cms.contact.hours', value: 'Updated hours' },
      { key: 'cms.contact.hours.weekdays.open', value: '08:00' },
      { key: 'cms.contact.hours.weekdays.close', value: '17:00' },
    ]);
    const repository = new PrismaCmsRepository({ systemSetting: { findMany } } as unknown as PrismaService);
    const content = await repository.getPublicContent();
    expect(content).toMatchObject({
      'cms.about.subtitle': 'About subtitle',
      'cms.home.hero.tagline': 'Banner tagline',
      'cms.contact.title': 'Contact heading',
      'cms.contact.address': 'Updated address',
      'cms.contact.hours': 'Updated hours',
    });
    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ key: { in: expect.arrayContaining(['cms.about.image', 'cms.about.feature4.description', 'cms.contact.map_title']) } }) }));
  });

  it('retains legacy structured contact settings when direct text has not been saved', async () => {
    const repository = new PrismaCmsRepository({ systemSetting: { findMany: jest.fn().mockResolvedValue([
      { key: 'cms.contact.address_line', value: 'Main street' },
      { key: 'cms.contact.city', value: 'Buea' },
      { key: 'cms.contact.hours.sunday_closed', value: 'true' },
    ]) } } as unknown as PrismaService);
    const content = await repository.getPublicContent();
    expect(content['cms.contact.address']).toBe('Main street, Buea');
    expect(content['cms.contact.hours']).toBe('Sunday: Closed');
  });
});

describe('PrismaCmsRepository.findPromotions', () => {
  it('limits public active promotions to active records within their date range', async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const prisma = {
      promotion: { findMany },
    } as unknown as PrismaService;

    const repository = new PrismaCmsRepository(prisma);
    await repository.findPromotions(true);

    expect(findMany).toHaveBeenCalledWith({
      where: {
        deleted_at: null,
        is_active: true,
        start_date: { lte: expect.any(Date) },
        end_date: { gte: expect.any(Date) },
      },
      orderBy: { created_at: 'desc' },
    });
  });
});
