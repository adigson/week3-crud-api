const express = require('express');
const router = express.Router();
const Joi = require('joi');

// ==========================================
// STEP 3: JOI SCHEMA & VALIDATION MIDDLEWARE
// ==========================================
const todoSchema = Joi.object({
  task: Joi.string().min(3).required()
});

const validateTodo = (req, res, next) => {
  const { error } = todoSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: 'fail',
      message: error.details[0].message
    });
  }
  next();
};

// ==========================================
// ROUTES WITH TRY/CATCH & VALIDATION
// ==========================================

// GET /todos
router.get('/', async (req, res, next) => {
  try {
    // your logic to get todos...
    res.status(200).json({ status: 'success', data: [] });
  } catch (err) {
    next(err); // passes error to global error handler in app.js
  }
});

// POST /todos (Protected by Joi validation)
router.post('/', validateTodo, async (req, res, next) => {
  try {
    const { task } = req.body;
    
    // Test trigger for global error handler 
    if (task === "trigger-500-error") {
      throw new Error("Simulated Server Database Failure!");
    }

    res.status(201).json({ status: 'success', data: { id: Date.now(), task } });
  } catch (err) {
    next(err);
  }
});

// PATCH /todos/:id (Protected by Joi validation)
router.patch('/:id', validateTodo, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { task } = req.body;
    res.status(200).json({ status: 'success', data: { id, task } });
  } catch (err) {
    next(err);
  }
});

module.exports = router;