import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { FlowbossService } from '../flowboss/flowboss.service';
import { FlowserverGateway } from '../flow/flowserver.gateway';
import { CommunicationStructure } from '../interactive/communication.structure';
import { InteractiveGateway } from '../interactive/interactive.gateway';
import { InteractiveService } from '../interactive/interactive.service';
import { LoggerModule } from '../logger/logger.module';
import { UtilService } from '../util/util.service';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: 'Communication', schema: CommunicationStructure }], 'interact'),
        LoggerModule
    ],
    providers: [FlowbossService, FlowserverGateway, InteractiveGateway, InteractiveService, UtilService],
    exports: [FlowbossService, FlowserverGateway, InteractiveGateway, InteractiveService]
})
export class GlobalModule {

}
