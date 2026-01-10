import { S3Client } from "bun";
import config from "../config";

export const s3 = new S3Client({
  endpoint: config.s3.endpoint,
  bucket: config.s3.bucketName,
  accessKeyId: config.s3.accessKeyId,
  secretAccessKey: config.s3.secretAccessKey,
});

export async function deleteFile(key: string): Promise<void> {
  await s3.delete(key);
}

export function generateImageKey(
  collectionId: string,
  imageId: string
): string {
  return `${collectionId}/${imageId}.webp`;
}

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

export async function getFileSize(key: string): Promise<number> {
  const stat = await s3.file(key).stat();
  return stat.size;
}
