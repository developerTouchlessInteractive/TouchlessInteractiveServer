import { FlowManager } from "./flowmanager";

export interface Broadcast {
    /**
     * notify all flows about a system wide alert
     * this can be a flow event but for all 
     * sessions running.
     * ex: max session reached that server can handle
     * ex: low memory to free up resources 
     * @param notif notification data
     */
    notifyAllFlows(notif: Notification)
}

/**
 * Session orchestration/management
 * and other utility methods to handle 
 * multiple sessions.
 */
export interface SessionSymphony {
    flowSessions: FlowManager[]
    /**
     * register the session 
     * @param flowSession session of a flow
     */
    registerSession(flowSession: FlowManager)

    /**
     * finsih/complete a session as it completes
     * removes from the list of sessions maintained.
     * and frees up any resources allocated
     * @param sessionId session identifier
     */
    endSession(sessionId: string): Promise<boolean>

    /**
     * returns active session count at the current moment
     * note: make sure endSession is called when session is complete
     */
    getSessionCount(): number

    /**
     * returns the session/flow manager for this sessionId
     * @param sessionId session Identifier
     */
    getSession(sessionId: string): Promise<FlowManager>

    /**
     * check if a session is still active
     * @param sessionId session Identifier
     */
    isSessionLive(sessionId: string): Promise<boolean>
}

/**
 * broadcast notification model
 */
export interface Notification {
    message: String
    priority: NotificationPriority
}

export enum NotificationPriority {
    HIGH,
    NORMAL
}