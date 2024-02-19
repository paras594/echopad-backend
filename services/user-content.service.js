const Users = require("../models/users.model");
const bcrypt = require("bcryptjs");
const CustomError = require("../utils/CustomError");
const UserContent = require("../models/user-content.model");

class UserContentService {
  async updateUserContent({ content, userId }) {
    const updatedContent = await UserContent.findOneAndUpdate(
      { user: userId },
      { content, user: userId },
      { new: true, upsert: true }
    );

    return updatedContent;
  }

  async getUserContent({ userId }) {
    const userContent = await UserContent.findOne({ user: userId });

    return userContent;
  }
}

const userContentService = new UserContentService();

module.exports = userContentService;
