import { DocAnalytics } from ".";

export interface GetUserByEmailParams {
  email: string;
}

export interface SendEmailOTPParams {
  email: string;
  userId?: string;
}

export interface VerifyEmailOTPParams {
  accountId: string;
  otpCode: string;
}

export interface CreateAccountParams {
  fullName: string;
  email: string;
}

export interface SignInParams {
  email: string;
}

export interface GetFilesParams {
  currentUserId: string;
  currentUserEmail: string;
  type: string[];
  searchText?: string;
  sort?: string;
}

export interface RenameFileParams {
  fileId: string;
  name: string;
  extension: string;
  pathname: string;
}

export interface ShareFileParams {
  fileId: string;
  email: string;
  pathname: string;
}

export interface DeleteFileParams {
  fileId: string;
  userId: string;
  bucketFileId: string;
  pathname: string;
}

export interface GetFileAnalyticsParams {
  userId: string;
}

export interface GetFileAnalyticsResponse {
  totalUsedSpace: number;
  documents: DocAnalytics;
  images: DocAnalytics;
  media: DocAnalytics;
  others: DocAnalytics;
}

export interface UpdateAvatarParams {
  newAvatar: File;
  pathname: string;
}

export interface UpdateEmailParams {
  newEmail: string;
  pathname: string;
  userId: string;
  otp: string;
}
