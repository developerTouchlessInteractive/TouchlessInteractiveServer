import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { TaskdbService } from "../taskdb/taskdb.service";
import { Task, TaskInput } from "./task.graphql.models";

/**
 * graphql queries and mutations for TI Task
 */
@Resolver(() => Task)
export class TaskResolver {
    constructor(
        private taskDbService: TaskdbService
    ) { }

    /**
     * gets the Task with a given id
     * @param id task id
     */
    @Query(() => Task, { description: "task for the provided ID" })
    async getTaskById(@Args('id', { type: () => String }) id: string) {
        return this.taskDbService.getById(id);
    }

    /**
     * gets all Tasks
     */
    @Query(() => [Task], { description: "all the tasks list" })
    async getAllTasks() {
        return this.taskDbService.getAll()
    }

    /**
     * creates a Task
     * @param task Task
     */
    @Mutation(() => Task, { description: "creates a task and returns the response" })
    async createTask(@Args({ name: 'task', type: () => TaskInput, description: "task to be created" }) task: TaskInput) {
        return this.taskDbService.save(task);
    }
}