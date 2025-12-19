import { Test, TestingModule } from '@nestjs/testing';
import { RetencionController } from './retencion.controller';
import { RetencionService } from './retencion.service';

describe('RetencionController', () => {
  let controller: RetencionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RetencionController],
      providers: [RetencionService],
    }).compile();

    controller = module.get<RetencionController>(RetencionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
