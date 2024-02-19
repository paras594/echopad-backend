class CustomError extends Error {
  errors;
  constructor({ message, errors }) {
    super(message);
    Object.setPrototypeOf(this, CustomError.prototype);
    this.errors = errors;
  }
}

module.exports = CustomError;
