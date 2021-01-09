import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { Task } from './../task/task.graphql.models'

@ObjectType()
export class StageDetail {
    @Field(() => String, { nullable: false })
    _id: string;

    @Field(() => [Task], { nullable: false, description: "list of tasks in the stage" })
    tasks: Task[];

    @Field(() => String, { nullable: false, description: "provide a unique name" })
    name?: string;

    @Field(() => String)
    createdDate?: string;

    @Field(() => Boolean, { nullable: true, description: "can the customer skip the Stage" })
    canSkip: boolean;

    @Field(() => Boolean, { nullable: true, description: "does it need host Consent To Proceed with the Stage" })
    hostConsentToProceed: boolean;
}


@ObjectType()
export class Stage {
    @Field(() => String, { nullable: false })
    _id: string;

    @Field(() => [String], { nullable: false, description: "list of tasks ids in the stage" })
    tasks: string[];

    @Field(() => String, { nullable: false, description: "provide a unique name" })
    name?: string;

    @Field(() => String)
    createdDate?: string;

    @Field(() => Boolean, { nullable: true, description: "can the customer skip the Stage" })
    canSkip: boolean;

    @Field(() => Boolean, { nullable: true, description: "does it need host Consent To Proceed with the Stage" })
    hostConsentToProceed: boolean;
}

@InputType()
export class StageInput {
    @Field(() => String)
    _id?: string;

    @Field(() => [String])
    tasks: string[];

    @Field(() => String, { nullable: true })
    createdDate?: string;

    @Field(() => String, { nullable: false, description: "provide a unique name" })
    name?: string;

    @Field(() => Boolean, { nullable: true })
    canSkip: Boolean;

    @Field(() => Boolean, { nullable: true })
    hostConsentToProceed: Boolean
}