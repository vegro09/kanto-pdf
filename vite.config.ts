import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { convertPptxBufferToPdf } from './src/server/pptxToPdfConverter';
import { protectPdfBufferOnServer } from './src/server/protectPdfServer';
import { unlockPdfBufferOnServer } from './src/server/unlockPdfServer';
import { convertHtmlOrUrlToPdfOnServer } from './src/server/htmlToPdfServer';
import { convertPdfToPdfaServer } from './src/server/pdfaServer';
import { repairPdfBufferOnServer } from './src/server/repairPdfServer';

function pptxToPdfApiPlugin(): Plugin {
  return {
    name: 'pptx-to-pdf-api',
    configureServer(server) {
      server.middlewares.use('/api/convert/pptx-to-pdf', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Method Not Allowed. POST required.' }));
          return;
        }

        try {
          const chunks: Buffer[] = [];
          req.on('data', chunk => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));

          req.on('end', async () => {
            try {
              const fullBuffer = Buffer.concat(chunks);
              let pptxBuffer: Buffer = fullBuffer;

              const contentType = req.headers['content-type'] || '';
              if (contentType.includes('multipart/form-data')) {
                const pkIndex = fullBuffer.indexOf(Buffer.from([0x50, 0x4B, 0x03, 0x04]));
                if (pkIndex !== -1) {
                  const lastPk = fullBuffer.lastIndexOf(Buffer.from([0x50, 0x4B, 0x05, 0x06]));
                  if (lastPk !== -1) {
                    pptxBuffer = fullBuffer.subarray(pkIndex, lastPk + 22);
                  } else {
                    pptxBuffer = fullBuffer.subarray(pkIndex);
                  }
                }
              }

              const result = await convertPptxBufferToPdf(pptxBuffer);

              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/pdf');
              res.setHeader('Content-Disposition', 'attachment; filename="converted_presentation.pdf"');
              res.setHeader('Content-Length', result.pdfBuffer.byteLength.toString());
              res.end(Buffer.from(result.pdfBuffer));
            } catch (err: unknown) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: `Server-side conversion failed: ${String(err)}` }));
            }
          });
        } catch (err: unknown) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: `Server error: ${String(err)}` }));
        }
      });
    },
  };
}

function protectPdfApiPlugin(): Plugin {
  return {
    name: 'protect-pdf-api',
    configureServer(server) {
      const handler = async (req: any, res: any) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Method Not Allowed. POST required.' }));
          return;
        }

        try {
          const chunks: Buffer[] = [];
          req.on('data', (chunk: any) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));

          req.on('end', async () => {
            try {
              const fullBuffer = Buffer.concat(chunks);
              const contentType = req.headers['content-type'] || '';

              let pdfBuffer: Buffer = Buffer.alloc(0);
              let userPassword = '';
              let ownerPassword = '';
              let allowPrinting = false;
              let allowCopying = false;
              let allowModifying = false;
              let allowAnnotating = false;
              let pages: any[] = [];

              if (contentType.includes('application/json')) {
                const json = JSON.parse(fullBuffer.toString('utf-8'));
                if (json.pdfBase64) {
                  pdfBuffer = Buffer.from(json.pdfBase64, 'base64');
                }
                userPassword = json.password || json.userPassword || '';
                ownerPassword = json.ownerPassword || userPassword;
                allowPrinting = Boolean(json.allowPrinting);
                allowCopying = Boolean(json.allowCopying);
                allowModifying = Boolean(json.allowModifying);
                allowAnnotating = Boolean(json.allowAnnotating);
                if (Array.isArray(json.pages)) {
                  pages = json.pages;
                }
              } else if (contentType.includes('multipart/form-data')) {
                const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
                const boundary = boundaryMatch ? (boundaryMatch[1] || boundaryMatch[2]) : '';

                if (boundary) {
                  const boundaryBuf = Buffer.from(`--${boundary}`);
                  let start = 0;

                  while (start < fullBuffer.length) {
                    const nextBoundary = fullBuffer.indexOf(boundaryBuf, start);
                    if (nextBoundary === -1) break;

                    const partStart = nextBoundary + boundaryBuf.length;
                    const headerEnd = fullBuffer.indexOf(Buffer.from('\r\n\r\n'), partStart);
                    if (headerEnd === -1) break;

                    const headers = fullBuffer.subarray(partStart, headerEnd).toString('utf-8');
                    const nextPart = fullBuffer.indexOf(boundaryBuf, headerEnd + 4);
                    const partDataEnd = nextPart !== -1 ? nextPart - 2 : fullBuffer.length;
                    const partData = fullBuffer.subarray(headerEnd + 4, partDataEnd);

                    if (headers.includes('name="password"') || headers.includes('name="userPassword"') || headers.includes('name="currentPassword"')) {
                      userPassword = partData.toString('utf-8').trim();
                    } else if (headers.includes('name="ownerPassword"')) {
                      ownerPassword = partData.toString('utf-8').trim();
                    } else if (headers.includes('name="allowPrinting"')) {
                      allowPrinting = partData.toString('utf-8').trim() === 'true';
                    } else if (headers.includes('name="allowCopying"')) {
                      allowCopying = partData.toString('utf-8').trim() === 'true';
                    } else if (headers.includes('name="pages"')) {
                      try {
                        pages = JSON.parse(partData.toString('utf-8'));
                      } catch {
                        // ignore
                      }
                    } else if (headers.includes('filename=') || headers.includes('name="file"')) {
                      const pdfStart = partData.indexOf(Buffer.from('%PDF-'));
                      if (pdfStart !== -1) {
                        pdfBuffer = Buffer.from(partData.subarray(pdfStart));
                      } else {
                        pdfBuffer = Buffer.from(partData);
                      }
                    }

                    start = nextPart !== -1 ? nextPart : fullBuffer.length;
                  }
                }
              }

              if (pdfBuffer.length === 0 && (!pages || pages.length === 0)) {
                const pdfStart = fullBuffer.indexOf(Buffer.from('%PDF-'));
                if (pdfStart !== -1) {
                  pdfBuffer = Buffer.from(fullBuffer.subarray(pdfStart));
                } else {
                  pdfBuffer = fullBuffer;
                }
              }

              if (!userPassword) {
                userPassword = (req.headers['x-pdf-password'] as string) || '';
              }

              const result = await protectPdfBufferOnServer(pdfBuffer, {
                userPassword,
                ownerPassword: ownerPassword || userPassword,
                allowPrinting,
                allowCopying,
                allowModifying,
                allowAnnotating,
                pages,
              });

              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/pdf');
              res.setHeader('Content-Disposition', 'attachment; filename="kanto-locked.pdf"');
              res.setHeader('Content-Length', result.pdfBuffer.byteLength.toString());
              res.end(result.pdfBuffer);
            } catch (err: unknown) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: `Server-side encryption failed: ${String(err)}` }));
            }
          });
        } catch (err: unknown) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: `Server error: ${String(err)}` }));
        }
      };

      server.middlewares.use('/api/protect-pdf', handler);
      server.middlewares.use('/api/protect', handler);
    },
  };
}

function unlockPdfApiPlugin(): Plugin {
  return {
    name: 'unlock-pdf-api',
    configureServer(server) {
      const handler = async (req: any, res: any) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Method Not Allowed. POST required.' }));
          return;
        }

        try {
          const chunks: Buffer[] = [];
          req.on('data', (chunk: any) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));

          req.on('end', async () => {
            try {
              const fullBuffer = Buffer.concat(chunks);
              const contentType = req.headers['content-type'] || '';

              let pdfBuffer: Buffer = Buffer.alloc(0);
              let password = '';
              let pages: any[] = [];

              if (contentType.includes('application/json')) {
                const json = JSON.parse(fullBuffer.toString('utf-8'));
                if (json.pdfBase64) {
                  pdfBuffer = Buffer.from(json.pdfBase64, 'base64');
                }
                password = json.password || json.currentPassword || '';
                if (Array.isArray(json.pages)) {
                  pages = json.pages;
                }
              } else if (contentType.includes('multipart/form-data')) {
                const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
                const boundary = boundaryMatch ? (boundaryMatch[1] || boundaryMatch[2]) : '';

                if (boundary) {
                  const boundaryBuf = Buffer.from(`--${boundary}`);
                  let start = 0;

                  while (start < fullBuffer.length) {
                    const nextBoundary = fullBuffer.indexOf(boundaryBuf, start);
                    if (nextBoundary === -1) break;

                    const partStart = nextBoundary + boundaryBuf.length;
                    const headerEnd = fullBuffer.indexOf(Buffer.from('\r\n\r\n'), partStart);
                    if (headerEnd === -1) break;

                    const headers = fullBuffer.subarray(partStart, headerEnd).toString('utf-8');
                    const nextPart = fullBuffer.indexOf(boundaryBuf, headerEnd + 4);
                    const partDataEnd = nextPart !== -1 ? nextPart - 2 : fullBuffer.length;
                    const partData = fullBuffer.subarray(headerEnd + 4, partDataEnd);

                    if (
                      headers.includes('name="password"') ||
                      headers.includes('name="currentPassword"') ||
                      headers.includes('name="userPassword"')
                    ) {
                      password = partData.toString('utf-8').trim();
                    } else if (headers.includes('name="pages"')) {
                      try {
                        pages = JSON.parse(partData.toString('utf-8'));
                      } catch {
                        // ignore
                      }
                    } else if (headers.includes('filename=') || headers.includes('name="file"')) {
                      const pdfStart = partData.indexOf(Buffer.from('%PDF-'));
                      if (pdfStart !== -1) {
                        pdfBuffer = Buffer.from(partData.subarray(pdfStart));
                      } else {
                        pdfBuffer = Buffer.from(partData);
                      }
                    }

                    start = nextPart !== -1 ? nextPart : fullBuffer.length;
                  }
                }
              }

              if (pdfBuffer.length === 0 && (!pages || pages.length === 0)) {
                const pdfStart = fullBuffer.indexOf(Buffer.from('%PDF-'));
                if (pdfStart !== -1) {
                  pdfBuffer = Buffer.from(fullBuffer.subarray(pdfStart));
                } else {
                  pdfBuffer = fullBuffer;
                }
              }

              if (!password) {
                password = (req.headers['x-pdf-password'] as string) || '';
              }

              const result = await unlockPdfBufferOnServer(pdfBuffer, {
                password,
                pages,
              });

              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/pdf');
              res.setHeader('Content-Disposition', 'attachment; filename="kanto-unlocked.pdf"');
              res.setHeader('Content-Length', result.pdfBuffer.byteLength.toString());
              res.end(result.pdfBuffer);
            } catch (err: any) {
              const statusCode = err.statusCode === 401 || err.code === 'INVALID_PASSWORD' ? 401 : 500;
              res.statusCode = statusCode;
              res.setHeader('Content-Type', 'application/json');
              res.end(
                JSON.stringify({
                  error: err.message || 'Server-side decryption failed.',
                  code: err.code || (statusCode === 401 ? 'INVALID_PASSWORD' : 'SERVER_ERROR'),
                })
              );
            }
          });
        } catch (err: unknown) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: `Server error: ${String(err)}` }));
        }
      };

      server.middlewares.use('/api/unlock-pdf', handler);
      server.middlewares.use('/api/unlock', handler);
    },
  };
}

function htmlToPdfApiPlugin(): Plugin {
  return {
    name: 'html-to-pdf-api',
    configureServer(server) {
      const handler = async (req: any, res: any) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Method Not Allowed. POST required.' }));
          return;
        }

        try {
          const chunks: Buffer[] = [];
          req.on('data', (chunk: any) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));

          req.on('end', async () => {
            try {
              const fullBuffer = Buffer.concat(chunks);
              const contentType = req.headers['content-type'] || '';

              let url = '';
              let htmlContent = '';
              let pageSize: 'a4' | 'letter' | 'legal' = 'a4';
              let orientation: 'portrait' | 'landscape' = 'portrait';
              let printBackground = true;

              if (contentType.includes('application/json')) {
                const json = JSON.parse(fullBuffer.toString('utf-8'));
                url = json.url || '';
                htmlContent = json.htmlContent || json.html || '';
                pageSize = json.pageSize || 'a4';
                orientation = json.orientation || 'portrait';
                printBackground = json.printBackground !== undefined ? Boolean(json.printBackground) : true;
              } else if (contentType.includes('multipart/form-data')) {
                const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
                const boundary = boundaryMatch ? (boundaryMatch[1] || boundaryMatch[2]) : '';

                if (boundary) {
                  const boundaryBuf = Buffer.from(`--${boundary}`);
                  let start = 0;

                  while (start < fullBuffer.length) {
                    const nextBoundary = fullBuffer.indexOf(boundaryBuf, start);
                    if (nextBoundary === -1) break;

                    const partStart = nextBoundary + boundaryBuf.length;
                    const headerEnd = fullBuffer.indexOf(Buffer.from('\r\n\r\n'), partStart);
                    if (headerEnd === -1) break;

                    const headers = fullBuffer.subarray(partStart, headerEnd).toString('utf-8');
                    const nextPart = fullBuffer.indexOf(boundaryBuf, headerEnd + 4);
                    const partDataEnd = nextPart !== -1 ? nextPart - 2 : fullBuffer.length;
                    const partData = fullBuffer.subarray(headerEnd + 4, partDataEnd);

                    if (headers.includes('name="url"')) {
                      url = partData.toString('utf-8').trim();
                    } else if (headers.includes('name="htmlContent"') || headers.includes('name="html"') || headers.includes('filename=')) {
                      htmlContent = partData.toString('utf-8');
                    } else if (headers.includes('name="pageSize"')) {
                      pageSize = partData.toString('utf-8').trim() as any;
                    } else if (headers.includes('name="orientation"')) {
                      orientation = partData.toString('utf-8').trim() as any;
                    } else if (headers.includes('name="printBackground"')) {
                      printBackground = partData.toString('utf-8').trim() === 'true';
                    }

                    start = nextPart !== -1 ? nextPart : fullBuffer.length;
                  }
                }
              }

              const result = await convertHtmlOrUrlToPdfOnServer({
                url,
                htmlContent,
                pageSize,
                orientation,
                printBackground,
              });

              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/pdf');
              res.setHeader('Content-Disposition', 'attachment; filename="kanto-webpage.pdf"');
              res.setHeader('Content-Length', result.pdfBuffer.byteLength.toString());
              res.end(result.pdfBuffer);
            } catch (err: unknown) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(
                JSON.stringify({
                  error: err instanceof Error ? err.message : String(err),
                  code: 'HTML_CONVERSION_ERROR',
                })
              );
            }
          });
        } catch (err: unknown) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: `Server error: ${String(err)}` }));
        }
      };

      server.middlewares.use('/api/html-to-pdf', handler);
      server.middlewares.use('/api/convert/html-to-pdf', handler);
    },
  };
}

function pdfaApiPlugin(): Plugin {
  return {
    name: 'pdfa-api',
    configureServer(server) {
      const handler = async (req: any, res: any) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Method Not Allowed. POST required.' }));
          return;
        }

        try {
          const chunks: Buffer[] = [];
          req.on('data', (chunk: any) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));

          req.on('end', async () => {
            try {
              const fullBuffer = Buffer.concat(chunks);
              const contentType = req.headers['content-type'] || '';

              let pdfBuffer: Buffer = Buffer.alloc(0);
              let pdfaLevel: '1b' | '2b' | '3b' = '1b';
              let title = 'Archived Document';

              if (contentType.includes('application/json')) {
                const json = JSON.parse(fullBuffer.toString('utf-8'));
                if (json.pdfBase64) {
                  pdfBuffer = Buffer.from(json.pdfBase64, 'base64');
                }
                if (json.pdfaLevel) pdfaLevel = json.pdfaLevel;
                if (json.title) title = json.title;
              } else if (contentType.includes('multipart/form-data')) {
                const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
                const boundary = boundaryMatch ? (boundaryMatch[1] || boundaryMatch[2]) : '';

                if (boundary) {
                  const boundaryBuf = Buffer.from(`--${boundary}`);
                  let start = 0;

                  while (start < fullBuffer.length) {
                    const nextBoundary = fullBuffer.indexOf(boundaryBuf, start);
                    if (nextBoundary === -1) break;

                    const partStart = nextBoundary + boundaryBuf.length;
                    const headerEnd = fullBuffer.indexOf(Buffer.from('\r\n\r\n'), partStart);
                    if (headerEnd === -1) break;

                    const headers = fullBuffer.subarray(partStart, headerEnd).toString('utf-8');
                    const nextPart = fullBuffer.indexOf(boundaryBuf, headerEnd + 4);
                    const partDataEnd = nextPart !== -1 ? nextPart - 2 : fullBuffer.length;
                    const partData = fullBuffer.subarray(headerEnd + 4, partDataEnd);

                    if (headers.includes('name="pdfaLevel"')) {
                      const lvl = partData.toString('utf-8').trim();
                      if (lvl === '1b' || lvl === '2b' || lvl === '3b') pdfaLevel = lvl;
                    } else if (headers.includes('name="title"')) {
                      title = partData.toString('utf-8').trim();
                    } else if (headers.includes('filename=') || headers.includes('name="file"')) {
                      const pdfStart = partData.indexOf(Buffer.from('%PDF-'));
                      if (pdfStart !== -1) {
                        pdfBuffer = Buffer.from(partData.subarray(pdfStart));
                      } else {
                        pdfBuffer = Buffer.from(partData);
                      }
                    }

                    start = nextPart !== -1 ? nextPart : fullBuffer.length;
                  }
                }
              }

              if (pdfBuffer.length === 0) {
                const pdfStart = fullBuffer.indexOf(Buffer.from('%PDF-'));
                if (pdfStart !== -1) {
                  pdfBuffer = Buffer.from(fullBuffer.subarray(pdfStart));
                } else {
                  pdfBuffer = fullBuffer;
                }
              }

              const result = await convertPdfToPdfaServer(pdfBuffer, {
                pdfaLevel,
                title,
              });

              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/pdf');
              res.setHeader('Content-Disposition', 'attachment; filename="kanto-archived-PDFA.pdf"');
              res.setHeader('Content-Length', result.pdfBuffer.length.toString());
              res.end(result.pdfBuffer);
            } catch (err: unknown) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(
                JSON.stringify({
                  error: err instanceof Error ? err.message : String(err),
                  code: 'PDFA_CONVERSION_ERROR',
                })
              );
            }
          });
        } catch (err: unknown) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: `Server error: ${String(err)}` }));
        }
      };

      server.middlewares.use('/api/pdf-to-pdfa', handler);
      server.middlewares.use('/api/convert/pdf-to-pdfa', handler);
    },
  };
}

function repairPdfApiPlugin(): Plugin {
  return {
    name: 'repair-pdf-api',
    configureServer(server) {
      const handler = async (req: any, res: any) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Method Not Allowed. POST required.' }));
          return;
        }

        try {
          const chunks: Buffer[] = [];
          req.on('data', (chunk: any) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));

          req.on('end', async () => {
            try {
              const fullBuffer = Buffer.concat(chunks);
              const contentType = req.headers['content-type'] || '';

              let pdfBuffer: Buffer = Buffer.alloc(0);
              let filename = 'document.pdf';

              if (contentType.includes('application/json')) {
                const json = JSON.parse(fullBuffer.toString('utf-8'));
                if (json.pdfBase64) {
                  pdfBuffer = Buffer.from(json.pdfBase64, 'base64');
                }
                if (json.filename) filename = json.filename;
              } else if (contentType.includes('multipart/form-data')) {
                const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
                const boundary = boundaryMatch ? (boundaryMatch[1] || boundaryMatch[2]) : '';

                if (boundary) {
                  const boundaryBuf = Buffer.from(`--${boundary}`);
                  let start = 0;

                  while (start < fullBuffer.length) {
                    const nextBoundary = fullBuffer.indexOf(boundaryBuf, start);
                    if (nextBoundary === -1) break;

                    const partStart = nextBoundary + boundaryBuf.length;
                    const headerEnd = fullBuffer.indexOf(Buffer.from('\r\n\r\n'), partStart);
                    if (headerEnd === -1) break;

                    const headers = fullBuffer.subarray(partStart, headerEnd).toString('utf-8');
                    const nextPart = fullBuffer.indexOf(boundaryBuf, headerEnd + 4);
                    const partDataEnd = nextPart !== -1 ? nextPart - 2 : fullBuffer.length;
                    const partData = fullBuffer.subarray(headerEnd + 4, partDataEnd);

                    if (headers.includes('filename=') || headers.includes('name="file"')) {
                      const fnMatch = headers.match(/filename="([^"]+)"/);
                      if (fnMatch) filename = fnMatch[1];
                      pdfBuffer = Buffer.from(partData);
                    }

                    start = nextPart !== -1 ? nextPart : fullBuffer.length;
                  }
                }
              }

              if (pdfBuffer.length === 0) {
                pdfBuffer = fullBuffer;
              }

              const result = await repairPdfBufferOnServer(pdfBuffer, filename);

              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/pdf');
              res.setHeader('Content-Disposition', 'attachment; filename="kanto-repaired.pdf"');
              res.setHeader('Content-Length', result.pdfBuffer.length.toString());
              res.setHeader('X-Recovered-Pages', result.recoveredPages.toString());
              res.setHeader('X-Recovery-Engine', result.engineUsed);
              res.end(result.pdfBuffer);
            } catch (err: unknown) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(
                JSON.stringify({
                  error: err instanceof Error ? err.message : 'File is damaged beyond repair',
                  code: 'PDF_REPAIR_ERROR',
                })
              );
            }
          });
        } catch (err: unknown) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: `Server error: ${String(err)}` }));
        }
      };

      server.middlewares.use('/api/repair-pdf', handler);
      server.middlewares.use('/api/repair', handler);
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    pptxToPdfApiPlugin(),
    protectPdfApiPlugin(),
    unlockPdfApiPlugin(),
    htmlToPdfApiPlugin(),
    pdfaApiPlugin(),
    repairPdfApiPlugin(),
  ],
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return undefined;
          }
          if (
            id.includes('/node_modules/react/') ||
            id.includes('\\node_modules\\react\\') ||
            id.includes('/node_modules/react-dom/') ||
            id.includes('\\node_modules\\react-dom\\') ||
            id.includes('/node_modules/scheduler/') ||
            id.includes('\\node_modules\\scheduler\\') ||
            id.includes('vite/') ||
            id.includes('commonjsHelpers')
          ) {
            return 'react-vendor';
          }
          if (id.includes('lucide-react')) {
            return 'lucide-vendor';
          }
          if (id.includes('pdf-lib') || id.includes('@pdf-lib')) {
            return 'pdf-lib-vendor';
          }
          if (id.includes('pdfjs-dist')) {
            return 'pdfjs-vendor';
          }
          if (id.includes('xlsx')) {
            return 'xlsx-vendor';
          }
          if (id.includes('pptxgenjs')) {
            return 'pptx-vendor';
          }
          if (id.includes('docx') || id.includes('mammoth')) {
            return 'docx-vendor';
          }
          if (id.includes('jspdf') || id.includes('html2canvas') || id.includes('html2pdf') || id.includes('canvg')) {
            return 'conversion-vendor';
          }
          if (id.includes('jszip')) {
            return 'jszip-vendor';
          }
          if (id.includes('canvas-confetti') || id.includes('qrcode.react')) {
            return 'ui-extras-vendor';
          }
          return undefined;
        },
      },
    },
    modulePreload: {
      polyfill: false,
      resolveDependencies(filename, deps) {
        return deps.filter(dep => !dep.includes('pptx') && !dep.includes('jszip'));
      },
    },
  },
  optimizeDeps: {
    include: ['pdfjs-dist', 'pdf-lib', 'qrcode.react', 'canvas-confetti', 'jspdf'],
  },
});

