import { json } from "@sveltejs/kit";
import { db } from "$lib/db";
import type { RequestHandler } from "@sveltejs/kit";

// GET /api/events/[id] - Get a specific event
export const GET: RequestHandler = async ({ params, locals }) => {
  try {
    const userId = locals.user?.id;
    if (!userId) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    const event = await db.event.findFirst({
      where: {
        id: params.id,
        userId,
      },
      include: {
        family: {
          select: { id: true, name: true },
        },
        calendar: {
          select: { id: true, name: true, color: true },
        },
        location: {
          select: { id: true, label: true, address: true },
        },
        reminders: {
          orderBy: { remindAt: "asc" },
        },
        notifications: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!event) {
      return json({ error: "Event not found" }, { status: 404 });
    }

    return json(event);
  } catch (error) {
    console.error("Error fetching event:", error);
    return json({ error: "Failed to fetch event" }, { status: 500 });
  }
};

// PUT /api/events/[id] - Update an event
export const PUT: RequestHandler = async ({ params, request, locals }) => {
  try {
    const userId = locals.user?.id;
    if (!userId) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      title,
      address,
      description,
      startTime,
      endTime,
      completed,
      calendarId,
      locationId,
    } = await request.json();

    // Get the existing event to verify ownership
    const existingEvent = await db.event.findFirst({
      where: { id: params.id, userId },
    });

    if (!existingEvent) {
      return json({ error: "Event not found" }, { status: 404 });
    }

    const updateData: any = {};

    if (title !== undefined) {
      if (typeof title !== "string" || title.trim().length === 0) {
        return json({ error: "Event title is required" }, { status: 400 });
      }
      updateData.title = title.trim();
    }

    if (address !== undefined) {
      updateData.address = address?.trim() || null;
    }

    if (description !== undefined) {
      updateData.description = description?.trim() || null;
    }

    if (startTime !== undefined) {
      updateData.startTime = new Date(startTime);
    }

    if (endTime !== undefined) {
      updateData.endTime = new Date(endTime);
    }

    if (completed !== undefined) {
      updateData.completed = Boolean(completed);
    }

    if (calendarId !== undefined) {
      // Verify calendar belongs to the family
      const calendar = await db.calendar.findFirst({
        where: { id: calendarId, familyId: existingEvent.familyId },
      });

      if (!calendar) {
        return json({ error: "Calendar not found" }, { status: 404 });
      }
      updateData.calendarId = calendarId;
    }

    if (locationId !== undefined) {
      if (locationId) {
        // Verify location belongs to the family
        const location = await db.location.findFirst({
          where: { id: locationId, familyId: existingEvent.familyId },
        });

        if (!location) {
          return json({ error: "Location not found" }, { status: 404 });
        }
      }
      updateData.locationId = locationId || null;
    }

    const event = await db.event.update({
      where: { id: params.id },
      data: updateData,
      include: {
        family: {
          select: { id: true, name: true },
        },
        calendar: {
          select: { id: true, name: true, color: true },
        },
        location: {
          select: { id: true, label: true, address: true },
        },
        reminders: {
          orderBy: { remindAt: "asc" },
        },
        _count: {
          select: {
            reminders: true,
            notifications: true,
          },
        },
      },
    });

    return json(event);
  } catch (error) {
    console.error("Error updating event:", error);
    return json({ error: "Failed to update event" }, { status: 500 });
  }
};

// DELETE /api/events/[id] - Delete an event
export const DELETE: RequestHandler = async ({ params, locals }) => {
  try {
    const userId = locals.user?.id;
    if (!userId) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    const event = await db.event.deleteMany({
      where: {
        id: params.id,
        userId,
      },
    });

    if (event.count === 0) {
      return json({ error: "Event not found" }, { status: 404 });
    }

    return json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error);
    return json({ error: "Failed to delete event" }, { status: 500 });
  }
};
