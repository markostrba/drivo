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

export const createQueries = async (
  currentUserId: string,
  currentUserEmail: string,
  type: string[],
) => {
  const queries = [
    Query.or([
      Query.equal("owner", currentUserId),
      Query.contains("users", currentUserEmail),
    ]),
  ];

  queries.push(Query.equal("type", type));

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

    const { currentUserId, currentUserEmail, type } = validationResult.params;

    const { databases } = await createSessionClient();

    const queries = await createQueries(currentUserId, currentUserEmail, type);

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
