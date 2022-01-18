import AWS from "aws-sdk";
import { CustomContext } from "@functions/handler/handler";
import differenceInSeconds from "date-fns/differenceInSeconds";
import format from "date-fns/format";
import * as chrono from "chrono-node";

const stepfunctions = new AWS.StepFunctions();

const { REMINDER_FUNCTION_ARN } = process.env;

export default async (ctx: CustomContext) => {
  const message = ctx.data?.text || "";
  const { text } = chrono.parse(message)[0];

  const date = chrono.parseDate(message);

  const reminder = message.replace("/remind", "").replace(text, "");

  await ctx.reply(
    `Cool! I'll remind you about "${reminder.trim()}" at ${format(
      date,
      "dd/MM/yyyy HH:mm:ss"
    )}`
  );

  const delay = differenceInSeconds(date, new Date());

  await stepfunctions
    .startExecution({
      stateMachineArn: REMINDER_FUNCTION_ARN,
      input: JSON.stringify({
        expiry: delay,
        chatId: ctx.data.user.id,
        message: reminder,
      }),
    })
    .promise();
};
