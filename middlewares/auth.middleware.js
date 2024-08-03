const Users = require("../models/users.model");
const jwtService = require("../services/jwt.service");

const authenticateJWT = async (req, res, next) => {
  console.log("authenticating", req.headers["authorization"]);
  const [scheme, token] = req.headers["authorization"].split(" ");
  // check cookie
  if (token) {
    try {
      const verify = jwtService.verify(token);
      console.log({ verify });
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

module.exports = {
  authenticateJWT,
};
