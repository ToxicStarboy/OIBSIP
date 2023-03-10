import express from "express";
import * as dotenv from "dotenv";
import mongoose from "mongoose";
import Task from "../server/models/Task.js";
import User from "./models/User.js";
import bodyParser from "body-parser";
import bcrypt from "bcrypt";
import cors from 'cors';

const saltRounds = 10;

const app = express();

dotenv.config();


app.use(express.json());
app.use(cors())
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

var deletedCount=0;

app.get("/",(req,res)=>{
    res.render("home");
});

app.get("/login",(req,res)=>{
    res.render("login");
});

app.get("/register",(req,res)=>{
    res.render("register");
});

//Register
app.post("/register",(req,res)=>{
    try{bcrypt.hash(req.body.password,saltRounds,(err,hash)=>{
        const newUser = new User({
            email: req.body.username,
            password: hash
        });
        newUser.save();
        console.log("User registered Successfully!");
        res.redirect("/tasks");
    })}
    catch(err){
        console.log(err);
        res.send("Failed to register!")
    }
});

//Login
app.post("/login",(req,res)=>{
    try{const username = req.body.username;
        const password = req.body.password;

    User.findOne({email:username},(err,foundUser)=>{
        if(err){
            console.log(err);
        }
        else{
            if(foundUser){
                bcrypt.compare(password,foundUser.password,(err,result)=>{
                    if(result === true){
                        console.log("User Logged In Successfully!");
                        res.redirect("/tasks");
                    }
                })
            }
        }
    })}
    catch(err){
        console.log(err);
        res.send("Failed to Login!")
    }
});

// Listing All tasks according to priority
app.get("/tasks",async(req,res)=>{
    try{
        const task = await Task.find().sort({priority:1});
            res.render("list.ejs", {todoTasks: task});
            // console.log(task);
    }
    catch(err){
        res.send(err);
    }
});


//Creating new task
app.post("/tasks", (req,res)=>{
    try{
        const task = new Task({
            text:req.body.text,
        priority: req.body.priority,
        status:"pending",
    });
    task.save();
    res.redirect("/tasks");
    console.log("Task added Successfully");
    }
    catch(err){
        res.send(err);
    }
});

//Sorting tasks based on their status
app.get("/report", async (req, res) => {
    const tasks = await Task.aggregate([{
        $addFields: {
            sortPriority: {
                $switch: {
                    branches: [
                        // {
                        //     'case': {
                        //         $eq: [
                        //             '$status',
                        //             'pending'
                        //         ]
                        //     },
                        //     then: 3
                        // },
                        {
             'case': {
                 $eq: [
                     '$status',
                     'pending'
                    ]
                },
                then: 2
            },
            {
                'case': {
              $eq: [
               '$status',
               'completed'
            ]
            },
            then: 1
        }
        ],
        'default': 0
    }
}
}
}, {
    $sort: {
        sortPriority: -1
    }
}]);
  
res.render("report.ejs", {todoTasksSort: tasks});
});

//Display count of tasks based on Status
app.get("/count", function (req, res) {
    Task.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ], function (err, result) {
      if (err) throw err;
  
      let pendingCount = 0,
        // cancelledCount = 0,
        completedCount = 0;
  
      result.forEach((item)=> {
          switch (item._id) {
          case "pending":
            pendingCount = item.count;
            break;
          case "completed":
            completedCount = item.count;
            break;
        }
    });
  
      res.render("count.ejs", {
        pendingCount: pendingCount,
        completedCount: completedCount,
        deletedCount: deletedCount
      });
    });
  });

//Deleting a task
app.post("/tasks/delete", async (req,res)=>{
    try{
        const deleteItem = req.body.deleteButton;
        Task.findByIdAndRemove(deleteItem, (err)=>{
            if(!err){
                deletedCount++;
                console.log("Successfully Deleted.");
                console.log(deletedCount);
                res.redirect("/tasks");
            }
        });
    }
    catch(err){
        res.send(err);
    }
});


//Mark a task as Completed or Cancelled
app.post("/tasks/change", async (req, res) => {
    try{
        const changeStatus = "completed";
        const changeId = req.body.todoStatus;
        console.log(changeStatus);
            const tasks = await Task.findByIdAndUpdate(changeId,{status:changeStatus},{new:true});
                    tasks.save();
                    console.log("Task Marked as "+ changeStatus);
                    res.redirect("/tasks");
    }
    catch(err){
        res.send(err);
    }
  });


const PORT = process.env.PORT;

app.listen(PORT,()=>{
    console.log("Server is running successfully!");
    mongoose.set('strictQuery',true);
    mongoose.connect(process.env.MONGODB_URL,()=>{
        console.log("Connected to MongoDB")
    });
})