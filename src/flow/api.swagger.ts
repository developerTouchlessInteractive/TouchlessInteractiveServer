import { UserAction, UserInput } from "ezsign-client";
import { ApiProperty } from '@nestjs/swagger';

/** 
* Creating a Task 
* */
export class Task {
    @ApiProperty({
        description: 'give your task a name'
    })
    name: string

    @ApiProperty({
        description: 'Important: controller name of the task in your customer app, make sure the name matches component name in your angular router '
    })
    controllerName: string

    @ApiProperty({
        description: 'define type of user action ex: clicking accept-deny-ok on a privacy policy etc..,',
        enum: UserAction,
        enumName: 'UserAction'
    })
    userAction: UserAction

    @ApiProperty({
        enum: UserInput,
        enumName: 'userinput',
        description: 'define type of user input can be signature, form to fill etc.., '
    })
    userInput: UserInput

    @ApiProperty({
        description: 'The resource to be fetched by server, can be URL to show like privacy policy or a url of file to display.'
    })
    resource: string

    @ApiProperty({
        description: 'id is optional, server would generate this if empty'
    })
    _id?: string

    @ApiProperty({
        description: 'created date is optional, server would generate this if empty, server uses MMM Do YYYY hh:mm a of moment js format'
    })
    createdDate?: string
}

/**
* Creating a Stage 
* @param name provide a name for this stage
* @param tasks list of tasks(task-ids) this stage should execute 
* @param canSkip option to skip for customer
* @param hostConsentToProceed once stage is complete does this stage require a consent from the host
*/

export class Stage {
    @ApiProperty({
        description: 'provide a name for this stage'
    })
    name: string

    @ApiProperty({
        description: 'list of tasks(task-ids) this stage should execute '
    })
    tasks: string[]


    @ApiProperty({
        description: 'option to skip for customer'
    })
    canSkip?: boolean

    @ApiProperty({
        description: 'once stage is complete does this stage require a consent from the host'
    })
    hostConsentToProceed?: boolean

    @ApiProperty({
        description: 'id is optional, server would generate this if empty'
    })
    _id?: string

    @ApiProperty({
        description: 'created date is optional, server would generate this if empty, server uses MMM Do YYYY hh:mm a of moment js format'
    })
    createdDate?: string
}

/**
 * 
 * @param name name of the flow 
 * @param stages stages included in the flow, provide as string array of stageIds
 * @param hostCanAbort optional -> an option for host to abort this flow. 
 */
export class Flow {
    @ApiProperty({
        description: 'provide a name for this flow'
    })
    name: string

    @ApiProperty({
        description: 'list of stages(stage-ids) this flow should execute '
    })
    stages: string[]

    @ApiProperty({
        description: 'optional -> an option for host to abort this flow.'
    })
    hostCanAbort?: boolean

    @ApiProperty({
        description: 'id is optional, server would generate this if empty'
    })
    _id?: string

    @ApiProperty({
        description: 'created date is optional, server would generate this if empty, server uses MMM Do YYYY hh:mm a of moment js format'
    })
    createdDate?: string
}

/**
 * @param sessionId flow, sessionID that client began
 * @param flowId flowId 
 * @param customer the customer channel ID, that was provided to you client 
 */
export class Register {
    @ApiProperty({
        description: 'flow, sessionID that client began'
    })
    sessionId: string

    @ApiProperty({
        description: 'flow ID '
    })
    flowId: string

    @ApiProperty({
        description: 'the customer channel ID, that was provided to you client'
    })
    customer: string
}

/**
 * @param inviteCode name of the flow 
 */
export class RegisterByCode {
    @ApiProperty({
        description: 'invite code for the flow session that client has begun'
    })
    inviteCode: string
}


/**
 * @param flowId flowID
 */
export class InitiateFlow {
    @ApiProperty({
        description: 'provide the id of the flow to be operated'
    })
    flowId: string
}


/**
 * @param flowId id
 */
export class FlowIdParam {
    @ApiProperty({
        description: 'provide the id of the flow to be operated'
    })
    id: string
}

/**
 * session info passes when initiating flow.
 */
export class SessionInfo {
    @ApiProperty({
        description: 'sessionId of the active session of the flow initiated'
    })
    sessionId: string

    @ApiProperty({
        description: 'channelId that is established either client/customer for the provided flow session'
    })
    channelId: string

    @ApiProperty({
        description: 'inviteCode for the flow session'
    })
    inviteCode?: string
}