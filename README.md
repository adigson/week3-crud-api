# Week 3 CRUD API

A simple Express.js API for managing todo items in memory.

## Features
- Get all todos
- Get a single todo by ID
- Create a new todo with validation
- Update a todo
- Delete a todo
- Filter active todos with `completed=false`

## Installation

```bash
npm install
```

## Run the server

```bash
npm run dev
```

## Base URL

```text
http://localhost:4000
```

## Routes

### GET /todos
Returns all todo items.

### GET /todos/:id
Returns a single todo item by ID.

### POST /todos
Creates a new todo item.

Request body example:

```json
{
  "task": "Practice Express route modeling",
  "completed": false
}
```

### GET /todos/active
Returns only todos where `completed` is `false`.

### PATCH /todos/:id
Updates an existing todo item.

### DELETE /todos/:id
Deletes a todo item.

## Notes
- The API uses an in-memory array for storage.
- Data resets when the server restarts.
