import { Context, APIGatewayProxyResult } from "aws-lambda";
import axios from "axios";

import { Event, s3Upload } from "shared";

export const handler = async (
  event: Event,
  context: Context
): Promise<APIGatewayProxyResult> => {
  try {
    const response = await axios.get<Buffer>(event.url, {
      responseType: "arraybuffer",
    });

    await s3Upload({
      bucketName: event.bucketName,
      key: event.key,
      file: response.data,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "File uploaded successfully to S3" }),
    };
  } catch (error) {
    console.error("Error downloading or uploading file:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error downloading or uploading file" }),
    };
  }
};
