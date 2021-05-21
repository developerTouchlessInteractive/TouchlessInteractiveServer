import { Test, TestingModule } from '@nestjs/testing';
import { TmsprivacyController } from './tmsprivacy.controller';

describe('Tmsprivacy Controller', () => {
  let controller: TmsprivacyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TmsprivacyController],
    }).compile();

    controller = module.get<TmsprivacyController>(TmsprivacyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
