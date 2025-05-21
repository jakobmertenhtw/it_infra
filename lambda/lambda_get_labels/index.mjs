import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";

const dynamo = new DynamoDBClient();
const TABLE_NAME = "jakob-team-table-labels";

export const handler = async (event) => {
  try {
    // Scan the table to retrieve all items
    const result = await dynamo.send(
      new ScanCommand({ TableName: TABLE_NAME })
    );

    // Convert DynamoDB items to plain JS objects
    const items = result.Items
      ? result.Items.map(item =>
          Object.fromEntries(
            Object.entries(item).map(([k, v]) => [k, Object.values(v)[0]])
          )
        )
      : [];

    return {
      statusCode: 200,
      body: JSON.stringify(items),
      headers: { "Content-Type": "application/json" }
    };
  } catch (error) {
    console.error("Error fetching items:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error", error: error.message }),
      headers: { "Content-Type": "application/json" }
    };
  }
};