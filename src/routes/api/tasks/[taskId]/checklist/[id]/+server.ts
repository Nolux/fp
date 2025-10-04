import { json } from "@sveltejs/kit";
import { db } from "$lib/db";
import type { RequestHandler } from "@sveltejs/kit";

// GET /api/tasks/[taskId]/checklist/[id] - Get a specific checklist item
export const GET: RequestHandler = async ({ params, locals }) => {
  try {
    const userId = locals.user?.id;
    if (!userId) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user owns the task
    const task = await db.task.findFirst({
      where: { id: params.taskId, userId },
    });

    if (!task) {
      return json({ error: "Task not found" }, { status: 404 });
    }

    const checklistItem = await db.checklistItem.findFirst({
      where: {
        id: params.id,
        taskId: params.taskId,
      },
    });

    if (!checklistItem) {
      return json({ error: "Checklist item not found" }, { status: 404 });
    }

    return json(checklistItem);
  } catch (error) {
    console.error("Error fetching checklist item:", error);
    return json({ error: "Failed to fetch checklist item" }, { status: 500 });
  }
};

// PUT /api/tasks/[taskId]/checklist/[id] - Update a checklist item
export const PUT: RequestHandler = async ({ params, request, locals }) => {
  try {
    const userId = locals.user?.id;
    if (!userId) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user owns the task
    const task = await db.task.findFirst({
      where: { id: params.taskId, userId },
    });

    if (!task) {
      return json({ error: "Task not found" }, { status: 404 });
    }

    const { title, completed, position } = await request.json();

    const updateData: any = {};

    if (title !== undefined) {
      if (typeof title !== "string" || title.trim().length === 0) {
        return json(
          { error: "Checklist item title is required" },
          { status: 400 }
        );
      }
      updateData.title = title.trim();
    }

    if (completed !== undefined) {
      updateData.completed = Boolean(completed);
    }

    if (position !== undefined) {
      updateData.position = Number(position);
    }

    const checklistItem = await db.checklistItem.updateMany({
      where: {
        id: params.id,
        taskId: params.taskId,
      },
      data: updateData,
    });

    if (checklistItem.count === 0) {
      return json({ error: "Checklist item not found" }, { status: 404 });
    }

    const updatedItem = await db.checklistItem.findFirst({
      where: { id: params.id },
    });

    return json(updatedItem);
  } catch (error) {
    console.error("Error updating checklist item:", error);
    return json({ error: "Failed to update checklist item" }, { status: 500 });
  }
};

// DELETE /api/tasks/[taskId]/checklist/[id] - Delete a checklist item
export const DELETE: RequestHandler = async ({ params, locals }) => {
  try {
    const userId = locals.user?.id;
    if (!userId) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user owns the task
    const task = await db.task.findFirst({
      where: { id: params.taskId, userId },
    });

    if (!task) {
      return json({ error: "Task not found" }, { status: 404 });
    }

    const checklistItem = await db.checklistItem.deleteMany({
      where: {
        id: params.id,
        taskId: params.taskId,
      },
    });

    if (checklistItem.count === 0) {
      return json({ error: "Checklist item not found" }, { status: 404 });
    }

    return json({ message: "Checklist item deleted successfully" });
  } catch (error) {
    console.error("Error deleting checklist item:", error);
    return json({ error: "Failed to delete checklist item" }, { status: 500 });
  }
};
