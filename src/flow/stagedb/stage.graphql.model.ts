import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { Task } from './../task/task.graphql.models'

@ObjectType()
export class StageDetail {
    @Field(type => String, { nullable: false })
    _id: string;

    @Field(type => [Task], { nullable: false, description: "list of tasks in the stage" })
    tasks: Task[];

    @Field(type => String, { nullable: false, description: "provide a unique name" })
    name?: string;

    @Field(type => String)
    createdDate?: string;

    @Field(type => Boolean, { nullable: true, description: "can the customer skip the flow" })
    canSkip: boolean;

    @Field(type => Boolean, { nullable: true, description: "does it need host Consent To Proceed the flow" })
    hostConsentToProceed: boolean;
}


@ObjectType()
export class Stage {
    @Field(type => String, { nullable: false })
    _id: string;

    @Field(type => [String], { nullable: false, description: "list of tasks ids in the stage" })
    tasks: string[];

    @Field(type => String, { nullable: false, description: "provide a unique name" })
    name?: string;

    @Field(type => String)
    createdDate?: string;

    @Field(type => Boolean, { nullable: true, description: "can the customer skip the flow" })
    canSkip: boolean;

    @Field(type => Boolean, { nullable: true, description: "does it need host Consent To Proceed the flow" })
    hostConsentToProceed: boolean;
}

@InputType()
export class StageInput {
    @Field(type => String)
    _id?: string;

    @Field(type => [String])
    tasks: string[];

    @Field(type => String)
    createdDate?: string;

    @Field(type => String, { nullable: false, description: "provide a unique name" })
    name?: string;

    @Field(type => Boolean, { nullable: true })
    canSkip: Boolean;

    @Field(type => Boolean, { nullable: true })
    hostConsentToProceed: Boolean
}