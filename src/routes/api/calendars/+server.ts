import { json } from "@sveltejs/kit";
import { db } from "$lib/db";
import type { RequestHandler } from "@sveltejs/kit";

// GET /api/calendars - Get all calendars for a user
export const GET: RequestHandler = async ({ url, locals }) => {
  try {
    const userId = locals.user?.id;
    if (!userId) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    const familyId = url.searchParams.get("familyId");

    if (!familyId) {
      return json({ error: "Family ID is required" }, { status: 400 });
    }

    // Verify user owns the family
    const family = await db.family.findFirst({
      where: { id: familyId, userId },
    });

    if (!family) {
      return json({ error: "Family not found" }, { status: 404 });
    }

    const calendars = await db.calendar.findMany({
      where: { familyId },
      include: {
        _count: {
          select: {
            events: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    return json(calendars);
  } catch (error) {
    console.error("Error fetching calendars:", error);
    return json({ error: "Failed to fetch calendars" }, { status: 500 });
  }
};

// POST /api/calendars - Create a new calendar
export const POST: RequestHandler = async ({ request, locals }) => {
  try {
    const userId = locals.user?.id;
    if (!userId) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, color, familyId } = await request.json();

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return json({ error: "Calendar name is required" }, { status: 400 });
    }

    if (!familyId) {
      return json({ error: "Family ID is required" }, { status: 400 });
    }

    // Verify user owns the family
    const family = await db.family.findFirst({
      where: { id: familyId, userId },
    });

    if (!family) {
      return json({ error: "Family not found" }, { status: 404 });
    }

    // Check if calendar name already exists in this family
    const existingCalendar = await db.calendar.findFirst({
      where: {
        familyId,
        name: name.trim(),
      },
    });

    if (existingCalendar) {
      return json(
        { error: "Calendar with this name already exists in this family" },
        { status: 409 }
      );
    }

    const calendar = await db.calendar.create({
      data: {
        name: name.trim(),
        color: color?.trim() || null,
        familyId,
      },
      include: {
        _count: {
          select: {
            events: true,
          },
        },
      },
    });

    return json(calendar, { status: 201 });
  } catch (error) {
    console.error("Error creating calendar:", error);
    return json({ error: "Failed to create calendar" }, { status: 500 });
  }
};
