import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import {Stage} from '../stagedb/stage.graphql.model'



@ObjectType()
export class FlowDetail {
    @Field(type => String, { nullable: false })
    _id: string;

    @Field(type => [Stage], { nullable: false, description: "list of stages in the flow" })
    stages: Stage[];

    @Field(type => Boolean, { nullable: true, description: "can the host/agent abort the flow" })
    hostCanAbort: boolean;

    @Field(type => String, { nullable: false, description: "provide a unique name" })
    name?: string;

    @Field(type => String)
    createdDate?: string;
}

@ObjectType()
export class Flow {
    @Field(type => String, { nullable: false })
    _id: string;

    @Field(type => [String], { nullable: false, description: "list of stage ids in the flow" })
    stages: String[];

    @Field(type => Boolean, { nullable: true, description: "can the host/agent abort the flow" })
    hostCanAbort: boolean;

    @Field(type => String, { nullable: false, description: "provide a unique name" })
    name?: string;

    @Field(type => String)
    createdDate?: string;
}

@InputType()
export class FlowInput {
    @Field(type => String, { nullable: false })
    _id: string;

    @Field(type => [String], { nullable: false, description: "list of stage id's" })
    stages: [string];

    @Field(type => Boolean, { nullable: true, description: "can the host/agent abort the flow" })
    hostCanAbort: boolean;

    @Field(type => String, { nullable: false, description: "provide a unique name" })
    name?: string;

    @Field(type => String)
    createdDate?: string;
}
