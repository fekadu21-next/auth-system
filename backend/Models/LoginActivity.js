import mongoose from "mongoose";


const loginActivitySchema = new mongoose.Schema(
  {

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },


    ip: {
      type: String,
      maxlength: 100
    },


    userAgent: {
      type: String
    },


    device: {
      type: String,
      default: "unknown"
    },


    location: {
      type: String,
      default: "unknown"
    }


  },
  {
    timestamps: true
  }
);


export default mongoose.model(
  "LoginActivity",
  loginActivitySchema
);