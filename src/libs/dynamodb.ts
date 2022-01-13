import * as dynamoose from "dynamoose";
import { Document } from "dynamoose/dist/Document";

const { DYNAMODB_TABLE_NAME } = process.env;

interface ILocation {
  latitude: number;
  longitude: number;
  place: {
    city: string;
    country: string;
  };
}

export class DynamoModel extends Document {
  pk: string;
  sk: string;
  username: string;
  type?: string;
  cryptos: string[];
  location: ILocation;
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
    type: {
      type: String,
    },
    username: {
      type: String,
    },
    cryptos: {
      type: String,
    },
    location: {
      type: Object,
      schema: {
        latitude: Number,
        longitude: Number,
        place: {
          type: Object,
          schema: {
            city: String,
            country: String,
          },
        },
      },
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

export const getUser = async ({ userId }) => {
  return Model.get({ pk: "user", sk: userId });
};

export const getWaitingFor = async ({
  userId,
}: {
  userId: string;
}): Promise<string | void> => {
  const { type } =
    (await Model.get({
      pk: "waitingFor",
      sk: userId,
    })) || {};
  return type;
};

export const storeWaitingFor = async ({
  userId,
  type,
}: {
  userId: string;
  type: string;
}) => {
  const model = new Model({
    pk: "waitingFor",
    sk: userId,
    type,
  });
  await model.save();
};

export const removeWaitingFor = async ({ userId }: { userId: string }) => {
  await Model.delete({
    pk: "waitingFor",
    sk: userId,
  });
};

export const storeLocation = async ({
  userId,
  location: {
    latitude,
    longitude,
    place: { city, country },
  },
}: {
  userId: string;
  location: ILocation;
}) => {
  await Model.update({
    pk: "user",
    sk: userId,
    location: {
      latitude,
      longitude,
      place: {
        city,
        country,
      },
    },
  });
};

export const removeLocation = async ({ userId }: { userId: string }) => {
  await Model.update(
    {
      pk: "user",
      sk: userId,
    },
    {
      $REMOVE: { location: null },
    } as any
  );
};

export const storeNewCrypto = async ({ userId, symbol }) => {
  await Model.update(
    {
      pk: "user",
      sk: userId,
    },
    {
      $ADD: { cryptos: [symbol] },
    } as any
  );
};
