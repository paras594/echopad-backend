const Users = require("../models/users.model");
const bcrypt = require("bcryptjs");
const CustomError = require("../utils/CustomError");

class AuthService {
  async login({ email, password }) {
    const user = await Users.findOne({ email });

    if (!user) {
      return null;
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return new CustomError({
        message: "Incorrect password",
        errors: {
          password: "Incorrect password",
        },
      });
    }

    return user;
  }
  async register({ name, email, password }) {
    const user = await Users.findOne({ email });

    if (user) {
      throw new Error("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await Users.create({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    return {
      name: newUser.name,
      email: newUser.email,
    };
  }
}

const authService = new AuthService();

module.exports = authService;
