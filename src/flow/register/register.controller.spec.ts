import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model, model } from 'mongoose';
import { FlowbossService } from '../../flowboss/flowboss.service';
import { CommunicationStructure } from '../../interactive/communication.structure';
import { LoggerModule } from '../../logger/logger.module';
import { FlowModule } from '../flow.module';
import { FlowStructure } from '../flowstructure.model';
import { SessionStructure } from '../sessionstructure.model';
import { StageStructure } from '../stagestructure.model';
import { TaskStructure } from '../taskstructure.model';
import { RegisterController } from './register.controller';

describe('Register Controller', () => {
  let controller: RegisterController;
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
      controllers: [RegisterController],
      providers: [
        FlowbossService,
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

    controller = module.get<RegisterController>(RegisterController);
  });

  it('register controller should be defined', () => {
    expect(controller).toBeDefined();
  });
});
