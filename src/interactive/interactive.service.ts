import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CommunicationData } from 'ti-framework';
import { Model } from 'mongoose';
import { LogService } from '../logger/logger.service';
import { CommunicationStructure } from './communication.structure';

@Injectable()
export class InteractiveService {
    constructor(@InjectModel('Communication') private readonly commModel: Model<CommunicationStructure>,
        private logServ: LogService) { }

    async save(data: CommunicationData) {
        try {
            const buff = {
                communicationData: data
            }
            const dbData = { ...buff, ...data }
            const fl = new this.commModel(dbData)
            return fl.save()
        } catch (error) {
            console.log(`error saving data ${error}`)
        }
    }

    async getDataByPacketId(id: string): Promise<CommunicationStructure> {
        try {
            var comm: CommunicationStructure = await this.commModel.findById(id).lean()
            return comm
        } catch (error) {
            console.log('cant find docs')
        }
    }
}
