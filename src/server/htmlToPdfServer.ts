import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { execSync } from 'child_process';
import puppeteer from 'puppeteer-core';

export interface ServerHtmlToPdfOptions {
  url?: string;
  htmlContent?: string;
  pageSize?: 'a4' | 'letter' | 'legal';
  orientation?: 'portrait' | 'landscape';
  printBackground?: boolean;
}

export interface ServerHtmlToPdfResult {
  pdfBuffer: Buffer;
  pageCount: number;
  fileSize: number;
}

/**
 * Finds the local Chromium / Edge / Chrome executable path on the host system.
 */
export function findChromiumExecutablePath(): string {
  const possiblePaths = [
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }

  throw new Error(
    'No compatible Chromium/Edge/Chrome browser found on the server to execute headless vector PDF printing.'
  );
}

/**
 * Server-Side HTML & Webpage to Vector PDF Converter
 * Uses Chromium Headless to generate a true Vector PDF where all text
 * is selectable, searchable, and CSS styles/backgrounds are preserved.
 */
export async function convertHtmlOrUrlToPdfOnServer(
  options: ServerHtmlToPdfOptions
): Promise<ServerHtmlToPdfResult> {
  const {
    url,
    htmlContent,
    pageSize = 'a4',
    orientation = 'portrait',
    printBackground = true,
  } = options;

  if (!url && !htmlContent) {
    throw new Error('Either a valid website URL or HTML code content must be provided.');
  }

  const executablePath = findChromiumExecutablePath();
  const format = pageSize === 'letter' ? 'Letter' : pageSize === 'legal' ? 'Legal' : 'A4';
  const landscape = orientation === 'landscape';

  let browser: any = null;

  try {
    // 1. Programmatic Puppeteer-Core Headless Launch
    browser = await puppeteer.launch({
      executablePath,
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--run-all-compositor-stages-before-draw',
      ],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 960, deviceScaleFactor: 1 });

    if (url && url.trim().length > 0) {
      let targetUrl = url.trim();
      if (!/^https?:\/\//i.test(targetUrl)) {
        targetUrl = `https://${targetUrl}`;
      }

      await page.goto(targetUrl, {
        waitUntil: 'networkidle2',
        timeout: 35000,
      });
    } else if (htmlContent) {
      await page.setContent(htmlContent, {
        waitUntil: 'networkidle0',
        timeout: 30000,
      });
    }

    // Step C: Generate Native Vector PDF
    const pdfUint8Array = await page.pdf({
      format: format as any,
      landscape,
      printBackground: Boolean(printBackground),
      preferCSSPageSize: true,
      margin: {
        top: '10mm',
        right: '10mm',
        bottom: '10mm',
        left: '10mm',
      },
    });

    await browser.close();
    browser = null;

    const outputBuffer = Buffer.from(pdfUint8Array);

    // Step D: Buffer Validation
    if (outputBuffer.length < 500) {
      throw new Error('Chromium headless rendering produced an incomplete or empty PDF buffer.');
    }

    return {
      pdfBuffer: outputBuffer,
      pageCount: 1,
      fileSize: outputBuffer.length,
    };
  } catch (puppeteerErr: unknown) {
    if (browser) {
      try {
        await browser.close();
      } catch {
        // ignore
      }
    }

    // 2. Resilient CLI Fallback if CDP communication has pipe restrictions
    try {
      const tempDir = os.tmpdir();
      const tempHtmlPath = path.join(tempDir, `kanto_temp_${Date.now()}.html`);
      const tempPdfPath = path.join(tempDir, `kanto_temp_${Date.now()}.pdf`);

      let targetSource = '';
      if (url && url.trim().length > 0) {
        let targetUrl = url.trim();
        if (!/^https?:\/\//i.test(targetUrl)) targetUrl = `https://${targetUrl}`;
        targetSource = `"${targetUrl}"`;
      } else {
        fs.writeFileSync(tempHtmlPath, htmlContent || '<!DOCTYPE html><html><body></body></html>', 'utf-8');
        targetSource = `"${tempHtmlPath}"`;
      }

      const landscapeFlag = landscape ? ' --landscape' : '';
      const cmd = `"${executablePath}" --headless --disable-gpu --no-pdf-header-footer${landscapeFlag} --print-to-pdf="${tempPdfPath}" ${targetSource}`;

      execSync(cmd, { timeout: 35000 });

      if (fs.existsSync(tempPdfPath)) {
        const outputBuffer = fs.readFileSync(tempPdfPath);

        try {
          if (fs.existsSync(tempHtmlPath)) fs.unlinkSync(tempHtmlPath);
          if (fs.existsSync(tempPdfPath)) fs.unlinkSync(tempPdfPath);
        } catch {
          // ignore cleanup
        }

        if (outputBuffer.length < 500) {
          throw new Error('Chromium CLI fallback produced an empty PDF buffer.');
        }

        return {
          pdfBuffer: outputBuffer,
          pageCount: 1,
          fileSize: outputBuffer.length,
        };
      }
    } catch (cliErr: unknown) {
      throw new Error(
        `Failed to convert webpage to vector PDF: ${puppeteerErr instanceof Error ? puppeteerErr.message : String(puppeteerErr)} (CLI Fallback: ${cliErr instanceof Error ? cliErr.message : String(cliErr)})`
      );
    }

    throw puppeteerErr;
  }
}
