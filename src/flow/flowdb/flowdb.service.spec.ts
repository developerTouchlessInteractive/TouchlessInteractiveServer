import { MongooseModule, getModelToken, getConnectionToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Connection, Model, model } from 'mongoose';
import { CommunicationStructure } from '../../interactive/communication.structure';
import { LoggerModule } from '../../logger/logger.module';
import { FlowModule } from '../flow.module';
import { FlowStructure } from '../flowstructure.model';
import { SessionStructure } from '../sessionstructure.model';
import { StageStructure } from '../stagestructure.model';
import { TaskStructure } from '../taskstructure.model';
import { FlowdbService } from './flowdb.service';

describe('Flow db Service', () => {
  let service: FlowdbService;
  let flowConnection: Connection;
  let sessionConnection: Connection;
  let interactConnection: Connection;

  const FLOW_MODEL: Model<FlowStructure> = model('Flow', FlowStructure);
  const STAGE_MODEL: Model<StageStructure> = model('Stage', StageStructure);
  const TASK_MODEL: Model<TaskStructure> = model('Task', TaskStructure);
  const SESSION_MODEL: Model<SessionStructure> = model('FlowSession', SessionStructure);
  const INTERACT_MODEL: Model<CommunicationStructure> = model('Communication', CommunicationStructure)

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        LoggerModule,
        FlowModule,
        MongooseModule.forRoot('mongodb://127.0.0.1:27017/sessions', { connectionName: 'sessions' }),
        MongooseModule.forRoot('mongodb://127.0.0.1:27017/flow', { connectionName: 'flow' }),
        MongooseModule.forRoot('mongodb://127.0.0.1:27017/interact', { connectionName: 'interact' })
      ],
      providers: [
        {
          provide: getModelToken('Flow'),
          useValue: FLOW_MODEL,
        },
        {
          provide: getModelToken('Stage'),
          useValue: STAGE_MODEL,
        },
        {
          provide: getModelToken('Task'),
          useValue: TASK_MODEL,
        },
        {
          provide: getModelToken('FlowSession'),
          useValue: SESSION_MODEL,
        },
        {
          provide: getModelToken('Communication'),
          useValue: INTERACT_MODEL,
        }
      ],
    }).compile();

    service = module.get<FlowdbService>(FlowdbService);
    flowConnection = await module.get(getConnectionToken('flow'))
    sessionConnection = await module.get(getConnectionToken('sessions'))
    interactConnection = await module.get(getConnectionToken('interact'))
  });

  afterEach(async () => {
    await flowConnection.close()
    await sessionConnection.close()
    await interactConnection.close()
  })

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});


