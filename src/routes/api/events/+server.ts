import { json } from "@sveltejs/kit";
import { db } from "$lib/db";
import type { RequestHandler } from "@sveltejs/kit";

// GET /api/events - Get all events for a user
export const GET: RequestHandler = async ({ url, locals }) => {
  try {
    const userId = locals.user?.id;
    if (!userId) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    const familyId = url.searchParams.get("familyId");
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");
    const completed = url.searchParams.get("completed");

    const where: any = { userId };

    if (familyId) {
      where.familyId = familyId;
    }

    if (startDate && endDate) {
      where.startTime = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    if (completed !== null) {
      where.completed = completed === "true";
    }

    const events = await db.event.findMany({
      where,
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
        _count: {
          select: {
            reminders: true,
            notifications: true,
          },
        },
      },
      orderBy: { startTime: "asc" },
    });

    return json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    return json({ error: "Failed to fetch events" }, { status: 500 });
  }
};

// POST /api/events - Create a new event
export const POST: RequestHandler = async ({ request, locals }) => {
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
      familyId,
      calendarId,
      locationId,
    } = await request.json();

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return json({ error: "Event title is required" }, { status: 400 });
    }

    if (!startTime || !endTime) {
      return json(
        { error: "Start time and end time are required" },
        { status: 400 }
      );
    }

    if (!familyId) {
      return json({ error: "Family ID is required" }, { status: 400 });
    }

    if (!calendarId) {
      return json({ error: "Calendar ID is required" }, { status: 400 });
    }

    // Verify user owns the family
    const family = await db.family.findFirst({
      where: { id: familyId, userId },
    });

    if (!family) {
      return json({ error: "Family not found" }, { status: 404 });
    }

    // Verify calendar belongs to the family
    const calendar = await db.calendar.findFirst({
      where: { id: calendarId, familyId },
    });

    if (!calendar) {
      return json({ error: "Calendar not found" }, { status: 404 });
    }

    // Verify location belongs to the family if provided
    if (locationId) {
      const location = await db.location.findFirst({
        where: { id: locationId, familyId },
      });

      if (!location) {
        return json({ error: "Location not found" }, { status: 404 });
      }
    }

    const event = await db.event.create({
      data: {
        title: title.trim(),
        address: address?.trim() || null,
        description: description?.trim() || null,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        familyId,
        calendarId,
        locationId: locationId || null,
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
        _count: {
          select: {
            reminders: true,
            notifications: true,
          },
        },
      },
    });

    return json(event, { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    return json({ error: "Failed to create event" }, { status: 500 });
  }
};
