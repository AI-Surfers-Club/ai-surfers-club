// 올리기 전에 브라우저에서 이미지를 줄인다.
// 배포 서버(Vercel)는 요청 하나에 약 4.5MB까지만 받으므로, 5MB 이하 원본도 그대로 보내면 막힐 수 있다.

/** 한 번에 보내도 안전한 크기 (Vercel 4.5MB 제한보다 여유 있게) */
export const SAFE_UPLOAD_BYTES = 4 * 1024 * 1024;
/** 이보다 크면 줄인다 — 화면에 쓰기에 충분하고 빨리 뜨는 크기 */
export const SHRINK_OVER_BYTES = 1.5 * 1024 * 1024;
export const MAX_EDGE = 2560;

export function needsShrink(size: number, width: number, height: number): boolean {
  return size > SHRINK_OVER_BYTES || Math.max(width, height) > MAX_EDGE;
}

/** 긴 변이 maxEdge를 넘지 않게 비율을 유지해 줄인 크기 */
export function fitWithin(width: number, height: number, maxEdge: number): { width: number; height: number } {
  const scale = Math.min(1, maxEdge / Math.max(width, height));
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}

function encode(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

/** 필요하면 WebP(안 되는 브라우저는 JPEG)로 다시 저장한다. 줄일 필요가 없거나 실패하면 원본을 돌려준다 */
export async function shrinkForUpload(file: File): Promise<Blob> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return file;
  }
  try {
    if (!needsShrink(file.size, bitmap.width, bitmap.height)) return file;
    let edge = MAX_EDGE;
    let quality = 0.86;
    let best: Blob | null = null;
    for (let attempt = 0; attempt < 4; attempt++) {
      const size = fitWithin(bitmap.width, bitmap.height, edge);
      const canvas = document.createElement('canvas');
      canvas.width = size.width;
      canvas.height = size.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return file;
      ctx.drawImage(bitmap, 0, 0, size.width, size.height);
      let blob = await encode(canvas, 'image/webp', quality);
      if (!blob || blob.type !== 'image/webp') {
        // WebP로 저장하지 못하는 브라우저: 흰 바탕 JPEG
        ctx.globalCompositeOperation = 'destination-over';
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, size.width, size.height);
        blob = await encode(canvas, 'image/jpeg', quality);
      }
      if (blob && (!best || blob.size < best.size)) best = blob;
      if (best && best.size <= SAFE_UPLOAD_BYTES) break;
      edge = Math.round(edge * 0.75);
      quality = Math.max(0.6, quality - 0.08);
    }
    if (!best) return file;
    return best.size < file.size || file.size > SAFE_UPLOAD_BYTES ? best : file;
  } finally {
    bitmap.close();
  }
}
