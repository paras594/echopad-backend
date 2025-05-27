const express = require("express");
const router = express.Router();
const userFilesController = require("../controllers/user-files.controller");
const { authenticateToken } = require("../middlewares/auth.middleware");
const { fileUpload } = require("../middlewares/file-upload.middleware");
const {
  fileSizeLimitErrorMiddleware,
} = require("../middlewares/file-size-limit-error.middleware");

router.get("/", authenticateToken, userFilesController.getUserFiles);
router.post(
  "/upload",
  authenticateToken,
  fileUpload.array("files"),
  fileSizeLimitErrorMiddleware,
  userFilesController.uploadUserFile
);
router.delete(
  "/:fileId",
  authenticateToken,
  userFilesController.deleteUserFile
);

module.exports = router;
