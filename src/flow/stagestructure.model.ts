import * as mongoose from 'mongoose'
import { Schema } from 'mongoose'

export const StageStructure = new mongoose.Schema({
    _id: String,
    tasks: [String],
    createdDate: String,
    name: String,
    canSkip: Boolean,
    hostConsentToProceed: Boolean
})


export interface StageStructure extends mongoose.Document {
    _id: string
    tasks: string[],
    createdDate: string,
    name: string,
    canSkip: boolean,
    hostConsentToProceed: boolean
}
