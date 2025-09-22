import { db } from "$lib/db";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ params, locals }) => {
  console.log("loading layout");
  if (locals.session) {
    console.log("session", locals.session);
    console.log("user", locals.user);
    const user = await db.user.findUnique({
      where: {
        id: locals.user.id,
      },
      include: {
        families: true,
      },
    });
    return {
      session: locals.session,
      user: { ...locals.user, ...user },
    };
  }
  return {
    session: null,
    user: null,
  };
};
