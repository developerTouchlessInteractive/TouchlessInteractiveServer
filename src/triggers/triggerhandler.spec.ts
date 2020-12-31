import { Test, TestingModule } from '@nestjs/testing';
import { FlowDetails, FlowState } from 'ti-framework';
import { FlowdbService } from '../flow/flowdb/flowdb.service';
import { TiTriggerHandler, TriggerHandlerFactory } from './trigger.handler';
import { getConnectionToken, getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Connection, model, Model } from 'mongoose';
import { FlowStructure } from '../flow/flowstructure.model';
import { StageStructure } from '../flow/stagestructure.model';
import { TaskStructure } from '../flow/taskstructure.model';
import { FlowModule } from '../flow/flow.module';
import { SessionStructure } from '../flow/sessionstructure.model';
import { CommunicationStructure } from '../interactive/communication.structure';
import { LoggerModule } from '../logger/logger.module';

describe('TriggerHandler', () => {
    let handler: TiTriggerHandler;
    let dbServ: FlowdbService;

    const FLOW_MODEL: Model<FlowStructure> = model('Flow', FlowStructure);
    const STAGE_MODEL: Model<StageStructure> = model('Stage', StageStructure);
    const TASK_MODEL: Model<TaskStructure> = model('Task', TaskStructure);
    const SESSION_MODEL: Model<SessionStructure> = model('FlowSession', SessionStructure);
    const INTERACT_MODEL: Model<CommunicationStructure> = model('Communication', CommunicationStructure)

    let flowDetails: FlowDetails = {
        stages: [
            {
                tasks: [
                    "krnVDCNPS",
                    "9-MTKnRZV",
                    "FyKsKiMeu",
                ],
                _id: "ZO2_ZdL0G",
                name: "stage1",
                canSkip: false,
                hostConsentToProceed: false,
                hostCanAbort: false,
                createdDate: "Nov 26th 2020 07:47 pm"
            },
        ],
        _id: "1bUMkotGk",
        name: "flow1",
        hostCanAbort: false,
        createdDate: "Nov 26th 2020 07:47 pm"
    }

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

        dbServ = module.get<FlowdbService>(FlowdbService);
        handler = TriggerHandlerFactory.getInstance().getTriggerHandler(flowDetails, dbServ)
    });


    it('handler should be defined', () => {
        expect(handler).toBeDefined();
    });

    it('flow details are defined', async () => {
        expect(handler.flow).toBeDefined();
    });

    it('flow dbservice is defined', async () => {
        expect(handler.flowdbService).toBeDefined();
    });

    it('flow state is created', async () => {
        const state: FlowState = await handler.createFlowState(flowDetails)
        if (state.stages.length > 0) {
            const strs = state.stages[0].tasks
            console.log(strs, null, 2)
        }

        expect(state).toBeDefined();
    });

    it('get flow details ', async () => {
        const fd = await handler.flowdbService.getTotalById('1bUMkotGk')
        console.log(fd ? fd : "no flow exists", null, 2)
        expect(fd).toBeDefined();
    })
});
