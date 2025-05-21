import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { PollyClient, SynthesizeSpeechCommand } from "@aws-sdk/client-polly";

const s3 = new S3Client();

const dynamo = new DynamoDBClient({ region: "eu-west-1" });
const polly = new PollyClient({ region: "eu-west-1" });
const TABLE_NAME = "jakob-team-table";

export const handler = async (event) => {
  try {
    const { id, description } = JSON.parse(event.Records[0].Sns.Message);

    const textId = typeof id === "object" ? id.S : id;

    const textDescription =
      typeof description === "object" ? description.S : description;

    const synthRes = await polly.send(
      new SynthesizeSpeechCommand({
        Text: textDescription,
        OutputFormat: "mp3",
        VoiceId: "Joanna",
      })
    );

    const audioData = await synthRes.AudioStream?.transformToByteArray();

    await s3.send(
      new PutObjectCommand({
        Bucket: "jakob-team-audio-files",
        Key: `${textId}.mp3`,
        Body: audioData,
      })
    );
  } catch (error) {
    console.error("Upload error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error uploading file" }),
    };
  }
};
