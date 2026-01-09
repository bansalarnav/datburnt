import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db";
import { collections, images } from "../db/schema";
import {
  deleteFile,
  generateImageKey,
  generatePresignedUploadUrl,
  getFileSize,
} from "../storage/s3";

export namespace Collection {
  export const Info = z.object({
    id: z.string(),
    userId: z.string(),
    title: z.string(),
    description: z.string().nullable(),
    public: z.boolean(),
    createdAt: z.date(),
    updatedAt: z.date(),
  });
  export type Info = z.infer<typeof Info>;

  export const ImageInfo = z.object({
    id: z.string(),
    collectionId: z.string(),
    s3Key: z.string(),
    filename: z.string(),
    size: z.number(),
    uploadedAt: z.date(),
  });
  export type ImageInfo = z.infer<typeof ImageInfo>;

  export async function create(
    userId: string,
    input: { title: string; description?: string }
  ) {
    const [collection] = await db
      .insert(collections)
      .values({
        userId,
        title: input.title,
        description: input.description || null,
      })
      .returning();

    return collection;
  }

  export async function findById(collectionId: string) {
    const [collection] = await db
      .select()
      .from(collections)
      .where(eq(collections.id, collectionId));

    return collection || null;
  }

  export async function findByUserId(userId: string) {
    return await db
      .select()
      .from(collections)
      .where(eq(collections.userId, userId));
  }

  export async function update(
    collectionId: string,
    input: { title?: string; description?: string }
  ) {
    const updateData: Record<string, any> = {
      updatedAt: new Date(),
    };

    if (input.title !== undefined) {
      updateData.title = input.title;
    }
    if (input.description !== undefined) {
      updateData.description = input.description;
    }

    const [updated] = await db
      .update(collections)
      .set(updateData)
      .where(eq(collections.id, collectionId))
      .returning();

    return updated || null;
  }

  export async function deleteCollection(collectionId: string) {
    const collectionImages = await getImages(collectionId);

    for (const image of collectionImages) {
      try {
        await deleteFile(image.s3Key);
      } catch (error) {
        console.error(`Failed to delete S3 file ${image.s3Key}:`, error);
      }
    }

    const result = await db
      .delete(collections)
      .where(eq(collections.id, collectionId))
      .returning();

    return result.length > 0;
  }

  export async function getImages(collectionId: string) {
    return await db
      .select()
      .from(images)
      .where(eq(images.collectionId, collectionId));
  }

  export async function deleteImage(collectionId: string, imageId: string) {
    const [image] = await db
      .select()
      .from(images)
      .where(
        and(eq(images.id, imageId), eq(images.collectionId, collectionId))
      );

    if (!image) {
      return false;
    }

    try {
      await deleteFile(image.s3Key);
    } catch (error) {
      console.error(`Failed to delete S3 file ${image.s3Key}:`, error);
    }

    const result = await db
      .delete(images)
      .where(eq(images.id, imageId))
      .returning();

    return result.length > 0;
  }

  export async function deleteAllImages(collectionId: string) {
    const collectionImages = await getImages(collectionId);

    for (const image of collectionImages) {
      try {
        await deleteFile(image.s3Key);
      } catch (error) {
        console.error(`Failed to delete S3 file ${image.s3Key}:`, error);
      }
    }

    const result = await db
      .delete(images)
      .where(eq(images.collectionId, collectionId))
      .returning();

    return result.length;
  }

  export async function getCollectionWithImages(collectionId: string) {
    const results = await db
      .select({
        collection: collections,
        image: images,
      })
      .from(collections)
      .leftJoin(images, eq(collections.id, images.collectionId))
      .where(eq(collections.id, collectionId));

    if (results.length === 0) {
      return null;
    }

    const collection = results[0].collection;

    const collectionImages = results
      .map((r) => r.image)
      .filter((img): img is NonNullable<typeof img> => img !== null);

    return {
      collection,
      images: collectionImages,
    };
  }

  export async function addImage(collectionId: string, filename: string) {
    const imageId = crypto.randomUUID();
    const s3Key = generateImageKey(collectionId, imageId);

    const [image] = await db
      .insert(images)
      .values({
        id: imageId,
        collectionId,
        s3Key,
        filename,
        size: 0, // Placeholder, will be updated after upload
      })
      .returning();

    const uploadUrl = generatePresignedUploadUrl(s3Key, 300); // 5 minutes

    return {
      uploadUrl,
      image,
    };
  }

  export async function confirmDirectUpload(imageId: string) {
    const [image] = await db
      .select()
      .from(images)
      .where(eq(images.id, imageId));

    const size = await getFileSize(image.s3Key);
    await db.update(images).set({ size, uploadedAt: new Date() }).returning();

    return true;
  }
}
