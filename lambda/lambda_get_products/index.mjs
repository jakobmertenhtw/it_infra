import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";

const dynamo = new DynamoDBClient();
const TABLE_NAME = "jakob-team-table";

export const handler = async (event) => {
  try {
    const params = { TableName: TABLE_NAME };

    // Check for 'labels' query param and add filter if present
    const label = event.queryStringParameters?.labels;

    console.log("Received query parameters:", event.queryStringParameters);
    console.log("Label filter:", label);

    if (label) {
      const labels = label.split(",");
      params.FilterExpression = labels
        .map((_, i) => `contains(labels, :label${i})`)
        .join(" OR ");
      params.ExpressionAttributeValues = labels.reduce((acc, label, index) => {
        acc[`:label${index}`] = { S: label.trim() };
        return acc;
      }, {});
    }

    // Scan the table to retrieve items (filtered if label is present)
    const result = await dynamo.send(new ScanCommand(params));

    // Convert DynamoDB items to plain JS objects
    const items = result.Items
      ? result.Items.map((item) =>
          Object.fromEntries(
            Object.entries(item).map(([k, v]) => [k, Object.values(v)[0]])
          )
        )
      : [];

    return {
      statusCode: 200,
      body: JSON.stringify(items),
      headers: { "Content-Type": "application/json" },
    };
  } catch (error) {
    console.error("Error fetching items:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Internal Server Error",
        error: error.message,
      }),
      headers: { "Content-Type": "application/json" },
    };
  }
};
