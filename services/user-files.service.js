const { bufferToDataUri } = require("../utils/buffer-to-data-uri");
const { cloudinary } = require("./cloudinary-storage.service");
const UserFiles = require("../models/user-files.model");
const {
  getCloudinaryResourceType,
} = require("../utils/get-cloudinary-resource-type");

class UserFilesService {
  async uploadUserFile({ content, userId }) {
    const result = [];

    for (const file of content) {
      const dataUri = bufferToDataUri(file);

      const resourceType = getCloudinaryResourceType(file.mimetype);

      let publicId;

      const fileNameArr = file.originalname.split(".");
      const extension = fileNameArr.pop();
      const fileName = fileNameArr.join(".");

      if (resourceType === "image" || resourceType === "video") {
        publicId = `${fileName}-${Date.now()}`;
      } else {
        publicId = `${fileName}-${Date.now()}.${extension}`;
      }

      const response = await cloudinary.uploader.upload(dataUri, {
        folder: process.env.CLOUDINARY_FOLDER || "development",
        public_id: publicId,
        resource_type: resourceType,
      });

      const currentDate = new Date();
      const expiry = currentDate.setHours(currentDate.getHours() + 12);

      const newUserFile = new UserFiles({
        fileUrl: response.secure_url,
        fileName: file.originalname,
        format: response.format || extension,
        publicId: response.public_id,
        resourceType: response.resource_type,
        userId,
        expireAt: expiry,
      });

      await newUserFile.save();

      result.push(newUserFile);
    }

    return result;

    // console.log({ response });
    /*
    cloudinary.v2.api
  .delete_resources(['samples/people/bicycle', 'samples/people/jazz', 'samples/people/boy-snow-hoodie', 'samples/people/smiling-man', 'samples/people/kitchen-bar'], 
    { type: 'upload', resource_type: 'image' })
  .then(console.log);


      {
        "asset_id": "b5e6d2b39ba3e0869d67141ba7dba6cf",
        "public_id": "eneivicys42bq5f2jpn2",
        "api_key": "312924996162147",
        "version": 1570979139,
        "version_id": "98f52566f43d8e516a486958a45c1eb9",
        "signature": "abcdefghijklmnopqrstuvwxyz12345",
        "width": 1000,
        "height": 672,
        "format": "jpg",
        "resource_type": "image",
        "created_at": "2017-08-11T12:24:32Z",
        "tags": [],
        "pages": 1,
        "bytes": 350749,
        "type": "upload",
        "etag": "5297bd123ad4ddad723483c176e35f6e",
        "placeholder": false,
        "url": "http://res.cloudinary.com/demo/image/upload/v1570979139/eneivicys42bq5f2jpn2.jpg",
        "secure_url": "https://res.cloudinary.com/demo/image/upload/v1570979139/eneivicys42bq5f2jpn2.jpg",
        "access_mode": "public",
        "original_filename": "sample",
        "eager": [
          { "transformation": "c_pad,h_300,w_400",
            "width": 400,
            "height": 300,
            "url": "http://res.cloudinary.com/demo/image/upload/c_pad,h_300,w_400/v1570979139/eneivicys42bq5f2jpn2.jpg",
            "secure_url": "https://res.cloudinary.com/demo/image/upload/c_pad,h_300,w_400/v1570979139/eneivicys42bq5f2jpn2.jpg" },
          { "transformation": "c_crop,g_north,h_200,w_260",
            "width": 260,
            "height": 200,
            "url": "http://res.cloudinary.com/demo/image/upload/c_crop,g_north,h_200,w_260/v1570979139/eneivicys42bq5f2jpn2.jpg",
            "secure_url": "https://res.cloudinary.com/demo/image/upload/c_crop,g_north,h_200,w_260/v1570979139/eneivicys42bq5f2jpn2.jpg" }],
        "media_metadata": {
          "PerspectiveHorizontal": "0",
          "RedHue": "0",
          "Exposure": "0.0",
          ...
          ...
          ...
          "ExposureTime": "1/320"
        }
      }
    */
  }

  async getUserFiles({ userId }) {
    const userFiles = await UserFiles.find({
      userId,
      // expireAt: { $gt: Date.now() },
    }).sort({
      createdAt: -1,
    });

    return userFiles;
  }

  async deleteUserFile({ userId, fileId }) {
    const userFile = await UserFiles.findOne({
      _id: fileId,
      userId,
    });

    if (!userFile) {
      return true;
    }

    await UserFiles.deleteOne({
      _id: userFile._id,
    });

    await cloudinary.uploader.destroy(userFile.publicId, {
      resource_type: userFile.resourceType,
    });

    return true;
  }

  async deleteExpiredUserFiles() {
    const userFiles = await UserFiles.find({
      // expireAt: { $lt: Date.now() },
    })
      .limit(499)
      .lean();

    if (!userFiles.length) {
      return;
    }

    const publicIds = userFiles.map((userFile) => userFile.publicId);

    const promises = userFiles.map((userFile) =>
      cloudinary.uploader.destroy(userFile.publicId, {
        resource_type: userFile.resourceType,
      })
    );

    await Promise.all(promises);

    await UserFiles.deleteMany({
      publicId: { $in: publicIds },
    });
  }
}

const userFilesService = new UserFilesService();

module.exports = userFilesService;
