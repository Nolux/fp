import { json } from "@sveltejs/kit";
import { db } from "$lib/db";
import type { RequestHandler } from "@sveltejs/kit";

// GET /api/tasks/[taskId]/comments/[id] - Get a specific comment
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

    const comment = await db.taskComment.findFirst({
      where: {
        id: params.id,
        taskId: params.taskId,
      },
      include: {
        author: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    if (!comment) {
      return json({ error: "Comment not found" }, { status: 404 });
    }

    return json(comment);
  } catch (error) {
    console.error("Error fetching task comment:", error);
    return json({ error: "Failed to fetch task comment" }, { status: 500 });
  }
};

// PUT /api/tasks/[taskId]/comments/[id] - Update a comment
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

    const { content } = await request.json();

    if (
      !content ||
      typeof content !== "string" ||
      content.trim().length === 0
    ) {
      return json({ error: "Comment content is required" }, { status: 400 });
    }

    // Verify user is the author of the comment
    const existingComment = await db.taskComment.findFirst({
      where: {
        id: params.id,
        taskId: params.taskId,
        authorId: userId,
      },
    });

    if (!existingComment) {
      return json(
        { error: "Comment not found or you are not the author" },
        { status: 404 }
      );
    }

    const comment = await db.taskComment.update({
      where: { id: params.id },
      data: {
        content: content.trim(),
      },
      include: {
        author: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    return json(comment);
  } catch (error) {
    console.error("Error updating task comment:", error);
    return json({ error: "Failed to update task comment" }, { status: 500 });
  }
};

// DELETE /api/tasks/[taskId]/comments/[id] - Delete a comment
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

    // Verify user is the author of the comment
    const comment = await db.taskComment.deleteMany({
      where: {
        id: params.id,
        taskId: params.taskId,
        authorId: userId,
      },
    });

    if (comment.count === 0) {
      return json(
        { error: "Comment not found or you are not the author" },
        { status: 404 }
      );
    }

    return json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting task comment:", error);
    return json({ error: "Failed to delete task comment" }, { status: 500 });
  }
};
