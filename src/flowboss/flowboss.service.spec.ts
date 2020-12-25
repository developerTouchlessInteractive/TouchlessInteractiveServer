import { Test, TestingModule } from '@nestjs/testing';
import { FlowbossService } from './flowboss.service';

describe('FlowbossService', () => {
  let service: FlowbossService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FlowbossService],
    }).compile();

    service = module.get<FlowbossService>(FlowbossService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
