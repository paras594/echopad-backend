function getCloudinaryResourceType(mimetype) {
  if (mimetype.startsWith("image")) {
    return "image";
  }

  if (mimetype.startsWith("video") || mimetype.startsWith("audio")) {
    return "video";
  }

  return "raw";
}

module.exports = { getCloudinaryResourceType };
