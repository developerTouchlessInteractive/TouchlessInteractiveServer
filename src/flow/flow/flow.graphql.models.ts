import { Field, InputType, ObjectType } from '@nestjs/graphql';
import {Stage} from '../stagedb/stage.graphql.model'



@ObjectType()
export class FlowDetail {
    @Field(() => String, { nullable: false })
    _id: string;

    @Field(() => [Stage], { nullable: false, description: "list of stages in the flow" })
    stages: Stage[];

    @Field(() => Boolean, { nullable: true, description: "can the host/agent abort the flow" })
    hostCanAbort: boolean;

    @Field(() => String, { nullable: false, description: "provide a unique name" })
    name?: string;

    @Field(() => String)
    createdDate?: string;
}

@ObjectType()
export class Flow {
    @Field(() => String, { nullable: false })
    _id: string;

    @Field(() => [String], { nullable: false, description: "list of stage ids in the flow" })
    stages: String[];

    @Field(() => Boolean, { nullable: true, description: "can the host/agent abort the flow" })
    hostCanAbort: boolean;

    @Field(() => String, { nullable: false, description: "provide a unique name" })
    name?: string;

    @Field(() => String)
    createdDate?: string;
}

@InputType()
export class FlowInput {
    @Field(() => String, { nullable: false })
    _id: string;

    @Field(() => [String], { nullable: false, description: "list of stage id's" })
    stages: [string];

    @Field(() => Boolean, { nullable: true, description: "can the host/agent abort the flow" })
    hostCanAbort: boolean;

    @Field(() => String, { nullable: false, description: "provide a unique name" })
    name?: string;

    @Field(() => String, {nullable:true})
    createdDate?: string;
}
