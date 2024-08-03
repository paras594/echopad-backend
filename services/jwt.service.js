// generate a jwt service
const jwt = require("jsonwebtoken");

class JwtService {
  sign(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
  }

  verify(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error("Token expired");
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error("Invalid token");
      } else {
        throw error;
      }
    }
  }

  decode(token) {
    return jwt.decode(token);
  }
}

const jwtService = new JwtService();

module.exports = jwtService;
