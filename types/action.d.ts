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
