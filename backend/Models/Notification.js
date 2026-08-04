import mongoose from "mongoose";


const notificationSchema = new mongoose.Schema(
  {
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },


    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },


    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      default: null
    },


    commentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null
    },


    type: {
      type: String,
      enum: [
        "share",
        "comment",
        "reply",
        "mention",
        "delete",
        "role",
        "resolve"
      ],
      required: true
    },


    message: {
      type: String,
      required: true,
      maxlength: 300
    },


    isRead: {
      type: Boolean,
      default: false
    }

  },
  {
    timestamps: true
  }
);


// Faster unread notification query
notificationSchema.index({
  receiverId: 1,
  isRead: 1
});


export default mongoose.model(
  "Notification",
  notificationSchema
);