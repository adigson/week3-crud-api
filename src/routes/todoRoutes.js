const express = require('express');
const router = express.Router();
const Joi = require('joi');
const {
  listTodos,
  getActiveTodos,
  getTodo,
  createTodo,
  patchTodo,
  removeTodo
} = require('../controllers/todoController');

const createTodoSchema = Joi.object({
  task: Joi.string().trim().min(3).required(),
  completed: Joi.boolean()
});

const patchTodoSchema = Joi.object({
  task: Joi.string().trim().min(3),
  completed: Joi.boolean()
}).min(1);

const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: 'fail',
      message: error.details[0].message
    });
  }
  req.body = value;
  return next();
};

router.get('/', listTodos);
router.get('/active', getActiveTodos);
router.post('/', validate(createTodoSchema), createTodo);
router.get('/:id', getTodo);
router.patch('/:id', validate(patchTodoSchema), patchTodo);
router.delete('/:id', removeTodo);

module.exports = router;