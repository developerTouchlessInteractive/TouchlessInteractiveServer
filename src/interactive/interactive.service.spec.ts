import { MongooseModule, getModelToken, getConnectionToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Connection, Model, model } from 'mongoose';
import { LoggerModule } from '../logger/logger.module';
import { CommunicationStructure } from './communication.structure';
import { InteractiveService } from './interactive.service';

describe('InteractiveService', () => {
  let service: InteractiveService;
  const INTERACT_MODEL: Model<CommunicationStructure> = model('Communication', CommunicationStructure)
  let interactConnection: Connection;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [LoggerModule,
        MongooseModule.forRoot('mongodb://127.0.0.1:27017/interact', { connectionName: 'interact' })
      ],
      providers: [InteractiveService,
        {
          provide: getModelToken('Communication'),
          useValue: INTERACT_MODEL
        }
      ],
    }).compile();

    service = module.get<InteractiveService>(InteractiveService);
    interactConnection = await module.get(getConnectionToken('interact'))
  });

  afterEach(async () => {
    await interactConnection.close()
  })

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
