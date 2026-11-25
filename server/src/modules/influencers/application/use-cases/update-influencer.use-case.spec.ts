import { BadRequestException } from '@nestjs/common';
import { UpdateInfluencerUseCase } from './update-influencer.use-case';

describe('UpdateInfluencerUseCase application rejection', () => {
  const repository = {
    findById: jest.fn(),
    update: jest.fn(),
    findProfileByUserId: jest.fn(),
  };
  const whatsapp = { notifyInfluencerRejected: jest.fn() };
  const useCase = new UpdateInfluencerUseCase(repository as never, whatsapp as never);

  beforeEach(() => {
    jest.resetAllMocks();
    repository.findById.mockResolvedValue({ status: 'PENDING' });
    repository.update.mockResolvedValue({ userId: 'user-1' });
    repository.findProfileByUserId.mockResolvedValue({ profile: { phone: '+237600000000', firstName: 'Sam' } });
  });

  it('requires a reason before changing status', async () => {
    await expect(useCase.execute('id', { status: 'REJECTED', rejectionReason: ' ' })).rejects.toBeInstanceOf(BadRequestException);
    expect(repository.update).not.toHaveBeenCalled();
  });

  it('saves the reason and sends the rejection without a dashboard link', async () => {
    await useCase.execute('id', { status: 'REJECTED', rejectionReason: '  Incomplete profile  ' });
    expect(repository.update).toHaveBeenCalledWith('id', { status: 'REJECTED', rejectionReason: 'Incomplete profile' });
    expect(whatsapp.notifyInfluencerRejected).toHaveBeenCalledWith('+237600000000', 'Sam', 'Incomplete profile');
  });
});
