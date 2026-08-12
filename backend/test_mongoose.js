import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  password: {
    type: String,
    default: null,
    minlength: 8,
  }
});

const User = mongoose.model("TestUser", userSchema);

async function run() {
  try {
    const doc = new User();
    await doc.validate();
    console.log("Validation passed");
  } catch (err) {
    console.error("Validation failed:", err.message);
  }
}

run();
