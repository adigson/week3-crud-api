const Todo = require('../models/Todo');

const toApiTodo = (todo) => ({
  id: todo._id.toString(),
  task: todo.task,
  completed: todo.completed
});

const listTodos = async (req, res) => {
  const completedQuery = req.query.completed;
  const filter = {};

  const normalizedQuery = completedQuery?.toLowerCase();
  if (normalizedQuery === 'true' || normalizedQuery === 'false') {
    filter.completed = normalizedQuery === 'true';
  }

  const todos = await Todo.find(filter).sort({ _id: 1 }).lean();
  return res.status(200).json(todos.map(toApiTodo));
};

const getActiveTodos = async (req, res) => {
  const todos = await Todo.find({ completed: false }).sort({ _id: 1 }).lean();
  return res.status(200).json(todos.map(toApiTodo));
};

const getTodo = async (req, res) => {
  const todo = await Todo.findById(req.params.id).lean();

  if (!todo) {
    return res.status(404).json({ message: 'Todo not found.' });
  }

  return res.status(200).json(toApiTodo(todo));
};

const createTodo = async (req, res) => {
  const todo = await Todo.create({
    task: req.body.task.trim(),
    completed: req.body.completed ?? false
  });
  return res.status(201).json(toApiTodo(todo));
};

const patchTodo = async (req, res) => {
  const updates = {};
  if (req.body.task !== undefined) updates.task = req.body.task.trim();
  if (req.body.completed !== undefined) updates.completed = req.body.completed;

  const todo = await Todo.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true
  }).lean();

  if (!todo) {
    return res.status(404).json({ message: 'Todo not found.' });
  }

  return res.status(200).json(toApiTodo(todo));
};

const removeTodo = async (req, res) => {
  const todo = await Todo.findByIdAndDelete(req.params.id);

  if (!todo) {
    return res.status(404).json({ message: 'Todo not found.' });
  }

  return res.status(204).send();
};

module.exports = {
  listTodos,
  getActiveTodos,
  getTodo,
  createTodo,
  patchTodo,
  removeTodo
};
