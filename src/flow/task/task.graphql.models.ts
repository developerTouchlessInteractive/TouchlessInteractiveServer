import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Task {
    @Field(type => String)
    _id: string;

    @Field(type => String)
    controllerName?: string;

    @Field(type => String, { nullable: true })
    resource?: string;

    @Field(type => String)
    name?: string;

    @Field(type => String)
    createdDate?: string;

    @Field(type => String, { nullable: true })
    userInput: string;

    @Field(type => String, { nullable: true })
    UserAction: string;
}

@InputType()
export class TaskInput {
    @Field(type => String)
    _id: string;

    @Field(type => String)
    controllerName?: string;

    @Field(type => String, { nullable: true })
    resource?: string;

    @Field(type => String)
    name?: string;

    @Field(type => String, { nullable: true })
    createdDate?: string;

    @Field(type => String, { nullable: true })
    userInput: string;

    @Field(type => String, { nullable: true })
    UserAction: string;
}
