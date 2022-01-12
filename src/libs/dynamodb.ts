import * as dynamoose from "dynamoose";
import { Document } from "dynamoose/dist/Document";

const { DYNAMODB_TABLE_NAME } = process.env;

export class DynamoModel extends Document {
  pk: string;
  sk: string;
  username: string;
  cryptos: string[];
  weatcher_loc: string;
  createdAt: number;
  updatedAt: number;
}

const schema = new dynamoose.Schema(
  {
    pk: {
      type: String,
      hashKey: true,
    },
    sk: {
      type: String,
      rangeKey: true,
    },
    username: {
      type: String,
    },
    cryptos: {
      type: String,
    },
    weather_loc: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Model = dynamoose.model<DynamoModel>(DYNAMODB_TABLE_NAME, schema);

export const registerUser = async ({ username, userId }) => {
  const user = new Model({
    pk: "user",
    sk: userId,
    username,
  });

  await user.save({
    overwrite: false,
    return: "document",
  });
};

export const storeNewCrypto = async ({ userId, symbol }) => {
  await Model.update(
    {
      pk: "user",
      sk: userId,
    },
    {
      $ADD: { cryptos: [symbol] },
    }
  );
};
