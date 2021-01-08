import { Args, InputType, Mutation, Parent, Query, ResolveField, Resolver, Subscription } from "@nestjs/graphql";
import { LogService } from "src/logger/logger.service";
import { FlowdbService } from "../flowdb/flowdb.service";
import { Flow, FlowInput } from "./flow.graphql.models";

@Resolver(of => Flow)
export class FlowResolver {
    constructor(
        private FlowDbService: FlowdbService,
        private logger: LogService
    ) { }

    @Query(returns => Flow, { description: "Flow for the provided ID" })
    async getFlowById(@Args('id', { type: () => String }) id: string) {
        const total = await this.FlowDbService.getTotalById(id);
        this.logger.logm("response ", total)
        return total
    }

    @Query(returns => [Flow], { description: "all the Flows list" })
    async getAllFlows() {
        return this.FlowDbService.getAll()
    }

    @Mutation(returns => Flow, { description: "creates a Flow and returns the response" })
    async createFlow(@Args({ name: 'Flow', type: () => FlowInput, description: "Flow to be created" }) Flow: FlowInput) {
        return this.FlowDbService.save(Flow);
    }
}