const User = require("../models/User");

exports.getUsers = async (req, res) => {

    try{

        const users = await User.find({ role: "employee" }).select("-password");

        res.json({
            success: true,
            users
        });

    }catch(error){

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};