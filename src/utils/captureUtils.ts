import * as htmlToImage from 'html-to-image';
import html2canvas from 'html2canvas';

export interface CaptureOptions {
  scale?: number;
  backgroundColor?: string;
  ignoreClass?: string;
  quality?: number;
}

/**
 * Robustly captures an HTML element to an HTML5 Canvas,
 * with full native support for modern CSS color functions (oklab, oklch, Tailwind v4).
 */
export async function captureElementToCanvas(
  element: HTMLElement,
  options: CaptureOptions = {}
): Promise<HTMLCanvasElement | null> {
  const scale = options.scale ?? 2;
  const backgroundColor = options.backgroundColor ?? '#ffffff';
  const filter = options.ignoreClass 
    ? (domNode: HTMLElement) => !domNode?.classList?.contains(options.ignoreClass!)
    : undefined;

  // 1. Primary Strategy: html-to-image (Uses browser native SVG foreignObject rendering - 100% oklab/oklch compatible)
  try {
    const canvas = await htmlToImage.toCanvas(element, {
      pixelRatio: scale,
      backgroundColor,
      filter: filter as any,
      cacheBust: true,
      skipFonts: true,
      fontEmbedCSS: ''
    });
    return canvas;
  } catch (primaryErr) {
    console.warn('html-to-image capture fallback triggered:', primaryErr);
  }

  // 2. Secondary Strategy: html-to-image via toPng image rendering
  try {
    const dataUrl = await htmlToImage.toPng(element, {
      pixelRatio: scale,
      backgroundColor,
      filter: filter as any,
      cacheBust: true,
      skipFonts: true,
      fontEmbedCSS: ''
    });

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = dataUrl;
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = reject;
    });

    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(img, 0, 0);
      return canvas;
    }
  } catch (secondaryErr) {
    console.warn('html-to-image toPng fallback failed:', secondaryErr);
  }

  // 3. Fallback: html2canvas with sanitized clone
  try {
    const canvas = await html2canvas(element, {
      scale,
      backgroundColor,
      useCORS: true,
      allowTaint: true,
      logging: false,
      ignoreElements: options.ignoreClass ? (el) => el.classList.contains(options.ignoreClass!) : undefined,
      onclone: (clonedDoc) => {
        // Sanitize any elements with oklab/oklch inline styles if present
        try {
          const allElements = clonedDoc.querySelectorAll('*');
          allElements.forEach((el) => {
            const htmlEl = el as HTMLElement;
            if (htmlEl.style) {
              const bg = htmlEl.style.backgroundColor;
              if (bg && (bg.includes('oklab') || bg.includes('oklch'))) {
                htmlEl.style.backgroundColor = backgroundColor;
              }
              const color = htmlEl.style.color;
              if (color && (color.includes('oklab') || color.includes('oklch'))) {
                htmlEl.style.color = '#1e293b';
              }
            }
          });
        } catch {}
      }
    });
    return canvas;
  } catch (fallbackErr) {
    console.error('All capture strategies failed:', fallbackErr);
    return null;
  }
}

/**
 * Captures an element and returns a PNG Data URL.
 */
export async function captureElementToPng(
  element: HTMLElement,
  options: CaptureOptions = {}
): Promise<string | null> {
  const canvas = await captureElementToCanvas(element, options);
  if (!canvas) return null;
  return canvas.toDataURL('image/png', options.quality ?? 0.95);
}

/**
 * Captures an element and returns a PNG Blob.
 */
export async function captureElementToBlob(
  element: HTMLElement,
  options: CaptureOptions = {}
): Promise<Blob | null> {
  const canvas = await captureElementToCanvas(element, options);
  if (!canvas) return null;
  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png', options.quality ?? 0.95);
  });
}
