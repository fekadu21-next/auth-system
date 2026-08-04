import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
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

    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },

    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },

    mentions: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },

    position: {
      start: {
        type: Number,
        required: true,
      },

      end: {
        type: Number,
        required: true,
      },
    },

    isResolved: {
      type: Boolean,
      default: false,
    },

    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    resolvedAt: {
      type: Date,
      default: null,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

commentSchema.index({
  documentId: 1,
  parentComment: 1,
});

export default mongoose.model("Comment", commentSchema);