import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose'
import { FlowModule } from './flow/flow.module';
import { LoggerModule } from './logger/logger.module';
import { GlobalModule } from './global/global.module';
import { UtilService } from './util/util.service';
import { ConfigModule } from '@nestjs/config/dist/config.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb+srv://tiadmin:y7amkt6qEsGkRpNJ@tidevcluster.r7h3i.mongodb.net/flow?retryWrites=true&w=majority', { connectionName: 'flow', useNewUrlParser: true }),
    MongooseModule.forRoot('mongodb+srv://tiadmin:y7amkt6qEsGkRpNJ@tidevcluster.r7h3i.mongodb.net/interact?retryWrites=true&w=majority', { connectionName: 'interact', useNewUrlParser: true }),
    MongooseModule.forRoot('mongodb+srv://tiadmin:y7amkt6qEsGkRpNJ@tidevcluster.r7h3i.mongodb.net/sessions?retryWrites=true&w=majority', { connectionName: 'sessions', useNewUrlParser: true }),
    FlowModule,
    LoggerModule,
    GlobalModule,
    ConfigModule.forRoot({
      isGlobal: true
    })
  ],
  controllers: [AppController],
  providers: [AppService, UtilService]
})
export class AppModule { }

