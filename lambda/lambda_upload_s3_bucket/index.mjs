import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import parser from "lambda-multipart-parser";

import { randomUUID } from "crypto";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
const s3 = new S3Client();

const dynamo = new DynamoDBClient({ region: "eu-west-1" });
const sns = new SNSClient({ region: "eu-west-1" });
const TABLE_NAME = "jakob-team-table";
const SNS_TOPIC_ARN = "arn:aws:sns:eu-west-1:788174142154:jakob-team-topic";

export const handler = async (event) => {
  try {
    const { files, name, description, price } = await parser.parse(event);

    console.log("Parsed fields:", name, description, price);

    // Assume only one file is uploaded; adjust if multiple
    const file = files[0];
    if (!file) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "No file uploaded" }),
      };
    }

    const id = randomUUID();

    //const { name, description, price } = fields;

    const item = {
      id: { S: id },
      name: { S: name },
      description: { S: description },
      price: { N: price },
    };

    // Write to DynamoDB
    await dynamo.send(
      new PutItemCommand({
        TableName: TABLE_NAME,
        Item: item,
      })
    );

    // Publish to SNS
    await sns.send(
      new PublishCommand({
        TopicArn: SNS_TOPIC_ARN,
        Message: JSON.stringify({ id, ...item }),
        Subject: "New Item Created",
      })
    );

    // Prepare S3 upload parameters
    const params = {
      Bucket: process.env.S3_BUCKET_NAME, // Set your bucket name in environment variables
      Key: id,
      Body: file.content,
      ContentType: file.contentType,
    };

    const command = new PutObjectCommand(params);

    // Upload to S3
    const uploadResult = await s3.send(command);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers":
          "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
      },
      body: JSON.stringify({
        message: "Product created successfully",
        id,
      }),
    };
  } catch (error) {
    console.error("Upload error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error uploading file" }),
    };
  }
};
