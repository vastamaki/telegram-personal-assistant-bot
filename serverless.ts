import type { AWS } from "@serverless/typescript";

import handler from "@functions/handler";
import reminder from "@functions/reminder";

interface CustomAWS extends AWS {
  stepFunctions: any;
}

const serverlessConfiguration: CustomAWS = {
  service: "telegram-personal-assistant-bot",
  frameworkVersion: "2",
  plugins: [
    "serverless-esbuild",
    "serverless-dotenv-plugin",
    "serverless-step-functions",
  ],
  provider: {
    name: "aws",
    runtime: "nodejs14.x",
    region: "eu-north-1",
    profile: "personal",
    stage: "${opt:stage, 'dev'}",
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      NODE_OPTIONS: "--enable-source-maps --stack-trace-limit=1000",
      DYNAMODB_TABLE_NAME: "${self:service}",
      REMINDER_FUNCTION_ARN: {
        "Fn::GetAtt": ["ReminderMachineStepFunctionsStateMachine", "Arn"],
      },
    },
    lambdaHashingVersion: "20201221",
    iamRoleStatements: [
      {
        Effect: "Allow",
        Action: [
          "dynamodb:Query",
          "dynamodb:GetItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:PutItem",
          "dynamodb:DescribeTable",
        ],
        Resource: { "Fn::GetAtt": ["DynamoTable", "Arn"] },
      },
      {
        Effect: "Allow",
        Action: ["states:StartExecution"],
        Resource: {
          "Fn::GetAtt": ["ReminderMachineStepFunctionsStateMachine", "Arn"],
        },
      },
    ],
  },
  // import the function via paths
  functions: { handler, reminder },
  stepFunctions: {
    stateMachines: {
      reminderMachine: {
        definition: {
          Comment: "Reminder wait state",
          StartAt: "Wait",
          States: {
            Wait: {
              Type: "Wait",
              SecondsPath: "$.expiry",
              Next: "sendReminder",
            },
            sendReminder: {
              Type: "Task",
              Resource: {
                "Fn::Join": [
                  "",
                  [
                    "arn:aws:lambda:",
                    {
                      Ref: "AWS::Region",
                    },
                    ":",
                    {
                      Ref: "AWS::AccountId",
                    },
                    ":function:",
                    "${self:service}",
                    "-${self:provider.stage}",
                    "-reminder",
                  ],
                ],
              },
              End: true,
            },
          },
        },
      },
    },
  },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ["aws-sdk"],
      target: "node14",
      define: { "require.resolve": undefined },
      platform: "node",
      concurrency: 10,
    },
  },
  resources: {
    Resources: {
      DynamoTable: {
        Type: "AWS::DynamoDB::Table",
        Properties: {
          TableName: "${self:provider.environment.DYNAMODB_TABLE_NAME}",
          ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1,
          },
          AttributeDefinitions: [
            {
              AttributeName: "pk",
              AttributeType: "S",
            },
            {
              AttributeName: "sk",
              AttributeType: "S",
            },
          ],
          KeySchema: [
            {
              AttributeName: "pk",
              KeyType: "HASH",
            },
            {
              AttributeName: "sk",
              KeyType: "RANGE",
            },
          ],
        },
      },
    },
  },
};

module.exports = serverlessConfiguration;
