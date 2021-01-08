import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FlowController } from './flow/flow.controller';
import { StageController } from './stage/stage.controller';
import { TaskController } from './task/task.controller';
import { FlowStructure } from './flowstructure.model';
import { StageStructure } from './stagestructure.model';
import { TaskStructure } from './taskstructure.model';
import { FlowdbService } from './flowdb/flowdb.service';
import { TaskdbService } from './taskdb/taskdb.service';
import { StagedbService } from './stagedb/stagedb.service';
import { LoggerModule } from '../logger/logger.module';
import { RegisterController } from './register/register.controller';
import { SessiondbService } from './sessiondb/sessiondb.service';
import { SessionStructure } from './sessionstructure.model';
import { GlobalModule } from '../global/global.module';
import { TaskResolver } from './task/task.resolver';
import { FlowResolver } from './flow/flow.resolver';

@Module({
    imports: [MongooseModule.forFeature([
        { name: 'Flow', schema: FlowStructure },
        { name: 'Stage', schema: StageStructure },
        { name: 'Task', schema: TaskStructure }],
        'flow'),
    MongooseModule.forFeature([
        { name: 'FlowSession', schema: SessionStructure }],
        'sessions'), LoggerModule, GlobalModule],
    controllers: [FlowController, StageController, TaskController, RegisterController],
    providers: [TaskdbService, FlowdbService, StagedbService, SessiondbService, TaskResolver, FlowResolver],
    exports: [FlowdbService, StagedbService, TaskdbService, SessiondbService]
})
export class FlowModule { }
