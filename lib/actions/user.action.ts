"use server";

import { ID, Query } from "node-appwrite";
import { createAdminClient } from "../appwrite";
import { appwriteConfig } from "../appwrite/config";
import { avatarPlaceholderUrl } from "@/constants";
import { cookies } from "next/headers";

const getUserByEmail = async (email: string) => {
  const { databases } = await createAdminClient();

  console.log(email);
  const result = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.usersCollectionId,
    // eslint-disable-next-line prettier/prettier
    [Query.equal("email", [email])]
  );

  console.log("getUserByEmail", result.documents[0]);

  return result.total > 0 ? result.documents[0] : null;
};

export const sendEmailOTP = async (email: string) => {
  const { account } = await createAdminClient();

  try {
    const session = await account.createEmailToken(ID.unique(), email);
    console.log("sendOTP session", session);

    return session.userId;
  } catch (error) {
    console.log(error, "Failed to send email OTP");
  }
};

export const verifyEmailOTP = async (accountId: string, otpCode: string) => {
  try {
    const { account } = await createAdminClient();

    const session = await account.createSession(accountId, otpCode);

    (await cookies()).set("appwrite-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    });

    return JSON.parse(JSON.stringify({ sessionId: session.$id }));
  } catch (error) {
    console.log(error, "failed to verify otp");
  }
};

export const createAccount = async ({
  fullName,
  email,
}: {
  fullName: string;
  email: string;
}) => {
  console.log("createAcc", fullName, email);
  const existingUser = await getUserByEmail(email);
  console.log("existing user", existingUser);

  const accountId = await sendEmailOTP(email);
  console.log("createAccount accountId", accountId);

  if (!accountId) throw new Error("Failed to send an OTP");

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
        accountId,
        // eslint-disable-next-line prettier/prettier
      }
    );
  }
  return JSON.parse(JSON.stringify(accountId));
};
