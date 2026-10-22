const assert = require('node:assert/strict');
const { after, before, test } = require('node:test');
const mongoose = require('mongoose');
const { app } = require('../app');
const Todo = require('../src/models/Todo');

let server;
let baseUrl;

before(async () => {
  app.locals.databaseConnected = true;
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  app.locals.databaseConnected = false;
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

const makeTodo = (task = 'Test a todo', completed = false) => ({
  _id: new mongoose.Types.ObjectId(),
  task,
  completed
});

test('health endpoint reports an unavailable database and todo routes return 503', async () => {
  app.locals.databaseConnected = false;

  const healthResponse = await fetch(`${baseUrl}/health`);
  assert.equal(healthResponse.status, 503);
  assert.deepEqual(await healthResponse.json(), {
    status: 'degraded',
    database: 'unavailable'
  });

  const todosResponse = await fetch(`${baseUrl}/todos`);
  assert.equal(todosResponse.status, 503);
  assert.match((await todosResponse.json()).message, /MongoDB is unavailable/);

  app.locals.databaseConnected = true;
});

test('GET /todos returns Mongo todos in the public API shape and supports completed filter', async () => {
  const todo = makeTodo();
  let receivedFilter;
  Todo.find = (filter) => {
    receivedFilter = filter;
    return {
      sort: () => ({ lean: async () => [todo] })
    };
  };

  const response = await fetch(`${baseUrl}/todos?completed=false`);
  assert.equal(response.status, 200);
  assert.deepEqual(receivedFilter, { completed: false });
  assert.deepEqual(await response.json(), [{
    id: todo._id.toString(),
    task: todo.task,
    completed: false
  }]);
});

test('GET /todos/active only queries incomplete todos', async () => {
  const todo = makeTodo();
  let receivedFilter;
  Todo.find = (filter) => {
    receivedFilter = filter;
    return {
      sort: () => ({ lean: async () => [todo] })
    };
  };

  const response = await fetch(`${baseUrl}/todos/active`);
  assert.equal(response.status, 200);
  assert.deepEqual(receivedFilter, { completed: false });
  assert.equal((await response.json())[0].id, todo._id.toString());
});

test('GET /todos/:id returns one todo or a 404 when it is missing', async () => {
  const todo = makeTodo();
  Todo.findById = (id) => {
    assert.equal(id, todo._id.toString());
    return { lean: async () => todo };
  };

  const response = await fetch(`${baseUrl}/todos/${todo._id}`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    id: todo._id.toString(),
    task: todo.task,
    completed: false
  });

  Todo.findById = () => ({ lean: async () => null });
  const missingResponse = await fetch(`${baseUrl}/todos/${new mongoose.Types.ObjectId()}`);
  assert.equal(missingResponse.status, 404);
  assert.deepEqual(await missingResponse.json(), { message: 'Todo not found.' });
});

test('GET /todos/:id returns 400 for an invalid Mongo id', async () => {
  Todo.findById = () => ({
    lean: async () => {
      const error = new Error('Invalid todo id.');
      error.name = 'CastError';
      throw error;
    }
  });

  const response = await fetch(`${baseUrl}/todos/not-a-mongo-id`);
  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    status: 'fail',
    message: 'Invalid todo id.'
  });
});

test('POST /todos validates input and returns the created todo', async () => {
  const todo = makeTodo('Write tests');
  Todo.create = async (values) => {
    assert.deepEqual(values, { task: 'Write tests', completed: false });
    return todo;
  };

  const response = await fetch(`${baseUrl}/todos`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ task: 'Write tests' })
  });
  assert.equal(response.status, 201);
  assert.deepEqual(await response.json(), {
    id: todo._id.toString(),
    task: todo.task,
    completed: false
  });

  const invalidResponse = await fetch(`${baseUrl}/todos`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ task: 'ok' })
  });
  assert.equal(invalidResponse.status, 400);
});

test('PATCH /todos/:id supports partial updates', async () => {
  const todo = makeTodo('Updated task', true);
  let receivedUpdates;
  Todo.findByIdAndUpdate = (id, updates, options) => {
    assert.equal(id, todo._id.toString());
    assert.equal(options.new, true);
    receivedUpdates = updates;
    return { lean: async () => todo };
  };

  const response = await fetch(`${baseUrl}/todos/${todo._id}`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ completed: true })
  });
  assert.equal(response.status, 200);
  assert.deepEqual(receivedUpdates, { completed: true });
  assert.deepEqual(await response.json(), {
    id: todo._id.toString(),
    task: todo.task,
    completed: true
  });
});

test('DELETE /todos/:id returns 204 after deleting the todo', async () => {
  Todo.findByIdAndDelete = async () => makeTodo();

  const response = await fetch(`${baseUrl}/todos/${new mongoose.Types.ObjectId()}`, {
    method: 'DELETE'
  });
  assert.equal(response.status, 204);
  assert.equal(await response.text(), '');
});
