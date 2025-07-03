"use server";
import { InputFile } from "node-appwrite/file";
import { createAdminClient } from "../appwrite";
import { appwriteConfig } from "../appwrite/config";
import { ID, Models } from "node-appwrite";
import { generateImageUrl, getFileType, validate } from "../utils";
import { ActionResponse, ErrorResponse } from "@/types/global";
import handleError from "../handlers/error";
import { UploadFileSchema } from "../validations";
import { revalidatePath } from "next/cache";

//{ file, accountId, ownerId }

export const uploadFile = async (
  params: UploadFileParams,
): Promise<ActionResponse<{ fileName: string }>> => {
  try {
    const validationResult = await validate({
      params,
      schema: UploadFileSchema,
    });

    if (validationResult instanceof Error) {
      return handleError(validationResult) as ErrorResponse;
    }

    const { file, accountId, ownerId, pathname } = validationResult.params;

    const { storage, databases } = await createAdminClient();
    const inputFile = InputFile.fromBuffer(file, file.name);
    const bucketFile = await storage.createFile(
      appwriteConfig.bucketId,
      ID.unique(),
      inputFile,
    );

    const { type: imgType, extension: imgExtension } = getFileType(
      bucketFile.name,
    );

    const newFile = await databases
      .createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.filesCollectionId,
        ID.unique(),
        {
          name: bucketFile.name,
          url: generateImageUrl(bucketFile.$id),
          type: imgType,
          bucketFieldId: bucketFile.$id,
          accountId,
          owner: ownerId,
          extension: imgExtension,
          size: bucketFile.sizeOriginal,
          users: [],
        },
      )
      .catch(async (err: unknown) => {
        await storage.deleteFile(appwriteConfig.bucketId, bucketFile.$id);
        return handleError(err) as ErrorResponse;
      });

    revalidatePath(pathname);
    return {
      success: true,
      data: { fileName: (newFile as Models.Document).name },
    };
  } catch (error) {
    console.log(error);
    return handleError(error) as ErrorResponse;
  }
};
