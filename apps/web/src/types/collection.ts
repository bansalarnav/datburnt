export interface Collection {
  id: string;
  title: string;
  description?: string;
  imageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CollectionImage {
  id: string;
  filename: string;
  s3Key: string;
  size: number;
  uploadedAt: string;
}

export interface CollectionWithImages {
  collection: Collection;
  images: CollectionImage[];
}
