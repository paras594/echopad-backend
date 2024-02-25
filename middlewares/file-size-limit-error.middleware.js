const fileSizeLimitErrorMiddleware = (err, req, res, next) => {
  if (err) {
    res.status(400).json({
      success: false,
      errors: {
        error: err.message,
      },
    });
  } else {
    next();
  }
};

module.exports = { fileSizeLimitErrorMiddleware };
