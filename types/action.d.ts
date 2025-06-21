interface GetUserByEmailProps {
  email: string;
}

interface SendEmailOTPProps {
  email: string;
}

interface VerifyEmailOTPProps {
  accountId: string;
  otpCode: string;
}

interface CreateAccountProps {
  fullName: string;
  email: string;
}
