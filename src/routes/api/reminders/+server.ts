import { json } from "@sveltejs/kit";
import { db } from "$lib/db";
import type { RequestHandler } from "@sveltejs/kit";

// GET /api/reminders - Get all reminders for a user
export const GET: RequestHandler = async ({ url, locals }) => {
  try {
    const userId = locals.user?.id;
    if (!userId) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    const taskId = url.searchParams.get("taskId");
    const eventId = url.searchParams.get("eventId");
    const upcoming = url.searchParams.get("upcoming");
    const sent = url.searchParams.get("sent");

    const where: any = { userId };

    if (taskId) {
      where.taskId = taskId;
    }

    if (eventId) {
      where.eventId = eventId;
    }

    if (upcoming === "true") {
      where.remindAt = {
        gte: new Date(),
      };
    }

    if (sent !== null) {
      where.sentAt = sent === "true" ? { not: null } : null;
    }

    const reminders = await db.reminder.findMany({
      where,
      include: {
        task: {
          select: { id: true, title: true, completed: true },
        },
        event: {
          select: { id: true, title: true, startTime: true, completed: true },
        },
      },
      orderBy: { remindAt: "asc" },
    });

    return json(reminders);
  } catch (error) {
    console.error("Error fetching reminders:", error);
    return json({ error: "Failed to fetch reminders" }, { status: 500 });
  }
};

// POST /api/reminders - Create a new reminder
export const POST: RequestHandler = async ({ request, locals }) => {
  try {
    const userId = locals.user?.id;
    if (!userId) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      remindAt,
      channel = "PUSH",
      taskId,
      eventId,
    } = await request.json();

    if (!remindAt) {
      return json({ error: "Remind time is required" }, { status: 400 });
    }

    if (!taskId && !eventId) {
      return json(
        { error: "Either taskId or eventId is required" },
        { status: 400 }
      );
    }

    if (taskId && eventId) {
      return json(
        { error: "Cannot set reminder for both task and event" },
        { status: 400 }
      );
    }

    // Validate channel
    const validChannels = ["PUSH", "EMAIL", "SMS"];
    if (!validChannels.includes(channel)) {
      return json(
        { error: "Invalid channel. Must be PUSH, EMAIL, or SMS" },
        { status: 400 }
      );
    }

    // Verify user owns the task or event
    if (taskId) {
      const task = await db.task.findFirst({
        where: { id: taskId, userId },
      });

      if (!task) {
        return json({ error: "Task not found" }, { status: 404 });
      }
    }

    if (eventId) {
      const event = await db.event.findFirst({
        where: { id: eventId, userId },
      });

      if (!event) {
        return json({ error: "Event not found" }, { status: 404 });
      }
    }

    const reminder = await db.reminder.create({
      data: {
        remindAt: new Date(remindAt),
        channel: channel as "PUSH" | "EMAIL" | "SMS",
        userId,
        taskId: taskId || null,
        eventId: eventId || null,
      },
      include: {
        task: {
          select: { id: true, title: true, completed: true },
        },
        event: {
          select: { id: true, title: true, startTime: true, completed: true },
        },
      },
    });

    return json(reminder, { status: 201 });
  } catch (error) {
    console.error("Error creating reminder:", error);
    return json({ error: "Failed to create reminder" }, { status: 500 });
  }
};
