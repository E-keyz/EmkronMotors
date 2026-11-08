import { supabase, IMAGE_BUCKET } from './supabase';

/** Shrinks a photo to max 1600px / ~80% JPEG so uploads are quick and pages load fast on mobile data. */
export async function compressImage(file: File, maxSize = 1600, quality = 0.8): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not process image'))), 'image/jpeg', quality)
  );
}

/** Uploads one photo under the car's folder and returns its public URL. */
export async function uploadCarImage(carId: string, file: File): Promise<string> {
  const blob = await compressImage(file);
  const path = `${carId}/${crypto.randomUUID()}.jpg`;
  const { error } = await supabase.storage
    .from(IMAGE_BUCKET)
    .upload(path, blob, { contentType: 'image/jpeg', cacheControl: '31536000' });
  if (error) throw error;
  return supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path).data.publicUrl;
}

function pathFromUrl(url: string): string | null {
  const marker = `/${IMAGE_BUCKET}/`;
  const i = url.indexOf(marker);
  return i === -1 ? null : decodeURIComponent(url.slice(i + marker.length).split('?')[0]);
}

/** Deletes photos from storage. Ignores URLs that aren't ours (e.g. demo photos). */
export async function deleteCarImages(urls: string[]): Promise<void> {
  const paths = urls.map(pathFromUrl).filter((p): p is string => Boolean(p));
  if (paths.length) await supabase.storage.from(IMAGE_BUCKET).remove(paths);
}
