import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/appwrite";
import { appwriteConfig } from "@/lib/appwrite/config";
import { Query } from "node-appwrite";
import { getPlan } from "@/lib/utils";
import handleError from "@/lib/handlers/error";
import { APIErrorResponse } from "@/types";
import { NotFoundError } from "@/lib/http-errors";
import { PUBLIC_URL } from "@/constants";

export async function GET(req: NextRequest) {
  try {
    const checkoutId = req.nextUrl.searchParams.get("checkout_id");

    if (!checkoutId) throw new Error("Checkout ID is required");

    const session = await stripe.checkout.sessions.retrieve(checkoutId);

    if (!session?.customer) throw new NotFoundError("Customer");

    const subscriptions = await stripe.subscriptions.list({
      customer: session.customer as string,
      limit: 1,
      status: "all",
    });

    const { databases } = await createAdminClient();

    const userDoc = (
      await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.usersCollectionId,
        [Query.equal("stripeCustomerId", session.customer as string)],
      )
    ).documents[0];

    if (!userDoc) throw new NotFoundError("User");

    const plan = getPlan(
      null,
      subscriptions?.data[0]?.items?.data[0]?.price.id,
    );

    if (!plan) throw new NotFoundError("Plan");

    await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      userDoc.$id,
      { plan: plan.title },
    );

    return NextResponse.redirect(`${PUBLIC_URL}?payment=true`);
  } catch (err) {
    return handleError(err, "api") as APIErrorResponse;
  }
}
