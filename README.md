# Week 3 CRUD API

An Express API for managing todo items stored in MongoDB with Mongoose.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a local `.env` file (it is ignored by Git) and set your Atlas URI:

   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-host>/week3_todos?retryWrites=true&w=majority
   PORT=3000
   ```

   Replace the placeholders with your Atlas database user's credentials and cluster host. URL-encode special characters in the password. Never commit or share the completed URI.

3. Start the API:

   ```bash
   npm run dev
   ```

   The server starts even if MongoDB is paused or unreachable and retries the connection every 15 seconds. Check `GET /health` for database readiness; todo routes return `503 Service Unavailable` until the database connects. No in-memory fallback is used.

Base URL: `http://localhost:3000`

## Todo format

Todo responses use this shape:

```json
{
  "id": "MongoDB-generated id",
  "task": "Practice Express route modeling",
  "completed": false
}
```

## CRUD routes

| Method | Path | Behavior |
| --- | --- | --- |
| `GET` | `/todos` | List all todos. Optional `?completed=true` or `?completed=false` filters results. |
| `GET` | `/todos/active` | List todos where `completed` is `false`. |
| `GET` | `/todos/:id` | Get one todo by its MongoDB id. |
| `POST` | `/todos` | Create a todo. Requires a `task` of at least 3 characters; `completed` is optional and defaults to `false`. |
| `PATCH` | `/todos/:id` | Update `task`, `completed`, or both. At least one field is required. |
| `DELETE` | `/todos/:id` | Delete a todo; returns `204 No Content` on success. |

Successful list and item responses are JSON arrays and objects, respectively. Invalid request bodies return `400` with a `{ "status": "fail", "message": "..." }` response. Missing todos return `404`; unexpected server errors return `500` with a generic message and are logged by the server.
