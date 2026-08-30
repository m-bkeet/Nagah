/**
 * High-performance client-side image compression utility
 * Prevents Vercel 413 Payload Too Large errors and speeds up AI image analysis.
 */

export async function compressImage(
  source: string | File | Blob,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.8
): Promise<string> {
  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        try {
          let width = img.naturalWidth || img.width || 800;
          let height = img.naturalHeight || img.height || 600;

          if (width > maxWidth || height > maxHeight) {
            if (width > height) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, width);
          canvas.height = Math.max(1, height);
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            if (typeof source === 'string') return resolve(source);
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => resolve('');
            reader.readAsDataURL(source as Blob);
            return;
          }

          // Fill white background for transparent images converted to JPEG
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        } catch (canvasErr) {
          console.warn('[ImageCompressor] Canvas compression failed, falling back:', canvasErr);
          if (typeof source === 'string') return resolve(source);
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => resolve('');
          reader.readAsDataURL(source as Blob);
        }
      };

      img.onerror = () => {
        if (typeof source === 'string') return resolve(source);
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => resolve('');
        reader.readAsDataURL(source as Blob);
      };

      if (typeof source === 'string') {
        img.src = source;
      } else {
        const reader = new FileReader();
        reader.onload = () => {
          img.src = reader.result as string;
        };
        reader.onerror = () => resolve('');
        reader.readAsDataURL(source);
      }
    } catch (err) {
      console.warn('[ImageCompressor] General error:', err);
      if (typeof source === 'string') return resolve(source);
      resolve('');
    }
  });
}
