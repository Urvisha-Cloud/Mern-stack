const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: String,
  description: String,
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed'],
    default: 'Pending'
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required:true }
}, {
  timestamps: true
});

const taskModel = mongoose.model("task", taskSchema);

module.exports = taskModel;
