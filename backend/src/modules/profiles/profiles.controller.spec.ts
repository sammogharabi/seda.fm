import { Test, TestingModule } from '@nestjs/testing';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateGenresDto } from './dto/update-genres.dto';

describe('ProfilesController - Genres Onboarding', () => {
  let controller: ProfilesController;
  let service: ProfilesService;

  const mockUserId = 'test-user-123';
  const mockRequest = { user: { id: mockUserId } };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfilesController],
      providers: [
        {
          provide: ProfilesService,
          useValue: {
            updateGenres: jest.fn(),
            getOnboardingStatus: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ProfilesController>(ProfilesController);
    service = module.get<ProfilesService>(ProfilesService);
  });

  describe('updateGenres', () => {
    it('should update genres and return 201 for first time completion', async () => {
      const dto: UpdateGenresDto = {
        genres: ['Electronic', 'Hip-Hop', 'Jazz'],
      };

      const mockResult = {
        profile: {
          id: 'profile-123',
          userId: mockUserId,
          username: 'test-user',
          displayName: 'Test User',
          bio: null,
          avatarUrl: null,
          genres: dto.genres,
          genresCompleted: true,
          genresCompletedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        isFirstTimeCompletion: true,
        statusCode: 201,
      };

      jest.spyOn(service, 'updateGenres').mockResolvedValue(mockResult);

      const result = await controller.updateGenres(mockRequest, dto);

      expect(service.updateGenres).toHaveBeenCalledWith(mockUserId, dto.genres);
      expect(result).toEqual(mockResult);
    });

    it('should update genres and return 200 for subsequent updates', async () => {
      const dto: UpdateGenresDto = {
        genres: ['Rock', 'Pop', 'Alternative'],
      };

      const mockResult = {
        profile: {
          id: 'profile-123',
          userId: mockUserId,
          username: 'test-user',
          displayName: 'Test User',
          bio: null,
          avatarUrl: null,
          genres: dto.genres,
          genresCompleted: true,
          genresCompletedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        isFirstTimeCompletion: false,
        statusCode: 200,
      };

      jest.spyOn(service, 'updateGenres').mockResolvedValue(mockResult);

      const result = await controller.updateGenres(mockRequest, dto);

      expect(service.updateGenres).toHaveBeenCalledWith(mockUserId, dto.genres);
      expect(result).toEqual(mockResult);
    });
  });

  describe('getOnboardingStatus', () => {
    it('should return onboarding status', async () => {
      const mockStatus = {
        genresCompleted: false,
        genresCompletedAt: null,
        shouldShowGenresStep: true,
      };

      jest.spyOn(service, 'getOnboardingStatus').mockResolvedValue(mockStatus);

      const result = await controller.getOnboardingStatus(mockRequest);

      expect(service.getOnboardingStatus).toHaveBeenCalledWith(mockUserId);
      expect(result).toEqual(mockStatus);
    });

    it('should return completed status for users who finished onboarding', async () => {
      const mockStatus = {
        genresCompleted: true,
        genresCompletedAt: new Date('2024-01-01T00:00:00.000Z'),
        shouldShowGenresStep: false,
      };

      jest.spyOn(service, 'getOnboardingStatus').mockResolvedValue(mockStatus);

      const result = await controller.getOnboardingStatus(mockRequest);

      expect(service.getOnboardingStatus).toHaveBeenCalledWith(mockUserId);
      expect(result).toEqual(mockStatus);
    });
  });
});
