const express = require("express");
const router = express.Router();
const userFilesController = require("../controllers/user-files.controller");
const { authenticateJWT } = require("../middlewares/auth.middleware");
const { fileUpload } = require("../middlewares/file-upload.middleware");
const {
  fileSizeLimitErrorMiddleware,
} = require("../middlewares/file-size-limit-error.middleware");

router.get("/", authenticateJWT, userFilesController.getUserFiles);
router.post(
  "/upload",
  authenticateJWT,
  fileUpload.single("file"),
  fileSizeLimitErrorMiddleware,
  userFilesController.uploadUserFile
);
router.delete("/:fileId", authenticateJWT, userFilesController.deleteUserFile);

module.exports = router;
