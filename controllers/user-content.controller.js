const userContentService = require("../services/user-content.service");

const updateUserContent = async (req, res) => {
  const { content } = req.body;
  const { uid } = req.user;

  try {
    await userContentService.updateUserContent({
      content,
      userId: uid,
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
  const { uid } = req.user;

  try {
    const userContent = await userContentService.getUserContent({
      userId: uid,
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
