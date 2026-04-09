const Task = require("../models/Task");


/* CREATE TASK (Manager only) */

exports.createTask = async (req,res)=>{
    if(req.user.role !== "manager"){
   return res.status(403).json({message:"Only managers can create tasks"});
}

    try{

        const { title, description, assignedTo } = req.body;

        const task = await Task.create({

            title,
            description,
            assignedTo,
            assignedBy:req.user.id

        });

        res.status(201).json({
            success:true,
            message:"Task created",
            task
        });

    }catch(error){

        res.status(500).json({
            success:false,
            message:error.message
        });

    }

};



/* GET TASKS */

exports.getTasks = async (req, res) => {

    try{

        let tasks;

        // manager can see all tasks
        if(req.user.role === "manager"){

            tasks = await Task.find()
            .populate("assignedTo","name email")
            .populate("assignedBy","name email");

        }

        // employee can see only their tasks
        else{

            tasks = await Task.find({
                assignedTo: req.user.id
            })
            .populate("assignedBy","name");

        }

        res.json({
            success:true,
            tasks
        });

    }catch(error){

        res.status(500).json({
            success:false,
            message:error.message
        });

    }

};



/* UPDATE TASK STATUS */

exports.updateTaskStatus = async (req,res)=>{

    try{

        const { status } = req.body;

        const task = await Task.findByIdAndUpdate(

            req.params.id,

            { status },

            { new:true }

        );

        res.json({
            success:true,
            message:"Task updated",
            task
        });

    }catch(error){

        res.status(500).json({
            success:false,
            message:error.message
        });

    }

};



/* DELETE TASK */

exports.deleteTask = async (req, res) => {

    try{

        // check role
        if(req.user.role !== "manager"){
            return res.status(403).json({
                success:false,
                message:"Only managers can delete tasks"
            });
        }

        const task = await Task.findByIdAndDelete(req.params.id);

        if(!task){
            return res.status(404).json({
                success:false,
                message:"Task not found"
            });
        }

        res.json({
            success:true,
            message:"Task deleted successfully"
        });

    }catch(error){

        res.status(500).json({
            success:false,
            message:error.message
        });

    }

};
exports.getTasksByEmployee = async (req, res) => {

    try{

        const employeeId = req.params.employeeId;

        const tasks = await Task.find({
            assignedTo: employeeId
        }).populate("assignedTo","name email");

        res.json({
            success:true,
            tasks
        });

    }catch(error){

        res.status(500).json({
            success:false,
            message:error.message
        });

    }

};