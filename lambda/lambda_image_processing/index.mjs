import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import {
  DynamoDBClient,
  PutItemCommand,
  GetItemCommand,
  UpdateItemCommand
} from "@aws-sdk/client-dynamodb";
import {
  RekognitionClient,
  DetectLabelsCommand,
} from "@aws-sdk/client-rekognition";

const s3 = new S3Client();
const rekognition = new RekognitionClient({ region: "eu-west-1" });

const dynamo = new DynamoDBClient({ region: "eu-west-1" });
const BASE_TABLE_NAME = "jakob-team-table";
const LABEL_TABLE_NAME = "jakob-team-table-labels";

const S3_BUCKET_NAME = "jakob-team-product-images";

export const handler = async (event) => {
  try {
    const { id } = JSON.parse(event.Records[0].Sns.Message);
    const textId = typeof id === "object" ? id.S : id;

    // get the image from S3
    const s3Params = {
      Bucket: S3_BUCKET_NAME,
      Key: textId,
    };
    const imageObject = await s3.send(new GetObjectCommand(s3Params));
    const imageBuffer = await streamToBuffer(imageObject.Body);

    // detect labels wth rekognition
    const detectParams = {
      Image: { Bytes: imageBuffer },
      MaxLabels: 2,
    };
    const detectResult = await rekognition.send(
      new DetectLabelsCommand(detectParams)
    );
    const newLabels = detectResult.Labels.map((label) => ({
      name: label.Name,
    }));

    // save the labels to DynamoDB
    for (const lbl of newLabels) {
      const checkLabelParams = {
        TableName: LABEL_TABLE_NAME,
        Key: { name: { S: lbl.name } },
      };
      const existingLabel = await dynamo.send(
        new GetItemCommand(checkLabelParams)
      );
      if (!existingLabel.Item) {
        const putLabelParams = {
          TableName: LABEL_TABLE_NAME,
          Item: {
            name: { S: lbl.name },
          },
        };
        await dynamo.send(new PutItemCommand(putLabelParams));
      }
    }

    // update base table item with the new labels
    const updateParams = {
      TableName: BASE_TABLE_NAME,
      Key: { id: { S: textId } },
      UpdateExpression:
        "SET labels = list_append(if_not_exists(labels, :empty_list), :new_labels)",
      ExpressionAttributeValues: {
        ":new_labels": { L: newLabels.map((label) => ({ S: label.name })) },
        ":empty_list": { L: [] },
      },
      ReturnValues: "UPDATED_NEW",
    };
    await dynamo.send(new UpdateItemCommand(updateParams));

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Success" }),
    };
  } catch (error) {
    console.error("Error processing SNS message:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error uploading file" }),
    };
  }
};

// Helper to convert readable streams to buffer
async function streamToBuffer(readableStream) {
  const chunks = [];
  for await (const chunk of readableStream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}
