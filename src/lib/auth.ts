import { betterAuth } from "better-auth";
import { sveltekitCookies } from "better-auth/svelte-kit";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { stripe } from "@better-auth/stripe";
import { getRequestEvent } from "$app/server";
import { db } from "$lib/db";
import { env } from "$env/dynamic/private";

import Stripe from "stripe";

const stripeClient = new Stripe(env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
});

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
  },
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  plugins: [
    stripe({
      stripeClient,
      stripeWebhookSecret: env.STRIPE_WEBHOOK_SECRET!,
      createCustomerOnSignUp: true,
    }),
    sveltekitCookies(getRequestEvent),
  ],
});
