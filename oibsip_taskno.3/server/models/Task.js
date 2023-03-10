import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
    index:{
        type:Number
    },
    text: {
      type: String,
      required: true
    },
    // priority: {
    //   type: Number,
    //   required: true,
    //   min:1,
    //   max:9
    // },
    status: {
      type: String
    },
    timestamp:{
        type:String,
        default:Date.now()
    }
  });

  const Task = mongoose.model('Task', taskSchema);

export default Task;