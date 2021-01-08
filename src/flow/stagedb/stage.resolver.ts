import { Args, InputType, Mutation, Parent, Query, ResolveField, Resolver, Subscription } from "@nestjs/graphql";
import {StagedbService} from './stagedb.service'
import {Stage, StageInput} from './stage.graphql.model'

@Resolver(of => Stage)
export class StageResolver {
    constructor(
        private stageDbService: StagedbService
    ) { }

    @Query(returns => Stage)
    async getStageById( @Args('id', { type: () => String }) id:string){
        return this.stageDbService.getById(id)
    } 

    @Query(returns => [Stage])
    async getAllStages(){
        return this.stageDbService.getAll()
    }

}