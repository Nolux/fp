import { createAuthClient } from "better-auth/svelte";
import { stripeClient } from "@better-auth/stripe/client";

export const authClient = createAuthClient({
  plugins: [
    stripeClient({
      subscription: true, //if you want to enable subscription management
    }),
  ],
});
