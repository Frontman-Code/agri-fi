import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  const usersServiceMock = {
    getProfile: jest.fn(),
    getUserDeals: jest.fn(),
    getUserInvestments: jest.fn(),
  };
  const tradeDealsServiceMock = {
    findByUser: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    tradeDealsServiceMock.findByUser.mockReset();
    controller = new UsersController(
      usersServiceMock as unknown as UsersService,
      tradeDealsServiceMock as any,
    );
  });

  describe('getUserDeals', () => {
    it('returns deals for farmer when role is farmer', async () => {
      const expected = [{ id: 'deal-f-1' }];
      usersServiceMock.getUserDeals.mockResolvedValue(expected);
      tradeDealsServiceMock.findByUser.mockResolvedValue(expected);
    });

    it('returns deals for trader when role is trader and no query role is provided', async () => {
      const expected = [{ id: 'deal-t-1' }];
      usersServiceMock.getUserDeals.mockResolvedValue(expected);
      tradeDealsServiceMock.findByUser.mockResolvedValue(expected);
    });

    it('rejects users who are not farmer/trader', async () => {
      const req = { user: { id: 'investor-1', role: 'investor' } };

      await expect(controller.getUserDeals(req as any)).rejects.toThrow(
        ForbiddenException,
      );
      expect(usersServiceMock.getUserDeals).not.toHaveBeenCalled();
    });

    it('rejects invalid role query values', async () => {
      const req = { user: { id: 'farmer-1', role: 'farmer' } };

      await expect(
        controller.getUserDeals(req as any, 'admin'),
      ).rejects.toThrow(BadRequestException);
      expect(usersServiceMock.getUserDeals).not.toHaveBeenCalled();
    });

    it('rejects role query when it does not match authenticated role', async () => {
      const req = { user: { id: 'farmer-1', role: 'farmer' } };

      await expect(
        controller.getUserDeals(req as any, 'trader'),
      ).rejects.toThrow(ForbiddenException);
      expect(usersServiceMock.getUserDeals).not.toHaveBeenCalled();
    });
  });
});
