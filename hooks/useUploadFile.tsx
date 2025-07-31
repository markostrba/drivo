import { Client, Databases, Storage, UploadProgress } from "appwrite";
import { appwriteConfig } from "../lib/appwrite/config";
import handleError from "@/lib/handlers/error";
import { generateImageUrl, getFileType } from "@/lib/utils";
import { ID } from "node-appwrite";
import { useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

const client = new Client()
  .setEndpoint(appwriteConfig.endpointUrl)
  .setProject(appwriteConfig.projectId);

const databases = new Databases(client);
const storage = new Storage(client);

interface Props {
  accountId: string;
  ownerId: string;
}

const useUploadFile = ({ accountId, ownerId }: Props) => {
  const canceledFiles = useRef<Set<string>>(new Set());
  const router = useRouter();

  const uploadFile = useCallback(
    async (
      file: File,
      onProgress: (progress: UploadProgress, fileName: string) => void,
    ) => {
      const fileName = file.name;
      try {
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
          return null;
        }

        const { type, extension } = getFileType(bucketFile.name);

        const newFile = await databases.createDocument(
          appwriteConfig.databaseId,
          appwriteConfig.filesCollectionId,
          ID.unique(),
          {
            name: bucketFile.name,
            url: generateImageUrl(bucketFile.$id),
            type,
            bucketFieldId: bucketFile.$id,
            accountId,
            owner: ownerId,
            extension,
            size: bucketFile.sizeOriginal,
            users: [],
          },
        );

        return newFile;
      } catch (err) {
        return handleError(err);
      } finally {
        router.refresh();
      }
    },
    [accountId, ownerId, router],
  );

  const cancelUploadFile = async (fileName: string) => {
    canceledFiles.current.add(fileName);
  };
  return { uploadFile, cancelUploadFile };
};
export default useUploadFile;
