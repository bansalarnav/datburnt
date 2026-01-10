import Elysia, { t } from "elysia";
import { authPlugin } from "../../auth/middleware";
import { Collection } from "../../collection";

export const collectionRoutes = new Elysia({ prefix: "/collection" })
  .use(authPlugin)

  .post(
    "/",
    async ({ body, userId, set }) => {
      try {
        const collection = await Collection.create(userId, body);
        return collection;
      } catch (error: any) {
        set.status = 400;
        return { error: error.message || "Invalid input" };
      }
    },
    {
      body: t.Object({
        title: t.String({ minLength: 1, maxLength: 100 }),
        description: t.Optional(t.String({ maxLength: 500 })),
      }),
    }
  )

  .get("/", async ({ userId }) => {
    const collections = await Collection.findByUserId(userId);
    return collections;
  })

  .get("/all", async ({ userId }) => {
    const collections = await Collection.findByUserId(userId, true);
    return collections;
  })

  .get("/:id", async ({ params, userId, set }) => {
    const result = await Collection.getCollectionWithImages(params.id);

    if (!result) {
      set.status = 404;
      return { error: "Collection not found" };
    }

    if (result.collection.userId !== userId) {
      set.status = 403;
      return { error: "Access denied" };
    }

    return result;
  })

  .put(
    "/:id",
    async ({ params, body, userId, set }) => {
      try {
        const existing = await Collection.findById(params.id);
        if (!existing) {
          set.status = 404;
          return { error: "Collection not found" };
        }

        if (existing.userId !== userId) {
          set.status = 403;
          return { error: "Access denied" };
        }

        const updated = await Collection.update(params.id, body);

        return updated;
      } catch (error: any) {
        set.status = 400;
        return { error: error.message || "Invalid input" };
      }
    },
    {
      body: t.Object({
        title: t.Optional(t.String({ minLength: 1, maxLength: 100 })),
        description: t.Optional(t.String({ maxLength: 500 })),
      }),
    }
  )

  .delete("/:id", async ({ params, userId, set }) => {
    const existing = await Collection.findById(params.id);
    if (!existing) {
      set.status = 404;
      return { error: "Collection not found" };
    }

    if (existing.userId !== userId) {
      set.status = 403;
      return { error: "Access denied" };
    }

    const deleted = await Collection.deleteCollection(params.id);

    if (!deleted) {
      set.status = 500;
      return { error: "Failed to delete collection" };
    }

    return { success: true };
  })

  .delete("/:id/image/:imageId", async ({ params, userId, set }) => {
    const existing = await Collection.findById(params.id);
    if (!existing) {
      set.status = 404;
      return { error: "Collection not found" };
    }

    if (existing.userId !== userId) {
      set.status = 403;
      return { error: "Access denied" };
    }

    const deleted = await Collection.deleteImage(params.id, params.imageId);

    if (!deleted) {
      set.status = 404;
      return { error: "Image not found" };
    }

    return { success: true };
  })

  .post(
    "/:id/image",
    async ({ params, body, userId, set }) => {
      try {
        const existing = await Collection.findById(params.id);
        if (!existing) {
          set.status = 404;
          return { error: "Collection not found" };
        }

        if (existing.userId !== userId) {
          set.status = 403;
          return { error: "Access denied" };
        }

        const { uploadUrl } = await Collection.addImage(
          params.id,
          body.filename
        );

        return { success: true, uploadUrl };
      } catch (_error: any) {
        set.status = 500;
        return { error: "Failed to generate upload URL" };
      }
    },
    {
      body: t.Object({
        filename: t.String({ minLength: 1 }),
      }),
    }
  )

  .post(
    "/:id/image/confirm",
    async ({ params, body, userId, set }) => {
      try {
        const existing = await Collection.findById(params.id);
        if (!existing) {
          set.status = 404;
          return { error: "Collection not found" };
        }

        if (existing.userId !== userId) {
          set.status = 403;
          return { error: "Access denied" };
        }

        const image = await Collection.confirmDirectUpload(body.imageId);

        return image;
      } catch (_error: any) {
        set.status = 500;
        return { error: "Failed to confirm upload" };
      }
    },
    {
      body: t.Object({
        imageId: t.String(),
      }),
    }
  );
