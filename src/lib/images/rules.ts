export const MAX_IMAGES = 10;
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

export function imageProblem(type: string, size: number): string | null {
  if (!(IMAGE_TYPES as readonly string[]).includes(type)) return 'JPG·PNG·WebP 파일만 올릴 수 있어요';
  if (size > MAX_IMAGE_BYTES) return `파일이 ${(size / 1048576).toFixed(1)}MB예요. 5MB 이하만 올릴 수 있어요`;
  return null;
}

/** 저장할 이미지 주소로 받아들일 수 있는 것: 우리가 올린 이미지(data URL 또는 http(s) 주소) */
export function acceptableImageUrl(url: string): boolean {
  if (/^https?:\/\/\S+$/i.test(url)) return true;
  return /^data:image\/(jpeg|png|webp|svg\+xml)[;,]/i.test(url);
}
