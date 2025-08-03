import { getEnv } from "../utils";

export const appwriteConfig = {
  projectId: getEnv(
    "NEXT_PUBLIC_APPWRITE_PROJECT",
    process.env.NEXT_PUBLIC_APPWRITE_PROJECT,
  ),
  endpointUrl: getEnv(
    "NEXT_PUBLIC_APPWRITE_ENDPOINT",
    process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT,
  ),
  databaseId: getEnv(
    "NEXT_PUBLIC_APPWRITE_DATABASE",
    process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
  ),
  usersCollectionId: getEnv(
    "NEXT_PUBLIC_APPWRITE_USERS_COLLECTION",
    process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION,
  ),
  filesCollectionId: getEnv(
    "NEXT_PUBLIC_APPWRITE_FILES_COLLECTION",
    process.env.NEXT_PUBLIC_APPWRITE_FILES_COLLECTION,
  ),
  bucketId: getEnv(
    "NEXT_PUBLIC_APPWRITE_BUCKET",
    process.env.NEXT_PUBLIC_APPWRITE_BUCKET,
  ),
  secretKey: getEnv(
    "NEXT_PUBLIC_APPWRITE_SECRET_KEY",
    process.env.NEXT_PUBLIC_APPWRITE_SECRET_KEY,
  ),
};
