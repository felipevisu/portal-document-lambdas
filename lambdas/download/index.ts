import { Context, APIGatewayProxyResult } from "aws-lambda";
import axios from "axios";
import {
  S3Client,
  PutObjectCommand,
  PutObjectCommandInput,
} from "@aws-sdk/client-s3";

interface Event {
  url: string;
  bucketName: string;
  key: string;
}

export const handler = async (
  event: Event,
  context: Context
): Promise<APIGatewayProxyResult> => {
  const s3Client = new S3Client({});

  try {
    const response = await axios.get<Buffer>(event.url, {
      responseType: "arraybuffer",
    });

    const params: PutObjectCommandInput = {
      Bucket: event.bucketName,
      Key: event.key,
      Body: response.data,
    };

    await s3Client.send(new PutObjectCommand(params));

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
