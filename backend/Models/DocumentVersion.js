import mongoose from "mongoose";
const documentVersionSchema = new mongoose.Schema(
  {
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
      index: true,
    },

    versionNumber: {
      type: Number,
      required: true,
    },

    content: {
      type: Object,
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    changeSummary: {
      type: String,
      default: "",
      maxlength: 300,
    },

    // Custom label set by the user (e.g. "Final draft", "After peer review")
    name: {
      type: String,
      default: "",
      maxlength: 200,
    },

    // Session metadata for professional versioning
    meta: {
      sessionDuration: {
        type: Number, // Duration in seconds
        default: 0,
      },
      changeSize: {
        type: String,
        enum: ['small', 'medium', 'large'],
        default: 'small',
      },
      operations: {
        type: Number,
        default: 0,
      },
      type: {
        type: String,
        enum: ['content_edit', 'structural_change', 'auto_save'],
        default: 'auto_save',
      },
    },
  },
  {
    timestamps: true,
  }
);

// Fast version lookup
documentVersionSchema.index({
  documentId: 1,
  versionNumber: -1,
});

export default mongoose.model(
  "DocumentVersion",
  documentVersionSchema
);