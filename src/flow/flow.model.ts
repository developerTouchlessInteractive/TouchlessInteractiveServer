export enum Message {
    SUCCESS_TASK_CREATION = "task created succesfully",
    FAILURE_TASK_CREATION = "task creation failed, retry",
    FAILURE_TASK_DELETION = "task deletion failed, retry",
    FAILURE_TASK_CREATION_INVALID = "task creation failed, retry",
    CREATION_FAILURE_TASK_CONFIG_EXISTS = "a similar task exists with same config",
    SUCCESS_TASK_DELETED = "task is deleted succesfully",
    DELETE_TASK_DOESNT_EXIST = "task doesnt exist",
    DELETE_TASK_STAGES_USERS_EXIST = "task cant be deleted, some stages are using it, delete stage(task user's) first and delete task",

    SUCCESS_STAGE_CREATION = "stage created succesfully",
    FAILURE_STAGE_CREATION = "stage creation failed, retry",
    FAILURE_STAGE_DELETION = "stage deletion failed, retry",
    FAILURE_STAGE_CREATION_INVALID = "stage creation failed, retry",
    CREATION_FAILURE_STAGE_CONFIG_EXISTS = "a similar stage exists with same config",
    SUCCESS_STAGE_DELETED = "stage is deleted succesfully",
    DELETE_STAGE_DOESNT_EXIST = "stage doesnt exist",
    NO_STAGE_FOUND = "no stage found with that id, please take a look at all stages available with the get all stages api",
    DELETE_STAGE_FLOWS_USERS_EXIST = "stage cant be deleted, some flows are using it, delete flow(stage user's) first and delete stage",

    SUCCESS_FLOW_CREATION = "flow created succesfully",
    FAILURE_FLOW_CREATION = "flow creation failed, retry",
    FAILURE_FLOW_DELETION = "flow deletion failed, retry",
    FAILURE_FLOW_CREATION_INVALID = "flow creation failed, retry",
    CREATION_FAILURE_FLOW_CONFIG_EXISTS = "a similar flow exists with same config",
    SUCCESS_FLOW_DELETED = "flow is deleted succesfully",
    DELETE_FLOW_DOESNT_EXIST = "flow doesnt exist",
    NO_FLOW_FOUND = "no flow found with that id, please take a look at all flows available with the get all flows api",

    REGISTRATION_SUCCESS = "registered customer device succesfully",
    REGISTRATION_FAILURE = "registration failed, no session available to connect",

    FLOW_INITIATION_FAILURE = "unable to initaite flow",
    FLOW_INITIATION_SUCCESS = "initaited flow succesfully",
    FLOW_COMPLETION_FAILURE = "unable to finish flow",
    FLOW_COMPLETION_SUCCESS = "finished flow succesfully"
}

export enum TiCodes {
    SUCCESS_TASK_CREATION = 600, //created task succesfully
    FAILURE_TASK_CREATION,
    FAILURE_TASK_DELETION,
    FAILURE_TASK_CREATION_INVALID, //no task exists with the id
    CREATION_FAILURE_TASK_CONFIG_EXISTS, //very similar config of a task exist, you can reuse that task
    SUCCESS_TASK_DELETED,
    DELETE_TASK_DOESNT_EXIST,
    DELETE_TASK_STAGES_USERS_EXIST, // task wont be deleted if there are users(stages)
    SUCCESS_STAGE_CREATION,
    FAILURE_STAGE_CREATION,
    FAILURE_STAGE_DELETION,
    FAILURE_STAGE_CREATION_INVALID,
    CREATION_FAILURE_STAGE_CONFIG_EXISTS,
    SUCCESS_STAGE_DELETED,
    DELETE_STAGE_DOESNT_EXIST,
    NO_STAGE_FOUND,
    DELETE_STAGE_FLOWS_USERS_EXIST,// stage wont be deleted if there are users(flows)
    SUCCESS_FLOW_CREATION,
    FAILURE_FLOW_CREATION,
    FAILURE_FLOW_DELETION,
    FAILURE_FLOW_INTIATION,
    FAILURE_FLOW_CREATION_INVALID,
    CREATION_FAILURE_FLOW_CONFIG_EXISTS,
    SUCCESS_FLOW_DELETED,
    DELETE_FLOW_DOESNT_EXIST,
    NO_FLOW_FOUND,
    REGISTRATION_SUCCESS,
    REGISTRATION_FAILURE,
    FAILURE_FLOW_FINISH,
    SUCCESS_FLOW_INITIATED
}