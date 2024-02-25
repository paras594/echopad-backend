function bufferToDataUri(file) {
  const base64EncodedImage = Buffer.from(file.buffer).toString("base64");
  const dataUri = `data:${file.mimetype};base64,${base64EncodedImage}`;
  return dataUri;
}

module.exports = { bufferToDataUri };
