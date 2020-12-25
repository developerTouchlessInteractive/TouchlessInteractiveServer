import { getConnectionToken, getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Connection, Model, model } from 'mongoose';
import { LoggerModule } from '../../logger/logger.module';
import { SessionStructure } from '../sessionstructure.model';
import { SessiondbService } from './sessiondb.service';

describe('SessiondbService', () => {
  let service: SessiondbService;
  let sessionConnection: Connection;

  const SESSION_MODEL: Model<SessionStructure> = model('FlowSession', SessionStructure);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        LoggerModule,
        MongooseModule.forRoot('mongodb://127.0.0.1:27017/sessions', { connectionName: 'sessions' })
      ],
      providers: [SessiondbService,
        {
          provide: getModelToken('FlowSession'),
          useValue: SESSION_MODEL,
        }
      ],
    }).compile();
    sessionConnection = await module.get(getConnectionToken('sessions'))

    service = module.get<SessiondbService>(SessiondbService);
  });


  afterEach(async () => {
    await sessionConnection.close()
  })

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
