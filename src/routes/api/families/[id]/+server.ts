import { json } from "@sveltejs/kit";
import { db } from "$lib/db";
import type { RequestHandler } from "@sveltejs/kit";

// GET /api/families/[id] - Get a specific family
export const GET: RequestHandler = async ({ params, locals }) => {
  try {
    const userId = locals.user?.id;
    if (!userId) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    const family = await db.family.findFirst({
      where: {
        id: params.id,
        userId,
      },
      include: {
        members: true,
        tasks: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        events: {
          orderBy: { startTime: "asc" },
          take: 10,
        },
        calendars: true,
        locations: true,
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

    if (!family) {
      return json({ error: "Family not found" }, { status: 404 });
    }

    return json(family);
  } catch (error) {
    console.error("Error fetching family:", error);
    return json({ error: "Failed to fetch family" }, { status: 500 });
  }
};

// PUT /api/families/[id] - Update a family
export const PUT: RequestHandler = async ({ params, request, locals }) => {
  try {
    const userId = locals.user?.id;
    if (!userId) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name } = await request.json();

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return json({ error: "Family name is required" }, { status: 400 });
    }

    const family = await db.family.updateMany({
      where: {
        id: params.id,
        userId,
      },
      data: {
        name: name.trim(),
      },
    });

    if (family.count === 0) {
      return json({ error: "Family not found" }, { status: 404 });
    }

    const updatedFamily = await db.family.findFirst({
      where: { id: params.id },
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

    return json(updatedFamily);
  } catch (error) {
    console.error("Error updating family:", error);
    return json({ error: "Failed to update family" }, { status: 500 });
  }
};

// DELETE /api/families/[id] - Delete a family
export const DELETE: RequestHandler = async ({ params, locals }) => {
  try {
    const userId = locals.user?.id;
    if (!userId) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    const family = await db.family.deleteMany({
      where: {
        id: params.id,
        userId,
      },
    });

    if (family.count === 0) {
      return json({ error: "Family not found" }, { status: 404 });
    }

    return json({ message: "Family deleted successfully" });
  } catch (error) {
    console.error("Error deleting family:", error);
    return json({ error: "Failed to delete family" }, { status: 500 });
  }
};
