import * as dynamoose from "dynamoose";
import { Document } from "dynamoose/dist/Document";

const { USERS_TABLE_NAME } = process.env;

export class User extends Document {
  userId: string;
  username: string;
  createdAt: string;
  updatedAt: string;
}

const schema = new dynamoose.Schema({
  userId: {
    type: String,
    hashKey: true,
  },
});

const UserModel = dynamoose.model<User>(USERS_TABLE_NAME, schema);

export default async (ctx: any) => {
  const user = new UserModel({
    userId: ctx.update.message.from.id.toString(),
    username: ctx.update.message.from.username,
  });
  await user.save();

  await ctx.reply("Hey there! You are now registered! :)");
};
