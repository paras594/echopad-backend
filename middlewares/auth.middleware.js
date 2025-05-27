const admin = require("firebase-admin");
const Users = require("../models/users.model");
const jwtService = require("../services/jwt.service");

const authenticateJWT = async (req, res, next) => {
  const [_, token] = req.headers["authorization"].split(" ");
  // check cookie
  if (token) {
    try {
      const verify = jwtService.verify(token);
      const user = await Users.findOne({ _id: verify._id });
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      req.user = user;

      next();
    } catch (error) {
      return res.status(401).json({ message: "Unauthorized" });
    }
  } else {
    // Cookie does not exist
    return res.status(401).json({ message: "Unauthorized" });
  }
};

// Middleware function to authenticate Firebase ID token
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    console.warn("Attempted access to protected route with no token.");
    return res.sendStatus(401); // Unauthorized
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Attach user info to the request
    req.user = decodedToken; // req.user will contain { uid, email, exp, iat, etc. }

    next();
  } catch (error) {
    console.error("Error verifying Firebase ID token:", error);
    res.sendStatus(403); // Forbidden
  }
};

module.exports = {
  authenticateJWT,
  authenticateToken,
};
