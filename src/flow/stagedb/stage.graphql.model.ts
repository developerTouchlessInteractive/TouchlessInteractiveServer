import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import {Task} from './../task/task.graphql.models'

@ObjectType()
export class Stage{
    @Field(type => String)
    _id?: string;

    @Field(type => [String])
    tasks: string[];

    @Field(type => [Task])
    detailTasks?:Task[];
    
    @Field(type => String)
    createdDate?: string;

    @Field(type => String )
    name?: string;

    @Field(type => Boolean, { nullable: true })
    canSkip: Boolean;

    @Field(type => Boolean, { nullable: true })
    hostConsentToProceed: Boolean
}

@InputType()
export class StageInput{
    @Field(type => String)
    _id?: string;

    @Field(type => [String])
    tasks: string[];

    @Field(type => [Task])
    detailTasks?:Task[];
    
    @Field(type => String)
    createdDate?: string;

    @Field(type => String )
    name?: string;

    @Field(type => Boolean, { nullable: true })
    canSkip: Boolean;

    @Field(type => Boolean, { nullable: true })
    hostConsentToProceed: Boolean
}