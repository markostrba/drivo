"use server";

import { ID, Query } from "node-appwrite";
import { createAdminClient, createSessionClient } from "../appwrite";
import { appwriteConfig } from "../appwrite/config";
import { avatarPlaceholderUrl } from "@/constants";
import { cookies } from "next/headers";
import {
  SendEmailOTPSchema,
  SignInSchema,
  SignUpSchema,
  VerifyEmailOTPSchema,
} from "../validations";
import { validate } from "../utils";
import handleError from "../handlers/error";
import { ActionResponse, ErrorResponse, User } from "@/types";
import { UnauthorizedError } from "../http-errors";
import {
  CreateAccountParams,
  GetUserByEmailParams,
  SendEmailOTPParams,
  SignInParams,
  VerifyEmailOTPParams,
} from "@/types/action";

export const getUsersByEmail = async (
  email: string[],
): Promise<
  ActionResponse<{ fullName: string; email: string; avatar: string }[]>
> => {
  try {
    const { databases } = await createAdminClient();

    const { documents } = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      [Query.equal("email", email)],
    );
    const mappedUsers = documents
      ? documents.map<{
          fullName: string;
          email: string;
          avatar: string;
        }>(({ fullName, email, avatar }) => ({
          fullName,
          email,
          avatar,
        }))
      : [];

    return { success: true, data: mappedUsers };
  } catch (err) {
    console.log(err);
    return handleError(err) as ErrorResponse;
  }
};

export const getUserByEmail = async ({ email }: GetUserByEmailParams) => {
  const { databases } = await createAdminClient();

  console.log(email);
  const result = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.usersCollectionId,
    [Query.equal("email", [email])],
  );

  console.log("getUserByEmail", result.documents[0]);

  return result.total > 0 ? result.documents[0] : null;
};

export const sendEmailOTP = async (
  params: SendEmailOTPParams,
): Promise<ActionResponse<{ accountId: string }>> => {
  try {
    const validationResult = await validate({
      params,
      schema: SendEmailOTPSchema,
    });

    if (validationResult instanceof Error) {
      return handleError(validationResult) as ErrorResponse;
    }

    const { email } = validationResult.params!;

    const { account } = await createAdminClient();
    const session = await account.createEmailToken(ID.unique(), email);
    console.log("sendOTP session", session);

    return { success: true, data: { accountId: session.userId } };
  } catch (error) {
    console.log(error, "Failed to send email OTP");
    return handleError(error) as ErrorResponse;
  }
};

export const verifyEmailOTP = async (
  params: VerifyEmailOTPParams,
): Promise<ActionResponse<{ sessionId: string }>> => {
  try {
    const validationResult = await validate({
      params,
      schema: VerifyEmailOTPSchema,
    });

    if (validationResult instanceof Error) {
      return handleError(validationResult) as ErrorResponse;
    }

    const { accountId, otpCode } = validationResult.params;
    console.log("accountId", accountId);
    const { account } = await createAdminClient();

    const session = await account.createSession(accountId, otpCode);
    console.log("session verify", session);
    (await cookies()).set("appwrite-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    });

    return { success: true, data: { sessionId: session.$id } };
  } catch (error) {
    console.log(error);
    return handleError(error) as ErrorResponse;
  }
};

export const createAccount = async (
  params: CreateAccountParams,
): Promise<ActionResponse<{ accountId: string }>> => {
  try {
    const validationResult = await validate({ params, schema: SignUpSchema });

    if (validationResult instanceof Error) {
      return handleError(validationResult) as ErrorResponse;
    }

    const { fullName, email } = validationResult.params!;

    const existingUser = await getUserByEmail({ email });

    const otpResponse = await sendEmailOTP({ email });

    if (!otpResponse.data?.accountId) throw new Error("Failed to send an OTP");

    if (!existingUser) {
      const { databases } = await createAdminClient();

      await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.usersCollectionId,
        ID.unique(),
        {
          fullName,
          email,
          avatar: avatarPlaceholderUrl,
          accountId: otpResponse.data.accountId,
        },
      );
    }

    return { success: true, data: { accountId: otpResponse.data.accountId } };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
};

export const signIn = async (
  params: SignInParams,
): Promise<ActionResponse<{ accountId: string }>> => {
  try {
    const validationResult = await validate({ params, schema: SignInSchema });

    if (validationResult instanceof Error) {
      return handleError(validationResult) as ErrorResponse;
    }

    const { email } = validationResult.params!;

    console.log("signin", email);

    const existingUser = await getUserByEmail({ email });

    await sendEmailOTP({ email });

    return { success: true, data: { accountId: existingUser?.accountId } };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
};

export const getCurrentUser = async (): Promise<ActionResponse<User>> => {
  try {
    const { databases, account } = await createSessionClient();

    const result = await account.get();
    const user = await databases.listDocuments<User>(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      [Query.equal("accountId", result.$id)],
    );

    if (user.total <= 0) throw new UnauthorizedError("User session not found");

    return { success: true, data: user.documents[0] };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
};
