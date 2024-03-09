import { Context, APIGatewayProxyResult } from "aws-lambda";
import axios from "axios";
import {
  S3Client,
  PutObjectCommand,
  CreateBucketCommand,
  DeleteObjectCommand,
  DeleteBucketCommand,
  paginateListObjectsV2,
  GetObjectCommand,
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
  console.log(`Event: ${JSON.stringify(event, null, 2)}`);
  console.log(`Context: ${JSON.stringify(context, null, 2)}`);

  const s3Client = new S3Client({});

  const url = event.url;
  const bucketName = event.bucketName;
  const key = event.key;

  try {
    const response = await axios.get<Buffer>(url, {
      responseType: "arraybuffer",
    });

    const params = {
      Bucket: bucketName,
      Key: key,
      Body: response.data,
    };

    console.log(`Params: ${JSON.stringify(params, null, 2)}`);

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
