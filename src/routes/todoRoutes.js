const express = require('express');
const {
  listTodos,
  getActiveTodos,
  getTodo,
  createTodo,
  patchTodo,
  removeTodo
} = require('../controllers/todoController');

const router = express.Router();

router.get('/', listTodos);
router.get('/active', getActiveTodos);
router.get('/:id', getTodo);
router.post('/', createTodo);
router.patch('/:id', patchTodo);
router.delete('/:id', removeTodo);

module.exports = router;
