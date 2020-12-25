import * as mongoose from 'mongoose'

export const FlowStructure = new mongoose.Schema({
    _id: String,
    stages: [String],
    createdDate: String,
    name: String,
    hostCanAbort: Boolean
})


export interface FlowStructure extends mongoose.Document {
    _id: string
    stages: string[],
    createdDate: string,
    name: String,
    hostCanAbort: boolean
}
