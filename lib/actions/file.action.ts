"use server";
import { Models, Query } from "node-appwrite";
import { createSessionClient } from "../appwrite";
import handleError from "../handlers/error";
import { appwriteConfig } from "../appwrite/config";
import { ActionResponse, ErrorResponse } from "@/types/global";
import { GetFilesSchema } from "../validations";
import { validate } from "../utils";

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
