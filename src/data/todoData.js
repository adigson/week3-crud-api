let todos = [
  { id: 1, task: 'Buy groceries', completed: false },
  { id: 2, task: 'Review Pull Requests', completed: true }
];

const getTodos = () => todos;

const getTodoById = (id) => todos.find((todo) => todo.id === id);

const addTodo = (todo) => {
  const newTodo = {
    id: todos.length ? Math.max(...todos.map((t) => t.id)) + 1 : 1,
    ...todo,
    completed: Boolean(todo.completed)
  };

  todos.push(newTodo);
  return newTodo;
};

const updateTodo = (id, updates) => {
  const todo = todos.find((item) => item.id === id);
  if (!todo) return null;

  Object.assign(todo, updates);
  return todo;
};

const deleteTodo = (id) => {
  const initialLength = todos.length;
  todos = todos.filter((todo) => todo.id !== id);
  return todos.length !== initialLength;
};

module.exports = { getTodos, getTodoById, addTodo, updateTodo, deleteTodo };
