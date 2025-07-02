const express = require("express");
const Task = require("../model/model.todo");
const verifyToken = require("../middleware/auth");

const taskRoutes = express.Router();
taskRoutes.use(verifyToken);

taskRoutes.post("/add", async (req, res) => {
  try {
    const { title, description, status } = req.body;

    if (!title || !description || !status) {
      return res.status(400).json({ msg: "All fields are required!" });
    }

    const newTask = new Task({ title, description, status, user: req.user.id });
    await newTask.save();

    return res.status(200).json({ msg: "Task added successfully!", task: newTask });
  } catch (err) {
    return res.status(500).json({ msg: "Can't add task!", err: err.message });
  }
});

taskRoutes.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if(!id){
      return res.status(400).json({msg:"Id Can't Available."});
    }

    const deletedTask = await Task.findOneAndDelete({ _id: id, user: req.user.id });

    if (!deletedTask) {
      return res.status(404).json({ msg: "Task not found or unauthorized." });
    }

    return res.status(200).json({ msg: "Task deleted successfully.", task: deletedTask });
  } catch (err) {
    return res.status(500).json({ msg: "Can't delete task!", err: err.message });
  }
});

taskRoutes.put("/edit/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if(!id){
      return res.status(400).json({msg:"Id Can't Available."});
    }
    const { title, description, status } = req.body;

    const updatedTask = await Task.findOneAndUpdate(
      { _id: id, user: req.user.id },
      { title, description, status },
      { new: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ msg: "Task not found or unauthorized." });
    }

    return res.status(200).json({ msg: "Task updated successfully.", task: updatedTask });
  } catch (err) {
    return res.status(500).json({ msg: "Can't update task!", err: err.message });
  }
});

taskRoutes.get("/get/:id", async (req, res) => {
  try {
    const GetTasks = await Task.find({ user: req.params.id });

    return res.status(200).json({ msg: "Tasks retrieved successfully.", task:GetTasks });
  } catch (err) {
    return res.status(500).json({ msg: "Can't retrieve tasks!", err: err.message });
  }
});

module.exports = taskRoutes;
