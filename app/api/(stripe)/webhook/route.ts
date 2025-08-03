import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/appwrite";
import { appwriteConfig } from "@/lib/appwrite/config";
import { Query } from "node-appwrite";
import { stripe } from "@/lib/stripe";
import { getEnv, getPlan } from "@/lib/utils";
import handleError from "@/lib/handlers/error";
import { APIErrorResponse } from "@/types";
import { NotFoundError } from "@/lib/http-errors";

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get("stripe-signature");
    if (!signature) throw new Error("Missing signature");

    const rawBody = await req.text();
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        getEnv("STRIPE_WEBHOOK_SECRET", process.env.STRIPE_WEBHOOK_SECRET),
      );
    } catch (err) {
      console.error("Webhook signature verification failed.", err);
      throw new Error("Invalid signature");
    }

    const { databases } = await createAdminClient();
    switch (event.type) {
      case "checkout.session.completed": {
        const customerId = event.data.object.customer;
        const customerEmail =
          event.data.object.customer_email ||
          event.data.object.customer_details?.email;
        console.log("[WEBHOOK]", {
          customerId,
          customerEmail,
          event,
          object: event.data.object,
        });
        if (!customerId) throw new Error("Missing customer ID in event");
        if (!customerEmail) throw new Error("Missing customer email in event");

        const userDoc = (
          await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.usersCollectionId,
            [Query.equal("email", customerEmail)],
          )
        ).documents[0];

        if (!userDoc) throw new NotFoundError("User");

        const subscriptions = await stripe.subscriptions.list({
          customer: customerId as string,
          limit: 1,
          status: "active",
        });

        let plan = "Free";

        if (subscriptions.data.length > 0) {
          const priceId = subscriptions.data[0].items.data[0].price.id;
          plan = getPlan(null, priceId)?.title || "Free";
          console.log("[WEBHOOK]", { priceId, plan });
        }

        if (!userDoc.stripeCustomerId) {
          await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.usersCollectionId,
            userDoc.$id,
            { stripeCustomerId: customerId, plan: plan },
          );
        }
        await databases.updateDocument(
          appwriteConfig.databaseId,
          appwriteConfig.usersCollectionId,
          userDoc.$id,
          { plan: plan },
        );

        break;
      }
      case "customer.subscription.deleted": {
        const customerId = event.data.object.customer;

        if (!customerId) throw new Error("Missing customer ID in event");

        const userDoc = (
          await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.usersCollectionId,
            [Query.equal("stripeCustomerId", customerId as string)],
          )
        ).documents[0];

        if (!userDoc) throw new NotFoundError("User");

        await databases.updateDocument(
          appwriteConfig.databaseId,
          appwriteConfig.usersCollectionId,
          userDoc.$id,
          {
            plan: "Free",
          },
        );
        break;
      }
      case "customer.subscription.updated":
        {
          const customerId = event.data.object.customer;
          const subscription = event.data.object as Stripe.Subscription;
          const plan = getPlan(null, subscription.items.data[0].plan.id);
          console.log("[WEBHOOK]", {
            planId: subscription.items.data[0].plan.id,
            plan,
          });
          if (!customerId) throw new Error("Missing customer ID in event");
          if (!plan) throw new NotFoundError("Plan");
          const userDoc = (
            await databases.listDocuments(
              appwriteConfig.databaseId,
              appwriteConfig.usersCollectionId,
              [Query.equal("stripeCustomerId", customerId as string)],
            )
          ).documents[0];

          if (!userDoc) throw new NotFoundError("User");

          await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.usersCollectionId,
            userDoc.$id,
            {
              plan: plan.title,
            },
          );
        }
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
    return NextResponse.json({ message: "Webhook handled" });
  } catch (err) {
    console.log("[WEBHOOK] Error:", err);
    return handleError(err, "api") as APIErrorResponse;
  }
}
