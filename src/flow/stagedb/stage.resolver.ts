import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { StagedbService } from './stagedb.service'
import { Stage, StageDetail, StageInput } from './stage.graphql.model'

/**
 * graphql queries and mutations for TI Stage
 */
@Resolver(() => Stage)
export class StageResolver {
    constructor(
        private stageDbService: StagedbService
    ) { }

    /**
     * gets the Stage with tasks in detail
     * @param id stage id
     */
    @Query(() => StageDetail, { description: "returns a Stage with a given ID" })
    async getStageDetailById(@Args('id', { type: () => String }) id: string) {
        return this.stageDbService.getTotalById(id)
    }

    /**
     * fetches all Stages from the database
     */
    @Query(() => [Stage], { description: "returns all Stages" })
    async getAllStages() {
        return this.stageDbService.getAll()
    }

    /**
     * creates a Stage
     * @param Stage Stage
     */
    @Mutation(() => Stage, { description: "creates a Stage and returns the response" })
    async createStage(@Args('Stage', { type: () => StageInput }) Stage: StageInput) {
        return this.stageDbService.save(Stage)
    }



}