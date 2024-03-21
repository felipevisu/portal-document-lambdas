import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

export const handler = async (event) => {
  try {
    const { url } = event;

    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });
    const page = await browser.newPage();
    await page.goto(url);
    const html = await page.content();

    // Step 3: Convert HTML to PDF
    const pdfBuffer = await page.pdf();

    await browser.close();

    console.log(pdfBuffer);

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

const response = await handler({
  url: "https://www.visualizecomunicacao.com.br/",
  bucketName: "portal-docker-config",
  key: "site.pdf",
});

console.log(response);
