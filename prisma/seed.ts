import { db } from "../src/lib/db";

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
  },
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
});

const seed = async () => {
  const user = await auth.api.signUpEmail({
    body: {
      name: "Test",
      email: "test@test.com",
      password: "test1234",
    },
  });
  console.log(user);

  // create a family
  const family = await db.family.create({
    data: {
      id: crypto.randomUUID(),
      name: "Test Family",
      userId: user.user.id,
    },
  });

  // create calendar with events
  const calendar = await db.calendar.create({
    data: {
      id: crypto.randomUUID(),
      name: "Test Calendar",
      color: "#ff0000",
      family: {
        connect: {
          id: family.id,
        },
      },
      events: {
        create: [
          {
            id: crypto.randomUUID(),
            title: "Test Event",
            description: "Test Description",
            startTime: new Date(),
            endTime: new Date(new Date().getTime() + 1000 * 60 * 60 * 24),
            userId: user.user.id,
            familyId: family.id,
          },
        ],
      },
    },
  });
};

seed();
