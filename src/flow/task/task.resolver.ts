import { Args, InputType, Mutation, Parent, Query, ResolveField, Resolver, Subscription } from "@nestjs/graphql";
import { TaskdbService } from "../taskdb/taskdb.service";
import { Task, TaskInput } from "./task.graphql.models";

@Resolver(of => Task)
export class TaskResolver {
    constructor(
        private taskDbService: TaskdbService
    ) { }

    @Query(returns => Task, { description: "task for the provided ID" })
    async getTaskById(@Args('id', { type: () => String }) id: string) {
        return this.taskDbService.getById(id);
    }

    @Query(returns => [Task], { description: "all the tasks list" })
    async getAllTasks() {
        return this.taskDbService.getAll()
    }

    @Mutation(returns => Task, { description: "creates a task and returns the response" })
    async createTask(@Args({ name: 'task', type: () => TaskInput, description: "task to be created" }) task: TaskInput) {
        return this.taskDbService.save(task);
    }
}