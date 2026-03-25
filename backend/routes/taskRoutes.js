const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const { getTasksByEmployee } = require("../controllers/taskController");

const {

createTask,
getTasks,
updateTaskStatus,
deleteTask

} = require("../controllers/taskController");


router.post("/",authMiddleware,createTask);

router.get("/",authMiddleware,getTasks);

router.put("/:id",authMiddleware,updateTaskStatus);

router.delete("/:id",authMiddleware,deleteTask);

router.get("/employee/:employeeId",authMiddleware,getTasksByEmployee);

module.exports = router;