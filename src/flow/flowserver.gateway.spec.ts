import { Test, TestingModule } from '@nestjs/testing';
import { LoggerModule } from '../logger/logger.module';
import { UtilService } from '../util/util.service';
import { FlowserverGateway } from './flowserver.gateway';

describe('FlowserverGateway', () => {
  let gateway: FlowserverGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [LoggerModule],
      providers: [FlowserverGateway, UtilService],
    }).compile();

    gateway = module.get<FlowserverGateway>(FlowserverGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
