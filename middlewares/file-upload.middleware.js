const multer = require("multer");
const memoryStorage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const fileSize = parseInt(req.headers["content-length"]); // get the filesize

  if (fileSize > process.env.MAX_FILE_SIZE)
    cb(new Error("File size too large. Max file size is 10mb"), false);
  else cb(null, true); // no errors, then add the file
};

const fileUpload = multer({
  storage: memoryStorage,
  limit: { fileSize: +process.env.MAX_FILE_SIZE },
  fileFilter: fileFilter,
});

module.exports = { fileUpload };
