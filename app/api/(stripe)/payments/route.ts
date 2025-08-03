import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, createSessionClient } from "@/lib/appwrite";
import { appwriteConfig } from "@/lib/appwrite/config";
import { Query } from "node-appwrite";
import { stripe } from "@/lib/stripe";
import { getPlan } from "@/lib/utils";
import { PaymentsSchema } from "@/lib/validations";
import {
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "@/lib/http-errors";
import handleError from "@/lib/handlers/error";
import { APIErrorResponse } from "@/types";
import { getCurrentUser } from "@/lib/actions/user.action";
import Stripe from "stripe";
import { PUBLIC_URL } from "@/constants";

export async function GET() {
  try {
    const { data: user } = await getCurrentUser();

    if (!user) throw new UnauthorizedError();
    if (!user.stripeCustomerId) throw new NotFoundError("Subscription");

    const plan = getPlan(user.plan, null);
    if (!plan) throw new NotFoundError("Plan");

    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripeCustomerId,
      status: "all",
      limit: 1,
    });

    const subscription = subscriptions.data[0];
    if (!subscription) throw new NotFoundError("No active subscription found");

    const stripeSub = await stripe.subscriptions.retrieve(subscription.id, {
      expand: ["default_payment_method"],
    });

    const paymentMethod = stripeSub.default_payment_method as
      | Stripe.PaymentMethod
      | undefined;

    if (!paymentMethod || paymentMethod.type !== "card") {
      throw new Error("Payment details not available");
    }

    const card = paymentMethod.card;
    if (!card) throw new Error("Card details missing");

    const currentTime = Math.floor(Date.now() / 1000);
    const periodEnd = stripeSub.items.data[0].current_period_end;
    const remainingSeconds = periodEnd - currentTime;
    const remainingDays = Math.max(
      Math.floor(remainingSeconds / (60 * 60 * 24)),
      0,
    );

    return NextResponse.json(
      {
        success: true,
        data: {
          planName: plan.title,
          planPrice: plan.price,
          cardBrand: card.brand,
          last4: card.last4,
          expMonth: card.exp_month,
          expYear: card.exp_year,
          remainingPeriod: remainingDays,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Stripe fetch error:", error);
    return handleError(error) as APIErrorResponse;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = PaymentsSchema.safeParse(body);
    let stripeCustomerId: string;

    if (!validatedData.success) {
      throw new ValidationError(validatedData.error.flatten().fieldErrors);
    }

    const { plan: PlanTitle } = validatedData.data;

    const plan = getPlan(PlanTitle, null);
    console.log("[PAYMENTS API]", { PlanTitle, plan });

    if (!plan) throw new NotFoundError("Plan");
    const { databases } = await createAdminClient();
    const { account } = await createSessionClient();

    const user = await account.get();
    if (!user) throw new UnauthorizedError();

    const userDoc = (
      await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.usersCollectionId,
        [Query.equal("accountId", user.$id)],
      )
    ).documents[0];

    if (!userDoc.stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: userDoc.fullName,
      });

      await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.usersCollectionId,
        userDoc.$id,
        {
          stripeCustomerId: customer.id,
        },
      );

      stripeCustomerId = customer.id;
    } else {
      stripeCustomerId = userDoc.stripeCustomerId;
    }

    if (!stripeCustomerId) throw new Error("Customer ID is missing.");

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: "subscription",
      success_url: `${PUBLIC_URL}api/check?checkout_id={CHECKOUT_SESSION_ID}`,
      cancel_url: PUBLIC_URL,
      line_items: [
        {
          price: plan.priceId,
          quantity: 1,
        },
      ],
    });

    return NextResponse.json(
      { success: true, data: checkoutSession.url },
      { status: 200 },
    );
  } catch (err) {
    console.error("[PAYMENT ERROR]", err);
    return handleError(err, "api") as APIErrorResponse;
  }
}
