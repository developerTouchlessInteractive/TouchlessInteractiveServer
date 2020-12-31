import { Route, CommunicationData } from 'ti-framework'
import * as mongoose from 'mongoose'
import { Schema } from 'mongoose'

export const CommunicationStructure = new mongoose.Schema({
    time: Number,
    type: String,
    data: Schema.Types.Mixed,
    packetId: String,
    route: Schema.Types.Mixed,
    communicationData: Schema.Types.Mixed
})


export interface CommunicationStructure extends mongoose.Document {
    targetChannel: String,
    communicationData: CommunicationData,
    time: number,
    type: string,
    data: any,
    packetId: string,
    route: Route,
}
