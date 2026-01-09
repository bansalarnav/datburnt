import { S3Client } from "bun";
import config from "../config";

// Initialize Bun's native S3 client
export const s3 = new S3Client({
  endpoint: config.s3.endpoint,
  bucket: config.s3.bucketName,
  accessKeyId: config.s3.accessKeyId,
  secretAccessKey: config.s3.secretAccessKey,
});

/**
 * Delete a file from S3
 * @param key - S3 object key (path)
 */
export async function deleteFile(key: string): Promise<void> {
  await s3.delete(key);
}

/**
 * Generate S3 key for an image
 * @param collectionId - Collection ID
 * @param imageId - Image ID
 * @returns S3 object key
 */
export function generateImageKey(
  collectionId: string,
  imageId: string
): string {
  return `${collectionId}/${imageId}.webp`;
}

/**
 * Generate a presigned URL for uploading directly to S3
 * @param key - S3 object key (path)
 * @param expiresIn - Expiration time in seconds (default: 5 minutes)
 * @returns Presigned URL for PUT request
 */
export function generatePresignedUploadUrl(
  key: string,
  expiresIn: number = 300
): string {
  const file = s3.file(key);
  return file.presign({
    method: "PUT",
    expiresIn,
    type: "image/webp",
  });
}

/**
 * Get the size of a file in S3
 * @param key - S3 object key (path)
 * @returns File size in bytes
 */
export async function getFileSize(key: string): Promise<number> {
  const stat = await s3.file(key).stat();
  return stat.size;
}
