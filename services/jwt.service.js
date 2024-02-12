// generate a jwt service
const jwt = require("jsonwebtoken");

class JwtService {
  sign(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
  }

  verify(token) {
    return jwt.verify(token, process.env.JWT_SECRET);
  }

  decode(token) {
    return jwt.decode(token);
  }
}

const jwtService = new JwtService();

module.exports = jwtService;
