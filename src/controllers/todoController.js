const {
  getTodos,
  getTodoById,
  addTodo,
  updateTodo,
  deleteTodo
} = require('../data/todoData');

const listTodos = (req, res) => {
  const completedQuery = req.query.completed;

  if (completedQuery === undefined) {
    return res.status(200).json(getTodos());
  }

  const normalizedValue = String(completedQuery).toLowerCase();

  if (normalizedValue === 'true' || normalizedValue === 'false') {
    const filterValue = normalizedValue === 'true';
    const filteredTodos = getTodos().filter((todo) => todo.completed === filterValue);
    return res.status(200).json(filteredTodos);
  }

  return res.status(200).json(getTodos());
};

const getActiveTodos = (req, res) => {
  const activeTodos = getTodos().filter((todo) => todo.completed === false);
  res.status(200).json(activeTodos);
};

const getTodo = (req, res) => {
  const id = Number(req.params.id);
  const todo = getTodoById(id);

  if (!todo) {
    return res.status(404).json({ message: 'Todo not found.' });
  }

  return res.status(200).json(todo);
};

const createTodo = (req, res) => {
  const { task } = req.body;

  if (!task || typeof task !== 'string' || !task.trim()) {
    return res.status(400).json({ error: 'Task field is required.' });
  }

  const newTodo = addTodo({
    task: task.trim(),
    completed: req.body.completed || false
  });

  return res.status(201).json(newTodo);
};

const patchTodo = (req, res) => {
  const id = Number(req.params.id);
  const updatedTodo = updateTodo(id, req.body);

  if (!updatedTodo) {
    return res.status(404).json({ message: 'Todo not found.' });
  }

  return res.status(200).json(updatedTodo);
};

const removeTodo = (req, res) => {
  const id = Number(req.params.id);
  const deleted = deleteTodo(id);

  if (!deleted) {
    return res.status(404).json({ error: 'Todo not found.' });
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
