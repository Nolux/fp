import { json } from "@sveltejs/kit";
import { db } from "$lib/db";
import type { RequestHandler } from "@sveltejs/kit";

// GET /api/tasks/[taskId]/checklist - Get all checklist items for a task
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

    const checklistItems = await db.checklistItem.findMany({
      where: { taskId: params.taskId },
      orderBy: { position: "asc" },
    });

    return json(checklistItems);
  } catch (error) {
    console.error("Error fetching checklist items:", error);
    return json({ error: "Failed to fetch checklist items" }, { status: 500 });
  }
};

// POST /api/tasks/[taskId]/checklist - Create a new checklist item
export const POST: RequestHandler = async ({ params, request, locals }) => {
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

    const { title, position } = await request.json();

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return json(
        { error: "Checklist item title is required" },
        { status: 400 }
      );
    }

    // If no position provided, add to end
    let itemPosition = position;
    if (itemPosition === undefined || itemPosition === null) {
      const lastItem = await db.checklistItem.findFirst({
        where: { taskId: params.taskId },
        orderBy: { position: "desc" },
      });
      itemPosition = lastItem ? lastItem.position + 1 : 0;
    }

    const checklistItem = await db.checklistItem.create({
      data: {
        title: title.trim(),
        position: itemPosition,
        taskId: params.taskId,
      },
    });

    return json(checklistItem, { status: 201 });
  } catch (error) {
    console.error("Error creating checklist item:", error);
    return json({ error: "Failed to create checklist item" }, { status: 500 });
  }
};
