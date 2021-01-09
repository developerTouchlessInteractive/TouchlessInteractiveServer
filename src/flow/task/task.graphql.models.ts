import { Field, InputType, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Task {
    @Field(() => String)
    _id: string;

    @Field(() => String)
    controllerName?: string;

    @Field(() => String, { nullable: true })
    resource?: string;

    @Field(() => String)
    name?: string;

    @Field(() => String)
    createdDate?: string;

    @Field(() => String, { nullable: true })
    userInput: string;

    @Field(() => String, { nullable: true })
    UserAction: string;
}

@InputType()
export class TaskInput {
    @Field(() => String)
    _id: string;

    @Field(() => String)
    controllerName?: string;

    @Field(() => String, { nullable: true })
    resource?: string;

    @Field(() => String)
    name?: string;

    @Field(() => String, { nullable: true })
    createdDate?: string;

    @Field(() => String, { nullable: true })
    userInput: string;

    @Field(() => String, { nullable: true })
    UserAction: string;
}
