const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userFilesSchema = new Schema(
  {
    fileUrl: {
      type: String,
      default: "",
    },
    fileName: {
      type: String,
      default: "",
    },
    format: {
      type: String,
    },
    publicId: {
      type: String,
      default: "",
    },
    resourceType: {
      type: String,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    isDeleted: {
      type: Boolean,
    },
    expireAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const UserFiles = mongoose.model("user-files", userFilesSchema);
module.exports = UserFiles;
