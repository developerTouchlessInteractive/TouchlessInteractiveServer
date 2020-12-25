import { FlowDetails, FlowState, TaskOrder, StageState, TaskState } from "ezsign-client";
import { FlowdbService } from "src/flow/flowdb/flowdb.service";
import * as shortid from 'shortid'

export class TriggerHandlerFactory {
    private static _instance: TriggerHandlerFactory;

    private constructor() { }

    static getInstance() {
        return this._instance || (this._instance = new this());
    }

    getTriggerHandler(fd: FlowDetails, dbServ: FlowdbService) {
        return new TiTriggerHandler(fd, dbServ)
    }
}

abstract class TriggerHandler {
    public flow: FlowDetails
    public flowdbService: FlowdbService
    public flowState: FlowState
    public taskOrder: TaskOrder[] = []

    constructor(fd: FlowDetails, dbServ: FlowdbService) {
        this.flow = fd
        this.flowdbService = dbServ
        this.createFlowState(this.flow).then(state => {
            this.flowState = state
            this.taskOrder = state.taskLedger
        })
    }

    public abstract createFlowState(flow: FlowDetails): Promise<FlowState>

    abstract isTaskComplete(uniqueTaskReference: string, triggerListener: TriggerListener): Promise<void>

    abstract isAnyStageComplete(triggerListener: TriggerListener): Promise<void>

    abstract isFlowComplete(): Promise<boolean>

    abstract updateTaskState(uniqueref: string): Promise<void>

    abstract updateStageState(uniqueref: string): Promise<void>

    abstract updateFlowState(): Promise<void>

    abstract getFlowState(): FlowState
}

export class TiTriggerHandler extends TriggerHandler {
    constructor(fd: FlowDetails, dbServ: FlowdbService) {
        super(fd, dbServ)
    }

    public createFlowState(flow: FlowDetails): Promise<FlowState> {
        return new Promise(async (resolve, reject) => {
            try {
                const stages = await this.getStageState(flow);
                const flSt = {
                    'stageStates': stages,
                    taskLedger: this.taskOrder,
                    isCompleted: false,
                }
                const flowState: FlowState = { ...flSt, ...flow }
                this.flowState = flowState
                resolve(flowState)
            } catch (error) {
                reject(error)
            }
        })
    }

    private async getStageState(flow: FlowDetails): Promise<StageState[]> {
        return new Promise(async (resolve, reject) => {
            try {
                let count = 0;
                const stages: any[] = flow.stages;
                for (let stage of stages) {
                    const tskStArr = []
                    for (let task of stage.tasks) {
                        const y = {
                            uniqueReference: shortid.generate(),
                            isCompleted: false
                        }
                        const or = {
                            isCompleted: false,
                            order: count++
                        }
                        const tsk = await this.flowdbService.getTaskById(task)
                        const tk: TaskState = { ...y, ...tsk }
                        tskStArr.push(tk)
                        const ord = { ...tk, ...or }
                        this.taskOrder.push(ord)
                    }
                    stage['taskStates'] = tskStArr;
                    stage['uniqueReference'] = shortid.generate();
                    stage['isCompleted'] = false;
                }
                resolve(stages)
            } catch (error) {
                reject(error)
            }
        })
    }

    getAllTaskProms(stage) {
        const proms: Promise<any>[] = []
        stage.tasks.forEach(async task => {
            proms.push(this.flowdbService.getTaskById(task))
        });
        return Promise.all(proms)
    }

    getFlowState(): FlowState {
        return this.flowState
    }

    isTaskComplete(uniqueTaskReference: string, triggerListener: TriggerListener): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                await this.updateTaskState(uniqueTaskReference)
                await this.updateTaskLedger(uniqueTaskReference)
                await triggerListener.taskIsComplete(uniqueTaskReference, this.flowState)
                //check stage complete
                await this.isAnyStageComplete(triggerListener)
                if (await this.isFlowComplete()) triggerListener.flowIsComplete(this.flowState)
                resolve()
            } catch (error) {
                reject()
            }
        })
    }

    updateTaskLedger(ref) {
        return new Promise<void>((resolve, reject) => {
            try {
                const task = this.flowState.taskLedger.find(x => x.uniqueReference === ref)
                if (task) task.isCompleted = true
                resolve()
            } catch (error) {
                reject()
            }
        })
    }

    isAnyStageComplete(triggerListener: TriggerListener): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                this.flowState!.stageStates.forEach(async stage_state => {
                    if (!stage_state.isCompleted) {
                        const isStageComplete = stage_state.taskStates.every(x => x.isCompleted === true)
                        if (isStageComplete) {
                            await this.updateStageState(stage_state.uniqueReference!)
                            await triggerListener.stageIsComplete(stage_state.uniqueReference, this.flowState)
                        }
                    }
                });
                resolve()
            } catch (error) {
                reject()
            }
        })
    }

    isFlowComplete(): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            try {
                const isFlowComplete = this.flowState!.stageStates.every(stage => stage.isCompleted === true)
                if (isFlowComplete) await this.updateFlowState()
                resolve(isFlowComplete)
            } catch (error) {
                reject()
            }
        })
    }

    updateTaskState(reference: string): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                this.flowState.stageStates.find(stage => {
                    const task = stage.taskStates.find(task => task.uniqueReference === reference)
                    if (task) task.isCompleted = true
                })
                resolve()
            } catch (error) {
                reject()
            }
        })
    }

    updateStageState(reference: string): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                const stage = this.flowState.stageStates.find(x => x.uniqueReference === reference)
                if (stage) stage.isCompleted = true
                resolve()
            } catch (error) {
                reject()
            }
        })
    }

    updateFlowState(): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                this.flowState!.isCompleted = true
                resolve()
            } catch (error) {
                reject()
            }
        })
    }
}

export interface TriggerListener {
    taskIsComplete(taskReference: string, flowState: any): Promise<void>
    stageIsComplete(stageReference: string, flowState: any): Promise<void>
    flowIsComplete(flowState: any): Promise<void>
}