import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
      default: "Untitled Document",
    },

    content: {
      type: Object,
      default: {},
    },

    //     content: {
    //     type: mongoose.Schema.Types.Mixed,
    //     default: {}
    // }

    // Page numbering rules. Pages are visual only (frontend); this stores the
    // user's numbering preference: which physical page starts a numbered
    // section, the style (none / roman / decimal) and the first number value.
    pageNumberSettings: {
      type: Object,
      default: () => ({
        showPageNumbers: true,
        sections: [{ startPage: 1, type: "decimal", startFrom: 1 }],
      }),
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    lastEditedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    currentVersion: {
      type: Number,
      default: 1,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    deletedAt: {
      type: Date,
      default: null,
    },

    tags: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes
documentSchema.index({ updatedAt: -1 });
documentSchema.index({ title: "text" });

export default mongoose.model("Document", documentSchema);