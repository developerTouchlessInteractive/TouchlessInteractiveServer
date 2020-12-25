import { getConnectionToken, getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Connection, Model, model } from 'mongoose';
import { InteractiveGateway } from '../../interactive/interactive.gateway';
import { FlowbossService } from '../../flowboss/flowboss.service';
import { CommunicationStructure } from '../../interactive/communication.structure';
import { LoggerModule } from '../../logger/logger.module';
import { FlowModule } from '../flow.module';
import { FlowserverGateway } from '../flowserver.gateway';
import { FlowStructure } from '../flowstructure.model';
import { SessiondbService } from '../sessiondb/sessiondb.service';
import { SessionStructure } from '../sessionstructure.model';
import { StageStructure } from '../stagestructure.model';
import { TaskStructure } from '../taskstructure.model';
import { FlowController } from './flow.controller';
import { UtilService } from '../../util/util.service';
import { InteractiveService } from '../../interactive/interactive.service';

describe('Flow Controller', () => {
  let controller: FlowController;
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
      controllers: [FlowController],
      providers: [
        FlowbossService,
        SessiondbService,
        FlowserverGateway,
        InteractiveGateway,
        UtilService,
        InteractiveService,
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

    controller = module.get<FlowController>(FlowController);
    flowConnection = await module.get(getConnectionToken('flow'))
    sessionConnection = await module.get(getConnectionToken('sessions'))
    interactConnection = await module.get(getConnectionToken('interact'))
  });

  afterEach(async () => {
    await flowConnection.close()
    await sessionConnection.close()
    await interactConnection.close()
  })

  it('flow controller should be defined', () => {
    expect(controller).toBeDefined();
  });
});
