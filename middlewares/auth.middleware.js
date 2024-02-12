const Users = require("../models/users.model");
const jwtService = require("../services/jwt.service");

const authenticateJWT = async (req, res, next) => {
  console.log("authenticating", req.cookies.jwt);
  // check cookie
  if (req.cookies.jwt) {
    const token = req.cookies.jwt;
    const verify = jwtService.verify(token);
    console.log({ verify });
    const user = await Users.findOne({ _id: verify._id });

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    res.user = user;

    next();
  } else {
    // Cookie does not exist
    return res.status(401).json({ message: "Unauthorized" });
  }
};

module.exports = {
  authenticateJWT,
};
