import { Context, APIGatewayProxyResult } from "aws-lambda";
import * as puppeteer from "puppeteer";

import { Event, s3Upload } from "shared";

export const handler = async (
  event: Event,
  context: Context
): Promise<APIGatewayProxyResult> => {
  try {
    const { url } = event;

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);
    const html = await page.content();
    await browser.close();

    const browser2 = await puppeteer.launch();
    const page2 = await browser2.newPage();
    await page2.setContent(html);
    const pdfBuffer = await page2.pdf();
    await browser2.close();

    await s3Upload({
      bucketName: event.bucketName,
      key: event.key,
      file: pdfBuffer,
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
