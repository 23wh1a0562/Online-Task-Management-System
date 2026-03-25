const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

/* REGISTER USER */

exports.registerUser = async (req, res) => {
    try {

        const { name, email, password, role } = req.body;

        const userExists = await User.findOne({ email });

        if(userExists){
            return res.status(400).json({
                success:false,
                message:"User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password,10);

        const user = await User.create({
            name,
            email,
            password:hashedPassword,
            role
        });

        res.status(201).json({
            success:true,
            message:"User registered successfully",
            user
        });

    } catch(error){
        res.status(500).json({
            success:false,
            message:error.message
        });
    }
};


/* LOGIN USER */

exports.loginUser = async (req,res)=>{

    try{

        const { email,password } = req.body;

        const user = await User.findOne({ email });

        if(!user){
            return res.status(400).json({
                success:false,
                message:"Invalid email"
            });
        }

        const isMatch = await bcrypt.compare(password,user.password);

        if(!isMatch){
            return res.status(400).json({
                success:false,
                message:"Invalid password"
            });
        }

        const token = jwt.sign(
            { id:user._id, role:user.role },
            process.env.JWT_SECRET,
            { expiresIn:"1d" }
        );

        res.json({
            success:true,
            token,
            user
        });

    }catch(error){

        res.status(500).json({
            success:false,
            message:error.message
        });

    }

};