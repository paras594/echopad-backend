const UserContent = require("../models/user-content.model");

class UserContentService {
  async updateUserContent({ content, userId }) {
    const updatedContent = await UserContent.findOneAndUpdate(
      { userId },
      { content, userId },
      { new: true, upsert: true }
    );

    return updatedContent;
  }

  async getUserContent({ userId }) {
    const userContent = await UserContent.findOne({ userId });

    return userContent;
  }
}

const userContentService = new UserContentService();

module.exports = userContentService;
