const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
    title:String,
    description:String,

    assignedTo:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },

    assignedBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },

    status:{
        type:String,
        enum:["To Do","In Progress","Completed"],
        default:"To Do"
    }
},{
    timestamps:true
});

module.exports = mongoose.model("Task", taskSchema);