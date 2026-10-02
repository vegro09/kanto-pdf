import { PDFDocument } from 'pdf-lib';

export interface ImageInputItem {
  id: string;
  file: File;
  name: string;
  size: number;
  arrayBuffer: ArrayBuffer;
  width: number;
  height: number;
  previewUrl: string;
  type: string;
}

export interface JpgToPdfValidation {
  isValid: boolean;
  error?: string;
  images: ImageInputItem[];
}

export interface JpgToPdfResult {
  blob: Blob;
  downloadFilename: string;
  mimeType: string;
  fileSize: number;
  pageCount: number;
  imageCount: number;
}

export interface JpgToPdfOptions {
  pageSizingMode?: 'original' | 'a4_fit'; // 'original' = dynamic page size per image (recommended)
  margin?: number; // 0 for full bleed
}

/**
 * Validates and extracts dimensions and preview thumbnails for an array of image files.
 */
export async function validateJpgToPdfFiles(
  files: File[],
  isArabic: boolean = false
): Promise<JpgToPdfValidation> {
  if (!files || files.length === 0) {
    return {
      isValid: false,
      error: isArabic ? 'يرجى اختيار صورة واحدة على الأقل.' : 'Please select at least one image file.',
      images: [],
    };
  }

  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.bmp', '.gif'];
  const validImages: ImageInputItem[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const lowerName = file.name.toLowerCase();
    const isAllowed = allowedExtensions.some(ext => lowerName.endsWith(ext)) || file.type.startsWith('image/');

    if (!isAllowed) {
      return {
        isValid: false,
        error: isArabic
          ? `الملف "${file.name}" ليس بصيغة صورة مدعومة (JPG, PNG, WebP).`
          : `File "${file.name}" is not a supported image format (JPG, PNG, WebP).`,
        images: [],
      };
    }

    if (file.size === 0) {
      return {
        isValid: false,
        error: isArabic
          ? `الصورة "${file.name}" فارغة (0 بايت).`
          : `Image "${file.name}" is empty (0 bytes).`,
        images: [],
      };
    }

    try {
      const buffer = await file.arrayBuffer();
      const previewUrl = URL.createObjectURL(file);

      // Load dimensions via HTML Image object
      const dims = await getImageDimensions(previewUrl);

      validImages.push({
        id: `img-${Date.now()}-${i}`,
        file,
        name: file.name,
        size: file.size,
        arrayBuffer: buffer,
        width: dims.width,
        height: dims.height,
        previewUrl,
        type: file.type || (lowerName.endsWith('.png') ? 'image/png' : 'image/jpeg'),
      });
    } catch {
      return {
        isValid: false,
        error: isArabic
          ? `تعذر قراءة بيانات الصورة "${file.name}".`
          : `Unable to read image dimensions for "${file.name}".`,
        images: [],
      };
    }
  }

  return {
    isValid: true,
    images: validImages,
  };
}

/**
 * Executes JPG to PDF conversion.
 * Step A: Accepts array of images.
 * Step B: Initializes new PDFDocument.
 * Step C & D: Loops through images asynchronously and reads ArrayBuffer.
 * Step E: Embeds as JPG or PNG (or converts WebP to PNG canvas).
 * Step F & G: Reads dimensions and creates a page with EXACT MATCHING DIMENSIONS.
 * Step H: Draws full-bleed image at (0, 0) with zero distortion.
 * Step I: Saves and compiles single PDF document.
 */
export async function executeJpgToPdf(
  images: ImageInputItem[],
  options: JpgToPdfOptions = {},
  onProgress?: (percent: number, status: string) => void,
  isArabicLang: boolean = false
): Promise<JpgToPdfResult> {
  if (!images || images.length === 0) {
    throw new Error(isArabicLang ? 'لم يتم العثور على أي صور للتحويل.' : 'No images provided to convert.');
  }

  onProgress?.(10, isArabicLang ? 'جاري تهيئة مستند PDF وقراءة الصور...' : 'Initializing PDF document...');

  const pdfDoc = await PDFDocument.create();
  const totalImages = images.length;
  const pageSizingMode = options.pageSizingMode || 'original';

  for (let i = 0; i < totalImages; i++) {
    const item = images[i];
    const progressPercent = Math.round(15 + ((i + 1) / totalImages) * 70);
    onProgress?.(
      progressPercent,
      isArabicLang
        ? `جاري تضمين الصورة ${i + 1} من ${totalImages} بأبعادها الأصلية...`
        : `Embedding image ${i + 1} of ${totalImages} with dynamic sizing...`
    );

    let embeddedImage;
    const lowerName = item.name.toLowerCase();
    const isPng = item.type === 'image/png' || lowerName.endsWith('.png');
    const isJpg = item.type === 'image/jpeg' || item.type === 'image/jpg' || lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg');

    try {
      if (isPng) {
        embeddedImage = await pdfDoc.embedPng(item.arrayBuffer);
      } else if (isJpg) {
        embeddedImage = await pdfDoc.embedJpg(item.arrayBuffer);
      } else {
        // Fallback for WebP / BMP / GIF: rasterize to PNG bytes via canvas
        const pngBytes = await convertImageToPngBytes(item.previewUrl);
        embeddedImage = await pdfDoc.embedPng(pngBytes);
      }
    } catch {
      // If direct embed fails (e.g. invalid JPEG headers), convert to PNG via canvas
      const pngBytes = await convertImageToPngBytes(item.previewUrl);
      embeddedImage = await pdfDoc.embedPng(pngBytes);
    }

    const intrinsicDims = embeddedImage.scale(1);

    if (pageSizingMode === 'original') {
      // DYNAMIC PAGE SIZING ALGORITHM: Exact 1:1 image dimensions (Zero Stretching)
      const page = pdfDoc.addPage([intrinsicDims.width, intrinsicDims.height]);
      page.drawImage(embeddedImage, {
        x: 0,
        y: 0,
        width: intrinsicDims.width,
        height: intrinsicDims.height,
      });
    } else {
      // Standard A4 Fit Mode (595.28 x 841.89 pt with proportional aspect ratio)
      const a4Width = 595.28;
      const a4Height = 841.89;
      const page = pdfDoc.addPage([a4Width, a4Height]);

      const scaleFactor = Math.min(a4Width / intrinsicDims.width, a4Height / intrinsicDims.height);
      const scaledWidth = intrinsicDims.width * scaleFactor;
      const scaledHeight = intrinsicDims.height * scaleFactor;

      const posX = (a4Width - scaledWidth) / 2;
      const posY = (a4Height - scaledHeight) / 2;

      page.drawImage(embeddedImage, {
        x: posX,
        y: posY,
        width: scaledWidth,
        height: scaledHeight,
      });
    }
  }

  onProgress?.(90, isArabicLang ? 'جاري ضغط وحفظ ملف PDF المجمع...' : 'Compiling & saving final PDF...');

  const pdfBytes = await pdfDoc.save();
  const outputBlob = new Blob([new Uint8Array(pdfBytes).buffer as ArrayBuffer], { type: 'application/pdf' });

  onProgress?.(100, isArabicLang ? 'اكتمل تحويل وتجميع الصور بنجاح!' : 'JPG to PDF conversion complete!');

  const firstBase = images[0]?.name.replace(/\.[^/.]+$/, '') || 'kanto_images';
  const downloadFilename = totalImages > 1 ? `${firstBase}_and_${totalImages - 1}_more.pdf` : `${firstBase}_converted.pdf`;

  return {
    blob: outputBlob,
    downloadFilename,
    mimeType: 'application/pdf',
    fileSize: outputBlob.size,
    pageCount: totalImages,
    imageCount: totalImages,
  };
}

/**
 * Loads image dimensions asynchronously.
 */
function getImageDimensions(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth || 600, height: img.naturalHeight || 800 });
    img.onerror = () => reject(new Error('Failed to load image element.'));
    img.src = url;
  });
}

/**
 * Converts an image URL to PNG bytes via offscreen canvas.
 */
function convertImageToPngBytes(url: string): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context failed.'));
        return;
      }
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(blob => {
        if (!blob) {
          reject(new Error('Blob encoding failed.'));
          return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result instanceof ArrayBuffer) {
            resolve(new Uint8Array(reader.result));
          } else {
            reject(new Error('ArrayBuffer conversion failed.'));
          }
        };
        reader.readAsArrayBuffer(blob);
      }, 'image/png');
    };
    img.onerror = () => reject(new Error('Image failed to load for conversion.'));
    img.src = url;
  });
}
