import { Context, APIGatewayProxyResult } from "aws-lambda";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

import { s3Upload } from "shared";

interface Event {
  content: string;
  contentType: "url" | "html";
  bucketName: string;
  key: string;
}

export const handler = async (
  event: Event,
  context: Context
): Promise<APIGatewayProxyResult> => {
  try {
    const { content, contentType } = event;

    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(
        "/opt/node_modules/@sparticuz/chromium/bin"
      ),
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();
    const isHTML = contentType === "html";

    if (isHTML) {
      await page.setContent(content);
    } else {
      await page.goto(content);
      await page.content();
    }

    const pdfBuffer = await page.pdf();
    await browser.close();

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
