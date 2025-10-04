import { json } from "@sveltejs/kit";
import { db } from "$lib/db";
import type { RequestHandler } from "@sveltejs/kit";

// GET /api/tasks/[id] - Get a specific task
export const GET: RequestHandler = async ({ params, locals }) => {
  try {
    const userId = locals.user?.id;
    if (!userId) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    const task = await db.task.findFirst({
      where: {
        id: params.id,
        userId,
      },
      include: {
        family: {
          select: { id: true, name: true },
        },
        checklist: {
          orderBy: { position: "asc" },
        },
        comments: {
          orderBy: { createdAt: "desc" },
          include: {
            author: {
              select: { id: true, name: true, image: true },
            },
          },
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

    if (!task) {
      return json({ error: "Task not found" }, { status: 404 });
    }

    return json(task);
  } catch (error) {
    console.error("Error fetching task:", error);
    return json({ error: "Failed to fetch task" }, { status: 500 });
  }
};

// PUT /api/tasks/[id] - Update a task
export const PUT: RequestHandler = async ({ params, request, locals }) => {
  try {
    const userId = locals.user?.id;
    if (!userId) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, description, deadline, completed } = await request.json();

    // Get the existing task to verify ownership
    const existingTask = await db.task.findFirst({
      where: { id: params.id, userId },
    });

    if (!existingTask) {
      return json({ error: "Task not found" }, { status: 404 });
    }

    const updateData: any = {};

    if (title !== undefined) {
      if (typeof title !== "string" || title.trim().length === 0) {
        return json({ error: "Task title is required" }, { status: 400 });
      }
      updateData.title = title.trim();
    }

    if (description !== undefined) {
      updateData.description = description?.trim() || null;
    }

    if (deadline !== undefined) {
      updateData.deadline = deadline ? new Date(deadline) : null;
    }

    if (completed !== undefined) {
      updateData.completed = Boolean(completed);
    }

    const task = await db.task.update({
      where: { id: params.id },
      data: updateData,
      include: {
        family: {
          select: { id: true, name: true },
        },
        checklist: {
          orderBy: { position: "asc" },
        },
        comments: {
          orderBy: { createdAt: "desc" },
          include: {
            author: {
              select: { id: true, name: true, image: true },
            },
          },
        },
        _count: {
          select: {
            checklist: true,
            comments: true,
            reminders: true,
            notifications: true,
          },
        },
      },
    });

    return json(task);
  } catch (error) {
    console.error("Error updating task:", error);
    return json({ error: "Failed to update task" }, { status: 500 });
  }
};

// DELETE /api/tasks/[id] - Delete a task
export const DELETE: RequestHandler = async ({ params, locals }) => {
  try {
    const userId = locals.user?.id;
    if (!userId) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    const task = await db.task.deleteMany({
      where: {
        id: params.id,
        userId,
      },
    });

    if (task.count === 0) {
      return json({ error: "Task not found" }, { status: 404 });
    }

    return json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    return json({ error: "Failed to delete task" }, { status: 500 });
  }
};
