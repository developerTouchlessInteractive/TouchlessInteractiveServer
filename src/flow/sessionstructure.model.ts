import * as mongoose from 'mongoose'
import { Schema } from 'mongoose' 

export const SessionStructure = new mongoose.Schema({
    _id:String,
    flowSession: Schema.Types.Mixed,
    inviteCode: String,
    eventBook: [Schema.Types.Mixed],
    interactBook: [Schema.Types.Mixed],
    stateBook: [Schema.Types.Mixed]

})


export interface SessionStructure extends mongoose.Document { 
    flowSession: any,
    inviteCode: string,
    eventBook: [any],
    interactBook: [any],
    stateBook: [any]
}

 