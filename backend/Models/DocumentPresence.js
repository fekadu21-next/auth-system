import mongoose from "mongoose";

const documentPresenceSchema = new mongoose.Schema(
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

    socketId: {
      type: String,
      required: true,
    },

    isTyping: {
      type: Boolean,
      default: false,
    },

    cursor: {
      line: {
        type: Number,
        default: 0,
      },

      column: {
        type: Number,
        default: 0,
      },
    },

    selection: {
      start: {
        type: Number,
        default: 0,
      },

      end: {
        type: Number,
        default: 0,
      },
    },

    joinedAt: {
      type: Date,
      default: Date.now,
    },

    lastActive: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// One user can have only one active presence per document
documentPresenceSchema.index(
  {
    documentId: 1,
    userId: 1,
  },
  {
    unique: true,
  }
);

export default mongoose.model(
  "DocumentPresence",
  documentPresenceSchema
);