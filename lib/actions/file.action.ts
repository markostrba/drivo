"use server";
import { Models, Query } from "node-appwrite";
import { createSessionClient } from "../appwrite";
import handleError from "../handlers/error";
import { appwriteConfig } from "../appwrite/config";
import { ActionResponse, ErrorResponse } from "@/types/global";
import {
  DeleteFileSchema,
  GetFilesSchema,
  RenameFileSchema,
  ShareFileSchema,
} from "../validations";
import { validate } from "../utils";
import { revalidatePath } from "next/cache";
import { getUserByEmail } from "./user.action";
import { ForbiddenError, NotFoundError } from "../http-errors";
import {
  DeleteFileParams,
  GetFileAnalyticsParams,
  GetFileAnalyticsResponse,
  GetFilesParams,
  RenameFileParams,
  ShareFileParams,
} from "@/types/action";

export const createQueries = async (
  currentUserId: string,
  currentUserEmail: string,
  type: string[],
  searchText: string,
  sort: string,
) => {
  console.log(searchText);
  const queries = [
    Query.or([
      Query.equal("owner", currentUserId),
      Query.contains("users", currentUserEmail),
    ]),
  ];

  if (type.length) queries.push(Query.equal("type", type));
  if (searchText) queries.push(Query.contains("name", searchText));
  if (sort) {
    const [sortBy, orderBy] = sort.split("-");

    queries.push(
      orderBy === "asc" ? Query.orderAsc(sortBy) : Query.orderDesc(sortBy),
    );
  }
  return queries;
};

export const getFiles = async (
  params: GetFilesParams,
): Promise<ActionResponse<Models.DocumentList<Models.Document>>> => {
  try {
    const validationResult = await validate({ params, schema: GetFilesSchema });

    if (validationResult instanceof Error) {
      return handleError(validationResult) as ErrorResponse;
    }

    const {
      currentUserId,
      currentUserEmail,
      type,
      searchText = "",
      sort = "$createdAt-desc",
    } = validationResult.params;

    const { databases } = await createSessionClient();

    const queries = await createQueries(
      currentUserId,
      currentUserEmail,
      type,
      searchText,
      sort,
    );

    const files = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      queries,
    );
    console.log({ files });
    return { success: true, data: files };
  } catch (err) {
    return handleError(err) as ErrorResponse;
  }
};

// fileId, name, extension, pathname

export const renameFile = async (
  params: RenameFileParams,
): Promise<ActionResponse<string>> => {
  try {
    const validationResult = await validate({
      params,
      schema: RenameFileSchema,
    });

    if (validationResult instanceof Error) {
      return handleError(validationResult) as ErrorResponse;
    }

    const { fileId, name, extension, pathname } = validationResult.params;

    const { databases } = await createSessionClient();

    const newName = `${name}.${extension}`;

    await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      fileId,
      { name: newName },
    );

    revalidatePath(pathname);
    return { success: true, data: newName };
  } catch (err) {
    return handleError(err) as ErrorResponse;
  }
};

export const shareFile = async (
  params: ShareFileParams,
): Promise<ActionResponse> => {
  try {
    console.log({ params });
    const validationResult = await validate({
      params,
      schema: ShareFileSchema,
    });

    if (validationResult instanceof Error) {
      return handleError(validationResult) as ErrorResponse;
    }

    const { fileId, email, pathname } = validationResult.params;

    const userExists = await getUserByEmail({ email });

    if (userExists === null) {
      throw new NotFoundError("User");
    }

    const { databases } = await createSessionClient();

    const existingFile = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      fileId,
    );

    const currentUsers = existingFile.users ?? [];
    const updatedUsers = Array.from(new Set([...currentUsers, email]));

    await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      fileId,
      { users: updatedUsers },
    );

    revalidatePath(pathname);
    return { success: true };
  } catch (err) {
    console.log(err);
    return handleError(err) as ErrorResponse;
  }
};

export const removeUserFromFile = async (
  params: ShareFileParams,
): Promise<ActionResponse> => {
  try {
    const validationResult = await validate({
      params,
      schema: ShareFileSchema,
    });

    if (validationResult instanceof Error) {
      return handleError(validationResult) as ErrorResponse;
    }

    const { fileId, email, pathname } = validationResult.params;
    const { databases } = await createSessionClient();

    const existingFile = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      fileId,
    );

    const currentUsers = existingFile.users ?? [];
    const updatedUsers = currentUsers.filter(
      (userEmail: string) => userEmail !== email,
    );

    await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      fileId,
      { users: updatedUsers },
    );

    revalidatePath(pathname);
    return { success: true };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
};

export const deleteFile = async (
  params: DeleteFileParams,
): Promise<ActionResponse> => {
  try {
    const validationResult = await validate({
      params,
      schema: DeleteFileSchema,
    });

    if (validationResult instanceof Error) {
      return handleError(validationResult) as ErrorResponse;
    }

    const { fileId, userId, bucketFileId, pathname } = validationResult.params;

    console.log({ fileId, userId, bucketFileId, pathname });
    const { databases, storage } = await createSessionClient();

    const file = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      fileId,
    );

    const fileOwner = file.owner;

    if (fileOwner.$id !== userId) {
      throw new ForbiddenError(
        "Access denied. You are not the owner of this resource.",
      );
    }

    await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      fileId,
    );

    await storage.deleteFile(appwriteConfig.bucketId, bucketFileId);

    revalidatePath(pathname);

    return { success: true };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
};

export const getFileAnalytics = async ({
  userId,
  email,
}: GetFileAnalyticsParams): Promise<
  ActionResponse<GetFileAnalyticsResponse>
> => {
  try {
    const { databases } = await createSessionClient();

    const fileDocs = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      [Query.equal("owner", [userId])],
    );

    const files = fileDocs.documents;

    const documents = { usedSpace: 0, lastUpdate: "" };
    const images = { usedSpace: 0, lastUpdate: "" };
    const media = { usedSpace: 0, lastUpdate: "" };
    const others = { usedSpace: 0, lastUpdate: "" };

    files.forEach((file) => {
      const size = parseInt(file.size, 10);
      if (file.type === "document") {
        documents.usedSpace += size;
        if (
          !documents.lastUpdate ||
          new Date(file.$updatedAt) > new Date(documents.lastUpdate)
        ) {
          documents.lastUpdate = file.$updatedAt;
        }
      } else if (file.type === "image") {
        images.usedSpace += size;
        if (
          !images.lastUpdate ||
          new Date(file.$updatedAt) > new Date(images.lastUpdate)
        ) {
          images.lastUpdate = file.$updatedAt;
        }
      } else if (file.type === "video" || file.type === "audio") {
        media.usedSpace += size;
        if (
          !media.lastUpdate ||
          new Date(file.$updatedAt) > new Date(media.lastUpdate)
        ) {
          media.lastUpdate = file.$updatedAt;
        }
      } else {
        others.usedSpace += size;
        if (
          !others.lastUpdate ||
          new Date(file.$updatedAt) > new Date(others.lastUpdate)
        ) {
          others.lastUpdate = file.$updatedAt;
        }
      }
    });

    const totalUsedSpace =
      documents.usedSpace +
      images.usedSpace +
      media.usedSpace +
      others.usedSpace;

    return {
      success: true,

      data: {
        totalUsedSpace,
        documents,
        images,
        media,
        others,
      },
    };
  } catch (err) {
    console.log(err);
    return handleError(err) as ErrorResponse;
  }
};
