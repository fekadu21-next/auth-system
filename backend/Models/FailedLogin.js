import mongoose from "mongoose";


const failedLoginSchema = new mongoose.Schema(
  {

    email: {
      type: String,
      maxlength: 150
    },


    ip: {
      type: String,
      maxlength: 100
    },


    userAgent: {
      type: String
    },


    reason: {
      type: String,
      default: "Invalid credentials"
    },


    attempts: {
      type: Number,
      default: 1
    }

  },
  {
    timestamps: true
  }
);



failedLoginSchema.index({
  email: 1
});


export default mongoose.model(
  "FailedLogin",
  failedLoginSchema
);