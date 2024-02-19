const authService = require("../services/auth.service");
const jwtService = require("../services/jwt.service");
const CustomError = require("../utils/CustomError");

const register = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const newUser = await authService.register({ name, email, password });

    console.log(newUser);

    res.json({
      success: true,
      message: "User created successfully",
      user: newUser,
    });
  } catch (error) {
    console.log(error);
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await authService.login({ email, password });

    if (!user) {
      return res.status(400).json({
        success: false,
        errors: {
          email: "User not found",
        },
      });
    }

    if (user instanceof CustomError) {
      return res.status(400).json({
        success: false,
        errors: user.errors,
      });
    }

    const jwt = jwtService.sign({ _id: user._id, email });

    res.json({
      success: true,
      message: "User logged in successfully",
      user: {
        name: user.name,
        email: user.email,
        access_token: jwt,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      ...error,
    });
  }
};

module.exports = {
  register,
  login,
};
