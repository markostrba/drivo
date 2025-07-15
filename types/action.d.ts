import { DocAnalytics } from "./global";

interface GetUserByEmailParams {
  email: string;
}

interface SendEmailOTPParams {
  email: string;
}

interface VerifyEmailOTPParams {
  accountId: string;
  otpCode: string;
}

interface CreateAccountParams {
  fullName: string;
  email: string;
}

interface SignInParams {
  email: string;
}

interface GetFilesParams {
  currentUserId: string;
  currentUserEmail: string;
  type: string[];
  searchText?: string;
  sort?: string;
}

interface RenameFileParams {
  fileId: string;
  name: string;
  extension: string;
  pathname: string;
}

interface ShareFileParams {
  fileId: string;
  email: string;
  pathname: string;
}

interface DeleteFileParams {
  fileId: string;
  userId: string;
  bucketFileId: string;
  pathname: string;
}

interface GetFileAnalyticsParams {
  userId: string;
}

interface GetFileAnalyticsResponse {
  totalUsedSpace: number;
  documents: DocAnalytics;
  images: DocAnalytics;
  media: DocAnalytics;
  others: DocAnalytics;
}
