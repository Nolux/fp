import { sequence } from "@sveltejs/kit/hooks";
import { auth } from "$lib/auth";
import { svelteKitHandler } from "better-auth/svelte-kit";
import { building } from "$app/environment";
import { redirect, type Handle } from "@sveltejs/kit";
import { locale } from "svelte-i18n";

const handleSession: Handle = async ({ event, resolve }) => {
  // Fetch current session from Better Auth
  const session = await auth.api.getSession({
    headers: event.request.headers,
  });

  // Make session and user available on server
  if (session) {
    event.locals.session = session.session;
    event.locals.user = session.user;
  }

  return svelteKitHandler({ event, resolve, auth, building });
};

const handleProtectedRoutes: Handle = async ({ event, resolve }) => {
  const session = event.locals.session;
  const path = event.url.pathname;

  if (path.startsWith("/protected")) {
    if (!session) {
      return redirect(302, "/login");
    }
  }

  return resolve(event);
};

const handleI18n: Handle = async ({ event, resolve }) => {
  const lang = event.request.headers.get("accept-language")?.split(",")[0];
  if (lang) {
    locale.set(lang);
  }
  return resolve(event);
};

export const handle = sequence(
  handleSession,
  handleI18n,
  handleProtectedRoutes
);
