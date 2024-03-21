import { Context, APIGatewayProxyResult } from "aws-lambda";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

import { Event, s3Upload } from "shared";

export const handler = async (
  event: Event,
  context: Context
): Promise<APIGatewayProxyResult> => {
  try {
    const { url } = event;

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
    await page.goto(url);
    const html = await page.content();

    // Step 3: Convert HTML to PDF
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
