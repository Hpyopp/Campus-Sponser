const mongoose = require("mongoose");

const messageSchema = mongoose.Schema(
  {
    sender: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true,
      index: true // ⚡ Makes fetching chats faster
    },
    content: { 
      type: String, 
      required: true,
      trim: true // ✂️ Removes extra spaces from start/end
    },
    receiver: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true,
      index: true // ⚡ Makes finding receiver faster
    },
    read: { 
      type: Boolean, 
      default: false 
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);