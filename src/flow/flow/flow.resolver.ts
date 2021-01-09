import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { LogService } from "src/logger/logger.service";
import { FlowdbService } from "../flowdb/flowdb.service";
import { Flow, FlowDetail, FlowInput } from "./flow.graphql.models";

/**
 * graphql queries and mutations for TI Flow
 */
@Resolver(() => Flow)
export class FlowResolver {
    constructor(
        private FlowDbService: FlowdbService,
        private logger: LogService
    ) { }

    /**
     * gets the flow with  details of stages and their tasks in detail
     * @param id flow id
     */
    @Query(() => FlowDetail, { description: "Flow Detail(with stage & task details) for the provided ID" })
    async getFlowById(@Args('id', { type: () => String }) id: string) {
        const total = await this.FlowDbService.getTotalById(id);
        this.logger.logm("response ", total)
        return total
    }

    /**
     * fetches all flows from the database
     */
    @Query(() => [Flow], { description: "all the Flows(with stage ids array) list" })
    async getAllFlows() {
        return this.FlowDbService.getAll()
    }

    /**
     * fetches all flows who contain this stage
     * @param id stage id to find
     */
    @Query(returns => [Flow], { description: "returns flows containing this stage id" })
    async getFlowsWithStage(@Args('id', { type: () => String, nullable: false }) id: string) {
        return this.FlowDbService.getFlowsWithStage(id)
    }

    /**
     * creates a flow 
     * @param Flow flow
     */
    @Mutation(() => Flow, { description: "creates a Flow and returns the response" })
    async createFlow(@Args({ name: 'Flow', type: () => FlowInput, description: "Flow to be created" }) Flow: FlowInput) {
        return this.FlowDbService.save(Flow);
    }
}