"use server";

import { ID, Query } from "node-appwrite";
import { createAdminClient, createSessionClient } from "../appwrite";
import { appwriteConfig } from "../appwrite/config";
import { avatarPlaceholderUrl } from "@/constants";
import { cookies } from "next/headers";
import { InputFile } from "node-appwrite/file";
import {
  SendEmailOTPSchema,
  SignInSchema,
  SignUpSchema,
  UpdateAvatarSchema,
  UpdateEmailSchema,
  VerifyEmailOTPSchema,
} from "../validations";
import { generateImageUrl, validate } from "../utils";
import handleError from "../handlers/error";
import { ActionResponse, ErrorResponse, User } from "@/types";
import { NotFoundError, UnauthorizedError } from "../http-errors";
import {
  CreateAccountParams,
  GetUserByEmailParams,
  SendEmailOTPParams,
  SignInParams,
  UpdateAvatarParams,
  UpdateEmailParams,
  VerifyEmailOTPParams,
} from "@/types/action";
import { revalidatePath } from "next/cache";

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

  const result = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.usersCollectionId,
    [Query.equal("email", [email])],
  );

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
      console.log(validationResult);
      return handleError(validationResult) as ErrorResponse;
    }
    console.log("email called");

    const { userId, email } = validationResult.params!;

    const { account, databases } = await createAdminClient();

    const session = await account.createEmailToken(
      userId ? userId : ID.unique(),
      email,
    );

    const user = await getUserByEmail({ email });
    console.log("sendEmail", { user, session });
    if (user) {
      await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.usersCollectionId,
        user.$id,
        { otp: session.secret },
      );
    }

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
    console.log({ params });

    const validationResult = await validate({
      params,
      schema: VerifyEmailOTPSchema,
    });

    if (validationResult instanceof Error) {
      return handleError(validationResult) as ErrorResponse;
    }

    const { accountId, otpCode } = validationResult.params;
    const { account } = await createAdminClient();

    console.log({ account, otpCode });
    const session = await account.createSession(accountId, otpCode);
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
    console.log(error);
    return handleError(error) as ErrorResponse;
  }
};

export const signIn = async (
  params: SignInParams,
): Promise<ActionResponse<{ accountId: string }>> => {
  try {
    console.log("sign in called");
    const validationResult = await validate({ params, schema: SignInSchema });

    if (validationResult instanceof Error) {
      return handleError(validationResult) as ErrorResponse;
    }

    const { email } = validationResult.params!;
    console.log({ email });
    const existingUser = await getUserByEmail({ email });
    console.log({ existingUser });
    await sendEmailOTP({ email });

    return { success: true, data: { accountId: existingUser?.accountId } };
  } catch (error) {
    console.log(error);
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
export const signOutUser = async (): Promise<ActionResponse> => {
  const { account } = await createSessionClient();

  try {
    await account.deleteSession("current");
    (await cookies()).delete("appwrite-session");
    return { success: true };
  } catch (error) {
    return handleError(error);
  }
};

export const updateAvatar = async (
  params: UpdateAvatarParams,
): Promise<ActionResponse> => {
  try {
    const validationResult = await validate({
      params,
      schema: UpdateAvatarSchema,
    });

    if (validationResult instanceof Error) {
      return handleError(validationResult);
    }

    const { newAvatar, pathname } = validationResult.params;

    const newAvatarFile = InputFile.fromBuffer(newAvatar, newAvatar.name);
    console.log({ newAvatarFile });
    const user = await getCurrentUser();

    if (user.error) {
      return handleError(user.error) as ErrorResponse;
    }

    if (!user.data) {
      throw new UnauthorizedError("User session not found");
    }

    console.log("bucketFieldId", user.data.bucketFieldId);

    const { storage, databases } = await createAdminClient();

    if (user.data.bucketFieldId) {
      await storage.deleteFile(
        appwriteConfig.bucketId,
        user.data.bucketFieldId,
      );
    }

    const bucketAvatarFile = await storage.createFile(
      appwriteConfig.bucketId,
      ID.unique(),
      newAvatarFile,
    );

    await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      user.data.$id,
      {
        avatar: generateImageUrl(bucketAvatarFile.$id),
        bucketFieldId: bucketAvatarFile.$id,
      },
    );

    revalidatePath(pathname);
    return { success: true };
  } catch (err) {
    console.log(err);
    return handleError(err) as ErrorResponse;
  }
};

export const updateEmail = async (
  params: UpdateEmailParams,
): Promise<ActionResponse> => {
  try {
    const validationResult = await validate({
      params,
      schema: UpdateEmailSchema,
    });

    if (validationResult instanceof Error) {
      console.log({ validationResult });

      return handleError(validationResult) as ErrorResponse;
    }

    const { newEmail, pathname, userId, otp } = validationResult.params;

    const user = await getCurrentUser();

    if (user.error) {
      console.log("user", user.error);

      return handleError(user.error) as ErrorResponse;
    }

    if (!user.data) {
      throw new UnauthorizedError("User session not found");
    }

    if (user.data.otp !== otp) {
      throw new Error("Invalid OTP");
    }

    const { databases, users } = await createAdminClient();

    const result = await users.get(
      user.data.accountId, // userId
    );

    await users.updateEmailVerification(
      user.data.accountId, // userId
      true, // emailVerification
    );

    console.log({ result });

    await users.updateEmail(
      user.data.accountId, // userId
      newEmail, // email
    );

    await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      userId,
      {
        email: newEmail,
        otp: null,
      },
    );

    revalidatePath(pathname);
    return { success: true };
  } catch (err) {
    console.log("catch", err);
    return handleError(err) as ErrorResponse;
  }
};

export const deleteAccount = async (): Promise<ActionResponse> => {
  try {
    const user = await getCurrentUser();

    if (!user || !user.data) {
      throw new NotFoundError("User");
    }
    const { databases, storage, users } = await createAdminClient();
    await signOutUser();
    // const fileIds = user.data.files;

    const fileDocs = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      [Query.equal("owner", user.data.$id)],
    );
    if (fileDocs.total) {
      const bucketsPromises = fileDocs.documents.map((document) =>
        storage.deleteFile(appwriteConfig.bucketId, document.bucketFieldId),
      );
      const fileDocsPromises = fileDocs.documents.map((document) =>
        databases.deleteDocument(
          appwriteConfig.databaseId,
          appwriteConfig.filesCollectionId,
          document.$id,
        ),
      );
      await Promise.all(bucketsPromises);
      await Promise.all(fileDocsPromises);
    }
    await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      user.data.$id,
    );
    await users.delete(user.data.accountId);
    return { success: true };
  } catch (err) {
    return handleError(err);
    console.log(err);
  }
};
