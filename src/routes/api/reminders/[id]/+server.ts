import { json } from "@sveltejs/kit";
import { db } from "$lib/db";
import type { RequestHandler } from "@sveltejs/kit";

// GET /api/reminders/[id] - Get a specific reminder
export const GET: RequestHandler = async ({ params, locals }) => {
  try {
    const userId = locals.user?.id;
    if (!userId) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    const reminder = await db.reminder.findFirst({
      where: {
        id: params.id,
        userId,
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

    if (!reminder) {
      return json({ error: "Reminder not found" }, { status: 404 });
    }

    return json(reminder);
  } catch (error) {
    console.error("Error fetching reminder:", error);
    return json({ error: "Failed to fetch reminder" }, { status: 500 });
  }
};

// PUT /api/reminders/[id] - Update a reminder
export const PUT: RequestHandler = async ({ params, request, locals }) => {
  try {
    const userId = locals.user?.id;
    if (!userId) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    const { remindAt, channel, sentAt } = await request.json();

    // Get the existing reminder to verify ownership
    const existingReminder = await db.reminder.findFirst({
      where: { id: params.id, userId },
    });

    if (!existingReminder) {
      return json({ error: "Reminder not found" }, { status: 404 });
    }

    const updateData: any = {};

    if (remindAt !== undefined) {
      updateData.remindAt = new Date(remindAt);
    }

    if (channel !== undefined) {
      const validChannels = ["PUSH", "EMAIL", "SMS"];
      if (!validChannels.includes(channel)) {
        return json(
          { error: "Invalid channel. Must be PUSH, EMAIL, or SMS" },
          { status: 400 }
        );
      }
      updateData.channel = channel;
    }

    if (sentAt !== undefined) {
      updateData.sentAt = sentAt ? new Date(sentAt) : null;
    }

    const reminder = await db.reminder.update({
      where: { id: params.id },
      data: updateData,
      include: {
        task: {
          select: { id: true, title: true, completed: true },
        },
        event: {
          select: { id: true, title: true, startTime: true, completed: true },
        },
      },
    });

    return json(reminder);
  } catch (error) {
    console.error("Error updating reminder:", error);
    return json({ error: "Failed to update reminder" }, { status: 500 });
  }
};

// DELETE /api/reminders/[id] - Delete a reminder
export const DELETE: RequestHandler = async ({ params, locals }) => {
  try {
    const userId = locals.user?.id;
    if (!userId) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    const reminder = await db.reminder.deleteMany({
      where: {
        id: params.id,
        userId,
      },
    });

    if (reminder.count === 0) {
      return json({ error: "Reminder not found" }, { status: 404 });
    }

    return json({ message: "Reminder deleted successfully" });
  } catch (error) {
    console.error("Error deleting reminder:", error);
    return json({ error: "Failed to delete reminder" }, { status: 500 });
  }
};
