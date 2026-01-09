import sharp from "sharp";

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const MAX_DIMENSION = 2048;

export interface CompressionResult {
  buffer: Buffer;
  size: number;
}

export async function compressImage(
  inputBuffer: Buffer,
  maxSizeBytes: number = MAX_SIZE_BYTES
) {
  let quality = 80;
  const image = sharp(inputBuffer);

  let buffer = await image
    .resize(MAX_DIMENSION, MAX_DIMENSION, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality })
    .toBuffer();

  while (buffer.length > maxSizeBytes && quality > 20) {
    quality -= 10;
    buffer = await image
      .resize(MAX_DIMENSION, MAX_DIMENSION, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality })
      .toBuffer();
  }

  if (buffer.length > maxSizeBytes) {
    let dimension = MAX_DIMENSION;
    while (buffer.length > maxSizeBytes && dimension > 512) {
      dimension -= 256;
      buffer = await image
        .resize(dimension, dimension, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({ quality: 20 })
        .toBuffer();
    }
  }

  return {
    buffer,
    size: buffer.length,
  };
}

export async function isValidImage(buffer: Buffer) {
  try {
    const metadata = await sharp(buffer).metadata();
    return !!metadata.format;
  } catch {
    return false;
  }
}
