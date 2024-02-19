const userContentService = require("../services/user-content.service");

const updateUserContent = async (req, res) => {
  const { content } = req.body;
  const { _id } = req.user;

  // TODO: Update user content
  try {
    const updatedContent = await userContentService.updateUserContent({
      content,
      userId: _id,
    });

    res.json({
      success: true,
      message: "content updated",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      errors: {
        error: "Failed to update content",
      },
    });
  }
};

const getUserContent = async (req, res) => {
  const { _id } = req.user;

  console.log({ user: req.user });

  // TODO: Get user content
  try {
    const userContent = await userContentService.getUserContent({
      userId: _id,
    });
    res.json({
      success: true,
      userContent,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      errors: {
        error: "Failed to get content",
      },
    });
  }
};

module.exports = {
  updateUserContent,
  getUserContent,
};
