const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema(
  {
    task: {
      type: String,
      required: true,
      minlength: 3,
      trim: true
    },
    completed: {
      type: Boolean,
      default: false
    }
  },
  {
    versionKey: false
  }
);

module.exports = mongoose.model('Todo', todoSchema);
