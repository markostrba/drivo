"use client";
import { Client, Databases, Query, Storage, UploadProgress } from "appwrite";
import { appwriteConfig } from "../lib/appwrite/config";
import { convertFileSize, generateImageUrl, getFileType } from "@/lib/utils";
import { ID } from "node-appwrite";
import { useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { NotFoundError } from "@/lib/http-errors";
import { PLAN_FILE_RULES } from "@/constants";
import handleError from "@/lib/handlers/error";
import { Plans } from "@/types";

const client = new Client()
  .setEndpoint(appwriteConfig.endpointUrl)
  .setProject(appwriteConfig.projectId);

const databases = new Databases(client);
const storage = new Storage(client);

interface Props {
  ownerId: string;
}

type UploadResult =
  | { success: true }
  | { success: false; error: { message: string } };

const useUploadFile = ({ ownerId }: Props) => {
  const canceledFiles = useRef<Set<string>>(new Set());
  const router = useRouter();

  const uploadFile = useCallback(
    async (
      file: File,
      onProgress: (progress: UploadProgress, fileName: string) => void,
    ): Promise<UploadResult> => {
      const fileName = file.name;
      try {
        const user = await databases.getDocument(
          appwriteConfig.databaseId,
          appwriteConfig.usersCollectionId,
          ownerId,
        );

        if (!user) throw new NotFoundError("User");
        const userPlan = (user?.plan as Plans) || "Free";
        const fileDocuments = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.filesCollectionId,
          [Query.equal("owner", ownerId)],
        );

        let totalUsedSpace = 0;
        const maxSize = PLAN_FILE_RULES.find(
          (rule) => rule.plan === userPlan,
        )!.maxSize;
        if (fileDocuments.total > 0) {
          totalUsedSpace = fileDocuments.documents.reduce(
            (acc, doc) => acc + doc.size,
            0,
          );
        }

        if (totalUsedSpace + file.size > maxSize) {
          console.log("useUpload", {
            total: totalUsedSpace + file.size,
            totalUsedSpace,
            fileSize: file.size,
            maxSize,
          });
          throw new Error(
            `You've used ${convertFileSize(totalUsedSpace)} of your storage quota (${convertFileSize(maxSize)}) on the ${userPlan} plan. Please delete some files or upgrade your plan to continue uploading.`,
          );
        }
        const bucketFile = await storage.createFile(
          appwriteConfig.bucketId,
          ID.unique(),
          file,
          [],
          (progress) => {
            onProgress(progress, fileName);
          },
        );

        if (canceledFiles.current.has(fileName)) {
          await storage.deleteFile(appwriteConfig.bucketId, bucketFile.$id);
          canceledFiles.current.delete(fileName);
          return { success: true };
        }

        const { type, extension } = getFileType(bucketFile.name);

        await databases.createDocument(
          appwriteConfig.databaseId,
          appwriteConfig.filesCollectionId,
          ID.unique(),
          {
            name: bucketFile.name,
            url: generateImageUrl(bucketFile.$id),
            type,
            bucketFieldId: bucketFile.$id,
            accountId: user.accountId,
            owner: ownerId,
            extension,
            size: bucketFile.sizeOriginal,
            users: [],
          },
        );
        return { success: true };
      } catch (err) {
        console.log(err);
        return handleError(err) as UploadResult;
      } finally {
        router.refresh();
      }
    },
    [ownerId, router],
  );

  const cancelUploadFile = async (fileName: string) => {
    canceledFiles.current.add(fileName);
  };
  return { uploadFile, cancelUploadFile };
};
export default useUploadFile;
