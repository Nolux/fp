import { json } from "@sveltejs/kit";
import { db } from "$lib/db";
import type { RequestHandler } from "@sveltejs/kit";

// GET /api/families - Get all families for a user
export const GET: RequestHandler = async ({ url, locals }) => {
  try {
    const userId = locals.user?.id;
    if (!userId) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    const families = await db.family.findMany({
      where: { userId },
      include: {
        members: true,
        _count: {
          select: {
            tasks: true,
            events: true,
            calendars: true,
            locations: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return json(families);
  } catch (error) {
    console.error("Error fetching families:", error);
    return json({ error: "Failed to fetch families" }, { status: 500 });
  }
};

// POST /api/families - Create a new family
export const POST: RequestHandler = async ({ request, locals }) => {
  try {
    const userId = locals.user?.id;
    if (!userId) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name } = await request.json();

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return json({ error: "Family name is required" }, { status: 400 });
    }

    const family = await db.family.create({
      data: {
        name: name.trim(),
        userId,
      },
      include: {
        members: true,
        _count: {
          select: {
            tasks: true,
            events: true,
            calendars: true,
            locations: true,
          },
        },
      },
    });

    return json(family, { status: 201 });
  } catch (error) {
    console.error("Error creating family:", error);
    return json({ error: "Failed to create family" }, { status: 500 });
  }
};
