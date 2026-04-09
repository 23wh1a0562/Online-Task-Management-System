const express = require("express");
const Task = require("../models/Task");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// All routes require authentication
router.use(protect);

// Create Task (temporary fix - handles assignment data)
router.post("/", async (req, res) => {
  try {
    const { title, description, assignedTo } = req.body;
    
    const task = await Task.create({
      title,
      description,
      assignedTo,
      assignedBy: req.user.id
    });

    // Populate the user data for response
    const populatedTask = await Task.findById(task._id)
      .populate("assignedTo", "name email")
      .populate("assignedBy", "name email");

    res.status(201).json({
      success: true,
      message: "Task created",
      task: populatedTask
    });

  } catch (err) {
    console.error("Task creation error:", err);
    res.status(400).json({ message: err.message });
  }
});

// Get Tasks (temporary fix - handles population)
router.get("/", async (req, res) => {
  try {
    let tasks;

    // manager can see all tasks
    if (req.user.role === "manager") {
      tasks = await Task.find()
        .populate("assignedTo", "name email")
        .populate("assignedBy", "name email");
    }
    // employee can see only their tasks
    else {
      tasks = await Task.find({
        assignedTo: req.user.id
      })
        .populate("assignedBy", "name");
    }

    res.json({
      success: true,
      tasks
    });

  } catch (error) {
    console.error("Get tasks error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update Task Status
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("assignedTo", "name email")
     .populate("assignedBy", "name email");

    res.json({
      success: true,
      message: "Task updated",
      task
    });

  } catch (error) {
    console.error("Update task error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Delete Task
router.delete("/:id", async (req, res) => {
  try {
    // check role
    if (req.user.role !== "manager") {
      return res.status(403).json({
        success: false,
        message: "Only managers can delete tasks"
      });
    }

    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    res.json({
      success: true,
      message: "Task deleted successfully"
    });

  } catch (error) {
    console.error("Delete task error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;