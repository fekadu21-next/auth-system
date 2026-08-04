import mongoose from "mongoose";

const documentShareSchema = new mongoose.Schema(
  {
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
      index: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    permission: {
      type: String,
      enum: ["viewer", "commenter", "editor"],
      required: true,
      default: "viewer",
    },

    sharedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate sharing
documentShareSchema.index(
  { documentId: 1, userId: 1 },
  { unique: true }
);

export default mongoose.model("DocumentShare", documentShareSchema);