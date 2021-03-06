import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose'
import { FlowModule } from './flow/flow.module';
import { LoggerModule } from './logger/logger.module';
import { GlobalModule } from './global/global.module';
import { UtilService } from './util/util.service';
import { ConfigModule } from '@nestjs/config/dist/config.module';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'lodash';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://127.0.0.1:27017/flow', { connectionName: 'flow' }),
    MongooseModule.forRoot('mongodb://127.0.0.1:27017/interact', { connectionName: 'interact' }),
    MongooseModule.forRoot('mongodb://127.0.0.1:27017/sessions', { connectionName: 'sessions' }),
    FlowModule,
    LoggerModule,
    GlobalModule,
    ConfigModule.forRoot({
      isGlobal: true
    }),
    GraphQLModule.forRoot({
      include: [FlowModule], //limits resolver search to these modules
      autoSchemaFile:'src/schema.gql',
      sortSchema: true,
      debug: true,
      playground: true
    })
  ],
  controllers: [AppController],
  providers: [AppService, UtilService]
})
export class AppModule { }

