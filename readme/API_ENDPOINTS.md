# Family Planner API Endpoints

This document describes all the CRUD API endpoints created for the Family Planner application based on the Prisma schema.

## Authentication

All endpoints require authentication. The user ID is extracted from `locals.user?.id` in each request handler.

## Base URL

All endpoints are prefixed with `/api/`

---

## Family Management

### Families

- **GET** `/api/families` - Get all families for the authenticated user
- **POST** `/api/families` - Create a new family
- **GET** `/api/families/[id]` - Get a specific family
- **PUT** `/api/families/[id]` - Update a family
- **DELETE** `/api/families/[id]` - Delete a family

### Family Members

- **GET** `/api/families/[familyId]/members` - Get all members of a family
- **POST** `/api/families/[familyId]/members` - Add a new member to a family
- **GET** `/api/families/[familyId]/members/[id]` - Get a specific family member
- **PUT** `/api/families/[familyId]/members/[id]` - Update a family member
- **DELETE** `/api/families/[familyId]/members/[id]` - Delete a family member

---

## Event Management

### Events

- **GET** `/api/events` - Get all events for the authenticated user
  - Query parameters:
    - `familyId` - Filter by family
    - `startDate` - Filter events starting from this date
    - `endDate` - Filter events ending before this date
    - `completed` - Filter by completion status (true/false)
- **POST** `/api/events` - Create a new event
- **GET** `/api/events/[id]` - Get a specific event
- **PUT** `/api/events/[id]` - Update an event
- **DELETE** `/api/events/[id]` - Delete an event

---

## Task Management

### Tasks

- **GET** `/api/tasks` - Get all tasks for the authenticated user
  - Query parameters:
    - `familyId` - Filter by family
    - `completed` - Filter by completion status (true/false)
    - `deadline` - Filter tasks with deadline before this date
- **POST** `/api/tasks` - Create a new task
- **GET** `/api/tasks/[id]` - Get a specific task
- **PUT** `/api/tasks/[id]` - Update a task
- **DELETE** `/api/tasks/[id]` - Delete a task

### Task Checklist Items

- **GET** `/api/tasks/[taskId]/checklist` - Get all checklist items for a task
- **POST** `/api/tasks/[taskId]/checklist` - Create a new checklist item
- **GET** `/api/tasks/[taskId]/checklist/[id]` - Get a specific checklist item
- **PUT** `/api/tasks/[taskId]/checklist/[id]` - Update a checklist item
- **DELETE** `/api/tasks/[taskId]/checklist/[id]` - Delete a checklist item

### Task Comments

- **GET** `/api/tasks/[taskId]/comments` - Get all comments for a task
  - Query parameters:
    - `page` - Page number (default: 1)
    - `limit` - Items per page (default: 20)
- **POST** `/api/tasks/[taskId]/comments` - Create a new comment
- **GET** `/api/tasks/[taskId]/comments/[id]` - Get a specific comment
- **PUT** `/api/tasks/[taskId]/comments/[id]` - Update a comment (author only)
- **DELETE** `/api/tasks/[taskId]/comments/[id]` - Delete a comment (author only)

---

## Calendar Management

### Calendars

- **GET** `/api/calendars` - Get all calendars for a family
  - Query parameters:
    - `familyId` - Required. Family ID to get calendars for
- **POST** `/api/calendars` - Create a new calendar
- **GET** `/api/calendars/[id]` - Get a specific calendar
- **PUT** `/api/calendars/[id]` - Update a calendar
- **DELETE** `/api/calendars/[id]` - Delete a calendar (only if no events exist)

---

## Location Management

### Locations

- **GET** `/api/locations` - Get all locations for a family
  - Query parameters:
    - `familyId` - Required. Family ID to get locations for
- **POST** `/api/locations` - Create a new location
- **GET** `/api/locations/[id]` - Get a specific location
- **PUT** `/api/locations/[id]` - Update a location
- **DELETE** `/api/locations/[id]` - Delete a location (only if no events exist)

---

## Reminder Management

### Reminders

- **GET** `/api/reminders` - Get all reminders for the authenticated user
  - Query parameters:
    - `taskId` - Filter by task
    - `eventId` - Filter by event
    - `upcoming` - Filter upcoming reminders (true/false)
    - `sent` - Filter by sent status (true/false)
- **POST** `/api/reminders` - Create a new reminder
- **GET** `/api/reminders/[id]` - Get a specific reminder
- **PUT** `/api/reminders/[id]` - Update a reminder
- **DELETE** `/api/reminders/[id]` - Delete a reminder

---

## Data Models

### Family
```typescript
{
  id: string
  name: string
  createdAt: DateTime
  updatedAt: DateTime
  userId: string
  members: FamilyMember[]
  tasks: Task[]
  events: Event[]
  calendars: Calendar[]
  locations: Location[]
  notifications: Notification[]
}
```

### Event
```typescript
{
  id: string
  title: string
  address?: string
  description?: string
  startTime: DateTime
  endTime: DateTime
  completed: boolean
  createdAt: DateTime
  updatedAt: DateTime
  userId: string
  familyId: string
  calendarId: string
  locationId?: string
  reminders: Reminder[]
  notifications: Notification[]
}
```

### Task
```typescript
{
  id: string
  title: string
  description?: string
  deadline?: DateTime
  completed: boolean
  createdAt: DateTime
  updatedAt: DateTime
  userId: string
  familyId: string
  checklist: ChecklistItem[]
  comments: TaskComment[]
  reminders: Reminder[]
  notifications: Notification[]
}
```

### Reminder
```typescript
{
  id: string
  remindAt: DateTime
  channel: 'PUSH' | 'EMAIL' | 'SMS'
  createdAt: DateTime
  sentAt?: DateTime
  userId: string
  taskId?: string
  eventId?: string
}
```

---

## Error Responses

All endpoints return appropriate HTTP status codes and error messages:

- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `404` - Not Found (resource doesn't exist)
- `409` - Conflict (e.g., trying to delete calendar with events)
- `500` - Internal Server Error

Error response format:
```json
{
  "error": "Error message description"
}
```

---

## Security Features

1. **Authentication**: All endpoints require a valid user session
2. **Authorization**: Users can only access their own data
3. **Validation**: Input validation on all create/update operations
4. **Cascade Protection**: Prevents deletion of resources with dependencies
5. **Data Integrity**: Foreign key relationships are validated before operations

---

## Usage Examples

### Create a Family
```bash
POST /api/families
Content-Type: application/json

{
  "name": "The Smith Family"
}
```

### Create an Event
```bash
POST /api/events
Content-Type: application/json

{
  "title": "Family Dinner",
  "startTime": "2024-01-15T18:00:00Z",
  "endTime": "2024-01-15T20:00:00Z",
  "familyId": "family_123",
  "calendarId": "calendar_456"
}
```

### Create a Task with Checklist
```bash
POST /api/tasks
Content-Type: application/json

{
  "title": "Plan Birthday Party",
  "description": "Organize everything for Sarah's birthday",
  "deadline": "2024-01-20T23:59:59Z",
  "familyId": "family_123"
}
```

### Add Checklist Item
```bash
POST /api/tasks/task_123/checklist
Content-Type: application/json

{
  "title": "Buy decorations",
  "position": 0
}
```
