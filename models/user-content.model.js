const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userContentSchema = new Schema(
  {
    content: {
      type: String,
      default: "",
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    userId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const UserContent = mongoose.model("user-content", userContentSchema);
module.exports = UserContent;
