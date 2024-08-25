const userFilesService = require("../services/user-files.service");

const uploadUserFile = async (req, res) => {
  const { user, files } = req;
  try {
    const userFiles = await userFilesService.uploadUserFile({
      content: files,
      userId: user._id,
    });

    res.json({
      success: true,
      userFiles,
    });
  } catch (error) {
    console.log({ error });
    res.status(500).json({
      success: false,
      errors: {
        error: error.message || "Failed to upload file",
      },
    });
  }
};

const getUserFiles = async (req, res) => {
  const { _id } = req.user;

  console.log({ user: req.user });

  try {
    const userFiles = await userFilesService.getUserFiles({
      userId: _id,
    });

    res.json({
      success: true,
      userFiles,
    });
  } catch (error) {
    console.log({ error });
    res.status(500).json({
      success: false,
      errors: {
        error: error.message || "Failed to get files",
      },
    });
  }
};

const deleteUserFile = async (req, res) => {
  const { _id } = req.user;
  const { fileId } = req.params;

  try {
    const isDeleted = await userFilesService.deleteUserFile({
      userId: _id,
      fileId: fileId,
    });

    res.json({
      success: true,
      isDeleted,
    });
  } catch (error) {
    console.log({ error });
    res.status(500).json({
      success: false,
      errors: {
        error: error.message || "Failed to delete file",
      },
    });
  }
};

module.exports = {
  uploadUserFile,
  getUserFiles,
  deleteUserFile,
};
