import * as mongoose from 'mongoose'
import { UserAction, UserInput } from 'ezsign-client'

export const TaskStructure = new mongoose.Schema({
    _id: String,
    createdDate: String,
    userAction: String,
    userInput: String,
    resource: String,
    name: String,
    type: String,
    controllerName: String
})

export interface TaskStructure extends mongoose.Document {
    _id: string
    createdDate: string
    userAction: UserAction
    userInput: UserInput,
    resource: string,
    name: string,
    type: any,
    controllerName: string
}