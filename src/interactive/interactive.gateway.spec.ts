import { MongooseModule, getModelToken, getConnectionToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Connection, Model, model } from 'mongoose';
import { GlobalModule } from '../global/global.module';
import { LoggerModule } from '../logger/logger.module';
import { CommunicationStructure } from './communication.structure';
import { InteractiveGateway } from './interactive.gateway';

describe('InteractiveGateway', () => {
  let gateway: InteractiveGateway;
  let interactConnection: Connection;
  const INTERACT_MODEL: Model<CommunicationStructure> = model('Communication', CommunicationStructure)

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        LoggerModule,
        GlobalModule,
        MongooseModule.forRoot('mongodb://127.0.0.1:27017/interact', { connectionName: 'interact' })
      ],
      providers: [
        InteractiveGateway,
        {
          provide: getModelToken('Communication'),
          useValue: INTERACT_MODEL,
        }
      ],
    }).compile();

    gateway = module.get<InteractiveGateway>(InteractiveGateway);
    interactConnection = await module.get(getConnectionToken('interact'))
  });

  afterEach(async () => {
    await interactConnection.close()
  })

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
