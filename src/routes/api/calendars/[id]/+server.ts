import { json } from "@sveltejs/kit";
import { db } from "$lib/db";
import type { RequestHandler } from "@sveltejs/kit";

// GET /api/calendars/[id] - Get a specific calendar
export const GET: RequestHandler = async ({ params, locals }) => {
  try {
    const userId = locals.user?.id;
    if (!userId) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    const calendar = await db.calendar.findFirst({
      where: {
        id: params.id,
        family: {
          userId,
        },
      },
      include: {
        family: {
          select: { id: true, name: true },
        },
        events: {
          orderBy: { startTime: "asc" },
          take: 20,
        },
        _count: {
          select: {
            events: true,
          },
        },
      },
    });

    if (!calendar) {
      return json({ error: "Calendar not found" }, { status: 404 });
    }

    return json(calendar);
  } catch (error) {
    console.error("Error fetching calendar:", error);
    return json({ error: "Failed to fetch calendar" }, { status: 500 });
  }
};

// PUT /api/calendars/[id] - Update a calendar
export const PUT: RequestHandler = async ({ params, request, locals }) => {
  try {
    const userId = locals.user?.id;
    if (!userId) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, color } = await request.json();

    // Get the existing calendar to verify ownership
    const existingCalendar = await db.calendar.findFirst({
      where: {
        id: params.id,
        family: {
          userId,
        },
      },
    });

    if (!existingCalendar) {
      return json({ error: "Calendar not found" }, { status: 404 });
    }

    const updateData: any = {};

    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length === 0) {
        return json({ error: "Calendar name is required" }, { status: 400 });
      }

      // Check if calendar name already exists in this family (excluding current calendar)
      const existingNameCalendar = await db.calendar.findFirst({
        where: {
          familyId: existingCalendar.familyId,
          name: name.trim(),
          id: { not: params.id },
        },
      });

      if (existingNameCalendar) {
        return json(
          { error: "Calendar with this name already exists in this family" },
          { status: 409 }
        );
      }

      updateData.name = name.trim();
    }

    if (color !== undefined) {
      updateData.color = color?.trim() || null;
    }

    const calendar = await db.calendar.update({
      where: { id: params.id },
      data: updateData,
      include: {
        family: {
          select: { id: true, name: true },
        },
        _count: {
          select: {
            events: true,
          },
        },
      },
    });

    return json(calendar);
  } catch (error) {
    console.error("Error updating calendar:", error);
    return json({ error: "Failed to update calendar" }, { status: 500 });
  }
};

// DELETE /api/calendars/[id] - Delete a calendar
export const DELETE: RequestHandler = async ({ params, locals }) => {
  try {
    const userId = locals.user?.id;
    if (!userId) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if calendar has events
    const eventsCount = await db.event.count({
      where: {
        calendarId: params.id,
        family: {
          userId,
        },
      },
    });

    if (eventsCount > 0) {
      return json(
        {
          error:
            "Cannot delete calendar with existing events. Please move or delete events first.",
        },
        { status: 409 }
      );
    }

    const calendar = await db.calendar.deleteMany({
      where: {
        id: params.id,
        family: {
          userId,
        },
      },
    });

    if (calendar.count === 0) {
      return json({ error: "Calendar not found" }, { status: 404 });
    }

    return json({ message: "Calendar deleted successfully" });
  } catch (error) {
    console.error("Error deleting calendar:", error);
    return json({ error: "Failed to delete calendar" }, { status: 500 });
  }
};
