import { Test, TestingModule } from '@nestjs/testing';
import { RetencionService } from './retencion.service';

describe('RetencionService', () => {
  let service: RetencionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RetencionService],
    }).compile();

    service = module.get<RetencionService>(RetencionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
