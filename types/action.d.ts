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
