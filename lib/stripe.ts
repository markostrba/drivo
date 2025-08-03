import Stripe from "stripe";
import { getEnv } from "./utils";

export const stripe = new Stripe(
  getEnv("STRIPE_SECRET_KEY", process.env.STRIPE_SECRET_KEY),
  {
    apiVersion: "2025-07-30.basil",
  },
);
